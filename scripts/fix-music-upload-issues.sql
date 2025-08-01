-- =============================================
-- Comprehensive Fix for Music Upload Issues
-- =============================================
-- This script fixes RLS policy issues that prevent music uploads
-- Run this in your Supabase SQL Editor

-- =============================================
-- Step 1: Fix Storage RLS Policies
-- =============================================

-- Drop any existing conflicting storage policies
DROP POLICY IF EXISTS "Artists can access their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can upload their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can update their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can delete their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artist photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Artists can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Artists can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Artists can delete their own photos" ON storage.objects;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('artist-music', 'artist-music', false),
  ('artist-photos', 'artist-photos', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- Create simplified storage policies using split_part instead of storage.foldername
CREATE POLICY "Artists can access their own music files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Artists can upload their own music files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Artists can update their own music files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Artists can delete their own music files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Photo policies
CREATE POLICY "Artist photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-photos');

CREATE POLICY "Artists can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Artists can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Artists can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 2: Fix Database RLS Policies
-- =============================================

-- Drop existing artist_music policies to recreate them
DROP POLICY IF EXISTS "Anyone can view public music" ON artist_music;
DROP POLICY IF EXISTS "Artists can view their own music" ON artist_music;
DROP POLICY IF EXISTS "Artists can manage their own music" ON artist_music;

-- Recreate artist_music policies
CREATE POLICY "Anyone can view public music" ON artist_music
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can view their own music" ON artist_music
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their own music" ON artist_music
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on artist_music table
ALTER TABLE artist_music ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Step 3: Verify Tables Exist
-- =============================================

-- Check if artist_profiles table exists and has the right structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'artist_profiles') THEN
    CREATE TABLE IF NOT EXISTS artist_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      artist_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      cover_image_url TEXT,
      genre TEXT,
      location TEXT,
      website_url TEXT,
      social_links JSONB,
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- =============================================
-- Step 4: Create Test Function
-- =============================================

-- Function to test if the current user can upload music
CREATE OR REPLACE FUNCTION test_music_upload_permissions()
RETURNS TABLE (
  user_id UUID,
  can_upload BOOLEAN,
  storage_buckets_exist BOOLEAN,
  rls_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    auth.uid() IS NOT NULL as can_upload,
    EXISTS (SELECT 1 FROM storage.buckets WHERE id IN ('artist-music', 'artist-photos')) as storage_buckets_exist,
    EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'storage_objects' AND policyname LIKE '%upload%') as rls_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Success Message
-- =============================================
SELECT 'Music upload issues fixed successfully!' as message;

-- Test the permissions
SELECT * FROM test_music_upload_permissions(); 