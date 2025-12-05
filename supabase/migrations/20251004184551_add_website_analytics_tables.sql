/*
  # Add Website Analytics Tables

  1. New Tables
    - `website_connections`
      - Stores connected website information
      - API keys for analytics platforms (Google Analytics, Plausible, etc.)
      - Connection status and last sync time
    
    - `website_analytics`
      - Stores daily analytics data from connected websites
      - Page views, unique visitors, bounce rate, etc.
      - Links to website_connections

  2. Security
    - Enable RLS on both tables
    - Admin users can manage all website connections
    - Users can view their own website analytics

  3. Purpose
    - Enable real external website connection
    - Store and display actual website analytics data
    - Support multiple analytics platforms
*/

-- Create website_connections table
CREATE TABLE IF NOT EXISTS website_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  website_name text NOT NULL,
  analytics_platform text DEFAULT 'google_analytics',
  api_key text,
  site_id text,
  is_connected boolean DEFAULT true,
  last_sync timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE website_connections ENABLE ROW LEVEL SECURITY;

-- Policies for website_connections
CREATE POLICY "Users can view own website connections"
  ON website_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website connections"
  ON website_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website connections"
  ON website_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own website connections"
  ON website_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create website_analytics table
CREATE TABLE IF NOT EXISTS website_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES website_connections(id) ON DELETE CASCADE,
  date date NOT NULL,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  sessions integer DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  avg_session_duration integer DEFAULT 0,
  new_visitors integer DEFAULT 0,
  returning_visitors integer DEFAULT 0,
  top_pages jsonb,
  traffic_sources jsonb,
  device_breakdown jsonb,
  location_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(connection_id, date)
);

-- Enable RLS
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for website_analytics
CREATE POLICY "Users can view analytics for their websites"
  ON website_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM website_connections
      WHERE website_connections.id = website_analytics.connection_id
      AND website_connections.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics data"
  ON website_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM website_connections
      WHERE website_connections.id = website_analytics.connection_id
      AND website_connections.user_id = auth.uid()
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_website_analytics_connection_date 
  ON website_analytics(connection_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_website_connections_user 
  ON website_connections(user_id);
