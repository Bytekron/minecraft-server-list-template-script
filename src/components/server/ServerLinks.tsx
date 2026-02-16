import React from 'react';
import { ExternalLink, Globe, MessageCircle } from 'lucide-react';

interface Server {
  website?: string;
  discord?: string;
  youtube?: string;
}

interface ServerLinksProps {
  server: Server;
}

export const ServerLinks: React.FC<ServerLinksProps> = ({ server }) => {
  const links = [
    {
      label: 'Website',
      url: server.website,
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
    },
    {
      label: 'Discord',
      url: server.discord,
      icon: MessageCircle,
      color: 'text-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/30'
    },
    {
      label: 'YouTube',
      url: server.youtube,
      icon: () => <span className="text-red-400 text-xl">▶</span>,
      color: 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
    }
  ].filter(link => link.url);

  if (links.length === 0) {
    return null;
  }

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <ExternalLink className="w-5 h-5 text-discord-blue" />
        <h3 className="text-xl font-bold text-white">Server Links</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={formatUrl(link.url!)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-4 rounded-lg border border-white/10 transition-colors ${link.color}`}
            >
              {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5" />}
              <span className="font-medium text-white">{link.label}</span>
              <ExternalLink className="w-4 h-4 ml-auto opacity-60 text-light-gray" />
            </a>
          );
        })}
      </div>
    </div>
  );
};