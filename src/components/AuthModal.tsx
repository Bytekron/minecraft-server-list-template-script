/**
 * Authentication Modal Component
 * 
 * Modal for user login and registration with comprehensive form validation,
 * proper error handling, and forgot password functionality.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

// ==================== INTERFACES ====================

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onAuth: (email: string, password: string, username?: string) => Promise<void>;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
  isBanned?: boolean;
}

// ==================== COMPONENT ====================

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onAuth,
  onSwitchMode
}) => {
  // ==================== STATE ====================
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ==================== EFFECTS ====================

  // Reset form when switching modes
  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  // ==================== HANDLERS ====================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear general error when user makes changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation (register only)
    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters long';
      } else if (formData.username.length > 20) {
        newErrors.username = 'Username must be less than 20 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (mode === 'register' && formData.password.length > 72) {
      newErrors.password = 'Password must be less than 72 characters';
    }

    // Confirm password validation (register only)
    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseAuthError = (error: any): string => {
    console.error('Authentication error details:', error);

    // Handle different error structures
    let errorMessage = '';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error_description) {
      errorMessage = error.error_description;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.body) {
      try {
        const parsed = JSON.parse(error.body);
        errorMessage = parsed.message || parsed.error_description || error.body;
      } catch {
        errorMessage = error.body;
      }
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    // Map specific error codes to user-friendly messages
    const errorMappings: Record<string, string> = {
      'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
      'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
      'signup_disabled': 'New user registration is currently disabled. Please contact support.',
      'email_address_invalid': 'Please enter a valid email address.',
      'password_too_short': 'Password must be at least 6 characters long.',
      'weak_password': 'Password is too weak. Please choose a stronger password.',
      'user_already_exists': 'An account with this email already exists. Please try signing in instead.',
      'email_address_not_authorized': 'This email address is not authorized to create an account.',
      'too_many_requests': 'Too many attempts. Please wait a moment before trying again.',
      'captcha_failed': 'Captcha verification failed. Please try again.',
      'database_error': 'A database error occurred. Please try again later.',
      'network_error': 'Network error. Please check your connection and try again.'
    };

    // Check for specific error patterns
    for (const [code, message] of Object.entries(errorMappings)) {
      if (errorMessage.toLowerCase().includes(code.toLowerCase()) || 
          errorMessage.toLowerCase().includes(code.replace('_', ' '))) {
        return message;
      }
    }

    // Handle rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }

    // Handle network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Return the original message if no mapping found, but clean it up
    return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and success messages
    setErrors({});
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onAuth(formData.email, formData.password, formData.username);
      
      // Success - show success message briefly then close
      setSuccessMessage(mode === 'login' ? 'Successfully signed in!' : 'Account created successfully!');
      
      // Close modal after brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error: any) {
      console.error('Authentication failed:', error);
      
      const errorMessage = parseAuthError(error);
      
      // Set appropriate error based on the error type
      if (errorMessage.toLowerCase().includes('invalid') && errorMessage.toLowerCase().includes('credentials')) {
        setErrors({ 
          general: mode === 'login' 
            ? 'Invalid email or password. Please check your credentials and try again.'
            : 'Registration failed. Please check your information and try again.'
        });
      } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
        setErrors({ 
          email: 'An account with this email already exists. Please try signing in instead.',
          general: 'An account with this email already exists.'
        });
      } else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('short')) {
        setErrors({ 
          password: 'Password must be at least 6 characters long.'
        });
      } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('invalid')) {
        setErrors({ 
          email: 'Please enter a valid email address.'
        });
      } else {
        setErrors({ 
          general: errorMessage
        });
      }
      
      // DO NOT close modal on error - let user retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
  };

  // ==================== RENDER ====================

  if (showForgotPassword) {
    return (
      <ForgotPasswordModal
        onClose={handleCloseForgotPassword}
        onBack={handleBackFromForgotPassword}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-light-gray hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-medium text-sm mb-1">
                    {errors.isBanned ? 'Account Banned' : (mode === 'login' ? 'Sign In Failed' : 'Registration Failed')}
                  </h4>
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Username (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                    errors.username ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                  }`}
                  placeholder="Choose a username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-light-gray mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                }`}
                placeholder="Enter your email address"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-light-gray mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                }`}
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password (min. 6 characters)'}
                disabled={isLoading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray hover:text-white transition-colors"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-light-gray mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-secondary-dark/60 border rounded-lg text-white placeholder-light-gray focus:outline-none transition-colors ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-discord-blue'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray hover:text-white transition-colors"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          )}

          {/* Forgot Password Link (Login only) */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-discord-blue hover:text-blue-400 transition-colors text-sm font-medium"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-discord-blue hover:bg-blue-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          {/* Terms Notice (Register only) */}
          {mode === 'register' && (
            <p className="text-xs text-light-gray text-center">
              By creating an account, you agree to our{' '}
              <a href="/terms" target="_blank" className="text-discord-blue hover:text-blue-400 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" className="text-discord-blue hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 text-center">
          <p className="text-light-gray text-sm">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
              className="text-discord-blue hover:text-blue-400 transition-colors font-medium"
              disabled={isLoading}
            >
              {mode === 'login' ? 'Create one here' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};