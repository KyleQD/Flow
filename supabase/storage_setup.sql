-- =============================================================================
-- SUPABASE STORAGE SETUP FOR VENUE MEDIA
-- Run this in your Supabase SQL Editor to set up storage buckets
-- =============================================================================

-- Create venue media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-media',
  'venue-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create venue documents storage bucket  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-documents', 
  'venue-documents',
  false, -- Private bucket for documents
  52428800, -- 50MB limit for documents
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES FOR VENUE MEDIA BUCKET
-- =============================================================================

-- Allow anyone to view public venue images
CREATE POLICY "Public venue images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-media');

-- Allow authenticated users to upload images for venues they own
CREATE POLICY "Users can upload images for their venues"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-media' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow venue owners to update their venue images
CREATE POLICY "Users can update their venue images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-media'
  AND auth.role() = 'authenticated' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow venue owners to delete their venue images
CREATE POLICY "Users can delete their venue images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- STORAGE POLICIES FOR VENUE DOCUMENTS BUCKET  
-- =============================================================================

-- Allow venue owners to view their documents
CREATE POLICY "Users can view their venue documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'venue-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow venue owners to upload documents
CREATE POLICY "Users can upload documents for their venues"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow venue owners to update their documents
CREATE POLICY "Users can update their venue documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow venue owners to delete their documents
CREATE POLICY "Users can delete their venue documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- HELPER FUNCTIONS FOR STORAGE OPERATIONS
-- =============================================================================

-- Function to get venue image URL
CREATE OR REPLACE FUNCTION get_venue_image_url(user_id UUID, image_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'https://' || (SELECT ref FROM storage.buckets WHERE id = 'venue-media') || 
         '/storage/v1/object/public/venue-media/' || user_id || '/' || image_name;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old venue images when updating
CREATE OR REPLACE FUNCTION cleanup_old_venue_image(user_id UUID, old_image_url TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  image_path TEXT;
BEGIN
  -- Extract path from URL if it's a storage URL
  IF old_image_url LIKE '%/storage/v1/object/public/venue-media/%' THEN
    image_path := SUBSTRING(old_image_url FROM '/storage/v1/object/public/venue-media/(.*)');
    
    -- Delete the old image
    DELETE FROM storage.objects 
    WHERE bucket_id = 'venue-media' 
    AND name = image_path;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- UPDATE VENUE PROFILES TABLE FOR BETTER IMAGE HANDLING
-- =============================================================================

-- Add columns for storing image metadata
ALTER TABLE venue_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for image queries
CREATE INDEX IF NOT EXISTS idx_venue_profiles_avatar ON venue_profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_cover ON venue_profiles(cover_image_url);

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ VENUE STORAGE SETUP COMPLETE!';
  RAISE NOTICE '📁 Created storage buckets:';
  RAISE NOTICE '   - venue-media (public, 10MB, images only)';
  RAISE NOTICE '   - venue-documents (private, 50MB, docs only)';
  RAISE NOTICE '🔒 Storage policies configured for security';
  RAISE NOTICE '🛠️ Helper functions created';
  RAISE NOTICE '📊 Database columns added for image URLs';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for file uploads!';
END $$; 