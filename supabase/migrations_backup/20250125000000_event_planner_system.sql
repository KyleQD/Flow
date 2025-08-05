-- =============================================================================
-- EVENT PLANNER SYSTEM MIGRATION
-- Comprehensive event planning system with 7-step workflow
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- EVENT TEMPLATES TABLE
-- Pre-defined templates for different event types
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  presets JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT PLANNER DATA TABLE
-- Main table for storing event planner workflow data
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_planner_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Step 1: Event Initiation
  name TEXT,
  description TEXT,
  template_id UUID REFERENCES event_templates(id),
  event_type TEXT,
  primary_contact TEXT,
  estimated_budget DECIMAL(12,2) DEFAULT 0,
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invite-only')),
  
  -- Step 2: Venue & Schedule
  venues JSONB DEFAULT '[]',
  schedule JSONB DEFAULT '[]',
  
  -- Step 3: Ticketing & Registration
  ticket_types JSONB DEFAULT '[]',
  registration_forms JSONB DEFAULT '[]',
  promo_codes JSONB DEFAULT '[]',
  
  -- Step 4: Team & Permissions
  team_members JSONB DEFAULT '[]',
  
  -- Step 5: Marketing & Promotion
  campaigns JSONB DEFAULT '[]',
  
  -- Step 6: Financials & Reporting
  budget JSONB DEFAULT '{}',
  
  -- Step 7: Review & Publish
  checklist JSONB DEFAULT '[]',
  publish_status TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'review', 'published')),
  
  -- Workflow tracking
  current_step INTEGER DEFAULT 1,
  completion_percentage INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT VENUES TABLE
-- Venues associated with events
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  capacity INTEGER,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  venue_type TEXT,
  amenities JSONB DEFAULT '[]',
  floor_plan_url TEXT,
  images JSONB DEFAULT '[]',
  booking_status TEXT DEFAULT 'inquiry' CHECK (booking_status IN ('inquiry', 'pending', 'confirmed', 'declined')),
  booking_cost DECIMAL(10,2),
  booking_notes TEXT,
  coordinates JSONB, -- {"lat": 40.7128, "lng": -74.0060}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT SCHEDULE ITEMS TABLE
-- Individual schedule items for events
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES event_venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  schedule_type TEXT DEFAULT 'performance' CHECK (schedule_type IN ('performance', 'workshop', 'break', 'setup', 'breakdown', 'other')),
  speaker_performer TEXT,
  equipment_requirements TEXT,
  staff_requirements JSONB DEFAULT '[]',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT TICKET TYPES TABLE
-- Ticket types and pricing for events
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER DEFAULT 0,
  max_per_customer INTEGER DEFAULT 10,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  ticket_benefits JSONB DEFAULT '[]',
  access_level TEXT DEFAULT 'general' CHECK (access_level IN ('general', 'vip', 'premium', 'backstage')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT REGISTRATION FORMS TABLE
-- Custom registration form fields
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_registration_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'phone', 'select', 'multiselect', 'checkbox', 'radio', 'textarea', 'date', 'file')),
  field_label TEXT NOT NULL,
  field_placeholder TEXT,
  field_options JSONB DEFAULT '[]', -- For select/radio/checkbox fields
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}',
  field_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT PROMO CODES TABLE
-- Promotional codes and discounts
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  applicable_ticket_types JSONB DEFAULT '[]', -- Array of ticket type IDs
  minimum_purchase_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_planner_id, code)
);

-- =============================================================================
-- EVENT TEAM MEMBERS TABLE
-- Team members and their roles for events
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'removed')),
  invitation_sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT MARKETING CAMPAIGNS TABLE
-- Marketing campaigns for events
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('email', 'social', 'influencer', 'paid_ads', 'pr', 'content')),
  platform TEXT, -- For social/paid ads: 'facebook', 'instagram', 'twitter', etc.
  target_audience JSONB DEFAULT '{}',
  budget DECIMAL(10,2) DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  metrics JSONB DEFAULT '{}', -- impressions, clicks, conversions, etc.
  campaign_content JSONB DEFAULT '{}', -- copy, images, videos, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT BUDGET CATEGORIES TABLE
-- Budget categories for event financial tracking
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(10,2) DEFAULT 0,
  estimated_amount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  parent_category_id UUID REFERENCES event_budget_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT PLANNER DOCUMENTS TABLE
-- Documents associated with event planning
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_planner_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'invoice', 'insurance', 'permit', 'rider', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_required BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- EVENT PLANNER ACTIVITY LOG TABLE
-- Track all activities and changes in event planning
-- =============================================================================

