'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ServerService } from '../../../services/serverService';
import { AnalyticsService } from '../../../services/analyticsService';
import { useAuth } from '../../../hooks/useAuth';
import { Footer } from '../../../components/Footer';
import { ServerHeader } from '../../../components/server/ServerHeader';
import { ServerDescription } from '../../../components/server/ServerDescription';
import { ServerFAQ } from '../../../components/server/ServerFAQ';
import { PlayerReviews } from '../../../components/server/PlayerReviews';
import { ServerStats } from '../../../components/server/ServerStats';
import { ServerBanner } from '../../../components/server/ServerBanner';
import { VotingModal } from '../../../components/VotingModal';
import { ServerAnalyticsPage } from '../../../components/ServerAnalyticsPage';
import { ServerLinks } from '../../../components/server/ServerLinks';
import { useRouter } from 'next/navigation';

interface Server {
  id: string;
  name: string;
  ip: string;
  java_port: number;
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
  bedrock_port?: number;
}

export default function ServerPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    // In Next.js App Router, params is already resolved
    const resolvedSlug = decodeURIComponent(params.slug);
    
    console.log('Resolved slug from params:', resolvedSlug);
    
    if (resolvedSlug && resolvedSlug !== '[slug]' && resolvedSlug !== '%5Bslug%5D' && resolvedSlug.trim() !== '') {
      fetchServer(resolvedSlug);
    } else {
      console.log('Invalid slug detected:', resolvedSlug);
      setError('Invalid server URL');
      setLoading(false);
    }
  }, [params.slug]);

  const fetchServer = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching server with slug:', slug);
      
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

  useEffect(() => {
    if (server) {
      const isDirectVisit = !document.referrer || 
                           !document.referrer.includes(window.location.hostname) ||
                           window.performance.navigation.type === 1;
      
      const source = isDirectVisit ? 'direct_visit' : 'internal_navigation';
      AnalyticsService.trackClick(server.id, source);
    }
  }, [server]);

  const handleVoteSuccess = () => {
    fetchServer(params.slug);
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleBackFromAnalytics = () => {
    setShowAnalytics(false);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleNavigate = (page: string, category?: string) => {
    if (page === 'dedicated' && category) {
      router.push(`/category/${category}`);
    } else {
      router.push('/');
    }
  };

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
            onClick={handleBack}
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
        
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-discord-blue hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Server List</span>
        </button>
        
        <div className="space-y-6">
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

          <ServerBanner server={server} />

          <ServerStats server={{
            ...server,
            last_ping: server.last_ping,
            players_online: server.players_online,
            players_max: server.players_max
          }} />

          <ServerDescription server={server} />

          <ServerLinks server={server} />

          <ServerFAQ server={server} />

          <PlayerReviews serverId={server.id} />
        </div>
        
        <footer role="contentinfo" aria-label="Site Footer" className="mt-12">
          <Footer onNavigate={handleNavigate} />
        </footer>
        
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
}