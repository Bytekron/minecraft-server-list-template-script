/**
 * Sitemap Service
 * 
 * Handles dynamic sitemap generation including server pages
 * and automatic updates when new servers are added.
 * 
 * @author ServerCraft Development Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';

export class SitemapService {
  /**
   * Generate dynamic sitemap with all server pages
   */
  static async generateSitemap(): Promise<string> {
    try {
      // Get all approved servers for server pages
      const { data: servers, error } = await supabase
        .from('servers')
        .select('slug, updated_at, gamemode, platform, votes, name')
        .eq('status', 'approved')
        .order('votes', { ascending: false });

      if (error) {
        console.error('Error fetching servers for sitemap:', error);
        // Continue with static sitemap if server fetch fails
      }

      const baseUrl = 'https://servercraft.net';
      const currentDate = new Date().toISOString().split('T')[0];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/logo_hd.webp</image:loc>
      <image:title>ServerCraft - Best Minecraft Server List</image:title>
    </image:image>
  </url>
  
  <!-- Platform Pages -->
  <url>
    <loc>${baseUrl}/java</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/bedrock</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/crossplatform</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Category Pages -->
  <url>
    <loc>${baseUrl}/popular</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/new</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/whitelist</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Gamemode Pages -->
  <url>
    <loc>${baseUrl}/survival</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/pvp</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/creative</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/skyblock</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/prison</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/factions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/towny</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/economy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/minigames</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/vanilla</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/anarchy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Additional Gamemode Pages -->
  <url>
    <loc>${baseUrl}/bedwars</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/skywars</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/kitpvp</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/parkour</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/pixelmon</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/lifesteal</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/mcmmo</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/roleplay</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/hardcore</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/uhc</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/hunger-games</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/murder-mystery</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/hide-and-seek</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/build-battle</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/spleef</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/tnt-run</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/the-bridge</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/capture-the-flag</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Version Pages -->
  <url>
    <loc>${baseUrl}/1.21</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.20</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.19</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.18</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.17</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.16</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;

      // Add individual server pages
      if (servers && servers.length > 0) {
        sitemap += '\n  <!-- Individual Server Pages -->\n';
        
        for (const server of servers) {
          const lastMod = server.updated_at ? new Date(server.updated_at).toISOString().split('T')[0] : currentDate;
          const priority = this.getServerPriority(server.votes, server.gamemode, server.platform);
          const changefreq = this.getServerChangeFreq(server.votes);
          
          sitemap += `  <url>
    <loc>${baseUrl}/server/${server.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
        }
      }

      // Add static pages
      sitemap += `
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/submit</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/help</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/api</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/dmca</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/guidelines</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>
  
</urlset>`;

      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return this.getStaticSitemap();
    }
  }

  /**
   * Generate sitemap with all URLs (UPDATED VERSION)
   */
  static async generateSitemap_OLD(): Promise<string> {
    try {
      // Get all approved servers
      const { data: servers, error } = await supabase
        .from('servers')
        .select('slug, updated_at, gamemode, platform, votes')
        .eq('status', 'approved')
        .order('votes', { ascending: false });

      if (error) {
        console.error('Error fetching servers for sitemap:', error);
        return this.getStaticSitemap();
      }

      const baseUrl = 'https://servercraft.net';
      const currentDate = new Date().toISOString().split('T')[0];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/logo_hd.webp</image:loc>
      <image:title>ServerCraft - Best Minecraft Server List</image:title>
    </image:image>
  </url>
  
  <!-- Platform Pages -->
  <url>
    <loc>${baseUrl}/java</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/bedrock</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/crossplatform</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Category Pages -->
  <url>
    <loc>${baseUrl}/popular</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/new</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/whitelist</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Gamemode Pages -->
  <url>
    <loc>${baseUrl}/survival</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/pvp</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/creative</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/skyblock</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/prison</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/factions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/towny</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/economy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/minigames</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/vanilla</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/anarchy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Version Pages -->
  <url>
    <loc>${baseUrl}/1.21</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.20</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.19</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/1.18</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;

      // Add individual server pages
      if (servers && servers.length > 0) {
        sitemap += '\n  <!-- Individual Server Pages -->\n';
        
        for (const server of servers) {
          const lastMod = server.updated_at ? new Date(server.updated_at).toISOString().split('T')[0] : currentDate;
          const priority = this.getServerPriority(server.votes, server.gamemode, server.platform);
          const changefreq = this.getServerChangeFreq(server.votes);
          
          sitemap += `  <url>
    <loc>${baseUrl}/server/${server.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
        }
      }

      // Add static pages
      sitemap += `
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/submit</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/help</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/api</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/dmca</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/guidelines</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.2</priority>
  </url>
  
</urlset>`;

      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return this.getStaticSitemap();
    }
  }

  /**
   * Get server priority based on votes and other factors
   */
  private static getServerPriority(votes: number, gamemode: string, platform: string): string {
    let priority = 0.5; // Base priority

    // Boost based on votes
    if (votes > 1000) priority += 0.3;
    else if (votes > 500) priority += 0.2;
    else if (votes > 100) priority += 0.1;

    // Boost popular gamemodes
    const popularGamemodes = ['survival', 'pvp', 'skyblock', 'creative'];
    if (popularGamemodes.includes(gamemode)) priority += 0.1;

    // Boost Java and crossplatform
    if (platform === 'java' || platform === 'crossplatform') priority += 0.05;

    return Math.min(0.9, priority).toFixed(1);
  }

  /**
   * Get server change frequency based on activity
   */
  private static getServerChangeFreq(votes: number): string {
    if (votes > 500) return 'daily';
    if (votes > 100) return 'weekly';
    return 'monthly';
  }

  /**
   * Fallback static sitemap if database is unavailable
   */
  private static getStaticSitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://servercraft.net/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }

  /**
   * Trigger sitemap regeneration when a new server is added
   */
  static async updateSitemapForNewServer(serverId: string): Promise<void> {
    try {
      console.log(`Triggering sitemap update for new server: ${serverId}`);
      const newSitemap = await this.generateSitemap();
      console.log('Sitemap regenerated with new server');
      
      // In production, this would save to /public/sitemap-servers.xml
      // For development, we'll store it in localStorage and log the update
      if (typeof window !== 'undefined') {
        localStorage.setItem('dynamic-server-sitemap', newSitemap);
        console.log('Dynamic server sitemap updated and stored');
        
        // In production, you would also:
        // 1. Write the sitemap to /public/sitemap-servers.xml
        // 2. Notify search engines of the update
        // 3. Update the main sitemap index to reference this server sitemap
      }
    } catch (error) {
      console.error('Error updating sitemap for new server:', error);
    }
  }

  /**
   * Get the current generated sitemap
   */
  static async getCurrentSitemap(): Promise<string> {
    return await this.generateSitemap();
  }

  /**
   * Generate a dedicated server sitemap (separate from main sitemap)
   */
  static async generateServerSitemap(): Promise<string> {
    try {
      // Get all approved servers
      const { data: servers, error } = await supabase
        .from('servers')
        .select('slug, updated_at, gamemode, platform, votes, name')
        .eq('status', 'approved')
        .order('votes', { ascending: false });

      if (error) {
        console.error('Error fetching servers for server sitemap:', error);
        return this.getEmptyServerSitemap();
      }

      const baseUrl = 'https://servercraft.net';
      const currentDate = new Date().toISOString().split('T')[0];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Server Pages Sitemap - Generated ${currentDate} -->
`;

      // Add individual server pages
      if (servers && servers.length > 0) {
        for (const server of servers) {
          const lastMod = server.updated_at ? new Date(server.updated_at).toISOString().split('T')[0] : currentDate;
          const priority = this.getServerPriority(server.votes, server.gamemode, server.platform);
          const changefreq = this.getServerChangeFreq(server.votes);
          
          sitemap += `  <url>
    <loc>${baseUrl}/server/${server.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
        }
      }

      sitemap += '\n</urlset>';
      return sitemap;
    } catch (error) {
      console.error('Error generating server sitemap:', error);
      return this.getEmptyServerSitemap();
    }
  }

  /**
   * Get empty server sitemap if generation fails
   */
  private static getEmptyServerSitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Server sitemap temporarily unavailable -->
