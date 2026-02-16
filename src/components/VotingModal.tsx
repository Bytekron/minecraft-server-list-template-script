/**
 * Voting Modal Component
 * 
 * Modal for server voting with Minecraft username input,
 * captcha verification, and optional review submission.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { X, User, Star, MessageSquare, Vote, Shield } from 'lucide-react';
import { ServerService } from '../services/serverService';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: {
    id: string;
    name: string;
    ip: string;
  };
  onVoteSuccess: () => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  server,
  onVoteSuccess
}) => {
  const [step, setStep] = useState<'vote' | 'review'>('vote');
  const [minecraftUsername, setMinecraftUsername] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  
  // Review form states
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const validateUsername = (username: string) => {
    if (username.length < 3 || username.length > 16) {
      return 'Username must be between 3 and 16 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateReviewText = (text: string) => {
    if (text.length < 100) {
      return `Review must be at least 100 characters (${text.length}/100)`;
    }
    if (text.length > 500) {
      return `Review must be no more than 500 characters (${text.length}/500)`;
    }
    // Only allow basic text and punctuation
    if (!/^[a-zA-Z0-9\s.,!?'"()-]+$/.test(text)) {
      return 'Review can only contain letters, numbers, spaces, and basic punctuation';
    }
    return '';
  };

  const handleVote = async () => {
    const usernameError = validateUsername(minecraftUsername);
    if (usernameError) {
      setVoteError(usernameError);
      return;
    }

    if (!captchaVerified) {
      setVoteError('Please verify you are not a robot');
      return;
    }

    setIsVoting(true);
    setVoteError('');

    try {
      // Get user's IP address (simplified - in production you'd get this from the server)
      const ipAddress = '127.0.0.1'; // Placeholder
      
      await ServerService.voteForServer(
        server.id,
        ipAddress,
        minecraftUsername
      );

      setStep('review');
    } catch (error) {
      setVoteError(error instanceof Error ? error.message : 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleReviewSubmit = async () => {
    const textError = validateReviewText(reviewText);
    if (textError) {
      setReviewError(textError);
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      // Get user's IP address (simplified)
      const ipAddress = '127.0.0.1'; // Placeholder
      
      await ServerService.submitReview({
        server_id: server.id,
        minecraft_username: minecraftUsername,
        review_text: reviewText,
        rating,
        ip_address: ipAddress
      });

      // Call onVoteSuccess to refresh server data
      onVoteSuccess();
      
      onClose();
      // Reset form
      setStep('vote');
      setMinecraftUsername('');
      setReviewText('');
      setRating(5);
      setCaptchaVerified(false);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSkipReview = () => {
    // Call onVoteSuccess when skipping review to update vote count
    onVoteSuccess();
    onClose();
    // Reset form
    setStep('vote');
    setMinecraftUsername('');
    setReviewText('');
    setRating(5);
    setCaptchaVerified(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center">
            {step === 'vote' ? (
              <>
                <Vote className="w-5 h-5 mr-2 text-grass-green" />
                Vote for {server.name}
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 mr-2 text-discord-blue" />
                Leave a Review
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'vote' ? (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="bg-grass-green/20 rounded-lg p-4 mb-4 border border-grass-green/30">
                <p className="text-sm text-grass-green">
                  Vote for <strong>{server.name}</strong> to help other players discover this server!
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                <User className="w-4 h-4 inline mr-1 text-discord-blue" />
                Minecraft Username *
              </label>
              <input
                type="text"
                value={minecraftUsername}
                onChange={(e) => {
                  setMinecraftUsername(e.target.value);
                  setVoteError('');
                }}
                placeholder="Enter your Minecraft username"
                className="w-full px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:outline-none focus:border-discord-blue transition-colors"
                maxLength={16}
              />
              <p className="text-xs text-light-gray mt-1">
                3-16 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="captcha"
                  checked={captchaVerified}
                  onChange={(e) => setCaptchaVerified(e.target.checked)}
                  className="w-4 h-4 text-grass-green bg-secondary-dark border-white/10 rounded focus:ring-grass-green focus:ring-2"
                />
                <label htmlFor="captcha" className="flex items-center text-sm text-light-gray">
                  <Shield className="w-4 h-4 mr-1 text-discord-blue" />
                  I'm not a robot
                </label>
              </div>
            </div>

            {voteError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">{voteError}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleVote}
                disabled={isVoting || !minecraftUsername.trim() || !captchaVerified}
                className="flex-1 btn bg-grass-green hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isVoting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Voting...
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4 mr-2" />
                    Submit Vote
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="bg-grass-green/20 rounded-lg p-4 mb-4 border border-grass-green/30">
                <p className="text-sm text-grass-green">
                  ✅ Vote submitted successfully! Would you like to leave a review?
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Rating *
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Review Text *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  setReviewError('');
                }}
                placeholder="Share your experience with this server..."
                className="w-full px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white placeholder-light-gray focus:outline-none focus:border-discord-blue transition-colors resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-light-gray mt-1">
                {reviewText.length}/500 characters (minimum 100)
              </p>
            </div>

            {reviewError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">{reviewError}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleSkipReview}
                className="flex-1 btn bg-secondary-dark hover:bg-secondary-dark/80 text-white border border-white/20"
              >
                Skip Review
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview || reviewText.length < 100}
                className="flex-1 btn bg-discord-blue hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmittingReview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};