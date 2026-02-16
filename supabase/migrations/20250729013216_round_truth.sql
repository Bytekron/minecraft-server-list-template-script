/*
  # Fix voting RLS policy comprehensively

  This migration completely resolves the RLS policy violation for the votes table
  by creating proper policies that allow both authenticated and anonymous voting.

  1. Security
    - Drop all existing INSERT policies to avoid conflicts
    - Create a single comprehensive INSERT policy for both anon and authenticated users
    - Ensure the policy logic matches the application's voting behavior
*/

-- Drop all existing INSERT policies for votes table
DROP POLICY IF EXISTS "Allow authenticated users to insert their own votes and anonymo" ON votes;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own votes and anonymous users to insert votes" ON votes;
DROP POLICY IF EXISTS "Users can insert votes" ON votes;
DROP POLICY IF EXISTS "Allow voting" ON votes;

-- Create a comprehensive INSERT policy that allows:
-- 1. Authenticated users to vote (user_id = auth.uid())
-- 2. Anonymous users to vote (user_id IS NULL)
CREATE POLICY "Enable voting for all users"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Ensure RLS is enabled
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;