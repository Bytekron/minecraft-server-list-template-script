/**
 * My Servers Component
 * 
 * Displays user's submitted servers with management options
 * including edit, delete, and status tracking.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Wifi, WifiOff, Clock, TrendingUp } from 'lucide-react';
import { ServerService } from '../services/serverService';
import { useAuth } from '../hooks/useAuth';
import { EditServerModal } from './EditServerModal';

// ==================== INTERFACES ====================

interface Server {
  id: string;
  name: string;
  ip: string;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  players_online: number;
  players_max: number;
  uptime: number;
  created_at: string;
  updated_at: string;
}

interface MyServersProps {
  onAddServer: () => void;
  onBackToHome: () => void;
}

// ==================== COMPONENT ====================

export const MyServers: React.FC<MyServersProps> = ({ onAddServer, onBackToHome }) => {
  const { user } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (user) {
      loadUserServers();
    }
  }, [user]);

  // ==================== HANDLERS ====================

  const loadUserServers = async () => {
    try {
      setLoading(true);
      const userServers = await ServerService.getUserServers(user.id);
      setServers(userServers);
    } catch (err) {
      setError('Failed to load your servers');
      console.error('Error loading user servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await ServerService.deleteServer(serverId);
      console.log('Delete result:', result);
      
      // Remove from local state immediately
      setServers(servers.filter(s => s.id !== serverId));
      alert('Server deleted successfully!');
      
    } catch (err) {
      console.error('Delete error in component:', err);
      const errorMessage = err?.message || 'Failed to delete server';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleEditServer = (serverId: string) => {
    setEditingServerId(serverId);
  };

  const handleCloseEditModal = () => {
    setEditingServerId(null);
  };

  const handleServerUpdated = () => {
    loadUserServers(); // Refresh the server list
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'rejected':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'java':
        return '☕';
      case 'bedrock':
        return '📱';
      case 'crossplatform':
        return '🌐';
      default:
        return '☕';
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-light-gray">Loading your servers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={onBackToHome}
                className="text-discord-blue hover:text-blue-400 transition-colors text-sm mb-2"
              >
                ← Back to Server List
              </button>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider uppercase">
                My Servers
              </h1>
              <p className="text-light-gray mt-2">
                Manage your submitted Minecraft servers
              </p>
            </div>
            <button
              onClick={onAddServer}
              className="btn bg-grass-green hover:bg-green-600 text-white flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Server</span>
            </button>
          </div>
          <div className="w-16 h-1 bg-discord-blue"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Servers List */}
        {servers.length > 0 ? (
          <div className="space-y-6">
            {servers.map((server) => (
              <div
                key={server.id}
                className="glass rounded-xl p-6 border border-white/10 hover:border-discord-blue/30 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  
                  {/* Server Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white">{server.name}</h3>
                      <span className="text-lg">{getPlatformIcon(server.platform)}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(server.status)}`}>
                        {server.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">IP:</span>
                        <code className="bg-primary-dark/60 px-2 py-1 rounded text-discord-blue font-mono">
                          {server.ip}
                        </code>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Gamemode:</span>
                        <span className="capitalize">{server.gamemode}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-light-gray">
                        <Users className="w-4 h-4" />
                        <span>{server.players_online}/{server.players_max}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-light-gray">
                        <TrendingUp className="w-4 h-4" />
                        <span>{server.votes} votes</span>
                      </div>
                      <div className="flex items-center space-x-1 text-light-gray">
                        <Clock className="w-4 h-4" />
                        <span>{server.uptime}% uptime</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {server.status === 'approved' ? (
                          <>
                            <Wifi className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">Live</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">Not Live</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    {server.status === 'approved' && (
                      <button
                        onClick={() => window.open(`/server/${server.slug || server.id}`, '_blank')}
                        className="btn bg-discord-blue hover:bg-blue-600 text-white text-sm px-4 py-2 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditServer(server.id)}
                      className="btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20 text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteServer(server.id)}
                      className="btn bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Server Stats */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-light-gray">
                    <span>Created: {new Date(server.created_at).toLocaleDateString()}</span>
                    {server.updated_at !== server.created_at && (
                      <span className="ml-4">Updated: {new Date(server.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-4">No servers yet</h3>
            <p className="text-light-gray mb-8 max-w-md mx-auto">
              You haven't submitted any servers yet. Click the button below to add your first Minecraft server to the list!
            </p>
            <button
              onClick={onAddServer}
              className="btn bg-grass-green hover:bg-green-600 text-white text-lg px-8 py-4 flex items-center space-x-3 mx-auto"
            >
              <Plus className="w-6 h-6" />
              <span>Add Your First Server</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Server Modal */}
      {editingServerId && (
        <EditServerModal
          isOpen={!!editingServerId}
          onClose={handleCloseEditModal}
          serverId={editingServerId}
          onServerUpdated={handleServerUpdated}
        />
      )}
    </div>
  );
};