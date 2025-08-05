-- =============================================================================
-- BACKLINE & RENTALS SYSTEM MIGRATION
-- This migration extends the equipment management system with comprehensive
-- backline and rental functionality for music industry equipment
-- Migration: 20250131000000_backline_rentals_system.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- ENHANCE EXISTING EQUIPMENT TABLE FOR BACKLINE SUPPORT
-- =============================================================================

-- Add backline-specific columns to equipment table if they don't exist
DO $$
BEGIN
    -- Add rental_rate column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'rental_rate') THEN
        ALTER TABLE equipment ADD COLUMN rental_rate DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add is_rentable column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'is_rentable') THEN
        ALTER TABLE equipment ADD COLUMN is_rentable BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add rental_category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'rental_category') THEN
        ALTER TABLE equipment ADD COLUMN rental_category TEXT;
    END IF;
    
    -- Add brand column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'brand') THEN
        ALTER TABLE equipment ADD COLUMN brand TEXT;
    END IF;
    
    -- Add model column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'model') THEN
        ALTER TABLE equipment ADD COLUMN model TEXT;
    END IF;
    
    -- Add year_manufactured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'year_manufactured') THEN
        ALTER TABLE equipment ADD COLUMN year_manufactured INTEGER;
    END IF;
    
    -- Add insurance_value column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'insurance_value') THEN
        ALTER TABLE equipment ADD COLUMN insurance_value DECIMAL(10,2);
    END IF;
    
    -- Add replacement_cost column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'replacement_cost') THEN
        ALTER TABLE equipment ADD COLUMN replacement_cost DECIMAL(10,2);
    END IF;
    
    -- Add rental_terms column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'rental_terms') THEN
        ALTER TABLE equipment ADD COLUMN rental_terms JSONB DEFAULT '{}';
    END IF;
    
    -- Add rental_history column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'rental_history') THEN
        ALTER TABLE equipment ADD COLUMN rental_history JSONB DEFAULT '[]';
    END IF;
END $$;

-- =============================================================================
-- RENTAL CLIENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  tax_id TEXT,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  payment_terms TEXT DEFAULT 'net_30',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- RENTAL AGREEMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agreement_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES rental_clients(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  
  -- Agreement details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  
  -- Financial details
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status and terms
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'active', 'completed', 'cancelled', 'overdue')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  
  -- Terms and conditions
  terms_conditions TEXT,
  special_requirements TEXT,
  insurance_required BOOLEAN DEFAULT FALSE,
  insurance_amount DECIMAL(10,2),
  
  -- Contact information
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Delivery/pickup
  delivery_address TEXT,
  delivery_instructions TEXT,
  pickup_instructions TEXT,
  
  -- Metadata
  created_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_rental_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0 AND paid_amount >= 0)
);

-- =============================================================================
-- RENTAL AGREEMENT ITEMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_agreement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_agreement_id UUID REFERENCES rental_agreements(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  
  -- Item details
  quantity INTEGER DEFAULT 1,
  daily_rate DECIMAL(10,2) NOT NULL,
  total_days INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  
  -- Condition tracking
  condition_out TEXT,
  condition_in TEXT,
  damage_notes TEXT,
  damage_photos TEXT[],
  
  -- Status
  status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'picked_up', 'returned', 'damaged', 'lost')),
  
  -- Dates
  actual_pickup_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_quantities CHECK (quantity > 0),
  CONSTRAINT valid_rates CHECK (daily_rate >= 0),
  CONSTRAINT valid_days CHECK (total_days > 0),
  CONSTRAINT valid_subtotal CHECK (subtotal >= 0)
);

-- =============================================================================
-- RENTAL PAYMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_agreement_id UUID REFERENCES rental_agreements(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment details
  payment_number TEXT UNIQUE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'partial', 'final', 'refund', 'damage_deposit')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'paypal', 'other')),
  
  -- Payment processing
  transaction_id TEXT,
  payment_date TIMESTAMPTZ NOT NULL,
  processed_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_payment_amount CHECK (amount > 0)
);

