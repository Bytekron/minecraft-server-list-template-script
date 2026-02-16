import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: string;
  minecraft_username: string;
  review_text: string;
  rating: number;
  created_at: string;
}

interface PlayerReviewsProps {
  serverId: string;
}

export const PlayerReviews: React.FC<PlayerReviewsProps> = ({ serverId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [serverId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMinecraftHeadUrl = (username: string) => {
    return `https://mc-heads.net/avatar/${username}/32`;
  };
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-discord-blue" />
          <h3 className="text-xl font-bold text-white">Player Reviews</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="h-4 bg-white/10 rounded w-24"></div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 bg-white/10 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-16 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-red-400" />
          <h3 className="text-xl font-bold text-white">Player Reviews</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-discord-blue" />
        <h3 className="text-xl font-bold text-white">Player Reviews</h3>
        <span className="text-sm text-light-gray">({reviews.length})</span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-light-gray mx-auto mb-3" />
          <p className="text-light-gray">No reviews yet</p>
          <p className="text-sm text-light-gray">Be the first to review this server!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-white/10 last:border-b-0 pb-6 last:pb-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                  <img
                    src={getMinecraftHeadUrl(review.minecraft_username)}
                    alt={`${review.minecraft_username} head`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<div class="w-full h-full bg-discord-blue/20 flex items-center justify-center"><svg class="w-4 h-4 text-discord-blue" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{review.minecraft_username}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-light-gray">
                    <Calendar className="w-3 h-3" />
                    {formatDate(review.created_at)}
                  </div>
                </div>
              </div>
              <p className="text-light-gray leading-relaxed">{review.review_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};