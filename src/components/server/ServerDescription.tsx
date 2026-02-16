import React from 'react';
import { FileText, Tag, Globe, Users, Clock } from 'lucide-react';

interface Server {
  id: string;
  name: string;
  description: string;
  gamemode: string;
  additional_gamemodes?: string;
  min_version?: string;
  max_version?: string;
  country?: string;
  has_whitelist?: boolean;
  created_at?: string;
}

interface ServerDescriptionProps {
  server: Server;
}

export const ServerDescription: React.FC<ServerDescriptionProps> = ({ server }) => {
  const formatGamemodes = () => {
    const gamemodes = [server.gamemode];
    if (server.additional_gamemodes) {
      gamemodes.push(...server.additional_gamemodes.split(',').map(g => g.trim()));
    }
    return gamemodes;
  };

  const formatVersionRange = () => {
    if (server.min_version && server.max_version) {
      return `${server.min_version} - ${server.max_version}`;
    }
    return server.min_version || server.max_version || 'Any version';
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-discord-blue" />
        <h3 className="text-xl font-bold text-white">About This Server</h3>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <div className="prose prose-invert max-w-none">
            <p className="text-light-gray leading-relaxed whitespace-pre-wrap">
              {server.description}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};