-- =============================================================================
-- EQUIPMENT DAMAGE REPORTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS equipment_damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_agreement_id UUID REFERENCES rental_agreements(id) ON DELETE CASCADE NOT NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  
  -- Damage details
  damage_type TEXT NOT NULL CHECK (damage_type IN ('minor', 'moderate', 'severe', 'total_loss')),
  damage_description TEXT NOT NULL,
  damage_photos TEXT[],
  
  -- Assessment
  estimated_repair_cost DECIMAL(10,2),
  actual_repair_cost DECIMAL(10,2),
  replacement_cost DECIMAL(10,2),
  
  -- Insurance
  insurance_claim_filed BOOLEAN DEFAULT FALSE,
  insurance_claim_number TEXT,
  insurance_amount DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'assessed', 'repairing', 'repaired', 'replaced', 'closed')),
  
  -- Responsibility
  responsible_party TEXT CHECK (responsible_party IN ('client', 'company', 'insurance', 'shared')),
  client_liability_percentage INTEGER DEFAULT 0 CHECK (client_liability_percentage >= 0 AND client_liability_percentage <= 100),
  
  -- Dates
  damage_date TIMESTAMPTZ,
  reported_date TIMESTAMPTZ DEFAULT NOW(),
  resolved_date TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Staff
  reported_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  assessed_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- RENTAL INSURANCE POLICIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_agreement_id UUID REFERENCES rental_agreements(id) ON DELETE CASCADE NOT NULL,
  
  -- Policy details
  policy_number TEXT NOT NULL,
  insurance_company TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('liability', 'equipment', 'comprehensive')),
  
  -- Coverage
  coverage_amount DECIMAL(10,2) NOT NULL,
  deductible DECIMAL(10,2) DEFAULT 0,
  premium_amount DECIMAL(10,2) NOT NULL,
  
  -- Dates
  effective_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'claimed')),
  
  -- Contact
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_insurance_dates CHECK (expiry_date > effective_date),
  CONSTRAINT valid_coverage CHECK (coverage_amount > 0)
);

-- =============================================================================
-- RENTAL ANALYTICS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW rental_analytics AS
SELECT 
  -- Date ranges
  DATE_TRUNC('month', ra.start_date) as month,
  DATE_TRUNC('quarter', ra.start_date) as quarter,
  DATE_TRUNC('year', ra.start_date) as year,
  
  -- Financial metrics
  COUNT(*) as total_rentals,
  SUM(ra.total_amount) as total_revenue,
  SUM(ra.paid_amount) as total_paid,
  AVG(ra.total_amount) as avg_rental_value,
  
  -- Equipment utilization
  COUNT(DISTINCT rai.equipment_id) as unique_equipment_rented,
  SUM(rai.quantity * rai.total_days) as total_equipment_days,
  
  -- Client metrics
  COUNT(DISTINCT ra.client_id) as unique_clients,
  
  -- Status breakdown
  COUNT(CASE WHEN ra.status = 'active' THEN 1 END) as active_rentals,
  COUNT(CASE WHEN ra.status = 'completed' THEN 1 END) as completed_rentals,
  COUNT(CASE WHEN ra.status = 'overdue' THEN 1 END) as overdue_rentals,
  
  -- Payment metrics
  COUNT(CASE WHEN ra.payment_status = 'paid' THEN 1 END) as paid_rentals,
  COUNT(CASE WHEN ra.payment_status = 'overdue' THEN 1 END) as overdue_payments,
  
  -- Damage metrics
  COUNT(DISTINCT edr.id) as damage_reports,
  SUM(COALESCE(edr.actual_repair_cost, 0)) as total_repair_costs
  
FROM rental_agreements ra
LEFT JOIN rental_agreement_items rai ON ra.id = rai.rental_agreement_id
LEFT JOIN equipment_damage_reports edr ON ra.id = edr.rental_agreement_id
GROUP BY DATE_TRUNC('month', ra.start_date), DATE_TRUNC('quarter', ra.start_date), DATE_TRUNC('year', ra.start_date);

-- =============================================================================
-- EQUIPMENT UTILIZATION VIEW
-- =============================================================================

