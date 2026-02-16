/**
 * Supabase Client Configuration
 * 
 * Singleton client instance for database operations
 * with proper TypeScript support and error handling.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Please click "Connect to Supabase" in the top right.');
  console.warn('Missing environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓ Present' : '✗ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓ Present' : '✗ Missing'
  });
}

// Create Supabase client with fallback values to prevent crashes
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Helper functions for common operations
export const auth = supabase.auth;
export const storage = supabase.storage;

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Sign out user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};