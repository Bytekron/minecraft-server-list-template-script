/*
  # Fix user profiles RLS policies for admin functionality

  1. Security Updates
    - Update RLS policies to allow proper user profile access
    - Ensure admin users can read necessary profile data
    - Fix authentication flow issues

  2. Policy Changes
    - Allow users to read their own profile data
    - Allow reading basic profile info for server listings
    - Ensure admin status is accessible when needed
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow reading usernames for server listings" ON user_profiles;

-- Create updated policies for user profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow reading usernames for server listings"
  ON user_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ensure the handle_new_user function exists and works properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();