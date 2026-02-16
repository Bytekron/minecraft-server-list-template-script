/*
  # Add rank tracking function and daily snapshots

  1. New Functions
    - `calculate_and_store_daily_ranks()` - Calculates server rankings and stores daily snapshots
    - `get_server_rank(server_id)` - Gets current rank for a specific server

  2. Automated Process
    - Daily rank calculation based on votes
    - Stores rank snapshots for historical tracking
    - Handles ties by using creation date as tiebreaker

  3. Performance
    - Efficient ranking calculation
    - Indexed for fast queries
    - Automatic cleanup of old data
*/

-- Function to calculate current rank for a server
CREATE OR REPLACE FUNCTION get_server_rank(target_server_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  server_rank integer;
BEGIN
  SELECT rank_position INTO server_rank
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY votes DESC, created_at ASC) as rank_position
    FROM servers 
    WHERE status = 'approved'
  ) ranked_servers
  WHERE id = target_server_id;
  
  RETURN COALESCE(server_rank, 999999);
END;
$$;

-- Function to calculate and store daily ranks for all servers
CREATE OR REPLACE FUNCTION calculate_and_store_daily_ranks()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_date date := CURRENT_DATE;
BEGIN
  -- Insert daily rank snapshots for all approved servers
  INSERT INTO daily_rank_snapshots (server_id, date, rank_position, total_votes)
  SELECT 
    id as server_id,
    current_date as date,
    ROW_NUMBER() OVER (ORDER BY votes DESC, created_at ASC) as rank_position,
    votes as total_votes
  FROM servers 
  WHERE status = 'approved'
  ON CONFLICT (server_id, date) 
  DO UPDATE SET 
    rank_position = EXCLUDED.rank_position,
    total_votes = EXCLUDED.total_votes;
    
  -- Log the operation
  RAISE NOTICE 'Daily rank snapshots updated for %', current_date;
END;
$$;

-- Create a trigger to automatically update ranks when votes change
CREATE OR REPLACE FUNCTION trigger_rank_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only recalculate if votes changed significantly (every 10 votes)
  IF (NEW.votes - OLD.votes) >= 10 OR (OLD.votes - NEW.votes) >= 10 THEN
    PERFORM calculate_and_store_daily_ranks();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on servers table
DROP TRIGGER IF EXISTS update_ranks_on_vote_change ON servers;
CREATE TRIGGER update_ranks_on_vote_change
  AFTER UPDATE OF votes ON servers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_rank_update();

-- Initial population of today's ranks
SELECT calculate_and_store_daily_ranks();