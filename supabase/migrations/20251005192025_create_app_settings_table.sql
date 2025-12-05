/*
  # Create App Settings Table
  
  1. New Tables
    - `app_settings`
      - `id` (integer, primary key) - Fixed ID of 1 for singleton pattern
      - `app_name` (text) - Application name
      - `app_logo` (text) - Logo URL
      - `primary_color` (text) - Primary theme color
      - `secondary_color` (text) - Secondary theme color
      - `accent_color` (text) - Accent theme color
      - `tagline` (text) - Application tagline
      - `contact_email` (text) - Contact email
      - `company_url` (text) - Company website URL
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `app_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin users to update settings
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  app_name text DEFAULT 'STEM N ROOT',
  app_logo text,
  primary_color text DEFAULT '#16a34a',
  secondary_color text DEFAULT '#10b981',
  accent_color text DEFAULT '#059669',
  tagline text DEFAULT 'Digital Marketing Dashboard',
  contact_email text,
  company_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (id = 1);

INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
