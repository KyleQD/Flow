-- Comprehensive Multi-Account System Fix
-- This migration consolidates and fixes all multi-account functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- STEP 1: Fix profiles table structure
-- =============================================================================

-- Ensure profiles table has all required columns
DO $$ 
BEGIN
  -- Basic profile columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE profiles ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
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
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;
  
  -- Account type and admin columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_type') THEN
    ALTER TABLE profiles ADD COLUMN profile_type TEXT DEFAULT 'general' CHECK (profile_type IN ('general', 'artist', 'venue', 'admin'));
  END IF;
  
  -- Multi-account settings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'account_settings') THEN
    ALTER TABLE profiles ADD COLUMN account_settings JSONB DEFAULT '{
      "privacy": {"profile_public": true, "show_activity": true, "allow_messages": true},
      "notifications": {"email": true, "push": true, "sms": false},
      "posting_permissions": {"as_artist": false, "as_venue": false, "as_admin": false}
    }'::jsonb;
  END IF;
  
  -- Onboarding
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Timestamps
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Create artist_profiles table
-- =============================================================================

CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  bio TEXT,
  genres TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{
    "website": null,
    "instagram": null,
    "twitter": null,
    "facebook": null,
    "spotify": null,
    "apple_music": null,
    "youtube": null,
    "soundcloud": null
  }'::jsonb,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  account_tier TEXT DEFAULT 'basic' CHECK (account_tier IN ('basic', 'pro', 'premium')),
  settings JSONB DEFAULT '{
    "public_profile": true,
    "allow_bookings": true,
    "show_contact_info": false,
    "auto_accept_follows": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, artist_name)
);

-- =============================================================================
-- STEP 3: Create venue_profiles table
-- =============================================================================

CREATE TABLE IF NOT EXISTS venue_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  venue_name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  capacity INTEGER,
  venue_types TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{
    "phone": null,
    "email": null,
    "booking_email": null,
    "manager_name": null
  }'::jsonb,
  social_links JSONB DEFAULT '{
    "website": null,
    "instagram": null,
    "facebook": null,
    "twitter": null
  }'::jsonb,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  account_tier TEXT DEFAULT 'basic' CHECK (account_tier IN ('basic', 'pro', 'premium')),
  settings JSONB DEFAULT '{
    "public_profile": true,
    "allow_bookings": true,
    "show_contact_info": false,
    "require_approval": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, venue_name)
);

-- =============================================================================
-- STEP 4: Create organizer_profiles table (simplified)
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT DEFAULT 'event_management',
  description TEXT,
  contact_info JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  admin_level TEXT DEFAULT 'super' CHECK (admin_level IN ('super', 'moderator', 'support')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, organization_name)
);

-- =============================================================================
-- STEP 5: Create simplified account switching system
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_active_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  active_profile_type TEXT DEFAULT 'general' CHECK (active_profile_type IN ('general', 'artist', 'venue', 'organizer')),
  active_profile_id UUID, -- This can reference artist_profiles.id, venue_profiles.id, etc.
  last_switched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- =============================================================================
-- STEP 6: Create RLS policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies - allow public read, user can manage own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Artist profiles policies
DROP POLICY IF EXISTS "Artist profiles are viewable by everyone" ON artist_profiles;
DROP POLICY IF EXISTS "Users can manage their own artist profiles" ON artist_profiles;

CREATE POLICY "Artist profiles are viewable by everyone" ON artist_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own artist profiles" ON artist_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- Venue profiles policies
DROP POLICY IF EXISTS "Venue profiles are viewable by everyone" ON venue_profiles;
DROP POLICY IF EXISTS "Users can manage their own venue profiles" ON venue_profiles;

CREATE POLICY "Venue profiles are viewable by everyone" ON venue_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own venue profiles" ON venue_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- Organizer profiles policies
DROP POLICY IF EXISTS "Organizer profiles are viewable by everyone" ON organizer_profiles;
DROP POLICY IF EXISTS "Users can manage their own organizer profiles" ON organizer_profiles;

CREATE POLICY "Organizer profiles are viewable by everyone" ON organizer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage their own organizer profiles" ON organizer_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- User active profiles policies
DROP POLICY IF EXISTS "Users can manage their own active profile" ON user_active_profiles;

