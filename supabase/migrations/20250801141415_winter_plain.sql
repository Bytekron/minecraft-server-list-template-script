/*
  # Add Hourly Rank Tracking System

  1. New Tables
    - `hourly_rank_snapshots`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers)
      - `recorded_at` (timestamptz)
      - `rank_position` (integer)
      - `total_votes` (integer)

  2. New Functions
    - `update_hourly_server_ranks()` - Calculate and store current ranks for all servers
    - `get_server_rank_history_hourly()` - Get hourly rank history for a specific server
    - `calculate_current_server_rank_position()` - Get current rank position for a server

  3. Security
    - Enable RLS on `hourly_rank_snapshots` table
    - Add policies for reading rank data

  4. Indexes
    - Performance indexes for analytics queries
*/

-- Create hourly rank snapshots table
CREATE TABLE IF NOT EXISTS hourly_rank_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  recorded_at timestamptz DEFAULT now() NOT NULL,
  rank_position integer NOT NULL,
  total_votes integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hourly_rank_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read hourly rank snapshots"
  ON hourly_rank_snapshots
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can insert hourly rank snapshots"
  ON hourly_rank_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hourly_rank_snapshots_server_recorded 
  ON hourly_rank_snapshots(server_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hourly_rank_snapshots_recorded 
  ON hourly_rank_snapshots(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_hourly_rank_snapshots_rank_position 
  ON hourly_rank_snapshots(rank_position);

-- Function to update hourly server ranks (calculates actual positions in server list)
CREATE OR REPLACE FUNCTION update_hourly_server_ranks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert current rank positions for all approved servers
  INSERT INTO hourly_rank_snapshots (server_id, rank_position, total_votes, recorded_at)
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY votes DESC, created_at ASC) as rank_position,
    votes,
    now()
  FROM servers 
  WHERE status = 'approved'
  ON CONFLICT DO NOTHING;
  
  -- Clean up old hourly data (keep only last 7 days)
  DELETE FROM hourly_rank_snapshots 
  WHERE recorded_at < now() - INTERVAL '7 days';
END;
$$;

-- Function to get hourly rank history for a specific server
CREATE OR REPLACE FUNCTION get_server_rank_history_hourly(
  p_server_id uuid,
  p_hours integer DEFAULT 168
)
RETURNS TABLE(
  recorded_at timestamptz,
  rank_position integer,
  total_votes integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hrs.recorded_at,
    hrs.rank_position,
    hrs.total_votes
  FROM hourly_rank_snapshots hrs
  WHERE hrs.server_id = p_server_id
    AND hrs.recorded_at >= now() - (p_hours || ' hours')::interval
  ORDER BY hrs.recorded_at DESC;
END;
$$;

-- Function to calculate current server rank position
CREATE OR REPLACE FUNCTION calculate_current_server_rank_position(p_server_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_rank integer;
BEGIN
  -- Calculate current rank based on votes (same logic as server list)
  SELECT ROW_NUMBER() OVER (ORDER BY votes DESC, created_at ASC) INTO current_rank
  FROM servers 
  WHERE status = 'approved' AND id = p_server_id;
  
  RETURN COALESCE(current_rank, 1);
END;
$$;

-- Function to get daily rank averages (for chart display)
CREATE OR REPLACE FUNCTION get_daily_rank_averages(
  p_server_id uuid,
  p_days integer DEFAULT 7
)
RETURNS TABLE(
  date date,
  avg_rank_position numeric,
  min_rank_position integer,
  max_rank_position integer,
  total_snapshots bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hrs.recorded_at::date as date,
    ROUND(AVG(hrs.rank_position), 1) as avg_rank_position,
    MIN(hrs.rank_position) as min_rank_position,
    MAX(hrs.rank_position) as max_rank_position,
    COUNT(*) as total_snapshots
  FROM hourly_rank_snapshots hrs
  WHERE hrs.server_id = p_server_id
    AND hrs.recorded_at >= CURRENT_DATE - (p_days || ' days')::interval
  GROUP BY hrs.recorded_at::date
  ORDER BY date ASC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_hourly_server_ranks() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_server_rank_history_hourly(uuid, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_current_server_rank_position(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_rank_averages(uuid, integer) TO anon, authenticated;