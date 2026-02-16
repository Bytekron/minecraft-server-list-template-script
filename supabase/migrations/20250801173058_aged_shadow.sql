/*
  # Fix ban_user function - resolve ambiguous column reference

  1. Function Updates
    - Use fully qualified column names to avoid ambiguity
    - Rename function parameter to avoid conflict with column name
    - Add proper error handling

  2. Security
    - Maintains admin-only access
    - Proper parameter validation
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS ban_user(UUID, BOOLEAN, TEXT, UUID);

-- Create the corrected ban_user function
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id UUID,
  ban_status BOOLEAN,
  ban_reason TEXT DEFAULT NULL,
  admin_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Validate target user exists
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = target_user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update the user's ban status
  UPDATE user_profiles 
  SET 
    is_banned = ban_status,
    banned_at = CASE 
      WHEN ban_status = true THEN now() 
      ELSE NULL 
    END,
    banned_reason = CASE 
      WHEN ban_status = true THEN ban_reason 
      ELSE NULL 
    END,
    user_profiles.banned_by_user_id = CASE 
      WHEN ban_status = true THEN COALESCE(admin_user_id, auth.uid())
      ELSE NULL 
    END,
    updated_at = now()
  WHERE user_profiles.id = target_user_id;

  -- Log the action
  IF ban_status = true THEN
    RAISE NOTICE 'User % has been banned by admin %', target_user_id, auth.uid();
  ELSE
    RAISE NOTICE 'User % has been unbanned by admin %', target_user_id, auth.uid();
  END IF;
END;
$$;