-- Tour Planner Enhancements Migration
-- This migration adds missing tables and columns needed for the Tour Planner wizard

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENHANCE TOURS TABLE WITH ADDITIONAL FIELDS
-- =============================================================================

-- Add missing columns to tours table if they don't exist
DO $$
BEGIN
  -- Add genre column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'genre') THEN
    ALTER TABLE tours ADD COLUMN genre VARCHAR(100);
  END IF;

  -- Add cover_image column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'cover_image') THEN
    ALTER TABLE tours ADD COLUMN cover_image TEXT;
  END IF;

  -- Add route_coordinates column for storing route data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'route_coordinates') THEN
    ALTER TABLE tours ADD COLUMN route_coordinates JSONB DEFAULT '[]';
  END IF;

  -- Add ticket_types column for storing ticket information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'ticket_types') THEN
    ALTER TABLE tours ADD COLUMN ticket_types JSONB DEFAULT '[]';
  END IF;

  -- Add sponsors column for storing sponsor information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'sponsors') THEN
    ALTER TABLE tours ADD COLUMN sponsors JSONB DEFAULT '[]';
  END IF;

  -- Add logistics_details column for storing detailed logistics
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'logistics_details') THEN
    ALTER TABLE tours ADD COLUMN logistics_details JSONB DEFAULT '{}';
  END IF;
END $$;

-- =============================================================================
-- ENHANCE EVENTS TABLE WITH ADDITIONAL FIELDS
-- =============================================================================

-- Add missing columns to events table if they don't exist
DO $$
BEGIN
  -- Add coordinates column for venue location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'coordinates') THEN
    ALTER TABLE events ADD COLUMN coordinates JSONB;
  END IF;

  -- Add ticket_types column for event-specific tickets
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'ticket_types') THEN
    ALTER TABLE events ADD COLUMN ticket_types JSONB DEFAULT '[]';
  END IF;

  -- Add technical_requirements column for detailed requirements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'technical_requirements') THEN
    ALTER TABLE events ADD COLUMN technical_requirements JSONB DEFAULT '{}';
  END IF;
END $$;

-- =============================================================================
-- CREATE TICKET TYPES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  quantity_sold INTEGER DEFAULT 0 CHECK (quantity_sold >= 0),
  max_per_customer INTEGER,
  sale_start TIMESTAMP WITH TIME ZONE,
  sale_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either tour_id or event_id is provided, but not both
  CONSTRAINT ticket_type_target_check CHECK (
    (tour_id IS NOT NULL AND event_id IS NULL) OR 
    (event_id IS NOT NULL AND tour_id IS NULL)
  ),
  
  -- Ensure quantity sold doesn't exceed available
  CONSTRAINT ticket_quantity_check CHECK (quantity_sold <= quantity_available)
);

-- =============================================================================
-- CREATE SPONSORS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tour_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  contribution DECIMAL(12,2) NOT NULL CHECK (contribution >= 0),
  sponsor_type VARCHAR(100), -- 'financial', 'in_kind', 'media', 'venue', etc.
  logo_url TEXT,
  website_url TEXT,
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  agreement_status VARCHAR(50) DEFAULT 'pending' CHECK (agreement_status IN ('pending', 'negotiating', 'agreed', 'signed', 'cancelled')),
  agreement_date DATE,
  benefits_package JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE LOGISTICS DETAILS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tour_logistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'transportation', 'accommodation', 'equipment', 'catering', etc.
  subcategory VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  provider VARCHAR(200),
  cost DECIMAL(12,2) CHECK (cost >= 0),
  quantity INTEGER DEFAULT 1,
  unit VARCHAR(50), -- 'per_day', 'per_person', 'per_event', etc.
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  contact_name VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  confirmation_number VARCHAR(100),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE TOUR ROUTE STOPS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tour_route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  city VARCHAR(100) NOT NULL,
  venue_name VARCHAR(200),
  venue_address TEXT,
  coordinates JSONB, -- {"lat": 40.7128, "lng": -74.0060}
  arrival_date DATE,
  departure_date DATE,
  travel_time_hours INTEGER,
  travel_distance_miles INTEGER,
  travel_cost DECIMAL(10,2),
  accommodation_details TEXT,
  local_contacts JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure stop_order is unique within a tour
  UNIQUE(tour_id, stop_order)
);

-- =============================================================================
-- CREATE TOUR TEAM ASSIGNMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tour_team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES tour_team_members(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE,
  rate DECIMAL(10,2),
  rate_type VARCHAR(50) DEFAULT 'daily' CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'project')),
  status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  responsibilities TEXT[],
  equipment_assigned TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique assignment per team member per event
  UNIQUE(tour_id, event_id, team_member_id)
);

