-- Enhanced Ticketing System Migration (Fixed for existing schema)
-- This migration adds new features while preserving existing data

-- =============================================================================
-- NEW TABLES FOR ENHANCED TICKETING
-- =============================================================================

-- Ticket campaigns for promotional activities
CREATE TABLE IF NOT EXISTS ticket_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('early_bird', 'flash_sale', 'group_discount', 'loyalty', 'referral', 'social_media', 'email', 'influencer')),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'buy_one_get_one', 'free_upgrade')),
  discount_value DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applicable_ticket_types UUID[] DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  social_media_platforms TEXT[] DEFAULT '{}',
  email_template_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo codes for discounts
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES ticket_campaigns(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applicable_ticket_types UUID[] DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media sharing tracking
CREATE TABLE IF NOT EXISTS ticket_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin', 'email', 'sms', 'whatsapp', 'feed', 'message')),
  share_text TEXT,
  share_url TEXT,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS ticket_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced analytics tracking
CREATE TABLE IF NOT EXISTS ticket_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  social_shares INTEGER DEFAULT 0,
  social_clicks INTEGER DEFAULT 0,
  social_conversions INTEGER DEFAULT 0,
  campaign_uses INTEGER DEFAULT 0,
  promo_code_uses INTEGER DEFAULT 0,
  referral_uses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, ticket_type_id, date)
);

-- Social media performance tracking
CREATE TABLE IF NOT EXISTS social_media_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  shares_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, platform, date)
);

-- Ticket notifications
CREATE TABLE IF NOT EXISTS ticket_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('purchase_confirmation', 'event_reminder', 'ticket_transfer', 'refund_processed', 'promo_code', 'event_update', 'cancellation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_via TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates for ticketing
CREATE TABLE IF NOT EXISTS ticket_email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticketing integrations
CREATE TABLE IF NOT EXISTS ticketing_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment_processor', 'email_service', 'social_media', 'analytics', 'crm')),
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks for ticketing events
CREATE TABLE IF NOT EXISTS ticketing_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES ticketing_integrations(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  url TEXT NOT NULL,
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ADD NEW COLUMNS TO EXISTING TABLES (Only if they don't exist)
-- =============================================================================

-- Add new columns to ticket_types table (only if they don't exist)
DO $$ 
BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'category') THEN
    ALTER TABLE ticket_types ADD COLUMN category TEXT DEFAULT 'general' CHECK (category IN ('general', 'vip', 'premium', 'early_bird', 'student', 'senior', 'group', 'backstage'));
  END IF;
  
  -- Add benefits column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'benefits') THEN
    ALTER TABLE ticket_types ADD COLUMN benefits TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add seating_section column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'seating_section') THEN
    ALTER TABLE ticket_types ADD COLUMN seating_section TEXT;
  END IF;
  
  -- Add is_transferable column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'is_transferable') THEN
    ALTER TABLE ticket_types ADD COLUMN is_transferable BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Add transfer_fee column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'transfer_fee') THEN
    ALTER TABLE ticket_types ADD COLUMN transfer_fee DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Add refund_policy column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'refund_policy') THEN
    ALTER TABLE ticket_types ADD COLUMN refund_policy TEXT DEFAULT 'No refunds';
  END IF;
  
  -- Add age_restriction column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'age_restriction') THEN
    ALTER TABLE ticket_types ADD COLUMN age_restriction INTEGER;
  END IF;
  
  -- Add requires_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'requires_id') THEN
    ALTER TABLE ticket_types ADD COLUMN requires_id BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add featured column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'featured') THEN
    ALTER TABLE ticket_types ADD COLUMN featured BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add priority_order column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'priority_order') THEN
    ALTER TABLE ticket_types ADD COLUMN priority_order INTEGER DEFAULT 0;
  END IF;
  
  -- Add ticket_code column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'ticket_code') THEN
    ALTER TABLE ticket_types ADD COLUMN ticket_code TEXT;
  END IF;
END $$;

-- Add new columns to ticket_sales table (only if they don't exist)
DO $$ 
BEGIN
  -- Add promo_code_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'promo_code_id') THEN
    ALTER TABLE ticket_sales ADD COLUMN promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL;
  END IF;
  
  -- Add referral_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'referral_id') THEN
    ALTER TABLE ticket_sales ADD COLUMN referral_id UUID REFERENCES ticket_referrals(id) ON DELETE SET NULL;
  END IF;
  
  -- Add share_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'share_id') THEN
    ALTER TABLE ticket_sales ADD COLUMN share_id UUID REFERENCES ticket_shares(id) ON DELETE SET NULL;
  END IF;
  
  -- Add unit_price column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'unit_price') THEN
    ALTER TABLE ticket_sales ADD COLUMN unit_price DECIMAL(10,2);
  END IF;
  
  -- Add discount_amount column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'discount_amount') THEN
    ALTER TABLE ticket_sales ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Add social_media_share column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'social_media_share') THEN
    ALTER TABLE ticket_sales ADD COLUMN social_media_share BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Campaign indexes
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_event_id ON ticket_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_type ON ticket_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_active ON ticket_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_dates ON ticket_campaigns(start_date, end_date);

