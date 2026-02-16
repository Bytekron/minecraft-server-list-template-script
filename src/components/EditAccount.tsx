/**
 * Edit Account Component
 * 
 * Allows users to edit their account information including
 * username, email, and password.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

interface EditAccountProps {
  onBackToHome: () => void;
}

interface FormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== COMPONENT ====================

export const EditAccount: React.FC<EditAccountProps> = ({ onBackToHome }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // ==================== HANDLERS ====================

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, email')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        username: data.username || '',
        email: data.email || user.email || ''
      }));
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
    if (success) setSuccess(null);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation only if user wants to change password
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'New password must be at least 6 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(null);

    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          username: formData.username,
          email: formData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
      }

      // Update password if provided
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        if (passwordError) throw passwordError;
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      setSuccess('Account updated successfully!');
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to update account' });
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-primary-dark pt-20 px-4">
      <div className="container mx-auto max-w-2xl">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-discord-blue hover:text-blue-400 transition-colors text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Server List</span>
          </button>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider uppercase mb-2">
            Edit Account
          </h1>
          <p className="text-light-gray">
            Update your account information and preferences
          </p>
          <div className="w-16 h-1 bg-discord-blue mt-4"></div>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400">{success}</p>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                    errors.username ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                  }`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
              <p className="text-sm text-light-gray mb-4">
                Leave blank if you don't want to change your password
              </p>

              {/* Current Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.currentPassword ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-gray mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-light-gray mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn bg-discord-blue hover:bg-blue-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};