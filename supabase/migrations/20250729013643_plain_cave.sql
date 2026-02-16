/*
  # Final Simple Voting System Fix

  1. Security
    - Drop all existing RLS policies on votes table
    - Create simple policy allowing all inserts for guests
    - Enable RLS on votes table

  2. Changes
    - Allow anyone (anon/authenticated) to insert votes
    - Remove complex user authentication requirements
    - Keep IP-based tracking for cooldowns (handled in application)
*/

-- Drop all existing policies on votes table
DROP POLICY IF EXISTS "Allow anon insert server_votes" ON votes;
DROP POLICY IF EXISTS "Allow guest voting" ON votes;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own votes and anonymous users to insert votes" ON votes;
DROP POLICY IF EXISTS "Allow voting for authenticated and anonymous users" ON votes;
DROP POLICY IF EXISTS "Users can vote for servers" ON votes;

-- Create simple policy allowing all voting
CREATE POLICY "Allow all voting"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;