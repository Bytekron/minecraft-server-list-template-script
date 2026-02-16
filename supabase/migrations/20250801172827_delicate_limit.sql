/*
  # Fix ban_user function - resolve ambiguous column reference

  1. Database Functions
    - Fix ambiguous column reference in ban_user function
    - Use proper table aliases to avoid conflicts
    - Maintain security checks for admin-only access

  2. Security
    - Function remains SECURITY DEFINER with admin checks
    - Only admins can ban/unban users
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS ban_user(uuid, boolean, text, uuid);

-- Create the corrected ban_user function with proper column references
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id uuid,
  ban_status boolean,
  ban_reason text DEFAULT NULL,
  banned_by_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_id uuid;
BEGIN
  -- Get the current user ID
  calling_user_id := auth.uid();
  
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = calling_user_id AND up.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only administrators can ban/unban users';
  END IF;
  
  -- Update the user's ban status with explicit table alias
  UPDATE user_profiles up
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
    banned_by_user_id = CASE 
      WHEN ban_status = true THEN banned_by_user_id 
      ELSE NULL 
    END,
    updated_at = now()
  WHERE up.id = target_user_id;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;