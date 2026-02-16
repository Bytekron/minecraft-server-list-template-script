/**
 * Server List Component
 * 
 * Displays filtered list of Minecraft servers with banners,
 * player counts, and server information.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Wifi, WifiOff, Globe, Monitor, Smartphone } from 'lucide-react';
import { ServerService } from '../services/serverService';
import { SponsoredServers } from './SponsoredServers';
import { ServerMonitoringService } from '../services/serverMonitoringService';
import { AnalyticsService } from '../services/analyticsService';

// ==================== INTERFACES ====================

interface ServerListProps {
  selectedGamemode: string;
  selectedVersion: string;
  selectedPlatform: string;
  searchQuery: string;
  selectedCountry?: string;
  sortBy?: string;
  hasWhitelist?: boolean;
  onServerClick?: (slug: string) => void;
  showHeader?: boolean;
  onCountryChange?: (country: string) => void;
  onSortChange?: (sort: string) => void;
  onGamemodeChange?: (gamemode: string) => void;
  onVersionChange?: (version: string) => void;
  onPlatformChange?: (platform: string) => void;
  onSearchChange?: (search: string) => void;
  showServerCount?: boolean;
}

interface MinecraftServer {
  id: string;
  slug: string;
  rank: number;
  name: string;
  ip: string;
  description: string;
  gamemode: string;
  minVersion: string;
  maxVersion: string;
  platform: 'java' | 'bedrock' | 'crossplatform';
  country: string;
  hasWhitelist: boolean;
  created_at?: string;
  players: {
    online: number;
    max: number;
  };
  status: 'online' | 'offline';
  isOnline: boolean;
  banner: string;
  featured: boolean;
  votes: number;
  uptime: number;
}

// ==================== COMPONENT ====================

// Helper function to get country flag
const getCountryFlag = (country: string): { type: 'emoji' | 'image'; value: string } | null => {
  // Use emoji for Worldwide
  if (country === 'Worldwide') {
    return { type: 'emoji', value: '🌍' };
  }
  
  // Use flag API for all other countries  
  const countryToCode: Record<string, string> = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Germany': 'DE',
    'Netherlands': 'NL',
    'Australia': 'AU',
    'Finland': 'FI',
    'France': 'FR',
    'Spain': 'ES',
    'Czech Republic': 'CZ',
    'Turkey': 'TR',
    'Brazil': 'BR',
    'Lithuania': 'LT',
    'Vietnam': 'VN',
    'Israel': 'IL',
    'Bulgaria': 'BG',
    'Sweden': 'SE',
    'Portugal': 'PT',
    'Argentina': 'AR',
    'Poland': 'PL',
    'South Africa': 'ZA',
    'Italy': 'IT',
    'Peru': 'PE',
    'Malaysia': 'MY',
    'Slovakia': 'SK',
    'Ukraine': 'UA',
    'Slovenia': 'SI',
    'Latvia': 'LV',
    'Sri Lanka': 'LK',
    'Belgium': 'BE',
    'Ireland': 'IE',
    'India': 'IN',
    'Russia': 'RU',
    'New Zealand': 'NZ',
    'Singapore': 'SG',
    'Croatia': 'HR',
    'Romania': 'RO',
    'Denmark': 'DK',
    'Cambodia': 'KH',
    'Philippines': 'PH',
    'Uruguay': 'UY',
    'Indonesia': 'ID',
    'Hungary': 'HU',
    'Iran': 'IR',
    'Namibia': 'NA',
    'Japan': 'JP',
    'Pakistan': 'PK',
    'Greece': 'GR',
    'Brunei': 'BN',
    'Mexico': 'MX',
    'Serbia': 'RS',
    'Bangladesh': 'BD',
    'Chile': 'CL',
    'China': 'CN',
    'Thailand': 'TH',
    'Georgia': 'GE',
    'Taiwan': 'TW',
    'Norway': 'NO',
    'Ecuador': 'EC',
    'Colombia': 'CO',
    'Anguilla': 'AI',
    'Egypt': 'EG',
    'Saudi Arabia': 'SA',
    'Bahrain': 'BH',
    'El Salvador': 'SV',
    'Austria': 'AT',
    'Venezuela': 'VE',
    'United Arab Emirates': 'AE',
    'Lebanon': 'LB',
    'Malta': 'MT',
    'Nepal': 'NP',
    'South Korea': 'KR',
    'Algeria': 'DZ',
    'Bolivia': 'BO',
    'Bosnia and Herzegovina': 'BA',
    'Belarus': 'BY',
    'Cyprus': 'CY',
    'Switzerland': 'CH',
    'Iraq': 'IQ',
    'Qatar': 'QA',
    'Estonia': 'EE',
    'Cuba': 'CU',
    'Jordan': 'JO',
    'Puerto Rico': 'PR',
    'Morocco': 'MA',
    'Uzbekistan': 'UZ',
    'Tunisia': 'TN',
    'Hong Kong SAR China': 'HK',
    'Panama': 'PA',
    'Worldwide': 'UN'
  };

  const countryCode = countryToCode[country];
  if (!countryCode) {
    return null;
  }

  return { type: 'image', value: `https://flagsapi.com/${countryCode}/flat/24.png` };
};

// Helper function to get country flag emoji (only for Worldwide)
const getCountryFlagEmoji = (country: string): string | null => {
  const flagData = getCountryFlag(country);
  if (flagData && flagData.type === 'emoji') {
    return flagData.value;
  }
  return null;
};

// Helper function to generate fallback banner
const generateFallbackBanner = (serverName: string, gamemode: string): string => {
  // Clean server name for SVG (remove special characters that could break XML)
  const cleanName = serverName.replace(/[<>&"']/g, '').substring(0, 30);
  
  // Get gamemode-specific colors
  const getGamemodeColor = (mode: string): string => {
    switch (mode.toLowerCase()) {
      case 'survival': return '22C55E'; // Green
      case 'pvp': return 'EF4444'; // Red
      case 'creative': return '3B82F6'; // Blue
      case 'skyblock': return '06B6D4'; // Cyan
      case 'prison': return 'F97316'; // Orange
      case 'factions': return '8B5CF6'; // Purple
      case 'towny': return 'F59E0B'; // Amber
      case 'minigames': return 'EC4899'; // Pink
      case 'economy': return '10B981'; // Emerald
      case 'vanilla': return '6B7280'; // Gray
      case 'anarchy': return 'DC2626'; // Dark Red
      default: return '5865F2'; // Discord Blue
    }
  };
  
  const primaryColor = getGamemodeColor(gamemode);
  const secondaryColor = getGamemodeColor(gamemode) + '80'; // Add transparency
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="468" height="60" viewBox="0 0 468 60">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#${secondaryColor};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="468" height="60" fill="url(#bg)" />
      <text x="234" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${cleanName}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const getServerStatus = (server: any) => {
  // Check if server has recent ping data (within last 4 hours)
  if (!server.last_ping) {
    return false;
  }
  
  const lastPingTime = new Date(server.last_ping).getTime();
  const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
  
  return lastPingTime >= fourHoursAgo;
};

export const ServerList: React.FC<ServerListProps> = ({
  selectedGamemode,
  selectedVersion,
  selectedPlatform,
  searchQuery,
  selectedCountry = 'all',
  sortBy = 'votes',
  hasWhitelist,
  onServerClick,
  showHeader,
  onCountryChange,
  onSortChange,
  onGamemodeChange,
  onVersionChange,
  onPlatformChange,
  onSearchChange,
  showServerCount = false
}) => {
  const [servers, setServers] = useState<MinecraftServer[]>([]);
  const [copiedIP, setCopiedIP] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to determine if server is actually online
  const isServerOnline = (server: any) => {
    if (!server.last_ping) return false;
    
    // Check if last ping is recent (within 2 hours)
    const lastPingTime = new Date(server.last_ping).getTime();
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const isPingRecent = lastPingTime >= twoHoursAgo;
    
    // Check for fake domains
    const isFakeDomain = /\.(test|fake|example|localhost|invalid)$/i.test(server.ip) || 
                        server.ip.includes('test') || 
                        server.ip.includes('fake') ||
                        server.ip.includes('example');
    
    // Additional validation: server must have valid player data
    const hasValidData = (server.players_online !== null && server.players_online !== undefined) || 
                        (server.players_max !== null && server.players_max !== undefined && server.players_max > 0);
    
    return isPingRecent && hasValidData && !isFakeDomain;
  };

  // Reset currentPage to 1 when any filter changes (common UX pattern)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGamemode, selectedVersion, selectedPlatform, searchQuery, selectedCountry, sortBy, hasWhitelist]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const [serverIcons, setServerIcons] = useState<Record<string, string>>({});
  const serversPerPage = 10;

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadServers();
  }, []);

  // ==================== HANDLERS ====================

  const loadServers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is configured - but allow viewing with placeholder data
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase not configured - showing demo data');
        
        // Show demo servers when Supabase is not configured
        const demoServers = [
          {
            id: 'demo-1',
            slug: 'demo-survival-server',
            name: 'Epic Survival Server',
            ip: 'play.epicsurvival.net',
            description: 'Join our amazing survival server with custom plugins, friendly community, and regular events. Build your dream base and explore our custom world!',
            gamemode: 'survival',
            min_version: '1.20',
            max_version: '1.21',
            platform: 'java' as const,
            country: 'United States',
            has_whitelist: false,
            created_at: new Date().toISOString(),
            last_ping: new Date().toISOString(),
            players_online: 45,
            players_max: 100,
            uptime: 99.5,
            banner_url: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=468&h=60&fit=crop',
            featured: true,
            votes: 1250
          },
          {
            id: 'demo-2',
            slug: 'demo-pvp-server',
            name: 'PvP Arena Masters',
            ip: 'pvp.arena.net',
            description: 'Intense PvP battles await! Join our competitive server with custom arenas, tournaments, and ranking systems. Prove your skills!',
            gamemode: 'pvp',
            min_version: '1.19',
            max_version: '1.21',
            platform: 'crossplatform' as const,
            country: 'Germany',
            has_whitelist: false,
            created_at: new Date().toISOString(),
            last_ping: new Date().toISOString(),
            players_online: 78,
            players_max: 150,
            uptime: 98.2,
            banner_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=468&h=60&fit=crop',
            featured: false,
            votes: 890
          },
          {
            id: 'demo-3',
            slug: 'demo-skyblock-server',
            name: 'SkyBlock Paradise',
            ip: 'skyblock.paradise.com',
            description: 'Start your island adventure! Custom challenges, economy system, and amazing rewards. Build the ultimate skyblock empire!',
            gamemode: 'skyblock',
            min_version: '1.18',
            max_version: '1.21',
            platform: 'java' as const,
            country: 'Canada',
            has_whitelist: false,
            created_at: new Date().toISOString(),
            last_ping: null,
            players_online: null,
            players_max: null,
            uptime: 95.8,
            banner_url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=468&h=60&fit=crop',
            featured: false,
            votes: 567
          }
        ];
        
        // Transform demo servers to component format
        const transformedServers = demoServers.map((server, index) => {
          const hasValidPing = server.last_ping !== null;
          const hasValidPlayerData = server.players_online !== null;
          const isActuallyOnline = hasValidPing && hasValidPlayerData;
          
          return {
            id: server.id,
            slug: server.slug,
            rank: index + 1,
            name: server.name,
            ip: server.ip,
            description: server.description,
            gamemode: server.gamemode,
            minVersion: server.min_version,
            maxVersion: server.max_version,
            platform: server.platform,
            country: server.country,
            hasWhitelist: server.has_whitelist,
            created_at: server.created_at,
            isOnline: isActuallyOnline,
            players: {
              online: isActuallyOnline ? (server.players_online || 0) : 0,
              max: isActuallyOnline ? (server.players_max || 100) : 0
            },
            banner: server.banner_url,
            featured: server.featured,
            votes: server.votes,
            uptime: server.uptime,
            status: isActuallyOnline ? 'online' as const : 'offline' as const
          };
        });
        
        setServers(transformedServers);
        return;
      }
      
      const result = await ServerService.getServers({
        page: currentPage,
        limit: serversPerPage
      });
      
      // Process servers with mock data if needed
      const processedServers = result.servers.length > 0 ? result.servers.map((server, index) => {
        // Debug logging to see actual database values
        console.log(`Server ${server.name} (${server.ip}):`, {
          last_ping: server.last_ping,
          players_online: server.players_online,
          players_max: server.players_max,
          uptime: server.uptime,
          raw_last_ping_type: typeof server.last_ping,
          raw_players_online_type: typeof server.players_online
        });
        
        // More robust offline detection
        // A server is online if:
        // 1. last_ping exists (server was successfully contacted recently)
        // 2. players_online is not null (server responded with player data)
        const hasValidPing = server.last_ping !== null && server.last_ping !== undefined;
        const hasValidPlayerData = server.players_online !== null && server.players_online !== undefined;
        const isActuallyOnline = hasValidPing && hasValidPlayerData;
        
        console.log(`${server.name} status calculation:`, {
          last_ping: server.last_ping,
          players_online: server.players_online,
          players_max: server.players_max,
          hasValidPing,
          hasValidPlayerData,
          isActuallyOnline,
          will_show_status: isActuallyOnline ? 'Online' : 'Offline',
          will_show_players: isActuallyOnline ? `${server.players_online}/${server.players_max}` : '0/0',
          database_values: {
            last_ping: server.last_ping,
            players_online: server.players_online,
            players_max: server.players_max
          }
        });
        
        return {
          id: server.id, // Keep as string UUID
          slug: server.slug || server.id, // Use ID as fallback if slug is null/undefined
          rank: index + 1,
          name: server.name,
          ip: server.ip,
          description: server.description,
          gamemode: server.gamemode,
          minVersion: server.min_version,
          maxVersion: server.max_version,
          platform: server.platform as 'java' | 'bedrock' | 'crossplatform',
          country: server.country,
          hasWhitelist: server.has_whitelist,
          created_at: server.created_at,
          // Use the calculated online status
          isOnline: isActuallyOnline,
          players: {
            online: isActuallyOnline ? (server.players_online || 0) : 0,
            max: isActuallyOnline ? (server.players_max || 100) : 0
          },
          banner: server.banner_url || generateFallbackBanner(server.name, server.gamemode),
          featured: server.featured,
          votes: server.votes,
          uptime: server.uptime,
          status: isActuallyOnline ? 'online' as const : 'offline' as const
        };
      }) : [];
      
      setServers(processedServers);
      
      // Load server icons
      await loadServerIcons(result.servers);
    } catch (err) {
      console.error('Error loading servers:', err);
      setError('Failed to load servers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadServerIcons = async (servers: any[]) => {
    const icons: Record<string, string> = {};
    
    // Only load icons once per component mount
    if (Object.keys(serverIcons).length > 0) {
      return;
    }
    
    for (const server of servers) {
      try {
        const iconData = await ServerMonitoringService.getServerIcon(server.id);
        if (iconData) {
          icons[server.id] = iconData;
        }
      } catch (error) {
        console.error(`Error loading icon for server ${server.id}:`, error);
      }
    }
    
    setServerIcons(icons);
  };

  // Filter servers based on selected criteria
  const filteredServers = servers.filter(server => {
    const matchesGamemode = selectedGamemode === 'all' || server.gamemode === selectedGamemode;
    
    // Version filtering - check if selected version is within server's supported range
    let matchesVersion = selectedVersion === 'all';
    if (!matchesVersion && selectedVersion !== 'all') {
      // Define version order for comparison
      const versionOrder = [
        '1.7', '1.8', '1.9', '1.10', '1.11', '1.12', '1.13', 
        '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21'
      ];
      
      const selectedVersionIndex = versionOrder.indexOf(selectedVersion);
      const minVersionIndex = versionOrder.indexOf(server.minVersion);
      const maxVersionIndex = versionOrder.indexOf(server.maxVersion);
      
      // Check if selected version is within the server's supported range
      if (selectedVersionIndex !== -1 && minVersionIndex !== -1 && maxVersionIndex !== -1) {
        matchesVersion = selectedVersionIndex >= minVersionIndex && selectedVersionIndex <= maxVersionIndex;
      }
    }
    
    let matchesPlatform = selectedPlatform === 'all' || server.platform === selectedPlatform;
    
    // Special handling for bedrock_and_crossplatform filter
    if (selectedPlatform === 'bedrock_and_crossplatform') {
      matchesPlatform = server.platform === 'bedrock' || server.platform === 'crossplatform';
    } else if (selectedPlatform === 'bedrock') {
      // Include both bedrock and crossplatform servers for bedrock filter
      matchesPlatform = server.platform === 'bedrock' || server.platform === 'crossplatform';
    }
    
    const matchesCountry = selectedCountry === 'all' || server.country === selectedCountry;
    
    const matchesWhitelist = hasWhitelist === undefined || server.hasWhitelist === hasWhitelist;
    
    const matchesSearch = searchQuery === '' || 
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.ip.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesGamemode && matchesVersion && matchesPlatform && matchesCountry && matchesWhitelist && matchesSearch;
  });

  // Pagination
  // Sort filtered servers
  const sortedServers = [...filteredServers].sort((a, b) => {
    switch (sortBy) {
      case 'players':
        return b.players.online - a.players.online;
      case 'votes':
        return b.votes - a.votes;
      case 'latest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      default:
        return b.votes - a.votes; // Default to votes
    }
  });
  
  // Add ranking based on sorted order
  const rankedServers = sortedServers.map((server, index) => ({
    ...server,
    rank: index + 1
  }));
  
  const totalPages = Math.ceil(filteredServers.length / serversPerPage);
  const startIndex = (currentPage - 1) * serversPerPage;
  const paginatedServers = rankedServers.slice(startIndex, startIndex + serversPerPage);

  // Clamp currentPage when totalPages changes to prevent out-of-sync issues
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Copy IP to clipboard
  const copyIP = async (ip: string) => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopiedIP(ip);
      setTimeout(() => setCopiedIP(null), 2000);
    } catch (err) {
      console.error('Failed to copy IP:', err);
    }
  };

  // Track server impression when servers are loaded
  useEffect(() => {
    if (paginatedServers.length > 0) {
      // Track impressions for visible servers
      paginatedServers.forEach(server => {
        AnalyticsService.trackImpression(server.id);
      });
    }
  }, [paginatedServers]);
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'java':
        return <Monitor className="w-4 h-4" />;
      case 'bedrock':
        return <Smartphone className="w-4 h-4" />;
      case 'crossplatform':
        return <Globe className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  // Get platform label
  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'java':
        return 'Java Edition';
      case 'bedrock':
        return 'Bedrock Edition';
      case 'crossplatform':
        return 'Cross Platform';
      default:
        return 'Java Edition';
    }
  };

  // Helper function to generate page range for pagination
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 4; i++) {
          range.push(i);
        }
        range.push('...');
        range.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        range.push(1);
        range.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        // Show middle pages
        range.push(1);
        range.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          range.push(i);
        }
        range.push('...');
        range.push(totalPages);
      }
    }
    
    return range;
  };

  return (
    <section className="py-8 bg-primary-dark min-h-screen">
      <div className="container mx-auto px-1 sm:px-6 max-w-6xl">
        
        {/* Hero Header */}
        {showHeader && (
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-white tracking-wider uppercase">
            MINECRAFT SERVER LIST
          </h1>
          <div className="w-16 h-1 bg-discord-blue mx-auto mb-4"></div>
          <p className="text-lg text-light-gray max-w-2xl mx-auto">
            Discover the best Minecraft servers! Browse thousands of servers by gamemode, version, and platform.
          </p>
        </div>
        )}
        
        {/* Sponsored Servers Section */}
        <SponsoredServers />

        {/* Results Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white mb-2 sm:mb-0">
              Minecraft Servers ({filteredServers.length})
            </h2>
            
            {/* Filters - Only show on homepage */}
            {showHeader && (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Country Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-light-gray whitespace-nowrap">Country:</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => onCountryChange?.(e.target.value)}
                    className="px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none text-sm"
                  >
                    <option value="all">All Countries</option>
                    <option value="Worldwide">Worldwide</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Australia">Australia</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Israel">Israel</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Poland">Poland</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Italy">Italy</option>
                    <option value="Peru">Peru</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Ireland">Ireland</option>
                    <option value="India">India</option>
                    <option value="Russia">Russia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Romania">Romania</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iran">Iran</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Japan">Japan</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Greece">Greece</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Serbia">Serbia</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Norway">Norway</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Anguilla">Anguilla</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Austria">Austria</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Union of Soviet Socialist Republics">Union of Soviet Socialist Republics</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Malta">Malta</option>
                    <option value="Nepal">Nepal</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                    <option value="Belarus">Belarus</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Qatar">Qatar</option>
                    <option value="U.S. Virgin Islands">U.S. Virgin Islands</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Turks and Caicos Islands">Turks and Caicos Islands</option>
                    <option value="Puerto Rico">Puerto Rico</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="U.S. Minor Outlying Islands">U.S. Minor Outlying Islands</option>
                    <option value="Hong Kong SAR China">Hong Kong SAR China</option>
                    <option value="Panama">Panama</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-light-gray whitespace-nowrap">Order by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange?.(e.target.value)}
                    className="px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none text-sm"
                  >
                    <option value="votes">Votes</option>
                    <option value="players">Players</option>
                    <option value="latest">Latest</option>
                  </select>
                </div>
              </div>
            )}
            
            {!loading && filteredServers.length > 0 && showServerCount && (
              <div className="text-sm text-light-gray">
                Showing {startIndex + 1}-{Math.min(startIndex + serversPerPage, filteredServers.length)} of {filteredServers.length} servers
              </div>
            )}
          </div>
          
          {/* Active Filters */}
          {(selectedGamemode !== 'all' || selectedVersion !== 'all' || selectedPlatform !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedGamemode !== 'all' && (
                <span className="px-3 py-1 bg-discord-blue/20 text-discord-blue rounded-full text-sm flex items-center space-x-2 group">
                  <span>{selectedGamemode.charAt(0).toUpperCase() + selectedGamemode.slice(1)}</span>
                  <button
                    onClick={() => onGamemodeChange?.('all')}
                    className="w-4 h-4 rounded-full bg-discord-blue/30 hover:bg-discord-blue/50 flex items-center justify-center transition-colors"
                    aria-label="Remove gamemode filter"
                  >
                    <span className="text-xs text-white">×</span>
                  </button>
                </span>
              )}
              {selectedVersion !== 'all' && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center space-x-2 group">
                  <span>Version {selectedVersion}</span>
                  <button
                    onClick={() => onVersionChange?.('all')}
                    className="w-4 h-4 rounded-full bg-green-500/30 hover:bg-green-500/50 flex items-center justify-center transition-colors"
                    aria-label="Remove version filter"
                  >
                    <span className="text-xs text-white">×</span>
                  </button>
                </span>
              )}
              {selectedPlatform !== 'all' && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center space-x-2 group">
                  <span>{getPlatformLabel(selectedPlatform)}</span>
                  <button
                    onClick={() => onPlatformChange?.('all')}
                    className="w-4 h-4 rounded-full bg-purple-500/30 hover:bg-purple-500/50 flex items-center justify-center transition-colors"
                    aria-label="Remove platform filter"
                  >
                    <span className="text-xs text-white">×</span>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center space-x-2 group">
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => onSearchChange?.('')}
                    className="w-4 h-4 rounded-full bg-yellow-500/30 hover:bg-yellow-500/50 flex items-center justify-center transition-colors"
                    aria-label="Remove search filter"
                  >
                    <span className="text-xs text-white">×</span>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Server List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-light-gray">Loading servers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Servers</h3>
            <p className="text-light-gray mb-4">{error}</p>
            <button
              onClick={loadServers}
              className="btn bg-discord-blue hover:bg-blue-600 text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedServers.length > 0 ? (
            paginatedServers.map((server, index) => (
              <div key={server.id} className="glass rounded-xl overflow-hidden border border-white/10 bg-secondary-dark/40 hover:bg-secondary-dark/60 transition-all duration-300 hover:border-discord-blue/30" itemScope itemType="https://schema.org/Product">
                
                {/* Server Banner and Info */}
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start space-x-3 lg:flex-row lg:items-start lg:space-x-3 lg:space-y-0">
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black ${
                          server.rank === 1 ? 'bg-yellow-500 text-primary-dark' :
                          server.rank === 2 ? 'bg-gray-400 text-primary-dark' :
                          server.rank === 3 ? 'bg-orange-500 text-primary-dark' :
                          'bg-discord-blue text-white'
                        }`}>
                          {server.rank}
                        </div>
                        
                        {/* Server Icon with Flag Above (Desktop) */}
                        <div className="hidden lg:flex lg:flex-col lg:items-center lg:space-y-1">
                          {/* Country Flag - Desktop (Above Icon) */}
                          {getCountryFlag(server.country) && (
                            <div className="flex items-center justify-center h-6 px-2 py-1 bg-discord-blue/20 rounded-md border border-discord-blue/30">
                              {getCountryFlag(server.country)!.type === 'emoji' ? (
                                <span className="text-lg">
                                  {getCountryFlag(server.country)!.value}
                                </span>
                              ) : (
                                <img
                                  src={getCountryFlag(server.country)!.value}
                                  alt={`${server.country} flag`}
                                  className="w-6 h-4 object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Server Icon */}
                          <div 
                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => onServerClick?.(server.slug)}
                          >
                            {serverIcons[server.id] ? (
                              <img
                                src={`data:image/png;base64,${serverIcons[server.id]}`}
                                alt={`${server.name} icon`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(`Failed to load icon for ${server.name}`);
                                  // Remove the problematic icon from state to show fallback
                                  setServerIcons(prev => {
                                    const updated = { ...prev };
                                    delete updated[server.id];
                                    return updated;
                                  });
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary-dark/60 flex items-center justify-center">
                                <span className="text-light-gray text-2xl">🎮</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Server Icon Only (Mobile) */}
                        <div 
                          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform lg:hidden"
                          onClick={() => onServerClick?.(server.slug)}
                        >
                          {serverIcons[server.id] ? (
                            <img
                              src={`data:image/png;base64,${serverIcons[server.id]}`}
                              alt={`${server.name} icon`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error(`Failed to load icon for ${server.name}`);
                                // Remove the problematic icon from state to show fallback
                                setServerIcons(prev => {
                                  const updated = { ...prev };
                                  delete updated[server.id];
                                  return updated;
                                });
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary-dark/60 flex items-center justify-center">
                              <span className="text-light-gray text-2xl">🎮</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Status Info - Mobile (Top Right) */}
                        <div className="flex flex-col items-end space-y-1 lg:hidden ml-auto">
                          {/* Status */}
                          <div className="flex items-center space-x-1">
                            {server.isOnline ? (
                              <>
                                <Wifi className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 text-xs font-semibold">Online</span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-3 h-3 text-red-400" />
                                <span className="text-red-400 text-xs font-semibold">Offline</span>
                              </>
                            )}
                          </div>

                          {/* Player Count */}
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-discord-blue" />
                            <span className="text-white font-semibold text-xs">
                              {server.isOnline ? 
                                `${server.players.online.toLocaleString()}/${server.players.max.toLocaleString()}` : 
                                '0/0'
                              }
                            </span>
                          </div>

                          {/* Uptime */}
                          <div className="text-light-gray text-xs">
                            {server.uptime}% uptime
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Server Banner */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-full max-w-[calc(100vw-0.75rem)] sm:max-w-[468px] lg:w-[468px] bg-secondary-dark rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform" 
                        style={{ aspectRatio: '7.8' }}
                        onClick={() => onServerClick?.(server.slug)}
                      >
                        <img
                          src={server.banner}
                          alt={`${server.name} banner`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Generate a fallback banner with proper encoding
                            const safeName = server.name.replace(/[<>&"']/g, '');
                            const color = server.gamemode === 'prison' ? 'FF6B35' : 
                                         server.gamemode === 'survival' ? '4CAF50' :
                                         server.gamemode === 'pvp' ? 'F44336' :
                                         server.gamemode === 'creative' ? '2196F3' :
                                         server.gamemode === 'skyblock' ? '00BCD4' :
                                         '5865F2';
                            
                            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="468" height="60" viewBox="0 0 468 60">
                              <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" style="stop-color:#${color};stop-opacity:1" />
                                  <stop offset="100%" style="stop-color:#${color}88;stop-opacity:1" />
                                </linearGradient>
                              </defs>
                              <rect width="468" height="60" fill="url(#grad)"/>
                              <text x="234" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${safeName}</text>
                            </svg>`;
                            
                            target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
                          }}
                        />
                      </div>
                      
                      {/* Server IP Box - Directly under banner */}
                      <div className="mt-2">
                        <div className="glass rounded-lg p-2 border border-white/10 bg-secondary-dark/40">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-light-gray text-xs font-medium">Server IP:</span>
                              <code className="bg-primary-dark/60 px-2 py-1 rounded text-discord-blue font-mono text-xs border border-white/10">
                                {server.ip}
                              </code>
                            </div>
                            <button
                              onClick={async () => {
                                await copyIP(server.ip);
                                await AnalyticsService.trackIPCopy(server.id, 'java');
                              }}
                              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                                copiedIP === server.ip
                                  ? 'bg-green-600 text-white'
                                  : 'bg-discord-blue hover:bg-blue-600 text-white hover:scale-105'
                              }`}
                            >
                              {copiedIP === server.ip ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy IP</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Server Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        
                        {/* Left Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Country Flag - Mobile (Next to Server Name) */}
                            <div className="lg:hidden">
                              {getCountryFlag(server.country) && (
                                <div className="flex items-center justify-center h-6 px-2 py-1 bg-discord-blue/20 rounded-md border border-discord-blue/30 mr-2">
                                  {getCountryFlag(server.country)!.type === 'emoji' ? (
                                    <span className="text-lg">
                                      {getCountryFlag(server.country)!.value}
                                    </span>
                                  ) : (
                                    <img
                                      src={getCountryFlag(server.country)!.value}
                                      alt={`${server.country} flag`}
                                      className="w-6 h-4 object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <h3 
                              className="text-xl font-bold text-white truncate cursor-pointer hover:text-discord-blue transition-colors"
                              onClick={() => onServerClick?.(server.slug)}
                              itemProp="name"
                            >
                              {server.name}
                            </h3>
                            {server.featured && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                                FEATURED
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <div className="flex items-center space-x-1 text-sm">
                              {getPlatformIcon(server.platform)}
                              <span className="text-light-gray">{getPlatformLabel(server.platform)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-light-gray">
                              <span>Version {server.minVersion === server.maxVersion ? server.maxVersion : `${server.minVersion} - ${server.maxVersion}`}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${server.gamemode === 'survival' ? 'bg-green-500/20 text-green-400' : server.gamemode === 'pvp' ? 'bg-red-500/20 text-red-400' : server.gamemode === 'creative' ? 'bg-blue-500/20 text-blue-400' : server.gamemode === 'skyblock' ? 'bg-cyan-500/20 text-cyan-400' : server.gamemode === 'prison' ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                {server.gamemode.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-light-gray text-sm leading-relaxed line-clamp-3" itemProp="description">
                            {server.description}
                          </p>
                          
                          {/* Hidden structured data */}
                          <div style={{ display: 'none' }}>
                            <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
                              <meta itemProp="price" content="0" />
                              <meta itemProp="priceCurrency" content="USD" />
                            </span>
                            <span itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                              <meta itemProp="ratingValue" content={Math.min(5, Math.max(3.5, (server.votes / 50) + 3.5)).toString()} />
                              <meta itemProp="ratingCount" content={Math.max(1, server.votes).toString()} />
                            </span>
                          </div>
                        </div>

                        {/* Right Info */}
                        <div className="flex-shrink-0 hidden lg:block">
                          <div className="flex flex-col items-end space-y-2">
                            
                            {/* Status */}
                            <div className="flex items-center space-x-2">
                              {server.isOnline ? (
                                <>
                                  <Wifi className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm font-semibold">Online</span>
                                </>
                              ) : (
                                <>
                                  <WifiOff className="w-4 h-4 text-red-400" />
                                  <span className="text-red-400 text-sm font-semibold">Offline</span>
                                </>
                              )}
                            </div>
                            
                            {/* Player Count */}
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-discord-blue" />
                              <span className="text-white font-semibold">
                                {server.isOnline ? 
                                  `${server.players.online.toLocaleString()}/${server.players.max.toLocaleString()}` : 
                                  '0/0'
                                }
                              </span>
                            </div>

                            {/* Uptime */}
                            <div className="text-light-gray text-sm">
                              {server.uptime}% uptime
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
            ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">No servers yet</h3>
              <p className="text-light-gray">Be the first to add a server to the list!</p>
            </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {getPageRange().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-3 py-2 text-white/70">
                      …
                    </span>
                  );
                }
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === p
                        ? 'bg-discord-blue text-white font-bold'
                        : 'bg-secondary-dark/60 border border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};