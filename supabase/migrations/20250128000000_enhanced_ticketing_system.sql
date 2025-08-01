-- =============================================================================
-- ENHANCED TICKETING SYSTEM MIGRATION
-- Comprehensive ticketing system with social features, promotion tools, and analytics
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCED TICKET TYPES TABLE
-- =============================================================================

-- Add new columns to existing ticket_types table
ALTER TABLE ticket_types 
ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('general', 'vip', 'premium', 'early_bird', 'student', 'senior', 'group', 'backstage')),
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS seating_section TEXT,
ADD COLUMN IF NOT EXISTS seating_row TEXT,
ADD COLUMN IF NOT EXISTS seating_number TEXT,
ADD COLUMN IF NOT EXISTS is_transferable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS transfer_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_policy TEXT DEFAULT 'No refunds',
ADD COLUMN IF NOT EXISTS age_restriction INTEGER,
ADD COLUMN IF NOT EXISTS requires_id BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promo_codes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS share_url TEXT,
ADD COLUMN IF NOT EXISTS social_media_meta JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_order INTEGER DEFAULT 0;

-- =============================================================================
-- TICKET PROMOTION & MARKETING TABLES
-- =============================================================================

-- Promotional campaigns
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

-- Promotional codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES ticket_campaigns(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
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
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'email', 'sms', 'whatsapp', 'telegram', 'copy_link')),
  share_url TEXT,
  share_text TEXT,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket referral system
CREATE TABLE IF NOT EXISTS ticket_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ENHANCED TICKET SALES TABLE
-- =============================================================================

-- Add new columns to existing ticket_sales table
ALTER TABLE ticket_sales 
ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id),
ADD COLUMN IF NOT EXISTS referral_id UUID REFERENCES ticket_referrals(id),
ADD COLUMN IF NOT EXISTS share_source TEXT,
ADD COLUMN IF NOT EXISTS share_platform TEXT,
ADD COLUMN IF NOT EXISTS share_id UUID REFERENCES ticket_shares(id),
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'digital' CHECK (delivery_method IN ('digital', 'email', 'sms', 'mail')),
ADD COLUMN IF NOT EXISTS ticket_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS transfer_to_email TEXT,
ADD COLUMN IF NOT EXISTS transfer_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS social_media_share BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS review_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS review_sent_date TIMESTAMPTZ;

-- =============================================================================
-- TICKET ANALYTICS & REPORTING TABLES
-- =============================================================================

-- Ticket sales analytics
CREATE TABLE IF NOT EXISTS ticket_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  refunds INTEGER DEFAULT 0,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  avg_ticket_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, ticket_type_id, date)
);

-- Social media performance tracking
CREATE TABLE IF NOT EXISTS social_media_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_id TEXT,
  post_url TEXT,
  shares_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  post_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TICKET NOTIFICATIONS & COMMUNICATIONS
-- =============================================================================