CREATE OR REPLACE VIEW equipment_utilization AS
SELECT 
  e.id,
  e.name,
  e.category,
  e.rental_rate,
  e.is_rentable,
  
  -- Rental statistics
  COUNT(rai.id) as total_rentals,
  SUM(rai.quantity * rai.total_days) as total_rental_days,
  AVG(rai.daily_rate) as avg_rental_rate,
  SUM(rai.subtotal) as total_rental_revenue,
  
  -- Availability
  CASE 
    WHEN e.is_rentable = false THEN 'Not Rentable'
    WHEN EXISTS (
      SELECT 1 FROM rental_agreement_items rai2 
      JOIN rental_agreements ra2 ON rai2.rental_agreement_id = ra2.id 
      WHERE rai2.equipment_id = e.id 
      AND ra2.status IN ('active', 'confirmed')
      AND CURRENT_DATE BETWEEN ra2.start_date AND ra2.end_date
    ) THEN 'Currently Rented'
    ELSE 'Available'
  END as current_status,
  
  -- Damage history
  COUNT(edr.id) as damage_reports,
  SUM(COALESCE(edr.actual_repair_cost, 0)) as total_repair_costs,
  
  -- Last rental
  MAX(ra.end_date) as last_rental_date
  
FROM equipment e
LEFT JOIN rental_agreement_items rai ON e.id = rai.equipment_id
LEFT JOIN rental_agreements ra ON rai.rental_agreement_id = ra.id
LEFT JOIN equipment_damage_reports edr ON e.id = edr.equipment_id
WHERE e.is_rentable = true
GROUP BY e.id, e.name, e.category, e.rental_rate, e.is_rentable;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Rental agreements indexes
CREATE INDEX IF NOT EXISTS idx_rental_agreements_client_id ON rental_agreements(client_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_status ON rental_agreements(status);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_dates ON rental_agreements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_payment_status ON rental_agreements(payment_status);

-- Rental agreement items indexes
CREATE INDEX IF NOT EXISTS idx_rental_agreement_items_agreement_id ON rental_agreement_items(rental_agreement_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreement_items_equipment_id ON rental_agreement_items(equipment_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreement_items_status ON rental_agreement_items(status);

-- Equipment indexes for rental functionality
CREATE INDEX IF NOT EXISTS idx_equipment_rentable ON equipment(is_rentable) WHERE is_rentable = true;
CREATE INDEX IF NOT EXISTS idx_equipment_rental_rate ON equipment(rental_rate);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);

-- Damage reports indexes
CREATE INDEX IF NOT EXISTS idx_damage_reports_agreement_id ON equipment_damage_reports(rental_agreement_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_equipment_id ON equipment_damage_reports(equipment_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_status ON equipment_damage_reports(status);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_equipment_name_search ON equipment USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_rental_clients_name_search ON rental_clients USING gin(name gin_trgm_ops);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE rental_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_agreement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_insurance_policies ENABLE ROW LEVEL SECURITY;

-- Rental clients policies
CREATE POLICY "Users can view rental clients" ON rental_clients
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage rental clients" ON rental_clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Rental agreements policies
CREATE POLICY "Users can view rental agreements" ON rental_agreements
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage rental agreements" ON rental_agreements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Rental agreement items policies
CREATE POLICY "Users can view rental agreement items" ON rental_agreement_items
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage rental agreement items" ON rental_agreement_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Rental payments policies
CREATE POLICY "Users can view rental payments" ON rental_payments
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage rental payments" ON rental_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Equipment damage reports policies
CREATE POLICY "Users can view damage reports" ON equipment_damage_reports
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage damage reports" ON equipment_damage_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Rental insurance policies
CREATE POLICY "Users can view insurance policies" ON rental_insurance_policies
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage insurance policies" ON rental_insurance_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to generate rental agreement numbers
CREATE OR REPLACE FUNCTION generate_rental_agreement_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.agreement_number := 'RENT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('rental_agreement_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for rental agreement numbers
CREATE SEQUENCE IF NOT EXISTS rental_agreement_seq START 1;

-- Trigger to auto-generate rental agreement numbers
CREATE TRIGGER trigger_generate_rental_agreement_number
  BEFORE INSERT ON rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION generate_rental_agreement_number();

-- Function to update equipment availability
CREATE OR REPLACE FUNCTION update_equipment_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update equipment availability based on rental status
  IF NEW.status = 'active' THEN
    UPDATE equipment 
    SET is_available = false 
    WHERE id IN (
      SELECT equipment_id 
      FROM rental_agreement_items 
      WHERE rental_agreement_id = NEW.id
    );
  ELSIF NEW.status = 'completed' THEN
    UPDATE equipment 
    SET is_available = true 
    WHERE id IN (
      SELECT equipment_id 
      FROM rental_agreement_items 
      WHERE rental_agreement_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update equipment availability
CREATE TRIGGER trigger_update_equipment_availability
  AFTER UPDATE ON rental_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_availability();

-- Function to calculate rental totals
CREATE OR REPLACE FUNCTION calculate_rental_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rental agreement totals when items change
  UPDATE rental_agreements 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(subtotal), 0) 
      FROM rental_agreement_items 
      WHERE rental_agreement_id = NEW.rental_agreement_id
    ),
    total_amount = (
      SELECT COALESCE(SUM(subtotal), 0) + COALESCE(tax_amount, 0) 
      FROM rental_agreement_items 
      WHERE rental_agreement_id = NEW.rental_agreement_id
    )
  WHERE id = NEW.rental_agreement_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate rental totals
CREATE TRIGGER trigger_calculate_rental_totals
  AFTER INSERT OR UPDATE ON rental_agreement_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_rental_totals();

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample rental clients
INSERT INTO rental_clients (name, email, phone, company, status) VALUES
('John Smith', 'john@localband.com', '(555) 123-4567', 'Local Band Productions', 'active'),
('Sarah Johnson', 'sarah@musicfestival.com', '(555) 234-5678', 'Summer Music Festival', 'active'),
('Mike Chen', 'mike@corporateevents.com', '(555) 345-6789', 'Corporate Events Inc', 'active'),
('Lisa Rodriguez', 'lisa@weddingplanner.com', '(555) 456-7890', 'Elegant Weddings', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample rental agreements
INSERT INTO rental_agreements (agreement_number, client_id, start_date, end_date, subtotal, total_amount, status, payment_status) VALUES
('RENT-20250131-0001', (SELECT id FROM rental_clients WHERE email = 'john@localband.com' LIMIT 1), '2024-08-10', '2024-08-17', 525, 525, 'active', 'paid'),
('RENT-20250131-0002', (SELECT id FROM rental_clients WHERE email = 'sarah@musicfestival.com' LIMIT 1), '2024-08-15', '2024-08-18', 360, 360, 'active', 'paid'),
('RENT-20250131-0003', (SELECT id FROM rental_clients WHERE email = 'mike@corporateevents.com' LIMIT 1), '2024-08-20', '2024-08-22', 285, 285, 'confirmed', 'pending')
ON CONFLICT DO NOTHING;

-- Update equipment to be rentable
UPDATE equipment 
SET 
  is_rentable = true,
  rental_rate = CASE 
    WHEN name LIKE '%Fender%' THEN 75
    WHEN name LIKE '%Roland%' THEN 120
    WHEN name LIKE '%Yamaha%' THEN 95
    WHEN name LIKE '%Shure%' THEN 25
    ELSE 50
  END,
  rental_category = CASE 
    WHEN name LIKE '%Fender%' THEN 'guitar'
    WHEN name LIKE '%Roland%' THEN 'drums'
    WHEN name LIKE '%Yamaha%' THEN 'piano'
    WHEN name LIKE '%Shure%' THEN 'microphone'
    ELSE 'other'
  END
WHERE category = 'backline';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Backline & Rentals System migration completed successfully!';
  RAISE NOTICE 'Created tables: rental_clients, rental_agreements, rental_agreement_items, rental_payments, equipment_damage_reports, rental_insurance_policies';
  RAISE NOTICE 'Created views: rental_analytics, equipment_utilization';
  RAISE NOTICE 'Enhanced equipment table with rental functionality';
  RAISE NOTICE 'Added comprehensive RLS policies and triggers';
END $$; 