/**
 * Admin Panel Component
 * 
 * Administrative dashboard for managing servers, users, and site content.
 * Only accessible to users with is_admin = true.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Server, Shield, CheckCircle, XCircle, Clock, BarChart3, RefreshCw, Globe, FileText,
  Check, X, Eye, Edit, Trash2, Search, Filter, ChevronDown, AlertCircle, UserCheck,
  Ban, Mail, Calendar, Monitor, Smartphone, UserX, Trash, Star, Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CronService } from '../services/cronService';
import { AdminService } from '../services/adminService';
import { SitemapService } from '../services/sitemapService';

import { supabase } from '../lib/supabase';
import { SponsoredServerModal } from './SponsoredServerModal';

// ==================== INTERFACES ====================

interface AdminPanelProps {
  onBackToHome: () => void;
}

interface ServerData {
  id: string;
  name: string;
  ip: string;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  players_online: number;
  players_max: number;
  created_at: string;
  updated_at: string;
  user_profiles: {
    username: string;
    email: string;
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  banned_at: string | null;
  banned_reason: string | null;
  created_at: string;
  server_count: number;
}

// ==================== COMPONENT ====================

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToHome }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'servers' | 'pending' | 'users' | 'sponsored'>('servers');
  const [servers, setServers] = useState<ServerData[]>([]);
  const [pendingServers, setPendingServers] = useState<ServerData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedServer, setSelectedServer] = useState<ServerData | null>(null);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [banReason, setBanReason] = useState('');
  const [duplicateServers, setDuplicateServers] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [isUpdatingServers, setIsUpdatingServers] = useState(false);
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);
  const [sponsoredServers, setSponsoredServers] = useState<any[]>([]);
  const [showSponsoredModal, setShowSponsoredModal] = useState(false);
  const [editingSponsoredId, setEditingSponsoredId] = useState<string | null>(null);

  // ==================== EFFECTS ====================

  // Fetch user profile to check admin status
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

  useEffect(() => {
    // Check if user is admin after profile is loaded
    if (userProfile !== null && !userProfile?.is_admin) {
      onBackToHome();
      return;
    }
    
    // Only load data if user is admin
    if (userProfile?.is_admin) {
      loadData();
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'servers') {
      loadServers();
    } else if (activeTab === 'pending') {
      loadPendingServers();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'duplicates') {
      loadDuplicateServers();
    } else if (activeTab === 'sponsored') {
      loadSponsoredServers();
    }
  }, [activeTab]);

  // ==================== HANDLERS ====================

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadServers(),
        loadPendingServers(),
        loadUsers()
      ]);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadServers = async () => {
    try {
      const data = await AdminService.getAllServers();
      setServers(data);
    } catch (err) {
      console.error('Error loading servers:', err);
    }
  };

  const loadPendingServers = async () => {
    try {
      const data = await AdminService.getPendingServers();
      setPendingServers(data);
    } catch (err) {
      console.error('Error loading pending servers:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await AdminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadDuplicateServers = async () => {
    try {
      setLoadingDuplicates(true);
      const data = await AdminService.getDuplicateServers();
      setDuplicateServers(data);
    } catch (err) {
      console.error('Error loading duplicate servers:', err);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const loadSponsoredServers = async () => {
    try {
      const { SponsoredServerService } = await import('../services/sponsoredServerService');
      const data = await SponsoredServerService.getAllSponsoredServers();
      setSponsoredServers(data);
    } catch (err) {
      console.error('Error loading sponsored servers:', err);
    }
  };

  const handleApproveServer = async (serverId: string) => {
    try {
      await AdminService.updateServerStatus(serverId, 'approved');
      await loadPendingServers();
      await loadServers();
      alert('Server approved successfully!');
    } catch (err) {
      console.error('Approve server error:', err);
      alert(`Failed to approve server: ${err.message || 'Unknown error'}`);
    }
  };

  const handleRejectServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to reject this server?')) return;
    
    try {
      await AdminService.updateServerStatus(serverId, 'rejected');
      await loadPendingServers();
      alert('Server rejected successfully!');
    } catch (err) {
      console.error('Reject server error:', err);
      alert(`Failed to reject server: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!confirm('Are you sure you want to permanently delete this server?')) return;
    
    try {
      await AdminService.deleteServer(serverId);
      await loadServers();
      await loadPendingServers();
      alert('Server deleted successfully!');
    } catch (err) {
      console.error('Delete server error:', err);
      alert(`Failed to delete server: ${err.message || 'Unknown error'}`);
    }
  };

  const handleToggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await AdminService.updateUserAdminStatus(userId, !isAdmin);
      await loadUsers();
      alert(`User admin status ${!isAdmin ? 'granted' : 'removed'} successfully!`);
    } catch (err) {
      console.error('Toggle admin error:', err);
      alert(`Failed to update user admin status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBanUser = (userData: UserData) => {
    setSelectedUser(userData);
    setBanReason('');
    setShowBanModal(true);
  };

  const handleConfirmBan = async () => {
    if (!selectedUser) return;
    
    const action = selectedUser.is_banned ? 'unban' : 'ban';
    const confirmMessage = selectedUser.is_banned 
      ? `Are you sure you want to unban ${selectedUser.username}?`
      : `Are you sure you want to ban ${selectedUser.username}?`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await AdminService.banUser(
        selectedUser.id, 
        !selectedUser.is_banned, 
        selectedUser.is_banned ? undefined : banReason,
        userProfile?.id
      );
      
      await loadUsers();
      setShowBanModal(false);
      setSelectedUser(null);
      setBanReason('');
      alert(`User ${action}ned successfully!`);
    } catch (err) {
      console.error('Ban user error:', err);
      alert(`Failed to ${action} user: ${err.message || 'Unknown error'}`);
    }
  };

  const handleManualServerUpdate = async () => {
    setIsUpdatingServers(true);
    setUpdateResult(null);
    
    try {
      console.log('🔄 Triggering manual server update...');
      await CronService.triggerManualCheck();
      setUpdateResult('✅ Server update completed successfully! All servers have been checked for current status and player counts.');
      
      // Refresh statistics after update
      setTimeout(() => {
        loadStatistics();
      }, 2000);
      
    } catch (error) {
      console.error('Manual server update failed:', error);
      setUpdateResult('❌ Server update failed. This feature requires proper Supabase configuration and Edge Functions.');
    } finally {
      setIsUpdatingServers(false);
      
      // Clear result message after 10 seconds
      setTimeout(() => {
        setUpdateResult(null);
      }, 10000);
    }
  };

  const handleGenerateSitemap = async () => {
    try {
      setError(null);
      alert('Generating sitemap... Check console for progress.');
     await SitemapService.generateAndSaveSitemap();
      alert('Sitemap generation completed! Check console for details.');
    } catch (error) {
      console.error('Sitemap generation failed:', error);
      setError('Failed to generate sitemap. Check console for details.');
    }
  };

  const handleDeleteAllUserServers = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete ALL servers from ${username}? This action cannot be undone.`)) return;
    
    try {
      const deletedCount = await AdminService.deleteAllUserServers(userId);
      await loadUsers();
      await loadServers();
      await loadPendingServers();
      alert(`Successfully deleted ${deletedCount} server(s) from ${username}`);
    } catch (err) {
      console.error('Delete all user servers error:', err);
      alert(`Failed to delete user servers: ${err.message || 'Unknown error'}`);
    }
  };

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

  const filteredServers = servers.filter(server => {
    const matchesSearch = searchQuery === '' || 
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.user_profiles.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || server.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    return searchQuery === '' || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ==================== RENDER ====================

  if (userProfile !== null && !userProfile?.is_admin) {
    return (
      <div className="min-h-screen bg-primary-dark pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-light-gray mb-4">You don't have permission to access the admin panel.</p>
            <button
              onClick={onBackToHome}
              className="btn bg-discord-blue hover:bg-blue-600 text-white"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || userProfile === null) {
    return (
      <div className="min-h-screen bg-primary-dark pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-light-gray">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark pt-20 px-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackToHome}
            className="text-discord-blue hover:text-blue-400 transition-colors text-sm mb-4"
          >
            ← Back to Server List
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider uppercase">
                Admin Panel
              </h1>
              <p className="text-light-gray">
                Server and user management dashboard
              </p>
            </div>
          </div>
          <div className="w-16 h-1 bg-red-400"></div>
        </div>

        {/* Manual Server Update Section */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-discord-blue" />
              <h2 className="text-xl font-bold text-white">Server Monitoring</h2>
            </div>
            <button
              onClick={handleManualServerUpdate}
              disabled={isUpdatingServers}
              className="btn bg-discord-blue hover:bg-blue-600 text-white flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingServers ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Updating Servers...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Update All Servers Now</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-light-gray text-sm mb-4">
            Manually trigger server monitoring to check all servers for current online status, player counts, and update statistics. 
            This normally runs automatically every 15 minutes.
          </p>
          
          {updateResult && (
            <div className={`p-4 rounded-lg border ${
              updateResult.includes('✅') 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              <p className="text-sm">{updateResult}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('servers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'servers'
                ? 'bg-discord-blue text-white'
                : 'bg-secondary-dark/60 text-light-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-4 h-4 inline mr-2" />
            All Servers ({servers.length})
          </button>
          
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-secondary-dark/60 text-light-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Pending Approval ({pendingServers.length})
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-secondary-dark/60 text-light-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users ({users.length})
          </button>
          
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'duplicates'
                ? 'bg-orange-600 text-white'
                : 'bg-secondary-dark/60 text-light-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Duplicates
          </button>
          
          <button
            onClick={() => setActiveTab('sponsored')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'sponsored'
                ? 'bg-yellow-600 text-white'
                : 'bg-secondary-dark/60 text-light-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Sponsored ({sponsoredServers.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:border-discord-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Status Filter (for servers) */}
            {(activeTab === 'servers') && (
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-light-gray" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* SEO Tools Section */}
        <div className="glass rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-discord-blue" />
            SEO Tools
          </h2>
          <p className="text-light-gray mb-6">
            Manually trigger sitemap generation for server listings. This helps search engines discover new and updated server pages.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleGenerateSitemap}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Generate Server Sitemap</span>
            </button>
            
            <div className="text-sm text-light-gray flex items-center">
              <span>💡 Check browser console for sitemap output and details</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
          
          {/* All Servers Tab */}
          {activeTab === 'servers' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">All Servers</h2>
              
              {filteredServers.length > 0 ? (
                <div className="space-y-4">
                  {filteredServers.map((server) => (
                    <div key={server.id} className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* Server Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{server.name}</h3>
                            {getPlatformIcon(server.platform)}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(server.status)}`}>
                              {server.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray mb-2">
                            <span>IP: <code className="text-discord-blue">{server.ip}</code></span>
                            <span>Gamemode: <span className="capitalize">{server.gamemode}</span></span>
                            <span>Owner: <span className="text-white">{server.user_profiles.username}</span></span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray">
                            <span>Players: {server.players_online || 0}/{server.players_max || 0}</span>
                            <span>Votes: {server.votes}</span>
                            <span>Created: {new Date(server.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedServer(server);
                              setShowServerModal(true);
                            }}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          
                          {server.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveServer(server.id)}
                                className="btn bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                              >
                                <Check className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              
                              <button
                                onClick={() => handleRejectServer(server.id)}
                                className="btn bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteServer(server.id)}
                            className="btn bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Server className="w-12 h-12 text-light-gray mx-auto mb-3" />
                  <p className="text-light-gray">No servers found</p>
                </div>
              )}
            </div>
          )}

          {/* Pending Servers Tab */}
          {activeTab === 'pending' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Pending Approval</h2>
              
              {pendingServers.length > 0 ? (
                <div className="space-y-4">
                  {pendingServers.map((server) => (
                    <div key={server.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* Server Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{server.name}</h3>
                            {getPlatformIcon(server.platform)}
                            <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold uppercase">
                              PENDING REVIEW
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray mb-2">
                            <span>IP: <code className="text-discord-blue">{server.ip}</code></span>
                            <span>Gamemode: <span className="capitalize">{server.gamemode}</span></span>
                            <span>Owner: <span className="text-white">{server.user_profiles.username}</span></span>
                            <span>Email: <span className="text-white">{server.user_profiles.email}</span></span>
                          </div>
                          
                          <div className="text-sm text-light-gray">
                            Submitted: {new Date(server.created_at).toLocaleDateString()} at {new Date(server.created_at).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedServer(server);
                              setShowServerModal(true);
                            }}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                          
                          <button
                            onClick={() => handleApproveServer(server.id)}
                            className="btn bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          
                          <button
                            onClick={() => handleRejectServer(server.id)}
                            className="btn bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-light-gray mx-auto mb-3" />
                  <p className="text-light-gray">No pending servers</p>
                  <p className="text-sm text-light-gray">All servers have been reviewed</p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
              
              {filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  {filteredUsers.map((userData) => (
                    <div key={userData.id} className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{userData.username}</h3>
                            {userData.is_admin && (
                              <span className="px-2 py-1 bg-red-400/20 text-red-400 rounded-full text-xs font-semibold">
                                ADMIN
                              </span>
                            )}
                            {userData.is_banned && (
                              <span className="px-2 py-1 bg-red-600/20 text-red-600 rounded-full text-xs font-semibold">
                                BANNED
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray mb-2">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{userData.email}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Server className="w-4 h-4" />
                              <span>{userData.server_count} servers</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-light-gray">
                            <Calendar className="w-4 h-4" />
                            <span>Joined: {new Date(userData.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleUserAdmin(userData.id, userData.is_admin)}
                            className={`btn text-sm px-3 py-2 flex items-center space-x-1 ${
                              userData.is_admin
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {userData.is_admin ? (
                              <>
                                <Ban className="w-4 h-4" />
                                <span>Remove Admin</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4" />
                                <span>Make Admin</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleBanUser(userData)}
                            className={`btn text-sm px-3 py-2 flex items-center space-x-1 ${
                              userData.is_banned
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {userData.is_banned ? (
                              <>
                                <UserCheck className="w-4 h-4" />
                                <span>Unban</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-4 h-4" />
                                <span>Ban</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteAllUserServers(userData.id, userData.username)}
                            className="btn bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Trash className="w-4 h-4" />
                            <span>Delete All Servers</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-light-gray mx-auto mb-3" />
                  <p className="text-light-gray">No users found</p>
                </div>
              )}
            </div>
          )}

          {/* Duplicates Tab */}
          {activeTab === 'duplicates' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Duplicate Servers</h2>
              <p className="text-light-gray mb-6">
                Servers grouped by domain/IP address to help identify potential duplicates
              </p>
              
              {loadingDuplicates ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-light-gray">Loading duplicate servers...</p>
                </div>
              ) : duplicateServers.length > 0 ? (
                <div className="space-y-6">
                  {duplicateServers.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <h3 className="text-lg font-bold text-white">
                          Domain: {group.domain}
                        </h3>
                        <span className="px-2 py-1 bg-orange-400/20 text-orange-400 rounded-full text-xs font-semibold">
                          {group.servers.length} SERVERS
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {group.servers.map((server: any) => (
                          <div key={server.id} className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              
                              {/* Server Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-bold text-white">{server.name}</h4>
                                  {getPlatformIcon(server.platform)}
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(server.status)}`}>
                                    {server.status}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray mb-2">
                                  <span>IP: <code className="text-discord-blue">{server.ip}</code></span>
                                  <span>Gamemode: <span className="capitalize">{server.gamemode}</span></span>
                                  <span>Owner: <span className="text-white">{server.user_profiles.username}</span></span>
                                  <span>Email: <span className="text-white">{server.user_profiles.email}</span></span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray">
                                  <span>Players: {server.players_online || 0}/{server.players_max || 0}</span>
                                  <span>Votes: {server.votes}</span>
                                  <span>Created: {new Date(server.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedServer(server);
                                    setShowServerModal(true);
                                  }}
                                  className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteServer(server.id)}
                                  className="btn bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-light-gray mx-auto mb-3" />
                  <p className="text-light-gray">No duplicate servers found</p>
                  <p className="text-sm text-light-gray">All servers have unique domains</p>
                </div>
              )}
            </div>
          )}

          {/* Sponsored Servers Tab */}
          {activeTab === 'sponsored' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  Sponsored Servers
                </h2>
                <button
                  onClick={() => setShowSponsoredModal(true)}
                  className="btn bg-yellow-600 hover:bg-yellow-700 text-white flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sponsored Server</span>
                </button>
              </div>
              
              {sponsoredServers.length > 0 ? (
                <div className="space-y-4">
                  {sponsoredServers.map((server) => (
                    <div key={server.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* Server Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <h3 className="text-lg font-bold text-white">{server.name}</h3>
                            {getPlatformIcon(server.platform)}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                              server.is_active ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                            }`}>
                              {server.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-light-gray mb-2">
                            <span>IP: <code className="text-yellow-400">{server.ip}</code></span>
                            <span>Gamemode: <span className="capitalize">{server.gamemode}</span></span>
                            <span>Order: <span className="text-white">{server.display_order}</span></span>
                          </div>
                          
                          <div className="text-sm text-light-gray">
                            Created: {new Date(server.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingSponsoredId(server.id);
                              setShowSponsoredModal(true);
                            }}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                const { SponsoredServerService } = await import('../services/sponsoredServerService');
                                await SponsoredServerService.toggleSponsoredServerStatus(server.id, !server.is_active);
                                await loadSponsoredServers();
                                alert(`Server ${server.is_active ? 'deactivated' : 'activated'} successfully!`);
                              } catch (err) {
                                alert(`Failed to toggle server status: ${err.message}`);
                              }
                            }}
                            className={`btn text-sm px-3 py-2 flex items-center space-x-1 ${
                              server.is_active
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {server.is_active ? (
                              <>
                                <X className="w-4 h-4" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to delete ${server.name}?`)) return;
                              
                              try {
                                const { SponsoredServerService } = await import('../services/sponsoredServerService');
                                await SponsoredServerService.deleteSponsoredServer(server.id);
                                await loadSponsoredServers();
                                alert('Sponsored server deleted successfully!');
                              } catch (err) {
                                alert(`Failed to delete sponsored server: ${err.message}`);
                              }
                            }}
                            className="btn bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 flex items-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-light-gray mx-auto mb-3" />
                  <p className="text-light-gray">No sponsored servers</p>
                  <p className="text-sm text-light-gray">Create your first sponsored server listing</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Server Detail Modal */}
        {showServerModal && selectedServer && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">Server Details</h2>
                <button
                  onClick={() => setShowServerModal(false)}
                  className="text-light-gray hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Server Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-light-gray">Name:</span> <span className="text-white">{selectedServer.name}</span></div>
                      <div><span className="text-light-gray">IP:</span> <code className="text-discord-blue">{selectedServer.ip}</code></div>
                      <div><span className="text-light-gray">Platform:</span> <span className="text-white capitalize">{selectedServer.platform}</span></div>
                      <div><span className="text-light-gray">Gamemode:</span> <span className="text-white capitalize">{selectedServer.gamemode}</span></div>
                      <div><span className="text-light-gray">Status:</span> <span className={`capitalize ${getStatusColor(selectedServer.status).split(' ')[0]}`}>{selectedServer.status}</span></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Owner Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-light-gray">Username:</span> <span className="text-white">{selectedServer.user_profiles.username}</span></div>
                      <div><span className="text-light-gray">Email:</span> <span className="text-white">{selectedServer.user_profiles.email}</span></div>
                      <div><span className="text-light-gray">Submitted:</span> <span className="text-white">{new Date(selectedServer.created_at).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedServer.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        handleApproveServer(selectedServer.id);
                        setShowServerModal(false);
                      }}
                      className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>Approve Server</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleRejectServer(selectedServer.id);
                        setShowServerModal(false);
                      }}
                      className="btn bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
                    >
                      <X className="w-5 h-5" />
                      <span>Reject Server</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ban User Modal */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                </h2>
                <button
                  onClick={() => setShowBanModal(false)}
                  className="text-light-gray hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-light-gray mb-2">
                    {selectedUser.is_banned 
                      ? `Remove ban from ${selectedUser.username}?`
                      : `Ban ${selectedUser.username}?`
                    }
                  </p>
                  
                  {selectedUser.is_banned && selectedUser.banned_reason && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                      <p className="text-red-400 text-sm">
                        Current ban reason: {selectedUser.banned_reason}
                      </p>
                    </div>
                  )}
                </div>

                {!selectedUser.is_banned && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-light-gray mb-2">
                      Ban Reason (optional)
                    </label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:outline-none focus:border-discord-blue transition-colors resize-none"
                      rows={3}
                      placeholder="Enter reason for ban..."
                      maxLength={500}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBanModal(false)}
                    className="flex-1 btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBan}
                    className={`flex-1 btn text-white ${
                      selectedUser.is_banned
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sponsored Server Modal */}
      {showSponsoredModal && (
        <SponsoredServerModal
          isOpen={showSponsoredModal}
          onClose={() => {
            setShowSponsoredModal(false);
            setEditingSponsoredId(null);
          }}
          editingId={editingSponsoredId}
          onServerUpdated={loadSponsoredServers}
        />
      )}
    </div>
  );
};