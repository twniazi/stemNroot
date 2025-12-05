/*
  # Create Business Accounts Table

  1. New Tables
    - `business_accounts`
      - `id` (uuid, primary key) - Unique identifier for each business account
      - `user_id` (uuid, foreign key) - References auth.users table
      - `service` (text, unique) - Service name (splendid-account, shipkardo)
      - `username` (text) - Login username/email for the service
      - `password_encrypted` (text) - Encrypted password for the service
      - `is_connected` (boolean) - Connection status
      - `last_login` (timestamptz) - Last login timestamp
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `business_accounts` table
    - Add policy for authenticated users to read their own business accounts
    - Add policy for authenticated users to insert their own business accounts
    - Add policy for authenticated users to update their own business accounts
    - Add policy for authenticated users to delete their own business accounts

  3. Important Notes
    - Passwords should be encrypted before storage in production
    - The service column has a unique constraint to prevent duplicate entries
    - RLS policies ensure users can only access their own business accounts
*/

CREATE TABLE IF NOT EXISTS business_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  service text UNIQUE NOT NULL,
  username text NOT NULL,
  password_encrypted text NOT NULL,
  is_connected boolean DEFAULT true,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business accounts"
  ON business_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business accounts"
  ON business_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business accounts"
  ON business_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business accounts"
  ON business_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_business_accounts_user_id ON business_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_business_accounts_service ON business_accounts(service);
