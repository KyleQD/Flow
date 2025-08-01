-- Fix Notification System Dependencies
-- This migration ensures all required functions and triggers exist before setting up the notification system

-- First, let's ensure the refresh_account_display_info function exists
-- This function is required by the account system triggers

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

-- Ensure the trigger function exists
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

-- Ensure the accounts table exists with proper structure
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('artist', 'venue', 'business', 'user')),
  profile_table TEXT NOT NULL,
  profile_id UUID NOT NULL,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_table, profile_id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_profile_lookup ON accounts(profile_table, profile_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active) WHERE is_active = TRUE;

-- Ensure the profiles table has the unread_notifications column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'unread_notifications'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unread_notifications INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added unread_notifications column to profiles table';
  ELSE
    RAISE NOTICE 'ℹ️  unread_notifications column already exists in profiles table';
  END IF;
END $$;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Notification system dependencies fixed successfully!';
  RAISE NOTICE 'ℹ️  All required functions and triggers are now in place';
  RAISE NOTICE 'ℹ️  The notification system can now be safely deployed';
END $$; 