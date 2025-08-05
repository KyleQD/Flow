-- =============================================
-- Isolated Music System Test
-- =============================================
-- This is a minimal test to isolate the function creation issue

-- Start transaction
BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CLEANUP EVERYTHING FIRST
-- =============================================

-- Drop all music-related objects
DROP VIEW IF EXISTS artist_music_with_stats CASCADE;
DROP VIEW IF EXISTS music_analytics CASCADE;

-- Drop all music functions
DROP FUNCTION IF EXISTS get_music_with_stats(UUID);
DROP FUNCTION IF EXISTS get_user_music_with_stats(UUID);
DROP FUNCTION IF EXISTS get_featured_music_with_stats(INTEGER);
DROP FUNCTION IF EXISTS record_music_play(UUID, UUID, INET, TEXT);
DROP FUNCTION IF EXISTS toggle_music_like(UUID, UUID);
DROP FUNCTION IF EXISTS update_music_likes_count();
DROP FUNCTION IF EXISTS update_music_comments_count();
DROP FUNCTION IF EXISTS update_music_plays_count();
DROP FUNCTION IF EXISTS update_music_comment_likes_count();

-- Drop all music triggers
DROP TRIGGER IF EXISTS trigger_update_music_likes_count ON music_likes;
DROP TRIGGER IF EXISTS trigger_update_music_comments_count ON music_comments;
DROP TRIGGER IF EXISTS trigger_update_music_plays_count ON music_plays;
DROP TRIGGER IF EXISTS trigger_update_music_comment_likes_count ON music_comment_likes;

-- Drop all music tables
DROP TABLE IF EXISTS music_comment_likes CASCADE;
DROP TABLE IF EXISTS music_comments CASCADE;
DROP TABLE IF EXISTS music_shares CASCADE;
DROP TABLE IF EXISTS music_plays CASCADE;
DROP TABLE IF EXISTS music_likes CASCADE;
DROP TABLE IF EXISTS artist_music CASCADE;

-- =============================================
-- CREATE MINIMAL TABLES
-- =============================================

-- Create basic artist_profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create minimal artist_music table
CREATE TABLE IF NOT EXISTS artist_music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('single', 'album', 'ep', 'mixtape')),
  genre TEXT,
  duration INTEGER,
  file_url TEXT,
  cover_art_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create minimal music_likes table
CREATE TABLE IF NOT EXISTS music_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(music_id, user_id)
);

-- =============================================
-- CREATE FUNCTION IN ISOLATION (AFTER ALL TABLES EXIST)
-- =============================================

-- Create the function with minimal dependencies
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
    0 as comments_count,
    0 as plays_count,
    0 as shares_count
  FROM artist_music am
  LEFT JOIN (
    SELECT music_id, COUNT(*) as likes_count
    FROM music_likes
    GROUP BY music_id
  ) ml ON am.id = ml.music_id
  WHERE am.id = music_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify tables were created
SELECT 
  'Tables created:' as info,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name IN ('artist_profiles', 'artist_music', 'music_likes')
AND table_schema = 'public';

-- Verify function was created
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE p.proname = 'get_music_with_stats' 
      AND n.nspname = 'public'
    ) 
    THEN 'SUCCESS: Function get_music_with_stats created successfully' 
    ELSE 'ERROR: Function get_music_with_stats was not created' 
  END as function_status;

-- Test the function with a simple query
SELECT 
  'Function test:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE p.proname = 'get_music_with_stats' 
      AND n.nspname = 'public'
    ) 
    THEN 'Function exists and can be called'
    ELSE 'Function does not exist'
  END as function_test;

-- Commit transaction
COMMIT; 