</urlset>`;
  }

  /**
   * Update server sitemap when server is deleted
   */
  static async updateSitemapForDeletedServer(serverId: string): Promise<void> {
    try {
      console.log(`Triggering sitemap update for deleted server: ${serverId}`);
      const newSitemap = await this.generateServerSitemap();
      console.log('Server sitemap regenerated after server deletion');
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('dynamic-server-sitemap', newSitemap);
        console.log('Server sitemap updated after deletion');
      }
    } catch (error) {
      console.error('Error updating sitemap for deleted server:', error);
    }
  }

  /**
   * Generate and save sitemap to public/sitemap.xml
   */
  static async generateAndSaveSitemap(): Promise<void> {
    try {
      console.log('🗺️ Generating complete sitemap...');
      
      // Generate the complete sitemap with all URLs
      const sitemapXML = await this.generateSitemap();
      console.log('✅ Sitemap generated successfully');
      console.log('📄 Sitemap preview (first 500 chars):', sitemapXML.substring(0, 500) + '...');
      
      // Note: Writing to filesystem is a server-side operation
      console.log('💾 Sitemap generated - filesystem write requires server-side implementation');
      
      // Store in localStorage for development purposes
      if (typeof window !== 'undefined') {
        localStorage.setItem('generated-sitemap', sitemapXML);
        console.log('💾 Sitemap stored in localStorage for development');
      }
      
      // Show user-friendly message with instructions
      const urlCount = (sitemapXML.match(/<url>/g) || []).length;
      alert(`✅ Sitemap generated successfully!\n\n📊 Generated ${urlCount} URLs\n💾 Stored in localStorage for development\n🔍 Check browser console for sitemap content\n\n📝 To save to filesystem:\n1. Copy sitemap from console\n2. Save as public/sitemap.xml`);
      
    } catch (error) {
      console.error('❌ Sitemap generation failed:', error);
      
      // Fallback: save to localStorage and provide manual instructions
      try {
        const sitemapXML = await this.generateSitemap();
        if (typeof window !== 'undefined') {
          localStorage.setItem('generated-sitemap', sitemapXML);
          console.log('💾 Sitemap stored in localStorage as fallback');
          alert(`⚠️ Could not write to file system, but sitemap was generated!\n\n📋 Sitemap saved to localStorage\n🔍 Run: localStorage.getItem('generated-sitemap') in console\n📝 Copy the output and save as public/sitemap.xml`);
        }
      } catch (fallbackError) {
        alert(`❌ Sitemap generation failed: ${error.message}`);
      }
      throw error;
    }
  }
}