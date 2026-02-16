/*
  # Add user ban fields and ban_user function

  1. New Columns
    - `user_profiles.is_banned` (boolean, default false)
    - `user_profiles.banned_at` (timestamp)
    - `user_profiles.banned_reason` (text)
    - `user_profiles.banned_by_user_id` (uuid, references user_profiles)

  2. New Functions
    - `ban_user()` - Securely ban/unban users (admin only)

  3. Security
    - Function uses SECURITY DEFINER with admin-only access
    - Only authenticated admins can execute the function
*/

-- Add ban-related columns to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banned_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banned_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banned_reason'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banned_reason text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banned_by_user_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banned_by_user_id uuid REFERENCES user_profiles(id);
  END IF;
END $$;

-- Create the ban_user function
CREATE OR REPLACE FUNCTION public.ban_user(
    target_user_id uuid,
    ban_status boolean,
    ban_reason text DEFAULT NULL,
    banned_by_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the calling user is an admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    IF ban_status THEN
        -- Ban the user
        UPDATE public.user_profiles
        SET
            is_banned = TRUE,
            banned_at = NOW(),
            banned_reason = ban_reason,
            banned_by_user_id = banned_by_user_id,
            updated_at = NOW()
        WHERE id = target_user_id;
    ELSE
        -- Unban the user
        UPDATE public.user_profiles
        SET
            is_banned = FALSE,
            banned_at = NULL,
            banned_reason = NULL,
            banned_by_user_id = NULL,
            updated_at = NOW()
        WHERE id = target_user_id;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
-- The function itself checks for admin status
GRANT EXECUTE ON FUNCTION public.ban_user TO authenticated;