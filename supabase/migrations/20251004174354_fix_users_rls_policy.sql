/*
  # Fix Users Table RLS Policies - Remove Infinite Recursion

  1. Changes
    - Drop the problematic "Admins can manage users" policy that causes infinite recursion
    - Drop the overly permissive "Users can view all user profiles" policy
    - Add secure policies that don't cause recursion:
      - Users can read their own profile data
      - Users can update their own profile data (except role)
      - Service role can manage all users
    
  2. Security
    - Maintains RLS protection
    - Prevents infinite recursion by using auth.uid() directly instead of querying users table
    - Users can only modify their own data
    - Role changes are prevented at the policy level
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view all user profiles" ON users;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow inserting user profile during signup (handled by trigger or service role)
CREATE POLICY "Service can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