-- =============================================================================
-- CREATE TOUR BUDGET CATEGORIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tour_budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  budgeted_amount DECIMAL(12,2) NOT NULL CHECK (budgeted_amount >= 0),
  actual_amount DECIMAL(12,2) DEFAULT 0 CHECK (actual_amount >= 0),
  category_type VARCHAR(50) DEFAULT 'expense' CHECK (category_type IN ('income', 'expense')),
  parent_category_id UUID REFERENCES tour_budget_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for ticket_types
CREATE INDEX IF NOT EXISTS idx_ticket_types_tour_id ON ticket_types(tour_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_sale_dates ON ticket_types(sale_start, sale_end);

-- Indexes for tour_sponsors
CREATE INDEX IF NOT EXISTS idx_tour_sponsors_tour_id ON tour_sponsors(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_sponsors_status ON tour_sponsors(agreement_status);

-- Indexes for tour_logistics
CREATE INDEX IF NOT EXISTS idx_tour_logistics_tour_id ON tour_logistics(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_logistics_event_id ON tour_logistics(event_id);
CREATE INDEX IF NOT EXISTS idx_tour_logistics_category ON tour_logistics(category);
CREATE INDEX IF NOT EXISTS idx_tour_logistics_status ON tour_logistics(status);

-- Indexes for tour_route_stops
CREATE INDEX IF NOT EXISTS idx_tour_route_stops_tour_id ON tour_route_stops(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_route_stops_event_id ON tour_route_stops(event_id);
CREATE INDEX IF NOT EXISTS idx_tour_route_stops_order ON tour_route_stops(tour_id, stop_order);

-- Indexes for tour_team_assignments
CREATE INDEX IF NOT EXISTS idx_tour_team_assignments_tour_id ON tour_team_assignments(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_team_assignments_event_id ON tour_team_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_tour_team_assignments_member_id ON tour_team_assignments(team_member_id);

-- Indexes for tour_budget_categories
CREATE INDEX IF NOT EXISTS idx_tour_budget_categories_tour_id ON tour_budget_categories(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_budget_categories_type ON tour_budget_categories(category_type);

-- =============================================================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_budget_categories ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced based on your RBAC system)
-- For now, allow all authenticated users to read/write (admin access)

-- Ticket types policies
CREATE POLICY "Allow authenticated users to manage ticket types" ON ticket_types
  FOR ALL USING (auth.role() = 'authenticated');

-- Tour sponsors policies
CREATE POLICY "Allow authenticated users to manage tour sponsors" ON tour_sponsors
  FOR ALL USING (auth.role() = 'authenticated');

-- Tour logistics policies
CREATE POLICY "Allow authenticated users to manage tour logistics" ON tour_logistics
  FOR ALL USING (auth.role() = 'authenticated');

-- Tour route stops policies
CREATE POLICY "Allow authenticated users to manage tour route stops" ON tour_route_stops
  FOR ALL USING (auth.role() = 'authenticated');

-- Tour team assignments policies
CREATE POLICY "Allow authenticated users to manage tour team assignments" ON tour_team_assignments
  FOR ALL USING (auth.role() = 'authenticated');

-- Tour budget categories policies
CREATE POLICY "Allow authenticated users to manage tour budget categories" ON tour_budget_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_sponsors_updated_at BEFORE UPDATE ON tour_sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_logistics_updated_at BEFORE UPDATE ON tour_logistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_route_stops_updated_at BEFORE UPDATE ON tour_route_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_team_assignments_updated_at BEFORE UPDATE ON tour_team_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_budget_categories_updated_at BEFORE UPDATE ON tour_budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INSERT SAMPLE DATA (OPTIONAL)
-- =============================================================================

-- Insert sample budget categories
INSERT INTO tour_budget_categories (tour_id, name, description, budgeted_amount, category_type) VALUES
('00000000-0000-0000-0000-000000000000', 'Transportation', 'All transportation costs', 5000.00, 'expense'),
('00000000-0000-0000-0000-000000000000', 'Accommodation', 'Hotel and lodging costs', 3000.00, 'expense'),
('00000000-0000-0000-0000-000000000000', 'Equipment', 'Sound, lighting, and stage equipment', 2000.00, 'expense'),
('00000000-0000-0000-0000-000000000000', 'Marketing', 'Promotional materials and advertising', 1500.00, 'expense'),
('00000000-0000-0000-0000-000000000000', 'Ticket Sales', 'Revenue from ticket sales', 15000.00, 'income'),
('00000000-0000-0000-0000-000000000000', 'Sponsorships', 'Sponsor contributions', 5000.00, 'income')
ON CONFLICT DO NOTHING; 