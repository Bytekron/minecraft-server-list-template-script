import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all approved servers
    const { data: servers, error } = await supabase
      .from('servers')
      .select('slug, updated_at, gamemode, platform, votes, name')
      .eq('status', 'approved')
      .order('votes', { ascending: false })

    if (error) {
      console.error('Error fetching servers for sitemap:', error)
      return new Response(getEmptyServerSitemap(), {
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
      })
    }

    const baseUrl = 'https://servercraft.net'
    const currentDate = new Date().toISOString().split('T')[0]

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Server Pages Sitemap - Generated ${currentDate} -->
`

    // Add individual server pages
    if (servers && servers.length > 0) {
      for (const server of servers) {
        const lastMod = server.updated_at ? new Date(server.updated_at).toISOString().split('T')[0] : currentDate
        const priority = getServerPriority(server.votes, server.gamemode, server.platform)
        const changefreq = getServerChangeFreq(server.votes)
        
        sitemap += `  <url>
    <loc>${baseUrl}/server/${server.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`
      }
    }

    sitemap += '\n</urlset>'

    return new Response(sitemap, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
    })

  } catch (error) {
    console.error('Error generating server sitemap:', error)
    return new Response(getEmptyServerSitemap(), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
    })
  }
})

function getServerPriority(votes: number, gamemode: string, platform: string): string {
  let priority = 0.5 // Base priority

  // Boost based on votes
  if (votes > 1000) priority += 0.3
  else if (votes > 500) priority += 0.2
  else if (votes > 100) priority += 0.1

  // Boost popular gamemodes
  const popularGamemodes = ['survival', 'pvp', 'skyblock', 'creative']
  if (popularGamemodes.includes(gamemode)) priority += 0.1

  // Boost Java and crossplatform
  if (platform === 'java' || platform === 'crossplatform') priority += 0.05

  return Math.min(0.9, priority).toFixed(1)
}

function getServerChangeFreq(votes: number): string {
  if (votes > 500) return 'daily'
  if (votes > 100) return 'weekly'
  return 'monthly'
}

function getEmptyServerSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Server sitemap temporarily unavailable -->
</urlset>`
}