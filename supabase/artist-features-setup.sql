-- =============================================
-- Artist Features Database Setup
-- =============================================
-- This script creates all necessary tables for artist features
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Content Management Tables
-- =============================================

-- Music tracks and albums
CREATE TABLE IF NOT EXISTS artist_music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
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
    "shares": 0
  }',
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Videos
CREATE TABLE IF NOT EXISTS artist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('music_video', 'live_performance', 'interview', 'behind_scenes', 'other')),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  youtube_url TEXT,
  vimeo_url TEXT,
  duration INTEGER, -- in seconds
  resolution TEXT, -- e.g., '1080p', '4K'
  file_size BIGINT,
  stats JSONB DEFAULT '{
    "views": 0,
    "likes": 0,
    "comments": 0,
    "shares": 0
  }',
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Photo galleries
CREATE TABLE IF NOT EXISTS artist_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  category TEXT CHECK (category IN ('performance', 'studio', 'portrait', 'event', 'behind_scenes', 'other')),
  location TEXT,
  photographer TEXT,
  shot_date DATE,
  dimensions JSONB, -- {"width": 1920, "height": 1080}
  file_size BIGINT,
  stats JSONB DEFAULT '{
    "views": 0,
    "likes": 0,
    "downloads": 0
  }',
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog posts
CREATE TABLE IF NOT EXISTS artist_blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  stats JSONB DEFAULT '{
    "views": 0,
    "likes": 0,
    "comments": 0,
    "shares": 0
  }',
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Documents and press kit items
CREATE TABLE IF NOT EXISTS artist_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('press_release', 'biography', 'rider', 'contract', 'setlist', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size BIGINT,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Events and Performances
-- =============================================

CREATE TABLE IF NOT EXISTS artist_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('concert', 'festival', 'tour', 'recording', 'interview', 'other')),
  venue_name TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_country TEXT,
  venue_coordinates JSONB, -- {"lat": 40.7128, "lng": -74.0060}
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  doors_open TIME,
  ticket_url TEXT,
  ticket_price_min DECIMAL(10,2),
  ticket_price_max DECIMAL(10,2),
  capacity INTEGER,
  expected_attendance INTEGER,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled', 'postponed')),
  is_public BOOLEAN DEFAULT true,
  poster_url TEXT,
  setlist TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Merchandise and Store
-- =============================================

CREATE TABLE IF NOT EXISTS artist_merchandise (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('clothing', 'accessories', 'music', 'art', 'digital', 'other')),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  images TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '{}', -- sizes, colors, etc.
  inventory_count INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  is_digital BOOLEAN DEFAULT false,
  digital_file_url TEXT,
  shipping_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Analytics and Statistics
-- =============================================

CREATE TABLE IF NOT EXISTS artist_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  -- Sample metrics structure:
  -- {
  --   "profile_views": 0,
  --   "music_plays": 0,
  --   "video_views": 0,
  --   "photo_views": 0,
  --   "blog_views": 0,
  --   "followers_gained": 0,
  --   "engagement_rate": 0,
  --   "top_content": [],
  --   "geographic_data": {}
  -- }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(artist_profile_id, date)
);

-- =============================================
-- Collaborations and Features
-- =============================================

CREATE TABLE IF NOT EXISTS artist_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collaborator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('music', 'video', 'event', 'content', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  deliverables TEXT[],
  terms JSONB DEFAULT '{}',
  files_shared TEXT[] DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Fan Interactions and Community
-- =============================================

CREATE TABLE IF NOT EXISTS artist_fan_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fan_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('follow', 'like', 'comment', 'share', 'message', 'purchase')),
  content_type TEXT CHECK (content_type IN ('profile', 'music', 'video', 'photo', 'blog', 'event', 'merchandise')),
  content_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Enable Row Level Security
-- =============================================

