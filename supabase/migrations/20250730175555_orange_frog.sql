/*
  # Server Analytics System

  1. New Tables
    - `server_analytics_events`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers)
      - `event_type` (enum: impression, click, ip_copy, vote, review)
      - `user_ip` (text, hashed for privacy)
      - `user_agent` (text, for device/browser analytics)
      - `referrer` (text, where they came from)
      - `session_id` (text, to track unique sessions)
      - `created_at` (timestamp)

    - `server_analytics_daily`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers)
      - `date` (date)
      - `impressions` (integer)
      - `clicks` (integer)
      - `ip_copies` (integer)
      - `votes` (integer)
      - `reviews` (integer)
      - `unique_visitors` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for server owners to read their own analytics
    - Add policies for system to insert/update analytics

  3. Indexes
    - Optimize for date range queries
    - Optimize for server_id lookups
*/

-- Create enum for event types
CREATE TYPE analytics_event_type AS ENUM (
  'impression',
  'click', 
  'ip_copy',
  'vote',
  'review'
);

-- Create server analytics events table
CREATE TABLE IF NOT EXISTS server_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  event_type analytics_event_type NOT NULL,
  user_ip_hash text NOT NULL,
  user_agent text,
  referrer text,
  session_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create server analytics daily aggregates table
CREATE TABLE IF NOT EXISTS server_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  ip_copies integer DEFAULT 0,
  votes integer DEFAULT 0,
  reviews integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(server_id, date)
);

-- Enable RLS
ALTER TABLE server_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Policies for server_analytics_events
CREATE POLICY "Server owners can read their analytics events"
  ON server_analytics_events
  FOR SELECT
  TO authenticated
  USING (
    server_id IN (
      SELECT id FROM servers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics events"
  ON server_analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policies for server_analytics_daily
CREATE POLICY "Server owners can read their daily analytics"
  ON server_analytics_daily
  FOR SELECT
  TO authenticated
  USING (
    server_id IN (
      SELECT id FROM servers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage daily analytics"
  ON server_analytics_daily
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_server_date 
  ON server_analytics_events(server_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type 
  ON server_analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
  ON server_analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_server_date 
  ON server_analytics_daily(server_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_date 
  ON server_analytics_daily(date DESC);

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS trigger AS $$
BEGIN
  -- Insert or update daily analytics
  INSERT INTO server_analytics_daily (
    server_id,
    date,
    impressions,
    clicks,
    ip_copies,
    votes,
    reviews,
    unique_visitors
  )
  VALUES (
    NEW.server_id,
    DATE(NEW.created_at),
    CASE WHEN NEW.event_type = 'impression' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'ip_copy' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'vote' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'review' THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (server_id, date)
  DO UPDATE SET
    impressions = server_analytics_daily.impressions + 
      CASE WHEN NEW.event_type = 'impression' THEN 1 ELSE 0 END,
    clicks = server_analytics_daily.clicks + 
      CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    ip_copies = server_analytics_daily.ip_copies + 
      CASE WHEN NEW.event_type = 'ip_copy' THEN 1 ELSE 0 END,
    votes = server_analytics_daily.votes + 
      CASE WHEN NEW.event_type = 'vote' THEN 1 ELSE 0 END,
    reviews = server_analytics_daily.reviews + 
      CASE WHEN NEW.event_type = 'review' THEN 1 ELSE 0 END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update daily analytics
CREATE TRIGGER trigger_update_daily_analytics
  AFTER INSERT ON server_analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_analytics();

-- Function to clean old analytics data (keep only 2 months)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Delete events older than 2 months
  DELETE FROM server_analytics_events 
  WHERE created_at < now() - interval '2 months';
  
  -- Delete daily data older than 2 months
  DELETE FROM server_analytics_daily 
  WHERE date < current_date - interval '2 months';
END;
$$ LANGUAGE plpgsql;