-- =============================================================================
-- COMPREHENSIVE ADMIN BACKEND SETUP
-- This migration creates all necessary tables and functions for admin functionality
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- STAFF & CREW MANAGEMENT SYSTEM
-- =============================================================================

-- Enhanced staff profiles table
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
  tour_id UUID, -- Reference to tours table
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TICKETING SYSTEM
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
-- LOGISTICS MANAGEMENT
-- =============================================================================

-- Transportation management
CREATE TABLE IF NOT EXISTS transportation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID, -- Reference to tours table
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bus', 'van', 'truck', 'plane', 'train', 'other')),
  provider TEXT,
  vehicle_details JSONB DEFAULT '{}',
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  assigned_staff UUID[] DEFAULT '{}',
  cost DECIMAL(10,2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'booked', 'in_transit', 'completed', 'cancelled')),
  driver_info JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment management
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  serial_number TEXT UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
  location TEXT,
  assigned_to UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  maintenance_schedule JSONB DEFAULT '{}',
  last_maintenance DATE,
  next_maintenance DATE,
  warranty_expiry DATE,
  is_available BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment assignments for events/tours
CREATE TABLE IF NOT EXISTS equipment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID, -- Reference to tours table
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  return_date TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_use', 'returned', 'damaged')),
  condition_out TEXT,
  condition_in TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FINANCIAL MANAGEMENT
-- =============================================================================

-- Budget categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget tracking
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID, -- Reference to tours table
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  budgeted_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  period_start DATE,
  period_end DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE NOT NULL,
  tour_id UUID, -- Reference to tours table
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  expense_date DATE NOT NULL,
  vendor TEXT,
  payment_method TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID, -- Reference to tours table
  source TEXT NOT NULL, -- 'tickets', 'merchandise', 'sponsorship', etc.
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  revenue_date DATE NOT NULL,
  payment_received BOOLEAN DEFAULT FALSE,
  payment_date DATE,
  fees DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount - fees) STORED,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS & REPORTING
-- =============================================================================

-- Analytics metrics tracking
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL, -- 'event_attendance', 'revenue', 'ticket_sales', etc.
  metric_name TEXT NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  dimensions JSONB DEFAULT '{}', -- For grouping/filtering (event_id, date, location, etc.)
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Performance dashboards configuration
CREATE TABLE IF NOT EXISTS dashboard_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dashboard_name TEXT NOT NULL,
  layout JSONB NOT NULL, -- Widget positions and configurations
  filters JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dashboard_name)
);

-- =============================================================================
-- SYSTEM SETTINGS & CONFIGURATION
-- =============================================================================

-- System configuration settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- 'general', 'security', 'notifications', 'integrations'
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, setting_key)
);

-- Integration configurations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- 'stripe', 'mailgun', 'twilio', etc.
  type TEXT NOT NULL, -- 'payment', 'email', 'sms', 'analytics'
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  configuration JSONB NOT NULL,
  credentials JSONB, -- Encrypted API keys, tokens, etc.
  webhook_url TEXT,
  last_sync TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never' CHECK (sync_status IN ('never', 'success', 'error')),
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Staff management indexes
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
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
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

-- Function to automatically update ticket sales count
CREATE OR REPLACE FUNCTION update_ticket_sales_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ticket_types 
        SET quantity_sold = quantity_sold + NEW.quantity
        WHERE id = NEW.ticket_type_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity THEN
        UPDATE ticket_types 
        SET quantity_sold = quantity_sold + (NEW.quantity - OLD.quantity)
        WHERE id = NEW.ticket_type_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ticket_types 
        SET quantity_sold = quantity_sold - OLD.quantity
        WHERE id = OLD.ticket_type_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply ticket sales trigger
CREATE TRIGGER update_ticket_sales_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ticket_sales
    FOR EACH ROW EXECUTE FUNCTION update_ticket_sales_count();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO admin_audit_log (user_id, action, resource_type, resource_id, new_values)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::text, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO admin_audit_log (user_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO admin_audit_log (user_id, action, resource_type, resource_id, old_values)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all admin tables
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin access policies (admins can access everything)
CREATE POLICY "Admins can manage all staff" ON staff_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all schedules" ON staff_schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all tickets" ON ticket_types FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all sales" ON ticket_sales FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all transportation" ON transportation FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all equipment" ON equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all equipment assignments" ON equipment_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all budget categories" ON budget_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all budgets" ON budgets FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all expenses" ON expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage all revenue" ON revenue FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can view all analytics" ON analytics_metrics FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Users can manage their own dashboards" ON dashboard_configurations FOR ALL USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can manage integrations" ON integrations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

CREATE POLICY "Admins can view audit log" ON admin_audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
);

-- =============================================================================
-- SEED DATA FOR BUDGET CATEGORIES
-- =============================================================================

INSERT INTO budget_categories (name, description) VALUES
('Production', 'Stage, sound, lighting, and technical production'),
('Transportation', 'Tour buses, flights, local transport'),
('Accommodation', 'Hotels, lodging, and hospitality'),
('Staff & Crew', 'Salaries, wages, and crew expenses'),
('Marketing', 'Promotion, advertising, and publicity'),
('Equipment', 'Instruments, gear, and technical equipment'),
('Catering', 'Food and beverages for staff and crew'),
('Insurance', 'Tour insurance and liability coverage'),
('Merchandise', 'Tour merchandise and sales'),
('Miscellaneous', 'Other tour-related expenses')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- SEED DATA FOR SYSTEM SETTINGS
-- =============================================================================

INSERT INTO system_settings (category, setting_key, setting_value, description) VALUES
('general', 'organization_name', '"Tourify Event Management"', 'Organization display name'),
('general', 'default_timezone', '"UTC"', 'Default system timezone'),
('general', 'default_currency', '"USD"', 'Default currency for financial operations'),
('security', 'session_timeout', '30', 'Session timeout in minutes'),
('security', 'max_login_attempts', '5', 'Maximum failed login attempts'),
('security', 'password_expiry_days', '90', 'Password expiry period in days'),
('notifications', 'email_enabled', 'true', 'Enable email notifications'),
('notifications', 'push_enabled', 'true', 'Enable push notifications'),
('notifications', 'sms_enabled', 'false', 'Enable SMS notifications')
ON CONFLICT (category, setting_key) DO NOTHING;

-- Log completion
SELECT 'Admin backend setup completed successfully!' as status; 