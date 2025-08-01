-- =============================================================================
-- DIAGNOSE AND FIX SCHEMA - CHECK EXISTING COLUMNS AND ADD MISSING ONES
-- This migration diagnoses the actual database structure and fixes it
-- Migration: 20250130000006_diagnose_and_fix_schema.sql
-- =============================================================================

-- First, let's check what columns actually exist in the tours table
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '=== DIAGNOSING TOURS TABLE STRUCTURE ===';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tours' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable, 
            col_record.column_default;
    END LOOP;
END $$;

-- Check events table structure
DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '=== DIAGNOSING EVENTS TABLE STRUCTURE ===';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'events' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable, 
            col_record.column_default;
    END LOOP;
END $$;

-- Now add missing columns to tours table if they don't exist
DO $$ 
BEGIN
    -- Add artist_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'artist_id') THEN
        RAISE NOTICE 'Adding artist_id column to tours table';
        ALTER TABLE tours ADD COLUMN artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    ELSE
        RAISE NOTICE 'artist_id column already exists in tours table';
    END IF;
    
    -- Add transportation if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'transportation') THEN
        RAISE NOTICE 'Adding transportation column to tours table';
        ALTER TABLE tours ADD COLUMN transportation VARCHAR(255);
    ELSE
        RAISE NOTICE 'transportation column already exists in tours table';
    END IF;
    
    -- Add accommodation if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'accommodation') THEN
        RAISE NOTICE 'Adding accommodation column to tours table';
        ALTER TABLE tours ADD COLUMN accommodation VARCHAR(255);
    ELSE
        RAISE NOTICE 'accommodation column already exists in tours table';
    END IF;
    
    -- Add equipment_requirements if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'equipment_requirements') THEN
        RAISE NOTICE 'Adding equipment_requirements column to tours table';
        ALTER TABLE tours ADD COLUMN equipment_requirements TEXT;
    ELSE
        RAISE NOTICE 'equipment_requirements column already exists in tours table';
    END IF;
    
    -- Add crew_size if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'crew_size') THEN
        RAISE NOTICE 'Adding crew_size column to tours table';
        ALTER TABLE tours ADD COLUMN crew_size INTEGER DEFAULT 0;
    ELSE
        RAISE NOTICE 'crew_size column already exists in tours table';
    END IF;
END $$;

