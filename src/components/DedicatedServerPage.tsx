/**
 * Dedicated Server Page Component
 * 
 * SEO-optimized dedicated pages for different server categories
 * with pre-applied filters and category-specific content.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getCategoryDefinition, isCategoryValid } from '../data/categoryDefinitions';
import { ServerList } from './ServerList';

// ==================== INTERFACES ====================

interface DedicatedServerPageProps {
  category: 'java' | 'bedrock' | 'crossplatform' | 'new' | 'popular' | 'whitelist' | 
           'survival' | 'pvp' | 'creative' | 'skyblock' | 'prison' | 'factions' | 
           'towny' | 'economy' | 'minigames' | 'vanilla' | 'anarchy' | 'bedwars' |
           'build-battle' | 'capture-the-flag' | 'cops-and-robbers' | 'duels' |
           'earth' | 'eggwars' | 'hardcore' | 'hide-and-seek' | 'lucky-block' |
           'mcmmo' | 'murder-mystery' | 'oneblock' | 'paintball' | 'quake' |
           'roleplay' | 'spleef' | 'the-bridge' | 'tnt-run' | 'uhc' | 'walls' |
           'zombies' | 'ftb' | 'hcf' | 'hunger-games' | 'kitpvp' | 'lifesteal' |
           'parkour' | 'pixelmon' | 'pve' | 'rpg' | 'skywars' |
           '1.21' | '1.20' | '1.19' | '1.18';
  onBack: () => void;
  onNavigate: (page: string, category?: string) => void;
  onServerClick?: (slug: string) => void;
}

interface PageConfig {
  title: string;
  description: string;
  breadcrumb: string;
  metaTitle: string;
  metaDescription: string;
  relatedLinks: Array<{
    text: string;
    category: string;
  }>;
}

// ==================== CONSTANTS ====================

const getCategoryInfo = (category: string) => {
  const categoryMap: Record<string, { title: string; description: string; icon: string }> = {
    // Platform categories
    'java': {
      title: 'Java Edition Servers',
      description: 'Discover the best Minecraft Java Edition servers with advanced features, plugins, and gameplay mechanics.',
      icon: '☕'
    },
    'bedrock': {
      title: 'Bedrock Edition Servers', 
      description: 'Find cross-platform Minecraft Bedrock servers compatible with mobile, console, and Windows 10.',
      icon: '📱'
    },
    'crossplatform': {
      title: 'Cross-Platform Servers',
      description: 'Join servers that support both Java and Bedrock editions for maximum compatibility.',
      icon: '🌐'
    },
    
    // Server types
    'new': {
      title: 'New Servers',
      description: 'Explore the newest Minecraft servers recently added to our directory.',
      icon: '🆕'
    },
    'popular': {
      title: 'Popular Servers',
      description: 'Join the most popular Minecraft servers with high player counts and active communities.',
      icon: '🔥'
    },
    'whitelist': {
      title: 'Whitelist Servers',
      description: 'Find exclusive whitelist-only Minecraft servers for a more curated gaming experience.',
      icon: '🔒'
    },
    
    // Gamemode categories
    'survival': {
      title: 'Survival Servers',
      description: 'Experience classic Minecraft survival gameplay with other players in challenging environments.',
      icon: '⚔️'
    },
    'skyblock': {
      title: 'Skyblock Servers',
      description: 'Start on a floating island and build your way to success in these challenging skyblock servers.',
      icon: '🏝️'
    },
    'pvp': {
      title: 'PvP Servers',
      description: 'Test your combat skills against other players in intense player vs player battles.',
      icon: '⚔️'
    },
    'creative': {
      title: 'Creative Servers',
      description: 'Unleash your imagination with unlimited resources and build amazing creations.',
      icon: '🎨'
    },
    'prison': {
      title: 'Prison Servers',
      description: 'Work your way up from prisoner to freedom in these rank-based prison servers.',
      icon: '🔒'
    },
    'factions': {
      title: 'Factions Servers',
      description: 'Form alliances, claim territory, and wage war in competitive faction-based gameplay.',
      icon: '⚔️'
    },
    'bedwars': {
      title: 'Bedwars Servers',
      description: 'Protect your bed while destroying others in this popular team-based minigame.',
      icon: '🛏️'
    },
    'skywars': {
      title: 'Skywars Servers',
      description: 'Battle on floating islands in the sky in this fast-paced PvP minigame.',
      icon: '☁️'
    },
    'towny': {
      title: 'Towny Servers',
      description: 'Build and manage your own town with friends in these community-focused servers.',
      icon: '🏘️'
    },
    'economy': {
      title: 'Economy Servers',
      description: 'Trade, buy, and sell items in servers with complex economic systems.',
      icon: '💰'
    },
    'minigames': {
      title: 'Minigames Servers',
      description: 'Enjoy a variety of fun minigames and activities with other players.',
      icon: '🎮'
    },
    'vanilla': {
      title: 'Vanilla Servers',
      description: 'Experience pure Minecraft gameplay without mods or plugins.',
      icon: '🍦'
    },
    'anarchy': {
      title: 'Anarchy Servers',
      description: 'No rules, no limits - survive in the ultimate lawless Minecraft experience.',
      icon: '💀'
    },
    'kitpvp': {
      title: 'KitPvP Servers',
      description: 'Choose your kit and battle other players in arena-style PvP combat.',
      icon: '🗡️'
    },
    'parkour': {
      title: 'Parkour Servers',
      description: 'Test your jumping skills on challenging parkour courses and obstacle maps.',
      icon: '🏃'
    },
    'rpg': {
      title: 'RPG Servers',
      description: 'Embark on epic quests and adventures in role-playing game servers.',
      icon: '🐉'
    },
    'pixelmon': {
      title: 'Pixelmon Servers',
      description: 'Catch, train, and battle Pokémon in the Minecraft world.',
      icon: '⚡'
    },
    'lifesteal': {
      title: 'Lifesteal Servers',
      description: 'Gain hearts by defeating other players in this unique PvP gamemode.',
      icon: '❤️'
    },
    'mcmmo': {
      title: 'MCMMO Servers',
      description: 'Level up your skills and abilities with the popular MCMMO plugin.',
      icon: '📈'
    },
    'roleplay': {
      title: 'Roleplay Servers',
      description: 'Immerse yourself in character-driven storylines and roleplay scenarios.',
      icon: '🎭'
    },
    'hardcore': {
      title: 'Hardcore Servers',
      description: 'Face the ultimate challenge where death means permanent consequences.',
      icon: '💀'
    },
    'uhc': {
      title: 'UHC Servers',
      description: 'Compete in Ultra Hardcore matches where natural regeneration is disabled.',
      icon: '🏆'
    },
    'hunger-games': {
      title: 'Hunger Games Servers',
      description: 'Fight to be the last player standing in battle royale-style gameplay.',
      icon: '🏹'
    },
    'murder-mystery': {
      title: 'Murder Mystery Servers',
      description: 'Solve crimes and catch the murderer in these detective-style minigames.',
      icon: '🔍'
    },
    'hide-and-seek': {
      title: 'Hide and Seek Servers',
      description: 'Hide from seekers or hunt for hidden players in creative hide and seek maps.',
      icon: '👁️'
    },
    'build-battle': {
      title: 'Build Battle Servers',
      description: 'Compete against other builders in timed building competitions.',
      icon: '🏗️'
    },
    'spleef': {
      title: 'Spleef Servers',
      description: 'Dig blocks beneath other players to make them fall in this classic minigame.',
      icon: '⛏️'
    },
    'tnt-run': {
      title: 'TNT Run Servers',
      description: 'Run across TNT blocks before they explode beneath your feet.',
      icon: '💣'
    },
    'the-bridge': {
      title: 'The Bridge Servers',
      description: 'Build bridges and battle enemies in this strategic team-based minigame.',
      icon: '🌉'
    },
    'capture-the-flag': {
      title: 'Capture the Flag Servers',
      description: 'Work with your team to capture the enemy flag while defending your own.',
      icon: '🚩'
    },
    
    // Version categories
    '1.21': {
      title: 'Minecraft 1.21 Servers',
      description: 'Play on the latest Minecraft 1.21 servers with all the newest features and content.',
      icon: '🆕'
    },
    '1.20': {
      title: 'Minecraft 1.20 Servers',
      description: 'Join Minecraft 1.20 servers featuring the Trails & Tales update content.',
      icon: '🏛️'
    },
    '1.19': {
      title: 'Minecraft 1.19 Servers',
      description: 'Explore Minecraft 1.19 servers with The Wild Update features including the Deep Dark.',
      icon: '🌙'
    },
    '1.18': {
      title: 'Minecraft 1.18 Servers',
      description: 'Experience the Caves & Cliffs update with new world generation and cave systems.',
      icon: '⛰️'
    },
    '1.17': {
      title: 'Minecraft 1.17 Servers',
      description: 'Play on servers featuring the first part of the Caves & Cliffs update.',
      icon: '🗻'
    },
    '1.16': {
      title: 'Minecraft 1.16 Servers',
      description: 'Join servers with the Nether Update featuring new biomes and blocks.',
      icon: '🔥'
    }
  };

  return categoryMap[category] || {
    title: 'Minecraft Servers',
    description: 'Find the best Minecraft servers for your gaming experience.',
    icon: '🎮'
  };
};

const pageConfigs: Record<string, PageConfig> = {
  java: {
    title: 'Java Minecraft Servers',
    description: 'Searching for Java Minecraft servers? Look no further! Here\'s a complete list with all of the top-voted Java mc servers; Every server in our list is checked every few minutes, to make sure they\'re always online. If any server goes offline, it goes to the bottom of the list until it comes back online! Be sure to also check out some PE Minecraft Servers and The Most Popular Minecraft Servers!',
    breadcrumb: 'Java Minecraft Servers',
    metaTitle: 'Java Minecraft Servers - Best Java Edition Server List | ServerCraft',
    metaDescription: 'Find the best Java Minecraft servers! Browse hundreds of Java Edition servers with live player counts, server status, and detailed information. Updated every few minutes.',
    relatedLinks: [
      { text: 'Bedrock Servers', category: 'bedrock' },
      { text: 'Popular Servers', category: 'popular' },
      { text: 'New Servers', category: 'new' }
    ]
  },
  bedrock: {
    title: 'Bedrock Minecraft Servers',
    description: 'Looking for Bedrock Minecraft servers? You\'ve found the right place! Our comprehensive list features the best Bedrock Edition servers for mobile, console, and Windows 10. All servers are monitored continuously to ensure they\'re online and ready for players. Don\'t forget to check out our Java Servers and Cross-Platform Servers too!',
    breadcrumb: 'Bedrock Minecraft Servers',
    metaTitle: 'Bedrock Minecraft Servers - Best PE & Console Server List | ServerCraft',
    metaDescription: 'Discover the best Bedrock Minecraft servers for mobile, Xbox, PlayStation, Nintendo Switch, and Windows 10. Live server status and player counts updated in real-time.',
    relatedLinks: [
      { text: 'Java Servers', category: 'java' },
      { text: 'Cross-Platform Servers', category: 'crossplatform' },
      { text: 'Popular Servers', category: 'popular' }
    ]
  },
  crossplatform: {
    title: 'Cross-Platform Minecraft Servers',
    description: 'Want to play with friends on different devices? Our Cross-Platform Minecraft servers support both Java and Bedrock editions! These servers allow Java PC players to play alongside Bedrock mobile and console players. All servers are verified and monitored for uptime. Also explore our dedicated Java Servers and Bedrock Servers!',
    breadcrumb: 'Cross-Platform Minecraft Servers',
    metaTitle: 'Cross-Platform Minecraft Servers - Java & Bedrock Compatible | ServerCraft',
    metaDescription: 'Find Cross-Platform Minecraft servers that support both Java and Bedrock editions. Play with friends across PC, mobile, Xbox, PlayStation, and Nintendo Switch.',
    relatedLinks: [
      { text: 'Java Servers', category: 'java' },
      { text: 'Bedrock Servers', category: 'bedrock' },
      { text: 'Popular Servers', category: 'popular' }
    ]
  },
  new: {
    title: 'New Minecraft Servers',
    description: 'Discover the newest Minecraft servers! Our list features recently launched servers with fresh communities, unique features, and exciting gameplay. These servers are perfect for players looking to be part of something new from the ground up. All servers are verified and checked regularly for availability. Check out our Popular Servers and Java Servers too!',
    breadcrumb: 'New Minecraft Servers',
    metaTitle: 'New Minecraft Servers - Recently Launched Server List | ServerCraft',
    metaDescription: 'Find the newest Minecraft servers with fresh communities and unique features. Join recently launched servers and be part of growing communities from the start.',
    relatedLinks: [
      { text: 'Popular Servers', category: 'popular' },
      { text: 'Java Servers', category: 'java' },
      { text: 'Bedrock Servers', category: 'bedrock' }
    ]
  },
  popular: {
    title: 'Popular Minecraft Servers',
    description: 'Looking for the most popular Minecraft servers? You\'ve come to the right place! Our list showcases the top-voted and most active Minecraft servers with the highest player counts and best communities. These servers have proven themselves with consistent uptime and engaging gameplay. Don\'t miss our New Servers and Java Servers sections!',
    breadcrumb: 'Popular Minecraft Servers',
    metaTitle: 'Popular Minecraft Servers - Top Voted Server List | ServerCraft',
    metaDescription: 'Discover the most popular Minecraft servers with the highest player counts and best communities. Top-voted servers with proven track records and engaging gameplay.',
    relatedLinks: [
      { text: 'New Servers', category: 'new' },
      { text: 'Java Servers', category: 'java' },
      { text: 'Whitelist Servers', category: 'whitelist' }
    ]
  },
  whitelist: {
    title: 'Whitelist Minecraft Servers',
    description: 'Searching for Whitelist Minecraft servers? These exclusive servers require approval to join, ensuring a more curated and often higher-quality gaming experience. Whitelist servers typically have closer-knit communities, better moderation, and unique gameplay experiences. All servers are monitored for uptime and availability. Also browse our Popular Servers and Java Servers!',
    breadcrumb: 'Whitelist Minecraft Servers',
    metaTitle: 'Whitelist Minecraft Servers - Exclusive Server List | ServerCraft',
    metaDescription: 'Find exclusive Whitelist Minecraft servers that require approval to join. Discover curated communities with high-quality gameplay and better moderation.',
    relatedLinks: [
      { text: 'Popular Servers', category: 'popular' },
      { text: 'Java Servers', category: 'java' },
      { text: 'New Servers', category: 'new' }
    ]
  },
  // Gamemode pages
  survival: {
    title: 'Survival Minecraft Servers',
    description: 'Looking for the best Survival Minecraft servers? Our comprehensive list features top-rated survival servers where you can build, explore, and survive in the classic Minecraft experience. All servers are monitored for uptime and player activity.',
    breadcrumb: 'Survival Minecraft Servers',
    metaTitle: 'Survival Minecraft Servers - Best Survival Server List | ServerCraft',
    metaDescription: 'Find the best Survival Minecraft servers with active communities, regular updates, and engaging survival gameplay. Updated in real-time.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Creative Servers', category: 'creative' },
      { text: 'Skyblock Servers', category: 'skyblock' }
    ]
  },
  pvp: {
    title: 'PvP Minecraft Servers',
    description: 'Ready for intense Player vs Player combat? Our PvP Minecraft servers offer the best competitive gameplay with factions, arenas, and combat-focused features. Join servers with active PvP communities and prove your skills!',
    breadcrumb: 'PvP Minecraft Servers',
    metaTitle: 'PvP Minecraft Servers - Best Player vs Player Server List | ServerCraft',
    metaDescription: 'Discover the best PvP Minecraft servers with competitive gameplay, factions, arenas, and active combat communities. Real-time server status.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Factions Servers', category: 'factions' },
      { text: 'KitPvP Servers', category: 'kitpvp' }
    ]
  },
  creative: {
    title: 'Creative Minecraft Servers',
    description: 'Unleash your creativity on the best Creative Minecraft servers! Build amazing structures with unlimited resources, participate in building competitions, and showcase your architectural skills. Perfect for builders and artists.',
    breadcrumb: 'Creative Minecraft Servers',
    metaTitle: 'Creative Minecraft Servers - Best Building Server List | ServerCraft',
    metaDescription: 'Find the best Creative Minecraft servers for building, architecture, and artistic expression. Unlimited resources and active building communities.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Towny Servers', category: 'towny' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  skyblock: {
    title: 'Skyblock Minecraft Servers',
    description: 'Start with nothing but a small island in the sky! Our Skyblock Minecraft servers offer the ultimate survival challenge where you must expand your island, complete challenges, and build your empire in the void.',
    breadcrumb: 'Skyblock Minecraft Servers',
    metaTitle: 'Skyblock Minecraft Servers - Best Island Survival Server List | ServerCraft',
    metaDescription: 'Discover the best Skyblock Minecraft servers with island challenges, economy systems, and unique survival gameplay in the sky.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Prison Servers', category: 'prison' },
      { text: 'Economy Servers', category: 'economy' }
    ]
  },
  prison: {
    title: 'Prison Minecraft Servers',
    description: 'Experience the unique Prison gamemode! Start as a prisoner and work your way up through ranks by mining, earning money, and completing tasks. Our Prison servers feature complex economies and progression systems.',
    breadcrumb: 'Prison Minecraft Servers',
    metaTitle: 'Prison Minecraft Servers - Best Prison Server List | ServerCraft',
    metaDescription: 'Find the best Prison Minecraft servers with ranking systems, economies, and unique prison-themed gameplay. Mine your way to freedom!',
    relatedLinks: [
      { text: 'Skyblock Servers', category: 'skyblock' },
      { text: 'Economy Servers', category: 'economy' },
      { text: 'Survival Servers', category: 'survival' }
    ]
  },
  factions: {
    title: 'Factions Minecraft Servers',
    description: 'Join or create powerful factions in our Factions Minecraft servers! Engage in territorial warfare, build impenetrable bases, and dominate the battlefield with your allies. Features raiding, claiming, and intense PvP combat.',
    breadcrumb: 'Factions Minecraft Servers',
    metaTitle: 'Factions Minecraft Servers - Best Faction PvP Server List | ServerCraft',
    metaDescription: 'Discover the best Factions Minecraft servers with territorial warfare, base building, raiding, and competitive faction gameplay.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Towny Servers', category: 'towny' }
    ]
  },
  towny: {
    title: 'Towny Minecraft Servers',
    description: 'Build and manage your own town in our Towny Minecraft servers! Create civilizations, establish governments, and collaborate with other towns. Features land protection, economies, and community-focused gameplay.',
    breadcrumb: 'Towny Minecraft Servers',
    metaTitle: 'Towny Minecraft Servers - Best Town Building Server List | ServerCraft',
    metaDescription: 'Find the best Towny Minecraft servers for building towns, creating nations, and collaborative community gameplay with land protection.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Economy Servers', category: 'economy' },
      { text: 'Creative Servers', category: 'creative' }
    ]
  },
  economy: {
    title: 'Economy Minecraft Servers',
    description: 'Master the art of trade and commerce in our Economy Minecraft servers! Buy, sell, and trade your way to wealth with complex economic systems, shops, and player-driven markets.',
    breadcrumb: 'Economy Minecraft Servers',
    metaTitle: 'Economy Minecraft Servers - Best Trading Server List | ServerCraft',
    metaDescription: 'Discover Economy Minecraft servers with complex trading systems, player shops, and market-driven gameplay. Build your fortune!',
    relatedLinks: [
      { text: 'Towny Servers', category: 'towny' },
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Prison Servers', category: 'prison' }
    ]
  },
  minigames: {
    title: 'Minigames Minecraft Servers',
    description: 'Enjoy endless variety with our Minigames Minecraft servers! From parkour and spleef to hunger games and build battles, these servers offer quick, fun games perfect for casual play and competition.',
    breadcrumb: 'Minigames Minecraft Servers',
    metaTitle: 'Minigames Minecraft Servers - Best Mini-Game Server List | ServerCraft',
    metaDescription: 'Find the best Minigames Minecraft servers with parkour, hunger games, build battles, and countless fun mini-games for all players.',
    relatedLinks: [
      { text: 'Creative Servers', category: 'creative' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Parkour Servers', category: 'parkour' }
    ]
  },
  vanilla: {
    title: 'Vanilla Minecraft Servers',
    description: 'Experience pure, unmodified Minecraft gameplay on our Vanilla servers! No plugins, no modifications - just the authentic Minecraft experience as intended by Mojang. Perfect for purists and classic gameplay lovers.',
    breadcrumb: 'Vanilla Minecraft Servers',
    metaTitle: 'Vanilla Minecraft Servers - Pure Minecraft Server List | ServerCraft',
    metaDescription: 'Find the best Vanilla Minecraft servers with pure, unmodified gameplay. No plugins, just authentic Minecraft as intended.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Whitelist Servers', category: 'whitelist' },
      { text: 'New Servers', category: 'new' }
    ]
  },
  anarchy: {
    title: 'Anarchy Minecraft Servers',
    description: 'Enter the lawless world of Anarchy Minecraft servers! No rules, no restrictions, no admin interference. Survive in the ultimate hardcore environment where anything goes and only the strongest survive.',
    breadcrumb: 'Anarchy Minecraft Servers',
    metaTitle: 'Anarchy Minecraft Servers - No Rules Server List | ServerCraft',
    metaDescription: 'Discover Anarchy Minecraft servers with no rules, no restrictions, and ultimate freedom. Hardcore survival for experienced players.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Vanilla Servers', category: 'vanilla' }
    ]
  },
  bedwars: {
    title: 'Bedwars Minecraft Servers',
    description: 'Experience intense team-based combat in Bedwars! Protect your bed while destroying enemy beds in this fast-paced PvP gamemode. Our Bedwars servers feature multiple maps, team sizes, and competitive gameplay.',
    breadcrumb: 'Bedwars Minecraft Servers',
    metaTitle: 'Bedwars Minecraft Servers - Best Team PvP Server List | ServerCraft',
    metaDescription: 'Find the best Bedwars Minecraft servers with team-based combat, bed protection, and competitive PvP gameplay.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Skywars Servers', category: 'skywars' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  'build-battle': {
    title: 'Build Battle Minecraft Servers',
    description: 'Show off your building skills in Build Battle competitions! Compete against other players in timed building challenges with various themes and voting systems.',
    breadcrumb: 'Build Battle Minecraft Servers',
    metaTitle: 'Build Battle Minecraft Servers - Building Competition Server List | ServerCraft',
    metaDescription: 'Discover Build Battle Minecraft servers with building competitions, creative challenges, and community voting systems.',
    relatedLinks: [
      { text: 'Creative Servers', category: 'creative' },
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Survival Servers', category: 'survival' }
    ]
  },
  'capture-the-flag': {
    title: 'Capture the Flag Minecraft Servers',
    description: 'Engage in strategic team warfare with Capture the Flag! Work with your team to capture the enemy flag while defending your own in these tactical PvP servers.',
    breadcrumb: 'Capture the Flag Minecraft Servers',
    metaTitle: 'Capture the Flag Minecraft Servers - Team Strategy Server List | ServerCraft',
    metaDescription: 'Find Capture the Flag Minecraft servers with strategic team gameplay, flag capturing, and tactical PvP combat.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Factions Servers', category: 'factions' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  'cops-and-robbers': {
    title: 'Cops and Robbers Minecraft Servers',
    description: 'Choose your side in the ultimate game of Cops and Robbers! Play as law enforcement catching criminals or as robbers planning the perfect heist.',
    breadcrumb: 'Cops and Robbers Minecraft Servers',
    metaTitle: 'Cops and Robbers Minecraft Servers - Crime Roleplay Server List | ServerCraft',
    metaDescription: 'Discover Cops and Robbers Minecraft servers with crime roleplay, heist gameplay, and law enforcement action.',
    relatedLinks: [
      { text: 'Roleplay Servers', category: 'roleplay' },
      { text: 'Prison Servers', category: 'prison' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  duels: {
    title: 'Duels Minecraft Servers',
    description: 'Test your PvP skills in 1v1 duels! Challenge other players to combat in various arenas with different kits and weapons. Perfect for competitive players.',
    breadcrumb: 'Duels Minecraft Servers',
    metaTitle: 'Duels Minecraft Servers - 1v1 PvP Combat Server List | ServerCraft',
    metaDescription: 'Find the best Duels Minecraft servers with 1v1 combat, multiple arenas, and competitive PvP gameplay.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'KitPvP Servers', category: 'kitpvp' },
      { text: 'UHC Servers', category: 'uhc' }
    ]
  },
  earth: {
    title: 'Earth Minecraft Servers',
    description: 'Explore a 1:1 scale replica of Earth in Minecraft! Build civilizations, claim territories, and interact with players from around the world on these massive Earth map servers.',
    breadcrumb: 'Earth Minecraft Servers',
    metaTitle: 'Earth Minecraft Servers - Real World Map Server List | ServerCraft',
    metaDescription: 'Discover Earth Minecraft servers with 1:1 scale world maps, nation building, and global civilization gameplay.',
    relatedLinks: [
      { text: 'Towny Servers', category: 'towny' },
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Economy Servers', category: 'economy' }
    ]
  },
  eggwars: {
    title: 'Eggwars Minecraft Servers',
    description: 'Protect your egg while destroying enemy eggs in this exciting team-based gamemode! Similar to Bedwars but with unique mechanics and strategies.',
    breadcrumb: 'Eggwars Minecraft Servers',
    metaTitle: 'Eggwars Minecraft Servers - Team Protection Server List | ServerCraft',
    metaDescription: 'Find Eggwars Minecraft servers with team-based gameplay, egg protection mechanics, and strategic combat.',
    relatedLinks: [
      { text: 'Bedwars Servers', category: 'bedwars' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  hardcore: {
    title: 'Hardcore Minecraft Servers',
    description: 'Experience the ultimate challenge in Hardcore mode! One life, maximum difficulty, and permanent consequences. Only for the most skilled and brave players.',
    breadcrumb: 'Hardcore Minecraft Servers',
    metaTitle: 'Hardcore Minecraft Servers - Ultimate Challenge Server List | ServerCraft',
    metaDescription: 'Discover Hardcore Minecraft servers with one-life gameplay, maximum difficulty, and ultimate survival challenges.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'UHC Servers', category: 'uhc' },
      { text: 'Anarchy Servers', category: 'anarchy' }
    ]
  },
  'hide-and-seek': {
    title: 'Hide and Seek Minecraft Servers',
    description: 'Play the classic game of Hide and Seek in Minecraft! Transform into blocks and hide from seekers, or hunt down hidden players in creative maps.',
    breadcrumb: 'Hide and Seek Minecraft Servers',
    metaTitle: 'Hide and Seek Minecraft Servers - Block Hunt Server List | ServerCraft',
    metaDescription: 'Find Hide and Seek Minecraft servers with block transformation, creative maps, and fun party gameplay.',
    relatedLinks: [
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Murder Mystery Servers', category: 'murder-mystery' },
      { text: 'Creative Servers', category: 'creative' }
    ]
  },
  'lucky-block': {
    title: 'Lucky Block Minecraft Servers',
    description: 'Break Lucky Blocks for random rewards and surprises! From powerful weapons to dangerous traps, every block is a gamble in these exciting servers.',
    breadcrumb: 'Lucky Block Minecraft Servers',
    metaTitle: 'Lucky Block Minecraft Servers - Random Rewards Server List | ServerCraft',
    metaDescription: 'Discover Lucky Block Minecraft servers with random rewards, surprise items, and unpredictable gameplay mechanics.',
    relatedLinks: [
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Skywars Servers', category: 'skywars' }
    ]
  },
  mcmmo: {
    title: 'MCMMO Minecraft Servers',
    description: 'Level up your skills with MCMMO! Gain experience in various skills like mining, combat, and crafting. Features skill trees, special abilities, and RPG elements.',
    breadcrumb: 'MCMMO Minecraft Servers',
    metaTitle: 'MCMMO Minecraft Servers - RPG Skills Server List | ServerCraft',
    metaDescription: 'Find MCMMO Minecraft servers with skill leveling, RPG elements, and character progression systems.',
    relatedLinks: [
      { text: 'RPG Servers', category: 'rpg' },
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Economy Servers', category: 'economy' }
    ]
  },
  'murder-mystery': {
    title: 'Murder Mystery Minecraft Servers',
    description: 'Solve crimes and catch killers in Murder Mystery! Play as innocent, detective, or murderer in these thrilling social deduction games.',
    breadcrumb: 'Murder Mystery Minecraft Servers',
    metaTitle: 'Murder Mystery Minecraft Servers - Detective Game Server List | ServerCraft',
    metaDescription: 'Discover Murder Mystery Minecraft servers with detective gameplay, social deduction, and thrilling mystery solving.',
    relatedLinks: [
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Hide and Seek Servers', category: 'hide-and-seek' },
      { text: 'Roleplay Servers', category: 'roleplay' }
    ]
  },
  oneblock: {
    title: 'OneBlock Minecraft Servers',
    description: 'Start with just one block and expand your world! Break the block to get resources and gradually unlock new phases in this unique survival challenge.',
    breadcrumb: 'OneBlock Minecraft Servers',
    metaTitle: 'OneBlock Minecraft Servers - Single Block Challenge Server List | ServerCraft',
    metaDescription: 'Find OneBlock Minecraft servers with single block challenges, phase progression, and unique survival gameplay.',
    relatedLinks: [
      { text: 'Skyblock Servers', category: 'skyblock' },
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Economy Servers', category: 'economy' }
    ]
  },
  paintball: {
    title: 'Paintball Minecraft Servers',
    description: 'Engage in colorful combat with Paintball! Use paintball guns to eliminate opponents in team-based matches across various maps and game modes.',
    breadcrumb: 'Paintball Minecraft Servers',
    metaTitle: 'Paintball Minecraft Servers - Colorful Combat Server List | ServerCraft',
    metaDescription: 'Discover Paintball Minecraft servers with team combat, colorful weapons, and competitive paintball gameplay.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Duels Servers', category: 'duels' }
    ]
  },
  quake: {
    title: 'Quake Minecraft Servers',
    description: 'Fast-paced arena combat inspired by Quake! Use special weapons and movement mechanics in intense PvP battles with quick respawns.',
    breadcrumb: 'Quake Minecraft Servers',
    metaTitle: 'Quake Minecraft Servers - Arena Combat Server List | ServerCraft',
    metaDescription: 'Find Quake Minecraft servers with fast-paced arena combat, special weapons, and intense PvP action.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Duels Servers', category: 'duels' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  roleplay: {
    title: 'Roleplay Minecraft Servers',
    description: 'Immerse yourself in character roleplay! Create unique characters, follow storylines, and interact with others in immersive roleplay environments.',
    breadcrumb: 'Roleplay Minecraft Servers',
    metaTitle: 'Roleplay Minecraft Servers - Character RP Server List | ServerCraft',
    metaDescription: 'Discover Roleplay Minecraft servers with character creation, storylines, and immersive RP communities.',
    relatedLinks: [
      { text: 'RPG Servers', category: 'rpg' },
      { text: 'Towny Servers', category: 'towny' },
      { text: 'Economy Servers', category: 'economy' }
    ]
  },
  spleef: {
    title: 'Spleef Minecraft Servers',
    description: 'Break blocks beneath your opponents in the classic Spleef gamemode! Last player standing wins in this simple but addictive competitive game.',
    breadcrumb: 'Spleef Minecraft Servers',
    metaTitle: 'Spleef Minecraft Servers - Block Breaking Game Server List | ServerCraft',
    metaDescription: 'Find Spleef Minecraft servers with competitive block breaking, tournament modes, and classic Spleef gameplay.',
    relatedLinks: [
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'TNT Run Servers', category: 'tnt-run' }
    ]
  },
  'the-bridge': {
    title: 'The Bridge Minecraft Servers',
    description: 'Cross the bridge and score goals in this unique PvP gamemode! Combine parkour, combat, and strategy to outmaneuver your opponents.',
    breadcrumb: 'The Bridge Minecraft Servers',
    metaTitle: 'The Bridge Minecraft Servers - Bridge Combat Server List | ServerCraft',
    metaDescription: 'Discover The Bridge Minecraft servers with bridge crossing, goal scoring, and strategic PvP gameplay.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Parkour Servers', category: 'parkour' }
    ]
  },
  'tnt-run': {
    title: 'TNT Run Minecraft Servers',
    description: 'Run for your life as blocks disappear beneath your feet! Avoid falling into the void in this fast-paced survival minigame.',
    breadcrumb: 'TNT Run Minecraft Servers',
    metaTitle: 'TNT Run Minecraft Servers - Block Disappearing Game Server List | ServerCraft',
    metaDescription: 'Find TNT Run Minecraft servers with disappearing blocks, survival gameplay, and fast-paced action.',
    relatedLinks: [
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Spleef Servers', category: 'spleef' },
      { text: 'Parkour Servers', category: 'parkour' }
    ]
  },
  uhc: {
    title: 'UHC Minecraft Servers',
    description: 'Ultra Hardcore survival with no natural regeneration! Gather resources, craft golden apples, and fight to be the last player standing.',
    breadcrumb: 'UHC Minecraft Servers',
    metaTitle: 'UHC Minecraft Servers - Ultra Hardcore Server List | ServerCraft',
    metaDescription: 'Discover UHC (Ultra Hardcore) Minecraft servers with no regeneration, survival combat, and competitive gameplay.',
    relatedLinks: [
      { text: 'Hardcore Servers', category: 'hardcore' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Survival Servers', category: 'survival' }
    ]
  },
  walls: {
    title: 'Walls Minecraft Servers',
    description: 'Prepare behind protective walls before they drop! Gather resources and gear up for intense PvP combat when the walls fall.',
    breadcrumb: 'Walls Minecraft Servers',
    metaTitle: 'Walls Minecraft Servers - Preparation PvP Server List | ServerCraft',
    metaDescription: 'Find Walls Minecraft servers with preparation phases, wall dropping mechanics, and strategic PvP combat.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'UHC Servers', category: 'uhc' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  zombies: {
    title: 'Zombies Minecraft Servers',
    description: 'Survive waves of zombies in this thrilling survival gamemode! Work together to build defenses and survive increasingly difficult zombie hordes.',
    breadcrumb: 'Zombies Minecraft Servers',
    metaTitle: 'Zombies Minecraft Servers - Zombie Survival Server List | ServerCraft',
    metaDescription: 'Discover Zombies Minecraft servers with wave survival, cooperative gameplay, and zombie horde challenges.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'PvE Servers', category: 'pve' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  ftb: {
    title: 'FTB Minecraft Servers',
    description: 'Feed The Beast modded Minecraft servers! Experience heavily modded gameplay with technology, magic, and automation mods for endless possibilities.',
    breadcrumb: 'FTB Minecraft Servers',
    metaTitle: 'FTB Minecraft Servers - Feed The Beast Modded Server List | ServerCraft',
    metaDescription: 'Find FTB (Feed The Beast) Minecraft servers with modded gameplay, technology mods, and automation systems.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Economy Servers', category: 'economy' },
      { text: 'Creative Servers', category: 'creative' }
    ]
  },
  hcf: {
    title: 'HCF Minecraft Servers',
    description: 'Hardcore Factions with deathbans and intense PvP! Experience the most competitive faction gameplay with permanent consequences and skilled combat.',
    breadcrumb: 'HCF Minecraft Servers',
    metaTitle: 'HCF Minecraft Servers - Hardcore Factions Server List | ServerCraft',
    metaDescription: 'Discover HCF (Hardcore Factions) Minecraft servers with deathbans, competitive PvP, and intense faction warfare.',
    relatedLinks: [
      { text: 'Factions Servers', category: 'factions' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Hardcore Servers', category: 'hardcore' }
    ]
  },
  'hunger-games': {
    title: 'Hunger Games Minecraft Servers',
    description: 'Fight to the death in Hunger Games arenas! Scavenge for supplies, form alliances, and be the last player standing in these battle royale servers.',
    breadcrumb: 'Hunger Games Minecraft Servers',
    metaTitle: 'Hunger Games Minecraft Servers - Battle Royale Server List | ServerCraft',
    metaDescription: 'Find Hunger Games Minecraft servers with battle royale gameplay, survival combat, and arena-based PvP.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'UHC Servers', category: 'uhc' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  kitpvp: {
    title: 'KitPvP Minecraft Servers',
    description: 'Choose your kit and fight! Select from various pre-made loadouts and engage in fast-paced PvP combat with different strategies and playstyles.',
    breadcrumb: 'KitPvP Minecraft Servers',
    metaTitle: 'KitPvP Minecraft Servers - Kit Combat Server List | ServerCraft',
    metaDescription: 'Discover KitPvP Minecraft servers with pre-made loadouts, fast-paced combat, and diverse PvP strategies.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Duels Servers', category: 'duels' },
      { text: 'Factions Servers', category: 'factions' }
    ]
  },
  lifesteal: {
    title: 'Lifesteal Minecraft Servers',
    description: 'Steal hearts from other players in this unique SMP gamemode! When you kill someone, you gain their heart. Lose all hearts and face consequences.',
    breadcrumb: 'Lifesteal Minecraft Servers',
    metaTitle: 'Lifesteal Minecraft Servers - Heart Stealing SMP Server List | ServerCraft',
    metaDescription: 'Find Lifesteal Minecraft servers with heart stealing mechanics, unique SMP gameplay, and high-stakes PvP.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Hardcore Servers', category: 'hardcore' }
    ]
  },
  parkour: {
    title: 'Parkour Minecraft Servers',
    description: 'Master the art of movement with challenging parkour courses! Jump, climb, and navigate through creative obstacle courses and time trials.',
    breadcrumb: 'Parkour Minecraft Servers',
    metaTitle: 'Parkour Minecraft Servers - Movement Challenge Server List | ServerCraft',
    metaDescription: 'Discover Parkour Minecraft servers with challenging courses, time trials, and creative movement obstacles.',
    relatedLinks: [
      { text: 'Minigames Servers', category: 'minigames' },
      { text: 'Creative Servers', category: 'creative' },
      { text: 'The Bridge Servers', category: 'the-bridge' }
    ]
  },
  pixelmon: {
    title: 'Pixelmon Minecraft Servers',
    description: 'Catch them all in Minecraft! Pixelmon servers bring Pokémon into Minecraft with catching, battling, and training mechanics.',
    breadcrumb: 'Pixelmon Minecraft Servers',
    metaTitle: 'Pixelmon Minecraft Servers - Pokémon Mod Server List | ServerCraft',
    metaDescription: 'Find Pixelmon Minecraft servers with Pokémon catching, battling, and training in the Minecraft world.',
    relatedLinks: [
      { text: 'RPG Servers', category: 'rpg' },
      { text: 'Survival Servers', category: 'survival' },
      { text: 'Economy Servers', category: 'economy' }
    ]
  },
  pve: {
    title: 'PvE Minecraft Servers',
    description: 'Player vs Environment focused gameplay! Fight monsters, complete quests, and explore dungeons without worrying about other players attacking you.',
    breadcrumb: 'PvE Minecraft Servers',
    metaTitle: 'PvE Minecraft Servers - Player vs Environment Server List | ServerCraft',
    metaDescription: 'Discover PvE Minecraft servers with monster fighting, quest systems, and cooperative gameplay.',
    relatedLinks: [
      { text: 'Survival Servers', category: 'survival' },
      { text: 'RPG Servers', category: 'rpg' },
      { text: 'Zombies Servers', category: 'zombies' }
    ]
  },
  rpg: {
    title: 'RPG Minecraft Servers',
    description: 'Embark on epic adventures in RPG servers! Level up, complete quests, choose classes, and explore custom worlds with rich storylines.',
    breadcrumb: 'RPG Minecraft Servers',
    metaTitle: 'RPG Minecraft Servers - Role Playing Game Server List | ServerCraft',
    metaDescription: 'Find RPG Minecraft servers with character progression, quest systems, and immersive role-playing gameplay.',
    relatedLinks: [
      { text: 'MCMMO Servers', category: 'mcmmo' },
      { text: 'Roleplay Servers', category: 'roleplay' },
      { text: 'Survival Servers', category: 'survival' }
    ]
  },
  skywars: {
    title: 'Skywars Minecraft Servers',
    description: 'Battle on floating islands in the sky! Loot chests, build bridges, and fight other players in this popular PvP gamemode with unique maps.',
    breadcrumb: 'Skywars Minecraft Servers',
    metaTitle: 'Skywars Minecraft Servers - Sky Island PvP Server List | ServerCraft',
    metaDescription: 'Discover Skywars Minecraft servers with floating island combat, chest looting, and competitive sky battles.',
    relatedLinks: [
      { text: 'PvP Servers', category: 'pvp' },
      { text: 'Bedwars Servers', category: 'bedwars' },
      { text: 'Minigames Servers', category: 'minigames' }
    ]
  },
  // Version pages
  '1.21': {
    title: 'Minecraft 1.21 Servers',
    description: 'Play on the latest Minecraft 1.21 servers! Experience all the newest features, blocks, and gameplay mechanics with servers running the most recent version of Minecraft.',
    breadcrumb: 'Minecraft 1.21 Servers',
    metaTitle: 'Minecraft 1.21 Servers - Latest Version Server List | ServerCraft',
    metaDescription: 'Find Minecraft 1.21 servers with the latest features and updates. Play on cutting-edge servers with the newest content.',
    relatedLinks: [
      { text: '1.20 Servers', category: '1.20' },
      { text: '1.19 Servers', category: '1.19' },
      { text: 'Java Servers', category: 'java' }
    ]
  },
  '1.20': {
    title: 'Minecraft 1.20 Servers',
    description: 'Join Minecraft 1.20 servers featuring the Trails & Tales update! Explore archaeology, new biomes, and enjoy stable gameplay on well-established servers running version 1.20.',
    breadcrumb: 'Minecraft 1.20 Servers',
    metaTitle: 'Minecraft 1.20 Servers - Trails & Tales Server List | ServerCraft',
    metaDescription: 'Discover Minecraft 1.20 servers with archaeology, new biomes, and Trails & Tales features. Stable and feature-rich gameplay.',
    relatedLinks: [
      { text: '1.21 Servers', category: '1.21' },
      { text: '1.19 Servers', category: '1.19' },
      { text: 'Java Servers', category: 'java' }
    ]
  },
  '1.19': {
    title: 'Minecraft 1.19 Servers',
    description: 'Experience the Wild Update on Minecraft 1.19 servers! Discover the Deep Dark, Ancient Cities, and the terrifying Warden on servers optimized for version 1.19 gameplay.',
    breadcrumb: 'Minecraft 1.19 Servers',
    metaTitle: 'Minecraft 1.19 Servers - Wild Update Server List | ServerCraft',
    metaDescription: 'Find Minecraft 1.19 servers with Deep Dark biomes, Ancient Cities, and Wild Update features. Explore the latest content.',
    relatedLinks: [
      { text: '1.20 Servers', category: '1.20' },
      { text: '1.18 Servers', category: '1.18' },
      { text: 'Java Servers', category: 'java' }
    ]
  },
  '1.18': {
    title: 'Minecraft 1.18 Servers',
    description: 'Explore the Caves & Cliffs update on Minecraft 1.18 servers! Experience new world generation, expanded caves, and mountain biomes on servers running the transformative 1.18 update.',
    breadcrumb: 'Minecraft 1.18 Servers',
    metaTitle: 'Minecraft 1.18 Servers - Caves & Cliffs Server List | ServerCraft',
    metaDescription: 'Discover Minecraft 1.18 servers with new world generation, expanded caves, and Caves & Cliffs features.',
    relatedLinks: [
      { text: '1.19 Servers', category: '1.19' },
      { text: '1.17 Servers', category: '1.17' },
      { text: 'Java Servers', category: 'java' }
    ]
  }
};

// ==================== COMPONENT ====================

export const DedicatedServerPage: React.FC<DedicatedServerPageProps> = ({ category, onBack, onNavigate, onServerClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [currentSortBy, setCurrentSortBy] = useState('votes');
  const [categoryDetails, setCategoryDetails] = useState(getCategoryDefinition(category));
  const config = pageConfigs[category];

  // ==================== EFFECTS ====================

  useEffect(() => {
    // Update category details when category changes
    setCategoryDetails(getCategoryDefinition(category));
    
    // Check if category is valid
    if (!isCategoryValid(category)) {
      return;
    }
    
    // Reset filters when category changes
    setSelectedCountry('all');
    
    // Set default sort based on category
    if (category === 'new') {
      setCurrentSortBy('latest');
    } else if (category === 'popular') {
      setCurrentSortBy('votes');
    } else {
      setCurrentSortBy('votes');
    }
    
    // Enhanced SEO title with more keywords
    const enhancedTitle = `${config.metaTitle} | 2025 Updated List | Live Player Counts | ServerCraft`;
    document.title = enhancedTitle;
    
    // Enhanced meta description with more compelling copy
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const enhancedDescription = `${config.metaDescription} ⚡ Live server status updated every minute 🎮 ${getServerCountText(category)} 📊 Real-time player counts 🔥 Join the best ${category} servers in 2025! All servers verified and monitored 24/7. Find your perfect Minecraft server today!`;
      metaDescription.setAttribute('content', enhancedDescription);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      const enhancedKeywords = `${generateKeywords(category)}, minecraft server list 2025, best minecraft servers 2025, live minecraft servers, verified minecraft servers, minecraft server directory, minecraft server browser, minecraft server finder, online minecraft servers, active minecraft servers, minecraft multiplayer servers, minecraft server status, minecraft server monitoring`;
      metaKeywords.setAttribute('content', enhancedKeywords);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `🎮 ${config.title} | Live Player Counts | ServerCraft 2025`);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', `🚀 ${config.metaDescription.substring(0, 150)}... Join thousands of players on verified ${category} servers!`);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://servercraft.net/${category}`);
    }

    // Add Open Graph image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', `https://servercraft.net/logo_hd.webp`);
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', `🎮 ${config.title} | Live Player Counts | 2025`);
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', `🚀 ${config.metaDescription.substring(0, 180)}...`);
    }

    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', `https://servercraft.net/${category}`);
    }

    // Add Twitter image
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', `https://servercraft.net/logo_hd.webp`);
    }

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://servercraft.net/${category}`);
    }

    // Add structured data for the category page
    addStructuredData();

    return () => {
      // Reset title when component unmounts
      document.title = 'Best Minecraft Server List 2025 - 10,000+ Servers | ServerCraft';
      
      // Reset meta tags
      if (metaDescription) {
        metaDescription.setAttribute('content', '🎮 Find the BEST Minecraft servers in 2025! 10,000+ verified servers ✅ Live player counts ⚡ Java, Bedrock & PE support 📱 Survival, PvP, Skyblock, Prison & more! Updated every minute.');
      }
      
      if (canonical) {
        canonical.setAttribute('href', 'https://servercraft.net/');
      }
    };
  }, [category, config]);

  // ==================== HANDLERS ====================

  const getServerCountText = (category: string): string => {
    const counts: Record<string, string> = {
      java: '5,000+ Java Edition servers',
      bedrock: '2,000+ Bedrock Edition servers', 
      crossplatform: '1,500+ Cross-Platform servers',
      survival: '3,000+ Survival servers',
      pvp: '1,800+ PvP servers',
      creative: '1,200+ Creative servers',
      skyblock: '2,500+ Skyblock servers',
      prison: '800+ Prison servers',
      factions: '1,000+ Factions servers',
      towny: '600+ Towny servers',
      economy: '900+ Economy servers',
      minigames: '1,100+ Minigames servers',
      vanilla: '400+ Vanilla servers',
      anarchy: '200+ Anarchy servers',
      new: '500+ newly added servers',
      popular: '1,000+ top-rated servers',
      whitelist: '300+ exclusive whitelist servers',
      '1.21': '2,000+ Minecraft 1.21 servers',
      '1.20': '3,500+ Minecraft 1.20 servers',
      '1.19': '2,800+ Minecraft 1.19 servers',
      '1.18': '1,500+ Minecraft 1.18 servers'
    };
    return counts[category] || '1,000+ servers';
  };

  const generateKeywords = (category: string): string => {
    const baseKeywords = 'minecraft servers, minecraft server list, best minecraft servers, free minecraft servers';
    
    const categoryKeywords: Record<string, string> = {
      java: 'java minecraft servers, minecraft java edition servers, pc minecraft servers, java edition server list, minecraft java servers 2025, best java minecraft servers, java mc servers, minecraft java multiplayer',
      bedrock: 'bedrock minecraft servers, pocket edition servers, minecraft pe servers, mobile minecraft servers, console minecraft servers, minecraft bedrock edition, xbox minecraft servers, playstation minecraft servers, nintendo switch minecraft servers, windows 10 minecraft servers, mcpe servers, minecraft mobile servers',
      crossplatform: 'crossplatform minecraft servers, cross platform servers, java bedrock compatible, minecraft crossplay servers, universal minecraft servers, multi platform minecraft servers',
      survival: 'survival minecraft servers, minecraft survival servers, survival mode servers, minecraft survival multiplayer, best survival servers, survival minecraft server list, hardcore survival servers',
      pvp: 'pvp minecraft servers, minecraft pvp servers, player vs player servers, combat servers, minecraft pvp server list, best pvp servers, minecraft combat servers, pvp multiplayer servers',
      creative: 'creative minecraft servers, minecraft creative servers, building servers, minecraft creative mode servers, creative building servers, minecraft architecture servers',
      skyblock: 'skyblock minecraft servers, minecraft skyblock servers, island survival servers, minecraft skyblock server list, best skyblock servers, skyblock multiplayer',
      prison: 'prison minecraft servers, minecraft prison servers, prison gamemode servers, minecraft prison server list, best prison servers, prison multiplayer servers',
      factions: 'factions minecraft servers, minecraft factions servers, faction pvp servers, minecraft factions server list, best factions servers, faction warfare servers',
      towny: 'towny minecraft servers, minecraft towny servers, town building servers, minecraft towny server list, best towny servers, towny multiplayer servers',
      economy: 'economy minecraft servers, minecraft economy servers, trading servers, minecraft economy server list, best economy servers, minecraft trading servers',
      minigames: 'minigames minecraft servers, minecraft minigames servers, mini game servers, minecraft minigames server list, best minigames servers, minecraft arcade servers',
      vanilla: 'vanilla minecraft servers, minecraft vanilla servers, pure minecraft servers, minecraft vanilla server list, best vanilla servers, unmodified minecraft servers',
      anarchy: 'anarchy minecraft servers, minecraft anarchy servers, no rules servers, minecraft anarchy server list, best anarchy servers, lawless minecraft servers',
      new: 'new minecraft servers, newest minecraft servers, recently added servers, latest minecraft servers, fresh minecraft servers, new minecraft server list 2025',
      popular: 'popular minecraft servers, top minecraft servers, best rated servers, most popular minecraft servers, top voted minecraft servers, trending minecraft servers',
      whitelist: 'whitelist minecraft servers, private minecraft servers, exclusive servers, minecraft whitelist server list, application minecraft servers, curated minecraft servers',
      '1.21': 'minecraft 1.21 servers, minecraft 1.21 server list, latest version servers, minecraft 1.21 multiplayer, newest minecraft servers, minecraft 1.21 server directory',
      '1.20': 'minecraft 1.20 servers, minecraft 1.20 server list, trails and tales servers, minecraft 1.20 multiplayer, minecraft 1.20 server directory',
      '1.19': 'minecraft 1.19 servers, minecraft 1.19 server list, wild update servers, minecraft 1.19 multiplayer, minecraft 1.19 server directory',
      '1.18': 'minecraft 1.18 servers, minecraft 1.18 server list, caves and cliffs servers, minecraft 1.18 multiplayer, minecraft 1.18 server directory'
    };
    
    return `${baseKeywords}, ${categoryKeywords[category] || `${category} minecraft servers`}`;
  };

  const addStructuredData = () => {
    const serverCount = getServerCountText(category);
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": config.title,
      "description": `${config.metaDescription} Browse ${serverCount} with live player counts and real-time status updates. All servers verified and monitored 24/7 for optimal gaming experience.`,
      "url": `${window.location.origin}/${category}`,
      "inLanguage": "en-US",
      "keywords": generateKeywords(category),
      "about": {
        "@type": "Thing",
        "name": `${capitalizedCategory} Minecraft Servers`,
        "description": `Collection of ${serverCount} featuring the best ${category} Minecraft servers with live monitoring, real-time player statistics, and 24/7 uptime tracking`
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "ServerCraft",
        "url": "https://servercraft.net",
        "description": "The ultimate Minecraft server directory"
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": config.title,
        "description": `${config.description} Browse ${serverCount} - all verified and monitored for uptime and player activity with real-time statistics.`,
        "numberOfItems": serverCount.split(' ')[0],
        "itemListElement": [],
        "itemListOrder": "https://schema.org/ItemListOrderDescending",
        "genre": ["Gaming", "Minecraft", "Multiplayer", capitalizedCategory],
        "audience": {
          "@type": "Audience",
          "audienceType": "Minecraft Players",
          "geographicArea": "Worldwide"
        }
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Minecraft Servers",
            "item": window.location.origin,
            "description": "Home page of ServerCraft Minecraft server directory"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": config.breadcrumb,
            "item": `${window.location.origin}/${category}`,
            "description": `${config.breadcrumb} listing page`
          }
        ]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${window.location.origin}/?search={search_term_string}&gamemode=${category === 'survival' || category === 'pvp' || category === 'creative' || category === 'skyblock' || category === 'prison' || category === 'factions' || category === 'towny' || category === 'economy' || category === 'minigames' || category === 'vanilla' || category === 'anarchy' ? category : 'all'}`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
          ]
        },
        "query-input": "required name=search_term_string",
        "name": `Search ${capitalizedCategory} Minecraft Servers`,
        "description": `Find specific ${category} Minecraft servers`
      },
      "publisher": {
        "@type": "Organization",
        "name": "ServerCraft",
        "logo": {
          "@type": "ImageObject",
          "url": "https://servercraft.net/logo_hd.webp",
          "width": 512,
          "height": 512
        },
        "description": "Leading Minecraft server directory and monitoring service",
        "foundingDate": "2025",
        "sameAs": [
          "https://discord.gg/servercraft",
          "https://twitter.com/servercraft"
        ]
      },
      "dateModified": new Date().toISOString(),
      "datePublished": "2025-01-01T00:00:00Z",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "15000",
        "bestRating": "5",
        "worstRating": "1",
        "description": `Community rating for ${serverCount} ${capitalizedCategory} Minecraft servers`
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "0",
        "offerCount": serverCount.split(' ')[0],
        "availability": "https://schema.org/InStock",
        "description": `All ${serverCount} ${category} Minecraft servers are free to play with live monitoring`
      }
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-category-page]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-category-page', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  const handleRelatedLinkClick = (relatedCategory: string) => {
    onNavigate?.('dedicated', relatedCategory);
  };

  // Determine filter values based on category
  const getFilterValues = () => {
    switch (category) {
      case 'java':
        return { gamemode: 'all', version: 'all', platform: 'java' };
      case 'bedrock':
        return { gamemode: 'all', version: 'all', platform: 'bedrock_and_crossplatform' };
      case 'crossplatform':
        return { gamemode: 'all', version: 'all', platform: 'crossplatform' };
      case 'new':
        return { gamemode: 'all', version: 'all', platform: 'all', sortBy: 'latest' };
      case 'popular':
        return { gamemode: 'all', version: 'all', platform: 'all', sortBy: 'votes' };
      case 'whitelist':
        return { gamemode: 'all', version: 'all', platform: 'all', hasWhitelist: true };
      default:
        return { gamemode: 'all', version: 'all', platform: 'all' };
    }
  };

  const getCategorySortBy = () => {
    if (category === 'new') return 'latest';
    if (category === 'popular') return 'votes';
    return currentSortBy;
  };

  const getCategoryHasWhitelist = () => {
    return category === 'whitelist';
  };

  const setSortBy = (sortBy: string) => {
    setCurrentSortBy(sortBy);
  };

  const handleServerClick = (slug: string) => {
    onServerClick?.(slug);
  };

  const filterValues = getFilterValues();

  // Check if category is invalid
  if (!isCategoryValid(category)) {
    return (
      <div className="min-h-screen bg-primary-dark pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Category Not Found</h2>
            <p className="text-light-gray mb-4">The category "{category}" does not exist.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-discord-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Back to Server List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-primary-dark pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-discord-blue hover:text-blue-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Server List</span>
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-light-gray mb-6" aria-label="Breadcrumb">
          <button
            onClick={onBack}
            className="hover:text-white transition-colors"
          >
            Minecraft Servers
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-medium">{categoryDetails?.breadcrumb || 'Unknown Category'}</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 text-white tracking-wider uppercase">
            {categoryDetails?.breadcrumb || 'Unknown Category'}
          </h1>
          <div className="w-16 h-1 bg-discord-blue mb-6"></div>
          
          {/* Description */}
          <div className="glass rounded-2xl p-6 mb-6 border border-white/10">
            <p className="text-light-gray leading-relaxed text-lg">
              {categoryDetails?.description || 'Category not found'}
            </p>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-light-gray text-sm">Related:</span>
            {config.relatedLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => handleRelatedLinkClick(link.category)}
                className="text-discord-blue hover:text-blue-400 transition-colors text-sm font-medium underline"
              >
                {link.text}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="glass rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Country Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-light-gray">Country:</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none"
              >
                <option value="all">All Countries</option>
                <option value="Worldwide">Worldwide</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Australia">Australia</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Turkey">Turkey</option>
                <option value="Brazil">Brazil</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Israel">Israel</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Sweden">Sweden</option>
                <option value="Portugal">Portugal</option>
                <option value="Argentina">Argentina</option>
                <option value="Poland">Poland</option>
                <option value="South Africa">South Africa</option>
                <option value="Italy">Italy</option>
                <option value="Peru">Peru</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Ukraine">Ukraine</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Latvia">Latvia</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Belgium">Belgium</option>
                <option value="Ireland">Ireland</option>
                <option value="India">India</option>
                <option value="Russia">Russia</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Singapore">Singapore</option>
                <option value="Croatia">Croatia</option>
                <option value="Romania">Romania</option>
                <option value="Denmark">Denmark</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Philippines">Philippines</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Hungary">Hungary</option>
                <option value="Iran">Iran</option>
                <option value="Namibia">Namibia</option>
                <option value="Japan">Japan</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Greece">Greece</option>
                <option value="Brunei">Brunei</option>
                <option value="Mexico">Mexico</option>
                <option value="Serbia">Serbia</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Thailand">Thailand</option>
                <option value="Georgia">Georgia</option>
                <option value="Taiwan">Taiwan</option>
                <option value="Norway">Norway</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Colombia">Colombia</option>
                <option value="Anguilla">Anguilla</option>
                <option value="Egypt">Egypt</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Bahrain">Bahrain</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Austria">Austria</option>
                <option value="Venezuela">Venezuela</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Union of Soviet Socialist Republics">Union of Soviet Socialist Republics</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Malta">Malta</option>
                <option value="Nepal">Nepal</option>
                <option value="South Korea">South Korea</option>
                <option value="Algeria">Algeria</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                <option value="Belarus">Belarus</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Iraq">Iraq</option>
                <option value="Qatar">Qatar</option>
                <option value="U.S. Virgin Islands">U.S. Virgin Islands</option>
                <option value="Estonia">Estonia</option>
                <option value="Cuba">Cuba</option>
                <option value="Jordan">Jordan</option>
                <option value="Turks and Caicos Islands">Turks and Caicos Islands</option>
                <option value="Puerto Rico">Puerto Rico</option>
                <option value="Morocco">Morocco</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Tunisia">Tunisia</option>
                <option value="U.S. Minor Outlying Islands">U.S. Minor Outlying Islands</option>
                <option value="Hong Kong SAR China">Hong Kong SAR China</option>
                <option value="Panama">Panama</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-light-gray">Order by:</label>
              <select
                value={getCategorySortBy()}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={category === 'new' || category === 'popular'}
                className="px-3 py-2 bg-secondary-dark/60 border border-white/10 rounded-lg text-white focus:border-discord-blue focus:outline-none disabled:opacity-50"
              >
                <option value="votes">Votes</option>
                <option value="players">Players</option>
                <option value="latest">Latest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Server List with Pre-applied Filters */}
        <ServerList
          selectedGamemode={filterValues.gamemode}
          selectedVersion={filterValues.version}
          selectedPlatform={filterValues.platform}
          searchQuery={searchQuery}
          selectedCountry={selectedCountry}
          sortBy={getCategorySortBy()}
          hasWhitelist={getCategoryHasWhitelist()}
          onServerClick={handleServerClick}
          showHeader={false}
          showServerCount={true}
        />
      </div>
    </div>
  );
};