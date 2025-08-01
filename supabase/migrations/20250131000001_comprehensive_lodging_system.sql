-- =============================================================================
-- COMPREHENSIVE LODGING MANAGEMENT SYSTEM
-- This migration creates a complete lodging management system with calendar
-- integration and crew/team assignments for events and tours
-- Migration: 20250131000001_comprehensive_lodging_system.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- LODGING PROVIDERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hotel', 'motel', 'resort', 'apartment', 'house', 'airbnb', 'hostel', 'camping')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  phone TEXT,
  email TEXT,
  website TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Amenities and features
  amenities TEXT[] DEFAULT '{}',
  room_types TEXT[] DEFAULT '{}',
  max_capacity INTEGER,
  parking_available BOOLEAN DEFAULT FALSE,
  parking_spaces INTEGER,
  wifi_available BOOLEAN DEFAULT TRUE,
  breakfast_included BOOLEAN DEFAULT FALSE,
  pool_available BOOLEAN DEFAULT FALSE,
  gym_available BOOLEAN DEFAULT FALSE,
  
  -- Business details
  tax_id TEXT,
  payment_terms TEXT DEFAULT 'net_30',
  credit_limit DECIMAL(10,2) DEFAULT 0,
  preferred_vendor BOOLEAN DEFAULT FALSE,
  
  -- Status and ratings
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'blacklisted')),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_bookings INTEGER DEFAULT 0,
  last_booking_date DATE,
  
  -- Notes and metadata
  notes TEXT,
  special_requirements TEXT,
  cancellation_policy TEXT,
  check_in_time TIME DEFAULT '15:00:00',
  check_out_time TIME DEFAULT '11:00:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LODGING ROOM TYPES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES lodging_providers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  bed_configuration TEXT, -- "1 King", "2 Queens", "1 King + 1 Sofa Bed", etc.
  amenities TEXT[] DEFAULT '{}',
  base_rate DECIMAL(10,2) NOT NULL,
  weekend_rate DECIMAL(10,2),
  holiday_rate DECIMAL(10,2),
  group_rate DECIMAL(10,2),
  min_stay INTEGER DEFAULT 1,
  max_stay INTEGER,
  available_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LODGING BOOKINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  
  -- Event/Tour association
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  
  -- Provider and room details
  provider_id UUID REFERENCES lodging_providers(id) ON DELETE CASCADE NOT NULL,
  room_type_id UUID REFERENCES lodging_room_types(id) ON DELETE CASCADE NOT NULL,
  
  -- Booking details
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  rooms_booked INTEGER DEFAULT 1,
  guests_per_room INTEGER DEFAULT 1,
  total_guests INTEGER NOT NULL,
  
  -- Guest information
  primary_guest_name TEXT NOT NULL,
  primary_guest_email TEXT,
  primary_guest_phone TEXT,
  special_requests TEXT,
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  
  -- Financial details
  rate_per_night DECIMAL(10,2) NOT NULL,
  total_nights INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  fees DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status and workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded', 'overdue')),
  
  -- Booking metadata
  booking_source TEXT DEFAULT 'direct' CHECK (booking_source IN ('direct', 'travel_agent', 'online_travel_agent', 'corporate', 'group')),
  confirmation_number TEXT,
  cancellation_policy TEXT,
  cancellation_deadline DATE,
  
  -- Staff assignments
  assigned_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  managed_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_guests CHECK (total_guests > 0),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0 AND paid_amount >= 0)
);

