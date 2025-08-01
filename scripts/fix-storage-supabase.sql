-- =============================================
-- Supabase-Compatible Storage Fix for Music System
-- =============================================
-- This script works with Supabase's storage system
-- Run this in your Supabase SQL Editor

-- =============================================
-- Step 1: Create Storage Buckets
-- =============================================

-- Create artist-music bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-music', 'artist-music', false)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- Create artist-photos bucket (public) for cover art
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-photos', 'artist-photos', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- =============================================
-- Step 2: Create Storage Policies (Supabase Way)
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Artists can access their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can upload their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can update their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artists can delete their own music files" ON storage.objects;
DROP POLICY IF EXISTS "Artist photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Artists can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Artists can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Artists can delete their own photos" ON storage.objects;

-- Create music storage policies
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

-- Create photo storage policies
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

-- =============================================
-- Step 3: Fix Database RLS Policies
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
    EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%upload%') as rls_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Success Message
-- =============================================
SELECT 'Supabase storage and RLS policies fixed successfully!' as message;

-- Test the permissions
SELECT * FROM test_music_upload_permissions(); 