import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Best Minecraft Server List 2025 - 10,000+ Servers | ServerCraft',
  description: '🎮 Find the BEST Minecraft servers in 2025! 10,000+ verified servers ✅ Live player counts ⚡ Java, Bedrock & PE support 📱 Survival, PvP, Skyblock, Prison & more! Updated every minute.',
  keywords: 'minecraft server list 2025, best minecraft servers, minecraft server directory, java servers, bedrock servers, pocket edition servers, survival servers, pvp servers, skyblock servers, prison servers, creative servers, factions servers, towny servers, minecraft pe servers, crossplatform servers, minecraft 1.21 servers, minecraft 1.20 servers, free minecraft servers, top minecraft servers',
  authors: [{ name: 'CreeperCraft Team' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://servercraft.net/',
    title: 'Best Minecraft Server List 2025 - 10,000+ Servers | ServerCraft',
    description: '🎮 Find the BEST Minecraft servers in 2025! 10,000+ verified servers with live player counts. Java, Bedrock & PE support. Updated every minute!',
    images: [
      {
        url: 'https://servercraft.net/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ServerCraft - Best Minecraft Server List 2025',
      },
    ],
    siteName: 'ServerCraft',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Minecraft Server List 2025 - 10,000+ Servers | ServerCraft',
    description: '🎮 Find the BEST Minecraft servers in 2025! 10,000+ verified servers with live player counts. Java, Bedrock & PE support. Updated every minute!',
    images: ['https://servercraft.net/twitter-image.jpg'],
    creator: '@ServerCraft',
    site: '@ServerCraft',
  },
  icons: {
    icon: '/vite.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'google-site-verification': 'your-google-verification-code',
    'msvalidate.01': 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mc-heads.net" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//mc-heads.net" />
        <link rel="canonical" href="https://servercraft.net/" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}