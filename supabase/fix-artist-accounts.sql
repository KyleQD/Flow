-- Fix Artist Account Display Issues
-- This script ensures existing artist profiles are properly connected to the multi-account system

-- Create account relationships for existing artist profiles that don't have them
INSERT INTO account_relationships (
  owner_user_id,
  owned_profile_id, 
  account_type,
  permissions,
  is_active,
  created_at
)
SELECT 
  ap.user_id,
  ap.user_id, -- Artist profiles use user_id as profile_id
  'artist',
  '{}'::jsonb,
  true,
  NOW()
FROM artist_profiles ap
LEFT JOIN account_relationships ar ON (
  ar.owner_user_id = ap.user_id 
  AND ar.account_type = 'artist'
)
WHERE ar.id IS NULL; -- Only insert if relationship doesn't exist

-- Update any existing artist account relationships to be active
UPDATE account_relationships 
SET is_active = true
WHERE account_type = 'artist' 
AND is_active = false;

-- Function to automatically create artist account relationship when artist profile is created
CREATE OR REPLACE FUNCTION create_artist_account_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- Create account relationship for the new artist profile
  INSERT INTO account_relationships (
    owner_user_id,
    owned_profile_id,
    account_type,
    permissions,
    is_active
  ) VALUES (
    NEW.user_id,
    NEW.user_id,
    'artist',
    '{}'::jsonb,
    true
  )
  ON CONFLICT (owner_user_id, owned_profile_id, account_type) 
  DO UPDATE SET is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create account relationships for new artist profiles
DROP TRIGGER IF EXISTS artist_profile_account_relationship_trigger ON artist_profiles;
CREATE TRIGGER artist_profile_account_relationship_trigger
  AFTER INSERT ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_artist_account_relationship();

-- Function to get user accounts with proper artist profile data
CREATE OR REPLACE FUNCTION get_user_accounts_with_artist_data(target_user_id UUID)
RETURNS TABLE (
  account_type TEXT,
  profile_id UUID,
  profile_data JSONB,
  permissions JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.account_type,
    ar.owned_profile_id as profile_id,
    CASE 
      WHEN ar.account_type = 'artist' THEN
        jsonb_build_object(
          'artist_name', ap.artist_name,
          'bio', ap.bio,
          'genres', ap.genres,
          'verification_status', ap.verification_status
        )
      WHEN ar.account_type = 'venue' THEN
        jsonb_build_object(
          'venue_name', vp.venue_name,
          'description', vp.description,
          'venue_type', vp.venue_type
        )
      ELSE
        jsonb_build_object(
          'full_name', p.full_name,
          'bio', p.bio
        )
    END as profile_data,
    ar.permissions,
    ar.is_active
  FROM account_relationships ar
  LEFT JOIN artist_profiles ap ON (ar.account_type = 'artist' AND ap.user_id = ar.owned_profile_id)
  LEFT JOIN venue_profiles vp ON (ar.account_type = 'venue' AND vp.user_id = ar.owned_profile_id)
  LEFT JOIN profiles p ON (ar.account_type = 'general' AND p.id = ar.owned_profile_id)
  WHERE ar.owner_user_id = target_user_id
    AND ar.is_active = true
  
  UNION ALL
  
  -- Also include general account even if no explicit relationship exists
  SELECT 
    'general' as account_type,
    p.id as profile_id,
    jsonb_build_object(
      'full_name', p.full_name,
      'bio', p.bio
    ) as profile_data,
    '{}'::jsonb as permissions,
    true as is_active
  FROM profiles p
  WHERE p.id = target_user_id
    AND NOT EXISTS (
      SELECT 1 FROM account_relationships 
      WHERE owner_user_id = target_user_id 
      AND account_type = 'general'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION create_artist_account_relationship() IS 'Automatically creates account relationship when artist profile is created';
COMMENT ON FUNCTION get_user_accounts_with_artist_data(UUID) IS 'Returns user accounts with properly formatted profile data including artist names'; 