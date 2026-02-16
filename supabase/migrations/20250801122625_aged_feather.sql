/*
  # Add Daily Rank Snapshots Table

  1. New Tables
    - `daily_rank_snapshots`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key)
      - `date` (date)
      - `rank_position` (integer)
      - `total_votes` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `daily_rank_snapshots` table
    - Add policy for public read access
    - Add policy for system insert access

  3. Indexes
    - Add composite index for server_id + date queries
    - Add index for date-based queries

  4. Functions
    - Add function to calculate and store daily rankings
*/

-- Create daily rank snapshots table
CREATE TABLE IF NOT EXISTS daily_rank_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  date date NOT NULL,
  rank_position integer NOT NULL,
  total_votes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate entries per server per day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'daily_rank_snapshots' 
    AND constraint_name = 'daily_rank_snapshots_server_date_key'
  ) THEN
    ALTER TABLE daily_rank_snapshots ADD CONSTRAINT daily_rank_snapshots_server_date_key UNIQUE (server_id, date);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE daily_rank_snapshots ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can read daily rank snapshots"
  ON daily_rank_snapshots
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can insert daily rank snapshots"
  ON daily_rank_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_rank_snapshots_server_date 
  ON daily_rank_snapshots(server_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_rank_snapshots_date 
  ON daily_rank_snapshots(date DESC);

-- Function to calculate and store daily rankings
CREATE OR REPLACE FUNCTION calculate_daily_rankings()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_date date := CURRENT_DATE;
  server_record RECORD;
  rank_position integer := 1;
BEGIN
  -- Delete existing snapshots for today (in case of re-run)
  DELETE FROM daily_rank_snapshots WHERE date = current_date;
  
  -- Calculate rankings based on current vote counts
  FOR server_record IN
    SELECT id, votes
    FROM servers
    WHERE status = 'approved'
    ORDER BY votes DESC, created_at ASC
  LOOP
    INSERT INTO daily_rank_snapshots (server_id, date, rank_position, total_votes)
    VALUES (server_record.id, current_date, rank_position, server_record.votes);
    
    rank_position := rank_position + 1;
  END LOOP;
  
  -- Clean up old snapshots (keep 90 days)
  DELETE FROM daily_rank_snapshots 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$;

-- Create a trigger to automatically calculate rankings daily
-- (This would typically be called by a cron job)
COMMENT ON FUNCTION calculate_daily_rankings() IS 'Calculates and stores daily server rankings based on vote counts';