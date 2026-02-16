/*
  # Add server slugs for SEO-optimized URLs

  1. Schema Changes
    - Add `slug` column to servers table
    - Add unique constraint on slug
    - Add function to generate slugs automatically
    - Add trigger to update slugs when server name changes

  2. SEO Features
    - Unique slugs for each server (servername.id)
    - Automatic slug generation from server name
    - Handle duplicate names with numeric suffixes
*/

-- Add slug column to servers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'servers' AND column_name = 'slug'
  ) THEN
    ALTER TABLE servers ADD COLUMN slug text;
  END IF;
END $$;

-- Create unique index on slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'servers' AND indexname = 'servers_slug_key'
  ) THEN
    CREATE UNIQUE INDEX servers_slug_key ON servers(slug);
  END IF;
END $$;

-- Function to generate slug from server name
CREATE OR REPLACE FUNCTION generate_server_slug(server_name text, server_id uuid)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
  slug_exists boolean;
BEGIN
  -- Create base slug from server name
  base_slug := lower(regexp_replace(server_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- If base_slug is empty, use 'server'
  IF base_slug = '' THEN
    base_slug := 'server';
  END IF;
  
  -- Get last 4 characters of UUID for uniqueness
  final_slug := base_slug || '.' || substring(server_id::text from 1 for 4);
  
  -- Check if slug exists (excluding current server)
  SELECT EXISTS(
    SELECT 1 FROM servers 
    WHERE slug = final_slug AND id != server_id
  ) INTO slug_exists;
  
  -- If slug exists, add counter
  WHILE slug_exists LOOP
    final_slug := base_slug || '.' || substring(server_id::text from 1 for 4) || '-' || counter;
    counter := counter + 1;
    
    SELECT EXISTS(
      SELECT 1 FROM servers 
      WHERE slug = final_slug AND id != server_id
    ) INTO slug_exists;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to update server slug
CREATE OR REPLACE FUNCTION update_server_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate new slug if name changed or slug is null
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name) THEN
    NEW.slug := generate_server_slug(NEW.name, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slugs
DROP TRIGGER IF EXISTS trigger_update_server_slug ON servers;
CREATE TRIGGER trigger_update_server_slug
  BEFORE INSERT OR UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_server_slug();

-- Generate slugs for existing servers
UPDATE servers 
SET slug = generate_server_slug(name, id)
WHERE slug IS NULL;