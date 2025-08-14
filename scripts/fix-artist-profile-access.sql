-- Fix Artist Profile Access Issues
-- This script ensures proper username setup and artist profile connections

-- First, let's check the current user profile data
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%felix%' OR email LIKE '%kyledaley%'
ORDER BY created_at DESC
LIMIT 5;

-- Check if profiles table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check profiles table for the user (if it exists with expected columns)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username' AND table_schema = 'public'
  ) THEN
    RAISE NOTICE 'Profiles table has username column - checking data...';
    PERFORM * FROM (
      SELECT 
        p.id,
        p.username,
        CASE WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'profiles' AND column_name = 'full_name'
        ) THEN p.full_name ELSE 'N/A' END as full_name,
        u.email
      FROM profiles p
      JOIN auth.users u ON p.id = u.id
      WHERE u.email LIKE '%felix%' OR u.email LIKE '%kyledaley%'
      ORDER BY p.created_at DESC
      LIMIT 5
    ) AS profile_check;
  ELSE
    RAISE NOTICE 'Profiles table missing username column - needs to be fixed first!';
  END IF;
END $$;

-- Check if there's an artist profile
SELECT 
  ap.id,
  ap.user_id,
  ap.artist_name,
  ap.bio,
  ap.genres,
  p.username,
  u.email
FROM artist_profiles ap
JOIN profiles p ON ap.user_id = p.id
JOIN auth.users u ON p.id = u.id
WHERE u.email LIKE '%felix%' OR u.email LIKE '%kyledaley%' OR p.username LIKE '%felix%'
ORDER BY ap.created_at DESC
LIMIT 5;

-- Function to fix username and artist profile setup
CREATE OR REPLACE FUNCTION fix_artist_profile_access(user_email TEXT)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  artist_name TEXT,
  profile_url TEXT
) AS $$
DECLARE
  target_user_id UUID;
  target_username TEXT;
  target_artist_name TEXT;
  existing_profile_id UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;
  
  -- Check if profile exists
  SELECT username INTO target_username
  FROM profiles
  WHERE id = target_user_id;
  
  -- If no username, create one from email
  IF target_username IS NULL OR target_username = '' THEN
    target_username := split_part(user_email, '@', 1);
    
    -- Update the profile with username
    UPDATE profiles 
    SET username = target_username,
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- If no profile exists, create one
    IF NOT FOUND THEN
      INSERT INTO profiles (
        id,
        username,
        full_name,
        bio,
        created_at,
        updated_at
      ) VALUES (
        target_user_id,
        target_username,
        COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = target_user_id), target_username),
        'Welcome to Tourify!',
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  -- Check if artist profile exists
  SELECT id, artist_name INTO existing_profile_id, target_artist_name
  FROM artist_profiles
  WHERE user_id = target_user_id;
  
  -- If no artist profile, create one
  IF existing_profile_id IS NULL THEN
    target_artist_name := COALESCE(target_username, 'Felix');
    
    INSERT INTO artist_profiles (
      user_id,
      artist_name,
      bio,
      genres,
      social_links,
      verification_status,
      account_tier,
      settings,
      created_at,
      updated_at
    ) VALUES (
      target_user_id,
      target_artist_name,
      'Artist on Tourify - building something amazing!',
      ARRAY['Electronic', 'Pop'],
      jsonb_build_object(
        'website', '',
        'instagram', '',
        'twitter', '',
        'youtube', '',
        'spotify', ''
      ),
      'unverified',
      'basic',
      jsonb_build_object(
        'public_profile', true,
        'allow_bookings', true,
        'show_contact_info', false,
        'auto_accept_follows', true
      ),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Return the results
  RETURN QUERY
  SELECT 
    target_user_id,
    target_username,
    COALESCE(target_artist_name, target_username),
    '/artist/' || target_username;
END;
$$ LANGUAGE plpgsql;

-- Example usage (replace with your actual email):
-- SELECT * FROM fix_artist_profile_access('your-email@example.com');
