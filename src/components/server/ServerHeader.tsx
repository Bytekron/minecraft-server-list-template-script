/**
 * Server Header Component
 * 
 * Displays server name, status, basic info, and action buttons
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { Copy, Check, Vote, Star, MessageSquare, Wifi, WifiOff, Users, BarChart3 } from 'lucide-react';
import { ServerMonitoringService } from '../../services/serverMonitoringService';
import { AnalyticsService } from '../../services/analyticsService';

interface ServerHeaderProps {
  server: {
    id: string;
    name: string;
    ip: string;
    java_port?: number;
    bedrock_port?: number | null;
    platform: string;
    gamemode: string;
    players_online?: number;
    players_max?: number;
    featured?: boolean;
    votes?: number;
    uptime?: number;
    website?: string;
    discord?: string;
    status?: string;
    review_count?: number;
    average_rating?: number;
    user_id?: string;
    last_ping?: string;
  };
  onVote?: () => void;
  onStats?: () => void;
  onAnalytics?: () => void;
  currentUserId?: string;
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({ server, onVote, onStats, onAnalytics, currentUserId }) => {
  const [copiedIP, setCopiedIP] = useState<string | null>(null);
  const [serverIcon, setServerIcon] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [playerCount, setPlayerCount] = useState({ online: 0, max: 0 });

  useEffect(() => {
    loadServerIcon();
    
    // Determine server status - only online if last_ping is recent (within 2 hours) AND has valid data
    let serverIsOnline = false;
    
    if (server.last_ping) {
      const lastPingTime = new Date(server.last_ping).getTime();
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000); // Reduced from 4 to 2 hours
      const isPingRecent = lastPingTime >= twoHoursAgo;
      
      // Additional validation: server must have valid player data or be a real domain
      const hasValidData = (server.players_online !== null && server.players_online !== undefined) || 
                          (server.players_max !== null && server.players_max !== undefined && server.players_max > 0);
      
      // Check if domain looks fake (contains 'test', 'fake', 'example', etc.)
      const isFakeDomain = /\.(test|fake|example|localhost|invalid)$/i.test(server.ip) || 
                          server.ip.includes('test') || 
                          server.ip.includes('fake') ||
                          server.ip.includes('example');
      
      serverIsOnline = isPingRecent && hasValidData && !isFakeDomain;
    }
    
    setIsOnline(serverIsOnline);
    setPlayerCount({
      online: server.players_online || 0,
      max: server.players_max || 0
    });
  }, [server]);

  const loadServerIcon = async () => {
    try {
      const iconData = await ServerMonitoringService.getServerIcon(server.id);
      if (iconData) {
        setServerIcon(iconData);
      }
    } catch (error) {
      console.error('Error loading server icon:', error);
    }
  };

  const copyIP = async (ip: string, type: 'java' | 'bedrock') => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopiedIP(type);
      setTimeout(() => setCopiedIP(null), 2000);
      
      // Track IP copy analytics
      await AnalyticsService.trackIPCopy(server.id, type);
    } catch (err) {
      console.error('Failed to copy IP:', err);
    }
  };

  const getJavaIP = () => {
    return server.java_port === 25565 ? server.ip : `${server.ip}:${server.java_port || 25565}`;
  };

  const getBedrockIP = () => {
    return server.ip;
  };

  const getBedrockPort = () => {
    return server.bedrock_port || 19132;
  };


  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        
        {/* Server Icon */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/10 bg-secondary-dark/60">
            {serverIcon ? (
              <img
                src={`data:image/png;base64,${serverIcon}`}
                alt={`${server.name} icon`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-discord-blue to-blue-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">🎮</span>
              </div>
            )}
          </div>
        </div>

        {/* Server Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{server.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  isOnline 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                {server.featured && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold">
                    FEATURED
                  </span>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-light-gray">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-discord-blue" />
                  <span className="text-white font-semibold">
                    {playerCount.online.toLocaleString()}/{playerCount.max.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Vote className="w-4 h-4 text-grass-green" />
                  <span>{server.votes || 0} Vote(s)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <span>{server.review_count || 0} Review(s)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>Rated: {server.average_rating || 4.8}/5</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {onVote && (
                <button
                  onClick={onVote}
                  className="btn bg-grass-green hover:bg-green-600 text-white flex items-center space-x-2"
                >
                  <Vote className="w-5 h-5" />
                  <span>VOTE</span>
                </button>
              )}
              
              {/* Analytics Button - Only show for server owners */}
              {onAnalytics && currentUserId && server.user_id === currentUserId && (
                <button
                  onClick={onAnalytics}
                  className="btn bg-discord-blue hover:bg-blue-600 text-white flex items-center space-x-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>ANALYTICS</span>
                </button>
              )}
            </div>
          </div>

          {/* Server IPs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Java IP */}
            {(server.platform === 'java' || server.platform === 'crossplatform') && (
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-light-gray text-sm block mb-1">Java IP</span>
                    <div className="space-y-1">
                      <code className="text-white font-mono text-lg block">{server.ip}</code>
                      {(server.java_port && server.java_port !== 25565) ? (
                        <div className="text-light-gray text-sm">
                          Port: <span className="text-white font-mono">{server.java_port}</span>
                        </div>
                      ) : (
                        <div className="text-light-gray text-sm">
                          Port: <span className="text-white font-mono">25565</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => copyIP(getJavaIP(), 'java')}
                    className={`btn text-sm px-4 py-2 flex items-center space-x-2 transition-all ${
                      copiedIP === 'java'
                        ? 'bg-green-600 text-white'
                        : 'bg-discord-blue hover:bg-blue-600 text-white'
                    }`}
                  >
                    {copiedIP === 'java' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy IP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bedrock IP */}
            {(server.platform === 'bedrock' || server.platform === 'crossplatform') && (
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-light-gray text-sm block mb-1">Bedrock IP</span>
                    <code className="text-white font-mono text-lg">{getBedrockIP()}</code>
                    <div className="text-light-gray text-sm mt-1">
                      Port: <span className="text-white font-mono">{getBedrockPort()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyIP(getBedrockIP(), 'bedrock')}
                    className={`btn text-sm px-4 py-2 flex items-center space-x-2 transition-all ${
                      copiedIP === 'bedrock'
                        ? 'bg-green-600 text-white'
                        : 'bg-discord-blue hover:bg-blue-600 text-white'
                    }`}
                  >
                    {copiedIP === 'bedrock' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy IP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};