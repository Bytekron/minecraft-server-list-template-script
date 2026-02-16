/*
  # Add admin functionality to user profiles

  1. New Columns
    - `is_admin` (boolean, default false) - Indicates if user has admin privileges

  2. Security
    - Add index for efficient admin queries
    - Add RLS policies for admin access to user profiles
    - Allow admins to read all user profiles
    - Allow admins to update admin status of other users

  3. Changes
    - Users can still read and update their own profiles
    - Admins get additional permissions to manage other users
*/

-- Add is_admin column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Add index for efficient admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Add RLS policies for admin functionality
CREATE POLICY "Admins can read all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );

CREATE POLICY "Admins can update user admin status"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );