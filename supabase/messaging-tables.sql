-- Artist Messaging Tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE IF NOT EXISTS artist_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  other_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(artist_id, other_user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS artist_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES artist_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS artist_activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE artist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_activity_feed ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can view their conversations" ON artist_conversations
  FOR SELECT USING (auth.uid() = artist_id OR auth.uid() = other_user_id);

CREATE POLICY "Users can view their messages" ON artist_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can view their activity" ON artist_activity_feed
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_artist ON artist_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON artist_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON artist_activity_feed(user_id, created_at DESC); 