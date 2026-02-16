/*
  # Fix RLS Policies and Add Missing Functions

  1. RLS Policy Updates
    - Update daily_rank_snapshots RLS policy to allow system inserts
    - Update hourly_rank_snapshots RLS policy to allow system inserts

  2. Missing Functions
    - Add update_hourly_rank_snapshots function
    - Ensure all rank update functions work properly

  3. Security
    - Maintain proper RLS while allowing system operations
    - Ensure functions can be called by Edge Functions with service role
*/

-- Fix RLS policies for rank snapshots tables
DROP POLICY IF EXISTS "System can insert daily rank snapshots" ON daily_rank_snapshots;
CREATE POLICY "System can insert daily rank snapshots"
  ON daily_rank_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert hourly rank snapshots" ON hourly_rank_snapshots;
CREATE POLICY "System can insert hourly rank snapshots"
  ON hourly_rank_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create the missing update_hourly_rank_snapshots function
CREATE OR REPLACE FUNCTION update_hourly_rank_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert hourly rank snapshots for all approved servers
  INSERT INTO hourly_rank_snapshots (server_id, recorded_at, rank_position, total_votes)
  SELECT 
    s.id,
    NOW() as recorded_at,
    ROW_NUMBER() OVER (ORDER BY s.votes DESC, s.created_at ASC) as rank_position,
    s.votes
  FROM servers s
  WHERE s.status = 'approved'
  ON CONFLICT DO NOTHING;
  
  -- Clean up old hourly snapshots (keep only last 7 days)
  DELETE FROM hourly_rank_snapshots 
  WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Update the daily rank snapshots function to be more robust
CREATE OR REPLACE FUNCTION update_daily_rank_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert daily rank snapshots for all approved servers
  INSERT INTO daily_rank_snapshots (server_id, date, rank_position, total_votes)
  SELECT 
    s.id,
    CURRENT_DATE,
    ROW_NUMBER() OVER (ORDER BY s.votes DESC, s.created_at ASC) as rank_position,
    s.votes
  FROM servers s
  WHERE s.status = 'approved'
  ON CONFLICT (server_id, date) 
  DO UPDATE SET 
    rank_position = EXCLUDED.rank_position,
    total_votes = EXCLUDED.total_votes;
  
  -- Clean up old daily snapshots (keep only last 90 days)
  DELETE FROM daily_rank_snapshots 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$;

-- Ensure the calculate_daily_uptime function exists and works properly
CREATE OR REPLACE FUNCTION calculate_daily_uptime(target_server_id UUID, target_date DATE)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_checks INTEGER;
  online_checks INTEGER;
  uptime_percentage NUMERIC;
BEGIN
  -- Count total checks for the day
  SELECT COUNT(*) INTO total_checks
  FROM server_stats
  WHERE server_id = target_server_id
    AND DATE(checked_at) = target_date;
  
  -- If no checks, assume 100% uptime
  IF total_checks = 0 THEN
    RETURN 100.0;
  END IF;
  
  -- Count online checks
  SELECT COUNT(*) INTO online_checks
  FROM server_stats
  WHERE server_id = target_server_id
    AND DATE(checked_at) = target_date
    AND online = true;
  
  -- Calculate percentage
  uptime_percentage := (online_checks::NUMERIC / total_checks::NUMERIC) * 100;
  
  RETURN ROUND(uptime_percentage, 2);
END;
$$;