CREATE POLICY "Users can manage their own active profile" ON user_active_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 7: Create helper functions
-- =============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, username, full_name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE((NEW.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  );
  
  -- Create default active profile entry
  INSERT INTO user_active_profiles (user_id, active_profile_type)
  VALUES (NEW.id, 'general');
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return NEW
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error and continue
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create artist account
CREATE OR REPLACE FUNCTION create_artist_account(
  user_id UUID,
  artist_name TEXT,
  bio TEXT DEFAULT NULL,
  genres TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  artist_profile_id UUID;
BEGIN
  -- Create artist profile
  INSERT INTO artist_profiles (user_id, artist_name, bio, genres, social_links)
  VALUES (user_id, artist_name, bio, genres, social_links)
  RETURNING id INTO artist_profile_id;

  -- Update profile to mark onboarding as completed
  UPDATE profiles SET onboarding_completed = true WHERE id = user_id;

  RETURN artist_profile_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'An artist with the name "%" already exists for this user', artist_name;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create artist account: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create venue account
CREATE OR REPLACE FUNCTION create_venue_account(
  user_id UUID,
  venue_name TEXT,
  description TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  capacity INTEGER DEFAULT NULL,
  venue_types TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  venue_profile_id UUID;
BEGIN
  -- Create venue profile
  INSERT INTO venue_profiles (user_id, venue_name, description, address, capacity, venue_types, contact_info, social_links)
  VALUES (user_id, venue_name, description, address, capacity, venue_types, contact_info, social_links)
  RETURNING id INTO venue_profile_id;

  -- Update profile to mark onboarding as completed
  UPDATE profiles SET onboarding_completed = true WHERE id = user_id;

  RETURN venue_profile_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'A venue with the name "%" already exists for this user', venue_name;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create venue account: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create organizer account
CREATE OR REPLACE FUNCTION create_organizer_account(
  user_id UUID,
  organization_name TEXT,
  organization_type TEXT DEFAULT 'event_management',
  description TEXT DEFAULT NULL,
  contact_info JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  specialties TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  organizer_profile_id UUID;
BEGIN
  -- Create organizer profile
  INSERT INTO organizer_profiles (user_id, organization_name, organization_type, description, contact_info, social_links, specialties)
  VALUES (user_id, organization_name, organization_type, description, contact_info, social_links, specialties)
  RETURNING id INTO organizer_profile_id;

  -- Update main profile to have admin privileges
  UPDATE profiles SET 
    role = 'admin',
    is_admin = true,
    profile_type = 'admin',
    account_settings = jsonb_set(
      account_settings,
      '{posting_permissions}',
      '{"as_artist": true, "as_venue": true, "as_admin": true}'::jsonb
    ),
    onboarding_completed = true
  WHERE id = user_id;

  RETURN organizer_profile_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'An organization with the name "%" already exists for this user', organization_name;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create organizer account: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch active profile
CREATE OR REPLACE FUNCTION switch_active_profile(
  user_id UUID,
  profile_type TEXT,
  profile_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify user owns the profile they're trying to switch to
  IF profile_type = 'artist' THEN
    IF NOT EXISTS (SELECT 1 FROM artist_profiles WHERE id = profile_id AND user_id = user_id) THEN
      RAISE EXCEPTION 'Artist profile not found or not owned by user';
    END IF;
  ELSIF profile_type = 'venue' THEN
    IF NOT EXISTS (SELECT 1 FROM venue_profiles WHERE id = profile_id AND user_id = user_id) THEN
      RAISE EXCEPTION 'Venue profile not found or not owned by user';
    END IF;
  ELSIF profile_type = 'organizer' THEN
    IF NOT EXISTS (SELECT 1 FROM organizer_profiles WHERE id = profile_id AND user_id = user_id) THEN
      RAISE EXCEPTION 'Organizer profile not found or not owned by user';
    END IF;
  ELSIF profile_type = 'general' THEN
    -- For general profile, profile_id should be the user_id
    profile_id := user_id;
  ELSE
    RAISE EXCEPTION 'Invalid profile type: %', profile_type;
  END IF;

  -- Update active profile
  INSERT INTO user_active_profiles (user_id, active_profile_type, active_profile_id, last_switched)
  VALUES (user_id, profile_type, profile_id, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    active_profile_type = EXCLUDED.active_profile_type,
    active_profile_id = EXCLUDED.active_profile_id,
    last_switched = EXCLUDED.last_switched,
    updated_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's accounts
CREATE OR REPLACE FUNCTION get_user_accounts(p_user_id UUID)
RETURNS TABLE (
  account_type TEXT,
  profile_id UUID,
  profile_name TEXT,
  profile_data JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  -- General profile
  SELECT 
    'general'::TEXT,
    p.id,
    COALESCE(p.full_name, p.name, p.username)::TEXT,
    to_jsonb(p),
    (uap.active_profile_type = 'general')::BOOLEAN
  FROM profiles p
  LEFT JOIN user_active_profiles uap ON uap.user_id = p.id
  WHERE p.id = p_user_id

  UNION ALL

  -- Artist profiles
  SELECT 
    'artist'::TEXT,
    ap.id,
    ap.artist_name,
    to_jsonb(ap),
    (uap.active_profile_type = 'artist' AND uap.active_profile_id = ap.id)::BOOLEAN
  FROM artist_profiles ap
  LEFT JOIN user_active_profiles uap ON uap.user_id = ap.user_id
  WHERE ap.user_id = p_user_id

  UNION ALL

  -- Venue profiles
  SELECT 
    'venue'::TEXT,
    vp.id,
    vp.venue_name,
    to_jsonb(vp),
    (uap.active_profile_type = 'venue' AND uap.active_profile_id = vp.id)::BOOLEAN
  FROM venue_profiles vp
  LEFT JOIN user_active_profiles uap ON uap.user_id = vp.user_id
  WHERE vp.user_id = p_user_id

  UNION ALL

  -- Organizer profiles
  SELECT 
    'organizer'::TEXT,
    op.id,
    op.organization_name,
    to_jsonb(op),
    (uap.active_profile_type = 'organizer' AND uap.active_profile_id = op.id)::BOOLEAN
  FROM organizer_profiles op
  LEFT JOIN user_active_profiles uap ON uap.user_id = op.user_id
  WHERE op.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 8: Create performance indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_name ON artist_profiles(artist_name);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_user_id ON venue_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_name ON venue_profiles(venue_name);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user_id ON organizer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_name ON organizer_profiles(organization_name);
CREATE INDEX IF NOT EXISTS idx_user_active_profiles_user_id ON user_active_profiles(user_id);

-- =============================================================================
-- STEP 9: Update trigger function for timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
DROP TRIGGER IF EXISTS update_venue_profiles_updated_at ON venue_profiles;
DROP TRIGGER IF EXISTS update_organizer_profiles_updated_at ON organizer_profiles;
DROP TRIGGER IF EXISTS update_user_active_profiles_updated_at ON user_active_profiles;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venue_profiles_updated_at BEFORE UPDATE ON venue_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizer_profiles_updated_at BEFORE UPDATE ON organizer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_active_profiles_updated_at BEFORE UPDATE ON user_active_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMPLETED: Multi-Account System Fix
-- =============================================================================

-- Comment with usage instructions
COMMENT ON FUNCTION create_artist_account IS 'Creates an artist profile for a user. Usage: SELECT create_artist_account(user_id, artist_name, bio, genres, social_links)';
COMMENT ON FUNCTION create_venue_account IS 'Creates a venue profile for a user. Usage: SELECT create_venue_account(user_id, venue_name, description, address, capacity, venue_types, contact_info, social_links)';
COMMENT ON FUNCTION create_organizer_account IS 'Creates an organizer profile for a user with admin privileges. Usage: SELECT create_organizer_account(user_id, organization_name, organization_type, description, contact_info, social_links, specialties)';
COMMENT ON FUNCTION switch_active_profile IS 'Switches the active profile for a user. Usage: SELECT switch_active_profile(user_id, profile_type, profile_id)';
COMMENT ON FUNCTION get_user_accounts IS 'Gets all accounts for a user. Usage: SELECT * FROM get_user_accounts(user_id)'; 