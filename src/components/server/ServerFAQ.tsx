import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Server } from '../../types/database';

interface ServerFAQProps {
  server: Server;
}

export const ServerFAQ: React.FC<ServerFAQProps> = ({ server }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const generateFAQs = () => {
    const faqs = [];

    // How to join question
    faqs.push({
      question: `How do I join ${server.name}?`,
      answer: `To join ${server.name}, follow these steps based on your platform:

For Minecraft Java Edition:
1. Copy the server IP: ${server.ip}${server.java_port !== 25565 ? `:${server.java_port}` : ''}
2. Open Minecraft Java Edition and wait for it to fully load
3. Click on "Multiplayer", then "Add Server" (or "Direct Connection")
4. Paste the server IP in the "Server Address" field
5. Click "Done" and then select ${server.name} from your server list
6. Click "Join Server" to start playing

${server.platform === 'bedrock' || server.platform === 'crossplatform' ? `
**For Minecraft Bedrock/Pocket Edition:**
1. Open Minecraft Bedrock Edition
2. Click on "Play", then "Servers"
3. Click "Add Server" (or "Add External Server") at the bottom
4. Enter "${server.name}" as the server name
5. Enter "${server.name}" as the server name
6. Paste the server IP in the "Server Address" field
7. Enter ${server.bedrock_port || 19132} in the "Port" field
8. Click "Save" and then "Join Server"

You can play on ${server.name} using PS4, Xbox, Nintendo Switch, Android, iOS, Windows 10, or any device supporting Minecraft Bedrock Edition.` : ''}

If you're having connection issues, make sure you're using the correct version (${server.min_version} - ${server.max_version}) and check your internet connection.`
    });

    // Server IP question
    faqs.push({
      question: `What is the server IP for ${server.name}?`,
      answer: `The server IP for ${server.name} is: ${server.ip}

${server.platform === 'java' ? `This is a Java Edition server, so you can connect directly using this IP.` : ''}
${server.platform === 'bedrock' ? `This is a Bedrock Edition server. Use IP: ${server.ip} and Port: ${server.bedrock_port || 19132}.` : ''}
${server.platform === 'crossplatform' ? `This is a cross-platform server supporting both Java and Bedrock editions:
- Java Edition: ${server.ip}${server.java_port !== 25565 ? `:${server.java_port}` : ''}.
- Bedrock Edition: ${server.ip}:${server.bedrock_port || 19132}.` : ''}

Make sure to copy the IP exactly as shown above for the best connection experience.`
    });

    // Platform compatibility
    if (server.platform === 'bedrock' || server.platform === 'crossplatform') {
      faqs.push({
        question: `What devices can I use to play on ${server.name}?`,
        answer: `${server.name} supports Minecraft Bedrock Edition, which means you can play on:

- PlayStation 4 & 5
- Xbox One & Series X/S
- Nintendo Switch
- Android devices
- iOS devices (iPhone, iPad, iPod Touch)
- Windows 10 & 11 (Bedrock Edition)
- Any other device running Minecraft Bedrock/Pocket Edition

Use the server IP ${server.ip} and port ${server.bedrock_port || 19132} to connect from Bedrock Edition.`
      });
    }

    // Gamemode information
    if (server.gamemode) {
      faqs.push({
        question: `What gamemodes are available on ${server.name}?`,
        answer: `${server.name} primarily features ${server.gamemode} gameplay. ${server.additional_gamemodes ? `

Additional gamemodes available include: ${server.additional_gamemodes.split(',').map(mode => mode.trim()).join(', ')}.

This gives you a variety of gameplay experiences all within one server. Whether you're interested in the main ${server.gamemode} experience or want to try something different, ${server.name} has options for every type of Minecraft player.` : `

The server focuses on providing an excellent ${server.gamemode} experience with dedicated features and optimizations for this gamemode.`}`
      });
    }

    // Version support
    faqs.push({
      question: `What Minecraft versions does ${server.name} support?`,
      answer: `${server.name} supports Minecraft versions from ${server.min_version} to ${server.max_version}.

This wide version support means you can join with:
${server.min_version === '1.7' ? '- Very old versions like 1.7.x (great for older devices or nostalgic gameplay)' : ''}
- Popular versions like 1.16.x, 1.18.x, 1.19.x
- The latest version ${server.max_version}
- Any version in between

We recommend using the latest supported version (${server.max_version}) for the best performance and access to all features. However, if you prefer an older version or your device requires it, you can still enjoy the full ${server.name} experience.`
    });

    // Free to play
    faqs.push({
      question: `Is ${server.name} free to play?`,
      answer: `Yes! ${server.name} is completely free to join and play. You only need to own Minecraft to connect and enjoy all the core features and gameplay.

While the server is free to join, some servers may offer optional premium features, ranks, or cosmetics that can be purchased to support the server and enhance your gameplay experience. These are always optional and never required to enjoy the core game.`
    });

    // Player count
    faqs.push({
      question: `How many players are currently online on ${server.name}?`,
      answer: `${server.name} currently has ${server.players_online} players online out of a maximum capacity of ${server.players_max} players.

This gives you an idea of how active the community is right now. The server can handle up to ${server.players_max} concurrent players, ensuring smooth gameplay even during peak hours.`
    });

    // Contact and support
    faqs.push({
      question: `I have an issue or question about ${server.name}. Who can I contact?`,
      answer: `If you need help or have questions about ${server.name}, here are the best ways to get support:

${server.discord ? `Discord Server (Recommended): ${server.discord}
Join the Discord community for real-time help, announcements, and to connect with other players and staff members.` : ''}

${server.website ? `Official Website: ${server.website}
Visit the website for server information, rules, guides, and possibly a support ticket system.` : ''}

Common Issues & Quick Fixes:
- Connection problems: Ensure you're using the correct IP (${server.ip}) and version (${server.min_version} - ${server.max_version})
- Can't find the server: Double-check the IP address and make sure you're using the right Minecraft edition
- Lag or performance issues: Try connecting at different times or check your internet connection

The community and staff are generally very helpful and responsive to player questions and concerns.`
    });

    // Server location/hosting
    if (server.country) {
      faqs.push({
        question: `Where is ${server.name} hosted and what's the connection quality?`,
        answer: `${server.name} is hosted in ${server.country}, providing excellent connectivity for players in that region and surrounding areas.

The server features:
- Professional hosting infrastructure
- High-performance hardware for smooth gameplay
- Regular backups and maintenance
- DDoS protection and security measures
- Optimized network routing for minimal latency

Players from other regions can still connect and play, though you may experience slightly higher ping depending on your distance from the server location.`
      });
    }

    return faqs;
  };

  const faqs = generateFAQs();

  return (
    <div className="glass p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6 text-discord-blue" />
        <h2 className="text-2xl font-bold text-white">Server F.A.Q.</h2>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span className="text-white font-medium">{faq.question}</span>
              {openItems.includes(index) ? (
                <ChevronUp className="w-5 h-5 text-light-gray" />
              ) : (
                <ChevronDown className="w-5 h-5 text-light-gray" />
              )}
            </button>
            
            {openItems.includes(index) && (
              <div className="px-6 py-4 bg-white/5">
                <div className="text-light-gray whitespace-pre-line leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};