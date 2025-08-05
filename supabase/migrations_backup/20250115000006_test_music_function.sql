-- =============================================
-- Test Music Function Creation
-- =============================================
-- This is a simple test to isolate the function creation issue

-- Start transaction
BEGIN;

-- First, let's drop any existing views that might be calling the function
DROP VIEW IF EXISTS artist_music_with_stats CASCADE;
DROP VIEW IF EXISTS music_analytics CASCADE;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_music_with_stats(UUID);

-- Now create the function in isolation
CREATE OR REPLACE FUNCTION get_music_with_stats(music_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  genre TEXT,
  duration INTEGER,
  file_url TEXT,
  cover_art_url TEXT,
  is_public BOOLEAN,
  is_featured BOOLEAN,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  likes_count BIGINT,
  comments_count BIGINT,
  plays_count BIGINT,
  shares_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.id,
    am.title,
    am.description,
    am.type,
    am.genre,
    am.duration,
    am.file_url,
    am.cover_art_url,
    am.is_public,
    am.is_featured,
    am.tags,
    am.created_at,
    COALESCE(ml.likes_count, 0) as likes_count,
    COALESCE(mc.comments_count, 0) as comments_count,
    COALESCE(mp.plays_count, 0) as plays_count,
    COALESCE(ms.shares_count, 0) as shares_count
  FROM artist_music am
  LEFT JOIN (
    SELECT music_id, COUNT(*) as likes_count
    FROM music_likes
    GROUP BY music_id
  ) ml ON am.id = ml.music_id
  LEFT JOIN (
    SELECT music_id, COUNT(*) as comments_count
    FROM music_comments
    GROUP BY music_id
  ) mc ON am.id = mc.music_id
  LEFT JOIN (
    SELECT music_id, COUNT(*) as plays_count
    FROM music_plays
    GROUP BY music_id
  ) mp ON am.id = mp.music_id
  LEFT JOIN (
    SELECT music_id, COUNT(*) as shares_count
    FROM music_shares
    GROUP BY music_id
  ) ms ON am.id = ms.music_id
  WHERE am.id = music_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test that the function was created successfully
SELECT 'Function created successfully' as status;

-- Commit transaction
COMMIT; 