/*
  # Fix Server Monitoring RLS Policies

  This migration fixes the Row Level Security policies for server monitoring tables
  to allow the anonymous role to perform necessary operations for the monitoring system.

  ## Changes Made

  1. **Server Icons Table**
     - Allow anonymous users to insert server icons
     - Allow anonymous users to update server icons
     - Allow anonymous users to read server icons

  2. **Server Stats Table**
     - Allow anonymous users to insert server statistics
     - Allow anonymous users to read server statistics

  ## Security Note
  
  These policies allow anonymous access for the monitoring system to function.
  In production, consider using Supabase Edge Functions with service role access.
*/

-- Fix server_icons RLS policies
DROP POLICY IF EXISTS "Anyone can read server icons" ON server_icons;
DROP POLICY IF EXISTS "Authenticated users can manage server icons" ON server_icons;

-- Allow anonymous users to read server icons
CREATE POLICY "Allow anon read server_icons"
  ON server_icons
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert server icons
CREATE POLICY "Allow anon insert server_icons"
  ON server_icons
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update server icons
CREATE POLICY "Allow anon update server_icons"
  ON server_icons
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Fix server_stats RLS policies
DROP POLICY IF EXISTS "Anyone can read server stats" ON server_stats;
DROP POLICY IF EXISTS "Authenticated users can insert server stats" ON server_stats;

-- Allow anonymous users to read server stats
CREATE POLICY "Allow anon read server_stats"
  ON server_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert server stats
CREATE POLICY "Allow anon insert server_stats"
  ON server_stats
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);