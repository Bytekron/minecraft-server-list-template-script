/*
  # Improve Server Icon Caching System

  1. Database Changes
    - Add index for faster icon lookups
    - Add icon validation trigger
    - Improve icon update timestamp handling

  2. Performance Improvements
    - Better indexing for icon queries
    - Automatic cleanup of invalid icons
    - Optimized icon hash generation

  3. Caching Strategy
    - Icons cached until next server check
    - Invalid icons automatically removed
    - Hash-based deduplication
*/

-- Add index for faster icon lookups by server_id
CREATE INDEX IF NOT EXISTS idx_server_icons_server_id_fast ON server_icons(server_id);

-- Add index for icon hash lookups (deduplication)
CREATE INDEX IF NOT EXISTS idx_server_icons_hash_lookup ON server_icons(icon_hash) WHERE icon_hash IS NOT NULL;

-- Function to validate base64 icon data
CREATE OR REPLACE FUNCTION validate_icon_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if icon_data is valid base64 and reasonable size
  IF NEW.icon_data IS NOT NULL THEN
    -- Check minimum length (should be at least 100 characters for a valid icon)
    IF LENGTH(NEW.icon_data) < 100 THEN
      NEW.icon_data := NULL;
      NEW.icon_hash := NULL;
      RETURN NEW;
    END IF;
    
    -- Check maximum length (prevent extremely large icons)
    IF LENGTH(NEW.icon_data) > 100000 THEN
      NEW.icon_data := NULL;
      NEW.icon_hash := NULL;
      RETURN NEW;
    END IF;
    
    -- Check if it looks like base64 (basic validation)
    IF NEW.icon_data !~ '^[A-Za-z0-9+/]*={0,2}$' THEN
      NEW.icon_data := NULL;
      NEW.icon_hash := NULL;
      RETURN NEW;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for icon validation
DROP TRIGGER IF EXISTS validate_server_icon_trigger ON server_icons;
CREATE TRIGGER validate_server_icon_trigger
  BEFORE INSERT OR UPDATE ON server_icons
  FOR EACH ROW
  EXECUTE FUNCTION validate_icon_data();

-- Function to cleanup old/invalid icons (called by monitoring)
CREATE OR REPLACE FUNCTION cleanup_invalid_icons()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete icons with invalid data
  DELETE FROM server_icons 
  WHERE icon_data IS NULL 
     OR LENGTH(icon_data) < 100 
     OR LENGTH(icon_data) > 100000
     OR icon_data !~ '^[A-Za-z0-9+/]*={0,2}$';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete icons for servers that no longer exist
  DELETE FROM server_icons 
  WHERE server_id NOT IN (SELECT id FROM servers);
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get server icon with fallback
CREATE OR REPLACE FUNCTION get_server_icon(server_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  icon_data TEXT;
BEGIN
  SELECT si.icon_data INTO icon_data
  FROM server_icons si
  WHERE si.server_id = server_uuid
    AND si.icon_data IS NOT NULL
    AND LENGTH(si.icon_data) >= 100;
  
  RETURN icon_data;
END;
$$ LANGUAGE plpgsql;

-- Update the server icon timestamp function to handle validation
CREATE OR REPLACE FUNCTION update_server_icon_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  
  -- Validate icon data before updating
  IF NEW.icon_data IS NOT NULL THEN
    -- Generate hash if not provided
    IF NEW.icon_hash IS NULL THEN
      NEW.icon_hash = encode(digest(NEW.icon_data, 'sha256'), 'hex');
    END IF;
  ELSE
    NEW.icon_hash = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;