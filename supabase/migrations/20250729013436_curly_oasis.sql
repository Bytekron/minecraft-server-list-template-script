/*
  # Simplify voting system for guest users

  1. Changes
    - Drop existing complex RLS policies
    - Create simple guest-based voting policy
    - Allow all users to vote as guests with UUID tracking

  2. Security
    - Simple IP-based cooldown handled in application
    - Guest UUID generation for tracking
    - No complex user authentication requirements
*/

-- Drop all existing policies on votes table
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
DROP POLICY IF EXISTS "Enable voting for all users" ON votes;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own votes and anonymous users to insert votes" ON votes;
DROP POLICY IF EXISTS "Users can vote" ON votes;
DROP POLICY IF EXISTS "Allow voting" ON votes;

-- Create simple policies for guest-based voting
CREATE POLICY "Allow anyone to read votes"
  ON votes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow guest voting"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;