-- =============================================
-- Music System Migration (Fixed - Unique Timestamp)
-- =============================================
-- This migration creates the complete music upload and sharing system
-- Created with unique timestamp to avoid conflicts

-- Start transaction
BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ARTIST MUSIC TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS artist_music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('single', 'album', 'ep', 'mixtape')),
  genre TEXT,
  release_date DATE,
  duration INTEGER, -- in seconds
  file_url TEXT,
  cover_art_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,
  lyrics TEXT,
  credits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- BPM, key, etc.
  stats JSONB DEFAULT '{
    "plays": 0,
    "likes": 0,
    "downloads": 0,
    "shares": 0,
    "comments": 0
  }',
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- MUSIC LIKES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS music_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(music_id, user_id)
);

-- =============================================
-- MUSIC COMMENTS TABLE
-- =============================================

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

-- =============================================
-- MUSIC COMMENT LIKES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS music_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES music_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- MUSIC SHARES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS music_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_to TEXT, -- 'timeline', 'story', 'message', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- MUSIC PLAYS TRACKING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS music_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  music_id UUID REFERENCES artist_music(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE artist_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_plays ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Artist Music policies
CREATE POLICY "Anyone can view public music" ON artist_music
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can view their own music" ON artist_music
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their own music" ON artist_music
  FOR ALL USING (auth.uid() = user_id);

-- Music Likes policies
CREATE POLICY "Anyone can view music likes" ON music_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like music" ON music_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike music" ON music_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Music Comments policies
CREATE POLICY "Anyone can view music comments" ON music_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create music comments" ON music_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music comments" ON music_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music comments" ON music_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Music Comment Likes policies
CREATE POLICY "Anyone can view comment likes" ON music_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON music_comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments" ON music_comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Music Shares policies
CREATE POLICY "Anyone can view music shares" ON music_shares
  FOR SELECT USING (true);

CREATE POLICY "Users can share music" ON music_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Music Plays policies
CREATE POLICY "Anyone can record music plays" ON music_plays
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Artists can view their music plays" ON music_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM artist_music 
      WHERE artist_music.id = music_plays.music_id 
      AND artist_music.user_id = auth.uid()
    )
  );

-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

-- Function to update music likes count
CREATE OR REPLACE FUNCTION update_music_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artist_music
    SET stats = jsonb_set(stats, '{likes}', (COALESCE((stats->>'likes')::int, 0) + 1)::text::jsonb)
    WHERE id = NEW.music_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artist_music
    SET stats = jsonb_set(stats, '{likes}', GREATEST(COALESCE((stats->>'likes')::int, 0) - 1, 0)::text::jsonb)
    WHERE id = OLD.music_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update music comments count
CREATE OR REPLACE FUNCTION update_music_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artist_music
    SET stats = jsonb_set(stats, '{comments}', (COALESCE((stats->>'comments')::int, 0) + 1)::text::jsonb)
    WHERE id = NEW.music_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artist_music
    SET stats = jsonb_set(stats, '{comments}', GREATEST(COALESCE((stats->>'comments')::int, 0) - 1, 0)::text::jsonb)
    WHERE id = OLD.music_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update music plays count
CREATE OR REPLACE FUNCTION update_music_plays_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artist_music
  SET stats = jsonb_set(stats, '{plays}', (COALESCE((stats->>'plays')::int, 0) + 1)::text::jsonb)
  WHERE id = NEW.music_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_music_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE music_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE music_comments
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Music likes triggers
DROP TRIGGER IF EXISTS trigger_update_music_likes_count ON music_likes;
CREATE TRIGGER trigger_update_music_likes_count
  AFTER INSERT OR DELETE ON music_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_music_likes_count();

-- Music comments triggers
DROP TRIGGER IF EXISTS trigger_update_music_comments_count ON music_comments;
CREATE TRIGGER trigger_update_music_comments_count
  AFTER INSERT OR DELETE ON music_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_music_comments_count();

