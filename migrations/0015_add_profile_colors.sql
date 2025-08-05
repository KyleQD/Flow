-- Migration: Add profile_colors column to profiles table
-- Description: Adds a JSONB column to store user profile color customization preferences

-- Add profile_colors column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_colors JSONB DEFAULT '{
  "primary_color": "#10b981",
  "secondary_color": "#059669", 
  "accent_color": "#34d399",
  "background_gradient": "emerald",
  "custom_gradient_start": "#0f172a",
  "custom_gradient_end": "#1e293b",
  "use_dark_mode": false,
  "enable_animations": true,
  "enable_glow_effects": true
}'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN profiles.profile_colors IS 'JSONB object containing user profile color customization preferences including primary, secondary, accent colors, background gradient, and visual effects settings';

-- Create index for efficient querying of profile colors
CREATE INDEX IF NOT EXISTS idx_profiles_profile_colors ON profiles USING GIN (profile_colors);

-- Add RLS policy for profile_colors column
-- Users can only update their own profile colors
CREATE POLICY IF NOT EXISTS "Users can update their own profile colors" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can view profile colors of public profiles
CREATE POLICY IF NOT EXISTS "Users can view public profile colors" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    profile_visibility = 'public' OR
    (profile_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() AND following_id = profiles.id
    ))
  );

-- Update existing profiles with default color scheme
UPDATE profiles 
SET profile_colors = '{
  "primary_color": "#10b981",
  "secondary_color": "#059669",
  "accent_color": "#34d399", 
  "background_gradient": "emerald",
  "custom_gradient_start": "#0f172a",
  "custom_gradient_end": "#1e293b",
  "use_dark_mode": false,
  "enable_animations": true,
  "enable_glow_effects": true
}'::jsonb
WHERE profile_colors IS NULL; 