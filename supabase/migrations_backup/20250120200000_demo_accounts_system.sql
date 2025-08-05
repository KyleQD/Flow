-- Demo Accounts System Migration
-- Creates full backend support for demo accounts with social features

-- Create demo_profiles table (extends existing profiles)
CREATE TABLE IF NOT EXISTS demo_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('general', 'artist', 'venue')),
  profile_data JSONB NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  cover_image TEXT,
  verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"followers": 0, "following": 0, "posts": 0, "likes": 0, "views": 0}',
  is_demo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demo_posts table
CREATE TABLE IF NOT EXISTS demo_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'audio', 'event')),
  metadata JSONB DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demo_follows table
CREATE TABLE IF NOT EXISTS demo_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create demo_likes table
CREATE TABLE IF NOT EXISTS demo_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES demo_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, post_id)
);

-- Create demo_comments table
CREATE TABLE IF NOT EXISTS demo_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES demo_posts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demo_events table for venues and artists
CREATE TABLE IF NOT EXISTS demo_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_time TIME,
  venue_name TEXT,
  location TEXT,
  ticket_price TEXT,
  tickets_available INTEGER,
  genre TEXT,
  image_url TEXT,
  ticket_link TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demo_music_releases table for artists
CREATE TABLE IF NOT EXISTS demo_music_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_type TEXT CHECK (release_type IN ('single', 'ep', 'album')),
  release_date DATE,
  tracks INTEGER,
  duration TEXT,
  artwork_url TEXT,
  streams INTEGER DEFAULT 0,
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create demo_messages table
CREATE TABLE IF NOT EXISTS demo_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES demo_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_profiles_username ON demo_profiles(username);
CREATE INDEX IF NOT EXISTS idx_demo_profiles_account_type ON demo_profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_demo_profiles_location ON demo_profiles(location);
CREATE INDEX IF NOT EXISTS idx_demo_posts_profile_id ON demo_posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_demo_posts_created_at ON demo_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_follows_follower ON demo_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_demo_follows_following ON demo_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_demo_likes_post_id ON demo_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_demo_events_profile_id ON demo_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_demo_events_date ON demo_events(event_date);
CREATE INDEX IF NOT EXISTS idx_demo_music_profile_id ON demo_music_releases(profile_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_demo_profiles_search ON demo_profiles USING gin(
  to_tsvector('english', 
    COALESCE(username, '') || ' ' || 
    COALESCE(bio, '') || ' ' || 
    COALESCE(location, '') || ' ' ||
    COALESCE(profile_data->>'name', '') || ' ' ||
    COALESCE(profile_data->>'artist_name', '') || ' ' ||
    COALESCE(profile_data->>'venue_name', '')
  )
);

-- Enable RLS (Row Level Security)
ALTER TABLE demo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Allow public read for demo accounts)
CREATE POLICY "Demo profiles are publicly viewable" ON demo_profiles
  FOR SELECT USING (is_demo = true);

CREATE POLICY "Demo posts are publicly viewable" ON demo_posts
  FOR SELECT USING (true);

CREATE POLICY "Demo follows are publicly viewable" ON demo_follows
  FOR SELECT USING (true);

CREATE POLICY "Demo likes are publicly viewable" ON demo_likes
  FOR SELECT USING (true);

CREATE POLICY "Demo comments are publicly viewable" ON demo_comments
  FOR SELECT USING (true);

CREATE POLICY "Demo events are publicly viewable" ON demo_events
  FOR SELECT USING (true);

CREATE POLICY "Demo music releases are publicly viewable" ON demo_music_releases
  FOR SELECT USING (true);

