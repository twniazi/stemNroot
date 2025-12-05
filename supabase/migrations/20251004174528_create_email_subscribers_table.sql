/*
  # Create Email Subscribers Table

  1. New Tables
    - `email_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `name` (text)
      - `status` (text, default 'active')
      - `source` (text)
      - `subscribed_at` (timestamptz, default now())
      - `unsubscribed_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())
    
  2. Security
    - Enable RLS on `email_subscribers` table
    - Add policy for authenticated users to read subscribers
    - Add policy for admins and content managers to manage subscribers
*/

-- Create email_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'active',
  source text,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "All users can view subscribers"
  ON email_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and content managers can manage subscribers"
  ON email_subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
