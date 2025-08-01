-- =============================================================================
-- COMPLETE ADMIN PLATFORM SCHEMA MIGRATION
-- This migration ensures all required tables for the admin platform are properly set up
-- Migration: 20250130000000_admin_platform_complete_schema.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- CORE TOUR MANAGEMENT TABLES
-- =============================================================================

-- Ensure tours table exists with all required fields
CREATE TABLE IF NOT EXISTS tours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    total_shows INTEGER DEFAULT 0,
    completed_shows INTEGER DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0,
    expenses DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Logistics
    transportation VARCHAR(255),
    accommodation VARCHAR(255),
    equipment_requirements TEXT,
    crew_size INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_shows CHECK (completed_shows <= total_shows AND completed_shows >= 0),
    CONSTRAINT valid_budget CHECK (budget >= 0 AND expenses >= 0 AND revenue >= 0)
);

-- Ensure events table exists with all required fields
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venue_profiles(id) ON DELETE SET NULL,
    venue_name VARCHAR(255),
    venue_address TEXT,
    
    -- Event details
    event_date DATE NOT NULL,
    event_time TIME,
    doors_open TIME,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed')),
    
    -- Capacity and ticketing
    capacity INTEGER DEFAULT 0,
    tickets_sold INTEGER DEFAULT 0,
    ticket_price DECIMAL(10,2),
    vip_price DECIMAL(10,2),
    
    -- Financial
    expected_revenue DECIMAL(12,2) DEFAULT 0,
    actual_revenue DECIMAL(12,2) DEFAULT 0,
    expenses DECIMAL(12,2) DEFAULT 0,
    
    -- Technical requirements
    sound_requirements TEXT,
    lighting_requirements TEXT,
    stage_requirements TEXT,
    special_requirements TEXT,
    
    -- Contact and logistics
    venue_contact_name VARCHAR(255),
    venue_contact_email VARCHAR(255),
    venue_contact_phone VARCHAR(50),
    load_in_time TIME,
    sound_check_time TIME,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Constraints
    CONSTRAINT valid_capacity CHECK (capacity >= 0),
    CONSTRAINT valid_tickets CHECK (tickets_sold >= 0 AND tickets_sold <= capacity),
    CONSTRAINT valid_prices CHECK (ticket_price >= 0 AND vip_price >= 0),
    CONSTRAINT valid_revenue CHECK (expected_revenue >= 0 AND actual_revenue >= 0 AND expenses >= 0)
);

-- =============================================================================
-- STAFF & CREW MANAGEMENT TABLES
-- =============================================================================

-- Ensure staff_profiles table exists with all required fields
CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE, -- For payroll/HR systems
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date DATE NOT NULL,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
  salary DECIMAL(10,2),
  hourly_rate DECIMAL(8,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_tour', 'terminated')),
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'vacation', 'sick_leave')),
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}',
  performance_rating DECIMAL(3,2) DEFAULT 0 CHECK (performance_rating >= 0 AND performance_rating <= 5),
  tours_completed INTEGER DEFAULT 0,
  current_assignment TEXT,
  location TEXT,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff scheduling table
CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff_profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TICKETING SYSTEM TABLES
-- =============================================================================

-- Ticket types/categories
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity_available INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  max_per_customer INTEGER DEFAULT NULL,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket sales tracking
CREATE TABLE IF NOT EXISTS ticket_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_method TEXT,
  transaction_id TEXT,
  order_number TEXT UNIQUE NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- VENUE MANAGEMENT TABLES
-- =============================================================================

-- Ensure venue_profiles table exists (should already exist from previous migrations)
-- This is just to ensure it's properly referenced
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_profiles') THEN
    CREATE TABLE IF NOT EXISTS venue_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      venue_name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postal_code TEXT,
      capacity INTEGER,
      venue_types TEXT[] DEFAULT '{}',
      contact_info JSONB DEFAULT '{
        "phone": null,
        "email": null,
        "booking_email": null,
        "manager_name": null
      }'::jsonb,
      social_links JSONB DEFAULT '{
        "website": null,
        "instagram": null,
        "facebook": null,
        "twitter": null
      }'::jsonb,
      verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
      account_tier TEXT DEFAULT 'basic' CHECK (account_tier IN ('basic', 'pro', 'premium')),
      settings JSONB DEFAULT '{
        "public_profile": true,
        "allow_bookings": true,
        "show_contact_info": false,
        "require_approval": false
      }'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, venue_name)
    );
  END IF;
