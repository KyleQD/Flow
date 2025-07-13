-- =============================================================================
-- OPTIMIZE PROFILES STRUCTURE MIGRATION
-- This migration fixes and optimizes the profiles table for better performance
-- and resolves all the structural inconsistencies
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- STEP 1: Ensure profiles table has optimal structure
-- =============================================================================

-- Add all missing columns to profiles table with proper data types for performance
DO $$ 
BEGIN
  -- Core profile information (direct columns for better performance)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'custom_url') THEN
    ALTER TABLE profiles ADD COLUMN custom_url TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON profiles(custom_url);
  END IF;
  
  -- Contact information (direct columns)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
  
  -- Social links (direct columns for better performance)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instagram') THEN
    ALTER TABLE profiles ADD COLUMN instagram TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter') THEN
    ALTER TABLE profiles ADD COLUMN twitter TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'spotify') THEN
    ALTER TABLE profiles ADD COLUMN spotify TEXT;
  END IF;
  
  -- Account status and verification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_type') THEN
    ALTER TABLE profiles ADD COLUMN profile_type TEXT DEFAULT 'general' CHECK (profile_type IN ('general', 'artist', 'venue', 'admin'));
  END IF;
  
  -- Privacy settings (direct columns for better query performance)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_email') THEN
    ALTER TABLE profiles ADD COLUMN show_email BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_phone') THEN
    ALTER TABLE profiles ADD COLUMN show_phone BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_location') THEN
    ALTER TABLE profiles ADD COLUMN show_location BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Statistics (direct columns for better performance)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'posts_count') THEN
    ALTER TABLE profiles ADD COLUMN posts_count INTEGER DEFAULT 0;
  END IF;
  
  -- Onboarding and completion tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Timestamps
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Keep metadata for backwards compatibility and complex data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'metadata') THEN
    ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
  
  -- Settings for complex configurations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'settings') THEN
    ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{
      "privacy": {"profile_public": true, "allow_messages": true},
      "notifications": {"email": true, "push": true, "sms": false},
      "preferences": {"theme": "system", "language": "en"}
    }';
  END IF;
  
  RAISE NOTICE 'Profiles table structure updated successfully';
END $$;

-- =============================================================================
-- STEP 2: Create performance indexes
-- =============================================================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- Social media indexes for searching
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_twitter ON profiles(twitter) WHERE twitter IS NOT NULL;

-- Full-text search index for names and bios
CREATE INDEX IF NOT EXISTS idx_profiles_search_text ON profiles 
USING gin(to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(username, '') || ' ' || COALESCE(bio, '')));

-- JSONB indexes for metadata and settings
CREATE INDEX IF NOT EXISTS idx_profiles_metadata ON profiles USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_profiles_settings ON profiles USING gin(settings);

-- =============================================================================
-- STEP 3: Create triggers for automatic updates
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 4: Data migration and cleanup
-- =============================================================================

-- Migrate data from metadata to direct columns if needed
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN SELECT id, metadata FROM profiles WHERE metadata IS NOT NULL AND metadata != '{}'
    LOOP
        UPDATE profiles SET
            full_name = COALESCE(full_name, profile_record.metadata->>'full_name'),
            username = COALESCE(username, profile_record.metadata->>'username'),
            bio = COALESCE(bio, profile_record.metadata->>'bio'),
            location = COALESCE(location, profile_record.metadata->>'location'),
            website = COALESCE(website, profile_record.metadata->>'website'),
            phone = COALESCE(phone, profile_record.metadata->>'phone'),
            instagram = COALESCE(instagram, profile_record.metadata->>'instagram'),
            twitter = COALESCE(twitter, profile_record.metadata->>'twitter'),
            show_email = COALESCE(show_email, (profile_record.metadata->>'show_email')::boolean),
            show_phone = COALESCE(show_phone, (profile_record.metadata->>'show_phone')::boolean),
            show_location = COALESCE(show_location, (profile_record.metadata->>'show_location')::boolean)
        WHERE id = profile_record.id;
    END LOOP;
    
    RAISE NOTICE 'Data migration from metadata to direct columns completed';
END $$;

-- =============================================================================
-- STEP 5: Create helper functions for better performance
-- =============================================================================

-- Function to get profile with all related data efficiently
CREATE OR REPLACE FUNCTION get_profile_complete(profile_id UUID)
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    custom_url TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    website TEXT,
    instagram TEXT,
    twitter TEXT,
    spotify TEXT,
    is_verified BOOLEAN,
    followers_count INTEGER,
    following_count INTEGER,
    posts_count INTEGER,
    show_email BOOLEAN,
    show_phone BOOLEAN,
    show_location BOOLEAN,
    profile_type TEXT,
    settings JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.full_name,
        p.bio,
        p.avatar_url,
        p.custom_url,
        p.email,
        p.phone,
        p.location,
        p.website,
        p.instagram,
        p.twitter,
        p.spotify,
        p.is_verified,
        p.followers_count,
        p.following_count,
        p.posts_count,
        p.show_email,
        p.show_phone,
        p.show_location,
        p.profile_type,
        p.settings,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = profile_id;
END;
$$;

-- Function to update profile efficiently
CREATE OR REPLACE FUNCTION update_profile_optimized(
    profile_id UUID,
    profile_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_profile JSONB;
BEGIN
    -- Update profile with direct column updates for better performance
    UPDATE profiles SET
        full_name = COALESCE(profile_data->>'full_name', full_name),
        username = COALESCE(profile_data->>'username', username),
        bio = COALESCE(profile_data->>'bio', bio),
        location = COALESCE(profile_data->>'location', location),
        website = COALESCE(profile_data->>'website', website),
        phone = COALESCE(profile_data->>'phone', phone),
        instagram = COALESCE(profile_data->>'instagram', instagram),
        twitter = COALESCE(profile_data->>'twitter', twitter),
        show_email = COALESCE((profile_data->>'show_email')::boolean, show_email),
        show_phone = COALESCE((profile_data->>'show_phone')::boolean, show_phone),
        show_location = COALESCE((profile_data->>'show_location')::boolean, show_location),
        updated_at = NOW()
    WHERE id = profile_id;
    
    -- Return updated profile
    SELECT row_to_json(p) INTO result_profile
    FROM (
        SELECT * FROM get_profile_complete(profile_id)
    ) p;
    
    RETURN result_profile;
END;
$$;

-- =============================================================================
-- STEP 6: Update RLS policies for optimized structure
-- =============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Recreate policies with better performance
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT 
    USING (true); -- Public read access for better performance

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE 
    USING (auth.uid() = id);

-- =============================================================================
-- STEP 7: Create views for common queries
-- =============================================================================

-- Create view for public profile data
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    id,
    username,
    full_name,
    bio,
    avatar_url,
    custom_url,
    CASE WHEN show_location THEN location ELSE NULL END as location,
    website,
    instagram,
    twitter,
    spotify,
    is_verified,
    followers_count,
    following_count,
    posts_count,
    profile_type,
    created_at
FROM profiles
WHERE username IS NOT NULL;

-- Create view for search functionality
CREATE OR REPLACE VIEW searchable_profiles AS
SELECT 
    id,
    username,
    full_name,
    bio,
    avatar_url,
    location,
    profile_type,
    is_verified,
    followers_count,
    to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(username, '') || ' ' || COALESCE(bio, '')) as search_vector
FROM profiles
WHERE username IS NOT NULL AND profile_type IS NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'Optimized profiles table with direct columns for better performance. Metadata JSONB column kept for backwards compatibility.';

RAISE NOTICE '✅ Profiles table optimization completed successfully!'; 