-- Ticket notifications
CREATE TABLE IF NOT EXISTS ticket_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_sale_id UUID REFERENCES ticket_sales(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('purchase_confirmation', 'event_reminder', 'ticket_transfer', 'refund_processed', 'promo_code', 'event_update', 'cancellation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_via TEXT[] DEFAULT '{}', -- 'email', 'sms', 'push', 'in_app'
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates for ticketing
CREATE TABLE IF NOT EXISTS ticket_email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TICKET INTEGRATIONS & WEBHOOKS
-- =============================================================================

-- External ticketing platform integrations
CREATE TABLE IF NOT EXISTS ticketing_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_name TEXT NOT NULL, -- 'eventbrite', 'ticketmaster', 'stubhub', etc.
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  sync_enabled BOOLEAN DEFAULT FALSE,
  last_sync TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle',
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events for ticketing
CREATE TABLE IF NOT EXISTS ticketing_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES ticketing_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Ticket types indexes
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_category ON ticket_types(category);
CREATE INDEX IF NOT EXISTS idx_ticket_types_featured ON ticket_types(featured);
CREATE INDEX IF NOT EXISTS idx_ticket_types_sale_dates ON ticket_types(sale_start, sale_end);

-- Ticket sales indexes
CREATE INDEX IF NOT EXISTS idx_ticket_sales_event_id ON ticket_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_customer_email ON ticket_sales(customer_email);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_payment_status ON ticket_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_purchase_date ON ticket_sales(purchase_date);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_promo_code ON ticket_sales(promo_code_id);

-- Campaigns and promotions indexes
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_event_id ON ticket_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_dates ON ticket_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_event_id ON promo_codes(event_id);

-- Social sharing indexes
CREATE INDEX IF NOT EXISTS idx_ticket_shares_event_id ON ticket_shares(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_shares_platform ON ticket_shares(platform);
CREATE INDEX IF NOT EXISTS idx_ticket_shares_user_id ON ticket_shares(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_ticket_analytics_event_date ON ticket_analytics(event_id, date);
CREATE INDEX IF NOT EXISTS idx_social_performance_event_platform ON social_media_performance(event_id, platform);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to generate unique ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    code := 'TKT' || upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM ticket_types WHERE ticket_code = code) INTO exists_already;
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
  -- Update daily analytics
  INSERT INTO ticket_analytics (
    event_id, 
    ticket_type_id, 
    date, 
    tickets_sold, 
    revenue, 
    refunds, 
    refund_amount,
    avg_ticket_price
  )
  VALUES (
    NEW.event_id,
    NEW.ticket_type_id,
    DATE(NEW.purchase_date),
    NEW.quantity,
    NEW.total_amount,
    CASE WHEN NEW.payment_status = 'refunded' THEN NEW.quantity ELSE 0 END,
    CASE WHEN NEW.payment_status = 'refunded' THEN NEW.total_amount ELSE 0 END,
    NEW.total_amount / NEW.quantity
  )
  ON CONFLICT (event_id, ticket_type_id, date)
  DO UPDATE SET
    tickets_sold = ticket_analytics.tickets_sold + EXCLUDED.tickets_sold,
    revenue = ticket_analytics.revenue + EXCLUDED.revenue,
    refunds = ticket_analytics.refunds + EXCLUDED.refunds,
    refund_amount = ticket_analytics.refund_amount + EXCLUDED.refund_amount,
    avg_ticket_price = (ticket_analytics.revenue + EXCLUDED.revenue) / (ticket_analytics.tickets_sold + EXCLUDED.tickets_sold);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics on ticket sales
CREATE TRIGGER trigger_update_ticket_analytics
  AFTER INSERT OR UPDATE ON ticket_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_analytics();

-- Function to update ticket type sold count
CREATE OR REPLACE FUNCTION update_ticket_type_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ticket_types 
    SET quantity_sold = quantity_sold + NEW.quantity
    WHERE id = NEW.ticket_type_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE ticket_types 
    SET quantity_sold = quantity_sold - OLD.quantity + NEW.quantity
    WHERE id = NEW.ticket_type_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ticket_types 
    SET quantity_sold = quantity_sold - OLD.quantity
    WHERE id = OLD.ticket_type_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ticket type sold count
CREATE TRIGGER trigger_update_ticket_type_sold_count
  AFTER INSERT OR UPDATE OR DELETE ON ticket_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_type_sold_count();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;
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

-- Ticket types policies
CREATE POLICY "Public can view active ticket types" ON ticket_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Event organizers can manage their ticket types" ON ticket_types
  FOR ALL USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Ticket sales policies
CREATE POLICY "Users can view their own ticket purchases" ON ticket_sales
  FOR SELECT USING (customer_id = auth.uid() OR customer_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));

CREATE POLICY "Event organizers can view sales for their events" ON ticket_sales
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Campaigns policies
CREATE POLICY "Public can view active campaigns" ON ticket_campaigns
  FOR SELECT USING (is_active = true AND end_date > NOW());

CREATE POLICY "Event organizers can manage their campaigns" ON ticket_campaigns
  FOR ALL USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Promo codes policies
CREATE POLICY "Public can view active promo codes" ON promo_codes
  FOR SELECT USING (is_active = true AND end_date > NOW());

-- Sharing policies
CREATE POLICY "Users can view their own shares" ON ticket_shares
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public can view share statistics" ON ticket_shares
  FOR SELECT USING (true);

-- Analytics policies
CREATE POLICY "Event organizers can view their analytics" ON ticket_analytics
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON ticket_notifications
  FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- SAMPLE DATA INSERTION
-- =============================================================================

-- Insert sample email templates
INSERT INTO ticket_email_templates (name, subject, html_template, text_template, variables) VALUES
(
  'purchase_confirmation',
  'Your tickets for {{event_name}} are confirmed!',
  '<!DOCTYPE html><html><body><h1>Ticket Confirmation</h1><p>Thank you for your purchase!</p><p>Event: {{event_name}}</p><p>Date: {{event_date}}</p><p>Order: {{order_number}}</p></body></html>',
  'Ticket Confirmation\n\nThank you for your purchase!\nEvent: {{event_name}}\nDate: {{event_date}}\nOrder: {{order_number}}',
  '{"event_name": "string", "event_date": "string", "order_number": "string"}'
),
(
  'event_reminder',
  'Reminder: {{event_name}} is tomorrow!',
  '<!DOCTYPE html><html><body><h1>Event Reminder</h1><p>Don''t forget about your event tomorrow!</p><p>Event: {{event_name}}</p><p>Time: {{event_time}}</p><p>Location: {{event_location}}</p></body></html>',
  'Event Reminder\n\nDon''t forget about your event tomorrow!\nEvent: {{event_name}}\nTime: {{event_time}}\nLocation: {{event_location}}',
  '{"event_name": "string", "event_time": "string", "event_location": "string"}'
);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Enhanced ticketing system migration completed successfully!';
  RAISE NOTICE 'New features added:';
  RAISE NOTICE '- Advanced ticket types with categories and benefits';
  RAISE NOTICE '- Promotional campaigns and promo codes';
  RAISE NOTICE '- Social media sharing tracking';
  RAISE NOTICE '- Referral system';
  RAISE NOTICE '- Comprehensive analytics';
  RAISE NOTICE '- Email notifications and templates';
  RAISE NOTICE '- External platform integrations';
  RAISE NOTICE '- Row Level Security policies';
END $$; 