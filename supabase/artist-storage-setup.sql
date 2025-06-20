-- =============================================
-- Artist Storage Buckets Setup
-- =============================================
-- This script sets up additional storage buckets for artist content
-- Run this in your Supabase SQL Editor

-- Create additional buckets for artist content
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('artist-music', 'artist-music', false),
  ('artist-videos', 'artist-videos', true),
  ('artist-photos', 'artist-photos', true),
  ('artist-documents', 'artist-documents', false),
  ('artist-merchandise', 'artist-merchandise', true),
  ('artist-blog-images', 'artist-blog-images', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- =============================================
-- RLS Policies for Artist Storage Buckets
-- =============================================

-- Artist Music bucket policies (private)
CREATE POLICY "Artists can access their own music files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can upload their own music files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own music files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can delete their own music files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-music' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artist Videos bucket policies (public)
CREATE POLICY "Artist videos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-videos');

CREATE POLICY "Artists can upload their own videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can delete their own videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artist Photos bucket policies (public)
CREATE POLICY "Artist photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-photos');

CREATE POLICY "Artists can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artist Documents bucket policies (private)
CREATE POLICY "Artists can access their own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artist-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artist Merchandise bucket policies (public)
CREATE POLICY "Artist merchandise images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-merchandise');

CREATE POLICY "Artists can upload their own merchandise images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-merchandise' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own merchandise images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-merchandise' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can delete their own merchandise images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-merchandise' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artist Blog Images bucket policies (public)
CREATE POLICY "Artist blog images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-blog-images');

CREATE POLICY "Artists can upload their own blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can update their own blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artist-blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Artists can delete their own blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artist-blog-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- File Type Validation Functions
-- =============================================

-- Function to validate music file types
CREATE OR REPLACE FUNCTION is_valid_music_type(filename text)
RETURNS boolean AS $$
BEGIN
  RETURN get_file_extension(filename) IN ('mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg');
END;
$$ LANGUAGE plpgsql;

-- Function to validate video file types
CREATE OR REPLACE FUNCTION is_valid_video_type(filename text)
RETURNS boolean AS $$
BEGIN
  RETURN get_file_extension(filename) IN ('mp4', 'mov', 'avi', 'mkv', 'webm', 'flv');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- File Type Validation Policies
-- =============================================

-- Music file type validation
CREATE POLICY "Only allow valid music types for artist music" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-music' 
    AND is_valid_music_type(name)
  );

-- Video file type validation
CREATE POLICY "Only allow valid video types for artist videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-videos' 
    AND is_valid_video_type(name)
  );

-- Photo file type validation for artist photos
CREATE POLICY "Only allow valid image types for artist photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-photos' 
    AND is_valid_image_type(name)
  );

-- Document file type validation for artist documents
CREATE POLICY "Only allow valid document types for artist documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-documents' 
    AND is_valid_document_type(name)
  );

-- Image file type validation for merchandise
CREATE POLICY "Only allow valid image types for artist merchandise" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-merchandise' 
    AND is_valid_image_type(name)
  );

-- Image file type validation for blog images
CREATE POLICY "Only allow valid image types for artist blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artist-blog-images' 
    AND is_valid_image_type(name)
  );

-- =============================================
-- Helper Functions for Storage Management
-- =============================================

-- Function to get storage statistics for an artist
CREATE OR REPLACE FUNCTION get_artist_storage_stats(artist_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'music_files', (
      SELECT COUNT(*) FROM storage.objects 
      WHERE bucket_id = 'artist-music' 
      AND (storage.foldername(name))[1] = artist_user_id::text
    ),
    'video_files', (
      SELECT COUNT(*) FROM storage.objects 
      WHERE bucket_id = 'artist-videos' 
      AND (storage.foldername(name))[1] = artist_user_id::text
    ),
    'photo_files', (
      SELECT COUNT(*) FROM storage.objects 
      WHERE bucket_id = 'artist-photos' 
      AND (storage.foldername(name))[1] = artist_user_id::text
    ),
    'document_files', (
      SELECT COUNT(*) FROM storage.objects 
      WHERE bucket_id = 'artist-documents' 
      AND (storage.foldername(name))[1] = artist_user_id::text
    ),
    'merchandise_images', (
      SELECT COUNT(*) FROM storage.objects 
      WHERE bucket_id = 'artist-merchandise' 
      AND (storage.foldername(name))[1] = artist_user_id::text
    ),
    'blog_images', (
      SELECT COUNT(*) FROM storage.objects 
      WHERE bucket_id = 'artist-blog-images' 
      AND (storage.foldername(name))[1] = artist_user_id::text
    ),
    'total_size_bytes', (
      SELECT COALESCE(SUM(metadata->>'size'), '0')::bigint 
      FROM storage.objects 
      WHERE bucket_id IN ('artist-music', 'artist-videos', 'artist-photos', 'artist-documents', 'artist-merchandise', 'artist-blog-images')
      AND (storage.foldername(name))[1] = artist_user_id::text
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned artist files
CREATE OR REPLACE FUNCTION cleanup_orphaned_artist_files()
RETURNS void AS $$
DECLARE
  orphaned_count INTEGER := 0;
BEGIN
  -- This is a placeholder for implementing cleanup logic
  -- In a real implementation, you would:
  -- 1. Find files in storage that don't have corresponding database records
  -- 2. Remove files that are older than a certain threshold
  -- 3. Clean up incomplete uploads
  
  RAISE NOTICE 'Cleanup function called - implement based on your needs';
  RAISE NOTICE 'Found % orphaned files (placeholder)', orphaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Success Message
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Artist Storage Buckets Setup Complete!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Created additional buckets:';
  RAISE NOTICE '  - artist-music (private - for audio files)';
  RAISE NOTICE '  - artist-videos (public - for video content)';
  RAISE NOTICE '  - artist-photos (public - for galleries)';
  RAISE NOTICE '  - artist-documents (private - for press kit)';
  RAISE NOTICE '  - artist-merchandise (public - for store images)';
  RAISE NOTICE '  - artist-blog-images (public - for blog content)';
  RAISE NOTICE '';
  RAISE NOTICE 'File Type Limits:';
  RAISE NOTICE '  - Music: mp3, wav, flac, aac, m4a, ogg';
  RAISE NOTICE '  - Videos: mp4, mov, avi, mkv, webm, flv';
  RAISE NOTICE '  - Images: jpg, jpeg, png, gif, webp, svg';
  RAISE NOTICE '  - Documents: pdf, doc, docx, txt, rtf';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies configured for security';
  RAISE NOTICE 'Ready for artist content uploads!';
  RAISE NOTICE '=================================================';
END $$; 