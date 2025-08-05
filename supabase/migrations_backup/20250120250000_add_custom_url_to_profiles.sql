-- Add Custom URL Support to Profiles
-- This migration adds custom_url field to profiles table for social media-style profile sharing

-- Add custom_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_url TEXT;

-- Add unique constraint on custom_url
ALTER TABLE profiles ADD CONSTRAINT unique_custom_url UNIQUE (custom_url);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON profiles(custom_url);

-- Add validation constraint for custom_url format
ALTER TABLE profiles ADD CONSTRAINT valid_custom_url 
CHECK (custom_url IS NULL OR (
  custom_url ~ '^[a-zA-Z0-9_-]+$' AND 
  LENGTH(custom_url) >= 3 AND 
  LENGTH(custom_url) <= 30
));

-- Update existing profiles to have a default custom_url based on username
UPDATE profiles 
SET custom_url = CASE 
  WHEN username IS NOT NULL AND LENGTH(username) >= 3 THEN 
    LOWER(REGEXP_REPLACE(username, '[^a-zA-Z0-9_-]', '', 'g'))
  ELSE 
    'user-' || SUBSTRING(id::text, 1, 8)
END
WHERE custom_url IS NULL;

-- Create function to generate unique custom_url
CREATE OR REPLACE FUNCTION generate_unique_custom_url(base_url TEXT)
RETURNS TEXT AS $$
DECLARE
  counter INTEGER := 0;
  test_url TEXT;
BEGIN
  test_url := base_url;
  
  WHILE EXISTS (SELECT 1 FROM profiles WHERE custom_url = test_url) LOOP
    counter := counter + 1;
    test_url := base_url || '-' || counter;
  END LOOP;
  
  RETURN test_url;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate and set custom_url
CREATE OR REPLACE FUNCTION set_custom_url(profile_id UUID, new_url TEXT)
RETURNS JSONB AS $$
DECLARE
  cleaned_url TEXT;
  final_url TEXT;
BEGIN
  -- Clean and validate the URL
  cleaned_url := LOWER(REGEXP_REPLACE(new_url, '[^a-zA-Z0-9_-]', '', 'g'));
  
  -- Check minimum length
  IF LENGTH(cleaned_url) < 3 THEN
    RETURN jsonb_build_object('success', false, 'error', 'URL must be at least 3 characters long');
  END IF;
  
  -- Check maximum length
  IF LENGTH(cleaned_url) > 30 THEN
    RETURN jsonb_build_object('success', false, 'error', 'URL must be no more than 30 characters long');
  END IF;
  
  -- Check for reserved words
  IF cleaned_url IN ('admin', 'api', 'www', 'app', 'settings', 'profile', 'user', 'account', 'dashboard', 'login', 'signup', 'auth', 'help', 'support', 'about', 'contact', 'terms', 'privacy', 'events', 'artist', 'venue', 'search', 'discover', 'feed', 'messages', 'notifications', 'billing', 'security', 'integrations') THEN
    RETURN jsonb_build_object('success', false, 'error', 'This URL is reserved and cannot be used');
  END IF;
  
  -- Generate unique URL if needed
  final_url := generate_unique_custom_url(cleaned_url);
  
  -- Update the profile
  UPDATE profiles 
  SET custom_url = final_url, updated_at = NOW()
  WHERE id = profile_id;
  
  RETURN jsonb_build_object('success', true, 'custom_url', final_url);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for custom_url access
CREATE POLICY "Custom URLs are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Add comment for documentation
COMMENT ON COLUMN profiles.custom_url IS 'Custom URL for profile sharing (e.g., tourify.com/username)'; 