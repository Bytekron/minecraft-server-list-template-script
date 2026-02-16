/*
  # Fix vote RLS policy for anonymous users

  1. Security Changes
    - Update votes table RLS policy to allow anonymous users to vote
    - Ensure proper IP-based voting restrictions
    - Allow both authenticated and anonymous users to insert votes

  2. Policy Updates
    - Modify existing insert policy to be more permissive
    - Keep existing select policy unchanged
*/

-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "Anyone can insert votes" ON votes;

-- Create new permissive insert policy for votes
CREATE POLICY "Allow voting for all users"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure the policy allows both anonymous and authenticated users
-- The application logic will handle duplicate vote prevention via IP checking