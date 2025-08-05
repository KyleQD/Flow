-- Migration: Fix RLS policies for profile_colors column
-- Description: Updates RLS policies to use account_settings instead of non-existent profile_visibility column

-- Drop the old RLS policy that uses profile_visibility
DROP POLICY IF EXISTS "Users can view public profile colors" ON profiles;

-- Create new RLS policy using account_settings
CREATE POLICY "Users can view public profile colors" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    (account_settings->'privacy'->>'profile_public')::boolean = true OR
    ((account_settings->'privacy'->>'profile_public')::boolean = false AND EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() AND following_id = profiles.id
    ))
  );

-- Ensure the update policy exists and is correct
DROP POLICY IF EXISTS "Users can update their own profile colors" ON profiles;

CREATE POLICY "Users can update their own profile colors" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add a general policy for users to update their own profiles
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add a general policy for users to select their own profile
CREATE POLICY IF NOT EXISTS "Users can select their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id); 