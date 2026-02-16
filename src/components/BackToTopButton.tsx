/**
 * Back to Top Button Component
 * 
 * A floating action button that appears when the user scrolls down and
 * smoothly scrolls back to the top of the page when clicked.
 * 
 * Features:
 * - Appears/disappears based on scroll position
 * - Smooth scroll animation to top
 * - Hover effects and transitions
 * - Accessible with keyboard navigation
 * - Responsive design for all devices
 * - Glass morphism styling consistent with site theme
 * 
 * @component
 * @author CreeperCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

// ==================== COMPONENT ====================

/**
 * Back to Top Button Component
 * 
 * Floating button that appears when user scrolls down and provides
 * smooth scrolling back to the top of the page.
 * 
 * @returns {JSX.Element} Back to top button JSX
 */
export const BackToTopButton: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================
  
  /**
   * Visibility state based on scroll position
   * @type {boolean} isVisible - Whether button should be visible
   */
  const [isVisible, setIsVisible] = useState(false);

  // ==================== EFFECTS ====================
  
  /**
   * Scroll Event Listener Effect
   * 
   * Monitors scroll position and shows/hides the button based on
   * how far the user has scrolled down the page.
   */
  useEffect(() => {
    /**
     * Handle Scroll Event
     * 
     * Shows button when user scrolls down more than 300px,
     * hides it when near the top of the page.
     */
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 300);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ==================== EVENT HANDLERS ====================
  
  /**
   * Scroll to Top Handler
   * 
   * Smoothly scrolls the page back to the top when button is clicked.
   * Uses native smooth scrolling for better performance.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /**
   * Handle Keyboard Navigation
   * 
   * Allows button to be activated with Enter or Space key for accessibility.
   * 
   * @param {React.KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  };

  // ==================== RENDER ====================
  
  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      className={`
        fixed bottom-6 right-6 z-50 
        w-12 h-12 sm:w-14 sm:h-14
        glass rounded-full
        border-2 border-discord-blue/30 hover:border-discord-blue/60
        bg-secondary-dark/80 hover:bg-secondary-dark/90
        backdrop-blur-lg
        text-discord-blue hover:text-white
        shadow-lg hover:shadow-2xl hover:shadow-discord-blue/20
        transform transition-all duration-300 ease-in-out
        hover:scale-110 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-discord-blue focus:ring-offset-2 focus:ring-offset-primary-dark
        group
        ${isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={isVisible ? 0 : -1}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-full bg-discord-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      
      {/* Arrow icon */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <ArrowUp 
          className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" 
        />
      </div>
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-full bg-discord-blue/20 opacity-0 group-active:opacity-100 group-active:animate-ping"></div>
    </button>
  );
};