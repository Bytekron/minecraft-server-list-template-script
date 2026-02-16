/**
 * ServerCraft - Minecraft Server List Application
 * 
 * A modern, SEO-optimized Minecraft server directory featuring:
 * - Advanced filtering by gamemode, version, and platform
 * - User authentication system
 * - Responsive design for all devices
 * - Real-time server status and player counts
 * - Server banner display with click-to-copy IP functionality
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ServerList } from './components/ServerList';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { BackToTopButton } from './components/BackToTopButton';
import { AddServerModal } from './components/AddServerModal';
import { MyServers } from './components/MyServers';
import { EditAccount } from './components/EditAccount';
import { ServerPage } from './components/ServerPage';
import { DedicatedServerPage } from './components/DedicatedServerPage';
import { AdminPanel } from './components/AdminPanel';
import { useAuth } from './hooks/useAuth';
import { CronService } from './services/cronService';
import { AnalyticsService } from './services/analyticsService';

/**
 * Main App Component
 * 
 * Manages global application state and renders the server list interface
 * with navigation, filtering, and authentication functionality.
 */
function App() {
  // ==================== STATE MANAGEMENT ====================
  
  /**
   * Current page state
   */
  const [currentPage, setCurrentPage] = useState<'home' | 'my-servers' | 'edit-account' | 'server' | 'dedicated'>('home');
  const [currentServerSlug, setCurrentServerSlug] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  
  /**
   * Authentication state
   */
  const { user, signIn, signUp, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  /**
   * Mobile navigation state
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  /**
   * Filter states
   */
  const [selectedGamemode, setSelectedGamemode] = useState<string>('all');
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  /**
   * Add server modal state
   */
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);

  /**
   * Country and sorting state
   */
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('votes');
  const [hasWhitelist, setHasWhitelist] = useState<boolean>(false);

  // ==================== EFFECTS ====================
  
  /**
   * Start server monitoring on app load
   */
  useEffect(() => {
    // Start server monitoring cron job
    CronService.startServerMonitoring();
    
    // Start analytics cleanup (runs daily)
    const cleanupInterval = setInterval(() => {
      AnalyticsService.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Expose manual trigger to browser console (development only)
    if (import.meta.env.DEV) {
      CronService.exposeToWindow();
    }
    
    // Cleanup on unmount
    return () => {
      CronService.stopServerMonitoring();
      clearInterval(cleanupInterval);
    };
  }, []);

  // ==================== EVENT HANDLERS ====================
  
  /**
   * Handle authentication modal
   */
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * Handle user authentication
   */
  const handleAuth = async (email: string, password: string, username?: string) => {
    if (authMode === 'register' && username) {
      const { error } = await signUp(email, password, username);
      if (error) throw error;
    } else {
      const { error } = await signIn(email, password);
      if (error) throw error;
    }
    
    // Only close modal on success
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
  };

  /**
   * Handle navigation
   */
  const handleNavigate = (page: string, category?: string) => {
    console.log('Navigate called with:', page, category);
    const validCategories = [
      'java', 'bedrock', 'crossplatform', 'new', 'popular', 'whitelist',
      'survival', 'pvp', 'creative', 'skyblock', 'prison', 'factions', 
      'towny', 'economy', 'minigames', 'vanilla', 'anarchy',
      '1.21', '1.20', '1.19', '1.18'
    ];
    
    if (page === 'dedicated' && category) {
      if (!validCategories.includes(category)) {
        // Invalid category, redirect to home
        setCurrentPage('home');
        setCurrentCategory(null);
        window.history.pushState({}, '', '/');
        return;
      }
      setCurrentCategory(category);
      setCurrentPage('dedicated');
      window.history.pushState({}, '', `/${category}`);
    } else if (page === 'home') {
      setCurrentPage('home');
      setCurrentCategory(null);
      window.history.pushState({}, '', '/');
    } else {
      setCurrentPage(page as 'home' | 'my-servers' | 'edit-account' | 'server');
    }
  };

  const handleNavigateToServer = (slug: string) => {
    // Find the server to track the click
    // We'll track this in ServerPage component instead to avoid duplicate tracking
    setCurrentServerSlug(slug);
    setCurrentPage('server');
    // Update URL without page reload
    window.history.pushState({}, '', `/server/${slug}`);
  };

  const handleBackToHome = () => {
    setIsAuthModalOpen(false);
    setCurrentPage('home');
    setCurrentServerSlug(null);
    setCurrentCategory(null);
    // Update URL
    window.history.pushState({}, '', '/');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddServer = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsAddServerModalOpen(true);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const validCategories = [
        'java', 'bedrock', 'crossplatform', 'new', 'popular', 'whitelist',
        'survival', 'pvp', 'creative', 'skyblock', 'prison', 'factions', 
        'towny', 'economy', 'minigames', 'vanilla', 'anarchy', 'bedwars',
        'build-battle', 'capture-the-flag', 'cops-and-robbers', 'duels',
        'earth', 'eggwars', 'hardcore', 'hide-and-seek', 'lucky-block',
        'mcmmo', 'murder-mystery', 'oneblock', 'paintball', 'quake',
        'roleplay', 'spleef', 'the-bridge', 'tnt-run', 'uhc', 'walls',
        'zombies', 'ftb', 'hcf', 'hunger-games', 'kitpvp', 'lifesteal',
        'parkour', 'pixelmon', 'pve', 'rpg', 'skywars',
        '1.21', '1.20', '1.19', '1.18'
      ];
      
      if (path.startsWith('/server/')) {
        const slug = path.replace('/server/', '');
        setCurrentServerSlug(slug);
        setCurrentPage('server');
      } else if (path.startsWith('/') && path !== '/') {
        const category = path.replace('/', '');
        if (validCategories.includes(category)) {
          setCurrentCategory(category as any);
          setCurrentPage('dedicated');
        } else {
          // Invalid category, redirect to home
          setCurrentPage('home');
          setCurrentServerSlug(null);
          setCurrentCategory(null);
          window.history.pushState({}, '', '/');
        }
      } else {
        setCurrentPage('home');
        setCurrentServerSlug(null);
        setCurrentCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Handle initial page load (including direct visits to server pages)
    handlePopState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  // ==================== RENDER ====================
  
  return (
    <div className="min-h-screen bg-primary-dark text-white overflow-x-hidden">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-grass-green text-primary-dark px-4 py-2 rounded-lg font-bold z-50"
      >
        Skip to main content
      </a>
      
      {/* Header Navigation - Only show on home page */}
      {(currentPage === 'home' || currentPage === 'server' || currentPage === 'dedicated') && (
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
            currentPage={currentPage}
            currentCategory={currentCategory}
            onServerClick={handleNavigateToServer}
            setSortBy={setSortBy}
            setHasWhitelist={setHasWhitelist}
          />
        </header>
      )}
      
      {/* Main Content Area */}
      <main id="main-content" role="main" className={(currentPage === 'home' || currentPage === 'server' || currentPage === 'dedicated') ? 'pt-16' : ''}>
        {currentPage === 'home' && (
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
            hasWhitelist={hasWhitelist}
            onVersionChange={setSelectedVersion}
            onPlatformChange={setSelectedPlatform}
            onSearchChange={setSearchQuery}
          />
        )}
        
        {currentPage === 'my-servers' && (
          <MyServers 
            onAddServer={handleAddServer}
            onBackToHome={handleBackToHome}
          />
        )}
        
        {currentPage === 'edit-account' && (
          <EditAccount 
            onBackToHome={handleBackToHome}
          />
        )}
        
        {currentPage === 'server' && currentServerSlug && (
          <ServerPage 
            slug={currentServerSlug}
            onBack={handleBackToHome}
            onNavigate={handleNavigate}
          />
        )}
        
        {currentPage === 'dedicated' && currentCategory && (
          <DedicatedServerPage 
            category={currentCategory}
            onBack={handleBackToHome}
            onServerClick={handleNavigateToServer}
            onNavigate={handleNavigate}
          />
        )}
        
        {currentPage === 'admin' && (
          <AdminPanel 
            onBackToHome={handleBackToHome}
          />
        )}
      </main>
      
      {/* Footer - Only show on home page */}
      {(currentPage === 'home' || currentPage === 'dedicated') && (
        <footer role="contentinfo" aria-label="Site Footer">
          <Footer onNavigate={handleNavigate} />
        </footer>
      )}

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          onClose={closeAuthModal}
          onAuth={handleAuth}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      {/* Back to Top Button */}
      <BackToTopButton />
      
      {/* Add Server Modal */}
      {isAddServerModalOpen && (
        <AddServerModal
          isOpen={isAddServerModalOpen}
          onClose={() => setIsAddServerModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;