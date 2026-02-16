/**
 * Sponsored Servers Component
 * 
 * Displays premium sponsored server listings with the exact same structure
 * as the main server list but with golden styling to indicate premium status.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 5.0.0
 */

import React, { useState, useEffect } from 'react';
import { Star, Copy, Check, Wifi, WifiOff, Users, Monitor, Smartphone, Globe } from 'lucide-react';
import { SponsoredServerService } from '../services/sponsoredServerService';
import { ServerMonitoringService } from '../services/serverMonitoringService';

// ==================== INTERFACES ====================

interface SponsoredServer {
  id: string;
  name: string;
  ip: string;
  java_port: number;
  bedrock_port: number;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  min_version: string;
  max_version: string;
  banner_url: string | null;
  target_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface ServerStatus {
  online: boolean;
  players_online: number;
  players_max: number;
  icon?: string;
}

// ==================== COMPONENT ====================

export const SponsoredServers: React.FC = () => {
  const [sponsoredServers, setSponsoredServers] = useState<SponsoredServer[]>([]);
  const [serverStatuses, setServerStatuses] = useState<Record<string, ServerStatus>>({});
  const [serverIcons, setServerIcons] = useState<Record<string, string>>({});
  const [copiedIP, setCopiedIP] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadSponsoredServers();
  }, []);

  useEffect(() => {
    if (sponsoredServers.length > 0) {
      loadServerStatuses();
      loadServerIcons();
    }
  }, [sponsoredServers]);

  // ==================== HANDLERS ====================

  const loadSponsoredServers = async () => {
    try {
      const servers = await SponsoredServerService.getActiveSponsoredServers();
      setSponsoredServers(servers);
    } catch (error) {
      console.error('Error loading sponsored servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServerStatuses = async () => {
    const statuses: Record<string, ServerStatus> = {};
    
    for (const server of sponsoredServers) {
      try {
        // Check if domain looks fake
        const isFakeDomain = /\.(test|fake|example|localhost|invalid)$/i.test(server.ip) || 
                            server.ip.includes('test') || 
                            server.ip.includes('fake') ||
                            server.ip.includes('example');
        
        if (isFakeDomain) {
          statuses[server.id] = {
            online: false,
            players_online: 0,
            players_max: 100
          };
          continue;
        }

        // Check server status using our monitoring service
        const port = server.platform === 'bedrock' ? server.bedrock_port : server.java_port;
        const result = await ServerMonitoringService.checkServer(server.ip, port, server.platform);
        
        if (result) {
          statuses[server.id] = {
            online: result.online,
            players_online: result.players?.online || 0,
            players_max: result.players?.max || 100
          };
        } else {
          statuses[server.id] = {
            online: false,
            players_online: 0,
            players_max: 100
          };
        }
      } catch (error) {
        console.error(`Error checking sponsored server ${server.ip}:`, error);
        statuses[server.id] = {
          online: false,
          players_online: 0,
          players_max: 100
        };
      }
    }
    
    setServerStatuses(statuses);
  };

  const loadServerIcons = async () => {
    const icons: Record<string, string> = {};
    
    for (const server of sponsoredServers) {
      try {
        // First try to get from database
        let iconData = await ServerMonitoringService.getServerIcon(server.id);
        
        if (!iconData) {
          // If no icon in database, try to fetch from API
          console.log(`No cached icon for sponsored server ${server.name}, fetching from API...`);
          // Icon will be fetched and cached by the server-monitor edge function
          console.log(`Icon will be cached on next server check for ${server.name}`);
        }
        
        if (!iconData) {
          // If no icon in database, try to fetch from API directly
          console.log(`No cached icon for sponsored server ${server.name}, fetching from API...`);
          
          const port = server.platform === 'bedrock' ? server.bedrock_port : server.java_port;
          const result = await ServerMonitoringService.checkServer(server.ip, port, server.platform, false);
          
          if (result?.icon) {
            // Clean the icon data
            const cleanIconData = result.icon.startsWith('data:image/') 
              ? result.icon.substring(result.icon.indexOf('base64,') + 7)
              : result.icon;
            
            // Validate the icon data
            if (ServerMonitoringService.isValidBase64(cleanIconData)) {
              iconData = cleanIconData;
              console.log(`✅ Fetched icon for ${server.name} from API`);
              
              // Note: Icon will be cached by the server-monitor edge function on next scheduled run
              // We don't cache it here to avoid RLS issues
            }
          }
        }
        
        if (iconData) {
          icons[server.id] = iconData;
        }
      } catch (error) {
        console.error(`Error loading icon for sponsored server ${server.id}:`, error);
      }
    }
    
    setServerIcons(icons);
  };

  const copyIP = async (server: SponsoredServer) => {
    try {
      const ip = server.platform === 'java' 
        ? (server.java_port === 25565 ? server.ip : `${server.ip}:${server.java_port}`)
        : server.ip;
      
      await navigator.clipboard.writeText(ip);
      setCopiedIP(server.id);
      setTimeout(() => setCopiedIP(null), 2000);
    } catch (err) {
      console.error('Failed to copy IP:', err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'java':
        return <Monitor className="w-4 h-4" />;
      case 'bedrock':
        return <Smartphone className="w-4 h-4" />;
      case 'crossplatform':
        return <Globe className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'java':
        return 'Java';
      case 'bedrock':
        return 'Bedrock';
      case 'crossplatform':
        return 'Cross Platform';
      default:
        return 'Java';
    }
  };

  const generateDefaultBanner = (serverName: string, gamemode: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#D97706');
    gradient.addColorStop(0.5, '#F59E0B');
    gradient.addColorStop(1, '#D97706');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add server name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(serverName, canvas.width / 2, 45);
    
    // Add gamemode
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#D0D0D0';
    ctx.fillText(gamemode.toUpperCase(), canvas.width / 2, 70);
    
    return canvas.toDataURL('image/png');
  };

  const handleServerClick = (server: SponsoredServer, e: React.MouseEvent) => {
    // Don't navigate if clicking on copy button
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.copy-ip-container')) {
      return;
    }
    
    if (server.target_url) {
      // Format URL if needed
      let url = server.target_url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.log('No target URL defined for sponsored server:', server.name);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Sponsored Servers</h2>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-white/10 rounded-xl border-2 border-yellow-500/30"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sponsoredServers.length === 0) {
    return null; // Don't show section if no sponsored servers
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400 fill-current" />
        <h2 className="text-xl font-bold text-white">Sponsored Servers</h2>
      </div>
      
      <div className="space-y-4">
        {sponsoredServers.map((server) => {
          const status = serverStatuses[server.id] || { online: false, players_online: 0, players_max: 100 };
          const icon = serverIcons[server.id];
          const bannerUrl = server.banner_url || generateDefaultBanner(server.name, server.gamemode);
          
          return (
            <div
              key={server.id}
              onClick={(e) => handleServerClick(server, e)}
              className="cursor-pointer"
            >
              <div className="glass rounded-xl p-6 border-2 border-yellow-500/50 hover:border-yellow-400/70 transition-all duration-300 group hover:scale-[1.01] bg-gradient-to-r from-yellow-600/5 to-yellow-500/5 relative">
                <div className="flex items-start gap-4">
                  
                  {/* Left Section: Position Indicator (Golden Star) */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg border border-yellow-300/50 mb-3">
                      <Star className="w-7 h-7 text-white fill-current" />
                    </div>
                  </div>
                  
                  {/* Server Icon */}
                  <div className="flex-shrink-0">
                    {icon ? (
                      <img
                        src={`data:image/png;base64,${icon}`}
                        alt={`${server.name} icon`}
                        className="w-17 h-17 object-cover rounded-xl mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-discord-blue to-blue-600 flex items-center justify-center rounded-xl mb-3">
                        <span className="text-white text-2xl font-bold">🎮</span>
                      </div>
                    )}
                  </div>

                  {/* Server Banner - Exact same size as regular entries */}
                  <div className="flex-shrink-0 hidden lg:flex lg:flex-col">
                    <div 
                      className="w-[468px] h-[60px] rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={(e) => handleServerClick(server, e)}
                    >
                      <img
                        src={bannerUrl || ''}
                        alt={`${server.name} banner`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generateDefaultBanner(server.name, server.gamemode) || '';
                        }}
                      />
                    </div>
                    
                    {/* Server IP Container Below Banner - Exact match */}
                    <div className="bg-secondary-dark/60 rounded-lg p-2 border border-white/10 mt-2 w-[468px] copy-ip-container">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-light-gray text-xs">Server IP:</span>
                          <code className="text-white font-mono text-sm">{server.ip}</code>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyIP(server);
                          }}
                          className={`btn text-xs px-3 py-1 flex items-center space-x-1 transition-all ${
                            copiedIP === server.id
                              ? 'bg-green-600 text-white'
                              : 'bg-discord-blue hover:bg-blue-600 text-white'
                          }`}
                        >
                          {copiedIP === server.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>COPY IP</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY IP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Server Details - Center (matches ServerList exactly) */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-2xl font-bold text-white mb-2 cursor-pointer hover:text-yellow-400 transition-colors"
                      onClick={(e) => handleServerClick(server, e)}
                    >
                      {server.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <div className="flex items-center gap-1 text-white">
                        {getPlatformIcon(server.platform)}
                        <span>{getPlatformLabel(server.platform)}</span>
                      </div>
                      <span className="text-light-gray">Version {server.min_version} - {server.max_version}</span>
                      <span className="px-2 py-1 bg-discord-blue/20 text-discord-blue rounded font-bold uppercase text-xs">
                        {server.gamemode}
                      </span>
                    </div>
                  </div>

                  {/* Right Section: Online Status and Stats */}
                  <div className="flex-shrink-0 text-right">
                    {/* Online Status */}
                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-semibold mb-2 ${
                      status.online 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {status.online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                      <span>{status.online ? 'Online' : 'Offline'}</span>
                    </div>
                    
                    {/* Player Count */}
                    <div className="flex items-center justify-end gap-1 text-white mb-1">
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span className="font-bold">
                        {status.players_online.toLocaleString()}/{status.players_max.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Mobile IP Copy - Only show on mobile when banner is hidden */}
                  <div className="lg:hidden flex-shrink-0">
                    <div className="bg-secondary-dark/60 rounded-lg p-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-light-gray text-xs">Server IP:</span>
                        <code className="text-yellow-400 font-mono text-sm">{server.ip}</code>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copyIP(server);
                          }}
                          className={`btn text-xs px-2 py-1 flex items-center space-x-1 transition-all ${
                            copiedIP === server.id
                              ? 'bg-green-600 text-white'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          }`}
                        >
                          {copiedIP === server.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>COPY IP</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY IP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};