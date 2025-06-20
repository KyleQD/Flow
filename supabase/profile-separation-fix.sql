-- Profile Separation and Data Integrity
-- Ensures artist profiles only show artist data, venue profiles only show venue data, etc.

-- Function to get profile data based on account type
CREATE OR REPLACE FUNCTION get_profile_data(
  p_user_id UUID,
  p_account_type TEXT DEFAULT 'general'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  user_record RECORD;
BEGIN
  -- Get base user info
  SELECT id, email, created_at 
  INTO user_record
  FROM auth.users 
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN '{"error": "User not found"}';
  END IF;
  
  -- Add base user data
  result := jsonb_build_object(
    'user_id', user_record.id,
    'email', user_record.email,
    'account_type', p_account_type
  );
  
  -- Get profile data based on account type
  CASE p_account_type
    WHEN 'artist' THEN
      -- Artist-specific data only
      SELECT jsonb_build_object(
        'artist_name', ap.artist_name,
        'bio', ap.bio,
        'genres', ap.genres,
        'social_links', ap.social_links,
        'verification_status', ap.verification_status,
        'account_tier', ap.account_tier,
        'settings', ap.settings,
        'created_at', ap.created_at,
        'updated_at', ap.updated_at
      ) INTO result
      FROM artist_profiles ap
      WHERE ap.user_id = p_user_id;
      
    WHEN 'venue' THEN
      -- Venue-specific data only
      SELECT jsonb_build_object(
        'venue_name', vp.venue_name,
        'description', vp.description,
        'venue_type', vp.venue_type,
        'capacity', vp.capacity,
        'address', vp.address,
        'contact_info', vp.contact_info,
        'amenities', vp.amenities,
        'settings', vp.settings,
        'created_at', vp.created_at,
        'updated_at', vp.updated_at
      ) INTO result
      FROM venue_profiles vp
      WHERE vp.user_id = p_user_id;
      
    ELSE
      -- General profile data
      SELECT jsonb_build_object(
        'full_name', gp.full_name,
        'bio', gp.bio,
        'location', gp.location,
        'settings', gp.settings,
        'created_at', gp.created_at,
        'updated_at', gp.updated_at
      ) INTO result
      FROM profiles gp
      WHERE gp.id = p_user_id;
  END CASE;
  
  -- If no profile data found, return user data with empty profile
  IF result IS NULL THEN
    result := jsonb_build_object(
      'user_id', user_record.id,
      'email', user_record.email,
      'account_type', p_account_type,
      'profile_exists', false
    );
  ELSE
    result := result || jsonb_build_object('profile_exists', true);
  END IF;
  
  RETURN result;
END;
$$;

-- Function to update profile ensuring data separation
CREATE OR REPLACE FUNCTION update_profile_data(
  p_user_id UUID,
  p_account_type TEXT,
  p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  updated_count INTEGER := 0;
BEGIN
  -- Ensure user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Update based on account type with proper field validation
  CASE p_account_type
    WHEN 'artist' THEN
      -- Only allow artist-specific fields
      UPDATE artist_profiles SET
        artist_name = COALESCE(p_data->>'artist_name', artist_name),
        bio = COALESCE(p_data->>'bio', bio),
        genres = CASE 
          WHEN p_data ? 'genres' THEN (p_data->>'genres')::text[]
          ELSE genres 
        END,
        social_links = CASE
          WHEN p_data ? 'social_links' THEN (p_data->'social_links')::jsonb
          ELSE social_links
        END,
        settings = CASE
          WHEN p_data ? 'settings' THEN (p_data->'settings')::jsonb
          ELSE settings
        END,
        updated_at = now()
      WHERE user_id = p_user_id;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    WHEN 'venue' THEN
      -- Only allow venue-specific fields
      UPDATE venue_profiles SET
        venue_name = COALESCE(p_data->>'venue_name', venue_name),
        description = COALESCE(p_data->>'description', description),
        venue_type = COALESCE(p_data->>'venue_type', venue_type),
        capacity = CASE 
          WHEN p_data ? 'capacity' THEN (p_data->>'capacity')::integer
          ELSE capacity 
        END,
        address = CASE
          WHEN p_data ? 'address' THEN (p_data->'address')::jsonb
          ELSE address
        END,
        contact_info = CASE
          WHEN p_data ? 'contact_info' THEN (p_data->'contact_info')::jsonb
          ELSE contact_info
        END,
        amenities = CASE 
          WHEN p_data ? 'amenities' THEN (p_data->>'amenities')::text[]
          ELSE amenities 
        END,
        settings = CASE
          WHEN p_data ? 'settings' THEN (p_data->'settings')::jsonb
          ELSE settings
        END,
        updated_at = now()
      WHERE user_id = p_user_id;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSE
      -- General profile fields only
      UPDATE profiles SET
        full_name = COALESCE(p_data->>'full_name', full_name),
        bio = COALESCE(p_data->>'bio', bio),
        location = COALESCE(p_data->>'location', location),
        settings = CASE
          WHEN p_data ? 'settings' THEN (p_data->'settings')::jsonb
          ELSE settings
        END,
        updated_at = now()
      WHERE id = p_user_id;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
  END CASE;
  
  -- Return success status
  IF updated_count > 0 THEN
    result := jsonb_build_object(
      'success', true, 
      'message', 'Profile updated successfully',
      'updated_count', updated_count
    );
  ELSE
    result := jsonb_build_object(
      'success', false, 
      'error', 'No matching profile found or no changes made'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Function to ensure profile exists for account type
CREATE OR REPLACE FUNCTION ensure_profile_exists(
  p_user_id UUID,
  p_account_type TEXT,
  p_initial_data JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  profile_exists BOOLEAN := false;
BEGIN
  -- Check if profile exists based on account type
  CASE p_account_type
    WHEN 'artist' THEN
      SELECT EXISTS(SELECT 1 FROM artist_profiles WHERE user_id = p_user_id) INTO profile_exists;
      
      IF NOT profile_exists THEN
        INSERT INTO artist_profiles (
          user_id, 
          artist_name, 
          bio, 
          genres,
          social_links,
          verification_status,
          account_tier
        ) VALUES (
          p_user_id,
          COALESCE(p_initial_data->>'artist_name', 'Artist'),
          p_initial_data->>'bio',
          CASE 
            WHEN p_initial_data ? 'genres' THEN (p_initial_data->>'genres')::text[]
            ELSE NULL 
          END,
          CASE
            WHEN p_initial_data ? 'social_links' THEN (p_initial_data->'social_links')::jsonb
            ELSE '{}'::jsonb
          END,
          'unverified',
          'free'
        );
      END IF;
      
    WHEN 'venue' THEN
      SELECT EXISTS(SELECT 1 FROM venue_profiles WHERE user_id = p_user_id) INTO profile_exists;
      
      IF NOT profile_exists THEN
        INSERT INTO venue_profiles (
          user_id,
          venue_name,
          description,
          venue_type
        ) VALUES (
          p_user_id,
          COALESCE(p_initial_data->>'venue_name', 'Venue'),
          p_initial_data->>'description',
          COALESCE(p_initial_data->>'venue_type', 'general')
        );
      END IF;
      
    ELSE
      SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO profile_exists;
      
      IF NOT profile_exists THEN
        INSERT INTO profiles (
          id,
          full_name,
          bio,
          location
        ) VALUES (
          p_user_id,
          p_initial_data->>'full_name',
          p_initial_data->>'bio',
          p_initial_data->>'location'
        );
      END IF;
  END CASE;
  
  result := jsonb_build_object(
    'success', true,
    'profile_existed', profile_exists,
    'account_type', p_account_type
  );
  
  RETURN result;
END;
$$;

-- Add RLS policies to ensure users can only access their own profile data
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Artist profile policies
DROP POLICY IF EXISTS "Users can view own artist profile" ON artist_profiles;
CREATE POLICY "Users can view own artist profile" ON artist_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own artist profile" ON artist_profiles;
CREATE POLICY "Users can update own artist profile" ON artist_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own artist profile" ON artist_profiles;
CREATE POLICY "Users can insert own artist profile" ON artist_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON FUNCTION get_profile_data(UUID, TEXT) IS 'Gets profile data specific to the account type, ensuring data separation';
COMMENT ON FUNCTION update_profile_data(UUID, TEXT, JSONB) IS 'Updates profile data with validation to ensure only appropriate fields are modified for each account type';
COMMENT ON FUNCTION ensure_profile_exists(UUID, TEXT, JSONB) IS 'Creates a profile if it does not exist for the specified account type'; 