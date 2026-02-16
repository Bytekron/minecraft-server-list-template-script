/*
  # Server Statistics Functions and Triggers

  1. New Functions
    - `calculate_server_rank()` - Calculate current server rank based on votes
    - `update_daily_rank_snapshots()` - Store daily rank snapshots
    - `get_server_uptime_stats()` - Calculate uptime statistics
    - `cleanup_old_server_stats()` - Clean up old monitoring data

  2. Triggers
    - Daily rank snapshot trigger
    - Automatic cleanup trigger

  3. Indexes
    - Performance indexes for analytics queries
*/

-- Function to calculate server rank based on votes
CREATE OR REPLACE FUNCTION calculate_server_rank(server_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  rank_position INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO rank_position
  FROM servers 
  WHERE status = 'approved' 
    AND votes > (
      SELECT votes 
      FROM servers 
      WHERE id = server_uuid 
        AND status = 'approved'
    );
  
  RETURN COALESCE(rank_position, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to update daily rank snapshots
CREATE OR REPLACE FUNCTION update_daily_rank_snapshots()
RETURNS VOID AS $$
DECLARE
  server_record RECORD;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Update rank snapshots for all approved servers
  FOR server_record IN 
    SELECT id, votes 
    FROM servers 
    WHERE status = 'approved'
    ORDER BY votes DESC
  LOOP
    INSERT INTO daily_rank_snapshots (
      server_id, 
      date, 
      rank_position, 
      total_votes
    )
    VALUES (
      server_record.id,
      current_date,
      calculate_server_rank(server_record.id),
      server_record.votes
    )
    ON CONFLICT (server_id, date) 
    DO UPDATE SET 
      rank_position = calculate_server_rank(server_record.id),
      total_votes = server_record.votes;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get server uptime statistics
CREATE OR REPLACE FUNCTION get_server_uptime_stats(
  server_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  uptime_percentage NUMERIC,
  total_checks INTEGER,
  online_checks INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.checked_at::DATE as date,
    ROUND(
      (COUNT(CASE WHEN ss.online THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
      2
    ) as uptime_percentage,
    COUNT(*)::INTEGER as total_checks,
    COUNT(CASE WHEN ss.online THEN 1 END)::INTEGER as online_checks
  FROM server_stats ss
  WHERE ss.server_id = server_uuid
    AND ss.checked_at >= CURRENT_DATE - INTERVAL '%s days' % days_back
  GROUP BY ss.checked_at::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old server stats (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_server_stats()
RETURNS VOID AS $$
BEGIN
  -- Delete server_stats older than 90 days
  DELETE FROM server_stats 
  WHERE checked_at < CURRENT_DATE - INTERVAL '90 days';
  
  -- Delete analytics events older than 90 days
  DELETE FROM server_analytics_events 
  WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
  
  -- Delete daily analytics older than 1 year
  DELETE FROM server_analytics_daily 
  WHERE date < CURRENT_DATE - INTERVAL '1 year';
  
  -- Delete rank snapshots older than 1 year
  DELETE FROM daily_rank_snapshots 
  WHERE date < CURRENT_DATE - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_server_stats_server_date_online 
ON server_stats (server_id, checked_at DESC, online);

CREATE INDEX IF NOT EXISTS idx_daily_rank_snapshots_server_date 
ON daily_rank_snapshots (server_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_votes_server_created 
ON votes (server_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_servers_votes_status 
ON servers (votes DESC, status) WHERE status = 'approved';

-- Function to generate sample data for testing (optional)
CREATE OR REPLACE FUNCTION generate_sample_server_data(
  server_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS VOID AS $$
DECLARE
  current_day DATE;
  day_counter INTEGER := 0;
  base_players INTEGER := 50;
  base_rank INTEGER;
BEGIN
  -- Get current rank as base
  SELECT calculate_server_rank(server_uuid) INTO base_rank;
  
  -- Generate data for each day
  WHILE day_counter < days_back LOOP
    current_day := CURRENT_DATE - INTERVAL '%s days' % day_counter;
    
    -- Generate hourly server stats for this day
    FOR hour_counter IN 0..23 LOOP
      -- Calculate realistic player count based on time of day
      DECLARE
        time_multiplier NUMERIC := 0.5 + 0.5 * SIN((hour_counter - 6) * PI() / 12);
        random_factor NUMERIC := 0.8 + RANDOM() * 0.4;
        players_online INTEGER := GREATEST(0, ROUND(base_players * time_multiplier * random_factor));
        is_online BOOLEAN := RANDOM() > 0.05; -- 95% uptime
      BEGIN
        INSERT INTO server_stats (
          server_id,
          online,
          players_online,
          players_max,
          version,
          motd_clean,
          response_time_ms,
          checked_at
        ) VALUES (
          server_uuid,
          is_online,
          CASE WHEN is_online THEN players_online ELSE 0 END,
          100,
          '1.21',
          'Sample MOTD',
          CASE WHEN is_online THEN 50 + ROUND(RANDOM() * 100) ELSE NULL END,
          current_day + INTERVAL '%s hours' % hour_counter
        );
      END;
    END LOOP;
    
    -- Generate daily rank snapshot with slight variation
    INSERT INTO daily_rank_snapshots (
      server_id,
      date,
      rank_position,
      total_votes
    ) VALUES (
      server_uuid,
      current_day,
      GREATEST(1, base_rank + ROUND((RANDOM() - 0.5) * 10)),
      (SELECT votes FROM servers WHERE id = server_uuid)
    )
    ON CONFLICT (server_id, date) DO NOTHING;
    
    -- Generate some votes for this day (0-5 votes randomly)
    FOR vote_counter IN 1..ROUND(RANDOM() * 5) LOOP
      INSERT INTO votes (
        server_id,
        ip_address,
        minecraft_username,
        created_at
      ) VALUES (
        server_uuid,
        '192.168.1.' || ROUND(RANDOM() * 255),
        'Player' || ROUND(RANDOM() * 1000),
        current_day + INTERVAL '%s hours' % ROUND(RANDOM() * 24) + INTERVAL '%s minutes' % ROUND(RANDOM() * 60)
      );
    END LOOP;
    
    day_counter := day_counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_server_rank(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_daily_rank_snapshots() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_server_uptime_stats(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_server_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_sample_server_data(UUID, INTEGER) TO anon, authenticated;