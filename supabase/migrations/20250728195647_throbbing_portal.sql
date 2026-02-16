/*
  # Server Monitoring System

  1. New Tables
    - `server_stats`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers)
      - `online` (boolean)
      - `players_online` (integer)
      - `players_max` (integer)
      - `version` (text, nullable)
      - `motd_clean` (text, nullable)
      - `response_time_ms` (integer, nullable)
      - `checked_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `server_icons`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers, unique)
      - `icon_data` (text, nullable - base64 encoded icon)
      - `icon_hash` (text, nullable - for change detection)
      - `last_updated` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated write access

  3. Functions
    - `cleanup_old_server_stats()` - Remove stats older than 31 days
    - `get_latest_server_stats(server_uuid)` - Get most recent stats for a server
    - `calculate_server_uptime(server_uuid, hours)` - Calculate uptime percentage

  4. Indexes
    - Optimize queries for server lookups
    - Efficient cleanup operations
    - Fast icon retrieval
*/

-- Create server_stats table
CREATE TABLE IF NOT EXISTS server_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  online boolean NOT NULL DEFAULT false,
  players_online integer NOT NULL DEFAULT 0,
  players_max integer NOT NULL DEFAULT 0,
  version text,
  motd_clean text,
  response_time_ms integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create server_icons table
CREATE TABLE IF NOT EXISTS server_icons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL UNIQUE REFERENCES servers(id) ON DELETE CASCADE,
  icon_data text,
  icon_hash text,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_server_stats_server_id ON server_stats(server_id);
CREATE INDEX IF NOT EXISTS idx_server_stats_checked_at ON server_stats(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_server_stats_server_checked ON server_stats(server_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_server_icons_server_id ON server_icons(server_id);
CREATE INDEX IF NOT EXISTS idx_server_icons_hash ON server_icons(icon_hash);

-- Enable Row Level Security
ALTER TABLE server_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_icons ENABLE ROW LEVEL SECURITY;

-- Create policies for server_stats
CREATE POLICY "Anyone can read server stats"
  ON server_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert server stats"
  ON server_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for server_icons
CREATE POLICY "Anyone can read server icons"
  ON server_icons
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage server icons"
  ON server_icons
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to cleanup old server stats (keep only 31 days)
CREATE OR REPLACE FUNCTION cleanup_old_server_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM server_stats 
  WHERE checked_at < (now() - interval '31 days');
END;
$$;

-- Function to get latest server stats
CREATE OR REPLACE FUNCTION get_latest_server_stats(server_uuid uuid)
RETURNS TABLE (
  id uuid,
  server_id uuid,
  online boolean,
  players_online integer,
  players_max integer,
  version text,
  motd_clean text,
  response_time_ms integer,
  checked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.server_id,
    s.online,
    s.players_online,
    s.players_max,
    s.version,
    s.motd_clean,
    s.response_time_ms,
    s.checked_at
  FROM server_stats s
  WHERE s.server_id = server_uuid
  ORDER BY s.checked_at DESC
  LIMIT 1;
END;
$$;

-- Function to calculate server uptime
CREATE OR REPLACE FUNCTION calculate_server_uptime(server_uuid uuid, hours_back integer DEFAULT 24)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_checks integer;
  online_checks integer;
  uptime_percentage numeric;
BEGIN
  -- Count total checks in the specified time period
  SELECT COUNT(*) INTO total_checks
  FROM server_stats
  WHERE server_id = server_uuid
    AND checked_at >= (now() - (hours_back || ' hours')::interval);
  
  -- If no checks found, return 0
  IF total_checks = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count online checks
  SELECT COUNT(*) INTO online_checks
  FROM server_stats
  WHERE server_id = server_uuid
    AND checked_at >= (now() - (hours_back || ' hours')::interval)
    AND online = true;
  
  -- Calculate percentage
  uptime_percentage := (online_checks::numeric / total_checks::numeric) * 100;
  
  RETURN ROUND(uptime_percentage, 2);
END;
$$;

-- Create trigger to update last_updated timestamp on server_icons
CREATE OR REPLACE FUNCTION update_server_icon_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_server_icons_timestamp
  BEFORE UPDATE ON server_icons
  FOR EACH ROW
  EXECUTE FUNCTION update_server_icon_timestamp();