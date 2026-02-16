import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface ServerCheckResult {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  version?: string;
  icon?: string;
  motd?: {
    clean: string[];
  };
  players?: {
    online: number;
    max: number;
  };
  debug?: {
    ping: boolean;
    query: boolean;
    cachehit: boolean;
  };
}

const MCSRVSTAT_API = 'https://api.mcsrvstat.us/3/';
const MCSRVSTAT_BEDROCK_API = 'https://api.mcsrvstat.us/bedrock/3/';
const MCSTATUS_FALLBACK_API = 'https://api.mcstatus.io/v2/status/';

async function checkServer(ip: string, port: number = 25565, platform: 'java' | 'bedrock' | 'crossplatform' = 'java'): Promise<ServerCheckResult | null> {
  const address = port === 25565 ? ip : `${ip}:${port}`;
  let result: ServerCheckResult | null = null;

  try {
    // Try primary API first
    result = await checkWithMCSrvStat(address, platform);
    
    // If primary fails, try fallback
    if (!result || !result.online) {
      result = await checkWithMCStatus(address);
    }
  } catch (error) {
    console.error(`Error checking server ${address}:`, error);
    
    // Try fallback API
    try {
      result = await checkWithMCStatus(address);
    } catch (fallbackError) {
      console.error(`Fallback API also failed for ${address}:`, fallbackError);
      return null;
    }
  }

  return result;
}

async function checkWithMCSrvStat(address: string, platform: 'java' | 'bedrock' | 'crossplatform'): Promise<ServerCheckResult | null> {
  const apiUrl = platform === 'bedrock' ? MCSRVSTAT_BEDROCK_API : MCSRVSTAT_API;
  
  const response = await fetch(`${apiUrl}${encodeURIComponent(address)}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'ServerCraft/1.0 (Minecraft Server List)',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data as ServerCheckResult;
}

async function checkWithMCStatus(address: string): Promise<ServerCheckResult | null> {
  const response = await fetch(`${MCSTATUS_FALLBACK_API}java/${encodeURIComponent(address)}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'ServerCraft/1.0 (Minecraft Server List)',
    },
  });

  if (!response.ok) {
    throw new Error(`Fallback API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Transform MCStatus.io response to our format
  return {
    online: data.online || false,
    ip: data.host || '',
    port: data.port || 25565,
    version: data.version?.name_clean || data.version?.name,
    icon: data.icon,
    motd: data.motd ? { clean: [data.motd.clean] } : undefined,
    players: data.players ? {
      online: data.players.online || 0,
      max: data.players.max || 0
    } : undefined,
    debug: {
      ping: data.online || false,
      query: false,
      cachehit: false
    }
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Check all servers
      const { data: servers, error } = await supabase
        .from('servers')
        .select('id, ip, java_port, platform')
        .eq('status', 'approved');

      if (error) {
        throw error;
      }

      const results = [];
      
      for (const server of servers || []) {
        try {
          const startTime = Date.now();
          const result = await checkServer(
            server.ip, 
            server.java_port, 
            server.platform as 'java' | 'bedrock' | 'crossplatform'
          );
          const responseTime = Date.now() - startTime;

          if (result) {
            // Store statistics
            await supabase
              .from('server_stats')
              .insert({
                server_id: server.id,
                online: result.online,
                players_online: result.players?.online || 0,
                players_max: result.players?.max || 0,
                version: result.version,
                motd_clean: result.motd?.clean?.join(' ') || null,
                response_time_ms: responseTime
              });
            
            // Update icon if present
            if (result.icon) {
              const cleanIconData = result.icon.startsWith('data:image/') 
                ? result.icon.substring(result.icon.indexOf('base64,') + 7)
                : result.icon;

              if (isValidBase64(cleanIconData)) {
                const iconHash = await generateIconHash(cleanIconData);
                
                const { error: iconError } = await supabase
                  .from('server_icons')
                  .upsert({
                    server_id: server.id,
                    icon_data: cleanIconData,
                    icon_hash: iconHash,
                    last_updated: new Date().toISOString()
                  }, { onConflict: 'server_id' });
                
                if (iconError) {
                  console.error(`Error updating icon for ${server.ip}:`, iconError);
                }
              }
            }

            // Update server's current stats
            await supabase
              .from('servers')
              .update({
                players_online: result.players?.online || 0,
                players_max: result.players?.max || 100,
                last_ping: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', server.id);

            results.push({ server: server.ip, status: 'checked', online: result.online });
          } else {
            results.push({ server: server.ip, status: 'failed' });
          }

          // Add delay between checks
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error checking server ${server.ip}:`, error);
          results.push({ server: server.ip, status: 'error', error: error.message });
        }
      }

      // Update rank snapshots after monitoring
      try {
        console.log('Updating rank snapshots...')
        
        // Update daily ranks
        const { error: dailyRankError } = await supabase.rpc('update_daily_server_ranks')
        if (dailyRankError) {
          console.error('Error updating daily ranks:', dailyRankError)
        } else {
          console.log('Daily ranks updated successfully')
        }
        
        // Update hourly ranks
        const { error: hourlyRankError } = await supabase.rpc('update_hourly_server_ranks')
        if (hourlyRankError) {
          console.error('Error updating hourly ranks:', hourlyRankError)
        } else {
          console.log('Hourly ranks updated successfully')
        }
      } catch (rankError) {
        console.error('Error in rank update process:', rankError)
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Check single server
      const url = new URL(req.url);
      const ip = url.searchParams.get('ip');
      const port = parseInt(url.searchParams.get('port') || '25565');
      const platform = url.searchParams.get('platform') || 'java';

      if (!ip) {
        return new Response(
          JSON.stringify({ error: 'IP parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await checkServer(ip, port, platform as 'java' | 'bedrock' | 'crossplatform');
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in server-monitor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isValidBase64(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  try {
    // Check basic format
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
      return false;
    }
    
    // Check reasonable length bounds
    if (str.length < 100 || str.length > 100000) {
      return false;
    }
    
    const decoded = atob(str);
    const reencoded = btoa(decoded);
    
    if (reencoded !== str) {
      return false;
    }

    const imageSignatures = [
      '/9j/', // JPEG
      'iVBORw0KGgo', // PNG
      'R0lGOD', // GIF
      'UklGR', // WebP
      'Qk0' // BMP
    ];

    return imageSignatures.some(sig => str.startsWith(sig));
  } catch (error) {
    return false;
  }
}

async function generateIconHash(iconData: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(iconData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}