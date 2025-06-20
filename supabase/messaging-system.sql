-- =============================================
-- Artist Messaging System
-- =============================================
-- Complete messaging system for artist-fan communication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Messaging Tables
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
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Activity Feed Table
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
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  color TEXT,
  bg_color TEXT,
  border_color TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming', 'cancelled')),
  is_public BOOLEAN DEFAULT true,
  related_content_type TEXT,
  related_content_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_conversations_artist ON artist_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_conversations_other ON artist_conversations(other_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON artist_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON artist_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON artist_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON artist_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON artist_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON artist_messages(is_read, recipient_id);

-- Activity feed indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON artist_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_artist_id ON artist_activity_feed(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON artist_activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON artist_activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON artist_activity_feed(is_public);

-- =============================================
-- Row Level Security
-- =============================================

-- Messaging policies
ALTER TABLE artist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_activity_feed ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view their own activity" ON artist_activity_feed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity" ON artist_activity_feed
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Messaging Functions
-- =============================================

-- Function to send a message
CREATE OR REPLACE FUNCTION send_message(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_attachments JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  message_id UUID;
BEGIN
  -- Get or create conversation
  SELECT id INTO conversation_id
  FROM artist_conversations
  WHERE (artist_id = p_sender_id AND other_user_id = p_recipient_id)
     OR (artist_id = p_recipient_id AND other_user_id = p_sender_id);
  
  IF conversation_id IS NULL THEN
    INSERT INTO artist_conversations (artist_id, other_user_id)
    VALUES (p_sender_id, p_recipient_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  -- Insert message
  INSERT INTO artist_messages (
    conversation_id,
    sender_id,
    recipient_id,
    content,
    message_type,
    attachments
  ) VALUES (
    conversation_id,
    p_sender_id,
    p_recipient_id,
    p_content,
    p_message_type,
    p_attachments
  ) RETURNING id INTO message_id;
  
  -- Update conversation
  UPDATE artist_conversations 
  SET 
    last_message_id = message_id,
    last_message_at = NOW(),
    unread_count_artist = CASE 
      WHEN artist_id = p_recipient_id THEN unread_count_artist + 1 
      ELSE unread_count_artist 
    END,
    unread_count_other = CASE 
      WHEN other_user_id = p_recipient_id THEN unread_count_other + 1 
      ELSE unread_count_other 
    END,
    updated_at = NOW()
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Mark messages as read
  UPDATE artist_messages 
  SET is_read = true, read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND recipient_id = p_user_id
    AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Reset unread count
  UPDATE artist_conversations
  SET 
    unread_count_artist = CASE 
      WHEN artist_id = p_user_id THEN 0 
      ELSE unread_count_artist 
    END,
    unread_count_other = CASE 
      WHEN other_user_id = p_user_id THEN 0 
      ELSE unread_count_other 
    END,
    updated_at = NOW()
  WHERE id = p_conversation_id;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversations for a user
CREATE OR REPLACE FUNCTION get_conversations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER,
  is_archived BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    CASE 
      WHEN c.artist_id = p_user_id THEN c.other_user_id 
      ELSE c.artist_id 
    END as other_user_id,
    COALESCE(
      ap.artist_name,
      p.full_name,
      'Unknown User'
    ) as other_user_name,
    m.content as last_message_content,
    c.last_message_at,
    CASE 
      WHEN c.artist_id = p_user_id THEN c.unread_count_artist 
      ELSE c.unread_count_other 
    END as unread_count,
    CASE 
      WHEN c.artist_id = p_user_id THEN c.is_archived_artist 
      ELSE c.is_archived_other 
    END as is_archived
  FROM artist_conversations c
  LEFT JOIN artist_messages m ON c.last_message_id = m.id
  LEFT JOIN profiles p ON (
    CASE 
      WHEN c.artist_id = p_user_id THEN c.other_user_id 
      ELSE c.artist_id 
    END = p.id
  )
  LEFT JOIN artist_profiles ap ON (
    CASE 
      WHEN c.artist_id = p_user_id THEN c.other_user_id 
      ELSE c.artist_id 
    END = ap.user_id
  )
  WHERE c.artist_id = p_user_id OR c.other_user_id = p_user_id
  ORDER BY c.last_message_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record activity
CREATE OR REPLACE FUNCTION record_activity(
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

-- =============================================
-- Update Triggers
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artist_conversations_updated_at
  BEFORE UPDATE ON artist_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Artist Messaging System Setup Complete!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ artist_conversations - conversation management';
  RAISE NOTICE '  ✅ artist_messages - message storage';
  RAISE NOTICE '  ✅ artist_activity_feed - activity tracking';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '  - send_message() - send messages';
  RAISE NOTICE '  - mark_messages_read() - mark as read';
  RAISE NOTICE '  - get_conversations() - list conversations';
  RAISE NOTICE '  - record_activity() - track activities';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies and indexes configured!';
  RAISE NOTICE '=================================================';
END $$; 