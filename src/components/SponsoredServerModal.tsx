/**
 * Sponsored Server Modal Component
 * 
 * Modal for creating and editing sponsored server listings
 * with comprehensive form validation.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Star } from 'lucide-react';
import { SponsoredServerService } from '../services/sponsoredServerService';
import { useAuth } from '../hooks/useAuth';

// ==================== INTERFACES ====================

interface SponsoredServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
  onServerUpdated: () => void;
}

interface FormData {
  name: string;
  ip: string;
  java_port: string;
  bedrock_port: string;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  min_version: string;
  max_version: string;
  banner: File | null;
  target_url: string;
  display_order: string;
  is_active: boolean;
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

// ==================== COMPONENT ====================

export const SponsoredServerModal: React.FC<SponsoredServerModalProps> = ({
  isOpen,
  onClose,
  editingId,
  onServerUpdated
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ip: '',
    java_port: '25565',
    bedrock_port: '19132',
    platform: 'java',
    gamemode: '',
    min_version: '1.7',
    max_version: '1.21',
    banner: null,
    target_url: '',
    display_order: '0',
    is_active: true
  });
  
  const [errors, setErrors] = useState<any>({});
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isOpen) {
      if (editingId) {
        loadSponsoredServerData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingId]);

  // ==================== HANDLERS ====================

  const resetForm = () => {
    setFormData({
      name: '',
      ip: '',
      java_port: '25565',
      bedrock_port: '19132',
      platform: 'java',
      gamemode: '',
      min_version: '1.7',
      max_version: '1.21',
      banner: null,
      target_url: '',
      display_order: '0',
      is_active: true
    });
    setErrors({});
    setBannerPreview(null);
  };

  const loadSponsoredServerData = async () => {
    if (!editingId) return;
    
    try {
      setIsLoadingData(true);
      const servers = await SponsoredServerService.getAllSponsoredServers();
      const server = servers.find(s => s.id === editingId);
      
      if (server) {
        setFormData({
          name: server.name,
          ip: server.ip,
          java_port: server.java_port.toString(),
          bedrock_port: server.bedrock_port.toString(),
          platform: server.platform,
          gamemode: server.gamemode,
          min_version: server.min_version,
          max_version: server.max_version,
          banner: null,
          target_url: server.target_url || '',
          display_order: server.display_order.toString(),
          is_active: server.is_active
        });
        
        // Set banner preview if exists
        if (server.banner_url) {
          setBannerPreview(server.banner_url);
        }
      }
    } catch (error) {
      console.error('Error loading sponsored server data:', error);
      setErrors({ general: 'Failed to load server data' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
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
        setBannerPreview(base64Data);
        setFormData(prev => ({ ...prev, banner: file }));
      }
    };
    
    reader.onerror = () => {
      setErrors((prev: any) => ({ ...prev, banner: 'Failed to read the image file' }));
      setBannerPreview(null);
      setFormData(prev => ({ ...prev, banner: null }));
      e.target.value = '';
    };
    
    reader.readAsDataURL(file);
  };

  const generateDefaultBanner = (serverName: string, gamemode: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1092;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#5865F2');
    gradient.addColorStop(0.5, '#7289DA');
    gradient.addColorStop(1, '#5865F2');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add server name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(serverName, canvas.width / 2, 60);
    
    // Add gamemode
    ctx.font = '18px Inter, sans-serif';
    ctx.fillStyle = '#D0D0D0';
    ctx.fillText(gamemode.toUpperCase(), canvas.width / 2, 90);
    
    // Add decorative elements
    ctx.fillStyle = '#FFFFFF20';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas.toDataURL('image/png');
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'Server IP is required';
    }

    if (!formData.gamemode) {
      newErrors.gamemode = 'Gamemode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const serverData = {
        name: formData.name,
        ip: formData.ip,
        java_port: parseInt(formData.java_port) || 25565,
        bedrock_port: parseInt(formData.bedrock_port) || 19132,
        platform: formData.platform,
        gamemode: formData.gamemode,
        min_version: formData.min_version,
        max_version: formData.max_version,
        banner_url: bannerPreview || generateDefaultBanner(formData.name, formData.gamemode),
        target_url: formData.target_url,
        display_order: parseInt(formData.display_order) || 0,
        is_active: formData.is_active,
        created_by: user?.id
      };

      if (editingId) {
        await SponsoredServerService.updateSponsoredServer(editingId, serverData);
        alert('Sponsored server updated successfully!');
      } else {
        await SponsoredServerService.createSponsoredServer(serverData);
        alert('Sponsored server created successfully!');
      }
      
      onClose();
      onServerUpdated();
      
    } catch (error: any) {
      console.error('Error saving sponsored server:', error);
      setErrors({ 
        general: error.message || 'Failed to save sponsored server' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ==================== RENDER ====================

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-yellow-500/30 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-600/10 to-yellow-500/5">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
            <h2 className="text-2xl font-bold text-white">
              {editingId ? 'Edit Sponsored Server' : 'Add Sponsored Server'}
            </h2>
          </div>
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
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-light-gray">Loading server data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Error */}
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
                    Server Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-yellow-500/30 focus:border-yellow-500'
                    }`}
                    placeholder="Enter server name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Server IP */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Server IP *
                  </label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => handleInputChange('ip', e.target.value)}
                    className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.ip ? 'border-red-500 focus:border-red-500' : 'border-yellow-500/30 focus:border-yellow-500'
                    }`}
                    placeholder="play.example.com"
                  />
                  {errors.ip && <p className="text-red-400 text-sm mt-1">{errors.ip}</p>}
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white focus:border-yellow-500 focus:outline-none transition-colors"
                  >
                    <option value="java">Java Edition</option>
                    <option value="bedrock">Bedrock Edition</option>
                    <option value="crossplatform">Cross-Platform</option>
                  </select>
                </div>

                {/* Gamemode */}
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Gamemode *
                  </label>
                  <select
                    value={formData.gamemode}
                    onChange={(e) => handleInputChange('gamemode', e.target.value)}
                    className={`w-full px-4 py-3 bg-secondary-dark/60 border rounded-lg text-white focus:outline-none transition-colors ${
                      errors.gamemode ? 'border-red-500 focus:border-red-500' : 'border-yellow-500/30 focus:border-yellow-500'
                    }`}
                  >
                    <option value="">Select gamemode</option>
                    {gamemodes.map((mode) => (
                      <option key={mode} value={mode.toLowerCase()}>{mode}</option>
                    ))}
                  </select>
                  {errors.gamemode && <p className="text-red-400 text-sm mt-1">{errors.gamemode}</p>}
                </div>
              </div>

              {/* Ports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Java Port
                  </label>
                  <input
                    type="number"
                    value={formData.java_port}
                    onChange={(e) => handleInputChange('java_port', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white placeholder-light-gray focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="25565"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Bedrock Port
                  </label>
                  <input
                    type="number"
                    value={formData.bedrock_port}
                    onChange={(e) => handleInputChange('bedrock_port', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white placeholder-light-gray focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="19132"
                  />
                </div>
              </div>

              {/* Version Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Min Version
                  </label>
                  <select
                    value={formData.min_version}
                    onChange={(e) => handleInputChange('min_version', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white focus:border-yellow-500 focus:outline-none transition-colors"
                  >
                    {versions.map((version) => (
                      <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Max Version
                  </label>
                  <select
                    value={formData.max_version}
                    onChange={(e) => handleInputChange('max_version', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white focus:border-yellow-500 focus:outline-none transition-colors"
                  >
                    {versions.map((version) => (
                      <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Target URL (Where users go when clicking)
                </label>
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => handleInputChange('target_url', e.target.value)}
                  className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white placeholder-light-gray focus:border-yellow-500 focus:outline-none transition-colors"
                  placeholder="https://discord.gg/hypixel or https://hypixel.net"
                />
                <p className="text-xs text-light-gray mt-1">
                  Optional. Can be Discord invite, website, or any URL. Leave empty to disable clicking.
                </p>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Server Banner
                </label>
                <div className="border-2 border-dashed border-yellow-500/30 rounded-lg p-6 text-center hover:border-yellow-500/50 transition-colors">
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
                        <img src={bannerPreview} alt="Banner preview" className="max-w-full h-auto rounded-lg mx-auto max-h-32" />
                        <p className="text-sm text-yellow-400">Click to change banner</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 text-yellow-400 mx-auto" />
                        <p className="text-yellow-400">Click to upload banner</p>
                        <p className="text-xs text-light-gray">If no banner is uploaded, one will be generated automatically</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.banner && <p className="text-red-400 text-sm mt-1">{errors.banner}</p>}
                <p className="text-xs text-light-gray mt-1">
                  Optional. Recommended size: 1092 x 140 pixels
                </p>
              </div>

              {/* Display Order and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-light-gray mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleInputChange('display_order', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-dark/60 border border-yellow-500/30 rounded-lg text-white placeholder-light-gray focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-light-gray mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-8">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-5 h-5 text-yellow-500 bg-secondary-dark border-yellow-500/30 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <label htmlFor="is_active" className="text-sm text-light-gray">
                    Active (visible to users)
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-yellow-500/20 bg-gradient-to-r from-yellow-600/5 to-yellow-500/5">
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
              className="btn bg-yellow-600 hover:bg-yellow-700 text-white flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{editingId ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};