END $$;

-- =============================================================================
-- ARTIST MANAGEMENT TABLES
-- =============================================================================

-- Ensure artist_profiles table exists (should already exist from previous migrations)
-- This is just to ensure it's properly referenced
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_profiles') THEN
    CREATE TABLE IF NOT EXISTS artist_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      artist_name TEXT NOT NULL,
      bio TEXT,
      genres TEXT[] DEFAULT '{}',
      social_links JSONB DEFAULT '{
        "website": null,
        "instagram": null,
        "twitter": null,
        "facebook": null,
        "spotify": null,
        "apple_music": null,
        "youtube": null,
        "soundcloud": null
      }'::jsonb,
      verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
      account_tier TEXT DEFAULT 'basic' CHECK (account_tier IN ('basic', 'pro', 'premium')),
      settings JSONB DEFAULT '{
        "public_profile": true,
        "allow_bookings": true,
        "show_contact_info": false,
        "auto_accept_follows": true
      }'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      UNIQUE(user_id, artist_name)
    );
  END IF;
END $$;

-- =============================================================================
-- LOGISTICS & EQUIPMENT TABLES
-- =============================================================================

-- Transportation management
CREATE TABLE IF NOT EXISTS transportation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'bus', 'van', 'plane', 'train', etc.
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  cost DECIMAL(10,2),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_transit', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment management
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'sound', 'lighting', 'stage', 'backline', etc.
  description TEXT,
  serial_number TEXT,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'broken')),
  location TEXT,
  assigned_to UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  purchase_date DATE,
  purchase_cost DECIMAL(10,2),
  maintenance_schedule JSONB DEFAULT '{}',
  last_maintenance DATE,
  next_maintenance DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment assignments
CREATE TABLE IF NOT EXISTS equipment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  return_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FINANCIAL MANAGEMENT TABLES
-- =============================================================================

