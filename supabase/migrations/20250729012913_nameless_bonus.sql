/*
  # Fix votes table RLS policy

  This migration implements the exact RLS policy recommended by the expert
  to resolve the 403 Forbidden error when inserting votes.

  1. Security
    - Drop existing INSERT policies that may be causing conflicts
    - Create new INSERT policy with correct USING expression
    - Allow authenticated users to vote when user_id matches their auth ID
    - Allow anonymous users to vote when user_id is NULL
*/

-- Drop any existing INSERT policies for votes table
DROP POLICY IF EXISTS "Allow voting for all users" ON votes;
DROP POLICY IF EXISTS "Users can insert votes" ON votes;
DROP POLICY IF EXISTS "Allow authenticated and anonymous voting" ON votes;
DROP POLICY IF EXISTS "Allow voting with proper user validation" ON votes;

-- Create the expert-recommended INSERT policy
CREATE POLICY "Allow authenticated users to insert their own votes and anonymous users to insert votes"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));