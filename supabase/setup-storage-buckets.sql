-- =============================================
-- Supabase Storage Buckets Setup
-- =============================================
-- This script sets up all necessary storage buckets for media handling
-- Run this in your Supabase SQL Editor

-- Enable storage if not already enabled
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('post-media', 'post-media', true),
  ('venue-media', 'venue-media', true),
  ('event-media', 'event-media', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- =============================================
-- RLS Policies for Storage Buckets
-- =============================================

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Post media bucket policies
CREATE POLICY "Post media images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own post media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own post media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Venue media bucket policies
CREATE POLICY "Venue media images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'venue-media');

CREATE POLICY "Authenticated users can upload venue media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'venue-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own venue media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'venue-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own venue media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'venue-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Event media bucket policies
CREATE POLICY "Event media images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'event-media');

CREATE POLICY "Authenticated users can upload event media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own event media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own event media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Documents bucket policies (private)
CREATE POLICY "Users can access their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- Helper Functions for Storage
-- =============================================

-- Function to get file extension
CREATE OR REPLACE FUNCTION get_file_extension(filename text)
RETURNS text AS $$
BEGIN
  RETURN lower(substring(filename from '\.([^.]*)$'));
END;
$$ LANGUAGE plpgsql;

-- Function to validate image file types
CREATE OR REPLACE FUNCTION is_valid_image_type(filename text)
RETURNS boolean AS $$
BEGIN
  RETURN get_file_extension(filename) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg');
END;
$$ LANGUAGE plpgsql;

-- Function to validate document file types
CREATE OR REPLACE FUNCTION is_valid_document_type(filename text)
RETURNS boolean AS $$
BEGIN
  RETURN get_file_extension(filename) IN ('pdf', 'doc', 'docx', 'txt', 'rtf');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Additional Constraints and Triggers
-- =============================================

-- Add file type validation policies
CREATE POLICY "Only allow valid image types for avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND is_valid_image_type(name)
);

CREATE POLICY "Only allow valid image types for post media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-media' 
  AND is_valid_image_type(name)
);

CREATE POLICY "Only allow valid image types for venue media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'venue-media' 
  AND is_valid_image_type(name)
);

CREATE POLICY "Only allow valid image types for event media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-media' 
  AND is_valid_image_type(name)
);

CREATE POLICY "Only allow valid document types for documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND is_valid_document_type(name)
);

-- =============================================
-- File Size Limits (handled at application level)
-- =============================================
-- Note: Supabase doesn't support database-level file size limits
-- These should be enforced in your application code:
-- - Avatars: 10MB max
-- - Post Media: 50MB max  
-- - Venue Media: 50MB max
-- - Event Media: 50MB max
-- - Documents: 25MB max

-- =============================================
-- Cleanup Function
-- =============================================

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS void AS $$
BEGIN
  -- This would be expanded to clean up files that are no longer referenced
  -- in your application tables. Implementation depends on your specific needs.
  RAISE NOTICE 'Cleanup function called - implement based on your needs';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Success Message
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Storage buckets setup completed successfully!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Created buckets:';
  RAISE NOTICE '  - avatars (public)';
  RAISE NOTICE '  - post-media (public)';
  RAISE NOTICE '  - venue-media (public)';
  RAISE NOTICE '  - event-media (public)';
  RAISE NOTICE '  - documents (private)';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies configured for security';
  RAISE NOTICE 'File type validation enabled';
  RAISE NOTICE 'Ready to handle media uploads!';
  RAISE NOTICE '=================================================';
END $$; 