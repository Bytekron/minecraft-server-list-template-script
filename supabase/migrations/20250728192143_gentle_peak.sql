/*
  # Create automatic user profile creation trigger

  1. Functions
    - `handle_new_user()` - Trigger function that creates a user profile when a new user signs up
  
  2. Triggers
    - Automatically creates a user_profiles record when a user is created in auth.users
    - Uses the user's email and metadata for initial profile setup
  
  3. Security
    - Function runs with security definer privileges
    - Ensures user profiles are always created for new signups
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();