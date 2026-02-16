/*
  # Fix votes table RLS policy

  1. Changes
    - Drop existing restrictive INSERT policy on votes table
    - Create new INSERT policy that allows both authenticated and anonymous voting
    - Policy allows votes where user_id matches auth.uid() OR user_id is NULL

  2. Security
    - Maintains data integrity by ensuring authenticated users can only vote as themselves
    - Allows anonymous users to vote with user_id set to NULL
    - Prevents unauthorized voting on behalf of other users
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert votes with proper user_id" ON votes;

-- Create a new INSERT policy that allows both authenticated and anonymous voting
CREATE POLICY "Allow voting for authenticated and anonymous users"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
    (auth.uid() IS NULL AND user_id IS NULL) OR
    (user_id IS NULL)
  );