ALTER TABLE artist_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_fan_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Music policies
CREATE POLICY "Public can view public music" ON artist_music
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can manage their own music" ON artist_music
  FOR ALL USING (auth.uid() = user_id);

-- Video policies
CREATE POLICY "Public can view public videos" ON artist_videos
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can manage their own videos" ON artist_videos
  FOR ALL USING (auth.uid() = user_id);

-- Photo policies
CREATE POLICY "Public can view public photos" ON artist_photos
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can manage their own photos" ON artist_photos
  FOR ALL USING (auth.uid() = user_id);

-- Blog policies
CREATE POLICY "Public can view published blog posts" ON artist_blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Artists can manage their own blog posts" ON artist_blog_posts
  FOR ALL USING (auth.uid() = user_id);

-- Document policies
CREATE POLICY "Public can view public documents" ON artist_documents
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can manage their own documents" ON artist_documents
  FOR ALL USING (auth.uid() = user_id);

-- Event policies
CREATE POLICY "Public can view public events" ON artist_events
  FOR SELECT USING (is_public = true);

CREATE POLICY "Artists can manage their own events" ON artist_events
  FOR ALL USING (auth.uid() = user_id);

-- Merchandise policies
CREATE POLICY "Public can view active merchandise" ON artist_merchandise
  FOR SELECT USING (is_active = true);

CREATE POLICY "Artists can manage their own merchandise" ON artist_merchandise
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies (private)
CREATE POLICY "Artists can view their own analytics" ON artist_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their own analytics" ON artist_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Collaboration policies
CREATE POLICY "Users can view their collaborations" ON artist_collaborations
  FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = collaborator_id);

CREATE POLICY "Users can manage their collaborations" ON artist_collaborations
  FOR ALL USING (auth.uid() = initiator_id OR auth.uid() = collaborator_id);

-- Fan interaction policies
CREATE POLICY "Users can view public interactions" ON artist_fan_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create interactions" ON artist_fan_interactions
  FOR INSERT WITH CHECK (auth.uid() = fan_id OR auth.uid() = artist_id);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Music indexes
