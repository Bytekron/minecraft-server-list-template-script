/*
  # Add minecraft_username to votes table

  1. Changes
    - Add `minecraft_username` column to votes table
    - This will be used for votifier integration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'minecraft_username'
  ) THEN
    ALTER TABLE votes ADD COLUMN minecraft_username text;
  END IF;
END $$;