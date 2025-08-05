-- =============================================================================
-- COMMUNICATION SYSTEM FOUNDATION MIGRATION
-- Adds centralized communication capabilities to existing platform
-- Migration: 20250200000000_communication_system_foundation.sql
-- Author: Implementation Optimization Plan - Week 1
-- =============================================================================

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- COMMUNICATION CHANNELS TABLE
-- Central hub for organizing different types of communications
-- =============================================================================

CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN (
    'general',      -- Platform-wide general discussions
    'department',   -- Department-specific channels (sound, lighting, etc.)
    'emergency',    -- Emergency communications only
    'logistics',    -- Logistics and coordination
    'tour',         -- Tour-specific communications
    'event',        -- Event-specific communications
    'venue',        -- Venue-specific communications
    'private',      -- Private/direct messaging
    'announcement'  -- Announcement-only channels
  )),
  
  -- Scope - what this channel belongs to
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE,
  
  -- Department/Role targeting
  department VARCHAR(100), -- 'sound', 'lighting', 'security', 'catering', etc.
  target_roles TEXT[], -- Array of roles that should have access
  
  -- Channel settings
  is_public BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  allow_file_sharing BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false, -- For posts in this channel
  
  -- Auto-deletion settings
  auto_delete_messages BOOLEAN DEFAULT false,
  message_retention_days INTEGER DEFAULT 30,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure at least one scope is specified
  CONSTRAINT channel_scope_check CHECK (
    (tour_id IS NOT NULL) OR 
    (event_id IS NOT NULL) OR 
    (venue_id IS NOT NULL) OR 
    (channel_type = 'general')
  )
);

-- =============================================================================
-- CHANNEL PARTICIPANTS TABLE
-- Manages who has access to which channels
-- =============================================================================

CREATE TABLE IF NOT EXISTS channel_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Participation settings
  role_in_channel VARCHAR(50) DEFAULT 'member' CHECK (role_in_channel IN (
    'owner',      -- Can manage channel settings and participants
    'moderator',  -- Can moderate messages and manage some settings
    'member',     -- Can read and write messages
    'viewer'      -- Can only read messages
  )),
  
  -- Notification preferences for this channel
  notification_preferences JSONB DEFAULT '{
    "mentions": true,
    "all_messages": false,
    "announcements": true,
    "push_notifications": true,
    "email_notifications": false
  }'::jsonb,
  
  -- Status
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  
  -- Unique constraint to prevent duplicate participants
  UNIQUE(channel_id, user_id)
);

-- =============================================================================
-- MESSAGES TABLE
-- Stores all messages across all channels
-- =============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN (
    'text',           -- Regular text message
    'file',           -- File attachment
    'image',          -- Image attachment
    'video',          -- Video attachment
    'location',       -- Location sharing
    'announcement',   -- Official announcement
    'system',         -- System-generated message
    'poll',           -- Poll/survey
    'task',           -- Task assignment
    'alert'           -- Alert/warning message
  )),
  
  -- Priority and categorization
  priority VARCHAR(20) DEFAULT 'general' CHECK (priority IN (
    'emergency',  -- Red alert - immediate attention required
    'urgent',     -- Orange alert - important, needs quick attention
    'important',  -- Yellow alert - significant but not urgent
    'general'     -- Normal message
  )),
  
  -- Threading support
  thread_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reply_count INTEGER DEFAULT 0,
  
  -- Rich content support
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of file attachments
  mentions JSONB DEFAULT '[]'::jsonb,    -- Array of mentioned user IDs
  reactions JSONB DEFAULT '{}'::jsonb,   -- Emoji reactions with counts
  
  -- Message status
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- ANNOUNCEMENTS TABLE
-- Special high-priority messages for important updates
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) DEFAULT 'general' CHECK (announcement_type IN (
    'emergency',     -- Safety/security emergency
    'schedule',      -- Schedule changes
    'weather',       -- Weather-related updates
    'logistics',     -- Logistics/transportation updates
    'technical',     -- Technical/equipment updates
    'general',       -- General announcements
    'celebration'    -- Positive news/celebrations
  )),
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'important' CHECK (priority IN (
    'emergency',
    'urgent', 
    'important',
    'general'
  )),
  
  -- Targeting
  target_audience JSONB DEFAULT '[]'::jsonb, -- Array of roles, departments, or specific user IDs
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE,
  
  -- Scheduling
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Rich content
  attachments JSONB DEFAULT '[]'::jsonb,
  call_to_action JSONB, -- Button text, link, etc.
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  
  -- Tracking
  view_count INTEGER DEFAULT 0,
  acknowledgment_required BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ANNOUNCEMENT ACKNOWLEDGMENTS TABLE
