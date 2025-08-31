-- =====================================================
-- FIX SEARCH AND ACCOUNTS SYSTEM
-- =====================================================
-- This migration creates the necessary tables to make all accounts searchable
-- Apply this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Create Unified Accounts Table
-- =====================================================

-- Create a unified accounts table that can reference any profile type
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL, -- 'primary', 'artist', 'venue', 'business', etc.
  profile_table TEXT NOT NULL, -- which table stores the profile data
  profile_id UUID NOT NULL, -- ID in the profile table
  display_name TEXT NOT NULL, -- cached display name for performance
  username TEXT, -- cached username for performance
  avatar_url TEXT, -- cached avatar for performance
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}', -- flexible storage for account-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure unique combination of profile table and ID
  UNIQUE(profile_table, profile_id),
  -- Ensure unique display names per account type (optional)
  UNIQUE(owner_user_id, account_type, display_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_profile_lookup ON accounts(profile_table, profile_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active) WHERE is_active = TRUE;

-- =====================================================
-- STEP 2: Create Artist Profiles Table
-- =====================================================

CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  bio TEXT,
  genres TEXT[],
  social_links JSONB DEFAULT '{}',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for artist_profiles
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_artist_name ON artist_profiles(artist_name);

-- =====================================================
-- STEP 3: Create Venue Profiles Table
-- =====================================================

CREATE TABLE IF NOT EXISTS venue_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  venue_name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  capacity INTEGER,
  amenities TEXT[],
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for venue_profiles
CREATE INDEX IF NOT EXISTS idx_venue_profiles_user_id ON venue_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_venue_name ON venue_profiles(venue_name);

-- =====================================================
-- STEP 4: Create Organizer Accounts Table
-- =====================================================

CREATE TABLE IF NOT EXISTS organizer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  description TEXT,
  contact_info JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  specialties TEXT[],
  admin_level TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for organizer_accounts
CREATE INDEX IF NOT EXISTS idx_organizer_accounts_user_id ON organizer_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_accounts_organization_name ON organizer_accounts(organization_name);

-- =====================================================
-- STEP 5: Add Account Context to Posts Table
-- =====================================================

-- Add account_id to reference the accounts table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'account_id') THEN
    ALTER TABLE posts ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_posts_account_id ON posts(account_id);
    RAISE NOTICE '✅ Added account_id column to posts table';
  END IF;
END $$;

-- =====================================================
-- STEP 6: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts table
CREATE POLICY "Users can view all active accounts" ON accounts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own accounts" ON accounts
  FOR ALL USING (auth.uid() = owner_user_id);

-- Create RLS policies for artist_profiles table
CREATE POLICY "Users can view all artist profiles" ON artist_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own artist profiles" ON artist_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for venue_profiles table
CREATE POLICY "Users can view all venue profiles" ON venue_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own venue profiles" ON venue_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for organizer_accounts table
CREATE POLICY "Users can view all organizer accounts" ON organizer_accounts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own organizer accounts" ON organizer_accounts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- STEP 7: Create Helper Functions
-- =====================================================

-- Function to get account display information by account ID
CREATE OR REPLACE FUNCTION get_account_display_info(account_id UUID)
RETURNS JSONB AS $$
DECLARE
  account_record accounts%ROWTYPE;
  result JSONB;
BEGIN
  SELECT * INTO account_record FROM accounts WHERE id = account_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  result := jsonb_build_object(
    'id', account_record.id,
    'display_name', account_record.display_name,
    'username', account_record.username,
    'avatar_url', account_record.avatar_url,
    'is_verified', account_record.is_verified,
    'account_type', account_record.account_type,
    'metadata', account_record.metadata
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh account display information from source profile
CREATE OR REPLACE FUNCTION refresh_account_display_info(account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  account_record accounts%ROWTYPE;
  profile_data JSONB;
BEGIN
  SELECT * INTO account_record FROM accounts WHERE id = account_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get profile data based on profile_table
  IF account_record.profile_table = 'profiles' THEN
    SELECT jsonb_build_object(
      'display_name', name,
      'username', username,
      'avatar_url', avatar_url
    ) INTO profile_data
    FROM profiles WHERE id = account_record.profile_id;
  ELSIF account_record.profile_table = 'artist_profiles' THEN
    SELECT jsonb_build_object(
      'display_name', artist_name,
      'username', artist_name,
      'avatar_url', avatar_url
    ) INTO profile_data
    FROM artist_profiles WHERE id = account_record.profile_id;
  ELSIF account_record.profile_table = 'venue_profiles' THEN
    SELECT jsonb_build_object(
      'display_name', venue_name,
      'username', venue_name,
      'avatar_url', avatar_url
    ) INTO profile_data
    FROM venue_profiles WHERE id = account_record.profile_id;
  END IF;
  
  -- Update account with fresh data
  UPDATE accounts SET
    display_name = COALESCE(profile_data->>'display_name', display_name),
    username = COALESCE(profile_data->>'username', username),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    updated_at = NOW()
  WHERE id = account_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 8: Create Triggers for Automatic Updates
-- =====================================================

-- Trigger to update accounts table when profiles change
CREATE OR REPLACE FUNCTION update_accounts_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update corresponding account record
  UPDATE accounts SET
    display_name = COALESCE(NEW.name, NEW.username, display_name),
    username = COALESCE(NEW.username, username),
    avatar_url = COALESCE(NEW.avatar_url, avatar_url),
    updated_at = NOW()
  WHERE profile_table = 'profiles' AND profile_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accounts_on_profile_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_accounts_on_profile_change();

-- Trigger to update accounts table when artist_profiles change
CREATE OR REPLACE FUNCTION update_accounts_on_artist_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE accounts SET
    display_name = COALESCE(NEW.artist_name, display_name),
    username = COALESCE(NEW.artist_name, username),
    avatar_url = COALESCE(NEW.avatar_url, avatar_url),
    updated_at = NOW()
  WHERE profile_table = 'artist_profiles' AND profile_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accounts_on_artist_profile_change
  AFTER UPDATE ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_accounts_on_artist_profile_change();

-- Trigger to update accounts table when venue_profiles change
CREATE OR REPLACE FUNCTION update_accounts_on_venue_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE accounts SET
    display_name = COALESCE(NEW.venue_name, display_name),
    username = COALESCE(NEW.venue_name, username),
    avatar_url = COALESCE(NEW.avatar_url, avatar_url),
    updated_at = NOW()
  WHERE profile_table = 'venue_profiles' AND profile_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_accounts_on_venue_profile_change
  AFTER UPDATE ON venue_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_accounts_on_venue_profile_change();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Search and accounts system migration completed successfully!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Run the account migration script to populate the new tables';
  RAISE NOTICE '2. Test the search functionality';
  RAISE NOTICE '3. Verify that all accounts are now searchable';
END $$;
