/**
 * Forgot Password Modal Component
 * 
 * Modal for password reset functionality with email validation
 * and user feedback.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { X, Mail, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

interface ForgotPasswordModalProps {
  onClose: () => void;
  onBack: () => void;
}

// ==================== COMPONENT ====================

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onBack
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      if (err.message?.includes('rate limit')) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else if (err.message?.includes('not found')) {
        setError('No account found with this email address.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-light-gray hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white">
              {isSuccess ? 'Check Your Email' : 'Reset Password'}
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
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Email Sent!</h3>
              <p className="text-light-gray text-sm mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-light-gray text-xs">
                Check your email and click the link to reset your password. 
                The link will expire in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-light-gray text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn bg-discord-blue hover:bg-blue-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        {isSuccess && (
          <div className="p-6 border-t border-white/10 text-center">
            <button
              onClick={onClose}
              className="text-discord-blue hover:text-blue-400 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};