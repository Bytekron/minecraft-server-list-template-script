'use client';

import React, { useState, useEffect } from 'react';
import { AdminPanel } from '../../components/AdminPanel';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-gray">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminPanel 
      onBackToHome={handleBackToHome}
    />
  );
}