/*
  # Remove Server Statistics System

  1. Removed Tables
    - Drop `daily_rank_snapshots` table
    - Drop `hourly_rank_snapshots` table
    
  2. Removed Functions
    - Drop all statistics-related database functions
    
  3. Security
    - Remove RLS policies for dropped tables
*/

-- Drop database functions
DROP FUNCTION IF EXISTS get_server_player_history_24h(uuid);
DROP FUNCTION IF EXISTS get_server_uptime_30d(uuid);
DROP FUNCTION IF EXISTS get_server_votes_30d(uuid);
DROP FUNCTION IF EXISTS get_server_rank_history_30d(uuid);
DROP FUNCTION IF EXISTS get_server_rank_history_hourly(uuid);
DROP FUNCTION IF EXISTS calculate_daily_uptime(uuid, date);
DROP FUNCTION IF EXISTS update_daily_rank_snapshots();
DROP FUNCTION IF EXISTS update_hourly_rank_snapshots();

-- Drop tables
DROP TABLE IF EXISTS hourly_rank_snapshots;
DROP TABLE IF EXISTS daily_rank_snapshots;