-- Fix Stage Name Error in refresh_account_display_info Function
-- This script fixes the function that's causing the stage_name column error

-- Drop the problematic function first
DROP FUNCTION IF EXISTS refresh_account_display_info(UUID);

-- Recreate the function with correct column names
CREATE OR REPLACE FUNCTION refresh_account_display_info(account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  account_record RECORD;
  new_display_name TEXT;
  new_username TEXT;
  new_avatar_url TEXT;
  new_is_verified BOOLEAN;
BEGIN
  -- Get account record
  SELECT * INTO account_record FROM accounts WHERE id = account_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Refresh from source table based on account type
  CASE account_record.profile_table
    WHEN 'artist_profiles' THEN
      SELECT 
        COALESCE(artist_name, 'Artist'), -- FIXED: use artist_name instead of stage_name
        LOWER(REGEXP_REPLACE(COALESCE(artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
        profile_image_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM artist_profiles 
      WHERE id = account_record.profile_id;
      
    WHEN 'venue_profiles' THEN
      SELECT 
        COALESCE(name, 'Venue'),
        LOWER(REGEXP_REPLACE(COALESCE(name, 'venue'), '[^a-zA-Z0-9]', '', 'g')),
        logo_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM venue_profiles 
      WHERE id = account_record.profile_id;
      
    WHEN 'business_profiles' THEN
      SELECT 
        COALESCE(name, 'Business'),
        LOWER(REGEXP_REPLACE(COALESCE(name, 'business'), '[^a-zA-Z0-9]', '', 'g')),
        logo_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM business_profiles 
      WHERE id = account_record.profile_id;
      
    WHEN 'profiles' THEN
      SELECT 
        COALESCE(full_name, 'User'),
        COALESCE(username, LOWER(REGEXP_REPLACE(COALESCE(full_name, 'user'), '[^a-zA-Z0-9]', '', 'g'))),
        avatar_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM profiles 
      WHERE id = account_record.profile_id;
      
    ELSE
      -- Unknown profile table, keep existing values
      RETURN FALSE;
  END CASE;
  
  -- Update account with refreshed info
  UPDATE accounts SET
    display_name = COALESCE(new_display_name, display_name),
    username = COALESCE(new_username, username),
    avatar_url = new_avatar_url,
    is_verified = COALESCE(new_is_verified, is_verified),
    updated_at = NOW()
  WHERE id = account_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed refresh_account_display_info function - now uses artist_name instead of stage_name';
END $$; 