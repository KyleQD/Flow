-- Manual RSS Cache Population Script
-- Run this to force-populate RSS feeds and clear stale cache

-- Clear existing RSS cache entries
DELETE FROM cache WHERE key LIKE 'rss_news_%';

-- Insert fresh cache entries with empty data (will be populated by API)
INSERT INTO cache (key, data, updated_at) VALUES 
  ('rss_news_all_all', '[]'::jsonb, NOW() - INTERVAL '10 minutes'),
  ('rss_news_music-industry_all', '[]'::jsonb, NOW() - INTERVAL '10 minutes'),
  ('rss_news_music-culture_all', '[]'::jsonb, NOW() - INTERVAL '10 minutes')
ON CONFLICT (key) DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = EXCLUDED.updated_at;

-- Verify cache entries
SELECT 
  key,
  jsonb_array_length(data) as item_count,
  updated_at
FROM cache 
WHERE key LIKE 'rss_news_%'
ORDER BY key;

-- Show cache table status
SELECT 
  'Cache Status' as status,
  COUNT(*) as total_entries,
  COUNT(CASE WHEN key LIKE 'rss_news_%' THEN 1 END) as rss_entries
FROM cache; 