-- =============================================================================
-- LODGING GUEST ASSIGNMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_guest_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES lodging_bookings(id) ON DELETE CASCADE NOT NULL,
  
  -- Guest information
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_type TEXT DEFAULT 'crew' CHECK (guest_type IN ('crew', 'artist', 'staff', 'vendor', 'guest', 'vip')),
  
  -- Assignment details
  staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  crew_member_id UUID REFERENCES venue_crew_members(id) ON DELETE SET NULL,
  team_member_id UUID REFERENCES venue_team_members(id) ON DELETE SET NULL,
  
  -- Room assignment
  room_number TEXT,
  bed_preference TEXT, -- "King", "Queen", "Twin", "Rollaway", etc.
  roommate_preference TEXT, -- Specific person or "No preference"
  
  -- Special requirements
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  special_requests TEXT,
  
  -- Status
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  
  -- Check-in/out tracking
  actual_check_in TIMESTAMPTZ,
  actual_check_out TIMESTAMPTZ,
  check_in_notes TEXT,
  check_out_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LODGING PAYMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES lodging_bookings(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment details
  payment_number TEXT UNIQUE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'partial', 'final', 'refund', 'cancellation_fee')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'paypal', 'corporate_account')),
  
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
-- LODGING CALENDAR EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES lodging_bookings(id) ON DELETE CASCADE NOT NULL,
  
  -- Calendar event details
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  
  -- Calendar integration
  calendar_type TEXT DEFAULT 'lodging' CHECK (calendar_type IN ('lodging', 'transportation', 'event', 'crew')),
  external_calendar_id TEXT, -- For Google Calendar, Outlook, etc.
  is_all_day BOOLEAN DEFAULT FALSE,
  
  -- Notifications
  reminder_minutes INTEGER[] DEFAULT '{1440}', -- Default 24 hours
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LODGING AVAILABILITY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES lodging_providers(id) ON DELETE CASCADE NOT NULL,
  room_type_id UUID REFERENCES lodging_room_types(id) ON DELETE CASCADE NOT NULL,
  
  -- Availability period
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  
  -- Availability details
  rooms_available INTEGER NOT NULL,
  rooms_reserved INTEGER DEFAULT 0,
  rooms_blocked INTEGER DEFAULT 0,
  
  -- Pricing
  base_rate DECIMAL(10,2),
  special_rate DECIMAL(10,2),
  rate_notes TEXT,
  
  -- Blocking
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  blocked_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (date_to >= date_from),
  CONSTRAINT valid_room_counts CHECK (rooms_available >= 0 AND rooms_reserved >= 0 AND rooms_blocked >= 0),
  UNIQUE(provider_id, room_type_id, date_from)
);

-- =============================================================================
-- LODGING REVIEWS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lodging_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES lodging_bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES lodging_providers(id) ON DELETE CASCADE NOT NULL,
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Review content
  title TEXT,
  comment TEXT,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  
  -- Reviewer
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Response
  provider_response TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- LODGING ANALYTICS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW lodging_analytics AS
SELECT 
  -- Date ranges
  DATE_TRUNC('month', lb.check_in_date) as month,
  DATE_TRUNC('quarter', lb.check_in_date) as quarter,
  DATE_TRUNC('year', lb.check_in_date) as year,
  
  -- Booking metrics
  COUNT(*) as total_bookings,
  COUNT(DISTINCT lb.provider_id) as unique_providers,
  COUNT(DISTINCT lb.event_id) as unique_events,
  COUNT(DISTINCT lb.tour_id) as unique_tours,
  
  -- Financial metrics
  SUM(lb.total_amount) as total_revenue,
  SUM(lb.paid_amount) as total_paid,
  AVG(lb.total_amount) as avg_booking_value,
  SUM(lb.total_nights) as total_nights,
  
  -- Guest metrics
  SUM(lb.total_guests) as total_guests,
  AVG(lb.total_guests) as avg_guests_per_booking,
  
  -- Status breakdown
  COUNT(CASE WHEN lb.status = 'confirmed' THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN lb.status = 'checked_in' THEN 1 END) as active_bookings,
  COUNT(CASE WHEN lb.status = 'cancelled' THEN 1 END) as cancelled_bookings,
  
  -- Payment metrics
  COUNT(CASE WHEN lb.payment_status = 'paid' THEN 1 END) as paid_bookings,
  COUNT(CASE WHEN lb.payment_status = 'overdue' THEN 1 END) as overdue_bookings,
  
  -- Provider performance
  COUNT(DISTINCT lp.id) as active_providers,
  AVG(lp.rating) as avg_provider_rating
  
