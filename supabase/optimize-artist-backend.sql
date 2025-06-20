-- =============================================
-- Artist Backend Optimizations
-- =============================================
-- This script optimizes the backend for artist dashboard functionality
-- Includes messaging, activity tracking, real-time analytics, and performance enhancements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Activity Feed and Recent Activity
-- =============================================

CREATE TABLE IF NOT EXISTS artist_activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'track_uploaded', 'event_created', 'photo_uploaded', 'blog_published', 
    'collaboration_started', 'milestone_reached', 'fan_interaction', 
    'release_published', 'performance_completed', 'achievement_unlocked'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}', -- Store activity-specific data
  icon TEXT, -- Icon name for frontend
  color TEXT, -- Color scheme for frontend
  bg_color TEXT,
  border_color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming', 'cancelled')),
  is_public BOOLEAN DEFAULT true,
  related_content_type TEXT, -- 'music', 'event', 'photo', etc.
  related_content_id UUID, -- ID of related content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Messaging System for Artists
-- =============================================

CREATE TABLE IF NOT EXISTS artist_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  other_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  unread_count_artist INTEGER DEFAULT 0,
  unread_count_other INTEGER DEFAULT 0,
  is_archived_artist BOOLEAN DEFAULT false,
  is_archived_other BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(artist_id, other_user_id)
);

CREATE TABLE IF NOT EXISTS artist_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES artist_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'file', 'event_invite')),
  attachments JSONB DEFAULT '[]', -- Array of attachment objects
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Real-time Analytics Tables
-- =============================================

CREATE TABLE IF NOT EXISTS artist_daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  music_plays INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  photo_views INTEGER DEFAULT 0,
  blog_views INTEGER DEFAULT 0,
  new_followers INTEGER DEFAULT 0,
  lost_followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  collaboration_requests INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(artist_profile_id, date)
);

-- =============================================
-- Track Upload Enhanced Metadata
-- =============================================

-- Add additional columns to artist_music for better tracking
DO $$
BEGIN
  -- Add upload status tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_music' AND column_name = 'upload_status') THEN
    ALTER TABLE artist_music ADD COLUMN upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('uploading', 'processing', 'completed', 'failed'));
  END IF;
  
  -- Add file processing info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_music' AND column_name = 'file_size') THEN
    ALTER TABLE artist_music ADD COLUMN file_size BIGINT;
  END IF;
  
  -- Add audio analysis data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_music' AND column_name = 'audio_analysis') THEN
    ALTER TABLE artist_music ADD COLUMN audio_analysis JSONB DEFAULT '{}'; -- BPM, key, energy, etc.
  END IF;
  
  -- Add streaming platform status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_music' AND column_name = 'platform_status') THEN
    ALTER TABLE artist_music ADD COLUMN platform_status JSONB DEFAULT '{
      "spotify": {"status": "pending", "url": null},
      "apple_music": {"status": "pending", "url": null},
      "youtube": {"status": "pending", "url": null}
    }';
  END IF;
END $$;

-- =============================================
-- Enhanced Indexes for Performance
-- =============================================

