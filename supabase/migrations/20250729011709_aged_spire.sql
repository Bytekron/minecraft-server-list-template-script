/*
  # Fix votes system with 8-hour cooldown

  1. Security Updates
    - Drop existing restrictive policies on votes table
    - Create new policies for authenticated and guest users
    - Implement 8-hour voting cooldown at database level
    
  2. Policy Details
    - Authenticated users: Can vote once per server every 8 hours (checked by user_id)
    - Guest users: Can vote once per server every 8 hours (checked by IP address)
    - Maintains data integrity with proper RLS enforcement
*/

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Enable voting for all users" ON public.votes;
DROP POLICY IF EXISTS "Allow anon insert votes" ON public.votes;

-- Create policy for authenticated users (8-hour cooldown by user_id)
CREATE POLICY "Authenticated users can vote with 8h cooldown"
  ON public.votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.votes 
      WHERE server_id = votes.server_id 
      AND user_id = auth.uid() 
      AND created_at > (NOW() - INTERVAL '8 hours')
    )
  );

-- Create policy for guest users (8-hour cooldown by IP address)
CREATE POLICY "Guest users can vote with 8h IP cooldown"
  ON public.votes
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.votes 
      WHERE server_id = votes.server_id 
      AND ip_address = votes.ip_address 
      AND created_at > (NOW() - INTERVAL '8 hours')
    )
  );

-- Also allow authenticated users to vote anonymously if they prefer
CREATE POLICY "Authenticated users can vote anonymously with IP cooldown"
  ON public.votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.votes 
      WHERE server_id = votes.server_id 
      AND ip_address = votes.ip_address 
      AND created_at > (NOW() - INTERVAL '8 hours')
    )
  );