-- Promo code indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_event_id ON promo_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_dates ON promo_codes(start_date, end_date);

-- Share tracking indexes
CREATE INDEX IF NOT EXISTS idx_ticket_shares_event_id ON ticket_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_shares_platform ON ticket_shares(platform);
CREATE INDEX IF NOT EXISTS idx_ticket_shares_user_id ON ticket_shares(user_id);

-- Referral indexes
CREATE INDEX IF NOT EXISTS idx_ticket_referrals_event_id ON ticket_referrals(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_referrals_code ON ticket_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_ticket_referrals_email ON ticket_referrals(referred_email);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_ticket_analytics_event_date ON ticket_analytics(event_id, date);
CREATE INDEX IF NOT EXISTS idx_ticket_analytics_ticket_type ON ticket_analytics(ticket_type_id);

-- Social performance indexes
CREATE INDEX IF NOT EXISTS idx_social_performance_event_platform ON social_media_performance(event_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_performance_date ON social_media_performance(date);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_ticket_notifications_user_id ON ticket_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_notifications_event_id ON ticket_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_notifications_read ON ticket_notifications(is_read);

-- Enhanced ticket_sales indexes (only if columns exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'promo_code_id') THEN
    CREATE INDEX IF NOT EXISTS idx_ticket_sales_promo_code ON ticket_sales(promo_code_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'referral_id') THEN
    CREATE INDEX IF NOT EXISTS idx_ticket_sales_referral ON ticket_sales(referral_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_sales' AND column_name = 'share_id') THEN
    CREATE INDEX IF NOT EXISTS idx_ticket_sales_share ON ticket_sales(share_id);
  END IF;
END $$;

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to generate unique ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM ticket_types WHERE ticket_code = code) INTO exists_already;
    
    -- If code doesn't exist, return it
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update ticket analytics
CREATE OR REPLACE FUNCTION update_ticket_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update analytics for the event and ticket type
  INSERT INTO ticket_analytics (event_id, ticket_type_id, date, tickets_sold, revenue_generated)
  VALUES (
    NEW.event_id,
    NEW.ticket_type_id,
    DATE(NEW.purchase_date),
    1,
    NEW.total_amount
  )
  ON CONFLICT (event_id, ticket_type_id, date)
  DO UPDATE SET
    tickets_sold = ticket_analytics.tickets_sold + 1,
    revenue_generated = ticket_analytics.revenue_generated + NEW.total_amount,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update ticket type sold count
CREATE OR REPLACE FUNCTION update_ticket_type_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the quantity_sold in ticket_types
  UPDATE ticket_types 
  SET quantity_sold = quantity_sold + NEW.quantity
  WHERE id = NEW.ticket_type_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers will be created in the fixed_triggers migration
-- to ensure proper table structure and avoid column reference errors

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE ticket_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticketing_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticketing_webhooks ENABLE ROW LEVEL SECURITY;

-- Campaign policies (with table existence checks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_campaigns' AND policyname = 'Admins can manage all campaigns') THEN
      EXECUTE 'CREATE POLICY "Admins can manage all campaigns" ON ticket_campaigns
        FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_campaigns' AND policyname = 'Event organizers can manage their campaigns') THEN
      EXECUTE 'CREATE POLICY "Event organizers can manage their campaigns" ON ticket_campaigns
        FOR ALL USING (
          event_id IN (
            SELECT e.id FROM events e 
            JOIN tours t ON e.tour_id = t.id 
            WHERE t.user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- Promo code policies (with table existence checks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promo_codes' AND policyname = 'Admins can manage all promo codes') THEN
      EXECUTE 'CREATE POLICY "Admins can manage all promo codes" ON promo_codes
        FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promo_codes' AND policyname = 'Event organizers can manage their promo codes') THEN
      EXECUTE 'CREATE POLICY "Event organizers can manage their promo codes" ON promo_codes
        FOR ALL USING (
          event_id IN (
            SELECT e.id FROM events e 
            JOIN tours t ON e.tour_id = t.id 
            WHERE t.user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- Share tracking policies (with table existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_shares' AND policyname = 'Users can view their own shares') THEN
    CREATE POLICY "Users can view their own shares" ON ticket_shares
      FOR SELECT USING (user_id = auth.uid());
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_shares' AND policyname = 'Event organizers can view shares for their events') THEN
      EXECUTE 'CREATE POLICY "Event organizers can view shares for their events" ON ticket_shares
        FOR SELECT USING (
          event_id IN (
            SELECT e.id FROM events e 
            JOIN tours t ON e.tour_id = t.id 
            WHERE t.user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- Referral policies (with table existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_referrals' AND policyname = 'Users can view their own referrals') THEN
    CREATE POLICY "Users can view their own referrals" ON ticket_referrals
      FOR SELECT USING (referrer_id = auth.uid());
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_referrals' AND policyname = 'Event organizers can view referrals for their events') THEN
      EXECUTE 'CREATE POLICY "Event organizers can view referrals for their events" ON ticket_referrals
        FOR SELECT USING (
          event_id IN (
            SELECT e.id FROM events e 
            JOIN tours t ON e.tour_id = t.id 
            WHERE t.user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- Analytics policies (with table existence checks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_analytics' AND policyname = 'Admins can view all analytics') THEN
      EXECUTE 'CREATE POLICY "Admins can view all analytics" ON ticket_analytics
        FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_analytics' AND policyname = 'Event organizers can view their analytics') THEN
      EXECUTE 'CREATE POLICY "Event organizers can view their analytics" ON ticket_analytics
        FOR SELECT USING (
          event_id IN (
            SELECT e.id FROM events e 
            JOIN tours t ON e.tour_id = t.id 
            WHERE t.user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- Social performance policies (with table existence checks)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_media_performance' AND policyname = 'Admins can view all social performance') THEN
      EXECUTE 'CREATE POLICY "Admins can view all social performance" ON social_media_performance
        FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_media_performance' AND policyname = 'Event organizers can view their social performance') THEN
      EXECUTE 'CREATE POLICY "Event organizers can view their social performance" ON social_media_performance
        FOR SELECT USING (
          event_id IN (
            SELECT e.id FROM events e 
            JOIN tours t ON e.tour_id = t.id 
            WHERE t.user_id = auth.uid()
          )
        )';
    END IF;
  END IF;
END $$;

-- Notification policies (with table existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_notifications' AND policyname = 'Users can view their own notifications') THEN
    CREATE POLICY "Users can view their own notifications" ON ticket_notifications
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- Email template policies (admin only) - with table existence check
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_email_templates' AND policyname = 'Admins can manage email templates') THEN
      EXECUTE 'CREATE POLICY "Admins can manage email templates" ON ticket_email_templates
        FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
  END IF;
END $$;

-- Integration policies (admin only) - with table existence check
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticketing_integrations' AND policyname = 'Admins can manage integrations') THEN
      EXECUTE 'CREATE POLICY "Admins can manage integrations" ON ticketing_integrations
        FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticketing_webhooks' AND policyname = 'Admins can manage webhooks') THEN
      EXECUTE 'CREATE POLICY "Admins can manage webhooks" ON ticketing_webhooks
        FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users))';
    END IF;
  END IF;
END $$;

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample email templates
INSERT INTO ticket_email_templates (name, subject, html_content, text_content, variables) VALUES
(
  'purchase_confirmation',
  'Ticket Purchase Confirmed - {{event_title}}',
  '<h1>Thank you for your purchase!</h1><p>Your tickets for {{event_title}} have been confirmed.</p><p>Order #{{order_number}}</p>',
  'Thank you for your purchase! Your tickets for {{event_title}} have been confirmed. Order #{{order_number}}',
  '{"event_title": "string", "order_number": "string"}'
),
(
  'event_reminder',
  'Reminder: {{event_title}} is tomorrow!',
  '<h1>Don''t forget!</h1><p>{{event_title}} is tomorrow at {{event_time}}.</p><p>Location: {{venue_name}}</p>',
  'Don''t forget! {{event_title}} is tomorrow at {{event_time}}. Location: {{venue_name}}',
  '{"event_title": "string", "event_time": "string", "venue_name": "string"}'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log successful migration (only if admin_audit_log table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_log') THEN
    INSERT INTO admin_audit_log (user_id, action, resource_type, resource_id, details, timestamp)
    VALUES (
      NULL,
      'migration_completed',
      'system',
      'enhanced_ticketing_system',
      '{"version": "1.0", "tables_created": 10, "columns_added": 15}',
      NOW()
    );
  END IF;
END $$; 