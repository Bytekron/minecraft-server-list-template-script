/**
 * Server Banner Component
 * 
 * Displays the server banner image if available
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import React from 'react';
import { Image } from 'lucide-react';

interface ServerBannerProps {
  server: {
    name: string;
    banner_url?: string;
  };
}

export const ServerBanner: React.FC<ServerBannerProps> = ({ server }) => {
  if (!server.banner_url) {
    return null;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-white/10">
      <img 
        src={server.banner_url}
        alt={`${server.name} banner`}
        className="w-full h-auto"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};