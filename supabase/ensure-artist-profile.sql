-- =============================================
-- Ensure Artist Profile Function
-- =============================================
-- This function creates an artist profile if one doesn't exist
-- Call this when a user first accesses artist features

CREATE OR REPLACE FUNCTION ensure_artist_profile(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_profile_id UUID;
  new_profile_id UUID;
  user_email TEXT;
  default_artist_name TEXT;
BEGIN
  -- Check if artist profile already exists
  SELECT id INTO existing_profile_id
  FROM artist_profiles 
  WHERE user_id = target_user_id;
  
  -- If profile exists, return its ID
  IF existing_profile_id IS NOT NULL THEN
    RETURN existing_profile_id;
  END IF;
  
  -- Get user email for default name
  SELECT email INTO user_email
  FROM auth.users 
  WHERE id = target_user_id;
  
  -- Create default artist name from email
  default_artist_name := COALESCE(
    split_part(user_email, '@', 1),
    'Artist ' || substring(target_user_id::text, 1, 8)
  );
  
  -- Create new artist profile with minimal defaults
  INSERT INTO artist_profiles (
    user_id,
    artist_name,
    bio,
    genres,
    social_links,
    verification_status,
    account_tier,
    settings
  ) VALUES (
    target_user_id,
    default_artist_name,
    'New artist on Tourify - profile coming soon!',
    ARRAY['Other'],
    '{"website": "", "instagram": "", "twitter": "", "youtube": "", "spotify": ""}',
    'unverified',
    'basic',
    '{"public_profile": true, "allow_bookings": true, "show_contact_info": false, "auto_accept_follows": true}'
  )
  RETURNING id INTO new_profile_id;
  
  RETURN new_profile_id;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Profile was created by another process, get the ID
    SELECT id INTO existing_profile_id
    FROM artist_profiles 
    WHERE user_id = target_user_id;
    RETURN existing_profile_id;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to ensure artist profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Auto-create artist profile trigger
-- =============================================
-- This trigger automatically creates an artist profile when someone
-- accesses artist features for the first time

CREATE OR REPLACE FUNCTION auto_create_artist_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- This would be called when certain artist-specific actions happen
  -- For now, it's a placeholder that can be extended
  PERFORM ensure_artist_profile(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Manual profile creation for existing users
-- =============================================
-- Run this to create artist profiles for users who don't have them

DO $$
DECLARE
  user_record RECORD;
  profile_id UUID;
BEGIN
  -- Create artist profiles for users who access artist features but don't have profiles
  FOR user_record IN 
    SELECT DISTINCT u.id, u.email
    FROM auth.users u
    LEFT JOIN artist_profiles ap ON u.id = ap.user_id
    WHERE ap.id IS NULL
    AND u.email IS NOT NULL
    AND u.created_at > NOW() - INTERVAL '30 days' -- Only recent users
  LOOP
    BEGIN
      SELECT ensure_artist_profile(user_record.id) INTO profile_id;
      RAISE NOTICE 'Created artist profile % for user %', profile_id, user_record.email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create artist profile for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
END $$;

-- =============================================
-- Test the function
-- =============================================

DO $$
DECLARE
  test_profile_id UUID;
BEGIN
  -- Test with current authenticated user if any
  SELECT ensure_artist_profile(auth.uid()) INTO test_profile_id;
  RAISE NOTICE 'Artist profile ensured with ID: %', test_profile_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not test with current user: %', SQLERRM;
END $$;

-- =============================================
-- Success Message
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Artist Profile Ensure Function Setup Complete!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - ensure_artist_profile(user_id)';
  RAISE NOTICE '  - auto_create_artist_profile()';
  RAISE NOTICE '';
  RAISE NOTICE 'Usage:';
  RAISE NOTICE '  SELECT ensure_artist_profile(auth.uid());';
  RAISE NOTICE '';
  RAISE NOTICE 'This will automatically create an artist profile';
  RAISE NOTICE 'for any user who doesn''t have one yet.';
  RAISE NOTICE '=================================================';
END $$; 