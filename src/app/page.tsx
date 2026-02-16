'use client';

/**
 * Home Page Component
 * 
 * Main landing page with server list and filtering functionality
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { ServerList } from '../components/ServerList';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';
import { BackToTopButton } from '../components/BackToTopButton';
import { AddServerModal } from '../components/AddServerModal';
import { useAuth } from '../hooks/useAuth';
import { CronService } from '../services/cronService';
import { AnalyticsService } from '../services/analyticsService';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { user, signIn, signUp, signOut } = useAuth();
  
  // State management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedGamemode, setSelectedGamemode] = useState<string>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('votes');
  const [hasWhitelist, setHasWhitelist] = useState<boolean>(false);

  // Effects
  useEffect(() => {
    CronService.startServerMonitoring();
    
    const cleanupInterval = setInterval(() => {
      AnalyticsService.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
    
    if (process.env.NODE_ENV === 'development') {
      CronService.exposeToWindow();
    }
    
    return () => {
      CronService.stopServerMonitoring();
      clearInterval(cleanupInterval);
    };
  }, []);

  // Handlers
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuth = async (email: string, password: string, username?: string) => {
    if (authMode === 'register' && username) {
      const { error } = await signUp(email, password, username);
      if (error) throw error;
    } else {
      const { error } = await signIn(email, password);
      if (error) throw error;
    }
    
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigate = (page: string, category?: string) => {
    if (page === 'dedicated' && category) {
      router.push(`/category/${category}`);
    } else if (page === 'my-servers') {
      router.push('/my-servers');
    } else if (page === 'edit-account') {
      router.push('/edit-account');
    } else if (page === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleNavigateToServer = (slug: string) => {
    router.push(`/server/${slug}`);
  };

  const handleAddServer = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsAddServerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary-dark text-white overflow-x-hidden">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-grass-green text-primary-dark px-4 py-2 rounded-lg font-bold z-50"
      >
        Skip to main content
      </a>
      
      <header role="banner">
        <Navigation 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen}
          user={user}
          onLogin={() => openAuthModal('login')}
          onRegister={() => openAuthModal('register')}
          onLogout={handleLogout}
          selectedGamemode={selectedGamemode}
          setSelectedGamemode={setSelectedGamemode}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddServer={handleAddServer}
          onNavigate={handleNavigate}
          currentPage="home"
          currentCategory={null}
          onServerClick={handleNavigateToServer}
          setSortBy={setSortBy}
          setHasWhitelist={setHasWhitelist}
        />
      </header>
      
      <main id="main-content" role="main" className="pt-16">
        <ServerList 
          selectedGamemode={selectedGamemode}
          selectedVersion={selectedVersion}
          selectedPlatform={selectedPlatform}
          searchQuery={searchQuery}
          selectedCountry={selectedCountry}
          sortBy={sortBy}
          hasWhitelist={hasWhitelist}
          showHeader={true}
          onCountryChange={setSelectedCountry}
          onSortChange={setSortBy}
          onServerClick={handleNavigateToServer}
          onGamemodeChange={setSelectedGamemode}
          onVersionChange={setSelectedVersion}
          onPlatformChange={setSelectedPlatform}
          onSearchChange={setSearchQuery}
        />
      </main>
      
      <footer role="contentinfo" aria-label="Site Footer">
        <Footer onNavigate={handleNavigate} />
      </footer>

      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          onClose={closeAuthModal}
          onAuth={handleAuth}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      <BackToTopButton />
      
      {isAddServerModalOpen && (
        <AddServerModal
          isOpen={isAddServerModalOpen}
          onClose={() => setIsAddServerModalOpen(false)}
        />
      )}
    </div>
  );
}