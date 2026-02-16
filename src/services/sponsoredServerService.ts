/**
 * Sponsored Server Service
 * 
 * Service layer for sponsored server operations including
 * CRUD operations and admin management.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type SponsoredServer = Database['public']['Tables']['sponsored_servers']['Row'];
type SponsoredServerInsert = Database['public']['Tables']['sponsored_servers']['Insert'];
type SponsoredServerUpdate = Database['public']['Tables']['sponsored_servers']['Update'];

export class SponsoredServerService {
  /**
   * Get all active sponsored servers ordered by display_order
   */
  static async getActiveSponsoredServers(): Promise<SponsoredServer[]> {
    const { data, error } = await supabase
      .from('sponsored_servers')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all sponsored servers (admin only)
   */
  static async getAllSponsoredServers(): Promise<SponsoredServer[]> {
    const { data, error } = await supabase
      .from('sponsored_servers')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create new sponsored server (admin only)
   */
  static async createSponsoredServer(serverData: SponsoredServerInsert): Promise<SponsoredServer> {
    const { data, error } = await supabase
      .from('sponsored_servers')
      .insert(serverData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update sponsored server (admin only)
   */
  static async updateSponsoredServer(id: string, updates: SponsoredServerUpdate): Promise<SponsoredServer> {
    const { data, error } = await supabase
      .from('sponsored_servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete sponsored server (admin only)
   */
  static async deleteSponsoredServer(id: string): Promise<void> {
    const { error } = await supabase
      .from('sponsored_servers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Toggle sponsored server active status (admin only)
   */
  static async toggleSponsoredServerStatus(id: string, isActive: boolean): Promise<SponsoredServer> {
    const { data, error } = await supabase
      .from('sponsored_servers')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update display order for sponsored servers (admin only)
   */
  static async updateDisplayOrder(serverOrders: { id: string; display_order: number }[]): Promise<void> {
    const updates = serverOrders.map(({ id, display_order }) => 
      supabase
        .from('sponsored_servers')
        .update({ display_order })
        .eq('id', id)
    );

    await Promise.all(updates);
  }
}