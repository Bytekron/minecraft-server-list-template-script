/*
  # Add bedrock_port column to servers table

  1. Changes
    - Add `bedrock_port` column to `servers` table with default value 19132
    - Column is nullable to allow servers that don't use Bedrock

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'servers' AND column_name = 'bedrock_port'
  ) THEN
    ALTER TABLE servers ADD COLUMN bedrock_port integer DEFAULT 19132;
  END IF;
END $$;