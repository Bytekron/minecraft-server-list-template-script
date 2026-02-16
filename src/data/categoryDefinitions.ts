/**
 * Category Definitions
 * 
 * Defines all available server categories with their metadata,
 * filters, and validation logic.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

// ==================== INTERFACES ====================

export interface CategoryDefinition {
  title: string;
  description: string;
  filters: {
    platform?: string;
    gamemode?: string;
    version?: string;
    sortBy?: string;
    hasWhitelist?: boolean;
    featured?: boolean;
  };
  icon?: string;
  color?: string;
}

// ==================== CATEGORY DEFINITIONS ====================

const categoryDefinitions: Record<string, CategoryDefinition> = {
  // Platform Categories
  java: {
    title: 'Java Edition Servers',
    description: 'Minecraft Java Edition servers for PC players with the latest features and mods.',
    filters: { platform: 'java' },
    icon: '☕',
    color: 'text-orange-400'
  },
  bedrock: {
    title: 'Bedrock Edition Servers',
    description: 'Cross-platform Minecraft Bedrock servers for mobile, console, and Windows 10.',
    filters: { platform: 'bedrock' },
    icon: '📱',
    color: 'text-blue-400'
  },
  crossplatform: {
    title: 'Cross-Platform Servers',
    description: 'Servers supporting both Java and Bedrock editions for maximum compatibility.',
    filters: { platform: 'crossplatform' },
    icon: '🌐',
    color: 'text-purple-400'
  },

  // Special Categories
  popular: {
    title: 'Popular Servers',
    description: 'The most voted and highly-rated Minecraft servers with active communities.',
    filters: { sortBy: 'votes' },
    icon: '🔥',
    color: 'text-red-400'
  },
  new: {
    title: 'New Servers',
    description: 'Recently added Minecraft servers looking for new players to join their community.',
    filters: { sortBy: 'created_at' },
    icon: '✨',
    color: 'text-green-400'
  },
  whitelist: {
    title: 'Whitelist Servers',
    description: 'Exclusive Minecraft servers with application-based entry for premium gameplay.',
    filters: { hasWhitelist: true },
    icon: '🔒',
    color: 'text-yellow-400'
  },

  // Gamemode Categories
  survival: {
    title: 'Survival Servers',
    description: 'Classic Minecraft survival experience with resource gathering and building.',
    filters: { gamemode: 'survival' },
    icon: '⛏️',
    color: 'text-green-400'
  },
  pvp: {
    title: 'PvP Servers',
    description: 'Player vs Player combat servers with competitive gameplay and battles.',
    filters: { gamemode: 'pvp' },
    icon: '⚔️',
    color: 'text-red-400'
  },
  creative: {
    title: 'Creative Servers',
    description: 'Build amazing structures with unlimited resources in creative mode.',
    filters: { gamemode: 'creative' },
    icon: '🎨',
    color: 'text-blue-400'
  },
  skyblock: {
    title: 'Skyblock Servers',
    description: 'Start on a floating island and expand your world in this challenging gamemode.',
    filters: { gamemode: 'skyblock' },
    icon: '🏝️',
    color: 'text-cyan-400'
  },
  prison: {
    title: 'Prison Servers',
    description: 'Work your way up from prisoner to freedom in these rank-based servers.',
    filters: { gamemode: 'prison' },
    icon: '🔒',
    color: 'text-orange-400'
  },
  factions: {
    title: 'Factions Servers',
    description: 'Team up with friends, claim land, and wage war against other factions.',
    filters: { gamemode: 'factions' },
    icon: '🏰',
    color: 'text-purple-400'
  },
  towny: {
    title: 'Towny Servers',
    description: 'Build and manage towns with friends in a peaceful, organized environment.',
    filters: { gamemode: 'towny' },
    icon: '🏘️',
    color: 'text-green-400'
  },
  economy: {
    title: 'Economy Servers',
    description: 'Trade, buy, and sell items in servers with complex economic systems.',
    filters: { gamemode: 'economy' },
    icon: '💰',
    color: 'text-yellow-400'
  },
  minigames: {
    title: 'Minigames Servers',
    description: 'Quick and fun mini-games like Bedwars, Skywars, and more.',
    filters: { gamemode: 'minigames' },
    icon: '🎮',
    color: 'text-pink-400'
  },
  vanilla: {
    title: 'Vanilla Servers',
    description: 'Pure Minecraft experience without mods or plugins.',
    filters: { gamemode: 'vanilla' },
    icon: '🍦',
    color: 'text-white'
  },
  anarchy: {
    title: 'Anarchy Servers',
    description: 'No rules, no limits - pure chaos and freedom in Minecraft.',
    filters: { gamemode: 'anarchy' },
    icon: '💀',
    color: 'text-red-400'
  },
  bedwars: {
    title: 'Bedwars Servers',
    description: 'Protect your bed and destroy enemy beds in this popular team-based minigame.',
    filters: { gamemode: 'bedwars' },
    icon: '🛏️',
    color: 'text-red-400'
  },
  skywars: {
    title: 'Skywars Servers',
    description: 'Battle on floating islands in this fast-paced PvP minigame.',
    filters: { gamemode: 'skywars' },
    icon: '☁️',
    color: 'text-blue-400'
  },
  kitpvp: {
    title: 'KitPvP Servers',
    description: 'Choose your kit and fight other players in arena-based combat.',
    filters: { gamemode: 'kitpvp' },
    icon: '🗡️',
    color: 'text-red-400'
  },
  parkour: {
    title: 'Parkour Servers',
    description: 'Test your jumping skills with challenging parkour courses.',
    filters: { gamemode: 'parkour' },
    icon: '🏃',
    color: 'text-green-400'
  },
  pixelmon: {
    title: 'Pixelmon Servers',
    description: 'Catch and train Pokémon in the world of Minecraft.',
    filters: { gamemode: 'pixelmon' },
    icon: '🐾',
    color: 'text-yellow-400'
  },
  lifesteal: {
    title: 'Lifesteal Servers',
    description: 'Gain hearts by killing players and lose them when you die.',
    filters: { gamemode: 'lifesteal' },
    icon: '❤️',
    color: 'text-red-400'
  },
  mcmmo: {
    title: 'MCMMO Servers',
    description: 'Level up your skills and abilities with the MCMMO plugin.',
    filters: { gamemode: 'mcmmo' },
    icon: '📈',
    color: 'text-blue-400'
  },
  roleplay: {
    title: 'Roleplay Servers',
    description: 'Immerse yourself in character-driven gameplay and storytelling.',
    filters: { gamemode: 'roleplay' },
    icon: '🎭',
    color: 'text-purple-400'
  },
  hardcore: {
    title: 'Hardcore Servers',
    description: 'High-stakes gameplay where death has permanent consequences.',
    filters: { gamemode: 'hardcore' },
    icon: '💀',
    color: 'text-red-400'
  },
  uhc: {
    title: 'UHC Servers',
    description: 'Ultra Hardcore mode with no natural regeneration and intense PvP.',
    filters: { gamemode: 'uhc' },
    icon: '🩸',
    color: 'text-red-400'
  },
  'hunger-games': {
    title: 'Hunger Games Servers',
    description: 'Battle royale style gameplay inspired by the Hunger Games.',
    filters: { gamemode: 'hunger-games' },
    icon: '🏹',
    color: 'text-orange-400'
  },
  'murder-mystery': {
    title: 'Murder Mystery Servers',
    description: 'Social deduction game where you must find the murderer among you.',
    filters: { gamemode: 'murder-mystery' },
    icon: '🔍',
    color: 'text-purple-400'
  },
  'hide-and-seek': {
    title: 'Hide and Seek Servers',
    description: 'Classic hide and seek gameplay with unique Minecraft twists.',
    filters: { gamemode: 'hide-and-seek' },
    icon: '👁️',
    color: 'text-blue-400'
  },
  'build-battle': {
    title: 'Build Battle Servers',
    description: 'Compete against other players in timed building competitions.',
    filters: { gamemode: 'build-battle' },
    icon: '🏗️',
    color: 'text-yellow-400'
  },
  spleef: {
    title: 'Spleef Servers',
    description: 'Dig blocks beneath other players to make them fall in this classic minigame.',
    filters: { gamemode: 'spleef' },
    icon: '🕳️',
    color: 'text-brown-400'
  },
  'tnt-run': {
    title: 'TNT Run Servers',
    description: 'Run across TNT blocks that disappear beneath your feet.',
    filters: { gamemode: 'tnt-run' },
    icon: '💥',
    color: 'text-red-400'
  },
  'the-bridge': {
    title: 'The Bridge Servers',
    description: 'Cross bridges and score goals in this team-based minigame.',
    filters: { gamemode: 'the-bridge' },
    icon: '🌉',
    color: 'text-blue-400'
  },
  'capture-the-flag': {
    title: 'Capture the Flag Servers',
    description: 'Team-based strategy game where you capture the enemy flag.',
    filters: { gamemode: 'capture-the-flag' },
    icon: '🚩',
    color: 'text-green-400'
  },

  // Version Categories
  '1.21': {
    title: 'Minecraft 1.21 Servers',
    description: 'Latest Minecraft servers running version 1.21 with newest features.',
    filters: { version: '1.21' },
    icon: '🆕',
    color: 'text-green-400'
  },
  '1.20': {
    title: 'Minecraft 1.20 Servers',
    description: 'Servers running Minecraft 1.20 with Trails & Tales update features.',
    filters: { version: '1.20' },
    icon: '🏛️',
    color: 'text-blue-400'
  },
  '1.19': {
    title: 'Minecraft 1.19 Servers',
    description: 'Servers with The Wild Update featuring deep dark biomes and wardens.',
    filters: { version: '1.19' },
    icon: '🌑',
    color: 'text-purple-400'
  },
  '1.18': {
    title: 'Minecraft 1.18 Servers',
    description: 'Caves & Cliffs update servers with new world generation.',
    filters: { version: '1.18' },
    icon: '⛰️',
    color: 'text-gray-400'
  }
};

// ==================== EXPORTED FUNCTIONS ====================

/**
 * Get category definition by slug
 */
export const getCategoryDefinition = (category: string): CategoryDefinition | null => {
  return categoryDefinitions[category] || null;
};

/**
 * Check if a category is valid
 */
export const isCategoryValid = (category: string): boolean => {
  return category in categoryDefinitions;
};

/**
 * Get all valid category slugs
 */
export const getValidCategories = (): string[] => {
  return Object.keys(categoryDefinitions);
};

/**
 * Get categories by type
 */
export const getCategoriesByType = () => {
  return {
    platforms: ['java', 'bedrock', 'crossplatform'],
    special: ['popular', 'new', 'whitelist'],
    gamemodes: [
      'survival', 'pvp', 'creative', 'skyblock', 'prison', 'factions', 
      'towny', 'economy', 'minigames', 'vanilla', 'anarchy', 'bedwars',
      'skywars', 'kitpvp', 'parkour', 'pixelmon', 'lifesteal', 'mcmmo',
      'roleplay', 'hardcore', 'uhc', 'hunger-games', 'murder-mystery',
      'hide-and-seek', 'build-battle', 'spleef', 'tnt-run', 'the-bridge',
      'capture-the-flag'
    ],
    versions: ['1.21', '1.20', '1.19', '1.18']
  };
};