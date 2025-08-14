-- Fix Profiles Table Structure
-- This script ensures the profiles table has all necessary columns for artist profile access

-- First, let's check what columns exist in the profiles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if profiles table exists at all
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_name = 'profiles' 
  AND table_schema = 'public'
) as profiles_table_exists;

-- Add missing columns to profiles table
DO $$ 
BEGIN
  -- Ensure profiles table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public'
  ) THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE,
      full_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      location TEXT,
      website TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      posts_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    RAISE NOTICE 'Created profiles table';
  END IF;

  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
    RAISE NOTICE 'Added username column to profiles table';
  END IF;

  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column to profiles table';
  END IF;

  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
    RAISE NOTICE 'Added bio column to profiles table';
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url column to profiles table';
  END IF;

  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column to profiles table';
  END IF;

  -- Add website column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'website' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to profiles table';
  END IF;

  -- Add is_verified column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_verified column to profiles table';
  END IF;

  -- Add followers_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'followers_count' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added followers_count column to profiles table';
  END IF;

  -- Add following_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'following_count' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN following_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added following_count column to profiles table';
  END IF;

  -- Add posts_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'posts_count' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN posts_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added posts_count column to profiles table';
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    RAISE NOTICE 'Added created_at column to profiles table';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at' AND table_schema = 'public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    RAISE NOTICE 'Added updated_at column to profiles table';
  END IF;

END $$;

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Public read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles FOR SELECT
      USING (true);
    RAISE NOTICE 'Created public read policy for profiles';
  END IF;

  -- User insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Created user insert policy for profiles';
  END IF;

  -- User update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      USING (auth.uid() = id);
    RAISE NOTICE 'Created user update policy for profiles';
  END IF;
END $$;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
