-- Fixed RSS Migration Script - Handles existing policies and tables
-- Run this script in your Supabase SQL Editor to set up RSS feed support

-- Create cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
CREATE INDEX IF NOT EXISTS idx_cache_updated_at ON cache(updated_at);

-- Enable RLS if not already enabled
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read cache" ON cache;
DROP POLICY IF EXISTS "Allow service role to manage cache" ON cache;

-- Create policies
CREATE POLICY "Allow authenticated users to read cache" ON cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage cache" ON cache
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments if they don't exist
COMMENT ON TABLE cache IS 'Cache table for storing RSS feed data and other cached content';
COMMENT ON COLUMN cache.key IS 'Unique cache key identifier';
COMMENT ON COLUMN cache.data IS 'Cached data as JSONB';
COMMENT ON COLUMN cache.updated_at IS 'Last update timestamp for cache invalidation';

-- Insert sample cache entries (ignore conflicts)
INSERT INTO cache (key, data) VALUES 
  ('rss_news_all_all', '[]'::jsonb),
  ('rss_news_music-industry_all', '[]'::jsonb),
  ('rss_news_music-culture_all', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Verify the setup
SELECT 
  'Cache table created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'cache';

-- Show table structure
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cache' 
ORDER BY ordinal_position;

-- Show policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'cache'; 