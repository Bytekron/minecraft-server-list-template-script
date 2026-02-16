/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'mc-heads.net',
      'flagsapi.com',
      'images.pexels.com'
    ],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async rewrites() {
    return [
      // Server page rewrites
      {
        source: '/server/:slug',
        destination: '/server/[slug]'
      },
      // Category page rewrites
      {
        source: '/java',
        destination: '/category/java'
      },
      {
        source: '/bedrock',
        destination: '/category/bedrock'
      },
      {
        source: '/crossplatform',
        destination: '/category/crossplatform'
      },
      {
        source: '/popular',
        destination: '/category/popular'
      },
      {
        source: '/new',
        destination: '/category/new'
      },
      {
        source: '/whitelist',
        destination: '/category/whitelist'
      },
      // Gamemode rewrites
      {
        source: '/survival',
        destination: '/category/survival'
      },
      {
        source: '/pvp',
        destination: '/category/pvp'
      },
      {
        source: '/creative',
        destination: '/category/creative'
      },
      {
        source: '/skyblock',
        destination: '/category/skyblock'
      },
      {
        source: '/prison',
        destination: '/category/prison'
      },
      {
        source: '/factions',
        destination: '/category/factions'
      },
      {
        source: '/towny',
        destination: '/category/towny'
      },
      {
        source: '/economy',
        destination: '/category/economy'
      },
      {
        source: '/minigames',
        destination: '/category/minigames'
      },
      {
        source: '/vanilla',
        destination: '/category/vanilla'
      },
      {
        source: '/anarchy',
        destination: '/category/anarchy'
      },
      {
        source: '/bedwars',
        destination: '/category/bedwars'
      },
      {
        source: '/skywars',
        destination: '/category/skywars'
      },
      {
        source: '/kitpvp',
        destination: '/category/kitpvp'
      },
      {
        source: '/parkour',
        destination: '/category/parkour'
      },
      {
        source: '/pixelmon',
        destination: '/category/pixelmon'
      },
      {
        source: '/lifesteal',
        destination: '/category/lifesteal'
      },
      {
        source: '/mcmmo',
        destination: '/category/mcmmo'
      },
      {
        source: '/roleplay',
        destination: '/category/roleplay'
      },
      {
        source: '/hardcore',
        destination: '/category/hardcore'
      },
      {
        source: '/uhc',
        destination: '/category/uhc'
      },
      {
        source: '/hunger-games',
        destination: '/category/hunger-games'
      },
      {
        source: '/murder-mystery',
        destination: '/category/murder-mystery'
      },
      {
        source: '/hide-and-seek',
        destination: '/category/hide-and-seek'
      },
      {
        source: '/build-battle',
        destination: '/category/build-battle'
      },
      {
        source: '/spleef',
        destination: '/category/spleef'
      },
      {
        source: '/tnt-run',
        destination: '/category/tnt-run'
      },
      {
        source: '/the-bridge',
        destination: '/category/the-bridge'
      },
      {
        source: '/capture-the-flag',
        destination: '/category/capture-the-flag'
      },
      // Version rewrites
      {
        source: '/1.21',
        destination: '/category/1.21'
      },
      {
        source: '/1.20',
        destination: '/category/1.20'
      },
      {
        source: '/1.19',
        destination: '/category/1.19'
      },
      {
        source: '/1.18',
        destination: '/category/1.18'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;