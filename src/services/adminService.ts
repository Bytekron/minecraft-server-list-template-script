/**
 * Admin Service
 * 
 * Service layer for administrative operations including
 * server management, user management, and content moderation.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Server = Database['public']['Tables']['servers']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface AdminServerData extends Server {
  user_profiles: {
    username: string;
    email: string;
  };
}

export interface AdminUserData extends UserProfile {
  server_count: number;
}

export class AdminService {
  /**
   * Get all servers with owner information
   */
  static async getAllServers(): Promise<AdminServerData[]> {
    const { data, error } = await supabase
      .from('servers')
      .select(`
        *,
        user_profiles!servers_user_id_fkey(username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending servers for approval
   */
  static async getPendingServers(): Promise<AdminServerData[]> {
    const { data, error } = await supabase
      .from('servers')
      .select(`
        *,
        user_profiles!servers_user_id_fkey(username, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all users with server counts
   */
  static async getAllUsers(): Promise<AdminUserData[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        servers(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data to include server count
    return (data || []).map(user => ({
      ...user,
      server_count: user.servers?.[0]?.count || 0
    }));
  }

  /**
   * Update server status (approve/reject)
   */
  static async updateServerStatus(serverId: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('servers')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', serverId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete server (admin only)
   */
  static async deleteServer(serverId: string) {
    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', serverId);

    if (error) throw error;
    return true;
  }

  /**
   * Update user admin status
   */
  static async updateUserAdminStatus(userId: string, isAdmin: boolean) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Ban or unban a user
   */
  static async banUser(userId: string, isBanned: boolean, reason?: string, bannedByUserId?: string) {
    const { error } = await supabase.rpc('ban_user', {
      target_user_id: userId,
      ban_status: isBanned,
      ban_reason: reason || null,
      admin_user_id: bannedByUserId || null
    });

    if (error) throw error;
    return true;
  }

  /**
   * Delete all servers from a user
   */
  static async deleteAllUserServers(userId: string) {
    const { data, error } = await supabase.rpc('delete_all_user_servers', {
      target_user_id: userId
    });

    if (error) throw error;
    return data; // Returns count of deleted servers
  }

  /**
   * Update server status with proper error handling
   */
  static async updateServerStatus(serverId: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('servers')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', serverId)
      .select()
      .single();

    if (error) {
      console.error('Error updating server status:', error);
      throw new Error(`Failed to ${status} server: ${error.message}`);
    }
    
    return data;
  }

  /**
   * Delete server with proper error handling
   */
  static async deleteServer(serverId: string) {
    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', serverId);

    if (error) {
      console.error('Error deleting server:', error);
      throw new Error(`Failed to delete server: ${error.message}`);
    }
    
    return true;
  }
  /**
   * Get server statistics for admin dashboard
   */
  static async getServerStatistics() {
    const { data, error } = await supabase
      .from('servers')
      .select('status, platform, gamemode, created_at');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      approved: data?.filter(s => s.status === 'approved').length || 0,
      pending: data?.filter(s => s.status === 'pending').length || 0,
      rejected: data?.filter(s => s.status === 'rejected').length || 0,
      java: data?.filter(s => s.platform === 'java').length || 0,
      bedrock: data?.filter(s => s.platform === 'bedrock').length || 0,
      crossplatform: data?.filter(s => s.platform === 'crossplatform').length || 0,
      thisMonth: data?.filter(s => {
        const created = new Date(s.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0
    };

    return stats;
  }

  /**
   * Get user statistics for admin dashboard
   */
  static async getUserStatistics() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('created_at, is_admin');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      admins: data?.filter(u => u.is_admin).length || 0,
      regular: data?.filter(u => !u.is_admin).length || 0,
      thisMonth: data?.filter(u => {
        const created = new Date(u.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0
    };

    return stats;
  }

  /**
   * Get recent activity for admin dashboard
   */
  static async getRecentActivity() {
    try {
      // Get recent servers
      const { data: recentServers } = await supabase
        .from('servers')
        .select(`
          id, name, status, created_at,
          user_profiles!servers_user_id_fkey(username)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent votes
      const { data: recentVotes } = await supabase
        .from('votes')
        .select(`
          id, created_at, minecraft_username,
          servers!votes_server_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        servers: recentServers || [],
        votes: recentVotes || []
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return { servers: [], votes: [] };
    }
  }

  /**
   * Get duplicate servers grouped by domain
   */
  static async getDuplicateServers() {
    try {
      const { data: servers, error } = await supabase
        .from('servers')
        .select(`
          *,
          user_profiles!servers_user_id_fkey(username, email)
        `)
        .order('ip', { ascending: true });

      if (error) throw error;

      // Group servers by domain/IP
      const groupedByDomain: { [key: string]: any[] } = {};
      
      (servers || []).forEach(server => {
        // Extract domain from IP (remove port if present)
        const domain = server.ip.split(':')[0].toLowerCase();
        
        if (!groupedByDomain[domain]) {
          groupedByDomain[domain] = [];
        }
        groupedByDomain[domain].push(server);
      });

      // Filter to only show domains with multiple servers
      const duplicates = Object.entries(groupedByDomain)
        .filter(([domain, servers]) => servers.length > 1)
        .map(([domain, servers]) => ({
          domain,
          servers: servers.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        }))
        .sort((a, b) => b.servers.length - a.servers.length);
      return duplicates;
    } catch (error) {
      console.error('Error fetching duplicate servers:', error);
      throw error;
    }
  }
}