CREATE TABLE IF NOT EXISTS event_planner_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_planner_id UUID REFERENCES event_planner_data(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INSERT DEFAULT EVENT TEMPLATES
-- =============================================================================

INSERT INTO event_templates (name, description, icon, category, presets) VALUES
('Concert Tour', 'Multi-city music tour with venues, logistics, and fan engagement', '🎵', 'Music', '{"eventType": "concert", "duration": 180, "ticketTypes": ["General Admission", "VIP", "Meet & Greet"], "requiredStaff": ["Tour Manager", "Sound Engineer", "Security"]}'),
('Conference', 'Professional conference with speakers, workshops, and networking', '💼', 'Business', '{"eventType": "conference", "duration": 480, "ticketTypes": ["Early Bird", "Regular", "Student"], "requiredStaff": ["Event Coordinator", "AV Technician", "Registration"]}'),
('Festival', 'Multi-day festival with multiple stages and activities', '🎪', 'Entertainment', '{"eventType": "festival", "duration": 720, "ticketTypes": ["Single Day", "Weekend Pass", "VIP Experience"], "requiredStaff": ["Festival Director", "Stage Managers", "Security Team"]}'),
('Corporate Gala', 'Elegant corporate event with dinner, entertainment, and awards', '🏆', 'Corporate', '{"eventType": "gala", "duration": 240, "ticketTypes": ["Individual", "Corporate Table", "Sponsor Package"], "requiredStaff": ["Event Planner", "Catering Manager", "MC"]}'),
('Product Launch', 'High-impact product unveiling with media and stakeholders', '🚀', 'Marketing', '{"eventType": "launch", "duration": 120, "ticketTypes": ["Media", "Industry", "Investor"], "requiredStaff": ["Marketing Director", "PR Manager", "Demo Specialist"]}'),
('Custom Event', 'Start from scratch with complete flexibility', '⚡', 'Custom', '{"eventType": "custom", "duration": 240, "ticketTypes": ["General"], "requiredStaff": ["Event Manager"]}');

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_event_planner_data_user_id ON event_planner_data(user_id);
CREATE INDEX idx_event_planner_data_event_id ON event_planner_data(event_id);
CREATE INDEX idx_event_planner_data_publish_status ON event_planner_data(publish_status);
CREATE INDEX idx_event_venues_event_planner_id ON event_venues(event_planner_id);
CREATE INDEX idx_event_schedule_items_event_planner_id ON event_schedule_items(event_planner_id);
CREATE INDEX idx_event_ticket_types_event_planner_id ON event_ticket_types(event_planner_id);
CREATE INDEX idx_event_team_members_event_planner_id ON event_team_members(event_planner_id);
CREATE INDEX idx_event_marketing_campaigns_event_planner_id ON event_marketing_campaigns(event_planner_id);
CREATE INDEX idx_event_budget_categories_event_planner_id ON event_budget_categories(event_planner_id);
CREATE INDEX idx_event_planner_activity_log_event_planner_id ON event_planner_activity_log(event_planner_id);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_planner_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registration_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_planner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_planner_activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- Event Templates (public read, admin write)
CREATE POLICY "Anyone can view event templates"
  ON event_templates FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can use event templates"
  ON event_templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Event Planner Data (user can manage their own)
CREATE POLICY "Users can view their own event planner data"
  ON event_planner_data FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM event_team_members 
    WHERE event_planner_id = event_planner_data.id 
    AND status = 'accepted'
  ));

CREATE POLICY "Users can insert their own event planner data"
  ON event_planner_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event planner data or team members can update"
  ON event_planner_data FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM event_team_members 
    WHERE event_planner_id = event_planner_data.id 
    AND status = 'accepted'
    AND 'edit_event' = ANY(permissions)
  ));

CREATE POLICY "Users can delete their own event planner data"
  ON event_planner_data FOR DELETE
  USING (auth.uid() = user_id);

-- Event Venues (accessible by event owner and team members)
CREATE POLICY "Event team can manage venues"
  ON event_venues FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_venues.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

-- Similar policies for other related tables
CREATE POLICY "Event team can manage schedule items"
  ON event_schedule_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_schedule_items.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can manage ticket types"
  ON event_ticket_types FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_ticket_types.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can manage registration forms"
  ON event_registration_forms FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_registration_forms.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can manage promo codes"
  ON event_promo_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_promo_codes.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can manage team members"
  ON event_team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_team_members.event_planner_id
    AND epd.user_id = auth.uid()
  ) OR user_id = auth.uid());

CREATE POLICY "Event team can manage marketing campaigns"
  ON event_marketing_campaigns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_marketing_campaigns.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can manage budget categories"
  ON event_budget_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_budget_categories.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can manage documents"
  ON event_planner_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_planner_documents.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "Event team can view activity logs"
  ON event_planner_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM event_planner_data epd
    WHERE epd.id = event_planner_activity_log.event_planner_id
    AND (epd.user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM event_team_members etm
      WHERE etm.event_planner_id = epd.id 
      AND etm.status = 'accepted'
    ))
  ));

CREATE POLICY "System can insert activity logs"
  ON event_planner_activity_log FOR INSERT
  WITH CHECK (true);

-- =============================================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_event_planner_data_updated_at
    BEFORE UPDATE ON event_planner_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_venues_updated_at
    BEFORE UPDATE ON event_venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_schedule_items_updated_at
    BEFORE UPDATE ON event_schedule_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_ticket_types_updated_at
    BEFORE UPDATE ON event_ticket_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registration_forms_updated_at
    BEFORE UPDATE ON event_registration_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_promo_codes_updated_at
    BEFORE UPDATE ON event_promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_team_members_updated_at
    BEFORE UPDATE ON event_team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_marketing_campaigns_updated_at
    BEFORE UPDATE ON event_marketing_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_budget_categories_updated_at
    BEFORE UPDATE ON event_budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_planner_documents_updated_at
    BEFORE UPDATE ON event_planner_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_event_planner_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO event_planner_activity_log (
        event_planner_id,
        user_id,
        activity_type,
        activity_description,
        metadata
    ) VALUES (
        COALESCE(NEW.event_planner_id, OLD.event_planner_id),
        auth.uid(),
        TG_OP,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Created ' || TG_TABLE_NAME
            WHEN TG_OP = 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
            WHEN TG_OP = 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
        END,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 