/*
  # Fix RLS Policies for Public Access

  1. Policy Updates
    - Ensure anonymous users can read approved servers
    - Fix any overly restrictive policies
    - Add missing policies for public data access

  2. Security
    - Maintain security for user data
    - Allow public read access to approved content
    - Keep write restrictions in place
*/

-- Fix servers table policies to allow anonymous read access to approved servers
DROP POLICY IF EXISTS "Anyone can read approved servers" ON servers;

CREATE POLICY "Anyone can read approved servers"
  ON servers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Ensure server_stats can be read by anyone for approved servers
DROP POLICY IF EXISTS "Allow anon read server_stats" ON server_stats;

CREATE POLICY "Allow anon read server_stats"
  ON server_stats
  FOR SELECT
  TO anon, authenticated
  USING (
    server_id IN (
      SELECT id FROM servers WHERE status = 'approved'
    )
  );

-- Ensure server_icons can be read by anyone for approved servers
DROP POLICY IF EXISTS "Allow anon read server_icons" ON server_icons;

CREATE POLICY "Allow anon read server_icons"
  ON server_icons
  FOR SELECT
  TO anon, authenticated
  USING (
    server_id IN (
      SELECT id FROM servers WHERE status = 'approved'
    )
  );

-- Ensure votes can be read by anyone
DROP POLICY IF EXISTS "Allow anyone to read votes" ON votes;

CREATE POLICY "Allow anyone to read votes"
  ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ensure reviews can be read by anyone
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;

CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix user_profiles to allow reading usernames for server listings
DROP POLICY IF EXISTS "Allow reading usernames for server listings" ON user_profiles;

CREATE POLICY "Allow reading usernames for server listings"
  ON user_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);