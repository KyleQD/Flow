-- =============================================
-- Create Storage Buckets for Music System
-- =============================================
-- Run this script in your Supabase SQL Editor

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
-- RLS Policies for Artist Music Bucket
-- =============================================

-- Artists can access their own music files
CREATE POLICY "Artists can access their own music files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artists can upload their own music files
CREATE POLICY "Artists can upload their own music files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artists can update their own music files
CREATE POLICY "Artists can update their own music files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artists can delete their own music files
CREATE POLICY "Artists can delete their own music files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- RLS Policies for Artist Photos Bucket
-- =============================================

-- Artist photos are publicly accessible
CREATE POLICY "Artist photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-photos');

-- Artists can upload their own photos
CREATE POLICY "Artists can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artists can update their own photos
CREATE POLICY "Artists can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artists can delete their own photos
CREATE POLICY "Artists can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Success Message
-- =============================================
SELECT 'Storage buckets and policies created successfully!' as message; 