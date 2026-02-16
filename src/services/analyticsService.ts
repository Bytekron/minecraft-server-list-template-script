/**
 * Analytics Service
 * 
 * Handles server analytics tracking and data retrieval
 * with privacy-focused implementation and performance optimization.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

export interface AnalyticsEvent {
  server_id: string;
  event_type: 'impression' | 'click' | 'ip_copy' | 'vote' | 'review';
  user_ip_hash: string;
  user_agent?: string;
  referrer?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

export interface DailyAnalytics {
  date: string;
  impressions: number;
  clicks: number;
  ip_copies: number;
  votes: number;
  reviews: number;
  unique_visitors: number;
}

export interface AnalyticsSummary {
  total_impressions: number;
  total_clicks: number;
  total_ip_copies: number;
  total_votes: number;
  total_reviews: number;
  avg_ctr: number;
  avg_conversion_rate: number;
  estimated_joins: number;
  daily_data: DailyAnalytics[];
}

// ==================== SERVICE CLASS ====================

export class AnalyticsService {
  /**
   * Generate session ID for tracking unique visitors
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or create session ID from localStorage
   */
  private static getSessionId(): string {
    if (typeof window === 'undefined') return this.generateSessionId();
    
    let sessionId = localStorage.getItem('servercraft_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('servercraft_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Hash IP address for privacy
   */
  private static async hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'servercraft_salt_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  /**
   * Get user's IP address (simplified for demo)
   */
  private static async getUserIP(): Promise<string> {
    try {
      // In production, you'd get this from the server or a service
      // For demo purposes, we'll use a placeholder
      return '127.0.0.1';
    } catch (error) {
      return '127.0.0.1';
    }
  }

  /**
   * Track analytics event
   */
  static async trackEvent(
    serverId: string, 
    eventType: 'impression' | 'click' | 'ip_copy' | 'vote' | 'review',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const userIP = await this.getUserIP();
      const userIPHash = await this.hashIP(userIP);
      const sessionId = this.getSessionId();

      const eventData: AnalyticsEvent = {
        server_id: serverId,
        event_type: eventType,
        user_ip_hash: userIPHash,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        session_id: sessionId,
        metadata: metadata || {}
      };

      const { error } = await supabase
        .from('server_analytics_events')
        .insert(eventData);

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Track server impression (when server appears in list)
   */
  static async trackImpression(serverId: string): Promise<void> {
    await this.trackEvent(serverId, 'impression');
  }

  /**
   * Track server click (when user clicks on server)
   */
  static async trackClick(serverId: string, source?: string): Promise<void> {
    const metadata: Record<string, any> = {};
    
    if (source) {
      metadata.source = source;
    }
    
    // Add additional context for direct visits
    if (source === 'direct_visit') {
      metadata.entry_point = 'direct_url';
      metadata.referrer = document.referrer || 'none';
    } else if (source === 'internal_navigation') {
      metadata.entry_point = 'server_list';
    }
    
    await this.trackEvent(serverId, 'click', metadata);
  }

  /**
   * Track IP copy (when user copies server IP)
   */
  static async trackIPCopy(serverId: string, ipType?: 'java' | 'bedrock'): Promise<void> {
    await this.trackEvent(serverId, 'ip_copy', { ip_type: ipType });
  }

  /**
   * Track vote (when user votes for server)
   */
  static async trackVote(serverId: string): Promise<void> {
    await this.trackEvent(serverId, 'vote');
  }

  /**
   * Track review (when user submits review)
   */
  static async trackReview(serverId: string, rating: number): Promise<void> {
    await this.trackEvent(serverId, 'review', { rating });
  }

  /**
   * Get analytics summary for a server (current month)
   */
  static async getServerAnalytics(serverId: string): Promise<AnalyticsSummary> {
    try {
      // Get current month's daily data - start from beginning of month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Also get data from previous days if current month has limited data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      // Use the earlier of the two dates to ensure we get enough data
      const startDate = startOfMonth < thirtyDaysAgo ? startOfMonth : thirtyDaysAgo;

      const { data: dailyData, error } = await supabase
        .from('server_analytics_daily')
        .select('*')
        .eq('server_id', serverId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Calculate totals
      const totals = (dailyData || []).reduce(
        (acc, day) => ({
          impressions: acc.impressions + (day.impressions || 0),
          clicks: acc.clicks + (day.clicks || 0),
          ip_copies: acc.ip_copies + (day.ip_copies || 0),
          votes: acc.votes + (day.votes || 0),
          reviews: acc.reviews + (day.reviews || 0)
        }),
        { impressions: 0, clicks: 0, ip_copies: 0, votes: 0, reviews: 0 }
      );

      // Calculate metrics
      const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const avgConversionRate = totals.impressions > 0 ? (totals.ip_copies / totals.impressions) * 100 : 0;
      const estimatedJoins = Math.round(totals.ip_copies * 0.5); // 50% of IP copies

      return {
        total_impressions: totals.impressions,
        total_clicks: totals.clicks,
        total_ip_copies: totals.ip_copies,
        total_votes: totals.votes,
        total_reviews: totals.reviews,
        avg_ctr: Math.round(avgCTR * 100) / 100,
        avg_conversion_rate: Math.round(avgConversionRate * 100) / 100,
        estimated_joins: estimatedJoins,
        daily_data: dailyData || []
      };
    } catch (error) {
      console.error('Error fetching server analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for multiple servers (for dashboard)
   */
  static async getUserServersAnalytics(userId: string): Promise<Record<string, AnalyticsSummary>> {
    try {
      // Get user's servers
      const { data: servers, error: serversError } = await supabase
        .from('servers')
        .select('id')
        .eq('user_id', userId);

      if (serversError) throw serversError;

      const analytics: Record<string, AnalyticsSummary> = {};

      // Get analytics for each server
      for (const server of servers || []) {
        analytics[server.id] = await this.getServerAnalytics(server.id);
      }

      return analytics;
    } catch (error) {
      console.error('Error fetching user servers analytics:', error);
      throw error;
    }
  }

  /**
   * Cleanup old analytics data (called by cron job)
   */
  static async cleanupOldData(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_old_analytics');
      if (error) throw error;
      console.log('Analytics cleanup completed');
    } catch (error) {
      console.error('Analytics cleanup failed:', error);
    }
  }

  /**
   * Get real-time analytics for today
   */
  static async getTodayAnalytics(serverId: string): Promise<DailyAnalytics | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('server_analytics_daily')
        .select('*')
        .eq('server_id', serverId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching today analytics:', error);
      return null;
    }
  }
}