/*
  # Fix server deletion RLS policies

  1. Security Updates
    - Add DELETE policy for users to delete their own servers
    - Ensure proper RLS policies for server management
    - Fix any permission issues with server deletion

  2. Changes
    - Add DELETE policy for authenticated users on their own servers
    - Verify existing policies are working correctly
*/

-- Add DELETE policy for users to delete their own servers
CREATE POLICY "Users can delete own servers"
  ON servers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure the existing policies are correct
DROP POLICY IF EXISTS "Users can update own servers" ON servers;
CREATE POLICY "Users can update own servers"
  ON servers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify SELECT policy for own servers
DROP POLICY IF EXISTS "Users can read own servers" ON servers;
CREATE POLICY "Users can read own servers"
  ON servers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);