-- =============================================================================
-- EVENT PAGES SYSTEM MIGRATION
-- Comprehensive system for shareable event pages with feeds and attendance
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- EVENT ATTENDANCE TABLE
-- Track who's attending events (like Facebook Events attendance)
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL, -- References artist_events(id) or events(id)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_table TEXT NOT NULL DEFAULT 'artist_events' CHECK (event_table IN ('artist_events', 'events')),
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'interested', 'not_going')),
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one attendance record per user per event
  UNIQUE(event_id, user_id, event_table)
);

-- =============================================================================
-- EVENT POSTS TABLE
-- Event-specific posts and updates (like Facebook Event posts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL, -- References artist_events(id) or events(id)
  event_table TEXT NOT NULL DEFAULT 'artist_events' CHECK (event_table IN ('artist_events', 'events')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'announcement', 'update')),
  media_urls JSONB DEFAULT '[]'::jsonb,
  is_announcement BOOLEAN DEFAULT FALSE, -- Special posts from event organizers
  is_pinned BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'attendees' CHECK (visibility IN ('public', 'attendees', 'collaborators')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT COLLABORATORS TABLE
-- Users who can manage event pages (in addition to the event creator)
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL, -- References artist_events(id) or events(id)
  event_table TEXT NOT NULL DEFAULT 'artist_events' CHECK (event_table IN ('artist_events', 'events')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'moderator')),
  permissions JSONB DEFAULT '{"can_edit_details": true, "can_post_updates": true, "can_moderate_posts": true, "can_manage_collaborators": false}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one collaboration record per user per event
  UNIQUE(event_id, user_id, event_table)
);

-- =============================================================================
-- EVENT PAGE SETTINGS TABLE
-- Settings and configuration for event pages
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_page_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL, -- References artist_events(id) or events(id)
  event_table TEXT NOT NULL DEFAULT 'artist_events' CHECK (event_table IN ('artist_events', 'events')),
  is_page_enabled BOOLEAN DEFAULT TRUE,
  allow_public_posts BOOLEAN DEFAULT FALSE,
  allow_attendee_posts BOOLEAN DEFAULT TRUE,
  require_approval_for_posts BOOLEAN DEFAULT FALSE,
  show_attendance_count BOOLEAN DEFAULT TRUE,
  show_attendee_list BOOLEAN DEFAULT TRUE,
  allow_comments BOOLEAN DEFAULT TRUE,
  page_theme JSONB DEFAULT '{"primary_color": "#8B5CF6", "cover_image": null}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  seo_settings JSONB DEFAULT '{"title": null, "description": null, "keywords": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one settings record per event
  UNIQUE(event_id, event_table)
);

-- =============================================================================
-- EVENT POST LIKES TABLE
-- Track likes on event posts
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES event_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one like per user per post
  UNIQUE(post_id, user_id)
);

-- =============================================================================
-- EVENT POST COMMENTS TABLE
-- Comments on event posts
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES event_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES event_post_comments(id) ON DELETE CASCADE, -- For nested comments
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Event attendance indexes
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_id ON event_attendance(event_id, event_table);
CREATE INDEX IF NOT EXISTS idx_event_attendance_user_id ON event_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_status ON event_attendance(status);

-- Event posts indexes
CREATE INDEX IF NOT EXISTS idx_event_posts_event_id ON event_posts(event_id, event_table);
CREATE INDEX IF NOT EXISTS idx_event_posts_user_id ON event_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_event_posts_created_at ON event_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_posts_type ON event_posts(type);
CREATE INDEX IF NOT EXISTS idx_event_posts_visibility ON event_posts(visibility);

-- Event collaborators indexes
CREATE INDEX IF NOT EXISTS idx_event_collaborators_event_id ON event_collaborators(event_id, event_table);
CREATE INDEX IF NOT EXISTS idx_event_collaborators_user_id ON event_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_event_collaborators_status ON event_collaborators(status);

-- Event page settings indexes
CREATE INDEX IF NOT EXISTS idx_event_page_settings_event_id ON event_page_settings(event_id, event_table);

-- Event post likes indexes
CREATE INDEX IF NOT EXISTS idx_event_post_likes_post_id ON event_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_event_post_likes_user_id ON event_post_likes(user_id);

