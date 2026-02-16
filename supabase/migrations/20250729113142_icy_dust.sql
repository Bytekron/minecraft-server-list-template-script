/*
  # Add reviews table for server reviews

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers)
      - `minecraft_username` (text)
      - `review_text` (text, 100-500 characters)
      - `rating` (integer, 1-5 stars)
      - `ip_address` (text, for spam prevention)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reviews` table
    - Add policy for anyone to read reviews
    - Add policy for guests to insert reviews
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  minecraft_username text NOT NULL,
  review_text text NOT NULL CHECK (length(review_text) >= 100 AND length(review_text) <= 500),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_server_id ON reviews(server_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);