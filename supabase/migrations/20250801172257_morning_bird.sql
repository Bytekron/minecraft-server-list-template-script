/*
  # Create delete_all_user_servers function

  1. New Functions
    - `delete_all_user_servers(target_user_id uuid)`
      - Deletes all servers belonging to a specific user
      - Returns count of deleted servers
      - Uses SECURITY DEFINER for admin access

  2. Security
    - Function uses SECURITY DEFINER to bypass RLS
    - Only accessible through admin service calls
*/

CREATE OR REPLACE FUNCTION public.delete_all_user_servers(target_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count bigint;
BEGIN
    -- Delete all servers belonging to the target user
    DELETE FROM public.servers
    WHERE user_id = target_user_id;

    -- Get the count of deleted rows
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Return the count
    RETURN deleted_count;
END;
$$;