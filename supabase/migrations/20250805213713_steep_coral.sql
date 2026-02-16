/*
  # Create sponsored servers table

  1. New Tables
    - `sponsored_servers`
      - `id` (uuid, primary key)
      - `name` (text, server name)
      - `ip` (text, server IP address)
      - `java_port` (integer, Java port, default 25565)
      - `bedrock_port` (integer, Bedrock port, default 19132)
      - `platform` (enum, java/bedrock/crossplatform)
      - `gamemode` (text, main gamemode)
      - `min_version` (text, minimum version)
      - `max_version` (text, maximum version)
      - `banner_url` (text, banner image URL)
      - `display_order` (integer, for ordering sponsored servers)
      - `is_active` (boolean, whether to show the sponsored server)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, admin user who created it)

  2. Security
    - Enable RLS on `sponsored_servers` table
    - Add policy for public read access to active sponsored servers
    - Add policy for admin-only write access

  3. Functions
    - Add trigger to update `updated_at` timestamp
*/

-- Create sponsored_servers table
CREATE TABLE IF NOT EXISTS sponsored_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ip text NOT NULL,
  java_port integer DEFAULT 25565,
  bedrock_port integer DEFAULT 19132,
  platform server_platform NOT NULL,
  gamemode text NOT NULL,
  min_version text DEFAULT '1.7',
  max_version text DEFAULT '1.21',
  banner_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE sponsored_servers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active sponsored servers"
  ON sponsored_servers
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage sponsored servers"
  ON sponsored_servers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sponsored_servers_active_order 
  ON sponsored_servers (is_active, display_order ASC);

CREATE INDEX IF NOT EXISTS idx_sponsored_servers_platform 
  ON sponsored_servers (platform);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sponsored_servers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sponsored_servers_updated_at
  BEFORE UPDATE ON sponsored_servers
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsored_servers_updated_at();