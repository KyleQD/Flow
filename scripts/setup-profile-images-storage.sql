-- Setup Profile Images Storage
-- This script creates the storage bucket and policies for profile images

-- Create the storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  4194304, -- 4MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy for users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for public read access to profile images
CREATE POLICY "Public read access to profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Add header_url column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'header_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN header_url TEXT;
        RAISE NOTICE 'Added header_url column to profiles table';
    ELSE
        RAISE NOTICE 'header_url column already exists';
    END IF;
END $$;

-- Add comment to header_url column
COMMENT ON COLUMN profiles.header_url IS 'URL to the user''s profile header image'; 