import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ServerService } from '../services/serverService';
import { AnalyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { Footer } from './Footer';
import { ServerHeader } from './server/ServerHeader';
import { ServerDescription } from './server/ServerDescription';
import { ServerFAQ } from './server/ServerFAQ';
import { PlayerReviews } from './server/PlayerReviews';
import { ServerStats } from './server/ServerStats';
import { ServerBanner } from './server/ServerBanner';
import { VotingModal } from './VotingModal';
import { ServerAnalyticsPage } from './ServerAnalyticsPage';
import { ServerLinks } from './server/ServerLinks';

interface Server {
  id: string;
  name: string;
  ip: string;
  java_port: number;
  bedrock_port: number | null;
  bedrock_port: number;
  platform: 'java' | 'bedrock' | 'crossplatform';
  gamemode: string;
  additional_gamemodes?: string;
  min_version?: string;
  max_version?: string;
  country?: string;
  website?: string;
  discord?: string;
  youtube?: string;
  description: string;
  banner_url?: string;
  has_whitelist: boolean;
  votifier_enabled: boolean;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  votes: number;
  players_online: number;
  players_max: number;
  uptime: number;
  last_ping?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  slug?: string;
}

interface ServerStatus {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  motd?: {
    clean: string[];
  };
  icon?: string;
}

interface ServerPageProps {
  slug: string;
  onBack: () => void;
  onNavigate?: (page: string, category?: string) => void;
}

export const ServerPage: React.FC<ServerPageProps> = ({ slug, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchServer();
    }
  }, [slug]);

  useEffect(() => {
    // Track server page view (both internal navigation and direct visits)
    if (server) {
      // Determine if this is a direct visit or internal navigation
      const isDirectVisit = !document.referrer || 
                           !document.referrer.includes(window.location.hostname) ||
                           window.performance.navigation.type === 1; // TYPE_RELOAD
      
      const source = isDirectVisit ? 'direct_visit' : 'internal_navigation';
      AnalyticsService.trackClick(server.id, source);
    }
  }, [server]);

  const fetchServer = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch server data
      const serverData = await ServerService.getServerBySlug(slug);

      if (!serverData) {
        setError('Server not found');
        return;
      }

      setServer(serverData);
    } catch (err) {
      console.error('Error fetching server:', err);
      setError(err instanceof Error ? err.message : 'Failed to load server');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    fetchServer(); // This will refresh the server data including vote count
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleBackFromAnalytics = () => {
    setShowAnalytics(false);
  };

  // Show analytics page if requested
  if (showAnalytics && server) {
    return (
      <ServerAnalyticsPage
        serverId={server.id}
        onBack={handleBackFromAnalytics}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-gray">Loading server...</p>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Server Not Found</h1>
          <p className="text-light-gray mb-4">{error || 'The requested server could not be found.'}</p>
          <button
            onClick={onBack}
            className="btn bg-discord-blue hover:bg-blue-600 text-white flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Server List</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-discord-blue hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Server List</span>
        </button>
        
        <div className="space-y-6">
          {/* Server Header Component */}
          <ServerHeader 
            server={{
              ...server,
              last_ping: server.last_ping,
              players_online: server.players_online,
              players_max: server.players_max
            }} 
            onVote={() => setShowVotingModal(true)}
            onAnalytics={handleShowAnalytics}
            currentUserId={user?.id}
          />

          {/* Server Banner Component */}
          <ServerBanner server={server} />

          {/* Server Stats Component */}
          <ServerStats server={{
            ...server,
            last_ping: server.last_ping,
            players_online: server.players_online,
            players_max: server.players_max
          }} />

          {/* Server Description Component */}
          <ServerDescription server={server} />

          {/* Server Links Component */}
          <ServerLinks server={server} />

          {/* Server FAQ Component */}
          <ServerFAQ server={server} />

          {/* Player Reviews Component */}
          <PlayerReviews serverId={server.id} />
        </div>
        
        {/* Footer */}
        <footer role="contentinfo" aria-label="Site Footer" className="mt-12">
          <Footer onNavigate={onNavigate} />
        </footer>
        
        {/* Voting Modal */}
        {showVotingModal && (
          <VotingModal
            isOpen={showVotingModal}
            onClose={() => setShowVotingModal(false)}
            server={{
              id: server.id,
              name: server.name,
              ip: server.ip
            }}
            onVoteSuccess={handleVoteSuccess}
          />
        )}
      </div>
    </div>
  );
};