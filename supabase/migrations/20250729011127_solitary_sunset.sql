/*
  # Fix votes table RLS policy

  1. Security Changes
    - Drop existing restrictive INSERT policy on votes table
    - Create new policy allowing both authenticated and anonymous users to vote
    - Policy ensures authenticated users can only vote with their own user_id
    - Policy allows anonymous users to vote with null user_id

  2. Policy Logic
    - Authenticated users: user_id must match auth.uid()
    - Anonymous users: user_id must be null
    - This maintains data integrity while allowing voting functionality
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow voting for all users" ON votes;

-- Create new comprehensive INSERT policy for votes
CREATE POLICY "Users can insert votes with proper user_id"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );