/**
 * Server Stats Component
 * 
 * Displays comprehensive server statistics and information
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React from 'react';
import { Users, Globe, Monitor, Smartphone, Zap, Flag, Clock, Tag, RefreshCw } from 'lucide-react';

// Helper function to get country code for flag API
const getCountryCode = (country: string): string => {
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
    'Panama': 'PA'
  };
  
  return countryToCode[country] || 'UN';
};

interface ServerStatsProps {
  server: {
    last_ping?: string | null;
    platform: string;
    gamemode: string;
    additional_gamemodes?: string;
    min_version?: string;
    max_version?: string;
    players_online?: number;
    players_max?: number;
    country?: string;
    uptime?: number;
    created_at?: string;
  };
}

export const ServerStats: React.FC<ServerStatsProps> = ({ server }) => {
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

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'java':
        return 'Java Server';
      case 'bedrock':
        return 'Bedrock / MCPE Server';
      case 'crossplatform':
        return 'Java Server, Bedrock / MCPE Server';
      default:
        return 'Java Server';
    }
  };

  const getAllGamemodes = () => {
    const gamemodes = [server.gamemode];
    if (server.additional_gamemodes) {
      gamemodes.push(...server.additional_gamemodes.split(',').map(g => g.trim()));
    }
    return gamemodes;
  };

  const getAllVersions = () => {
    const versions = ['1.7', '1.8', '1.9', '1.10', '1.11', '1.12', '1.13', '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21'];
    const minIndex = versions.indexOf(server.min_version || '1.7');
    const maxIndex = versions.indexOf(server.max_version || '1.21');
    
    if (minIndex !== -1 && maxIndex !== -1) {
      return versions.slice(minIndex, maxIndex + 1);
    }
    return versions;
  };

  const getConnectionSpeed = () => {
    // Check if server is actually online based on database data
    const hasRecentPing = server.last_ping !== null && server.last_ping !== undefined;
    
    // Check if last ping is recent (within 4 hours)
    let isPingRecent = false;
    if (hasRecentPing && server.last_ping) {
      const lastPingTime = new Date(server.last_ping).getTime();
      const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
      isPingRecent = lastPingTime >= fourHoursAgo;
    }
    
    const serverIsOnline = hasRecentPing && isPingRecent;
    
    if (!serverIsOnline) {
      return { label: 'Offline', color: 'text-red-400' };
    }
    
    // Mock connection speed based on uptime
    const uptime = server.uptime || 99;
    if (uptime >= 99) return { label: 'Fast', color: 'text-green-400' };
    if (uptime >= 95) return { label: 'Good', color: 'text-yellow-400' };
    return { label: 'Slow', color: 'text-red-400' };
  };

  const connection = getConnectionSpeed();

  const getLastCheckedInfo = () => {
    if (!server.last_ping) {
      return { label: 'Never', color: 'text-gray-400', time: null };
    }

    const lastPingTime = new Date(server.last_ping);
    const now = new Date();
    const diffMs = now.getTime() - lastPingTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeAgo = '';
    let color = 'text-green-400';

    if (diffMinutes < 1) {
      timeAgo = 'Just now';
      color = 'text-green-400';
    } else if (diffMinutes < 60) {
      timeAgo = `${diffMinutes}m ago`;
      color = 'text-green-400';
    } else if (diffHours < 24) {
      timeAgo = `${diffHours}h ago`;
      color = diffHours < 2 ? 'text-green-400' : 'text-yellow-400';
    } else {
      timeAgo = `${diffDays}d ago`;
      color = 'text-red-400';
    }

    return {
      label: timeAgo,
      color,
      time: lastPingTime.toLocaleString()
    };
  };

  const lastChecked = getLastCheckedInfo();

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-discord-blue" />
        <h3 className="text-xl font-bold text-white">Server Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Server Type */}
        <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            {getPlatformIcon(server.platform)}
            <h4 className="font-bold text-white text-sm">Server Type</h4>
          </div>
          <p className="text-light-gray text-sm">{getPlatformLabel(server.platform)}</p>
        </div>

        {/* Connection */}
        <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-discord-blue" />
            <h4 className="font-bold text-white text-sm">Connection</h4>
          </div>
          <span className={`font-bold text-sm ${connection.color}`}>{connection.label}</span>
        </div>

        {/* Country */}
        <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-discord-blue" />
            <h4 className="font-bold text-white text-sm">Country</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-light-gray text-sm">{server.country || 'Worldwide'}</span>
            {(server.country === 'Worldwide') ? (
              <div className="flex items-center justify-center h-5 px-2 py-1 bg-discord-blue/20 rounded-md border border-discord-blue/30">
                <span className="text-base">🌍</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-5 px-2 py-1 bg-discord-blue/20 rounded-md border border-discord-blue/30">
                <img
                  src={`https://flagsapi.com/${getCountryCode(server.country || 'Worldwide')}/flat/24.png`}
                  alt={`${server.country} flag`}
                  className="w-5 h-3 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Last Checked */}
        <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-discord-blue" />
            <h4 className="font-bold text-white text-sm">Last Checked</h4>
          </div>
          <div className={`text-sm font-bold ${lastChecked.color}`}>
            {lastChecked.label}
          </div>
          {lastChecked.time && (
            <div className="text-xs text-light-gray mt-1" title={lastChecked.time}>
              {lastChecked.time}
            </div>
          )}
        </div>
      </div>

      {/* Versions Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-discord-blue" />
          <h4 className="font-bold text-white">Versions</h4>
        </div>
        <div className="flex flex-wrap gap-1">
          {getAllVersions().map((version, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-secondary-dark/60 text-light-gray rounded border border-white/10"
            >
              {version}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Gamemodes Section */}
      {server.additional_gamemodes && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-discord-blue" />
            <h4 className="font-bold text-white">Additional Gamemodes</h4>
          </div>
          <p className="text-light-gray">{server.additional_gamemodes}</p>
        </div>
      )}

      {/* Server Added Date */}
      {server.created_at && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-light-gray" />
            <span className="text-light-gray text-sm">
              Added on {new Date(server.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
