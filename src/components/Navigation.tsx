/**
 * Navigation Component
 * 
 * Enhanced navigation with dropdown menus for server filtering,
 * search functionality, and user authentication.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ChevronDown, User, LogOut, Plus, Settings, Server, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  user: any;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  selectedGamemode: string;
  setSelectedGamemode: (gamemode: string) => void;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddServer: () => void;
  onNavigate: (page: string, category?: string) => void;
  currentPage?: string;
  currentCategory?: string;
  setSortBy: (sortBy: string) => void;
  setHasWhitelist: (hasWhitelist: boolean) => void;
}

// ==================== CONSTANTS ====================

const gamemodes = [
  'Anarchy', 'Bedwars', 'Build Battle', 'Capture the Flag', 'Cops and Robbers', 
  'Creative', 'Duels', 'Earth', 'Economy', 'Eggwars', 'Factions', 'FTB', 
  'HCF', 'Hardcore', 'Hide and Seek', 'Hunger Games', 'KitPvP', 'Lifesteal', 
  'Lucky Block', 'MCMMO', 'Minigames', 'Murder Mystery', 'OneBlock', 'Paintball', 
  'Parkour', 'Pixelmon', 'Prison', 'PvE', 'PvP', 'Quake', 'Roleplay', 'RPG', 
  'Skyblock', 'Skywars', 'Spleef', 'Survival', 'The Bridge', 'TNT Run', 'Towny', 
  'UHC', 'Vanilla', 'Walls', 'Zombies'
];

const versions = [
  '1.21', '1.20', '1.19', '1.18', '1.17', '1.16', '1.15', '1.14',
  '1.13', '1.12', '1.11', '1.10', '1.9', '1.8', '1.7'
];

const platforms = [
  { id: 'java', name: 'Java Servers' },
  { id: 'bedrock', name: 'Bedrock Servers' },
  { id: 'crossplatform', name: 'Cross-Platform Servers' }
];

// ==================== COMPONENT ====================

export const Navigation: React.FC<NavigationProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  user,
  onLogin,
  onRegister,
  onLogout,
  selectedGamemode,
  setSelectedGamemode,
  selectedVersion,
  setSelectedVersion,
  selectedPlatform,
  setSelectedPlatform,
  searchQuery,
  setSearchQuery,
  onAddServer,
  onNavigate,
  currentPage,
  currentCategory,
  setSortBy,
  setHasWhitelist
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    console.log('Filter change triggered:', filterType, value, 'Current page:', currentPage);
    
    // Apply the selected filter first
    switch (filterType) {
      case 'gamemode':
        setSelectedGamemode(value);
        break;
      case 'version':
        setSelectedVersion(value);
        break;
      case 'platform':
        setSelectedPlatform(value);
        break;
    }

    // If we're on a dedicated page or server page, always redirect to homepage
    if (currentPage === 'dedicated' || currentPage === 'server') {
      console.log('Redirecting to home from dedicated page');
      onNavigate('home');
    }

    closeDropdowns();
  };

  const handleAddServer = () => {
    onAddServer();
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <a 
            href="/" 
            className="flex items-center space-x-3 flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
            aria-label="ServerCraft - Back to home"
          >
            <div className="w-10 h-10 bg-discord-blue rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <span className="text-xl font-bold text-white">SERVERCRAFT</span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-4 h-4" />
              <input
                type="text"
                placeholder="Search servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none w-64"
              />
            </div>

            {/* Dropdown Menus */}
            <div className="flex items-center space-x-4">
              {/* Gamemode Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('gamemode')}
                  className="flex items-center space-x-1 text-light-gray hover:text-white transition-colors text-sm font-medium"
                >
                  <span>Gamemode</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'gamemode' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-2xl z-50">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedGamemode('all');
                          closeDropdowns();
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedGamemode === 'all' ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                        }`}
                      >
                        All Gamemodes
                      </button>
                      {gamemodes.map((gamemode) => (
                        <button
                          key={gamemode}
                          onClick={() => {
                            handleFilterChange('gamemode', gamemode.toLowerCase());
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedGamemode === gamemode.toLowerCase() ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {gamemode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Version Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('version')}
                  className="flex items-center space-x-1 text-light-gray hover:text-white transition-colors text-sm font-medium"
                >
                  <span>Version</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'version' && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-2xl z-50">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedVersion('all');
                          closeDropdowns();
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedVersion === 'all' ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                        }`}
                      >
                        All Versions
                      </button>
                      {versions.map((version) => (
                        <button
                          key={version}
                          onClick={() => {
                            handleFilterChange('version', version);
                            closeDropdowns();
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedVersion === version ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {version}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('platform')}
                  className="flex items-center space-x-1 text-light-gray hover:text-white transition-colors text-sm font-medium"
                >
                  <span>Platform</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'platform' && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-2xl z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          handleFilterChange('platform', 'all');
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedPlatform === 'all' ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                        }`}
                      >
                        All Platforms
                      </button>
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          onClick={() => {
                            if (currentPage === 'dedicated') {
                              setSelectedPlatform(platform.id);
                              onNavigate('home');
                            } else {
                              handleFilterChange('platform', platform.id);
                            }
                            closeDropdowns();
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedPlatform === platform.id ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {platform.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onNavigate('dedicated', 'new');
                    closeDropdowns();
                  }}
                  className="px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                >
                  New
                </button>
                <button
                  onClick={() => {
                    onNavigate('dedicated', 'popular');
                    closeDropdowns();
                  }}
                  className="px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Popular
                </button>
                <button
                  onClick={() => {
                    onNavigate('dedicated', 'whitelist');
                    closeDropdowns();
                  }}
                  className="px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Whitelist
                </button>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Add Server Button */}
            <button
              onClick={handleAddServer}
              className="btn bg-grass-green hover:bg-green-600 text-white text-sm px-4 py-2 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Server</span>
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center space-x-2 text-white hover:text-discord-blue transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.username || user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 shadow-2xl z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          onNavigate('my-servers');
                          closeDropdowns();
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <Server className="w-4 h-4" />
                        <span>My Servers</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('edit-account');
                          closeDropdowns();
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Account</span>
                      </button>
                      
                      {/* Admin Panel - Only show for admins */}
                      {userProfile?.is_admin && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            closeDropdowns();
                          }}
                          className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      <hr className="border-white/10 my-2" />
                      <button
                        onClick={() => {
                          onLogout();
                          closeDropdowns();
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="text-light-gray hover:text-white transition-colors text-sm font-medium"
                >
                  Login
                </button>
                <button
                  onClick={onRegister}
                  className="btn bg-discord-blue hover:bg-blue-600 text-white text-sm px-4 py-2"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-light-gray hover:text-white transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <div className="fixed top-16 left-0 right-0 z-50 lg:hidden">
            <div className="bg-secondary-dark/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
              <div className="container mx-auto px-4 py-4 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none"
                  />
                </div>

                {/* Mobile Filter Dropdowns */}
                <div className="space-y-3">
                  {/* Gamemode Dropdown */}
                  <div>
                    <button
                      onClick={() => toggleDropdown('mobile-gamemode')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white"
                    >
                      <span>Gamemode: {selectedGamemode === 'all' ? 'All' : selectedGamemode.charAt(0).toUpperCase() + selectedGamemode.slice(1)}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {activeDropdown === 'mobile-gamemode' && (
                      <div className="mt-2 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setSelectedGamemode('all');
                              closeDropdowns();
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedGamemode === 'all' ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                            }`}
                          >
                            All Gamemodes
                          </button>
                          {gamemodes.map((gamemode) => (
                            <button
                              key={gamemode}
                              onClick={() => {
                                handleFilterChange('gamemode', gamemode.toLowerCase());
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                selectedGamemode === gamemode.toLowerCase() ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {gamemode}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Version Dropdown */}
                  <div>
                    <button
                      onClick={() => toggleDropdown('mobile-version')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white"
                    >
                      <span>Version: {selectedVersion === 'all' ? 'All' : selectedVersion}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {activeDropdown === 'mobile-version' && (
                      <div className="mt-2 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              setSelectedVersion('all');
                              closeDropdowns();
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedVersion === 'all' ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                            }`}
                          >
                            All Versions
                          </button>
                          {versions.map((version) => (
                            <button
                              key={version}
                              onClick={() => {
                                handleFilterChange('version', version);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                selectedVersion === version ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {version}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platform Dropdown */}
                  <div>
                    <button
                      onClick={() => toggleDropdown('mobile-platform')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white"
                    >
                      <span>Platform: {selectedPlatform === 'all' ? 'All' : platforms.find(p => p.id === selectedPlatform)?.name || selectedPlatform}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {activeDropdown === 'mobile-platform' && (
                      <div className="mt-2 bg-secondary-dark/95 backdrop-blur-lg rounded-lg border border-white/10 max-h-48 overflow-y-auto">
                        <div className="p-2">
                          <button
                            onClick={() => {
                              handleFilterChange('platform', 'all');
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedPlatform === 'all' ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                            }`}
                          >
                            All Platforms
                          </button>
                          {platforms.map((platform) => (
                            <button
                              key={platform.id}
                              onClick={() => {
                                handleFilterChange('platform', platform.id);
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                selectedPlatform === platform.id ? 'bg-discord-blue text-white' : 'text-light-gray hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {platform.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Filter Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        onNavigate('dedicated', 'new');
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPlatform === 'new' ? 'bg-green-600 text-white' : 'bg-secondary-dark/60 text-light-gray hover:text-white hover:bg-white/5'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dedicated', 'popular');
                        setIsMenuOpen(false);
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      Popular
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dedicated', 'whitelist');
                        setIsMenuOpen(false);
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Whitelist
                    </button>
                  </div>
                </div>

                {/* Mobile Auth */}
                {user ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleAddServer}
                      className="btn bg-grass-green hover:bg-green-600 text-white text-sm px-4 py-2 flex items-center space-x-2 mb-3"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Server</span>
                    </button>
                    
                    <div className="p-3 bg-white/5 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2 mb-3">
                        <User className="w-4 h-4 text-discord-blue" />
                        <span className="text-white text-sm">{user.username || user.email?.split('@')[0]}</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          onNavigate('my-servers');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <Server className="w-4 h-4" />
                        <span>My Servers</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onNavigate('edit-account');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Edit Account</span>
                      </button>
                      
                      {/* Admin Panel - Only show for admins */}
                      {userProfile?.is_admin && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-light-gray hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAddServer}
                        className="flex-1 btn bg-grass-green hover:bg-green-600 text-white flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Server</span>
                      </button>
                    </div>
                     
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          onLogin();
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          onRegister();
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 btn bg-discord-blue hover:bg-blue-600 text-white"
                      >
                        Register
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Backdrop for dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-30"
          onClick={closeDropdowns}
        />
      )}
    </nav>
  );
};