-- Create follow_requests table and RLS policies
-- Safe to run multiple times

-- Table
CREATE TABLE IF NOT EXISTS follow_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, target_id)
);

-- Updated at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_follow_requests_updated_at ON follow_requests;
CREATE TRIGGER trg_follow_requests_updated_at
  BEFORE UPDATE ON follow_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  -- Select: requester or target can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'follow_requests_select_visible' AND schemaname = 'public' AND tablename = 'follow_requests'
  ) THEN
    CREATE POLICY follow_requests_select_visible ON follow_requests
      FOR SELECT USING (
        requester_id = auth.uid() OR target_id = auth.uid()
      );
  END IF;

  -- Insert: requester can create for self
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'follow_requests_insert_self' AND schemaname = 'public' AND tablename = 'follow_requests'
  ) THEN
    CREATE POLICY follow_requests_insert_self ON follow_requests
      FOR INSERT WITH CHECK (
        requester_id = auth.uid() AND requester_id <> target_id
      );
  END IF;

  -- Update: requester or target can update (e.g., cancel or accept/reject)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'follow_requests_update_parties' AND schemaname = 'public' AND tablename = 'follow_requests'
  ) THEN
    CREATE POLICY follow_requests_update_parties ON follow_requests
      FOR UPDATE USING (
        requester_id = auth.uid() OR target_id = auth.uid()
      );
  END IF;
END $$;

-- Optional: notifications table (minimal) if not present
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'notifications_select_owner' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY notifications_select_owner ON notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'notifications_insert_owner' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY notifications_insert_owner ON notifications
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'notifications_update_owner' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY notifications_update_owner ON notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;


