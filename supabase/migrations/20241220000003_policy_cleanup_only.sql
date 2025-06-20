-- Policy Cleanup and Replacement Migration
-- This migration removes all conflicting policies and recreates them properly

-- Drop all existing policies that might conflict
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
    
    -- Drop all policies on artist_profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'artist_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON artist_profiles';
    END LOOP;
    
    -- Drop all policies on venue_profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'venue_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON venue_profiles';
    END LOOP;
    
    -- Drop all policies on posts table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'posts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON posts';
    END LOOP;
    
    -- Drop all policies on account_relationships table if it exists
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'account_relationships') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON account_relationships';
    END LOOP;
    
    -- Drop all policies on user_sessions table if it exists
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_sessions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_sessions';
    END LOOP;
    
    -- Drop all policies on account_activity_log table if it exists
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'account_activity_log') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON account_activity_log';
    END LOOP;
    
    -- Drop all policies on cross_account_permissions table if it exists
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cross_account_permissions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON cross_account_permissions';
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create correct policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create correct policies for artist_profiles table
CREATE POLICY "Artist profiles are viewable by everyone"
  ON artist_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own artist profile"
  ON artist_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist profile"
  ON artist_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create correct policies for venue_profiles table
CREATE POLICY "Venue profiles are viewable by everyone"
  ON venue_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own venue profile"
  ON venue_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own venue profile"
  ON venue_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create correct policies for posts table
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for multi-account tables if they exist
DO $$ 
BEGIN
  -- Enable RLS and create policies for account_relationships if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_relationships') THEN
    ALTER TABLE account_relationships ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own account relationships"
      ON account_relationships FOR SELECT
      USING (auth.uid() = owner_user_id);

    CREATE POLICY "Users can manage their own account relationships"
      ON account_relationships FOR ALL
      USING (auth.uid() = owner_user_id);
  END IF;

  -- Enable RLS and create policies for user_sessions if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can manage their own sessions"
      ON user_sessions FOR ALL
      USING (auth.uid() = user_id);
  END IF;

  -- Enable RLS and create policies for account_activity_log if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_activity_log') THEN
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
  END IF;

  -- Enable RLS and create policies for cross_account_permissions if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cross_account_permissions') THEN
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
  END IF;
END $$; 