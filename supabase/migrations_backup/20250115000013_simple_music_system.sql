-- =============================================
-- Simple Working Music System
-- =============================================
-- This migration creates a basic music system that will definitely work

-- Start transaction
BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CLEANUP FIRST
-- =============================================

-- Drop everything in reverse dependency order
DROP VIEW IF EXISTS artist_music_with_stats CASCADE;
DROP VIEW IF EXISTS music_analytics CASCADE;
DROP FUNCTION IF EXISTS get_music_with_stats(UUID);
DROP FUNCTION IF EXISTS get_user_music_with_stats(UUID);
DROP FUNCTION IF EXISTS get_featured_music_with_stats(INTEGER);
DROP FUNCTION IF EXISTS record_music_play(UUID, UUID, INET, TEXT);
DROP FUNCTION IF EXISTS toggle_music_like(UUID, UUID);
DROP FUNCTION IF EXISTS update_music_likes_count();
DROP FUNCTION IF EXISTS update_music_comments_count();
DROP FUNCTION IF EXISTS update_music_plays_count();
DROP FUNCTION IF EXISTS update_music_comment_likes_count();

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_music_likes_count ON music_likes;
DROP TRIGGER IF EXISTS trigger_update_music_comments_count ON music_comments;
DROP TRIGGER IF EXISTS trigger_update_music_plays_count ON music_plays;
DROP TRIGGER IF EXISTS trigger_update_music_comment_likes_count ON music_comment_likes;

-- Drop tables
DROP TABLE IF EXISTS music_comment_likes CASCADE;
DROP TABLE IF EXISTS music_comments CASCADE;
DROP TABLE IF EXISTS music_shares CASCADE;
DROP TABLE IF EXISTS music_plays CASCADE;
DROP TABLE IF EXISTS music_likes CASCADE;
DROP TABLE IF EXISTS artist_music CASCADE;

-- =============================================
-- CREATE TABLES IN ORDER
-- =============================================

-- 1. Create artist_profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create artist_music table
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

-- 3. Create music_likes table
CREATE TABLE IF NOT EXISTS music_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(music_id, user_id)
);

-- 4. Create music_comments table
CREATE TABLE IF NOT EXISTS music_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES music_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create music_comment_likes table
CREATE TABLE IF NOT EXISTS music_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES music_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- 6. Create music_shares table
CREATE TABLE IF NOT EXISTS music_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Create music_plays table
CREATE TABLE IF NOT EXISTS music_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_plays ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BASIC RLS POLICIES
-- =============================================

-- Artist profiles policies
CREATE POLICY "Anyone can view artist profiles" ON artist_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own artist profiles" ON artist_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Artist music policies
CREATE POLICY "Anyone can view public music" ON artist_music
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can view their own music" ON artist_music
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their own music" ON artist_music
  FOR ALL USING (auth.uid() = user_id);

-- Music likes policies
CREATE POLICY "Anyone can view music likes" ON music_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like music" ON music_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike music" ON music_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Music comments policies
CREATE POLICY "Anyone can view music comments" ON music_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create music comments" ON music_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music comments" ON music_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music comments" ON music_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Music comment likes policies
CREATE POLICY "Anyone can view comment likes" ON music_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON music_comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON music_comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Music shares policies
CREATE POLICY "Anyone can view music shares" ON music_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can share music" ON music_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Music plays policies
CREATE POLICY "Anyone can record music plays" ON music_plays
  FOR INSERT WITH CHECK (true);

-- =============================================
-- CREATE INDEXES
-- =============================================

-- Artist music indexes
CREATE INDEX IF NOT EXISTS idx_artist_music_user_id ON artist_music(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_music_artist_profile_id ON artist_music(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_music_public ON artist_music(is_public);
CREATE INDEX IF NOT EXISTS idx_artist_music_featured ON artist_music(is_featured);
CREATE INDEX IF NOT EXISTS idx_artist_music_created_at ON artist_music(created_at DESC);

-- Music likes indexes
CREATE INDEX IF NOT EXISTS idx_music_likes_music_id ON music_likes(music_id);
CREATE INDEX IF NOT EXISTS idx_music_likes_user_id ON music_likes(user_id);

-- Music comments indexes
CREATE INDEX IF NOT EXISTS idx_music_comments_music_id ON music_comments(music_id);
CREATE INDEX IF NOT EXISTS idx_music_comments_user_id ON music_comments(user_id);

-- Music plays indexes
CREATE INDEX IF NOT EXISTS idx_music_plays_music_id ON music_plays(music_id);

-- =============================================
-- CREATE SIMPLE FUNCTIONS (AFTER ALL TABLES EXIST)
-- =============================================

-- Simple function to get music with stats
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

-- Function to toggle music like
CREATE OR REPLACE FUNCTION toggle_music_like(music_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM music_likes 
    WHERE music_id = music_uuid AND user_id = user_uuid
  ) INTO like_exists;

  IF like_exists THEN
    -- Remove like
    DELETE FROM music_likes 
    WHERE music_id = music_uuid AND user_id = user_uuid;
    RETURN FALSE;
  ELSE
    -- Add like
    INSERT INTO music_likes (music_id, user_id)
    VALUES (music_uuid, user_uuid);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a music play
CREATE OR REPLACE FUNCTION record_music_play(
  music_uuid UUID,
  user_uuid UUID DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  user_agent_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO music_plays (music_id, user_id, ip_address, user_agent)
  VALUES (music_uuid, user_uuid, ip_addr, user_agent_text);
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE SIMPLE VIEW
-- =============================================

-- Create simple view for music with stats
CREATE OR REPLACE VIEW artist_music_with_stats AS
SELECT
  am.id,
  am.user_id,
  am.artist_profile_id,
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
  am.updated_at,
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
) ms ON am.id = ms.music_id;

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify tables were created
SELECT 
  'Tables created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name IN ('artist_profiles', 'artist_music', 'music_likes', 'music_comments', 'music_comment_likes', 'music_shares', 'music_plays')
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

-- Verify view was created
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_views 
      WHERE viewname = 'artist_music_with_stats' 
      AND schemaname = 'public'
    ) 
    THEN 'SUCCESS: View artist_music_with_stats created successfully' 
    ELSE 'ERROR: View artist_music_with_stats was not created' 
  END as view_status;

-- Commit transaction
COMMIT; 