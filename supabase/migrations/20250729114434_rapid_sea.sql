/*
  # Add minecraft_username column to votes table

  1. Changes
    - Add `minecraft_username` column to `votes` table
    - Column allows null values for backward compatibility
    - Add index for performance on minecraft username lookups

  2. Security
    - No RLS changes needed as existing policies cover the new column
*/

-- Add minecraft_username column to votes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'minecraft_username'
  ) THEN
    ALTER TABLE votes ADD COLUMN minecraft_username text;
  END IF;
END $$;

-- Add index for minecraft_username lookups
CREATE INDEX IF NOT EXISTS idx_votes_minecraft_username ON votes(minecraft_username);