-- Tracks who has seen/acknowledged important announcements
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcement_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Acknowledgment details
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledgment_note TEXT,
  
  -- Unique constraint
  UNIQUE(announcement_id, user_id)
);

-- =============================================================================
-- MESSAGE ATTACHMENTS TABLE
-- Stores file attachments for messages
-- =============================================================================

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  
  -- File details
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT, -- in bytes
  mime_type VARCHAR(255),
  
  -- Metadata for different file types
  file_metadata JSONB DEFAULT '{}'::jsonb, -- dimensions for images, duration for videos, etc.
  
  -- Thumbnail for media files
  thumbnail_url TEXT,
  
  -- Status
  is_processed BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  
  -- Metadata
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- COMMUNICATION PREFERENCES TABLE
-- User-specific communication preferences
-- =============================================================================

CREATE TABLE IF NOT EXISTS communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Global preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT false,
  
  -- Priority preferences
  emergency_notifications JSONB DEFAULT '{
    "email": true,
    "push": true,
    "sms": true,
    "sound": true
  }'::jsonb,
  
  urgent_notifications JSONB DEFAULT '{
    "email": true,
    "push": true,
    "sms": false,
    "sound": true
  }'::jsonb,
  
  general_notifications JSONB DEFAULT '{
    "email": false,
    "push": true,
    "sms": false,
    "sound": false
  }'::jsonb,
  
  -- Department/role specific preferences
  department_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Do not disturb settings
  dnd_enabled BOOLEAN DEFAULT false,
  dnd_start_time TIME,
  dnd_end_time TIME,
  dnd_days INTEGER[], -- Array of days (0=Sunday, 6=Saturday)
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Communication channels indexes
CREATE INDEX IF NOT EXISTS idx_channels_type ON communication_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_channels_tour ON communication_channels(tour_id) WHERE tour_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channels_event ON communication_channels(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channels_venue ON communication_channels(venue_id) WHERE venue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channels_department ON communication_channels(department) WHERE department IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channels_active ON communication_channels(is_archived) WHERE is_archived = false;

-- Channel participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_channel ON channel_participants(channel_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON channel_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_role ON channel_participants(role_in_channel);
CREATE INDEX IF NOT EXISTS idx_participants_active ON channel_participants(user_id) WHERE is_muted = false;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority) WHERE priority != 'general';
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_active ON messages(channel_id, created_at DESC) WHERE is_deleted = false;

-- Full-text search index for messages
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('english', content)) WHERE is_deleted = false;

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);
CREATE INDEX IF NOT EXISTS idx_announcements_tour ON announcements(tour_id) WHERE tour_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_event ON announcements(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_venue ON announcements(venue_id) WHERE venue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, publish_at) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(expires_at) WHERE expires_at IS NULL OR expires_at > NOW();