-- Budget categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_budget DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vendor TEXT,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  approved_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'ticket_sales', 'merchandise', 'sponsorship', etc.
  amount DECIMAL(10,2) NOT NULL,
  revenue_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('pending', 'received', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS & REPORTING TABLES
-- =============================================================================

-- Analytics metrics
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL, -- 'revenue', 'tickets_sold', 'attendance', etc.
  metric_value DECIMAL(15,2) NOT NULL,
  dimensions JSONB DEFAULT '{}', -- For storing additional context
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard configurations
CREATE TABLE IF NOT EXISTS dashboard_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dashboard_type TEXT NOT NULL, -- 'admin', 'tour_manager', 'staff', etc.
  configuration JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SYSTEM & INTEGRATION TABLES
-- =============================================================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_type TEXT NOT NULL, -- 'payment_processor', 'social_media', 'email', etc.
  provider_name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'tour', 'event', 'staff', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Tours indexes
CREATE INDEX IF NOT EXISTS idx_tours_artist_id ON tours(artist_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_dates ON tours(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tours_created_by ON tours(created_by);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_tour_id ON events(tour_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON staff_profiles(department);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_status ON staff_profiles(status);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_availability ON staff_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_date ON staff_schedules(staff_id, shift_start);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_event ON staff_schedules(event_id);

-- Ticketing indexes
CREATE INDEX IF NOT EXISTS idx_ticket_sales_event ON ticket_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_date ON ticket_sales(purchase_date);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_status ON ticket_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_expenses_budget ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_revenue_event ON revenue(event_id);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue(revenue_date);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type_time ON analytics_metrics(metric_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_dimensions ON analytics_metrics USING GIN(dimensions);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_time ON admin_audit_log(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON admin_audit_log(resource_type, resource_id);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_profiles_updated_at BEFORE UPDATE ON staff_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON staff_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON ticket_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_sales_updated_at BEFORE UPDATE ON ticket_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transportation_updated_at BEFORE UPDATE ON transportation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_assignments_updated_at BEFORE UPDATE ON equipment_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON revenue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_configurations_updated_at BEFORE UPDATE ON dashboard_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ticket sales count update function
CREATE OR REPLACE FUNCTION update_ticket_sales_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ticket_types 
        SET quantity_sold = quantity_sold + NEW.quantity
        WHERE id = NEW.ticket_type_id;
        
        UPDATE events 
        SET tickets_sold = tickets_sold + NEW.quantity
        WHERE id = NEW.event_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE ticket_types 
        SET quantity_sold = quantity_sold - OLD.quantity + NEW.quantity
        WHERE id = NEW.ticket_type_id;
        
        UPDATE events 
        SET tickets_sold = tickets_sold - OLD.quantity + NEW.quantity
        WHERE id = NEW.event_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ticket_types 
        SET quantity_sold = quantity_sold - OLD.quantity
        WHERE id = OLD.ticket_type_id;
        
        UPDATE events 
        SET tickets_sold = tickets_sold - OLD.quantity
        WHERE id = OLD.event_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket sales count updates
CREATE TRIGGER update_ticket_sales_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ticket_sales
    FOR EACH ROW EXECUTE FUNCTION update_ticket_sales_count();

-- Admin audit log function
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_audit_log (
        user_id, action, resource_type, resource_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        auth.uid(), 
        TG_OP, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr(),
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Tours policies
CREATE POLICY "Users can view tours they're associated with" ON tours
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() = artist_id OR
        EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create tours" ON tours
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tours they created or are team members of" ON tours
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
    );

CREATE POLICY "Users can delete tours they created" ON tours
    FOR DELETE USING (auth.uid() = created_by);

-- Events policies  
CREATE POLICY "Users can view events for tours they're associated with" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR 
                auth.uid() = tours.artist_id OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can create events for tours they're associated with" ON events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

CREATE POLICY "Users can update events for tours they're associated with" ON events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND (
                auth.uid() = tours.created_by OR
                EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid() AND status = 'confirmed')
            )
        )
    );

CREATE POLICY "Users can delete events for tours they created" ON events
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = events.tour_id 
            AND auth.uid() = tours.created_by
        )
    );

-- Staff policies
CREATE POLICY "Staff can view their own profiles" ON staff_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can update their own profiles" ON staff_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Ticket sales policies
CREATE POLICY "Users can view ticket sales for events they're associated with" ON ticket_sales
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events 
            WHERE events.id = ticket_sales.event_id 
            AND EXISTS (
                SELECT 1 FROM tours 
                WHERE tours.id = events.tour_id 
                AND (
                    auth.uid() = tours.created_by OR 
                    auth.uid() = tours.artist_id OR
                    EXISTS (SELECT 1 FROM tour_team_members WHERE tour_id = tours.id AND user_id = auth.uid())
                )
            )
        )
    );

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample budget categories
INSERT INTO budget_categories (name, description, color) VALUES
('Transportation', 'Travel and transportation costs', '#3B82F6'),
('Accommodation', 'Hotel and lodging expenses', '#10B981'),
('Equipment', 'Sound, lighting, and stage equipment', '#F59E0B'),
('Marketing', 'Advertising and promotional costs', '#EF4444'),
('Staff', 'Crew and staff expenses', '#8B5CF6'),
('Venue', 'Venue rental and related costs', '#06B6D4'),
('Catering', 'Food and beverage costs', '#84CC16'),
('Insurance', 'Event and liability insurance', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
('default_currency', '"USD"', 'Default currency for financial calculations', true),
('ticket_fee_percentage', '5.0', 'Default ticket processing fee percentage', true),
('max_ticket_quantity', '10', 'Maximum tickets per customer', true),
('auto_approve_bookings', 'false', 'Automatically approve booking requests', false),
('notification_settings', '{"email": true, "sms": false, "push": true}', 'Default notification preferences', false)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
INSERT INTO admin_audit_log (action, resource_type, resource_id, new_values) 
VALUES ('MIGRATION_COMPLETED', 'schema', NULL, '{"migration": "20250130000000_admin_platform_complete_schema.sql", "tables_created": "all_required_tables", "status": "success"}'); 