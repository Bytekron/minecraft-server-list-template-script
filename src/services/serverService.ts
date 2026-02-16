/**
 * Server Service
 * 
 * Service layer for server-related database operations
 * with proper error handling and type safety.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';
import { AnalyticsService } from './analyticsService';
import type { Database } from '../types/database';

type Server = Database['public']['Tables']['servers']['Row'];
type ServerInsert = Database['public']['Tables']['servers']['Insert'];
type ServerUpdate = Database['public']['Tables']['servers']['Update'];

export interface ServerFilters {
  gamemode?: string;
  platform?: string;
  version?: string;
  search?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export class ServerService {
  /**
   * Get servers with optional filtering
   */
  static async getServers(filters: ServerFilters = {}, page = 1, limit = 10000000) {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('servers')
      .select(`
        *,
        user_profiles!servers_user_id_fkey(username)
      `, { count: 'exact' })
      .eq('status', filters.status || 'approved')
      .order('votes', { ascending: false });

    // Apply filters
    if (filters.gamemode && filters.gamemode !== 'all') {
      query = query.eq('gamemode', filters.gamemode);
    }

    if (filters.platform && filters.platform !== 'all') {
      query = query.eq('platform', filters.platform);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ip.ilike.%${filters.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    // Debug logging to check what Supabase is returning
    console.log('ServerService.getServers debug:', {
      totalServersFound: count,
      serversOnThisPage: data?.length || 0,
      requestedPage: page,
      requestedLimit: limit,
      filters: filters
    });
    
    // Debug logging to see what we're getting from database
    if (data && data.length > 0) {
      console.log('Sample server data from database:', {
        name: data[0].name,
        last_ping: data[0].last_ping,
        players_online: data[0].players_online,
        players_max: data[0].players_max,
        uptime: data[0].uptime
      });
    }

    if (error) throw error;

    return {
      servers: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get server by ID
   */
  static async getServerById(id: string) {
    const { data, error } = await supabase
      .from('servers')
      .select(`
        *,
        user_profiles!servers_user_id_fkey(username, email),
        reviews(id, rating)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Calculate review statistics
    if (data) {
      if (data.reviews) {
        const reviews = data.reviews;
        data.review_count = reviews.length;
        data.average_rating = reviews.length > 0 
          ? Math.round((reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length) * 10) / 10
          : 0;
      } else {
        data.review_count = 0;
        data.average_rating = 0;
      }
    }
    
    return data;
  }

  /**
   * Get server by slug
   */
  static async getServerBySlug(slug: string) {
    // Validate that slug is not a placeholder or invalid
    if (!slug || slug === '[slug]' || slug.includes('[') || slug.includes(']') || slug.trim() === '') {
      console.log('Invalid slug provided:', slug);
      return null;
    }

    console.log('Looking for server with slug:', slug);

    // Try to find by slug column first
    let { data, error } = await supabase
      .from('servers')
      .select(`
        *,
        user_profiles!servers_user_id_fkey(username, email),
        reviews(id, rating)
      `)
      .eq('slug', slug)
      .eq('status', 'approved')
      .maybeSingle();

    if (error) {
      console.error('Error querying by slug:', error);
      throw error;
    }

    console.log('Query by slug result:', data ? 'Found' : 'Not found');
    
    // If no server found by slug, try alternative slug formats
    if (!data) {
      console.log('Trying alternative slug formats...');
      
      // Try with underscores instead of hyphens
      const slugWithUnderscores = slug.replace(/-/g, '_');
      if (slugWithUnderscores !== slug) {
        const { data: dataWithUnderscores, error: errorWithUnderscores } = await supabase
          .from('servers')
          .select(`
            *,
            user_profiles!servers_user_id_fkey(username, email),
            reviews(id, rating)
          `)
          .eq('slug', slugWithUnderscores)
          .eq('status', 'approved')
          .maybeSingle();
        
        if (!errorWithUnderscores && dataWithUnderscores) {
          console.log('Found server with underscores format');
          data = dataWithUnderscores;
        }
      }
      
      // Try with hyphens instead of underscores
      if (!data) {
        const slugWithHyphens = slug.replace(/_/g, '-');
        if (slugWithHyphens !== slug) {
          const { data: dataWithHyphens, error: errorWithHyphens } = await supabase
            .from('servers')
            .select(`
              *,
              user_profiles!servers_user_id_fkey(username, email),
              reviews(id, rating)
            `)
            .eq('slug', slugWithHyphens)
            .eq('status', 'approved')
            .maybeSingle();
          
          if (!errorWithHyphens && dataWithHyphens) {
            console.log('Found server with hyphens format');
            data = dataWithHyphens;
          }
        }
      }
      
      // Try partial name matching as last resort
      if (!data) {
        console.log('Trying partial name matching...');
        const searchTerm = slug.replace(/[-_.]/g, ' ').toLowerCase();
        
        const { data: nameMatchData, error: nameMatchError } = await supabase
          .from('servers')
          .select(`
            *,
            user_profiles!servers_user_id_fkey(username, email),
            reviews(id, rating)
          `)
          .ilike('name', `%${searchTerm}%`)
          .eq('status', 'approved')
          .limit(1)
          .maybeSingle();
        
        if (!nameMatchError && nameMatchData) {
          console.log('Found server by partial name match');
          data = nameMatchData;
        }
      }
    }
    
    // Helper function to check if string is a valid UUID format
    const isValidUUID = (str: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };
    
    // If still no server found and the slug looks like a UUID, try to find by ID
    if (!data && isValidUUID(slug)) {
      console.log('Trying to find by ID since slug looks like UUID');
      const { data: dataById, error: errorById } = await supabase
        .from('servers')
        .select(`
          *,
          user_profiles!servers_user_id_fkey(username, email),
          reviews(id, rating)
        `)
        .eq('id', slug)
        .eq('status', 'approved')
        .maybeSingle();
      
      if (errorById) {
        console.error('Error querying by ID:', errorById);
        throw errorById;
      }
      
      console.log('Query by ID result:', dataById ? 'Found' : 'Not found');
      data = dataById;
    }

    // If still no data found, let's check if there are any servers at all
    if (!data) {
      console.log('No server found, checking if any servers exist...');
      const { data: allServers, error: allError } = await supabase
        .from('servers')
        .select('id, name, slug')
        .eq('status', 'approved')
        .limit(5);
      
      if (!allError && allServers) {
        console.log('Available servers:', allServers);
        console.log('Searched slug:', slug);
        console.log('Available slugs:', allServers.map(s => s.slug));
      }
    }
    
    // Calculate review statistics
    if (data) {
      if (data.reviews) {
        const reviews = data.reviews;
        data.review_count = reviews.length;
        data.average_rating = reviews.length > 0 
          ? Math.round((reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length) * 10) / 10
          : 0;
      } else {
        data.review_count = 0;
        data.average_rating = 0;
      }
    }
    
    return data;
  }

  /**
   * Create new server
   */
  static async createServer(serverData: ServerInsert) {
    const { data, error } = await supabase
      .from('servers')
      .insert(serverData)
      .select()
      .single();

    if (error) throw error;
    
    // Trigger sitemap update for new server
    if (data?.id && data?.status === 'approved') {
      const { SitemapService } = await import('./sitemapService');
      SitemapService.updateSitemapForNewServer(data.id);
    }
    
    return data;
  }

  /**
   * Update server
   */
  static async updateServer(id: string, updates: ServerUpdate) {
    // If IP is being changed, clear the server status data
    if (updates.ip) {
      updates.players_online = null;
      updates.players_max = null;
      updates.last_ping = null;
    }
    
    const { data, error } = await supabase
      .from('servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Trigger sitemap update if server becomes approved
    if (data?.status === 'approved') {
      const { SitemapService } = await import('./sitemapService');
      SitemapService.updateSitemapForNewServer(data.id);
    }
    
    return data;
  }

  /**
   * Delete server
   */
  static async deleteServer(id: string) {
    // Delete the server (RLS will ensure user can only delete their own servers)
    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(error.message || 'Failed to delete server');
    }

    // Trigger sitemap update for deleted server
    try {
      const { SitemapService } = await import('./sitemapService');
      SitemapService.updateSitemapForDeletedServer(id);
    } catch (sitemapError) {
      console.warn('Failed to update sitemap after server deletion:', sitemapError);
    }

    return true;
  }

  /**
   * Get user's servers
   */
  static async getUserServers(userId: string) {
    const { data, error } = await supabase
      .from('servers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Vote for server
   */
  static async voteForServer(serverId: string, ipAddress: string, minecraftUsername: string, userId?: string) {
    // Check if user/IP already voted within the last 8 hours
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();

    // Check by IP address for all votes (simplified approach)
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('server_id', serverId)
      .eq('ip_address', ipAddress)
      .gte('created_at', eightHoursAgo)
      .maybeSingle();

    if (existingVote) {
      throw new Error('You have already voted for this server from this IP address within the last 8 hours.');
    }

    // Create vote with minecraft username if provided
    const voteData = {
      server_id: serverId,
      ip_address: ipAddress,
      user_id: userId || null,
      minecraft_username: minecraftUsername
    };

    const { data, error } = await supabase
      .from('votes')
      .insert(voteData)
      .select()
      .single();

    if (error) throw error;
    
    // Track vote analytics
    await AnalyticsService.trackVote(serverId);
    
    // If votifier is enabled for this server, send vote notification
    // This would integrate with the server's votifier system
    try {
      await this.sendVotifierNotification(serverId, minecraftUsername);
    } catch (votifierError) {
      console.warn('Votifier notification failed:', votifierError);
      // Don't fail the vote if votifier fails
    }
    
    return data;
  }

  /**
   * Submit review for server
   */
  static async submitReview(reviewData: {
    server_id: string;
    minecraft_username: string;
    review_text: string;
    rating: number;
    ip_address: string;
  }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    
    // Track review analytics
    await AnalyticsService.trackReview(reviewData.server_id, reviewData.rating);
    
    return data;
  }

  /**
   * Get reviews for server
   */
  static async getServerReviews(serverId: string, limit = 10) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('server_id', serverId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
  
  /**
   * Send votifier notification (placeholder for actual implementation)
   */
  private static async sendVotifierNotification(serverId: string, minecraftUsername: string) {
    // Get server votifier settings
    const { data: server } = await supabase
      .from('servers')
      .select('votifier_enabled, votifier_ip, votifier_port, votifier_public_key')
      .eq('id', serverId)
      .single();
    
    if (!server?.votifier_enabled || !server.votifier_ip || !server.votifier_port) {
      return; // Votifier not configured
    }
    
    // In a real implementation, this would:
    // 1. Create a votifier packet with the username and server info
    // 2. Encrypt it with the server's public key
    // 3. Send it to the server's votifier port
    // For now, we'll just log it
    console.log(`Votifier notification would be sent to ${server.votifier_ip}:${server.votifier_port} for user ${minecraftUsername}`);
  };

  /**
   * Get server statistics
   */
  static async getServerStats() {
    const { data, error } = await supabase
      .from('servers')
      .select('platform, status')
      .eq('status', 'approved');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      java: data?.filter(s => s.platform === 'java').length || 0,
      bedrock: data?.filter(s => s.platform === 'bedrock').length || 0,
      crossplatform: data?.filter(s => s.platform === 'crossplatform').length || 0
    };

    return stats;
  }
}