-- Acknowledgments indexes
CREATE INDEX IF NOT EXISTS idx_acknowledgments_announcement ON announcement_acknowledgments(announcement_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_user ON announcement_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_acknowledgments_pending ON announcement_acknowledgments(announcement_id) WHERE acknowledged_at IS NULL;

-- Attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON message_attachments(mime_type);
CREATE INDEX IF NOT EXISTS idx_attachments_size ON message_attachments(file_size);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_communication_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER update_channels_timestamp
  BEFORE UPDATE ON communication_channels
  FOR EACH ROW EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER update_messages_timestamp
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER update_announcements_timestamp
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_communication_updated_at();

CREATE TRIGGER update_preferences_timestamp
  BEFORE UPDATE ON communication_preferences
  FOR EACH ROW EXECUTE FUNCTION update_communication_updated_at();

-- =============================================================================
-- FUNCTION TO UPDATE REPLY COUNTS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.thread_id IS NOT NULL THEN
    UPDATE messages 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' AND OLD.thread_id IS NOT NULL THEN
    UPDATE messages 
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.thread_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_message_reply_count
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_reply_count();

-- =============================================================================
-- FUNCTION TO UPDATE ANNOUNCEMENT VIEW COUNTS
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_announcement_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE announcements 
  SET view_count = view_count + 1 
  WHERE id = NEW.announcement_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_view_count
  AFTER INSERT ON announcement_acknowledgments
  FOR EACH ROW EXECUTE FUNCTION increment_announcement_view_count();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;

-- Channels: Users can view channels they're participants in or public channels
CREATE POLICY "Users can view accessible channels" ON communication_channels
  FOR SELECT USING (
    is_public = true OR
    id IN (
      SELECT channel_id FROM channel_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Channels: Only admins and channel owners can create channels
CREATE POLICY "Admins and owners can create channels" ON communication_channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager', 'tour_manager', 'event_coordinator')
    )
  );

-- Channels: Only channel owners and admins can update channels
CREATE POLICY "Owners and admins can update channels" ON communication_channels
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Participants: Users can view participants in channels they belong to
CREATE POLICY "Users can view channel participants" ON channel_participants
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can view messages in channels they're participants in
CREATE POLICY "Users can view channel messages" ON messages
  FOR SELECT USING (
    channel_id IN (
      SELECT channel_id FROM channel_participants 
      WHERE user_id = auth.uid()
    ) AND is_deleted = false
  );

-- Messages: Users can send messages to channels they're participants in
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    channel_id IN (
      SELECT channel_id FROM channel_participants 
      WHERE user_id = auth.uid() 
      AND role_in_channel IN ('owner', 'moderator', 'member')
    )
  );

-- Messages: Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Announcements: Users can view announcements targeted to them
CREATE POLICY "Users can view targeted announcements" ON announcements
  FOR SELECT USING (
    is_published = true AND
    (expires_at IS NULL OR expires_at > NOW()) AND
    (
      target_audience = '[]'::jsonb OR
      target_audience ? auth.uid()::text OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (
          role = ANY(SELECT jsonb_array_elements_text(target_audience)) OR
          COALESCE(venue_profiles.department, '') = ANY(SELECT jsonb_array_elements_text(target_audience))
        )
      )
    )
  );

-- Preferences: Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON communication_preferences
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Create default system channels
INSERT INTO communication_channels (name, description, channel_type, is_public, created_by)
SELECT 
  'General Announcements',
  'Platform-wide announcements and important updates',
  'announcement',
  true,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM communication_channels WHERE name = 'General Announcements'
);

INSERT INTO communication_channels (name, description, channel_type, is_public, created_by)
SELECT 
  'Emergency Alerts',
  'Emergency communications and safety alerts',
  'emergency',
  true,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM communication_channels WHERE name = 'Emergency Alerts'
);

-- Create default communication preferences for existing users
INSERT INTO communication_preferences (user_id)
SELECT id FROM profiles 
WHERE id NOT IN (SELECT user_id FROM communication_preferences);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE communication_channels IS 'Organizes different types of communications (general, department, emergency, etc.)';
COMMENT ON TABLE channel_participants IS 'Manages user access and roles within communication channels';
COMMENT ON TABLE messages IS 'Stores all messages with support for threading, reactions, and rich content';
COMMENT ON TABLE announcements IS 'High-priority announcements with targeting and scheduling capabilities';
COMMENT ON TABLE announcement_acknowledgments IS 'Tracks who has viewed/acknowledged important announcements';
COMMENT ON TABLE message_attachments IS 'File attachments for messages with metadata support';
COMMENT ON TABLE communication_preferences IS 'User preferences for notifications and communication settings';

COMMENT ON COLUMN messages.priority IS 'Message priority: emergency (red), urgent (orange), important (yellow), general (normal)';
COMMENT ON COLUMN announcements.target_audience IS 'JSON array of roles, departments, or specific user IDs to target';
COMMENT ON COLUMN communication_preferences.emergency_notifications IS 'Notification settings for emergency priority messages';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Communication system foundation migration completed successfully';
  RAISE NOTICE 'Created tables: communication_channels, channel_participants, messages, announcements, announcement_acknowledgments, message_attachments, communication_preferences';
  RAISE NOTICE 'Created indexes for optimal performance';
  RAISE NOTICE 'Created RLS policies for security';
  RAISE NOTICE 'Ready for API endpoint implementation';
END $$;