-- Add missing columns to events table if they don't exist
DO $$ 
BEGIN
    -- Add sound_requirements if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sound_requirements') THEN
        RAISE NOTICE 'Adding sound_requirements column to events table';
        ALTER TABLE events ADD COLUMN sound_requirements TEXT;
    ELSE
        RAISE NOTICE 'sound_requirements column already exists in events table';
    END IF;
    
    -- Add lighting_requirements if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'lighting_requirements') THEN
        RAISE NOTICE 'Adding lighting_requirements column to events table';
        ALTER TABLE events ADD COLUMN lighting_requirements TEXT;
    ELSE
        RAISE NOTICE 'lighting_requirements column already exists in events table';
    END IF;
    
    -- Add stage_requirements if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'stage_requirements') THEN
        RAISE NOTICE 'Adding stage_requirements column to events table';
        ALTER TABLE events ADD COLUMN stage_requirements TEXT;
    ELSE
        RAISE NOTICE 'stage_requirements column already exists in events table';
    END IF;
    
    -- Add special_requirements if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'special_requirements') THEN
        RAISE NOTICE 'Adding special_requirements column to events table';
        ALTER TABLE events ADD COLUMN special_requirements TEXT;
    ELSE
        RAISE NOTICE 'special_requirements column already exists in events table';
    END IF;
    
    -- Add venue_contact_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_contact_name') THEN
        RAISE NOTICE 'Adding venue_contact_name column to events table';
        ALTER TABLE events ADD COLUMN venue_contact_name VARCHAR(255);
    ELSE
        RAISE NOTICE 'venue_contact_name column already exists in events table';
    END IF;
    
    -- Add venue_contact_email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_contact_email') THEN
        RAISE NOTICE 'Adding venue_contact_email column to events table';
        ALTER TABLE events ADD COLUMN venue_contact_email VARCHAR(255);
    ELSE
        RAISE NOTICE 'venue_contact_email column already exists in events table';
    END IF;
    
    -- Add venue_contact_phone if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'venue_contact_phone') THEN
        RAISE NOTICE 'Adding venue_contact_phone column to events table';
        ALTER TABLE events ADD COLUMN venue_contact_phone VARCHAR(50);
    ELSE
        RAISE NOTICE 'venue_contact_phone column already exists in events table';
    END IF;
    
    -- Add load_in_time if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'load_in_time') THEN
        RAISE NOTICE 'Adding load_in_time column to events table';
        ALTER TABLE events ADD COLUMN load_in_time TIME;
    ELSE
        RAISE NOTICE 'load_in_time column already exists in events table';
    END IF;
    
    -- Add sound_check_time if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'sound_check_time') THEN
        RAISE NOTICE 'Adding sound_check_time column to events table';
        ALTER TABLE events ADD COLUMN sound_check_time TIME;
    ELSE
        RAISE NOTICE 'sound_check_time column already exists in events table';
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budget_categories' AND column_name = 'color') THEN
        RAISE NOTICE 'Adding color column to budget_categories table';
        ALTER TABLE budget_categories ADD COLUMN color TEXT DEFAULT '#3B82F6';
    ELSE
        RAISE NOTICE 'color column already exists in budget_categories table';
    END IF;
    
    -- Add unique constraint on name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'budget_categories' AND constraint_name = 'budget_categories_name_key') THEN
        RAISE NOTICE 'Adding unique constraint on name column for budget_categories table';
        ALTER TABLE budget_categories ADD CONSTRAINT budget_categories_name_key UNIQUE (name);
    ELSE
        RAISE NOTICE 'Unique constraint on name column already exists in budget_categories table';
    END IF;
END $$;

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

-- Insert sample budget categories safely
DO $$
BEGIN
    -- Insert budget categories one by one to handle potential conflicts
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Transportation', 'Travel and transportation costs', '#3B82F6')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Accommodation', 'Hotel and lodging expenses', '#10B981')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Equipment', 'Sound, lighting, and stage equipment', '#F59E0B')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Marketing', 'Advertising and promotional costs', '#EF4444')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Staff', 'Crew and staff expenses', '#8B5CF6')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Venue', 'Venue rental and related costs', '#06B6D4')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Catering', 'Food and beverage costs', '#84CC16')
    ON CONFLICT (name) DO NOTHING;
    
    INSERT INTO budget_categories (name, description, color) VALUES
    ('Insurance', 'Event and liability insurance', '#F97316')
    ON CONFLICT (name) DO NOTHING;
    
    RAISE NOTICE 'Budget categories inserted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting budget categories: %', SQLERRM;
END $$;

-- Insert sample system settings safely
DO $$
BEGIN
    -- Insert system settings one by one to handle potential conflicts
    INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('default_currency', '"USD"', 'Default currency for financial calculations', true)
    ON CONFLICT (setting_key) DO NOTHING;
    
    INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('ticket_fee_percentage', '5.0', 'Default ticket processing fee percentage', true)
    ON CONFLICT (setting_key) DO NOTHING;
    
    INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('max_ticket_quantity', '10', 'Maximum tickets per customer', true)
    ON CONFLICT (setting_key) DO NOTHING;
    
    INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('auto_approve_bookings', 'false', 'Automatically approve booking requests', false)
    ON CONFLICT (setting_key) DO NOTHING;
    
    INSERT INTO system_settings (setting_key, setting_value, description, is_public) VALUES
    ('notification_settings', '{"email": true, "sms": false, "push": true}', 'Default notification preferences', false)
    ON CONFLICT (setting_key) DO NOTHING;
    
    RAISE NOTICE 'System settings inserted successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting system settings: %', SQLERRM;
END $$;

-- Final completion notice
DO $$
BEGIN
    RAISE NOTICE '=== SCHEMA DIAGNOSIS AND FIX COMPLETED ===';
END $$; 