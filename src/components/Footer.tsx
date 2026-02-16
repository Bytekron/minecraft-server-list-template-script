/**
 * Footer Component
 * 
 * Clean, organized footer with balanced sections and proper responsive design.
 * Features logical grouping of navigation links with equal height sections.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 4.0.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ServerService } from '../services/serverService';

// ==================== INTERFACES ====================

interface FooterProps {
  onNavigate?: (page: string, category?: string) => void;
}

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: NavLink[];
  collapsible?: boolean;
}

// ==================== CONSTANTS ====================

const footerSections: FooterSection[] = [
  {
    title: 'Browse Servers',
    links: [
      { href: 'java', label: 'Java Edition Servers' },
      { href: 'bedrock', label: 'Bedrock Edition Servers' },
      { href: 'crossplatform', label: 'Cross-Platform Servers' },
      { href: 'new', label: 'New Servers' },
      { href: 'popular', label: 'Popular Servers' },
      { href: 'whitelist', label: 'Whitelist Servers' },
    ]
  },
  {
    title: 'Popular Gamemodes',
    collapsible: true,
    links: [
      { href: 'survival', label: 'Survival' },
      { href: 'skyblock', label: 'Skyblock' },
      { href: 'pvp', label: 'PvP' },
      { href: 'creative', label: 'Creative' },
      { href: 'prison', label: 'Prison' },
      { href: 'factions', label: 'Factions' },
      { href: 'bedwars', label: 'Bedwars' },
      { href: 'skywars', label: 'Skywars' },
      { href: 'towny', label: 'Towny' },
      { href: 'economy', label: 'Economy' },
      { href: 'minigames', label: 'Minigames' },
      { href: 'vanilla', label: 'Vanilla' },
      { href: 'anarchy', label: 'Anarchy' },
      { href: 'kitpvp', label: 'KitPvP' },
      { href: 'parkour', label: 'Parkour' },
      { href: 'rpg', label: 'RPG' },
      { href: 'pixelmon', label: 'Pixelmon' },
      { href: 'lifesteal', label: 'Lifesteal' },
      { href: 'mcmmo', label: 'MCMMO' },
      { href: 'roleplay', label: 'Roleplay' },
      { href: 'hardcore', label: 'Hardcore' },
      { href: 'uhc', label: 'UHC' },
      { href: 'hunger-games', label: 'Hunger Games' },
      { href: 'murder-mystery', label: 'Murder Mystery' },
      { href: 'hide-and-seek', label: 'Hide and Seek' },
      { href: 'build-battle', label: 'Build Battle' },
      { href: 'spleef', label: 'Spleef' },
      { href: 'tnt-run', label: 'TNT Run' },
      { href: 'the-bridge', label: 'The Bridge' },
      { href: 'capture-the-flag', label: 'Capture the Flag' },
    ]
  },
  {
    title: 'Minecraft Versions',
    links: [
      { href: '1.21', label: 'Minecraft 1.21 Servers' },
      { href: '1.20', label: 'Minecraft 1.20 Servers' },
      { href: '1.19', label: 'Minecraft 1.19 Servers' },
      { href: '1.18', label: 'Minecraft 1.18 Servers' },
      { href: '1.17', label: 'Minecraft 1.17 Servers' },
      { href: '1.16', label: 'Minecraft 1.16 Servers' }
    ]
  }
];

const socialLinks = [
  { href: 'https://discord.gg/servercraft', label: 'Discord', icon: '💬' },
  { href: 'https://twitter.com/servercraft', label: 'Twitter', icon: '🐦' },
  { href: 'https://youtube.com/servercraft', label: 'YouTube', icon: '📺' }
];

const resourceLinks = [
  { href: '/submit', label: 'Submit Your Server' },
  { href: '/api', label: 'API Documentation' },
  { href: '/help', label: 'Help Center' },
  { href: '/contact', label: 'Contact Support' }
];

const legalLinks = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/dmca', label: 'DMCA' },
  { href: '/guidelines', label: 'Guidelines' }
];

// ==================== COMPONENT ====================

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [serverStats, setServerStats] = useState({
    total: 0,
    java: 0,
    bedrock: 0,
    crossplatform: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load server statistics on component mount
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Supabase not configured - using default stats');
          setStatsLoading(false);
          return;
        }
        
        const stats = await ServerService.getServerStats();
        
        // Calculate display numbers (crossplatform counted for both Java and Bedrock)
        const displayStats = {
          total: stats.total,
          java: stats.java + stats.crossplatform, // Java + Crossplatform
          bedrock: stats.bedrock + stats.crossplatform, // Bedrock + Crossplatform
          crossplatform: stats.crossplatform
        };
        
        setServerStats(displayStats);
      } catch (error) {
        console.error('Error loading server stats:', error);
        // Keep default values on error
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };

  const renderNavLink = (link: NavLink, sectionTitle: string) => {
    // Use navigation for server categories
    if (['Browse Servers', 'Popular Gamemodes', 'Minecraft Versions'].includes(sectionTitle) && onNavigate) {
      return (
        <button
          onClick={() => {
            console.log('Footer navigation clicked:', link.href);
            onNavigate('dedicated', link.href);
          }}
          className="hover:text-white transition-colors duration-200 text-sm text-left w-full"
          aria-label={link.label}
        >
          {link.label}
        </button>
      );
    }
    
    // Regular links for other sections
    return (
      <a 
        href={link.href} 
        className="hover:text-white transition-colors duration-200 text-sm block"
        target={link.external ? '_blank' : undefined}
        rel={link.external ? 'noopener noreferrer' : undefined}
        aria-label={link.external ? `${link.label} (opens in new tab)` : link.label}
      >
        {link.label}
      </a>
    );
  };

  return (
    <footer className="bg-primary-dark border-t border-white/10" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">

        {/* Top Section - Brand and Quick Stats */}
        <div className="mb-8 pb-8 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-discord-blue rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SC</span>
                </div>
                <span className="text-xl font-bold text-white tracking-wider">
                  SERVERCRAFT
                </span>
              </div>
              <p className="text-light-gray text-sm max-w-md">
                The ultimate Minecraft server directory. Discover, compare, and join the best Minecraft servers with live player counts and real-time status updates.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-bold mb-3 text-sm">Live Statistics</h4>
              {statsLoading ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center animate-pulse">
                      <div className="h-6 bg-white/10 rounded mb-1"></div>
                      <div className="h-4 bg-white/10 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-discord-blue font-bold text-lg">
                      {serverStats.total.toLocaleString()}
                    </div>
                    <div className="text-light-gray">Total Servers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold text-lg">
                      {serverStats.java.toLocaleString()}
                    </div>
                    <div className="text-light-gray">Java Servers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold text-lg">
                      {serverStats.bedrock.toLocaleString()}
                    </div>
                    <div className="text-light-gray">Bedrock Servers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold text-lg">
                      {serverStats.crossplatform.toLocaleString()}
                    </div>
                    <div className="text-light-gray">Cross-Platform</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Sections - Equal Height Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 mb-8">
          {/* Browse Servers - Left (3 columns) */}
          <div className="md:col-span-3 flex flex-col h-full pr-8">
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Browse Servers
            </h4>
            <div className="flex-1 space-y-2 text-light-gray">
              {footerSections[0].links.map((link, linkIndex) => (
                <div key={linkIndex}>
                  {renderNavLink(link, footerSections[0].title)}
                </div>
              ))}
            </div>
          </div>

          {/* Popular Gamemodes - Center-Left (6 columns) */}
          <div className="md:col-span-6 flex flex-col h-full pr-6">
            <button
              onClick={() => toggleSection(footerSections[1].title)}
              className="flex items-center justify-between w-full text-white font-bold mb-4 text-sm uppercase tracking-wider hover:text-discord-blue transition-colors md:cursor-default md:pointer-events-none"
              aria-expanded={expandedSections.has(footerSections[1].title)}
            >
              <span>Popular Gamemodes</span>
              <span className="md:hidden">
                {expandedSections.has(footerSections[1].title) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>
            
            <div className={`flex-1 text-light-gray ${
              expandedSections.has(footerSections[1].title) ? 'block' : 'hidden md:block'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3 text-sm">
                {footerSections[1].links.map((link, linkIndex) => (
                  <div key={linkIndex} className="whitespace-nowrap">
                    {renderNavLink(link, footerSections[1].title)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minecraft Versions - Far Right (3 columns) */}
          <div className="md:col-span-3 flex flex-col h-full pl-8">
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Minecraft Versions
            </h4>
            <div className="flex-1 space-y-2 text-light-gray">
              {footerSections[2].links.map((link, linkIndex) => (
                <div key={linkIndex}>
                  {renderNavLink(link, footerSections[2].title)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Remove the old map-based rendering */}
        {/* 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index} className="flex flex-col h-full">
              {section.collapsible ? (
                <>
                  {/* Collapsible Header */}
                  {/*<button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full text-white font-bold mb-4 text-sm uppercase tracking-wider hover:text-discord-blue transition-colors md:cursor-default md:pointer-events-none"
                    aria-expanded={expandedSections.has(section.title)}
                  >
                    <span>{section.title}</span>
                    <span className="md:hidden">
                      {expandedSections.has(section.title) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  
                  {/* Collapsible Content - Gamemodes in 5-column grid */}
                  {/*<div className={`flex-1 text-light-gray ${
                    expandedSections.has(section.title) ? 'block' : 'hidden md:block'
                  }`}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-1.5 text-xs">
                      {section.links.map((link, linkIndex) => (
                        <div key={linkIndex}>
                          {renderNavLink(link, section.title)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Regular Header */}
                  {/*<h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <div className="flex-1 space-y-2 text-light-gray">
                    {section.links.map((link, linkIndex) => (
                      <div key={linkIndex}>
                        {renderNavLink(link, section.title)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        */}

        {/* Bottom Section - Community, Resources, Legal */}
        <div className="border-t border-white/10 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            
            {/* Community Links */}
            <div>
              {/* Community Container */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 border border-purple-500/30 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-1 right-3 opacity-30">
                  <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                </div>
                <div className="absolute bottom-1 right-1 opacity-20">
                  <div className="w-4 h-4 bg-white/30 rounded-full"></div>
                </div>
                <div className="absolute top-2 right-6 opacity-15">
                  <div className="w-3 h-3 bg-white/25 rounded-full"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">💬</span>
                    </div>
                    <span className="text-white/90 font-medium text-sm">Join Discord</span>
                  </div>
                  <div className="text-white font-bold text-xl">7+</div>
                  <p className="text-white/80 text-xs">Active members online</p>
                  
                  <a
                    href="https://discord.gg/servercraft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium text-xs transition-all duration-200 hover:scale-105"
                  >
                    Join Now
                  </a>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <div className="space-y-2">
                {resourceLinks.map((link, index) => (
                  <div key={index}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors duration-200 text-sm block text-light-gray"
                      aria-label={link.label}
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <div className="space-y-2">
                {legalLinks.map((link, index) => (
                  <div key={index}>
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors text-sm block text-light-gray"
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-6 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-mid-gray text-xs text-center lg:text-left">
              <p className="mb-1">
                © 2025 SERVERCRAFT. All rights reserved.
              </p>
              <p>
                This website is not affiliated with Mojang AB.
              </p>
            </div>
            
            <div className="text-mid-gray text-xs">
              Coded with ❤️ by{' '}
              <a 
                href="https://bytekron.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-discord-blue hover:text-blue-400 transition-colors duration-200 font-medium"
                aria-label="Bytekron - Web Development Agency (opens in new tab)"
              >
                Bytekron
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};