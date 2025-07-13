-- Unified Account System Migration
-- This creates a scalable system for unlimited account types with unique identifiers

-- Create a unified accounts table that can reference any profile type
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  UNIQUE(account_type, display_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_profile_lookup ON accounts(profile_table, profile_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active) WHERE is_active = TRUE;

-- Function to get account display information by account ID
CREATE OR REPLACE FUNCTION get_account_display_info(account_id UUID)
RETURNS JSONB AS $$
DECLARE
  account_record accounts%ROWTYPE;
  result JSONB;
BEGIN
  -- Get account record
  SELECT * INTO account_record FROM accounts WHERE id = account_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Return cached display info
  result := jsonb_build_object(
    'id', account_record.id,
    'account_type', account_record.account_type,
    'display_name', account_record.display_name,
    'username', account_record.username,
    'avatar_url', account_record.avatar_url,
    'is_verified', account_record.is_verified,
    'profile_table', account_record.profile_table,
    'profile_id', account_record.profile_id
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh account display info from source profile tables
CREATE OR REPLACE FUNCTION refresh_account_display_info(account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  account_record accounts%ROWTYPE;
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
        COALESCE(stage_name, artist_name, 'Artist'),
        LOWER(REGEXP_REPLACE(COALESCE(stage_name, artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
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

-- Function to create or update an account
CREATE OR REPLACE FUNCTION upsert_account(
  p_owner_user_id UUID,
  p_account_type TEXT,
  p_profile_table TEXT,
  p_profile_id UUID
)
RETURNS UUID AS $$
DECLARE
  account_id UUID;
BEGIN
  -- Try to find existing account
  SELECT id INTO account_id 
  FROM accounts 
  WHERE profile_table = p_profile_table AND profile_id = p_profile_id;
  
  IF account_id IS NULL THEN
    -- Create new account
    INSERT INTO accounts (owner_user_id, account_type, profile_table, profile_id, display_name)
    VALUES (p_owner_user_id, p_account_type, p_profile_table, p_profile_id, 'Loading...')
    RETURNING id INTO account_id;
  ELSE
    -- Update existing account
    UPDATE accounts SET
      owner_user_id = p_owner_user_id,
      account_type = p_account_type,
      updated_at = NOW()
    WHERE id = account_id;
  END IF;
  
  -- Refresh display info
  PERFORM refresh_account_display_info(account_id);
  
  RETURN account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update posts table to use the new account system
DO $$ 
BEGIN
  -- Add account_id column to posts table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'account_id') THEN
    ALTER TABLE posts ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_posts_account_id ON posts(account_id);
    RAISE NOTICE '✅ Added account_id column to posts table';
  ELSE
    RAISE NOTICE 'ℹ️  account_id column already exists';
  END IF;
END $$;

-- Enable RLS on accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for accounts
CREATE POLICY "Users can view their own accounts" ON accounts
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = owner_user_id);

-- Create trigger to auto-refresh account info when profiles are updated
CREATE OR REPLACE FUNCTION trigger_refresh_account_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh accounts that reference this profile
  PERFORM refresh_account_display_info(id) 
  FROM accounts 
  WHERE profile_table = TG_TABLE_NAME 
  AND profile_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for each profile table (if they exist)
DO $$
BEGIN
  -- Artist profiles trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_profiles') THEN
    DROP TRIGGER IF EXISTS refresh_accounts_on_artist_update ON artist_profiles;
    CREATE TRIGGER refresh_accounts_on_artist_update
      AFTER UPDATE ON artist_profiles
      FOR EACH ROW EXECUTE FUNCTION trigger_refresh_account_info();
  END IF;
  
  -- Venue profiles trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_profiles') THEN
    DROP TRIGGER IF EXISTS refresh_accounts_on_venue_update ON venue_profiles;
    CREATE TRIGGER refresh_accounts_on_venue_update
      AFTER UPDATE ON venue_profiles
      FOR EACH ROW EXECUTE FUNCTION trigger_refresh_account_info();
  END IF;
  
  -- Business profiles trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
    DROP TRIGGER IF EXISTS refresh_accounts_on_business_update ON business_profiles;
    CREATE TRIGGER refresh_accounts_on_business_update
      AFTER UPDATE ON business_profiles
      FOR EACH ROW EXECUTE FUNCTION trigger_refresh_account_info();
  END IF;
  
  -- User profiles trigger
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS refresh_accounts_on_profile_update ON profiles;
    CREATE TRIGGER refresh_accounts_on_profile_update
      AFTER UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION trigger_refresh_account_info();
  END IF;
END $$;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Unified account system created successfully!';
  RAISE NOTICE 'ℹ️  System now supports unlimited account types with unique identifiers';
  RAISE NOTICE 'ℹ️  Account display names are automatically cached and refreshed';
  RAISE NOTICE 'ℹ️  Use upsert_account() function to create/update accounts';
  RAISE NOTICE 'ℹ️  Use get_account_display_info() function to get display information';
END $$; 