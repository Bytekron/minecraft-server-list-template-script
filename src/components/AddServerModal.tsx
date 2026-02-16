/**
 * Add Server Modal Component
 * 
 * Multi-level form for users to submit their Minecraft servers
 * with comprehensive validation and step-by-step guidance.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Check, AlertCircle } from 'lucide-react';
import { ServerService } from '../services/serverService';
import { useAuth } from '../hooks/useAuth';

// ==================== INTERFACES ====================

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServerFormData {
  // Level 1
  name: string;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  hasWhitelist: boolean;
  
  // Level 2
  ip: string;
  javaPort: string;
  bedrockPort: string;
  queryPort: string;
  
  // Level 3
  minVersion: string;
  maxVersion: string;
  additionalGamemodes: string;
  country: string;
  website: string;
  discord: string;
  youtube: string;
  
  // Level 4
  description: string;
  banner: File | null;
  
  // Level 5
  votifierEnabled: boolean;
  votifierPublicKey: string;
  votifierIP: string;
  votifierPort: string;
}

// ==================== CONSTANTS ====================

const gamemodes = [
  'Anarchy', 'Creative', 'Economy', 'Factions', 'FTB', 'HCF', 'Hunger Games', 
  'KitPVP', 'Lifesteal', 'Minigames', 'Parkour', 'Pixelmon', 'Prison', 
  'PvP', 'PvE', 'RPG', 'Skyblock', 'Skywars', 'Survival', 'Towny', 'Vanilla',
  'Bedwars', 'Build Battle', 'Capture the Flag', 'Cops and Robbers', 'Duels',
  'Earth', 'Eggwars', 'Hardcore', 'Hide and Seek', 'Lucky Block', 'MCMMO',
  'Murder Mystery', 'OneBlock', 'Paintball', 'Quake', 'Roleplay', 'Spleef',
  'The Bridge', 'TNT Run', 'UHC', 'Walls', 'Zombies'
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

export const AddServerModal: React.FC<AddServerModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [formData, setFormData] = useState<ServerFormData>({
    name: '',
    platform: 'java',
    gamemode: '',
    hasWhitelist: false,
    ip: '',
    javaPort: '25565',
    bedrockPort: '19132',
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== TEST CONNECTION ====================

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

  // ==================== HANDLERS ====================

  const handleInputChange = (field: keyof ServerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Clear previous errors first
    setErrors((prev: any) => ({ ...prev, banner: '' }));
    
    if (!file) {
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: null }));
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    
    if (!validTypes.includes(file.type)) {
      setErrors((prev: any) => ({ ...prev, banner: 'Only JPEG, JPG, PNG, or GIF formats are supported' }));
      e.target.value = '';
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: null }));
      return;
    }
    
    if (file.size > maxSize) {
      setErrors((prev: any) => ({ ...prev, banner: 'Image file must be smaller than 5MB' }));
      e.target.value = '';
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: null }));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64Data = event.target.result as string;
        console.log('Banner uploaded successfully, base64 length:', base64Data.length);
        setBannerPreview(base64Data);
        setFormData(prev => ({ ...prev, banner: file }));
      }
    };
    
    reader.onerror = () => {
      console.error('FileReader error occurred');
      setErrors((prev: any) => ({ ...prev, banner: 'Failed to read the image file' }));
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: null }));
      e.target.value = '';
    };
    
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Server name is required';
        if (formData.name.length > 30) newErrors.name = 'Server name must be 30 characters or less';
        if (!formData.gamemode) newErrors.gamemode = 'Please select a gamemode';
        break;
      case 2:
        if (!formData.ip.trim()) newErrors.ip = 'Server IP is required';
        break;
      case 3:
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
        break;
      case 4:
        if (!formData.description.trim()) newErrors.description = 'Server description is required';
        if (formData.description.length < 500) newErrors.description = 'Description must be at least 500 characters';
        if (formData.description.length > 5000) newErrors.description = 'Description must be under 5000 characters';
        break;
      case 5:
        if (formData.votifierEnabled) {
          if (!formData.votifierPublicKey.trim()) newErrors.votifierPublicKey = 'Votifier public key is required';
          if (!formData.votifierIP.trim()) newErrors.votifierIP = 'Votifier IP is required';
          if (!formData.votifierPort.trim()) newErrors.votifierPort = 'Votifier port is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrors({ general: 'You must be logged in to add a server' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('Submitting server with banner preview:', bannerPreview ? 'Present' : 'Not present');
      console.log('Banner preview length:', bannerPreview?.length || 0);
      
      // Prepare server data for database
      const serverData = {
        name: formData.name,
        ip: formData.ip,
        java_port: parseInt(formData.javaPort) || 25565,
        bedrock_port: formData.platform === 'bedrock' || formData.platform === 'crossplatform' ? parseInt(formData.bedrockPort) || 19132 : null,
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
        banner_url: bannerPreview,
        has_whitelist: formData.hasWhitelist,
        votifier_enabled: formData.votifierEnabled,
        votifier_public_key: formData.votifierPublicKey || null,
        votifier_ip: formData.votifierIP || null,
        votifier_port: formData.votifierPort ? parseInt(formData.votifierPort) : null,
        user_id: user.id
      };

      console.log('Server data banner_url:', serverData.banner_url ? 'Present' : 'NULL');
      
      // Create server in database
      const createdServer = await ServerService.createServer(serverData);
      console.log('Server created successfully:', createdServer);
      
      // Success - close modal and show success message
      onClose();
      
      // Optional: Show success notification
      alert('Server submitted successfully! It will be reviewed before appearing in the list.');
      
    } catch (error: any) {
      console.error('Error creating server:', error);
      setErrors({ 
        general: error.message || 'Failed to create server. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBBCode = (text: string): string => {
    return text
      .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
      .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
      .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
      .replace(/\[li\](.*?)\[\/li\]/g, '• $1')
      .replace(/\[br\]/g, '<br>');
  };

  if (!isOpen) return null;

  // Helper functions for validation
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
  // ==================== RENDER STEPS ====================

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Let's add your server!</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          What's your server's name?
        </label>
        <p className="text-xs text-light-gray mb-2">Maximum 30 characters</p>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          maxLength={30}
          className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
            errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
          }`}
          placeholder="Enter your server name"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>{errors.name && <span className="text-red-400">{errors.name}</span>}</span>
          <span className={formData.name.length > 25 ? 'text-yellow-400' : ''}>{formData.name.length}/30</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          How can players connect to it?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'java', label: 'Minecraft Java' },
            { id: 'bedrock', label: 'Minecraft Bedrock or PE' },
            { id: 'crossplatform', label: 'Either (Cross-Platform)' }
          ].map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleInputChange('platform', platform.id)}
              className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${
                formData.platform === platform.id
                  ? 'border-discord-blue bg-discord-blue/20 text-white'
                  : 'border-white/10 bg-secondary-dark/40 text-light-gray hover:border-white/20'
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          And what's it's main gamemode?
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

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="whitelist"
          checked={formData.hasWhitelist}
          onChange={(e) => handleInputChange('hasWhitelist', e.target.checked)}
          className="w-5 h-5 text-discord-blue bg-secondary-dark border-white/10 rounded focus:ring-discord-blue focus:ring-2"
        />
        <label htmlFor="whitelist" className="text-sm text-light-gray">
          My server got Whitelist Enabled.
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Awesome name!</h2>
        <p className="text-light-gray">Let's connect to your Server ;)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">IP:</label>
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
            <label className="block text-sm font-medium text-light-gray mb-3">Java Port:</label>
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
            <label className="block text-sm font-medium text-light-gray mb-3">Bedrock Port:</label>
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
        <label className="block text-sm font-medium text-light-gray mb-3">Query Port:</label>
        <input
          type="text"
          value={formData.queryPort}
          onChange={(e) => handleInputChange('queryPort', e.target.value)}
          className="w-full px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none transition-colors"
          placeholder="25565"
        />
      </div>

      {/* Test Connection Button */}
      <div className="mt-6">
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
        <div className={`mt-4 p-4 rounded-lg border ${
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
  );

  const renderStep3 = () => (
    <div className="space-y-6">
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

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          If your server features any additional Gamemodes, add them here (Max. 10 Gamemodes):
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
          rows={3}
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

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          Where's your server based?
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

      <div className="space-y-4">
        <p className="text-sm font-medium text-light-gray">
          If you have a Website, Discord Server or YouTube trailer, you can link to them here:
        </p>
        
        <input
          type="url"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
            errors.website ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
          }`}
          placeholder="Website (optional)"
        />
        {errors.website && <p className="text-red-400 text-sm mt-1">{errors.website}</p>}
        
        <input
          type="url"
          value={formData.discord}
          onChange={(e) => handleInputChange('discord', e.target.value)}
          className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
            errors.discord ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
          }`}
          placeholder="Discord Link (optional)"
        />
        {errors.discord && <p className="text-red-400 text-sm mt-1">{errors.discord}</p>}
        
        <input
          type="url"
          value={formData.youtube}
          onChange={(e) => handleInputChange('youtube', e.target.value)}
          className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
            errors.youtube ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
          }`}
          placeholder="YouTube Video (optional)"
        />
        {errors.youtube && <p className="text-red-400 text-sm mt-1">{errors.youtube}</p>}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">One more thing...</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          Describe your server to us! Help people understand what your server is about by providing a detailed description. (Minimum 500 Characters!)
        </label>
        <div className="text-xs text-light-gray mb-3 space-y-1">
          <p>You can use Emoji, and BBCodes such as:</p>
          <p><code className="bg-secondary-dark px-1 rounded">[b]text[/b]</code> → Bold, <code className="bg-secondary-dark px-1 rounded">[u]text[/u]</code> → Underline, <code className="bg-secondary-dark px-1 rounded">[i]Text[/i]</code> → Italic</p>
          <p><code className="bg-secondary-dark px-1 rounded">[li]Item[/li]</code> → List Item, <code className="bg-secondary-dark px-1 rounded">[br]</code> → Line Break</p>
          <p className="text-yellow-400">Spam will result in your server being removed without warning! English Only!</p>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors resize-none ${
            errors.description ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
          }`}
          rows={8}
          maxLength={5000}
          placeholder="Describe your server..."
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>{errors.description && <span className="text-red-400">{errors.description}</span>}</span>
          <span>{formData.description.length}/5000</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-gray mb-3">
          If you have a banner for your server, you can also upload it here
        </label>
        <p className="text-xs text-light-gray mb-3">
          Only JPEG, JPG, PNG or GIF formats are supported - Recommended size: 1092 x 140
        </p>
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
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Almost done!</h2>
        <p className="text-light-gray">Do you want to set up votifier?</p>
        <p className="text-sm text-light-gray mt-2">
          Votifier is optional, but will allow you to reward your players for voting. You can click skip if you wish to omit this for now.
        </p>
      </div>

      <div className="flex items-center space-x-3 mb-6">
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

      {formData.votifierEnabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-gray mb-3">Votifier Public Key:</label>
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

          <div>
            <label className="block text-sm font-medium text-light-gray mb-3">Votifier IP:</label>
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
            <label className="block text-sm font-medium text-light-gray mb-3">Votifier Port:</label>
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
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6 text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">That's it!</h2>
        <p className="text-light-gray">
          Your server is ready to be published! Just complete the captcha below and click Finish!
        </p>
        <p className="text-sm text-yellow-400 mt-4">
          All servers listed on MinecraftServerList need to be free to play. You may accept donations, 
          but requiring a payment to join or play is not allowed.
        </p>
      </div>

      <div className="bg-secondary-dark/60 border border-white/10 rounded-lg p-8">
        <div className="flex items-center justify-center space-x-3 text-light-gray">
          <AlertCircle className="w-6 h-6" />
          <span>Captcha verification will be implemented here</span>
        </div>
        <p className="text-sm text-light-gray mt-2">For now, captcha is disabled for testing</p>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="text-light-gray hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-white">Add Server</h3>
              <p className="text-sm text-light-gray">Step {currentStep} of 6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="w-full bg-secondary-dark rounded-full h-2">
            <div 
              className="bg-discord-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* General Error Display */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex justify-between">
            {currentStep === 5 && !formData.votifierEnabled ? (
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="flex-1 btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20"
                >
                  Skip
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 btn bg-discord-blue hover:bg-blue-600 text-white"
                >
                  Next
                </button>
              </div>
            ) : currentStep === 6 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full btn bg-grass-green hover:bg-green-600 text-white flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Server...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Finish</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="ml-auto btn bg-discord-blue hover:bg-blue-600 text-white flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