-- Activity feed indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON artist_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_artist_id ON artist_activity_feed(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON artist_activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON artist_activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON artist_activity_feed(is_public);
CREATE INDEX IF NOT EXISTS idx_activity_feed_related ON artist_activity_feed(related_content_type, related_content_id);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_conversations_artist ON artist_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_conversations_other ON artist_conversations(other_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON artist_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON artist_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON artist_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON artist_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON artist_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON artist_messages(is_read, recipient_id);

-- Daily stats indexes
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON artist_daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_artist_id ON artist_daily_stats(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON artist_daily_stats(date DESC);

-- Enhanced music indexes
CREATE INDEX IF NOT EXISTS idx_artist_music_upload_status ON artist_music(upload_status);
CREATE INDEX IF NOT EXISTS idx_artist_music_duration ON artist_music(duration);
CREATE INDEX IF NOT EXISTS idx_artist_music_release_date ON artist_music(release_date DESC);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Activity feed policies
ALTER TABLE artist_activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" ON artist_activity_feed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" ON artist_activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view public activity" ON artist_activity_feed
  FOR SELECT USING (is_public = true);

-- Messaging policies
ALTER TABLE artist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON artist_conversations
  FOR SELECT USING (auth.uid() = artist_id OR auth.uid() = other_user_id);

CREATE POLICY "Users can manage their conversations" ON artist_conversations
  FOR ALL USING (auth.uid() = artist_id OR auth.uid() = other_user_id);

CREATE POLICY "Users can view their messages" ON artist_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON artist_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can edit their own messages" ON artist_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Daily stats policies
ALTER TABLE artist_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their own stats" ON artist_daily_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Artists can manage their own stats" ON artist_daily_stats
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Optimized Functions
-- =============================================

-- Function to record activity
CREATE OR REPLACE FUNCTION record_artist_activity(
  p_user_id UUID,
  p_artist_profile_id UUID,
  p_activity_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_related_content_type TEXT DEFAULT NULL,
  p_related_content_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
  icon_name TEXT;
  color_scheme TEXT;
  bg_color_scheme TEXT;
  border_color_scheme TEXT;
BEGIN
  -- Set icon and colors based on activity type
  CASE p_activity_type
    WHEN 'track_uploaded' THEN
      icon_name := 'Disc';
      color_scheme := 'text-purple-400';
      bg_color_scheme := 'bg-purple-500/10';
      border_color_scheme := 'border-purple-500/20';
    WHEN 'event_created' THEN
      icon_name := 'Calendar';
      color_scheme := 'text-blue-400';
      bg_color_scheme := 'bg-blue-500/10';
      border_color_scheme := 'border-blue-500/20';
    WHEN 'milestone_reached' THEN
      icon_name := 'Award';
      color_scheme := 'text-yellow-400';
      bg_color_scheme := 'bg-yellow-500/10';
      border_color_scheme := 'border-yellow-500/20';
    WHEN 'collaboration_started' THEN
      icon_name := 'Users';
      color_scheme := 'text-green-400';
      bg_color_scheme := 'bg-green-500/10';
      border_color_scheme := 'border-green-500/20';
    ELSE
      icon_name := 'Activity';
      color_scheme := 'text-slate-400';
      bg_color_scheme := 'bg-slate-500/10';
      border_color_scheme := 'border-slate-500/20';
  END CASE;

  -- Insert activity
  INSERT INTO artist_activity_feed (
    user_id, artist_profile_id, activity_type, title, description, 
    metadata, icon, color, bg_color, border_color,
    related_content_type, related_content_id
  ) VALUES (
    p_user_id, p_artist_profile_id, p_activity_type, p_title, p_description,
    p_metadata, icon_name, color_scheme, bg_color_scheme, border_color_scheme,
    p_related_content_type, p_related_content_id
  ) RETURNING id INTO activity_id;

  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activity
CREATE OR REPLACE FUNCTION get_recent_activity(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  bg_color TEXT,
  border_color TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.activity_type,
    a.title,
    a.description,
    a.icon,
    a.color,
    a.bg_color,
    a.border_color,
    a.status,
    a.created_at,
    a.metadata
  FROM artist_activity_feed a
  WHERE a.user_id = p_user_id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats(
  p_user_id UUID,
  p_artist_profile_id UUID,
  p_stat_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Insert or update today's stats
  INSERT INTO artist_daily_stats (
    user_id, artist_profile_id, date, profile_views, music_plays, 
    video_views, photo_views, blog_views, new_followers, message_count
  ) VALUES (
    p_user_id, p_artist_profile_id, today_date,
    CASE WHEN p_stat_type = 'profile_views' THEN p_increment ELSE 0 END,
    CASE WHEN p_stat_type = 'music_plays' THEN p_increment ELSE 0 END,
    CASE WHEN p_stat_type = 'video_views' THEN p_increment ELSE 0 END,
    CASE WHEN p_stat_type = 'photo_views' THEN p_increment ELSE 0 END,
    CASE WHEN p_stat_type = 'blog_views' THEN p_increment ELSE 0 END,
    CASE WHEN p_stat_type = 'new_followers' THEN p_increment ELSE 0 END,
    CASE WHEN p_stat_type = 'message_count' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (artist_profile_id, date)
  DO UPDATE SET
    profile_views = artist_daily_stats.profile_views + 
      CASE WHEN p_stat_type = 'profile_views' THEN p_increment ELSE 0 END,
    music_plays = artist_daily_stats.music_plays + 
      CASE WHEN p_stat_type = 'music_plays' THEN p_increment ELSE 0 END,
    video_views = artist_daily_stats.video_views + 
      CASE WHEN p_stat_type = 'video_views' THEN p_increment ELSE 0 END,
    photo_views = artist_daily_stats.photo_views + 
      CASE WHEN p_stat_type = 'photo_views' THEN p_increment ELSE 0 END,
    blog_views = artist_daily_stats.blog_views + 
      CASE WHEN p_stat_type = 'blog_views' THEN p_increment ELSE 0 END,
    new_followers = artist_daily_stats.new_followers + 
      CASE WHEN p_stat_type = 'new_followers' THEN p_increment ELSE 0 END,
    message_count = artist_daily_stats.message_count + 
      CASE WHEN p_stat_type = 'message_count' THEN p_increment ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation or create if not exists
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_artist_id UUID,
  p_other_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM artist_conversations
  WHERE (artist_id = p_artist_id AND other_user_id = p_other_user_id)
     OR (artist_id = p_other_user_id AND other_user_id = p_artist_id);
  
  -- Create if doesn't exist
  IF conversation_id IS NULL THEN
    INSERT INTO artist_conversations (artist_id, other_user_id)
    VALUES (p_artist_id, p_other_user_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced stats calculation function
CREATE OR REPLACE FUNCTION get_enhanced_artist_stats(artist_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
  recent_activity JSONB;
  growth_metrics JSONB;
BEGIN
  -- Get content stats
  WITH content_stats AS (
    SELECT
      (SELECT COUNT(*) FROM artist_music WHERE user_id = artist_user_id AND is_public = true) as music_count,
      (SELECT COUNT(*) FROM artist_videos WHERE user_id = artist_user_id AND is_public = true) as video_count,
      (SELECT COUNT(*) FROM artist_photos WHERE user_id = artist_user_id AND is_public = true) as photo_count,
      (SELECT COUNT(*) FROM artist_blog_posts WHERE user_id = artist_user_id AND status = 'published') as blog_count,
      (SELECT COUNT(*) FROM artist_events WHERE user_id = artist_user_id AND is_public = true) as event_count,
      (SELECT COUNT(*) FROM artist_merchandise WHERE user_id = artist_user_id AND is_active = true) as merchandise_count,
      (SELECT COALESCE(SUM((stats->>'plays')::int), 0) FROM artist_music WHERE user_id = artist_user_id) as total_plays,
      (SELECT COALESCE(SUM((stats->>'views')::int), 0) FROM artist_videos WHERE user_id = artist_user_id) as total_views
  ),
  daily_stats AS (
    SELECT
      COALESCE(SUM(profile_views), 0) as total_profile_views,
      COALESCE(SUM(new_followers), 0) as total_new_followers,
      COALESCE(AVG(engagement_rate), 0) as avg_engagement_rate,
      COALESCE(SUM(revenue), 0) as total_revenue
    FROM artist_daily_stats 
    WHERE user_id = artist_user_id
    AND date >= CURRENT_DATE - INTERVAL '30 days'
  ),
  growth_data AS (
    SELECT
      COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN new_followers ELSE 0 END), 0) as weekly_followers,
      COALESCE(SUM(CASE WHEN date >= CURRENT_DATE - INTERVAL '14 days' AND date < CURRENT_DATE - INTERVAL '7 days' THEN new_followers ELSE 0 END), 0) as prev_weekly_followers
  )
  SELECT jsonb_build_object(
    'music_count', cs.music_count,
    'video_count', cs.video_count,
    'photo_count', cs.photo_count,
    'blog_count', cs.blog_count,
    'event_count', cs.event_count,
    'merchandise_count', cs.merchandise_count,
    'total_plays', cs.total_plays,
    'total_views', cs.total_views,
    'total_tracks', cs.music_count,
    'total_events', cs.event_count,
    'total_fans', ds.total_new_followers,
    'engagement_rate', ROUND(ds.avg_engagement_rate, 1),
    'total_revenue', ds.total_revenue,
    'total_streams', cs.total_plays,
    'monthly_listeners', ROUND(cs.total_plays * 0.3),
    'total_collaborations', 0,
    'profile_views', ds.total_profile_views,
    'follower_growth', CASE 
      WHEN gd.prev_weekly_followers > 0 
      THEN ROUND(((gd.weekly_followers - gd.prev_weekly_followers)::decimal / gd.prev_weekly_followers) * 100, 1)
      ELSE 0 
    END
  ) INTO stats
  FROM content_stats cs, daily_stats ds, growth_data gd;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Trigger Functions for Auto-Activity Recording
-- =============================================

-- Trigger for music uploads
CREATE OR REPLACE FUNCTION trigger_music_upload_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Record activity when music is uploaded
  IF TG_OP = 'INSERT' AND NEW.upload_status = 'completed' THEN
    PERFORM record_artist_activity(
      NEW.user_id,
      NEW.artist_profile_id,
      'track_uploaded',
      'New Release',
      'Your ' || NEW.type || ' "' || NEW.title || '" was uploaded',
      jsonb_build_object('genre', NEW.genre, 'duration', NEW.duration),
      'music',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for event creation
CREATE OR REPLACE FUNCTION trigger_event_create_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM record_artist_activity(
      NEW.user_id,
      NEW.artist_profile_id,
      'event_created',
      'Performance',
      'Upcoming show: ' || NEW.title || ' at ' || COALESCE(NEW.venue_name, 'TBA'),
      jsonb_build_object('event_date', NEW.event_date, 'venue', NEW.venue_name),
      'event',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS music_upload_activity_trigger ON artist_music;
CREATE TRIGGER music_upload_activity_trigger
  AFTER INSERT OR UPDATE ON artist_music
  FOR EACH ROW EXECUTE FUNCTION trigger_music_upload_activity();

DROP TRIGGER IF EXISTS event_create_activity_trigger ON artist_events;
CREATE TRIGGER event_create_activity_trigger
  AFTER INSERT ON artist_events
  FOR EACH ROW EXECUTE FUNCTION trigger_event_create_activity();

-- =============================================
-- Update Triggers
-- =============================================

CREATE TRIGGER update_artist_conversations_updated_at
  BEFORE UPDATE ON artist_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Success Message
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Artist Backend Optimizations Complete!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Enhanced Features:';
  RAISE NOTICE '  ✅ Activity Feed & Recent Activity tracking';
  RAISE NOTICE '  ✅ Messaging system for artist-fan communication';
  RAISE NOTICE '  ✅ Real-time analytics with daily stats';
  RAISE NOTICE '  ✅ Enhanced track upload with metadata';
  RAISE NOTICE '  ✅ Performance indexes and RLS policies';
  RAISE NOTICE '  ✅ Auto-activity recording triggers';
  RAISE NOTICE '  ✅ Optimized functions for dashboard';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '  - record_artist_activity()';
  RAISE NOTICE '  - get_recent_activity()';
  RAISE NOTICE '  - update_daily_stats()';
  RAISE NOTICE '  - get_or_create_conversation()';
  RAISE NOTICE '  - get_enhanced_artist_stats()';
  RAISE NOTICE '';
  RAISE NOTICE 'Your Quick Actions are now fully supported!';
  RAISE NOTICE '=================================================';
END $$; 