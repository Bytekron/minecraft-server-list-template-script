/*
  # Extend Server Stats Data Retention

  1. Database Changes
    - Update server stats cleanup to keep data for 90 days instead of 30
    - Add index for better performance on date-based queries
    - Update analytics cleanup function

  2. Performance Improvements
    - Add composite index for server_id + checked_at queries
    - Optimize data retention policies
*/

-- Update the cleanup function to keep data for 90 days instead of 30
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep server_stats for 90 days (was 30)
  DELETE FROM server_stats 
  WHERE checked_at < NOW() - INTERVAL '90 days';
  
  -- Keep analytics events for 60 days (was 30)
  DELETE FROM server_analytics_events 
  WHERE created_at < NOW() - INTERVAL '60 days';
  
  -- Keep daily analytics for 1 year
  DELETE FROM server_analytics_daily 
  WHERE date < CURRENT_DATE - INTERVAL '1 year';
END;
$$;

-- Add better indexes for server stats queries
CREATE INDEX IF NOT EXISTS idx_server_stats_server_checked_detailed 
ON server_stats (server_id, checked_at DESC, online, players_online);

-- Add index for date-based cleanup operations
CREATE INDEX IF NOT EXISTS idx_server_stats_cleanup 
ON server_stats (checked_at) 
WHERE checked_at < NOW() - INTERVAL '90 days';

-- Add index for analytics events cleanup
CREATE INDEX IF NOT EXISTS idx_analytics_events_cleanup 
ON server_analytics_events (created_at) 
WHERE created_at < NOW() - INTERVAL '60 days';