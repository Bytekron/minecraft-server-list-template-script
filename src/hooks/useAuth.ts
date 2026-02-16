/**
 * Authentication Hook
 * 
 * Custom React hook for managing user authentication state
 * with Supabase integration.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      });
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // The user profile will be automatically created by the database trigger
    return { data: authData, error: authError };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    // First, attempt to sign in to get the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    // Check if user is banned after successful authentication
    if (data.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_banned, banned_reason')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error checking user ban status:', profileError);
          // Continue with login if we can't check ban status
        } else if (profile?.is_banned) {
          // Sign out the user immediately
          await supabase.auth.signOut();
          
          // Throw error with ban reason
          const banReason = profile.banned_reason || 'No reason provided';
          throw new Error(`You have been banned from this platform. Reason: ${banReason}`);
        }
      } catch (banCheckError) {
        // If it's our custom ban error, re-throw it
        if (banCheckError.message.includes('You have been banned')) {
          throw banCheckError;
        }
        // Otherwise, log the error but continue with login
        console.error('Error checking ban status:', banCheckError);
      }
    }
    
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut
  };
};