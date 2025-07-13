-- Populate Accounts Table with Existing Profiles
-- This migration creates account records for existing profiles

-- Function to populate accounts from existing profiles
CREATE OR REPLACE FUNCTION populate_existing_accounts()
RETURNS TEXT AS $$
DECLARE
  artist_count INTEGER := 0;
  venue_count INTEGER := 0;
  business_count INTEGER := 0;
  profile_count INTEGER := 0;
  result_text TEXT;
BEGIN
  -- Populate artist accounts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_profiles') THEN
    INSERT INTO accounts (owner_user_id, account_type, profile_table, profile_id, display_name, username, avatar_url, is_verified)
    SELECT 
      user_id,
      'artist',
      'artist_profiles',
      id,
      COALESCE(stage_name, artist_name, 'Artist'),
      LOWER(REGEXP_REPLACE(COALESCE(stage_name, artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
      profile_image_url,
      COALESCE(is_verified, false)
    FROM artist_profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM accounts 
      WHERE profile_table = 'artist_profiles' 
      AND profile_id = artist_profiles.id
    );
    
    GET DIAGNOSTICS artist_count = ROW_COUNT;
  END IF;

  -- Populate venue accounts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_profiles') THEN
    INSERT INTO accounts (owner_user_id, account_type, profile_table, profile_id, display_name, username, avatar_url, is_verified)
    SELECT 
      user_id,
      'venue',
      'venue_profiles',
      id,
      COALESCE(name, 'Venue'),
      LOWER(REGEXP_REPLACE(COALESCE(name, 'venue'), '[^a-zA-Z0-9]', '', 'g')),
      logo_url,
      COALESCE(is_verified, false)
    FROM venue_profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM accounts 
      WHERE profile_table = 'venue_profiles' 
      AND profile_id = venue_profiles.id
    );
    
    GET DIAGNOSTICS venue_count = ROW_COUNT;
  END IF;

  -- Populate business accounts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
    INSERT INTO accounts (owner_user_id, account_type, profile_table, profile_id, display_name, username, avatar_url, is_verified)
    SELECT 
      user_id,
      'business',
      'business_profiles',
      id,
      COALESCE(name, 'Business'),
      LOWER(REGEXP_REPLACE(COALESCE(name, 'business'), '[^a-zA-Z0-9]', '', 'g')),
      logo_url,
      COALESCE(is_verified, false)
    FROM business_profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM accounts 
      WHERE profile_table = 'business_profiles' 
      AND profile_id = business_profiles.id
    );
    
    GET DIAGNOSTICS business_count = ROW_COUNT;
  END IF;

  -- Populate primary accounts from profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    INSERT INTO accounts (owner_user_id, account_type, profile_table, profile_id, display_name, username, avatar_url, is_verified)
    SELECT 
      id,
      'primary',
      'profiles',
      id,
      COALESCE(full_name, 'User'),
      COALESCE(username, LOWER(REGEXP_REPLACE(COALESCE(full_name, 'user'), '[^a-zA-Z0-9]', '', 'g'))),
      avatar_url,
      COALESCE(is_verified, false)
    FROM profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM accounts 
      WHERE profile_table = 'profiles' 
      AND profile_id = profiles.id
    );
    
    GET DIAGNOSTICS profile_count = ROW_COUNT;
  END IF;

  -- Return summary
  result_text := FORMAT('✅ Populated accounts: %s artists, %s venues, %s businesses, %s primary accounts', 
                       artist_count, venue_count, business_count, profile_count);
  
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- Run the population function
SELECT populate_existing_accounts();

-- Drop the helper function (no longer needed)
DROP FUNCTION populate_existing_accounts();

-- Update existing posts to use account_id where possible
DO $$
DECLARE
  updated_posts INTEGER := 0;
BEGIN
  -- Update posts that have legacy account context fields
  UPDATE posts 
  SET account_id = accounts.id
  FROM accounts
  WHERE posts.posted_as_profile_id = accounts.profile_id
  AND posts.posted_as_account_type = accounts.account_type
  AND posts.account_id IS NULL;
  
  GET DIAGNOSTICS updated_posts = ROW_COUNT;
  
  RAISE NOTICE '✅ Updated % existing posts with account_id', updated_posts;
END $$;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Existing profiles successfully migrated to unified account system!';
  RAISE NOTICE 'ℹ️  All existing artist, venue, business, and primary profiles now have account records';
  RAISE NOTICE 'ℹ️  Existing posts have been linked to their account records where possible';
  RAISE NOTICE 'ℹ️  New posts will automatically use the unified system';
END $$; 