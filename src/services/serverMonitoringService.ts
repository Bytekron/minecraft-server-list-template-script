/**
 * Server Monitoring Service
 * 
 * Handles checking Minecraft servers, storing statistics,
 * and managing server icons with caching.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

interface ServerCheckResult {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  version?: string;
  icon?: string;
  motd?: {
    clean: string[];
  };
  players?: {
    online: number;
    max: number;
  };
  debug?: {
    ping: boolean;
    query: boolean;
    cachehit: boolean;
  };
}

interface ServerStats {
  server_id: string;
  online: boolean;
  players_online: number;
  players_max: number;
  version?: string;
  motd_clean?: string;
  response_time_ms?: number;
}

interface ServerIcon {
  server_id: string;
  icon_data?: string;
  icon_hash?: string;
}

// ==================== CONSTANTS ====================

const MCSRVSTAT_API = 'https://api.mcsrvstat.us/3/';
const MCSRVSTAT_BEDROCK_API = 'https://api.mcsrvstat.us/bedrock/3/';
const MCSTATUS_FALLBACK_API = 'https://api.mcstatus.io/v2/status/';

// Cache for recent checks (in-memory cache to reduce API calls)
const checkCache = new Map<string, { data: ServerCheckResult; timestamp: number }>();
const CACHE_DURATION = 45 * 60 * 1000; // 45 minutes as requested

// ==================== SERVICE CLASS ====================

export class ServerMonitoringService {
  /**
   * Check a single server's status
   */
  static async checkServer(ip: string, port: number = 25565, platform: 'java' | 'bedrock' | 'crossplatform' = 'java', useCache: boolean = true): Promise<ServerCheckResult | null> {
    const cacheKey = `${ip}:${port}:${platform}`;
    
    // Check cache first
    if (useCache) {
      const cached = checkCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${ip}:${port}`);
        return cached.data;
      }
    }

    try {
      console.log(`Checking server ${ip}:${port} (${platform})`);
      
      let result: ServerCheckResult | null = null;

      // Try primary API first
      if (platform === 'bedrock') {
        result = await this.checkWithMCSrvStat(ip, port, true);
      } else {
        result = await this.checkWithMCSrvStat(ip, port, false);
      }

      // Fallback to secondary API if primary fails
      if (!result && platform !== 'bedrock') {
        result = await this.checkWithMCStatus(ip, port);
      }

      // Cache the result if successful
      if (result && useCache) {
        checkCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      console.error(`Error checking server ${ip}:${port}:`, error);
      return null;
    }
  }

  /**
   * Check server using MCSrvStat API
   */
  private static async checkWithMCSrvStat(ip: string, port: number, isBedrock: boolean = false): Promise<ServerCheckResult | null> {
    try {
      const apiUrl = isBedrock ? MCSRVSTAT_BEDROCK_API : MCSRVSTAT_API;
      const address = port === (isBedrock ? 19132 : 25565) ? ip : `${ip}:${port}`;
      
      const response = await fetch(`${apiUrl}${encodeURIComponent(address)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ServerCraft-Monitor/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        return null;
      }

      return {
        online: data.online || false,
        ip: data.ip || ip,
        port: data.port || port,
        hostname: data.hostname,
        version: data.version,
        icon: data.icon,
        motd: data.motd ? { clean: data.motd.clean || [] } : undefined,
        players: data.players ? {
          online: data.players.online || 0,
          max: data.players.max || 0
        } : undefined,
        debug: data.debug
      };
    } catch (error) {
      console.error(`MCSrvStat API error for ${ip}:${port}:`, error);
      return null;
    }
  }

  /**
   * Check server using MCStatus fallback API
   */
  private static async checkWithMCStatus(ip: string, port: number): Promise<ServerCheckResult | null> {
    try {
      const address = port === 25565 ? ip : `${ip}:${port}`;
      
      const response = await fetch(`${MCSTATUS_FALLBACK_API}java/${encodeURIComponent(address)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ServerCraft-Monitor/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        return null;
      }

      return {
        online: data.online || false,
        ip: data.host || ip,
        port: data.port || port,
        version: data.version?.name,
        motd: data.motd ? { clean: [data.motd.clean] } : undefined,
        players: data.players ? {
          online: data.players.online || 0,
          max: data.players.max || 0
        } : undefined
      };
    } catch (error) {
      console.error(`MCStatus API error for ${ip}:${port}:`, error);
      return null;
    }
  }

  /**
   * Check all approved servers (called by cron job)
   */
  static async checkAllServers(): Promise<void> {
    try {
      console.log('Starting server monitoring check...');
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase not configured - cannot perform server monitoring');
        return;
      }
      
      // Check for placeholder URLs
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase URL is placeholder - cannot perform server monitoring');
        return;
      }
      
      const { data: servers, error } = await supabase
        .from('servers')
        .select('id, ip, java_port, platform')
        .eq('status', 'approved')
        .limit(50); // Increased limit for better monitoring coverage

      if (error) {
        console.error('Error fetching servers for monitoring:', error);
        return;
      }

      if (!servers || servers.length === 0) {
        console.log('No servers to monitor');
        return;
      }

      console.log(`Monitoring ${servers.length} servers...`);
      
      for (const server of servers) {
        try {
          const startTime = Date.now();
          const result = await this.checkServer(
            server.ip, 
            server.java_port, 
            server.platform as 'java' | 'bedrock' | 'crossplatform'
          );
          const responseTime = Date.now() - startTime;

          if (result) {
            // Store statistics
            await supabase
              .from('server_stats')
              .insert({
                server_id: server.id,
                online: result.online,
                players_online: result.players?.online || 0,
                players_max: result.players?.max || 0,
                version: result.version,
                motd_clean: result.motd?.clean?.join(' ') || null,
                response_time_ms: responseTime
              });
            
            // Update icon if present
            if (result.icon) {
              // Only update icon if it's different from cached version
              const currentIcon = await this.getServerIcon(server.id);
              const newIconData = result.icon.startsWith('data:image/') 
                ? result.icon.substring(result.icon.indexOf('base64,') + 7)
                : result.icon;
              
              // Only update if icon is different or doesn't exist
              if (!currentIcon || currentIcon !== newIconData) {
                await this.updateServerIcon(server.id, result.icon);
              }
            }

            // Update server's current stats based on online status
            if (result.online) {
              // Server is online - update with real data
              await supabase
                .from('servers')
                .update({
                  players_online: result.players?.online || 0,
                  players_max: result.players?.max || 100,
                  last_ping: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', server.id);
            } else {
              // Server is offline - clear the data
              await supabase
                .from('servers')
                .update({
                  players_online: 0,
                  players_max: 0,
                  last_ping: null,
                  updated_at: new Date().toISOString()
                })
                .eq('id', server.id);
            }

            console.log(`✅ ${server.ip}: ${result.online ? 'Online' : 'Offline'} (${result.players?.online || 0}/${result.players?.max || 0})`);
          } else {
            // Server check completely failed - record as offline
            await supabase
              .from('server_stats')
              .insert({
                server_id: server.id,
                online: false,
                players_online: 0,
                players_max: 0,
                version: null,
                motd_clean: null,
                response_time_ms: null
              });
              
            await supabase
              .from('servers')
              .update({
                players_online: 0,
                players_max: 0,
                last_ping: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', server.id);
              
            console.log(`❌ ${server.ip}: Failed to check`);
          }

          // Add delay between checks to be respectful to APIs
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          console.error(`Error checking server ${server.ip}:`, error);
          
          // Even on error, mark server as offline to prevent stale data
          try {
            await supabase
              .from('servers')
              .update({
                players_online: 0,
                players_max: 0,
                last_ping: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', server.id);
          } catch (updateError) {
            console.error(`Failed to update server ${server.ip} as offline:`, updateError);
          }
        }
      }
      
      console.log('Server monitoring check completed');
    } catch (error) {
      console.error('Error in checkAllServers:', error);
    }
  }


  /**
   * Update server icon in database
   */
  private static async updateServerIcon(serverId: string, iconData: string): Promise<void> {
    try {
      // Skip if no icon data
      if (!iconData || iconData.trim() === '') {
        return;
      }
      
      // Clean icon data
      const cleanIconData = iconData.startsWith('data:image/') 
        ? iconData.substring(iconData.indexOf('base64,') + 7)
        : iconData;

      // Validate icon data more thoroughly
      if (this.isValidBase64(cleanIconData) && cleanIconData.length >= 100) {
        const iconHash = await this.generateIconHash(cleanIconData);
        
        const { error } = await supabase
          .from('server_icons')
          .upsert({
            server_id: serverId,
            icon_data: cleanIconData,
            icon_hash: iconHash,
            last_updated: new Date().toISOString()
          }, { onConflict: 'server_id' });
        
        if (error) {
          console.error(`Error upserting icon for server ${serverId}:`, error);
        } else {
          console.log(`✅ Updated icon for server ${serverId} (${cleanIconData.length} chars)`);
        }
      } else {
        console.warn(`Invalid icon data for server ${serverId} - skipping`);
      }
    } catch (error) {
      console.error(`Error updating icon for server ${serverId}:`, error);
    }
  }

  /**
   * Validate base64 image data
   */
  static isValidBase64(str: string): boolean {
    if (!str || typeof str !== 'string') {
      return false;
    }
    
    try {
      // Check basic format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
        return false;
      }
      
      // Check reasonable length bounds
      if (str.length < 100 || str.length > 100000) {
        return false;
      }
      
      const decoded = atob(str);
      const reencoded = btoa(decoded);
      
      if (reencoded !== str) {
        return false;
      }

      const imageSignatures = [
        '/9j/', // JPEG
        'iVBORw0KGgo', // PNG
        'R0lGOD', // GIF
        'UklGR', // WebP
        'Qk0' // BMP
      ];

      return imageSignatures.some(sig => str.startsWith(sig));
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate hash for icon data
   */
  static async generateIconHash(iconData: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(iconData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get server icon by server ID
   */
  static async getServerIcon(serverId: string): Promise<string | null> {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return null;
      }
      
      // Check for placeholder URLs
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('server_icons')
        .select('icon_data, last_updated')
        .eq('server_id', serverId)
        .not('icon_data', 'is', null)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      // Validate the icon data before returning
      if (!this.isValidBase64(data.icon_data)) {
        console.warn(`Invalid icon data for server ${serverId} - cleaning up`);
        
        // Clean up invalid icon
        await supabase
          .from('server_icons')
          .delete()
          .eq('server_id', serverId);
        
        return null;
      }

      return data.icon_data;
    } catch (error) {
      console.error(`Error fetching server icon for ${serverId}:`, error);
      return null;
    }
  }

  /**
   * Get latest server statistics
   */
  static async getLatestServerStats(serverId: string) {
    try {
      const { data, error } = await supabase
        .from('server_stats')
        .select('*')
        .eq('server_id', serverId)
        .order('checked_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching server stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestServerStats:', error);
      return null;
    }
  }

  /**
   * Get server statistics for a time period
   */
  static async getServerStatsHistory(serverId: string, hours: number = 24) {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase not configured - cannot fetch server stats history');
        return [];
      }
      
      // Check for placeholder URLs
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase URL is placeholder - cannot fetch server stats history');
        return [];
      }
      
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - hours);
      
      const { data, error } = await supabase
        .from('server_stats')
        .select('*')
        .eq('server_id', serverId)
        .gte('checked_at', hoursAgo.toISOString())
        .order('checked_at', { ascending: false });

      if (error) {
        console.warn(`Could not fetch server stats history for ${serverId}:`, error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Could not fetch server stats history - Supabase connection failed:', error);
      return [];
    }
  }
}