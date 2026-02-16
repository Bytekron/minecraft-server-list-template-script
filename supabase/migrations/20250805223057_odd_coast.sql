/*
  # Add target_url column to sponsored_servers table

  1. Changes
    - Add `target_url` column to `sponsored_servers` table
    - Column allows NULL values (optional field)
    - Column stores the URL where users are redirected when clicking on sponsored server elements

  2. Purpose
    - Allows sponsored servers to redirect to Discord, website, or any custom URL
    - Provides flexibility for sponsored server owners to direct traffic where they want
    - Maintains backward compatibility with existing sponsored servers
*/

-- Add target_url column to sponsored_servers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sponsored_servers' AND column_name = 'target_url'
  ) THEN
    ALTER TABLE sponsored_servers ADD COLUMN target_url text;
  END IF;
END $$;