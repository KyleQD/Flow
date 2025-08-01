-- =============================================================================
-- ENHANCED NOTIFICATION SYSTEM MIGRATION
-- Comprehensive notification system for social media platform
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCED NOTIFICATIONS TABLE
-- =============================================================================

-- Drop existing notifications table if it exists and recreate with enhanced schema
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core notification data
  type TEXT NOT NULL CHECK (type IN (
    -- Social interactions
    'like', 'comment', 'share', 'follow', 'unfollow', 'mention', 'tag',
    -- Messages
    'message', 'message_request', 'group_message',
    -- Events & Bookings
    'event_invite', 'event_reminder', 'booking_request', 'booking_accepted', 'booking_declined',
    -- Content & Activity
    'post_created', 'content_approved', 'content_rejected', 'achievement_unlocked',
    -- System & Admin
    'system_alert', 'maintenance', 'feature_update', 'security_alert',
    -- Business & Professional
    'job_application', 'job_offer', 'collaboration_request', 'partnership_invite',
    -- Venue & Artist specific
    'venue_booking', 'artist_booking', 'performance_reminder', 'soundcheck_reminder',
    -- Payment & Financial
    'payment_received', 'payment_failed', 'refund_processed', 'subscription_renewal'
  )),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- Short version for preview
  
  -- Metadata for rich notifications
  metadata JSONB DEFAULT '{}',
  
  -- Related entities
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_content_id UUID,
  related_content_type TEXT,
  
  -- Notification state
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Delivery tracking
  email_sent BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- =============================================================================

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  
  -- Type-specific preferences
  preferences JSONB DEFAULT '{
    "like": {"email": true, "push": true, "sms": false},
    "comment": {"email": true, "push": true, "sms": false},
    "follow": {"email": true, "push": true, "sms": false},
    "message": {"email": true, "push": true, "sms": true},
    "event_invite": {"email": true, "push": true, "sms": true},
    "booking_request": {"email": true, "push": true, "sms": true},
    "system_alert": {"email": true, "push": false, "sms": false}
  }'::jsonb,
  
  -- Digest settings
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('never', 'hourly', 'daily', 'weekly')),
  digest_time TIME DEFAULT '09:00:00',
  digest_timezone TEXT DEFAULT 'UTC',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  
  -- Created/Updated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- NOTIFICATION TEMPLATES TABLE
-- =============================================================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  title_template TEXT NOT NULL,
  content_template TEXT NOT NULL,
  summary_template TEXT,
  
  -- Default settings
  default_priority TEXT DEFAULT 'normal',
  default_expiry_days INTEGER DEFAULT 30,
  
  -- Channel-specific templates
  email_subject_template TEXT,
  email_body_template TEXT,
  push_title_template TEXT,
  push_body_template TEXT,
  sms_template TEXT,
  
  -- Metadata
  icon TEXT,
  color TEXT,
  category TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- NOTIFICATION DELIVERY LOG TABLE
-- =============================================================================

CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Delivery details
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push', 'sms', 'in_app')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  
  -- Delivery metadata
  provider TEXT,
  provider_message_id TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- NOTIFICATION BATCHES TABLE (for digest emails)
-- =============================================================================

