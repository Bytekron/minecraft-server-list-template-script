/*
  # Fix votes table RLS policy

  1. Security Changes
    - Drop existing restrictive INSERT policy on votes table
    - Create new policy that allows both authenticated and anonymous voting
    - Policy allows INSERT when user_id matches auth.uid() OR user_id is NULL
    - Maintains data integrity while enabling voting functionality

  2. Policy Details
    - Authenticated users: can vote with their user_id
    - Anonymous users: can vote with user_id set to NULL
    - Prevents unauthorized voting while allowing legitimate votes
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow voting for authenticated and anonymous users" ON votes;

-- Create a new policy that properly allows voting
CREATE POLICY "Enable voting for all users" 
ON votes 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to vote with their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
  OR 
  -- Allow anonymous voting with user_id set to NULL
  (user_id IS NULL)
);