-- Music plays triggers
DROP TRIGGER IF EXISTS trigger_update_music_plays_count ON music_plays;
CREATE TRIGGER trigger_update_music_plays_count
  AFTER INSERT ON music_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_music_plays_count();

-- Comment likes triggers
DROP TRIGGER IF EXISTS trigger_update_music_comment_likes_count ON music_comment_likes;
CREATE TRIGGER trigger_update_music_comment_likes_count
  AFTER INSERT OR DELETE ON music_comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_music_comment_likes_count();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Artist music indexes
CREATE INDEX IF NOT EXISTS idx_artist_music_user_id ON artist_music(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_music_artist_profile_id ON artist_music(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_music_type ON artist_music(type);
CREATE INDEX IF NOT EXISTS idx_artist_music_public ON artist_music(is_public);
CREATE INDEX IF NOT EXISTS idx_artist_music_featured ON artist_music(is_featured);
CREATE INDEX IF NOT EXISTS idx_artist_music_release_date ON artist_music(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_artist_music_created_at ON artist_music(created_at DESC);

-- Music likes indexes
CREATE INDEX IF NOT EXISTS idx_music_likes_music_id ON music_likes(music_id);
CREATE INDEX IF NOT EXISTS idx_music_likes_user_id ON music_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_music_likes_created_at ON music_likes(created_at DESC);

-- Music comments indexes
CREATE INDEX IF NOT EXISTS idx_music_comments_music_id ON music_comments(music_id);
CREATE INDEX IF NOT EXISTS idx_music_comments_user_id ON music_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_music_comments_parent_id ON music_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_music_comments_created_at ON music_comments(created_at DESC);

-- Music comment likes indexes
CREATE INDEX IF NOT EXISTS idx_music_comment_likes_comment_id ON music_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_music_comment_likes_user_id ON music_comment_likes(user_id);

-- Music shares indexes
CREATE INDEX IF NOT EXISTS idx_music_shares_music_id ON music_shares(music_id);
CREATE INDEX IF NOT EXISTS idx_music_shares_user_id ON music_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_music_shares_created_at ON music_shares(created_at DESC);

-- Music plays indexes
CREATE INDEX IF NOT EXISTS idx_music_plays_music_id ON music_plays(music_id);
CREATE INDEX IF NOT EXISTS idx_music_plays_user_id ON music_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_music_plays_played_at ON music_plays(played_at DESC);

-- =============================================
-- HELPER FUNCTIONS (SIMPLE AND ROBUST)
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

-- Function to get all music with stats for a user
CREATE OR REPLACE FUNCTION get_user_music_with_stats(user_uuid UUID)
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
  WHERE am.user_id = user_uuid
  ORDER BY am.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get featured music with stats
CREATE OR REPLACE FUNCTION get_featured_music_with_stats(limit_count INTEGER DEFAULT 10)
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
  WHERE am.is_public = true AND am.is_featured = true
  ORDER BY (COALESCE(ml.likes_count, 0) + COALESCE(mp.plays_count, 0)) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a music play with duplicate prevention
CREATE OR REPLACE FUNCTION record_music_play(
  music_uuid UUID,
  user_uuid UUID DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  user_agent_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  play_exists BOOLEAN;
BEGIN
  -- Check if this play already exists (within 1 hour for same user/IP)
  SELECT EXISTS(
    SELECT 1 FROM music_plays 
    WHERE music_id = music_uuid 
    AND (
      (user_id = user_uuid AND user_uuid IS NOT NULL) OR
      (ip_address = ip_addr AND ip_addr IS NOT NULL)
    )
    AND played_at > NOW() - INTERVAL '1 hour'
  ) INTO play_exists;

  -- Only record if it's a new play
  IF NOT play_exists THEN
    INSERT INTO music_plays (music_id, user_id, ip_address, user_agent)
    VALUES (music_uuid, user_uuid, ip_addr, user_agent_text);
    RETURN TRUE;
  END IF;

  RETURN FALSE;
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

-- =============================================
-- VIEWS (CREATED AFTER ALL FUNCTIONS)
-- =============================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS artist_music_with_stats;
DROP VIEW IF EXISTS music_analytics;

-- Create enhanced view for all music with stats
CREATE OR REPLACE VIEW artist_music_with_stats AS
SELECT
  am.id,
  am.user_id,
  am.artist_profile_id,
  am.title,
  am.description,
  am.type,
  am.genre,
  am.release_date,
  am.duration,
  am.file_url,
  am.cover_art_url,
  am.spotify_url,
  am.apple_music_url,
  am.soundcloud_url,
  am.youtube_url,
  am.lyrics,
  am.credits,
  am.metadata,
  am.stats,
  am.is_public,
  am.is_featured,
  am.tags,
  am.created_at,
  am.updated_at,
  COALESCE(ml.likes_count, 0) as likes_count,
  COALESCE(mc.comments_count, 0) as comments_count,
  COALESCE(mp.plays_count, 0) as plays_count,
  COALESCE(ms.shares_count, 0) as shares_count,
  -- Calculate engagement score
  (COALESCE(ml.likes_count, 0) * 2 + COALESCE(mp.plays_count, 0) + COALESCE(ms.shares_count, 0) * 3) as engagement_score
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

-- View for music analytics
CREATE OR REPLACE VIEW music_analytics AS
SELECT
  am.id as music_id,
  am.title,
  am.user_id,
  am.type,
  am.genre,
  am.release_date,
  am.created_at,
  -- Engagement metrics
  COALESCE(ml.likes_count, 0) as total_likes,
  COALESCE(mc.comments_count, 0) as total_comments,
  COALESCE(mp.plays_count, 0) as total_plays,
  COALESCE(ms.shares_count, 0) as total_shares,
  -- Engagement rates
  CASE 
    WHEN COALESCE(mp.plays_count, 0) > 0 
    THEN ROUND((COALESCE(ml.likes_count, 0)::DECIMAL / mp.plays_count) * 100, 2)
    ELSE 0 
  END as like_rate_percent,
  CASE 
    WHEN COALESCE(mp.plays_count, 0) > 0 
    THEN ROUND((COALESCE(ms.shares_count, 0)::DECIMAL / mp.plays_count) * 100, 2)
    ELSE 0 
  END as share_rate_percent,
  -- Time-based metrics
  EXTRACT(EPOCH FROM (NOW() - am.created_at)) / 86400 as days_since_release
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
WHERE am.is_public = true;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE artist_music IS 'Music tracks uploaded by artists';
COMMENT ON TABLE music_likes IS 'Likes on music tracks';
COMMENT ON TABLE music_comments IS 'Comments on music tracks';
COMMENT ON TABLE music_comment_likes IS 'Likes on music comments';
COMMENT ON TABLE music_shares IS 'Shares of music tracks';
COMMENT ON TABLE music_plays IS 'Play tracking for music analytics';

COMMENT ON FUNCTION update_music_likes_count() IS 'Automatically updates music likes count when likes are added/removed';
COMMENT ON FUNCTION update_music_comments_count() IS 'Automatically updates music comments count when comments are added/removed';
COMMENT ON FUNCTION update_music_plays_count() IS 'Automatically updates music plays count when plays are recorded';
COMMENT ON FUNCTION update_music_comment_likes_count() IS 'Automatically updates comment likes count when comment likes are added/removed';
COMMENT ON FUNCTION get_music_with_stats() IS 'Returns music track with aggregated engagement statistics';
COMMENT ON FUNCTION get_user_music_with_stats() IS 'Returns all music for a specific user with engagement statistics';
COMMENT ON FUNCTION get_featured_music_with_stats() IS 'Returns featured music tracks with engagement statistics';
COMMENT ON FUNCTION record_music_play() IS 'Records a music play with duplicate prevention';
COMMENT ON FUNCTION toggle_music_like() IS 'Toggles a music like for a user';

COMMENT ON VIEW artist_music_with_stats IS 'Enhanced view of all music with engagement statistics and scores';
COMMENT ON VIEW music_analytics IS 'Analytics view for music performance and engagement metrics';

-- Commit transaction
COMMIT; 