CREATE TABLE notification_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Batch details
  batch_type TEXT NOT NULL CHECK (batch_type IN ('digest', 'summary', 'bulk')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  
  -- Content
  notifications JSONB NOT NULL, -- Array of notification IDs
  digest_content TEXT,
  
  -- Delivery
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_related_user ON notifications(related_user_id);
CREATE INDEX idx_notifications_related_content ON notifications(related_content_type, related_content_id);
CREATE INDEX idx_notifications_unread_count ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Notification preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Delivery log indexes
CREATE INDEX idx_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_user_id ON notification_delivery_log(user_id);
CREATE INDEX idx_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX idx_delivery_log_created_at ON notification_delivery_log(created_at);

-- Batch indexes
CREATE INDEX idx_notification_batches_user_id ON notification_batches(user_id);
CREATE INDEX idx_notification_batches_status ON notification_batches(status);
CREATE INDEX idx_notification_batches_created_at ON notification_batches(created_at);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can manage their own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Templates policies (read-only for users, full access for admins)
CREATE POLICY "Anyone can view notification templates" ON notification_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Delivery log policies
CREATE POLICY "Users can view their own delivery logs" ON notification_delivery_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage delivery logs" ON notification_delivery_log
  FOR ALL USING (true);

-- Batch policies
CREATE POLICY "Users can view their own batches" ON notification_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage batches" ON notification_batches
  FOR ALL USING (true);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update notification count in profiles
CREATE OR REPLACE FUNCTION update_notification_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET unread_notifications = COALESCE(unread_notifications, 0) + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_read = FALSE AND NEW.is_read = TRUE THEN
      UPDATE profiles 
      SET unread_notifications = GREATEST(COALESCE(unread_notifications, 0) - 1, 0)
      WHERE id = NEW.user_id;
    ELSIF OLD.is_read = TRUE AND NEW.is_read = FALSE THEN
      UPDATE profiles 
      SET unread_notifications = COALESCE(unread_notifications, 0) + 1
      WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_read = FALSE THEN
      UPDATE profiles 
      SET unread_notifications = GREATEST(COALESCE(unread_notifications, 0) - 1, 0)
      WHERE id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notification count updates
CREATE TRIGGER notification_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_count();

-- Function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creating notification preferences
CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_notification_preferences();

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete notifications older than 90 days that are read
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '90 days' 
    AND is_read = TRUE;
  
  -- Delete notifications older than 365 days regardless of read status
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '365 days';
  
  -- Clean up delivery logs older than 30 days
  DELETE FROM notification_delivery_log 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old batches
  DELETE FROM notification_batches 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- INSERT DEFAULT TEMPLATES
-- =============================================================================

INSERT INTO notification_templates (type, name, description, title_template, content_template, summary_template, icon, color, category) VALUES
-- Social interactions
('like', 'Post Like', 'Notification when someone likes your post', '{{user_name}} liked your {{content_type}}', '{{user_name}} liked your {{content_type}} "{{content_title}}"', '{{user_name}} liked your {{content_type}}', 'heart', '#ef4444', 'social'),
('comment', 'New Comment', 'Notification when someone comments on your content', '{{user_name}} commented on your {{content_type}}', '{{user_name}} commented: "{{comment_text}}" on your {{content_type}}', '{{user_name}} commented on your {{content_type}}', 'message-circle', '#3b82f6', 'social'),
('follow', 'New Follower', 'Notification when someone follows you', '{{user_name}} started following you', '{{user_name}} started following you. You now have {{follower_count}} followers.', '{{user_name}} started following you', 'user-plus', '#10b981', 'social'),
('mention', 'Mention', 'Notification when someone mentions you', '{{user_name}} mentioned you', '{{user_name}} mentioned you in a {{content_type}}: "{{content_text}}"', '{{user_name}} mentioned you', 'at-sign', '#f59e0b', 'social'),

-- Messages
('message', 'New Message', 'Notification for new direct messages', 'New message from {{user_name}}', '{{user_name}} sent you a message: "{{message_preview}}"', 'New message from {{user_name}}', 'mail', '#8b5cf6', 'communication'),
('message_request', 'Message Request', 'Notification for message requests from non-followers', 'Message request from {{user_name}}', '{{user_name}} wants to send you a message. Review their profile to accept or decline.', 'Message request from {{user_name}}', 'mail-question', '#f97316', 'communication'),

-- Events & Bookings
('event_invite', 'Event Invitation', 'Notification for event invitations', 'You''re invited to {{event_name}}', '{{user_name}} invited you to {{event_name}} on {{event_date}} at {{event_location}}', 'Event invitation from {{user_name}}', 'calendar', '#06b6d4', 'events'),
('booking_request', 'Booking Request', 'Notification for new booking requests', 'New booking request', '{{user_name}} wants to book you for {{event_name}} on {{event_date}}', 'New booking request from {{user_name}}', 'calendar-clock', '#84cc16', 'business'),
('booking_accepted', 'Booking Accepted', 'Notification when booking is accepted', 'Booking accepted', 'Your booking request for {{event_name}} has been accepted!', 'Booking accepted for {{event_name}}', 'check-circle', '#10b981', 'business'),
('booking_declined', 'Booking Declined', 'Notification when booking is declined', 'Booking declined', 'Your booking request for {{event_name}} was declined.', 'Booking declined for {{event_name}}', 'x-circle', '#ef4444', 'business'),

-- System
('system_alert', 'System Alert', 'Important system notifications', '{{alert_title}}', '{{alert_message}}', '{{alert_title}}', 'alert-triangle', '#f59e0b', 'system'),
('feature_update', 'Feature Update', 'New feature announcements', 'New feature: {{feature_name}}', '{{feature_description}}', 'New feature available', 'sparkles', '#8b5cf6', 'system'),

-- Business
('job_application', 'Job Application', 'Notification for job applications', 'New job application', '{{user_name}} applied for {{job_title}}', 'New application for {{job_title}}', 'briefcase', '#3b82f6', 'business'),
('collaboration_request', 'Collaboration Request', 'Notification for collaboration requests', 'Collaboration request from {{user_name}}', '{{user_name}} wants to collaborate on {{project_name}}', 'Collaboration request from {{user_name}}', 'users', '#06b6d4', 'business');

-- =============================================================================
-- ADD UNREAD NOTIFICATIONS COLUMN TO PROFILES
-- =============================================================================

-- Add unread_notifications column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'unread_notifications'
  ) THEN
    ALTER TABLE profiles ADD COLUMN unread_notifications INTEGER DEFAULT 0;
    RAISE NOTICE 'Added unread_notifications column to profiles table';
  END IF;
END $$;

-- Initialize unread notification counts for existing users
UPDATE profiles 
SET unread_notifications = (
  SELECT COUNT(*) 
  FROM notifications 
  WHERE notifications.user_id = profiles.id 
    AND notifications.is_read = FALSE
);

-- =============================================================================
-- CREATE NOTIFICATION PREFERENCES FOR EXISTING USERS
-- =============================================================================

INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM notification_preferences);

-- =============================================================================
-- FINAL COMMENTS
-- =============================================================================

COMMENT ON TABLE notifications IS 'Comprehensive notification system for all user interactions';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery and frequency';
COMMENT ON TABLE notification_templates IS 'Templates for different types of notifications';
COMMENT ON TABLE notification_delivery_log IS 'Log of notification delivery attempts and status';
COMMENT ON TABLE notification_batches IS 'Batched notifications for digest emails';

COMMENT ON COLUMN notifications.metadata IS 'JSON object containing additional data for rich notifications';
COMMENT ON COLUMN notifications.priority IS 'Notification priority level for sorting and filtering';
COMMENT ON COLUMN notifications.expires_at IS 'Optional expiration date for time-sensitive notifications'; 