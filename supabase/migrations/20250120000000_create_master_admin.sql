-- Migration to create master admin account for kyleqdaley@gmail.com
-- This migration grants super admin privileges with full access to all platform features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, ensure the profiles table has the necessary admin columns
DO $$ 
BEGIN
  -- Add is_admin column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_admin column to profiles table';
  END IF;
  
  -- Add admin_level column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'admin_level') THEN
    ALTER TABLE profiles ADD COLUMN admin_level TEXT CHECK (admin_level IN ('super', 'moderator', 'support')) DEFAULT NULL;
    RAISE NOTICE 'Added admin_level column to profiles table';
  END IF;
  
  -- Add profile_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_type') THEN
    ALTER TABLE profiles ADD COLUMN profile_type TEXT DEFAULT 'general' CHECK (profile_type IN ('general', 'artist', 'venue', 'admin'));
    RAISE NOTICE 'Added profile_type column to profiles table';
  END IF;
  
  -- Add account_settings column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'account_settings') THEN
    ALTER TABLE profiles ADD COLUMN account_settings JSONB DEFAULT '{
      "privacy": {"profile_public": true, "show_activity": true, "allow_messages": true},
      "notifications": {"email": true, "push": true, "sms": false},
      "posting_permissions": {"as_artist": true, "as_venue": true, "as_admin": true}
    }'::jsonb;
    RAISE NOTICE 'Added account_settings column to profiles table';
  END IF;
END $$;

-- Function to make a user a master admin by email
CREATE OR REPLACE FUNCTION make_master_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
    RETURN FALSE;
  END IF;
  
  -- Ensure the user has a profile record
  INSERT INTO profiles (
    id, 
    is_admin, 
    admin_level, 
    profile_type,
    account_settings,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    TRUE,
    'super',
    'admin',
    '{
      "privacy": {"profile_public": true, "show_activity": true, "allow_messages": true},
      "notifications": {"email": true, "push": true, "sms": false},
      "posting_permissions": {"as_artist": true, "as_venue": true, "as_admin": true}
    }'::jsonb,
    'Master Admin',
    'admin',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    is_admin = TRUE,
    admin_level = 'super',
    profile_type = 'admin',
    account_settings = '{
      "privacy": {"profile_public": true, "show_activity": true, "allow_messages": true},
      "notifications": {"email": true, "push": true, "sms": false},
      "posting_permissions": {"as_artist": true, "as_venue": true, "as_admin": true}
    }'::jsonb,
    role = 'admin',
    updated_at = NOW();
  
  RAISE NOTICE 'Successfully made user % a master admin', user_email;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make kyleqdaley@gmail.com a master admin
SELECT make_master_admin('kyleqdaley@gmail.com');

-- Create admin permission policies if they don't exist
DO $$
BEGIN
  -- Update RLS policy for profiles to allow admins to manage all profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can manage all profiles') THEN
    CREATE POLICY "Admins can manage all profiles"
      ON profiles FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles admin_check
          WHERE admin_check.id = auth.uid() 
          AND admin_check.is_admin = TRUE
        )
      );
    RAISE NOTICE 'Created admin policy for profiles table';
  END IF;
END $$;

-- Grant super admin access to all major tables
DO $$
DECLARE
  table_names TEXT[] := ARRAY[
    'artist_profiles', 'venue_profiles', 'events', 'posts', 'user_follows',
    'admin_requests', 'account_relationships', 'user_sessions', 'account_activity_log',
    'staff_jobs', 'staff_applications', 'notifications', 'projects', 'project_members'
  ];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY table_names
  LOOP
    -- Check if table exists before creating policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
      -- Create admin access policy for this table
      EXECUTE format('
        DO $policy$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = %L AND policyname = %L) THEN
            CREATE POLICY %I ON %I FOR ALL
            USING (
              EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.is_admin = TRUE
              )
            );
          END IF;
        END $policy$;
      ', table_name, 'Admins can manage all ' || table_name, 'Admins can manage all ' || table_name, table_name);
      
      RAISE NOTICE 'Created/verified admin policy for table: %', table_name;
    ELSE
      RAISE NOTICE 'Table % does not exist, skipping policy creation', table_name;
    END IF;
  END LOOP;
END $$;

-- Log the admin creation
INSERT INTO account_activity_log (
  user_id, 
  profile_id, 
  account_type, 
  action_type, 
  action_details,
  created_at
) 
SELECT 
  id,
  id,
  'admin',
  'create_account',
  '{"level": "super", "created_by": "migration", "email": "kyleqdaley@gmail.com"}'::jsonb,
  NOW()
FROM auth.users 
WHERE email = 'kyleqdaley@gmail.com'
ON CONFLICT DO NOTHING;

-- Clean up the function (optional, but good practice)
DROP FUNCTION IF EXISTS make_master_admin(TEXT);

-- Final verification
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count 
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE u.email = 'kyleqdaley@gmail.com' 
  AND p.is_admin = TRUE 
  AND p.admin_level = 'super';
  
  IF admin_count > 0 THEN
    RAISE NOTICE 'SUCCESS: kyleqdaley@gmail.com is now a master admin with super privileges';
  ELSE
    RAISE EXCEPTION 'FAILED: Could not create master admin for kyleqdaley@gmail.com';
  END IF;
END $$; 