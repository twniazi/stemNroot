/*
  # Create Admin User for Integrations Access

  1. Purpose
    - Creates a user entry in the public.users table for the authenticated user
    - Grants admin role to enable access to integrations table
    - Links the public.users record to the auth.users record

  2. Changes
    - Inserts a new admin user record in public.users table
    - Sets role to 'admin' to allow managing integrations
    - Uses the existing authenticated user's ID from auth.users

  3. Security
    - Maintains existing RLS policies
    - Admin role grants full access to integrations table
*/

-- Insert admin user record for the authenticated user
INSERT INTO users (id, email, password_hash, name, role)
VALUES (
  '3faec222-557a-43e6-9e4a-2df13c622a91',
  'shh2k8@gmail.com',
  'dummy_hash_not_used',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