FROM lodging_bookings lb
LEFT JOIN lodging_providers lp ON lb.provider_id = lp.id
GROUP BY DATE_TRUNC('month', lb.check_in_date), DATE_TRUNC('quarter', lb.check_in_date), DATE_TRUNC('year', lb.check_in_date);

-- =============================================================================
-- LODGING UTILIZATION VIEW
-- =============================================================================

CREATE OR REPLACE VIEW lodging_utilization AS
SELECT 
  lp.id as provider_id,
  lp.name as provider_name,
  lp.type as provider_type,
  lp.city,
  lp.state,
  
  -- Room type details
  lrt.id as room_type_id,
  lrt.name as room_type_name,
  lrt.capacity,
  lrt.base_rate,
  
  -- Availability metrics
  COUNT(la.id) as total_availability_days,
  SUM(la.rooms_available) as total_rooms_available,
  SUM(la.rooms_reserved) as total_rooms_reserved,
  SUM(la.rooms_blocked) as total_rooms_blocked,
  
  -- Utilization calculation
  CASE 
    WHEN SUM(la.rooms_available) > 0 
    THEN ROUND((SUM(la.rooms_reserved)::DECIMAL / SUM(la.rooms_available)) * 100, 2)
    ELSE 0 
  END as utilization_percentage,
  
  -- Booking metrics
  COUNT(lb.id) as total_bookings,
  SUM(lb.total_amount) as total_revenue,
  AVG(lb.total_amount) as avg_booking_value,
  
  -- Guest metrics
  SUM(lb.total_guests) as total_guests,
  AVG(lb.total_guests) as avg_guests_per_booking
  
FROM lodging_providers lp
LEFT JOIN lodging_room_types lrt ON lp.id = lrt.provider_id
LEFT JOIN lodging_availability la ON lrt.id = la.room_type_id
LEFT JOIN lodging_bookings lb ON lrt.id = lb.room_type_id
WHERE lp.status = 'active' AND lrt.is_active = true
GROUP BY lp.id, lp.name, lp.type, lp.city, lp.state, lrt.id, lrt.name, lrt.capacity, lrt.base_rate;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Lodging providers indexes
CREATE INDEX IF NOT EXISTS idx_lodging_providers_type ON lodging_providers(type);
CREATE INDEX IF NOT EXISTS idx_lodging_providers_city_state ON lodging_providers(city, state);
CREATE INDEX IF NOT EXISTS idx_lodging_providers_status ON lodging_providers(status);
CREATE INDEX IF NOT EXISTS idx_lodging_providers_rating ON lodging_providers(rating);

-- Lodging room types indexes
CREATE INDEX IF NOT EXISTS idx_lodging_room_types_provider_id ON lodging_room_types(provider_id);
CREATE INDEX IF NOT EXISTS idx_lodging_room_types_capacity ON lodging_room_types(capacity);
CREATE INDEX IF NOT EXISTS idx_lodging_room_types_active ON lodging_room_types(is_active);

-- Lodging bookings indexes
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_event_id ON lodging_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_tour_id ON lodging_bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_provider_id ON lodging_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_dates ON lodging_bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_status ON lodging_bookings(status);
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_payment_status ON lodging_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_lodging_bookings_guest_name ON lodging_bookings USING gin(primary_guest_name gin_trgm_ops);

-- Lodging guest assignments indexes
CREATE INDEX IF NOT EXISTS idx_lodging_guest_assignments_booking_id ON lodging_guest_assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_lodging_guest_assignments_staff_id ON lodging_guest_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_lodging_guest_assignments_crew_member_id ON lodging_guest_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_lodging_guest_assignments_guest_type ON lodging_guest_assignments(guest_type);
CREATE INDEX IF NOT EXISTS idx_lodging_guest_assignments_status ON lodging_guest_assignments(status);

