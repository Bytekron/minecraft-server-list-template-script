/*
  # Fix votes table INSERT policy

  This migration fixes the INSERT policy for the votes table to allow both
  authenticated and anonymous users to vote properly.

  ## Changes
  1. Drop existing INSERT policies that may be causing issues
  2. Create a new INSERT policy that allows proper voting
  3. Skip SELECT policy creation since it already exists
*/

-- Drop any existing INSERT policies for votes table
DROP POLICY IF EXISTS "Allow authenticated users to insert votes" ON votes;
DROP POLICY IF EXISTS "Allow anonymous users to insert votes" ON votes;
DROP POLICY IF EXISTS "Users can insert votes" ON votes;
DROP POLICY IF EXISTS "Allow voting" ON votes;

-- Create the correct INSERT policy for votes
CREATE POLICY "Allow voting for all users" ON votes
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    -- Allow authenticated users to vote with their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- Allow anonymous users to vote with user_id as NULL
    (auth.uid() IS NULL AND user_id IS NULL)
  );