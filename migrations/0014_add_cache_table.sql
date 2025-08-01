-- Create cache table for storing RSS feed data and other cached content
CREATE TABLE IF NOT EXISTS cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);

-- Create index on updated_at for cache invalidation
CREATE INDEX IF NOT EXISTS idx_cache_updated_at ON cache(updated_at);

-- Add RLS policies
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cache
CREATE POLICY "Allow authenticated users to read cache" ON cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage cache
CREATE POLICY "Allow service role to manage cache" ON cache
  FOR ALL USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE cache IS 'Cache table for storing RSS feed data and other cached content';
COMMENT ON COLUMN cache.key IS 'Unique cache key identifier';
COMMENT ON COLUMN cache.data IS 'Cached data as JSONB';
COMMENT ON COLUMN cache.updated_at IS 'Last update timestamp for cache invalidation'; 