-- Lodging payments indexes
CREATE INDEX IF NOT EXISTS idx_lodging_payments_booking_id ON lodging_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_lodging_payments_payment_date ON lodging_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_lodging_payments_status ON lodging_payments(status);

-- Lodging calendar events indexes
CREATE INDEX IF NOT EXISTS idx_lodging_calendar_events_booking_id ON lodging_calendar_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_lodging_calendar_events_dates ON lodging_calendar_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_lodging_calendar_events_calendar_type ON lodging_calendar_events(calendar_type);

-- Lodging availability indexes
CREATE INDEX IF NOT EXISTS idx_lodging_availability_provider_room ON lodging_availability(provider_id, room_type_id);
CREATE INDEX IF NOT EXISTS idx_lodging_availability_dates ON lodging_availability(date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_lodging_availability_blocked ON lodging_availability(is_blocked);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_lodging_providers_name_search ON lodging_providers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_lodging_providers_address_search ON lodging_providers USING gin(address gin_trgm_ops);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE lodging_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_guest_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodging_reviews ENABLE ROW LEVEL SECURITY;

-- Lodging providers policies
CREATE POLICY "Users can view lodging providers" ON lodging_providers
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage lodging providers" ON lodging_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging room types policies
CREATE POLICY "Users can view room types" ON lodging_room_types
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage room types" ON lodging_room_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging bookings policies
CREATE POLICY "Users can view lodging bookings" ON lodging_bookings
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage lodging bookings" ON lodging_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging guest assignments policies
CREATE POLICY "Users can view guest assignments" ON lodging_guest_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage guest assignments" ON lodging_guest_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging payments policies
CREATE POLICY "Users can view lodging payments" ON lodging_payments
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage lodging payments" ON lodging_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging calendar events policies
CREATE POLICY "Users can view calendar events" ON lodging_calendar_events
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage calendar events" ON lodging_calendar_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging availability policies
CREATE POLICY "Users can view availability" ON lodging_availability
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage availability" ON lodging_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Lodging reviews policies
CREATE POLICY "Users can view reviews" ON lodging_reviews
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage reviews" ON lodging_reviews
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

-- Function to generate booking numbers
CREATE OR REPLACE FUNCTION generate_lodging_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number := 'LODG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('lodging_booking_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS lodging_booking_seq START 1;

-- Trigger to auto-generate booking numbers
CREATE TRIGGER trigger_generate_lodging_booking_number
  BEFORE INSERT ON lodging_bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_lodging_booking_number();

-- Function to generate payment numbers
CREATE OR REPLACE FUNCTION generate_lodging_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.payment_number := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(CAST(nextval('lodging_payment_seq') AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for payment numbers
CREATE SEQUENCE IF NOT EXISTS lodging_payment_seq START 1;

-- Trigger to auto-generate payment numbers
CREATE TRIGGER trigger_generate_lodging_payment_number
  BEFORE INSERT ON lodging_payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_lodging_payment_number();

-- Function to calculate booking totals
CREATE OR REPLACE FUNCTION calculate_lodging_booking_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total nights
  NEW.total_nights := NEW.check_out_date - NEW.check_in_date;
  
  -- Calculate subtotal
  NEW.subtotal := NEW.rate_per_night * NEW.total_nights * NEW.rooms_booked;
  
  -- Calculate total amount
  NEW.total_amount := NEW.subtotal + COALESCE(NEW.tax_amount, 0) + COALESCE(NEW.fees, 0) - COALESCE(NEW.discount_amount, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate booking totals
CREATE TRIGGER trigger_calculate_lodging_booking_totals
  BEFORE INSERT OR UPDATE ON lodging_bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_lodging_booking_totals();

-- Function to update availability when booking is created/updated
CREATE OR REPLACE FUNCTION update_lodging_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update availability for the booking period
  UPDATE lodging_availability 
  SET rooms_reserved = rooms_reserved + NEW.rooms_booked
  WHERE provider_id = NEW.provider_id 
    AND room_type_id = NEW.room_type_id
    AND date_from >= NEW.check_in_date 
    AND date_to <= NEW.check_out_date
    AND NEW.status IN ('confirmed', 'checked_in');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update availability
CREATE TRIGGER trigger_update_lodging_availability
  AFTER INSERT OR UPDATE ON lodging_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_lodging_availability();

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample lodging providers
INSERT INTO lodging_providers (name, type, address, city, state, postal_code, phone, email, amenities, max_capacity, rating, status) VALUES
('Luxury Hotel & Spa', 'hotel', '123 Main Street', 'New York', 'NY', '10001', '(555) 123-4567', 'info@luxuryhotel.com', ARRAY['wifi', 'pool', 'gym', 'spa', 'restaurant'], 200, 4.5, 'active'),
('Riverside Hotel', 'hotel', '456 River Road', 'Los Angeles', 'CA', '90210', '(555) 234-5678', 'info@riversidehotel.com', ARRAY['wifi', 'pool', 'parking'], 150, 4.2, 'active'),
('Downtown Business Inn', 'hotel', '789 Business Ave', 'Chicago', 'IL', '60601', '(555) 345-6789', 'info@downtowninn.com', ARRAY['wifi', 'business_center', 'parking'], 100, 4.0, 'active'),
('Mountain View Resort', 'resort', '321 Mountain Road', 'Denver', 'CO', '80201', '(555) 456-7890', 'info@mountainview.com', ARRAY['wifi', 'pool', 'gym', 'spa', 'restaurant', 'skiing'], 300, 4.8, 'active'),
('Coastal Beach House', 'house', '654 Beach Blvd', 'Miami', 'FL', '33101', '(555) 567-8901', 'info@coastalbeach.com', ARRAY['wifi', 'beach_access', 'parking'], 8, 4.6, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample room types
INSERT INTO lodging_room_types (provider_id, name, description, capacity, bed_configuration, amenities, base_rate, weekend_rate, group_rate) VALUES
((SELECT id FROM lodging_providers WHERE name = 'Luxury Hotel & Spa'), 'Deluxe King Room', 'Spacious room with king bed and city view', 2, '1 King', ARRAY['wifi', 'tv', 'minibar', 'room_service'], 250.00, 300.00, 225.00),
((SELECT id FROM lodging_providers WHERE name = 'Luxury Hotel & Spa'), 'Executive Suite', 'Luxury suite with separate living area', 4, '1 King + 1 Sofa Bed', ARRAY['wifi', 'tv', 'minibar', 'room_service', 'balcony'], 400.00, 450.00, 360.00),
((SELECT id FROM lodging_providers WHERE name = 'Riverside Hotel'), 'Standard Queen Room', 'Comfortable room with queen bed', 2, '1 Queen', ARRAY['wifi', 'tv', 'coffee_maker'], 150.00, 180.00, 135.00),
((SELECT id FROM lodging_providers WHERE name = 'Downtown Business Inn'), 'Business Suite', 'Perfect for business travelers', 2, '1 King', ARRAY['wifi', 'tv', 'desk', 'business_center'], 200.00, 220.00, 180.00),
((SELECT id FROM lodging_providers WHERE name = 'Mountain View Resort'), 'Mountain View Room', 'Stunning mountain views', 2, '1 King', ARRAY['wifi', 'tv', 'balcony', 'fireplace'], 300.00, 350.00, 270.00)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Comprehensive Lodging Management System migration completed successfully!';
  RAISE NOTICE 'Created tables: lodging_providers, lodging_room_types, lodging_bookings, lodging_guest_assignments, lodging_payments, lodging_calendar_events, lodging_availability, lodging_reviews';
  RAISE NOTICE 'Created views: lodging_analytics, lodging_utilization';
  RAISE NOTICE 'Added comprehensive RLS policies and triggers';
  RAISE NOTICE 'Integrated with existing crew/team management system';
END $$; 