-- Users can interact with demo accounts if authenticated
CREATE POLICY "Authenticated users can follow demo profiles" ON demo_follows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can like demo posts" ON demo_likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can comment on demo posts" ON demo_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions to update stats
CREATE OR REPLACE FUNCTION update_demo_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower count
    IF TG_TABLE_NAME = 'demo_follows' THEN
      UPDATE demo_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        ((stats->>'followers')::int + 1)::text::jsonb
      )
      WHERE id = NEW.following_id;
      
      UPDATE demo_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        ((stats->>'following')::int + 1)::text::jsonb
      )
      WHERE id = NEW.follower_id;
    END IF;
    
    -- Update likes count
    IF TG_TABLE_NAME = 'demo_likes' THEN
      UPDATE demo_posts 
      SET likes_count = likes_count + 1
      WHERE id = NEW.post_id;
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'demo_comments' THEN
      UPDATE demo_posts 
      SET comments_count = comments_count + 1
      WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    -- Update follower count
    IF TG_TABLE_NAME = 'demo_follows' THEN
      UPDATE demo_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        GREATEST(((stats->>'followers')::int - 1), 0)::text::jsonb
      )
      WHERE id = OLD.following_id;
      
      UPDATE demo_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        GREATEST(((stats->>'following')::int - 1), 0)::text::jsonb
      )
      WHERE id = OLD.follower_id;
    END IF;
    
    -- Update likes count
    IF TG_TABLE_NAME = 'demo_likes' THEN
      UPDATE demo_posts 
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'demo_comments' THEN
      UPDATE demo_posts 
      SET comments_count = GREATEST(comments_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER demo_follows_stats_trigger
  AFTER INSERT OR DELETE ON demo_follows
  FOR EACH ROW EXECUTE FUNCTION update_demo_profile_stats();

CREATE TRIGGER demo_likes_stats_trigger
  AFTER INSERT OR DELETE ON demo_likes
  FOR EACH ROW EXECUTE FUNCTION update_demo_profile_stats();

CREATE TRIGGER demo_comments_stats_trigger
  AFTER INSERT OR DELETE ON demo_comments
  FOR EACH ROW EXECUTE FUNCTION update_demo_profile_stats();

-- Function to search demo profiles
CREATE OR REPLACE FUNCTION search_demo_profiles(
  search_query TEXT DEFAULT '',
  account_type_filter TEXT DEFAULT NULL,
  location_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  account_type TEXT,
  profile_data JSONB,
  avatar_url TEXT,
  cover_image TEXT,
  verified BOOLEAN,
  bio TEXT,
  location TEXT,
  social_links JSONB,
  stats JSONB,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.username,
    dp.account_type,
    dp.profile_data,
    dp.avatar_url,
    dp.cover_image,
    dp.verified,
    dp.bio,
    dp.location,
    dp.social_links,
    dp.stats,
    dp.created_at,
    CASE 
      WHEN search_query = '' THEN 1.0
      ELSE ts_rank(
        to_tsvector('english', 
          COALESCE(dp.username, '') || ' ' || 
          COALESCE(dp.bio, '') || ' ' || 
          COALESCE(dp.location, '') || ' ' ||
          COALESCE(dp.profile_data->>'name', '') || ' ' ||
          COALESCE(dp.profile_data->>'artist_name', '') || ' ' ||
          COALESCE(dp.profile_data->>'venue_name', '')
        ),
        plainto_tsquery('english', search_query)
      )
    END as rank
  FROM demo_profiles dp
  WHERE 
    dp.is_demo = true
    AND (
      search_query = '' 
      OR to_tsvector('english', 
        COALESCE(dp.username, '') || ' ' || 
        COALESCE(dp.bio, '') || ' ' || 
        COALESCE(dp.location, '') || ' ' ||
        COALESCE(dp.profile_data->>'name', '') || ' ' ||
        COALESCE(dp.profile_data->>'artist_name', '') || ' ' ||
        COALESCE(dp.profile_data->>'venue_name', '')
      ) @@ plainto_tsquery('english', search_query)
    )
    AND (account_type_filter IS NULL OR dp.account_type = account_type_filter)
    AND (location_filter IS NULL OR dp.location ILIKE '%' || location_filter || '%')
  ORDER BY 
    CASE WHEN search_query = '' THEN dp.created_at END DESC,
    CASE WHEN search_query != '' THEN rank END DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 