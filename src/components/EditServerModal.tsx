/**
 * Edit Server Modal Component
 * 
 * Modal for editing existing Minecraft servers with pre-populated data
 * and comprehensive validation.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { ServerService } from '../services/serverService';
import { useAuth } from '../hooks/useAuth';

// ==================== INTERFACES ====================

interface EditServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  onServerUpdated: () => void;
}

interface ServerFormData {
  name: string;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  hasWhitelist: boolean;
  ip: string;
  javaPort: string;
  bedrockPort: string;
  queryPort: string;
  minVersion: string;
  maxVersion: string;
  additionalGamemodes: string;
  country: string;
  website: string;
  discord: string;
  youtube: string;
  description: string;
  banner: File | null;
  votifierEnabled: boolean;
  votifierPublicKey: string;
  votifierIP: string;
  votifierPort: string;
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
  '1.7', '1.8', '1.9', '1.10', '1.11', '1.12', '1.13', 
  '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21'
];

const countries = [
  'Worldwide', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Netherlands', 
  'Australia', 'Finland', 'France', 'Spain', 'Czech Republic', 'Turkey', 'Brazil', 
  'Lithuania', 'Vietnam', 'Israel', 'Bulgaria', 'Sweden', 'Portugal', 'Argentina', 
  'Poland', 'South Africa', 'Italy', 'Peru', 'Malaysia', 'Slovakia', 'Ukraine', 
  'Slovenia', 'Latvia', 'Sri Lanka', 'Belgium', 'Ireland', 'India', 'Russia', 
  'New Zealand', 'Singapore', 'Croatia', 'Romania', 'Denmark', 'Cambodia', 
  'Philippines', 'Uruguay', 'Indonesia', 'Hungary', 'Iran', 'Namibia', 'Japan', 
  'Pakistan', 'Greece', 'Brunei', 'Mexico', 'Serbia', 'Bangladesh', 'Chile', 
  'China', 'Thailand', 'Georgia', 'Taiwan', 'Norway', 'Ecuador', 'Colombia', 
  'Anguilla', 'Egypt', 'Saudi Arabia', 'Bahrain', 'El Salvador', 'Austria', 
  'Venezuela', 'United Arab Emirates', 'Union of Soviet Socialist Republics', 
  'Lebanon', 'Malta', 'Nepal', 'South Korea', 'Algeria', 'Bolivia', 
  'Bosnia and Herzegovina', 'Belarus', 'Cyprus', 'Switzerland', 'Iraq', 'Qatar', 
  'U.S. Virgin Islands', 'Estonia', 'Cuba', 'Jordan', 'Turks and Caicos Islands', 
  'Puerto Rico', 'Morocco', 'Uzbekistan', 'Tunisia', 'U.S. Minor Outlying Islands', 
  'Hong Kong SAR China', 'Panama'
];

// ==================== COMPONENT ====================

export const EditServerModal: React.FC<EditServerModalProps> = ({ 
  isOpen, 
  onClose, 
  serverId, 
  onServerUpdated 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ServerFormData>({
    name: '',
    platform: 'java',
    gamemode: '',
    hasWhitelist: false,
    ip: '',
    javaPort: '25565',
    queryPort: '25565',
    minVersion: '1.7',
    maxVersion: '1.21',
    additionalGamemodes: '',
    country: 'Worldwide',
    website: '',
    discord: '',
    youtube: '',
    description: '',
    banner: null,
    votifierEnabled: false,
    votifierPublicKey: '',
    votifierIP: '',
    votifierPort: '8192'
  });
  
  const [errors, setErrors] = useState<any>({});
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isOpen && serverId) {
      loadServerData();
    }
  }, [isOpen, serverId]);

  // ==================== HANDLERS ====================

  const loadServerData = async () => {
    try {
      setIsLoadingData(true);
      const server = await ServerService.getServerById(serverId);
      
      // Populate form with existing server data
      setFormData({
        name: server.name,
        platform: server.platform,
        gamemode: server.gamemode,
        hasWhitelist: server.has_whitelist,
        ip: server.ip,
        javaPort: server.java_port.toString(),
        bedrockPort: server.bedrock_port?.toString() || '19132',
        queryPort: server.query_port.toString(),
        minVersion: server.min_version,
        maxVersion: server.max_version,
        additionalGamemodes: server.additional_gamemodes || '',
        country: server.country,
        website: server.website || '',
        discord: server.discord || '',
        youtube: server.youtube || '',
        description: server.description,
        banner: null,
        votifierEnabled: server.votifier_enabled,
        votifierPublicKey: server.votifier_public_key || '',
        votifierIP: server.votifier_ip || '',
        votifierPort: server.votifier_port?.toString() || '8192'
      });

      // Set banner preview if exists
      if (server.banner_url) {
        setBannerPreview(server.banner_url);
      }
    } catch (error) {
      console.error('Error loading server data:', error);
      setErrors({ general: 'Failed to load server data' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof ServerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors and state first
    setErrors((prev: any) => ({ ...prev, banner: '' }));
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      
      if (!validTypes.includes(file.type)) {
        setErrors((prev: any) => ({ ...prev, banner: 'Only JPEG, JPG, PNG, or GIF formats are supported' }));
        e.target.value = ''; // Clear the input
        return;
      }
      
      if (file.size > maxSize) {
        setErrors((prev: any) => ({ ...prev, banner: 'Image file must be smaller than 5MB' }));
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Create FileReader for preview
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            setBannerPreview(event.target.result as string);
            setFormData(prev => ({ ...prev, banner: file }));
          }
        } catch (error) {
          console.error('Error processing image:', error);
          setErrors((prev: any) => ({ ...prev, banner: 'Failed to process the image file' }));
          setBannerPreview(null);
          setFormData(prev => ({ ...prev, banner: null }));
          e.target.value = '';
        }
      };
      
      reader.onerror = () => {
        console.error('FileReader error');
        setErrors((prev: any) => ({ ...prev, banner: 'Failed to read the image file' }));
        setBannerPreview(null);
        setFormData(prev => ({ ...prev, banner: null }));
        e.target.value = '';
      };
      
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error starting file read:', error);
        setErrors((prev: any) => ({ ...prev, banner: 'Failed to process the image file' }));
        setBannerPreview(null);
        setFormData(prev => ({ ...prev, banner: null }));
        e.target.value = '';
      }
    } else {
      // No file selected, clear everything
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: null }));
    }
  };

  const testServerConnection = async () => {
    if (!formData.ip.trim()) {
      setConnectionTestResult({
        success: false,
        message: 'Please enter a server IP first'
      });
      return;
    }

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setConnectionTestResult({
        success: false,
        message: '⚠️ Supabase not configured - connection test unavailable'
      });
      return;
    }

    // Check for placeholder URLs
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
      setConnectionTestResult({
        success: false,
        message: '⚠️ Please configure Supabase to test server connection'
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      // Use the server monitoring edge function to test connection
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/server-monitor`;
      const port = formData.platform === 'bedrock' ? 
        (parseInt(formData.bedrockPort) || 19132) : 
        (parseInt(formData.javaPort) || 25565);

      const response = await fetch(`${apiUrl}?ip=${encodeURIComponent(formData.ip)}&port=${port}&platform=${formData.platform}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result && typeof result === 'object') {
        if (result.online) {
          setConnectionTestResult({
            success: true,
            message: `✅ Server is online! Found ${result.players?.online || 0}/${result.players?.max || 0} players`,
            details: result
          });
        } else {
          setConnectionTestResult({
            success: false,
            message: '❌ Server appears to be offline or unreachable',
            details: result
          });
        }
      } else {
        setConnectionTestResult({
          success: false,
          message: '❌ Unable to connect to server - please check IP and port'
        });
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        setConnectionTestResult({
          success: false,
          message: '⚠️ Connection test unavailable - Supabase Edge Function not accessible'
        });
      } else {
        setConnectionTestResult({
          success: false,
          message: `❌ Connection test failed: ${error.message || 'Unknown error'}`
        });
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const isValidDiscordLink = (url: string): boolean => {
    const discordPatterns = [
      /^https?:\/\/(www\.)?discord\.gg\/[a-zA-Z0-9]+$/,
      /^https?:\/\/(www\.)?discord\.com\/invite\/[a-zA-Z0-9]+$/,
      /^https?:\/\/discord\.gg\/[a-zA-Z0-9]+$/,
      /^discord\.gg\/[a-zA-Z0-9]+$/
    ];
    return discordPatterns.some(pattern => pattern.test(url));
  };

  const isValidYouTubeLink = (url: string): boolean => {
    const youtubePatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtu\.be\/[a-zA-Z0-9_-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/,
      /^youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
      /^youtu\.be\/[a-zA-Z0-9_-]+/
    ];
    return youtubePatterns.some(pattern => pattern.test(url));
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Server name must be 30 characters or less';
    }

    // Gamemode validation
    if (!formData.gamemode) {
      newErrors.gamemode = 'Please select a gamemode';
    }

    // IP validation
    if (!formData.ip.trim()) {
      newErrors.ip = 'Server IP is required';
    }

    // Additional gamemodes validation
    if (formData.additionalGamemodes) {
      const gamemodeCount = formData.additionalGamemodes.split(',').filter(g => g.trim()).length;
      if (gamemodeCount > 10) {
        newErrors.additionalGamemodes = 'Maximum 10 additional gamemodes allowed';
      }
      
      // Check individual gamemode length
      const gamemodes = formData.additionalGamemodes.split(',');
      for (const gamemode of gamemodes) {
        if (gamemode.trim().length > 30) {
          newErrors.additionalGamemodes = 'Each gamemode must be 30 characters or less';
          break;
        }
      }
    }
    
    // Website validation
    if (formData.website && !formData.website.startsWith('https://')) {
      newErrors.website = 'Website URL must start with https://';
    }
    
    // Discord link validation
    if (formData.discord && !isValidDiscordLink(formData.discord)) {
      newErrors.discord = 'Please enter a valid Discord invite link (discord.gg/... or discord.com/invite/...)';
    }
    
    // YouTube link validation
    if (formData.youtube && !isValidYouTubeLink(formData.youtube)) {
      newErrors.youtube = 'Please enter a valid YouTube video link';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Server description is required';
    } else if (formData.description.length < 500) {
      newErrors.description = 'Description must be at least 500 characters';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be under 5000 characters';
    }

    // Votifier validation
    if (formData.votifierEnabled) {
      if (!formData.votifierPublicKey.trim()) {
        newErrors.votifierPublicKey = 'Votifier public key is required';
      }
      if (!formData.votifierIP.trim()) {
        newErrors.votifierIP = 'Votifier IP is required';
      }
      if (!formData.votifierPort.trim()) {
        newErrors.votifierPort = 'Votifier port is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrors({ general: 'You must be logged in to edit a server' });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare server data for database
      const serverData = {
        name: formData.name,
        ip: formData.ip,
        java_port: parseInt(formData.javaPort) || 25565,
        bedrock_port: (formData.platform === 'bedrock' || formData.platform === 'crossplatform') ? parseInt(formData.bedrockPort) || 19132 : null,
        query_port: parseInt(formData.queryPort) || 25565,
        platform: formData.platform,
        gamemode: formData.gamemode,
        additional_gamemodes: formData.additionalGamemodes || null,
        min_version: formData.minVersion,
        max_version: formData.maxVersion,
        country: formData.country,
        website: formData.website || null,
        discord: formData.discord || null,
        youtube: formData.youtube || null,
        description: formData.description,
        banner_url: bannerPreview, // Keep existing banner for now
        has_whitelist: formData.hasWhitelist,
        votifier_enabled: formData.votifierEnabled,
        votifier_public_key: formData.votifierPublicKey || null,
        votifier_ip: formData.votifierIP || null,
        votifier_port: formData.votifierPort ? parseInt(formData.votifierPort) : null,
        updated_at: new Date().toISOString()
      };

      // Update server in database
      await ServerService.updateServer(serverId, serverData);
      
      // Success - close modal and refresh data
      onClose();
      onServerUpdated();
      
      // Optional: Show success notification
      alert('Server updated successfully!');
      
    } catch (error: any) {
      console.error('Error updating server:', error);
      setErrors({ 
        general: error.message || 'Failed to update server. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ==================== RENDER ====================

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Edit Server</h2>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-light-gray">Loading server data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Error Display */}
              {errors.general && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Server Name */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                    placeholder="Enter your server name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none transition-colors"
                  >
                    <option value="java">Minecraft Java</option>
                    <option value="bedrock">Minecraft Bedrock or PE</option>
                    <option value="crossplatform">Either (Cross-Platform)</option>
                  </select>
                </div>

                {/* Gamemode */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Gamemode
                  </label>
                  <select
                    value={formData.gamemode}
                    onChange={(e) => handleInputChange('gamemode', e.target.value)}
                    className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white focus:outline-none transition-colors ${
                      errors.gamemode ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                  >
                    <option value="">Select a gamemode</option>
                    {gamemodes.map((mode) => (
                      <option key={mode} value={mode.toLowerCase()}>{mode}</option>
                    ))}
                  </select>
                  {errors.gamemode && <p className="text-red-400 text-sm mt-1">{errors.gamemode}</p>}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none transition-colors"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Connection Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">IP Address *</label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => handleInputChange('ip', e.target.value)}
                    className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.ip ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                    placeholder="play.zaosmc.com"
                  />
                  {errors.ip && <p className="text-red-400 text-sm mt-1">{errors.ip}</p>}
                </div>

                {/* Port fields based on platform */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Java Port - show for Java and Cross-platform */}
                  {(formData.platform === 'java' || formData.platform === 'crossplatform') && (
                    <div>
                      <label className="block text-sm font-medium text-light-gray mb-2">Java Port:</label>
                      <input
                        type="text"
                        value={formData.javaPort}
                        onChange={(e) => handleInputChange('javaPort', e.target.value)}
                        className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
                        placeholder="25565"
                      />
                    </div>
                  )}

                  {/* Bedrock Port - show for Bedrock and Cross-platform */}
                  {(formData.platform === 'bedrock' || formData.platform === 'crossplatform') && (
                    <div>
                      <label className="block text-sm font-medium text-light-gray mb-2">Bedrock Port:</label>
                      <input
                        type="text"
                        value={formData.bedrockPort}
                        onChange={(e) => handleInputChange('bedrockPort', e.target.value)}
                        className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
                        placeholder="19132"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">Query Port:</label>
                  <input
                    type="text"
                    value={formData.queryPort}
                    onChange={(e) => handleInputChange('queryPort', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
                    placeholder="25565"
                  />
                </div>

                {/* Test Connection Button */}
                <div>
                  <button
                    type="button"
                    onClick={testServerConnection}
                    disabled={isTestingConnection || !formData.ip.trim()}
                    className="w-full btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <span>🔌</span>
                        <span>Test Server Connection</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Connection Test Result */}
                {connectionTestResult && (
                  <div className={`p-4 rounded-lg border ${
                    connectionTestResult.success 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-red-500/20 border-red-500/30'
                  }`}>
                    <p className={`text-sm font-medium ${
                      connectionTestResult.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {connectionTestResult.message}
                    </p>
                    {connectionTestResult.details && connectionTestResult.success && (
                      <div className="mt-2 text-xs text-light-gray">
                        {connectionTestResult.details.version && (
                          <p>Version: {connectionTestResult.details.version}</p>
                        )}
                        {connectionTestResult.details.motd?.clean && (
                          <p>MOTD: {connectionTestResult.details.motd.clean.join(' ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                </div>

              {/* Version Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-3">
                    Min Version: {formData.minVersion}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={versions.length - 1}
                    value={versions.indexOf(formData.minVersion)}
                    onChange={(e) => handleInputChange('minVersion', versions[parseInt(e.target.value)])}
                    className="w-full h-2 bg-secondary-dark rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-light-gray mt-1">
                    <span>1.7</span>
                    <span>1.21</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-gray mb-3">
                    Max Version: {formData.maxVersion}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={versions.length - 1}
                    value={versions.indexOf(formData.maxVersion)}
                    onChange={(e) => handleInputChange('maxVersion', versions[parseInt(e.target.value)])}
                    className="w-full h-2 bg-secondary-dark rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-light-gray mt-1">
                    <span>1.7</span>
                    <span>1.21</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">Discord</label>
                  <input
                    type="url"
                    value={formData.discord}
                    onChange={(e) => handleInputChange('discord', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
                    placeholder="https://discord.gg/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">YouTube</label>
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => handleInputChange('youtube', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              {/* Additional Gamemodes */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Additional Gamemodes (Max. 10 Gamemodes)
                </label>
                
                {/* Display selected gamemodes as bubbles */}
                {formData.additionalGamemodes && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-secondary-dark/40 rounded-lg border border-white/10">
                    {formData.additionalGamemodes.split(',').map((gamemode, index) => {
                      const trimmedGamemode = gamemode.trim();
                      if (!trimmedGamemode) return null;
                      
                      const colors = [
                        'bg-red-500/20 text-red-400 border-red-500/30',
                        'bg-blue-500/20 text-blue-400 border-blue-500/30',
                        'bg-green-500/20 text-green-400 border-green-500/30',
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                        'bg-purple-500/20 text-purple-400 border-purple-500/30',
                        'bg-pink-500/20 text-pink-400 border-pink-500/30',
                        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                        'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      ];
                      const colorClass = colors[index % colors.length];
                      
                      return (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClass} flex items-center space-x-2`}
                        >
                          <span>{trimmedGamemode}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const gamemodes = formData.additionalGamemodes.split(',').map(g => g.trim()).filter(g => g);
                              gamemodes.splice(index, 1);
                              handleInputChange('additionalGamemodes', gamemodes.join(', '));
                            }}
                            className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          >
                            <span className="text-xs">×</span>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <textarea
                  value={formData.additionalGamemodes}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    // Check for comma count (max 9 commas = 10 gamemodes)
                    const commaCount = (value.match(/,/g) || []).length;
                    if (commaCount > 9) {
                      setErrors((prev: any) => ({ ...prev, additionalGamemodes: 'Maximum 10 gamemodes allowed' }));
                      return;
                    }
                    
                    // Check individual gamemode length (30 chars max per gamemode)
                    const gamemodes = value.split(',');
                    for (const gamemode of gamemodes) {
                      if (gamemode.trim().length > 30) {
                        setErrors((prev: any) => ({ ...prev, additionalGamemodes: 'Each gamemode must be 30 characters or less' }));
                        return;
                      }
                    }
                    
                    handleInputChange('additionalGamemodes', value);
                  }}
                  className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors resize-none ${
                    errors.additionalGamemodes ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                  }`}
                  rows={2}
                  placeholder="Type gamemodes separated by commas, or click the buttons below..."
                />
                {errors.additionalGamemodes && <p className="text-red-400 text-sm mt-1">{errors.additionalGamemodes}</p>}
                
                {/* Predefined gamemode buttons */}
                <div className="mt-3">
                  <p className="text-xs text-light-gray mb-2">Quick add popular gamemodes:</p>
                  <div className="flex flex-wrap gap-2">
                    {gamemodes.filter(mode => mode.toLowerCase() !== formData.gamemode).map((gamemode, index) => {
                      const isSelected = formData.additionalGamemodes
                        .split(',')
                        .map(g => g.trim().toLowerCase())
                        .includes(gamemode.toLowerCase());
                      
                      const colors = [
                        'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
                        'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
                        'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
                        'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
                        'bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30',
                        'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30',
                        'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
                      ];
                      const colorClass = colors[index % colors.length];
                      
                      return (
                        <button
                          key={gamemode}
                          type="button"
                          onClick={() => {
                            const currentGamemodes = formData.additionalGamemodes
                              .split(',')
                              .map(g => g.trim())
                              .filter(g => g);
                            
                            // Check if we're at the limit (10 gamemodes max)
                            if (!isSelected && currentGamemodes.length >= 10) {
                              setErrors((prev: any) => ({ ...prev, additionalGamemodes: 'Maximum 10 gamemodes allowed' }));
                              return;
                            }
                            
                            if (isSelected) {
                              // Remove gamemode
                              const filtered = currentGamemodes.filter(g => g.toLowerCase() !== gamemode.toLowerCase());
                              handleInputChange('additionalGamemodes', filtered.join(', '));
                            } else {
                              // Add gamemode
                              const newGamemodes = [...currentGamemodes, gamemode];
                              handleInputChange('additionalGamemodes', newGamemodes.join(', '));
                            }
                          }}
                          disabled={!isSelected && formData.additionalGamemodes.split(',').filter(g => g.trim()).length >= 10}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isSelected 
                              ? `${colorClass} scale-95` 
                              : `bg-secondary-dark/60 text-light-gray border-white/10 hover:${colorClass.split(' ')[0]} hover:${colorClass.split(' ')[1]} hover:${colorClass.split(' ')[2]}`
                          }`}
                        >
                          {gamemode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Server Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors resize-none ${
                    errors.description ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                  }`}
                  rows={6}
                  maxLength={5000}
                  placeholder="Describe your server..."
                />
                <div className="flex justify-between text-xs text-light-gray mt-1">
                  <span>{errors.description && <span className="text-red-400">{errors.description}</span>}</span>
                  <span>{formData.description.length}/5000</span>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Server Banner
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-discord-blue/50 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleBannerUpload}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    {bannerPreview ? (
                      <div className="space-y-3">
                        <img src={bannerPreview} alt="Banner preview" className="max-w-full h-auto rounded-lg mx-auto" />
                        <p className="text-sm text-discord-blue">Click to change banner</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-light-gray mx-auto" />
                        <p className="text-light-gray">Click to upload banner (optional)</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.banner && <p className="text-red-400 text-sm mt-1">{errors.banner}</p>}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="whitelist"
                    checked={formData.hasWhitelist}
                    onChange={(e) => handleInputChange('hasWhitelist', e.target.checked)}
                    className="w-5 h-5 text-discord-blue bg-secondary-dark border-white/10 rounded focus:ring-discord-blue focus:ring-2"
                  />
                  <label htmlFor="whitelist" className="text-sm text-light-gray">
                    Server has whitelist enabled
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="votifier"
                    checked={formData.votifierEnabled}
                    onChange={(e) => handleInputChange('votifierEnabled', e.target.checked)}
                    className="w-5 h-5 text-discord-blue bg-secondary-dark border-white/10 rounded focus:ring-discord-blue focus:ring-2"
                  />
                  <label htmlFor="votifier" className="text-sm text-light-gray">
                    Enable Votifier
                  </label>
                </div>
              </div>

              {/* Votifier Settings */}
              {formData.votifierEnabled && (
                <div className="space-y-6 p-6 bg-secondary-dark/40 rounded-lg border border-white/10">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Votifier Settings</h4>
                    <p className="text-sm text-light-gray">
                      Votifier allows you to reward your players for voting. You can skip this if you wish to omit this for now.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-light-gray mb-2">Votifier Public Key:</label>
                    <textarea
                      value={formData.votifierPublicKey}
                      onChange={(e) => handleInputChange('votifierPublicKey', e.target.value)}
                      className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors resize-none ${
                        errors.votifierPublicKey ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                      }`}
                      rows={4}
                      placeholder="Paste your votifier public key here"
                    />
                    {errors.votifierPublicKey && <p className="text-red-400 text-sm mt-1">{errors.votifierPublicKey}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-light-gray mb-2">Votifier IP:</label>
                      <input
                        type="text"
                        value={formData.votifierIP}
                        onChange={(e) => handleInputChange('votifierIP', e.target.value)}
                        className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                          errors.votifierIP ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                        }`}
                        placeholder="127.0.0.1"
                      />
                      {errors.votifierIP && <p className="text-red-400 text-sm mt-1">{errors.votifierIP}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-light-gray mb-2">Votifier Port:</label>
                      <input
                        type="text"
                        value={formData.votifierPort}
                        onChange={(e) => handleInputChange('votifierPort', e.target.value)}
                        className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                          errors.votifierPort ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                        }`}
                        placeholder="8192"
                      />
                      {errors.votifierPort && <p className="text-red-400 text-sm mt-1">{errors.votifierPort}</p>}
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isLoadingData}
              className="btn bg-discord-blue hover:bg-blue-600 text-white flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};