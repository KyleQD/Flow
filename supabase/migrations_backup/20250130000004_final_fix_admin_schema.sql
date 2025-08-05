-- =============================================================================
-- FINAL FIX FOR ADMIN SCHEMA - CORRECTED COLUMN NAMES AND CONSTRAINTS
-- This migration fixes all column issues and ensures proper data insertion
-- Migration: 20250130000004_final_fix_admin_schema.sql
-- =============================================================================

-- First, let's check what columns actually exist and add missing ones safely
DO $$ 
BEGIN
  -- Add missing columns to tours table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'transportation') THEN
    ALTER TABLE tours ADD COLUMN transportation VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'accommodation') THEN
    ALTER TABLE tours ADD COLUMN accommodation VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'equipment_requirements') THEN
    ALTER TABLE tours ADD COLUMN equipment_requirements TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'crew_size') THEN
    ALTER TABLE tours ADD COLUMN crew_size INTEGER DEFAULT 0;
  END IF;
  
  -- Add missing columns to events table if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sound_requirements') THEN
    ALTER TABLE events ADD COLUMN sound_requirements TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'lighting_requirements') THEN
    ALTER TABLE events ADD COLUMN lighting_requirements TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'stage_requirements') THEN
    ALTER TABLE events ADD COLUMN stage_requirements TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'special_requirements') THEN
    ALTER TABLE events ADD COLUMN special_requirements TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_contact_name') THEN
    ALTER TABLE events ADD COLUMN venue_contact_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_contact_email') THEN
    ALTER TABLE events ADD COLUMN venue_contact_email VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_contact_phone') THEN
    ALTER TABLE events ADD COLUMN venue_contact_phone VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'load_in_time') THEN
    ALTER TABLE events ADD COLUMN load_in_time TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sound_check_time') THEN
    ALTER TABLE events ADD COLUMN sound_check_time TIME;
  END IF;
END $$;

-- Create missing tables that don't exist yet
CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
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

CREATE TABLE IF NOT EXISTS transportation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  revenue_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('pending', 'received', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  dimensions JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dashboard_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON staff_profiles(department);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_status ON staff_profiles(status);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_availability ON staff_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_date ON staff_schedules(staff_id, shift_start);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_event ON staff_schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_event ON ticket_sales(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_date ON ticket_sales(purchase_date);
CREATE INDEX IF NOT EXISTS idx_ticket_sales_status ON ticket_sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_revenue_event ON revenue(event_id);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue(revenue_date);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type_time ON analytics_metrics(metric_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_dimensions ON analytics_metrics USING GIN(dimensions);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_time ON admin_audit_log(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON admin_audit_log(resource_type, resource_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

CREATE TRIGGER update_ticket_sales_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ticket_sales
    FOR EACH ROW EXECUTE FUNCTION update_ticket_sales_count();

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