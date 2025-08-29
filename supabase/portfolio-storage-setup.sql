-- =============================================
-- Portfolio Storage Setup
-- =============================================
-- This script sets up the portfolio storage bucket for user portfolio content
-- Run this in your Supabase SQL Editor

-- Create portfolio storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  104857600, -- 100MB limit for videos
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/m4a', 'audio/ogg']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- RLS Policies for Portfolio Storage Bucket
-- =============================================

-- Portfolio files are publicly accessible
DROP POLICY IF EXISTS "Portfolio files are publicly accessible" ON storage.objects;
CREATE POLICY "Portfolio files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

-- Users can upload to their own portfolio folder
DROP POLICY IF EXISTS "Users can upload to their own portfolio folder" ON storage.objects;
CREATE POLICY "Users can upload to their own portfolio folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own portfolio files
DROP POLICY IF EXISTS "Users can update their own portfolio files" ON storage.objects;
CREATE POLICY "Users can update their own portfolio files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own portfolio files
DROP POLICY IF EXISTS "Users can delete their own portfolio files" ON storage.objects;
CREATE POLICY "Users can delete their own portfolio files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- Portfolio Items Table Setup (if not exists)
-- =============================================

-- Create portfolio_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'music', 'video', 'merch', 'link', 'text')),
  title TEXT NOT NULL,
  description TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on portfolio_items
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for portfolio_items
DROP POLICY IF EXISTS "Users can view all portfolio items" ON portfolio_items;
CREATE POLICY "Users can view all portfolio items" ON portfolio_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON portfolio_items;
CREATE POLICY "Users can insert their own portfolio items" ON portfolio_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own portfolio items" ON portfolio_items;
CREATE POLICY "Users can update their own portfolio items" ON portfolio_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;
CREATE POLICY "Users can delete their own portfolio items" ON portfolio_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_type ON portfolio_items(type);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
