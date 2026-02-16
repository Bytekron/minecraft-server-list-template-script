/*
  # Fix ban_user function SQL syntax

  1. Function Updates
    - Remove table qualifiers from SET clause in UPDATE statement
    - Fix column references to use unqualified names in SET clause
    - Maintain proper WHERE clause with qualified names for clarity

  2. Changes Made
    - Changed `SET user_profiles.is_banned` to `SET is_banned`
    - Changed `SET user_profiles.banned_at` to `SET banned_at`
    - Changed `SET user_profiles.banned_reason` to `SET banned_reason`
    - Changed `SET user_profiles.banned_by_user_id` to `SET banned_by_user_id`
    - Changed `SET user_profiles.updated_at` to `SET updated_at`
*/

CREATE OR REPLACE FUNCTION public.ban_user(
  target_user_id uuid,
  ban_status boolean,
  ban_reason text DEFAULT NULL,
  admin_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_profiles.id = target_user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Update user ban status
  UPDATE user_profiles 
  SET 
    is_banned = ban_status,
    banned_at = CASE WHEN ban_status THEN now() ELSE NULL END,
    banned_reason = CASE WHEN ban_status THEN ban_reason ELSE NULL END,
    banned_by_user_id = CASE WHEN ban_status THEN admin_user_id ELSE NULL END,
    updated_at = now()
  WHERE user_profiles.id = target_user_id;
END;
$$;