CREATE INDEX IF NOT EXISTS idx_artist_music_user_id ON artist_music(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_music_artist_id ON artist_music(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_music_type ON artist_music(type);
CREATE INDEX IF NOT EXISTS idx_artist_music_public ON artist_music(is_public);
CREATE INDEX IF NOT EXISTS idx_artist_music_featured ON artist_music(is_featured);
CREATE INDEX IF NOT EXISTS idx_artist_music_release_date ON artist_music(release_date DESC);

-- Video indexes
CREATE INDEX IF NOT EXISTS idx_artist_videos_user_id ON artist_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_videos_artist_id ON artist_videos(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_videos_type ON artist_videos(type);
CREATE INDEX IF NOT EXISTS idx_artist_videos_public ON artist_videos(is_public);

-- Photo indexes
CREATE INDEX IF NOT EXISTS idx_artist_photos_user_id ON artist_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_photos_artist_id ON artist_photos(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_photos_category ON artist_photos(category);
CREATE INDEX IF NOT EXISTS idx_artist_photos_public ON artist_photos(is_public);

-- Blog indexes
CREATE INDEX IF NOT EXISTS idx_artist_blog_user_id ON artist_blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_blog_artist_id ON artist_blog_posts(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_blog_slug ON artist_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_artist_blog_status ON artist_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_artist_blog_published ON artist_blog_posts(published_at DESC);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_artist_events_user_id ON artist_events(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_events_artist_id ON artist_events(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_events_date ON artist_events(event_date);
CREATE INDEX IF NOT EXISTS idx_artist_events_status ON artist_events(status);
CREATE INDEX IF NOT EXISTS idx_artist_events_city ON artist_events(venue_city);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_artist_analytics_user_id ON artist_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_analytics_artist_id ON artist_analytics(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_artist_analytics_date ON artist_analytics(date DESC);

-- Fan interaction indexes
CREATE INDEX IF NOT EXISTS idx_fan_interactions_artist ON artist_fan_interactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_fan_interactions_fan ON artist_fan_interactions(fan_id);
CREATE INDEX IF NOT EXISTS idx_fan_interactions_type ON artist_fan_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_fan_interactions_content ON artist_fan_interactions(content_type, content_id);

-- =============================================
-- Update Triggers
-- =============================================

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all new tables
CREATE TRIGGER update_artist_music_updated_at
  BEFORE UPDATE ON artist_music
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_videos_updated_at
  BEFORE UPDATE ON artist_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_photos_updated_at
  BEFORE UPDATE ON artist_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_blog_posts_updated_at
  BEFORE UPDATE ON artist_blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_documents_updated_at
  BEFORE UPDATE ON artist_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_events_updated_at
  BEFORE UPDATE ON artist_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_merchandise_updated_at
  BEFORE UPDATE ON artist_merchandise
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_collaborations_updated_at
  BEFORE UPDATE ON artist_collaborations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get artist content stats
CREATE OR REPLACE FUNCTION get_artist_content_stats(artist_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'music_count', (SELECT COUNT(*) FROM artist_music WHERE user_id = artist_user_id AND is_public = true),
    'video_count', (SELECT COUNT(*) FROM artist_videos WHERE user_id = artist_user_id AND is_public = true),
    'photo_count', (SELECT COUNT(*) FROM artist_photos WHERE user_id = artist_user_id AND is_public = true),
    'blog_count', (SELECT COUNT(*) FROM artist_blog_posts WHERE user_id = artist_user_id AND status = 'published'),
    'event_count', (SELECT COUNT(*) FROM artist_events WHERE user_id = artist_user_id AND is_public = true),
    'merchandise_count', (SELECT COUNT(*) FROM artist_merchandise WHERE user_id = artist_user_id AND is_active = true),
    'total_plays', (SELECT COALESCE(SUM((stats->>'plays')::int), 0) FROM artist_music WHERE user_id = artist_user_id),
    'total_views', (SELECT COALESCE(SUM((stats->>'views')::int), 0) FROM artist_videos WHERE user_id = artist_user_id)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update artist profile stats
CREATE OR REPLACE FUNCTION update_artist_profile_stats(artist_user_id UUID)
RETURNS VOID AS $$
DECLARE
  new_stats JSONB;
BEGIN
  -- Get current stats
  SELECT get_artist_content_stats(artist_user_id) INTO new_stats;
  
  -- Update artist profile with new stats
  UPDATE artist_profiles 
  SET settings = settings || jsonb_build_object('content_stats', new_stats),
      updated_at = NOW()
  WHERE user_id = artist_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Success Message
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Artist Features Database Setup Complete!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - artist_music (tracks, albums, singles)';
  RAISE NOTICE '  - artist_videos (music videos, performances)';
  RAISE NOTICE '  - artist_photos (galleries, press photos)';
  RAISE NOTICE '  - artist_blog_posts (blog content)';
  RAISE NOTICE '  - artist_documents (press kit, contracts)';
  RAISE NOTICE '  - artist_events (concerts, performances)';
  RAISE NOTICE '  - artist_merchandise (store items)';
  RAISE NOTICE '  - artist_analytics (performance metrics)';
  RAISE NOTICE '  - artist_collaborations (partnerships)';
  RAISE NOTICE '  - artist_fan_interactions (engagement)';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  - Content management system';
  RAISE NOTICE '  - Event scheduling';
  RAISE NOTICE '  - Merchandise store';
  RAISE NOTICE '  - Analytics tracking';
  RAISE NOTICE '  - Collaboration tools';
  RAISE NOTICE '  - Fan engagement';
  RAISE NOTICE '';
  RAISE NOTICE 'All RLS policies configured for security';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'Ready for artist profile features!';
  RAISE NOTICE '=================================================';
END $$; 