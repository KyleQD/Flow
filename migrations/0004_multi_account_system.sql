-- Migration for Multi-Account System Enhancement
-- This migration creates a comprehensive account management system

-- Enhance profiles table to support multiple account types
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'general' CHECK (profile_type IN ('general', 'artist', 'venue', 'admin')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_level TEXT CHECK (admin_level IN ('super', 'moderator', 'support')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS account_settings JSONB DEFAULT '{
  "privacy": {"profile_public": true, "show_activity": true, "allow_messages": true},
  "notifications": {"email": true, "push": true, "sms": false},
  "posting_permissions": {"as_artist": false, "as_venue": false, "as_admin": false}
}'::jsonb;

-- Create account_relationships table to manage owned accounts
CREATE TABLE IF NOT EXISTS account_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owned_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('artist', 'venue', 'admin')),
  permissions JSONB DEFAULT '{
    "can_post": true,
    "can_manage_settings": true,
    "can_view_analytics": true,
    "can_manage_content": true
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(owner_user_id, owned_profile_id)
);

-- Create user_sessions table for context switching
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  active_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  active_account_type TEXT NOT NULL CHECK (active_account_type IN ('general', 'artist', 'venue', 'admin')),
  session_data JSONB DEFAULT '{}'::jsonb,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enhance artist_profiles table with relationship to main profile
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS main_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS account_tier TEXT DEFAULT 'basic' CHECK (account_tier IN ('basic', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "public_profile": true,
  "allow_bookings": true,
  "show_contact_info": false,
  "auto_accept_follows": true
}'::jsonb;

-- Enhance venue_profiles table with relationship to main profile  
ALTER TABLE venue_profiles 
ADD COLUMN IF NOT EXISTS main_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS account_tier TEXT DEFAULT 'basic' CHECK (account_tier IN ('basic', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "public_profile": true,
  "allow_bookings": true,
  "show_contact_info": false,
  "require_approval": false
}'::jsonb;

-- Create account_activity_log for tracking account actions
CREATE TABLE IF NOT EXISTS account_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('login', 'post', 'update_profile', 'switch_account', 'create_account', 'delete_account')),
  action_details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cross_account_permissions for granular permissions
CREATE TABLE IF NOT EXISTS cross_account_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grantor_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  grantee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('post_as', 'manage_content', 'view_analytics', 'manage_bookings')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('artist', 'venue', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(grantor_profile_id, grantee_user_id, permission_type, resource_type)
);

-- Enhance posts table to track posting context
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS posted_as_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS posted_as_account_type TEXT DEFAULT 'general' CHECK (posted_as_account_type IN ('general', 'artist', 'venue', 'admin')),
ADD COLUMN IF NOT EXISTS cross_post_to TEXT[] DEFAULT '{}';

-- Create RLS policies for account_relationships
ALTER TABLE account_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account relationships"
  ON account_relationships FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can manage their own account relationships"
  ON account_relationships FOR ALL
  USING (auth.uid() = owner_user_id);

-- Create RLS policies for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
  ON user_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Create RLS policies for account_activity_log
ALTER TABLE account_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
  ON account_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
  ON account_activity_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON account_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create RLS policies for cross_account_permissions
ALTER TABLE cross_account_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile owners can manage permissions for their profiles"
  ON cross_account_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN account_relationships ar ON p.id = ar.owned_profile_id
      WHERE p.id = grantor_profile_id
      AND ar.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Grantees can view permissions granted to them"
  ON cross_account_permissions FOR SELECT
  USING (auth.uid() = grantee_user_id);

-- Create functions for account management

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
  main_profile_id UUID;
  artist_profile_id UUID;
BEGIN
  -- Get main profile
  SELECT id INTO main_profile_id FROM profiles WHERE id = user_id;
  
  IF main_profile_id IS NULL THEN
    RAISE EXCEPTION 'Main profile not found for user %', user_id;
  END IF;

  -- Create artist profile
  INSERT INTO artist_profiles (user_id, main_profile_id, artist_name, bio, genres, social_links)
  VALUES (user_id, main_profile_id, artist_name, bio, genres, social_links)
  RETURNING id INTO artist_profile_id;

  -- Create account relationship
  INSERT INTO account_relationships (owner_user_id, owned_profile_id, account_type)
  VALUES (user_id, main_profile_id, 'artist');

  -- Log activity
  INSERT INTO account_activity_log (user_id, profile_id, account_type, action_type, action_details)
  VALUES (user_id, main_profile_id, 'artist', 'create_account', 
    jsonb_build_object('artist_profile_id', artist_profile_id, 'artist_name', artist_name));

  RETURN artist_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create venue account
CREATE OR REPLACE FUNCTION create_venue_account(
  user_id UUID,
  venue_name TEXT,
  description TEXT DEFAULT NULL,
  address TEXT DEFAULT NULL,
  capacity INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  main_profile_id UUID;
  venue_profile_id UUID;
BEGIN
  -- Get main profile
  SELECT id INTO main_profile_id FROM profiles WHERE id = user_id;
  
  IF main_profile_id IS NULL THEN
    RAISE EXCEPTION 'Main profile not found for user %', user_id;
  END IF;

  -- Create venue profile
  INSERT INTO venue_profiles (user_id, main_profile_id, venue_name, description, address, capacity)
  VALUES (user_id, main_profile_id, venue_name, description, address, capacity)
  RETURNING id INTO venue_profile_id;

  -- Create account relationship
  INSERT INTO account_relationships (owner_user_id, owned_profile_id, account_type)
  VALUES (user_id, main_profile_id, 'venue');

  -- Log activity
  INSERT INTO account_activity_log (user_id, profile_id, account_type, action_type, action_details)
  VALUES (user_id, main_profile_id, 'venue', 'create_account', 
    jsonb_build_object('venue_profile_id', venue_profile_id, 'venue_name', venue_name));

  RETURN venue_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to switch active account
CREATE OR REPLACE FUNCTION switch_active_account(
  user_id UUID,
  target_profile_id UUID,
  target_account_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify user has access to this profile
  IF NOT EXISTS (
    SELECT 1 FROM account_relationships 
    WHERE owner_user_id = user_id 
    AND owned_profile_id = target_profile_id
    AND account_type = target_account_type
    AND is_active = true
  ) AND target_profile_id != user_id THEN
    RAISE EXCEPTION 'User does not have access to this account';
  END IF;

  -- Update or insert session
  INSERT INTO user_sessions (user_id, active_profile_id, active_account_type, last_activity)
  VALUES (user_id, target_profile_id, target_account_type, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    active_profile_id = EXCLUDED.active_profile_id,
    active_account_type = EXCLUDED.active_account_type,
    last_activity = EXCLUDED.last_activity;

  -- Log activity
  INSERT INTO account_activity_log (user_id, profile_id, account_type, action_type, action_details)
  VALUES (user_id, target_profile_id, target_account_type, 'switch_account', 
    jsonb_build_object('switched_to', target_account_type));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user accounts
CREATE OR REPLACE FUNCTION get_user_accounts(user_id UUID)
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
    'general'::TEXT as account_type,
    p.id as profile_id,
    to_jsonb(p) as profile_data,
    p.account_settings as permissions,
    true as is_active
  FROM profiles p
  WHERE p.id = user_id

  UNION ALL

  SELECT 
    ar.account_type,
    ar.owned_profile_id as profile_id,
    CASE 
      WHEN ar.account_type = 'artist' THEN to_jsonb(ap)
      WHEN ar.account_type = 'venue' THEN to_jsonb(vp)
      ELSE '{}'::jsonb
    END as profile_data,
    ar.permissions,
    ar.is_active
  FROM account_relationships ar
  LEFT JOIN artist_profiles ap ON ar.account_type = 'artist' AND ap.main_profile_id = ar.owned_profile_id
  LEFT JOIN venue_profiles vp ON ar.account_type = 'venue' AND vp.main_profile_id = ar.owned_profile_id
  WHERE ar.owner_user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to post with account context
CREATE OR REPLACE FUNCTION create_post_with_context(
  user_id UUID,
  posting_as_profile_id UUID,
  posting_as_account_type TEXT,
  content TEXT,
  post_type TEXT DEFAULT 'text',
  visibility TEXT DEFAULT 'public',
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  post_id UUID;
BEGIN
  -- Verify posting permissions
  IF posting_as_profile_id != user_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM account_relationships 
      WHERE owner_user_id = user_id 
      AND owned_profile_id = posting_as_profile_id
      AND account_type = posting_as_account_type
      AND is_active = true
      AND (permissions->>'can_post')::boolean = true
    ) THEN
      RAISE EXCEPTION 'User does not have posting permissions for this account';
    END IF;
  END IF;

  -- Create post
  INSERT INTO posts (
    user_id, 
    posted_as_profile_id, 
    posted_as_account_type, 
    content, 
    type, 
    visibility, 
    media_urls, 
    hashtags
  )
  VALUES (
    user_id, 
    posting_as_profile_id, 
    posting_as_account_type, 
    content, 
    post_type, 
    visibility, 
    media_urls, 
    hashtags
  )
  RETURNING id INTO post_id;

  -- Update profile post count
  UPDATE profiles 
  SET posts_count = posts_count + 1 
  WHERE id = posting_as_profile_id;

  -- Log activity
  INSERT INTO account_activity_log (user_id, profile_id, account_type, action_type, action_details)
  VALUES (user_id, posting_as_profile_id, posting_as_account_type, 'post', 
    jsonb_build_object('post_id', post_id, 'post_type', post_type));

  RETURN post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_relationships_owner ON account_relationships(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_account_relationships_profile ON account_relationships(owned_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_as ON posts(posted_as_profile_id, posted_as_account_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON account_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cross_permissions_grantee ON cross_account_permissions(grantee_user_id); 