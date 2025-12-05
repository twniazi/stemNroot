/*
  # Create Ad Creatives Table

  1. New Tables
    - `ad_creatives`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Ad name
      - `type` (text) - Ad type: image, video, carousel, text
      - `platform` (text) - Platform: Facebook, Instagram, Google Ads, etc.
      - `format` (text) - Ad format/dimensions
      - `headline` (text) - Ad headline
      - `description` (text) - Ad description
      - `cta_text` (text) - Call to action text
      - `image_url` (text, optional) - Image URL
      - `video_url` (text, optional) - Video URL
      - `status` (text) - Status: draft, active, paused, archived
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ad_performance`
      - `id` (uuid, primary key)
      - `ad_id` (uuid, references ad_creatives)
      - `impressions` (integer) - Number of impressions
      - `clicks` (integer) - Number of clicks
      - `conversions` (integer) - Number of conversions
      - `spend` (decimal) - Amount spent
      - `date` (date) - Performance date
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own ads
*/

-- Create ad_creatives table
CREATE TABLE IF NOT EXISTS ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'carousel', 'text')),
  platform text NOT NULL,
  format text NOT NULL,
  headline text NOT NULL,
  description text NOT NULL,
  cta_text text NOT NULL,
  image_url text,
  video_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ad_performance table
CREATE TABLE IF NOT EXISTS ad_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ad_creatives(id) ON DELETE CASCADE NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spend decimal(10, 2) DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_performance ENABLE ROW LEVEL SECURITY;

-- Policies for ad_creatives
CREATE POLICY "Users can view own ad creatives"
  ON ad_creatives FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad creatives"
  ON ad_creatives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad creatives"
  ON ad_creatives FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ad creatives"
  ON ad_creatives FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for ad_performance
CREATE POLICY "Users can view performance for own ads"
  ON ad_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ad_creatives
      WHERE ad_creatives.id = ad_performance.ad_id
      AND ad_creatives.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert performance for own ads"
  ON ad_performance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ad_creatives
      WHERE ad_creatives.id = ad_performance.ad_id
      AND ad_creatives.user_id = auth.uid()
    )
  );

-- Create index for performance lookups
CREATE INDEX IF NOT EXISTS idx_ad_performance_ad_id ON ad_performance(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_performance_date ON ad_performance(date);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_user_id ON ad_creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);
