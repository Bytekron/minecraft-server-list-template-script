/**
 * Database Type Definitions
 * 
 * TypeScript definitions for Supabase database schema
 * Auto-generated types for type-safe database operations.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

export interface Database {
  public: {
    Tables: {
      servers: {
        Row: {
          id: string;
          name: string;
          ip: string;
          java_port: number;
          query_port: number;
          platform: 'java' | 'bedrock' | 'crossplatform';
          gamemode: string;
          additional_gamemodes: string | null;
          min_version: string;
          max_version: string;
          country: string;
          website: string | null;
          discord: string | null;
          youtube: string | null;
          description: string;
          banner_url: string | null;
          has_whitelist: boolean;
          votifier_enabled: boolean;
          votifier_public_key: string | null;
          votifier_ip: string | null;
          votifier_port: number | null;
          status: 'pending' | 'approved' | 'rejected';
          featured: boolean;
          votes: number;
          players_online: number;
          players_max: number;
          uptime: number;
          last_ping: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          ip: string;
          java_port?: number;
          query_port?: number;
          platform: 'java' | 'bedrock' | 'crossplatform';
          gamemode: string;
          additional_gamemodes?: string | null;
          min_version?: string;
          max_version?: string;
          country?: string;
          website?: string | null;
          discord?: string | null;
          youtube?: string | null;
          description: string;
          banner_url?: string | null;
          has_whitelist?: boolean;
          votifier_enabled?: boolean;
          votifier_public_key?: string | null;
          votifier_ip?: string | null;
          votifier_port?: number | null;
          status?: 'pending' | 'approved' | 'rejected';
          featured?: boolean;
          votes?: number;
          players_online?: number;
          players_max?: number;
          uptime?: number;
          last_ping?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          slug?: string;
        };
        Update: {
          id?: string;
          name?: string;
          ip?: string;
          java_port?: number;
          bedrock_port?: number | null;
          query_port?: number;
          platform?: 'java' | 'bedrock' | 'crossplatform';
          gamemode?: string;
          additional_gamemodes?: string | null;
          min_version?: string;
          max_version?: string;
          country?: string;
          website?: string | null;
          discord?: string | null;
          youtube?: string | null;
          description?: string;
          banner_url?: string | null;
          has_whitelist?: boolean;
          votifier_enabled?: boolean;
          votifier_public_key?: string | null;
          votifier_ip?: string | null;
          votifier_port?: number | null;
          status?: 'pending' | 'approved' | 'rejected';
          featured?: boolean;
          votes?: number;
          players_online?: number;
          players_max?: number;
          uptime?: number;
          last_ping?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          slug?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          server_id: string;
          user_id: string | null;
          ip_address: string;
          minecraft_username: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          server_id: string;
          user_id?: string | null;
          ip_address: string;
          minecraft_username?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          server_id?: string;
          user_id?: string | null;
          ip_address?: string;
          minecraft_username?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    server_stats: {
      Row: {
        id: string;
        server_id: string;
        online: boolean;
        players_online: number;
        players_max: number;
        version: string | null;
        motd_clean: string | null;
        response_time_ms: number | null;
        checked_at: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        server_id: string;
        online: boolean;
        players_online?: number;
        players_max?: number;
        version?: string | null;
        motd_clean?: string | null;
        response_time_ms?: number | null;
        checked_at?: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        server_id?: string;
        online?: boolean;
        players_online?: number;
        players_max?: number;
        version?: string | null;
        motd_clean?: string | null;
        response_time_ms?: number | null;
        checked_at?: string;
        created_at?: string;
      };
    };
    server_icons: {
      Row: {
        id: string;
        server_id: string;
        icon_data: string | null;
        icon_hash: string | null;
        last_updated: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        server_id: string;
        icon_data?: string | null;
        icon_hash?: string | null;
        last_updated?: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        server_id?: string;
        icon_data?: string | null;
        icon_hash?: string | null;
        last_updated?: string;
        created_at?: string;
      };
    };
    server_analytics_events: {
      Row: {
        id: string;
        server_id: string;
        event_type: 'impression' | 'click' | 'ip_copy' | 'vote' | 'review';
        user_ip_hash: string;
        user_agent: string | null;
        referrer: string | null;
        session_id: string | null;
        metadata: any;
        created_at: string;
      };
      Insert: {
        id?: string;
        server_id: string;
        event_type: 'impression' | 'click' | 'ip_copy' | 'vote' | 'review';
        user_ip_hash: string;
        user_agent?: string | null;
        referrer?: string | null;
        session_id?: string | null;
        metadata?: any;
        created_at?: string;
      };
      Update: {
        id?: string;
        server_id?: string;
        event_type?: 'impression' | 'click' | 'ip_copy' | 'vote' | 'review';
        user_ip_hash?: string;
        user_agent?: string | null;
        referrer?: string | null;
        session_id?: string | null;
        metadata?: any;
        created_at?: string;
      };
    };
    server_analytics_daily: {
      Row: {
        id: string;
        server_id: string;
        date: string;
        impressions: number;
        clicks: number;
        ip_copies: number;
        votes: number;
        reviews: number;
        unique_visitors: number;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        server_id: string;
        date: string;
        impressions?: number;
        clicks?: number;
        ip_copies?: number;
        votes?: number;
        reviews?: number;
        unique_visitors?: number;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        server_id?: string;
        date?: string;
        impressions?: number;
        clicks?: number;
        ip_copies?: number;
        votes?: number;
        reviews?: number;
        unique_visitors?: number;
        created_at?: string;
        updated_at?: string;
      };
    };
    sponsored_servers: {
      Row: {
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
        created_at: string;
        updated_at: string;
        created_by: string | null;
      };
      Insert: {
        id?: string;
        name: string;
        ip: string;
        java_port?: number;
        bedrock_port?: number;
        platform: 'java' | 'bedrock' | 'crossplatform';
        gamemode: string;
        min_version?: string;
        max_version?: string;
        banner_url?: string | null;
        target_url?: string | null;
        display_order?: number;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
        created_by?: string | null;
      };
      Update: {
        id?: string;
        name?: string;
        ip?: string;
        java_port?: number;
        bedrock_port?: number;
        platform?: 'java' | 'bedrock' | 'crossplatform';
        gamemode?: string;
        min_version?: string;
        max_version?: string;
        banner_url?: string | null;
        target_url?: string | null;
        display_order?: number;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
        created_by?: string | null;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      server_platform: 'java' | 'bedrock' | 'crossplatform';
      server_status: 'pending' | 'approved' | 'rejected';
      analytics_event_type: 'impression' | 'click' | 'ip_copy' | 'vote' | 'review';
    };
  };
}