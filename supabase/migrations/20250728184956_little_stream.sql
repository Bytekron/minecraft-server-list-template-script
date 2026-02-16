/*
  # Create ServerCraft Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text, unique)
      - `avatar_url` (text, nullable)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `servers`
      - `id` (uuid, primary key)
      - `name` (text, server name)
      - `ip` (text, server IP address)
      - `java_port` (integer, default 25565)
      - `query_port` (integer, default 25565)
      - `platform` (enum: java, bedrock, crossplatform)
      - `gamemode` (text, main gamemode)
      - `additional_gamemodes` (text, nullable)
      - `min_version` (text, default '1.7')
      - `max_version` (text, default '1.21')
      - `country` (text, default 'Worldwide')
      - `website` (text, nullable)
      - `discord` (text, nullable)
      - `youtube` (text, nullable)
      - `description` (text, server description)
      - `banner_url` (text, nullable)
      - `has_whitelist` (boolean, default false)
      - `votifier_enabled` (boolean, default false)
      - `votifier_public_key` (text, nullable)
      - `votifier_ip` (text, nullable)
      - `votifier_port` (integer, nullable)
      - `status` (enum: pending, approved, rejected, default pending)
      - `featured` (boolean, default false)
      - `votes` (integer, default 0)
      - `players_online` (integer, default 0)
      - `players_max` (integer, default 100)
      - `uptime` (numeric, default 99.0)
      - `last_ping` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references user_profiles)
    
    - `votes`
      - `id` (uuid, primary key)
      - `server_id` (uuid, references servers)
      - `user_id` (uuid, nullable, references user_profiles)
      - `ip_address` (text, for anonymous voting)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to approved servers
    - Add admin policies for server moderation

  3. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for filtering operations

  4. Functions
    - Auto-update timestamps
    - Vote counting triggers
    - Server ranking calculations
*/

-- Create custom types
CREATE TYPE server_platform AS ENUM ('java', 'bedrock', 'crossplatform');
CREATE TYPE server_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create servers table
CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ip text NOT NULL,
  java_port integer DEFAULT 25565,
  query_port integer DEFAULT 25565,
  platform server_platform NOT NULL,
  gamemode text NOT NULL,
  additional_gamemodes text,
  min_version text DEFAULT '1.7',
  max_version text DEFAULT '1.21',
  country text DEFAULT 'Worldwide',
  website text,
  discord text,
  youtube text,
  description text NOT NULL,
  banner_url text,
  has_whitelist boolean DEFAULT false,
  votifier_enabled boolean DEFAULT false,
  votifier_public_key text,
  votifier_ip text,
  votifier_port integer,
  status server_status DEFAULT 'pending',
  featured boolean DEFAULT false,
  votes integer DEFAULT 0,
  players_online integer DEFAULT 0,
  players_max integer DEFAULT 100,
  uptime numeric(5,2) DEFAULT 99.0,
  last_ping timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid REFERENCES servers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Servers Policies
CREATE POLICY "Anyone can read approved servers"
  ON servers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Users can read own servers"
  ON servers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own servers"
  ON servers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own servers"
  ON servers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all servers"
  ON servers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Votes Policies
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO anon, authenticated;

CREATE POLICY "Anyone can insert votes"
  ON votes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_platform ON servers(platform);
CREATE INDEX IF NOT EXISTS idx_servers_gamemode ON servers(gamemode);
CREATE INDEX IF NOT EXISTS idx_servers_featured ON servers(featured);
CREATE INDEX IF NOT EXISTS idx_servers_votes ON servers(votes DESC);
CREATE INDEX IF NOT EXISTS idx_servers_created_at ON servers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_server_id ON votes(server_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);

-- Create composite indexes for filtering
CREATE INDEX IF NOT EXISTS idx_servers_status_platform ON servers(status, platform);
CREATE INDEX IF NOT EXISTS idx_servers_status_gamemode ON servers(status, gamemode);
CREATE INDEX IF NOT EXISTS idx_servers_status_featured ON servers(status, featured);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_server_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE servers 
    SET votes = votes + 1 
    WHERE id = NEW.server_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE servers 
    SET votes = votes - 1 
    WHERE id = OLD.server_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for vote counting
CREATE TRIGGER update_vote_count_trigger
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_server_vote_count();

-- Create function for user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();