-- Event post comments indexes
CREATE INDEX IF NOT EXISTS idx_event_post_comments_post_id ON event_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_event_post_comments_user_id ON event_post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_post_comments_parent_id ON event_post_comments(parent_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_post_comments ENABLE ROW LEVEL SECURITY;

-- Event attendance policies
CREATE POLICY "Users can view event attendance for public events"
  ON event_attendance FOR SELECT
  USING (TRUE); -- We'll handle privacy in the application layer

CREATE POLICY "Users can manage their own event attendance"
  ON event_attendance FOR ALL
  USING (auth.uid() = user_id);

-- Event posts policies
CREATE POLICY "Users can view event posts based on visibility"
  ON event_posts FOR SELECT
  USING (
    visibility = 'public' OR
    auth.uid() = user_id OR
    (visibility = 'attendees' AND EXISTS (
      SELECT 1 FROM event_attendance 
      WHERE event_attendance.event_id = event_posts.event_id 
      AND event_attendance.user_id = auth.uid()
      AND event_attendance.status = 'attending'
    )) OR
    (visibility = 'collaborators' AND EXISTS (
      SELECT 1 FROM event_collaborators 
      WHERE event_collaborators.event_id = event_posts.event_id 
      AND event_collaborators.user_id = auth.uid()
      AND event_collaborators.status = 'accepted'
    ))
  );

CREATE POLICY "Users can create event posts if they have permission"
  ON event_posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Event creator can always post
      EXISTS (SELECT 1 FROM artist_events WHERE id = event_id AND user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM events WHERE id = event_id AND created_by = auth.uid()) OR
      -- Collaborators with posting permission
      EXISTS (
        SELECT 1 FROM event_collaborators 
        WHERE event_id = event_posts.event_id 
        AND user_id = auth.uid() 
        AND status = 'accepted'
        AND (permissions->>'can_post_updates')::boolean = true
      ) OR
      -- Attendees can post if allowed
      (EXISTS (
        SELECT 1 FROM event_attendance 
        WHERE event_id = event_posts.event_id 
        AND user_id = auth.uid() 
        AND status = 'attending'
      ) AND EXISTS (
        SELECT 1 FROM event_page_settings 
        WHERE event_id = event_posts.event_id 
        AND allow_attendee_posts = true
      ))
    )
  );

CREATE POLICY "Users can update their own event posts"
  ON event_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Event creators and collaborators can moderate posts"
  ON event_posts FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM artist_events WHERE id = event_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND created_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM event_collaborators 
      WHERE event_id = event_posts.event_id 
      AND user_id = auth.uid() 
      AND status = 'accepted'
      AND (permissions->>'can_moderate_posts')::boolean = true
    )
  );

-- Event collaborators policies
CREATE POLICY "Users can view event collaborators"
  ON event_collaborators FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM artist_events WHERE id = event_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND created_by = auth.uid())
  );

CREATE POLICY "Event creators can manage collaborators"
  ON event_collaborators FOR ALL
  USING (
    EXISTS (SELECT 1 FROM artist_events WHERE id = event_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND created_by = auth.uid())
  );

-- Event page settings policies
CREATE POLICY "Users can view event page settings"
  ON event_page_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Event creators and admins can manage page settings"
  ON event_page_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM artist_events WHERE id = event_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND created_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM event_collaborators 
      WHERE event_id = event_page_settings.event_id 
      AND user_id = auth.uid() 
      AND status = 'accepted'
      AND role = 'admin'
    )
  );

-- Event post likes policies
CREATE POLICY "Users can view event post likes"
  ON event_post_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage their own event post likes"
  ON event_post_likes FOR ALL
  USING (auth.uid() = user_id);

-- Event post comments policies
CREATE POLICY "Users can view event post comments"
  ON event_post_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create event post comments"
  ON event_post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event post comments"
  ON event_post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event post comments"
  ON event_post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get event creator
CREATE OR REPLACE FUNCTION get_event_creator(event_id UUID, event_table TEXT)
RETURNS UUID AS $$
BEGIN
  IF event_table = 'artist_events' THEN
    RETURN (SELECT user_id FROM artist_events WHERE id = event_id);
  ELSIF event_table = 'events' THEN
    RETURN (SELECT created_by FROM events WHERE id = event_id);
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can manage event
CREATE OR REPLACE FUNCTION can_manage_event(user_id UUID, event_id UUID, event_table TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the event creator
  IF get_event_creator(event_id, event_table) = user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is an admin collaborator
  IF EXISTS (
    SELECT 1 FROM event_collaborators 
    WHERE event_collaborators.event_id = $2 
    AND event_collaborators.user_id = $1 
    AND status = 'accepted'
    AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update event post counts
CREATE OR REPLACE FUNCTION update_event_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes count
  IF TG_TABLE_NAME = 'event_post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE event_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE event_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  -- Update comments count
  IF TG_TABLE_NAME = 'event_post_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE event_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE event_posts 
      SET comments_count = comments_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_posts_updated_at
  BEFORE UPDATE ON event_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_collaborators_updated_at
  BEFORE UPDATE ON event_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_page_settings_updated_at
  BEFORE UPDATE ON event_page_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_post_comments_updated_at
  BEFORE UPDATE ON event_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for count updates
CREATE TRIGGER update_event_post_likes_count
  AFTER INSERT OR DELETE ON event_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_event_post_counts();

CREATE TRIGGER update_event_post_comments_count
  AFTER INSERT OR DELETE ON event_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_event_post_counts();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Create default page settings for existing events
INSERT INTO event_page_settings (event_id, event_table, is_page_enabled)
SELECT id, 'artist_events', TRUE FROM artist_events
WHERE NOT EXISTS (
  SELECT 1 FROM event_page_settings 
  WHERE event_id = artist_events.id AND event_table = 'artist_events'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 