-- =============================================================================
-- ADVANCED TRAVEL COORDINATION SYSTEM
-- This migration creates a comprehensive travel coordination system for managing
-- 100+ people across flights, hotels, and transportation with logical grouping
-- Migration: 20250131000002_advanced_travel_coordination.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- =============================================================================
-- TRAVEL GROUPS TABLE - Logical categorization of travelers
-- =============================================================================

CREATE TABLE IF NOT EXISTS travel_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Group categorization
  group_type TEXT NOT NULL CHECK (group_type IN ('crew', 'artists', 'staff', 'vendors', 'guests', 'vip', 'media', 'security', 'catering', 'technical', 'management')),
  department TEXT, -- Specific department or team
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5), -- 1=highest, 5=lowest
  
  -- Travel coordination
  arrival_date DATE,
  departure_date DATE,
  arrival_location TEXT, -- Airport, train station, etc.
  departure_location TEXT,
  total_members INTEGER DEFAULT 0,
  confirmed_members INTEGER DEFAULT 0,
  
  -- Coordination details
  group_leader_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  backup_contact_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  special_requirements TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  
  -- Status and workflow
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'in_transit', 'arrived', 'departed', 'cancelled')),
  coordination_status TEXT DEFAULT 'pending' CHECK (coordination_status IN ('pending', 'flights_booked', 'hotels_booked', 'transport_arranged', 'complete')),
  
  -- Metadata
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  created_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRAVEL GROUP MEMBERS TABLE - Individual assignments to groups
-- =============================================================================

CREATE TABLE IF NOT EXISTS travel_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES travel_groups(id) ON DELETE CASCADE NOT NULL,
  
  -- Member information
  member_name TEXT NOT NULL,
  member_email TEXT,
  member_phone TEXT,
  member_role TEXT,
  
  -- Staff/Crew linking
  staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  crew_member_id UUID REFERENCES venue_crew_members(id) ON DELETE SET NULL,
  team_member_id UUID REFERENCES venue_team_members(id) ON DELETE SET NULL,
  
  -- Travel preferences
  seat_preference TEXT, -- Window, aisle, front, back
  meal_preference TEXT, -- Vegetarian, vegan, gluten-free, etc.
  special_assistance BOOLEAN DEFAULT FALSE,
  wheelchair_required BOOLEAN DEFAULT FALSE,
  mobility_assistance BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'in_transit', 'arrived', 'no_show', 'cancelled')),
  check_in_status TEXT DEFAULT 'pending' CHECK (check_in_status IN ('pending', 'confirmed', 'checked_in', 'late_check_in', 'no_show')),
  
  -- Timestamps
  actual_arrival_time TIMESTAMPTZ,
  actual_departure_time TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique member per group
  UNIQUE(group_id, member_name, member_email)
);

-- =============================================================================
-- FLIGHT COORDINATION TABLE - Enhanced flight management
-- =============================================================================

CREATE TABLE IF NOT EXISTS flight_coordination (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  
  -- Flight details
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  
  -- Capacity and booking
  aircraft_type TEXT,
  total_seats INTEGER,
  booked_seats INTEGER DEFAULT 0,
  available_seats INTEGER,
  
  -- Group coordination
  group_id UUID REFERENCES travel_groups(id) ON DELETE SET NULL,
  is_group_flight BOOLEAN DEFAULT FALSE,
  
  -- Booking details
  booking_reference TEXT,
  ticket_class TEXT DEFAULT 'economy' CHECK (ticket_class IN ('economy', 'premium_economy', 'business', 'first')),
  fare_type TEXT DEFAULT 'standard' CHECK (fare_type IN ('standard', 'flexible', 'refundable', 'group')),
  
  -- Status and tracking
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'boarding', 'in_flight', 'landed', 'delayed', 'cancelled')),
  gate TEXT,
  terminal TEXT,
  
  -- Cost tracking
  ticket_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  
  -- Coordination metadata
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FLIGHT PASSENGER ASSIGNMENTS TABLE - Individual flight assignments
-- =============================================================================

CREATE TABLE IF NOT EXISTS flight_passenger_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID REFERENCES flight_coordination(id) ON DELETE CASCADE NOT NULL,
  group_member_id UUID REFERENCES travel_group_members(id) ON DELETE CASCADE NOT NULL,
  
  -- Seat assignment
  seat_number TEXT,
  seat_class TEXT DEFAULT 'economy' CHECK (seat_class IN ('economy', 'premium_economy', 'business', 'first')),
  
  -- Ticket details
  ticket_number TEXT,
  ticket_cost DECIMAL(10,2),
  ticket_status TEXT DEFAULT 'pending' CHECK (ticket_status IN ('pending', 'issued', 'checked_in', 'used', 'cancelled')),
  
  -- Boarding and status
  boarding_time TIMESTAMPTZ,
  boarding_group TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_time TIMESTAMPTZ,
  
  -- Special requirements
  special_meal TEXT,
  special_assistance BOOLEAN DEFAULT FALSE,
  wheelchair_assistance BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'boarded', 'no_show', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique passenger per flight
  UNIQUE(flight_id, group_member_id)
);

-- =============================================================================
-- GROUND TRANSPORTATION COORDINATION TABLE - Enhanced ground transport
-- =============================================================================

CREATE TABLE IF NOT EXISTS ground_transportation_coordination (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Transportation details
  transport_type TEXT NOT NULL CHECK (transport_type IN ('shuttle_bus', 'limo', 'van', 'car', 'train', 'subway', 'walking')),
  provider_name TEXT,
  vehicle_details JSONB DEFAULT '{}',
  
  -- Route and timing
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  estimated_dropoff_time TIMESTAMPTZ NOT NULL,
  actual_dropoff_time TIMESTAMPTZ,
  
  -- Capacity and assignment
  vehicle_capacity INTEGER,
  assigned_passengers INTEGER DEFAULT 0,
  group_id UUID REFERENCES travel_groups(id) ON DELETE SET NULL,
  
  -- Driver information
  driver_name TEXT,
  driver_phone TEXT,
  driver_license TEXT,
  vehicle_plate TEXT,
  
  -- Status and tracking
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'arrived', 'completed', 'delayed', 'cancelled')),
  tracking_enabled BOOLEAN DEFAULT FALSE,
  current_location TEXT,
  
  -- Cost tracking
  cost_per_person DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  
  -- Coordination metadata
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES flight_coordination(id) ON DELETE SET NULL, -- Link to flight for airport transfers
  assigned_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRANSPORTATION PASSENGER ASSIGNMENTS TABLE - Individual transport assignments
-- =============================================================================

CREATE TABLE IF NOT EXISTS transportation_passenger_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportation_id UUID REFERENCES ground_transportation_coordination(id) ON DELETE CASCADE NOT NULL,
  group_member_id UUID REFERENCES travel_group_members(id) ON DELETE CASCADE NOT NULL,
  
  -- Assignment details
  pickup_instructions TEXT,
  dropoff_instructions TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'picked_up', 'in_transit', 'dropped_off', 'no_show', 'cancelled')),
  pickup_confirmed BOOLEAN DEFAULT FALSE,
  pickup_time TIMESTAMPTZ,
  dropoff_time TIMESTAMPTZ,
  
  -- Special requirements
  special_assistance BOOLEAN DEFAULT FALSE,
  wheelchair_required BOOLEAN DEFAULT FALSE,
  luggage_count INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique passenger per transportation
  UNIQUE(transportation_id, group_member_id)
);

-- =============================================================================
-- HOTEL ROOM ASSIGNMENTS TABLE - Enhanced room coordination
-- =============================================================================

CREATE TABLE IF NOT EXISTS hotel_room_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lodging_booking_id UUID REFERENCES lodging_bookings(id) ON DELETE CASCADE NOT NULL,
  group_member_id UUID REFERENCES travel_group_members(id) ON DELETE CASCADE NOT NULL,
  
  -- Room details
  room_number TEXT,
  room_type TEXT,
  bed_configuration TEXT, -- Single, Double, Twin, etc.
  
  -- Assignment preferences
  roommate_preference TEXT, -- Specific person or "No preference"
  floor_preference TEXT,
  accessibility_required BOOLEAN DEFAULT FALSE,
  
  -- Check-in/out tracking
  check_in_status TEXT DEFAULT 'pending' CHECK (check_in_status IN ('pending', 'confirmed', 'checked_in', 'late_check_in', 'no_show')),
  check_out_status TEXT DEFAULT 'pending' CHECK (check_out_status IN ('pending', 'checked_out', 'late_check_out', 'extended')),
  
  actual_check_in_time TIMESTAMPTZ,
  actual_check_out_time TIMESTAMPTZ,
  
  -- Special requirements
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  special_requests TEXT,
  
  -- Status
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique room assignment per member
  UNIQUE(lodging_booking_id, group_member_id)
);

-- =============================================================================
-- TRAVEL COORDINATION TIMELINE TABLE - Master timeline view
-- =============================================================================

CREATE TABLE IF NOT EXISTS travel_coordination_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timeline entry details
  entry_type TEXT NOT NULL CHECK (entry_type IN ('flight', 'transport', 'hotel_checkin', 'hotel_checkout', 'meeting', 'meal', 'activity')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  
  -- Location
  location TEXT,
  location_details TEXT,
  
  -- Group coordination
  group_id UUID REFERENCES travel_groups(id) ON DELETE CASCADE,
  affected_members INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'delayed', 'cancelled')),
  
  -- Coordination metadata
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  created_by UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRAVEL COORDINATION ANALYTICS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW travel_coordination_analytics AS
SELECT 
  -- Date ranges
  DATE_TRUNC('day', tg.arrival_date) as date,
  DATE_TRUNC('week', tg.arrival_date) as week,
  DATE_TRUNC('month', tg.arrival_date) as month,
  
  -- Group metrics
  COUNT(DISTINCT tg.id) as total_groups,
  COUNT(DISTINCT tgm.id) as total_travelers,
  COUNT(DISTINCT CASE WHEN tg.status = 'arrived' THEN tg.id END) as arrived_groups,
  COUNT(DISTINCT CASE WHEN tg.coordination_status = 'complete' THEN tg.id END) as fully_coordinated_groups,
  
  -- Flight metrics
  COUNT(DISTINCT fc.id) as total_flights,
  COUNT(DISTINCT fpa.id) as total_flight_passengers,
  COUNT(DISTINCT CASE WHEN fc.status = 'landed' THEN fc.id END) as completed_flights,
  
  -- Transportation metrics
  COUNT(DISTINCT gtc.id) as total_transport_runs,
  COUNT(DISTINCT tpa.id) as total_transport_passengers,
  COUNT(DISTINCT CASE WHEN gtc.status = 'completed' THEN gtc.id END) as completed_transport,
  
  -- Hotel metrics
  COUNT(DISTINCT lb.id) as total_hotel_bookings,
  COUNT(DISTINCT hra.id) as total_room_assignments,
  COUNT(DISTINCT CASE WHEN hra.check_in_status = 'checked_in' THEN hra.id END) as checked_in_guests,
  
  -- Financial metrics
  COALESCE(SUM(fc.total_cost), 0) as total_flight_cost,
  COALESCE(SUM(gtc.total_cost), 0) as total_transport_cost,
  COALESCE(SUM(lb.total_amount), 0) as total_hotel_cost,
  COALESCE(SUM(fc.total_cost) + SUM(gtc.total_cost) + SUM(lb.total_amount), 0) as total_travel_cost,
  
  -- Efficiency metrics
  CASE 
    WHEN COUNT(DISTINCT tgm.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN tg.coordination_status = 'complete' THEN tg.id END)::DECIMAL / COUNT(DISTINCT tg.id)) * 100, 2)
    ELSE 0 
  END as coordination_completion_rate,
  
  CASE 
    WHEN COUNT(DISTINCT tgm.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN tg.status = 'arrived' THEN tg.id END)::DECIMAL / COUNT(DISTINCT tg.id)) * 100, 2)
    ELSE 0 
  END as arrival_success_rate
  
FROM travel_groups tg
LEFT JOIN travel_group_members tgm ON tg.id = tgm.group_id
LEFT JOIN flight_coordination fc ON tg.id = fc.group_id
LEFT JOIN flight_passenger_assignments fpa ON fc.id = fpa.flight_id
LEFT JOIN ground_transportation_coordination gtc ON tg.id = gtc.group_id
LEFT JOIN transportation_passenger_assignments tpa ON gtc.id = tpa.transportation_id
LEFT JOIN lodging_bookings lb ON tg.event_id = lb.event_id OR tg.tour_id = lb.tour_id
LEFT JOIN hotel_room_assignments hra ON lb.id = hra.lodging_booking_id
GROUP BY DATE_TRUNC('day', tg.arrival_date), DATE_TRUNC('week', tg.arrival_date), DATE_TRUNC('month', tg.arrival_date);

-- =============================================================================
-- TRAVEL GROUP UTILIZATION VIEW
-- =============================================================================

CREATE OR REPLACE VIEW travel_group_utilization AS
SELECT 
  tg.id as group_id,
  tg.name as group_name,
  tg.group_type,
  tg.department,
  tg.priority_level,
  tg.total_members,
  tg.confirmed_members,
  
  -- Flight utilization
  COUNT(DISTINCT fc.id) as total_flights,
  COUNT(DISTINCT fpa.id) as flight_passengers,
  CASE 
    WHEN COUNT(DISTINCT fc.id) > 0 
    THEN ROUND((COUNT(DISTINCT fpa.id)::DECIMAL / COUNT(DISTINCT fc.id)) / tg.total_members * 100, 2)
    ELSE 0 
  END as flight_utilization_percentage,
  
  -- Transportation utilization
  COUNT(DISTINCT gtc.id) as total_transport_runs,
  COUNT(DISTINCT tpa.id) as transport_passengers,
  CASE 
    WHEN COUNT(DISTINCT gtc.id) > 0 
    THEN ROUND((COUNT(DISTINCT tpa.id)::DECIMAL / COUNT(DISTINCT gtc.id)) / tg.total_members * 100, 2)
    ELSE 0 
  END as transport_utilization_percentage,
  
  -- Hotel utilization
  COUNT(DISTINCT lb.id) as total_hotel_bookings,
  COUNT(DISTINCT hra.id) as hotel_guests,
  CASE 
    WHEN COUNT(DISTINCT lb.id) > 0 
    THEN ROUND((COUNT(DISTINCT hra.id)::DECIMAL / COUNT(DISTINCT lb.id)) / tg.total_members * 100, 2)
    ELSE 0 
  END as hotel_utilization_percentage,
  
  -- Coordination status
  tg.coordination_status,
  tg.status as group_status,
  
  -- Cost tracking
  COALESCE(SUM(fc.total_cost), 0) as total_flight_cost,
  COALESCE(SUM(gtc.total_cost), 0) as total_transport_cost,
  COALESCE(SUM(lb.total_amount), 0) as total_hotel_cost,
  COALESCE(SUM(fc.total_cost) + SUM(gtc.total_cost) + SUM(lb.total_amount), 0) as total_group_cost,
  
  -- Efficiency metrics
  CASE 
    WHEN tg.total_members > 0 
    THEN ROUND((tg.confirmed_members::DECIMAL / tg.total_members) * 100, 2)
    ELSE 0 
  END as confirmation_rate
  
FROM travel_groups tg
LEFT JOIN flight_coordination fc ON tg.id = fc.group_id
LEFT JOIN flight_passenger_assignments fpa ON fc.id = fpa.flight_id
LEFT JOIN ground_transportation_coordination gtc ON tg.id = gtc.group_id
LEFT JOIN transportation_passenger_assignments tpa ON gtc.id = tpa.transportation_id
LEFT JOIN lodging_bookings lb ON tg.event_id = lb.event_id OR tg.tour_id = lb.tour_id
LEFT JOIN hotel_room_assignments hra ON lb.id = hra.lodging_booking_id
GROUP BY tg.id, tg.name, tg.group_type, tg.department, tg.priority_level, tg.total_members, tg.confirmed_members, tg.coordination_status, tg.status;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Travel groups indexes
CREATE INDEX IF NOT EXISTS idx_travel_groups_type ON travel_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_travel_groups_department ON travel_groups(department);
CREATE INDEX IF NOT EXISTS idx_travel_groups_status ON travel_groups(status);
CREATE INDEX IF NOT EXISTS idx_travel_groups_coordination_status ON travel_groups(coordination_status);
CREATE INDEX IF NOT EXISTS idx_travel_groups_dates ON travel_groups(arrival_date, departure_date);
CREATE INDEX IF NOT EXISTS idx_travel_groups_event_tour ON travel_groups(event_id, tour_id);

-- Travel group members indexes
CREATE INDEX IF NOT EXISTS idx_travel_group_members_group_id ON travel_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_travel_group_members_staff_id ON travel_group_members(staff_id);
CREATE INDEX IF NOT EXISTS idx_travel_group_members_crew_id ON travel_group_members(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_travel_group_members_status ON travel_group_members(status);
CREATE INDEX IF NOT EXISTS idx_travel_group_members_name ON travel_group_members USING gin(member_name gin_trgm_ops);

-- Flight coordination indexes
CREATE INDEX IF NOT EXISTS idx_flight_coordination_group_id ON flight_coordination(group_id);
CREATE INDEX IF NOT EXISTS idx_flight_coordination_dates ON flight_coordination(departure_time, arrival_time);
CREATE INDEX IF NOT EXISTS idx_flight_coordination_status ON flight_coordination(status);
CREATE INDEX IF NOT EXISTS idx_flight_coordination_airports ON flight_coordination(departure_airport, arrival_airport);
CREATE INDEX IF NOT EXISTS idx_flight_coordination_event_tour ON flight_coordination(event_id, tour_id);

-- Flight passenger assignments indexes
CREATE INDEX IF NOT EXISTS idx_flight_passenger_assignments_flight_id ON flight_passenger_assignments(flight_id);
CREATE INDEX IF NOT EXISTS idx_flight_passenger_assignments_member_id ON flight_passenger_assignments(group_member_id);
CREATE INDEX IF NOT EXISTS idx_flight_passenger_assignments_status ON flight_passenger_assignments(status);
CREATE INDEX IF NOT EXISTS idx_flight_passenger_assignments_seat ON flight_passenger_assignments(seat_number);

-- Ground transportation indexes
CREATE INDEX IF NOT EXISTS idx_ground_transportation_group_id ON ground_transportation_coordination(group_id);
CREATE INDEX IF NOT EXISTS idx_ground_transportation_dates ON ground_transportation_coordination(pickup_time, estimated_dropoff_time);
CREATE INDEX IF NOT EXISTS idx_ground_transportation_status ON ground_transportation_coordination(status);
CREATE INDEX IF NOT EXISTS idx_ground_transportation_type ON ground_transportation_coordination(transport_type);
CREATE INDEX IF NOT EXISTS idx_ground_transportation_event_tour ON ground_transportation_coordination(event_id, tour_id);

-- Transportation passenger assignments indexes
CREATE INDEX IF NOT EXISTS idx_transportation_passenger_assignments_transport_id ON transportation_passenger_assignments(transportation_id);
CREATE INDEX IF NOT EXISTS idx_transportation_passenger_assignments_member_id ON transportation_passenger_assignments(group_member_id);
CREATE INDEX IF NOT EXISTS idx_transportation_passenger_assignments_status ON transportation_passenger_assignments(status);

-- Hotel room assignments indexes
CREATE INDEX IF NOT EXISTS idx_hotel_room_assignments_booking_id ON hotel_room_assignments(lodging_booking_id);
CREATE INDEX IF NOT EXISTS idx_hotel_room_assignments_member_id ON hotel_room_assignments(group_member_id);
CREATE INDEX IF NOT EXISTS idx_hotel_room_assignments_status ON hotel_room_assignments(status);
CREATE INDEX IF NOT EXISTS idx_hotel_room_assignments_checkin_status ON hotel_room_assignments(check_in_status);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_travel_coordination_timeline_dates ON travel_coordination_timeline(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_travel_coordination_timeline_type ON travel_coordination_timeline(entry_type);
CREATE INDEX IF NOT EXISTS idx_travel_coordination_timeline_group_id ON travel_coordination_timeline(group_id);
CREATE INDEX IF NOT EXISTS idx_travel_coordination_timeline_status ON travel_coordination_timeline(status);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_travel_groups_name_search ON travel_groups USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_travel_group_members_name_search ON travel_group_members USING gin(member_name gin_trgm_ops);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_passenger_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ground_transportation_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_passenger_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_coordination_timeline ENABLE ROW LEVEL SECURITY;

-- Travel groups policies
CREATE POLICY "Users can view travel groups" ON travel_groups
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage travel groups" ON travel_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Travel group members policies
CREATE POLICY "Users can view travel group members" ON travel_group_members
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage travel group members" ON travel_group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Flight coordination policies
CREATE POLICY "Users can view flight coordination" ON flight_coordination
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage flight coordination" ON flight_coordination
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Flight passenger assignments policies
CREATE POLICY "Users can view flight passenger assignments" ON flight_passenger_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage flight passenger assignments" ON flight_passenger_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Ground transportation coordination policies
CREATE POLICY "Users can view ground transportation coordination" ON ground_transportation_coordination
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage ground transportation coordination" ON ground_transportation_coordination
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Transportation passenger assignments policies
CREATE POLICY "Users can view transportation passenger assignments" ON transportation_passenger_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage transportation passenger assignments" ON transportation_passenger_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Hotel room assignments policies
CREATE POLICY "Users can view hotel room assignments" ON hotel_room_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage hotel room assignments" ON hotel_room_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp 
      WHERE sp.user_id = auth.uid() 
      AND sp.department = 'admin'
    )
  );

-- Travel coordination timeline policies
CREATE POLICY "Users can view travel coordination timeline" ON travel_coordination_timeline
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage travel coordination timeline" ON travel_coordination_timeline
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

-- Function to update group member counts
CREATE OR REPLACE FUNCTION update_travel_group_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE travel_groups 
    SET total_members = total_members + 1,
        updated_at = NOW()
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE travel_groups 
    SET total_members = total_members - 1,
        updated_at = NOW()
    WHERE id = OLD.group_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update group member counts
CREATE TRIGGER trigger_update_travel_group_counts
  AFTER INSERT OR DELETE ON travel_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_group_counts();

-- Function to update flight passenger counts
CREATE OR REPLACE FUNCTION update_flight_passenger_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE flight_coordination 
    SET booked_seats = booked_seats + 1,
        available_seats = available_seats - 1,
        updated_at = NOW()
    WHERE id = NEW.flight_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flight_coordination 
    SET booked_seats = booked_seats - 1,
        available_seats = available_seats + 1,
        updated_at = NOW()
    WHERE id = OLD.flight_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update flight passenger counts
CREATE TRIGGER trigger_update_flight_passenger_counts
  AFTER INSERT OR DELETE ON flight_passenger_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_flight_passenger_counts();

-- Function to update transportation passenger counts
CREATE OR REPLACE FUNCTION update_transportation_passenger_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ground_transportation_coordination 
    SET assigned_passengers = assigned_passengers + 1,
        updated_at = NOW()
    WHERE id = NEW.transportation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ground_transportation_coordination 
    SET assigned_passengers = assigned_passengers - 1,
        updated_at = NOW()
    WHERE id = OLD.transportation_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update transportation passenger counts
CREATE TRIGGER trigger_update_transportation_passenger_counts
  AFTER INSERT OR DELETE ON transportation_passenger_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_transportation_passenger_counts();

-- Function to auto-update coordination status
CREATE OR REPLACE FUNCTION update_travel_group_coordination_status()
RETURNS TRIGGER AS $$
DECLARE
  has_flights BOOLEAN;
  has_hotels BOOLEAN;
  has_transport BOOLEAN;
BEGIN
  -- Check if group has flights
  SELECT EXISTS(SELECT 1 FROM flight_coordination WHERE group_id = NEW.group_id) INTO has_flights;
  
  -- Check if group has hotels (through lodging bookings)
  SELECT EXISTS(
    SELECT 1 FROM lodging_bookings lb 
    JOIN travel_groups tg ON (lb.event_id = tg.event_id OR lb.tour_id = tg.tour_id)
    WHERE tg.id = NEW.group_id
  ) INTO has_hotels;
  
  -- Check if group has transport
  SELECT EXISTS(SELECT 1 FROM ground_transportation_coordination WHERE group_id = NEW.group_id) INTO has_transport;
  
  -- Update coordination status based on what's booked
  IF has_flights AND has_hotels AND has_transport THEN
    UPDATE travel_groups SET coordination_status = 'complete' WHERE id = NEW.group_id;
  ELSIF has_flights AND has_hotels THEN
    UPDATE travel_groups SET coordination_status = 'hotels_booked' WHERE id = NEW.group_id;
  ELSIF has_flights THEN
    UPDATE travel_groups SET coordination_status = 'flights_booked' WHERE id = NEW.group_id;
  ELSE
    UPDATE travel_groups SET coordination_status = 'pending' WHERE id = NEW.group_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update coordination status
CREATE TRIGGER trigger_update_travel_group_coordination_status
  AFTER INSERT OR UPDATE ON flight_coordination
  FOR EACH ROW
  EXECUTE FUNCTION update_travel_group_coordination_status();

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample travel groups
INSERT INTO travel_groups (name, description, group_type, department, priority_level, arrival_date, departure_date, arrival_location, departure_location, total_members, confirmed_members, status, coordination_status, event_id) VALUES
('Main Stage Crew', 'Technical crew for main stage operations', 'crew', 'Technical', 1, '2024-08-14', '2024-08-17', 'JFK Airport', 'JFK Airport', 25, 23, 'confirmed', 'complete', (SELECT id FROM events LIMIT 1)),
('Sound Engineering Team', 'Audio engineers and sound technicians', 'crew', 'Technical', 1, '2024-08-14', '2024-08-17', 'JFK Airport', 'JFK Airport', 12, 12, 'confirmed', 'complete', (SELECT id FROM events LIMIT 1)),
('Lighting Crew', 'Lighting technicians and operators', 'crew', 'Technical', 2, '2024-08-14', '2024-08-17', 'JFK Airport', 'JFK Airport', 8, 8, 'confirmed', 'complete', (SELECT id FROM events LIMIT 1)),
('Artist Management', 'Artist managers and coordinators', 'staff', 'Management', 1, '2024-08-13', '2024-08-18', 'JFK Airport', 'JFK Airport', 6, 6, 'confirmed', 'complete', (SELECT id FROM events LIMIT 1)),
('VIP Guests', 'VIP attendees and special guests', 'vip', 'Guest Services', 1, '2024-08-14', '2024-08-16', 'JFK Airport', 'JFK Airport', 15, 15, 'confirmed', 'complete', (SELECT id FROM events LIMIT 1)),
('Media Team', 'Photographers, videographers, and press', 'media', 'Marketing', 3, '2024-08-14', '2024-08-17', 'JFK Airport', 'JFK Airport', 10, 8, 'confirmed', 'flights_booked', (SELECT id FROM events LIMIT 1)),
('Security Team', 'Event security personnel', 'security', 'Operations', 2, '2024-08-13', '2024-08-18', 'JFK Airport', 'JFK Airport', 20, 18, 'confirmed', 'hotels_booked', (SELECT id FROM events LIMIT 1)),
('Catering Staff', 'Food service and catering team', 'catering', 'Operations', 3, '2024-08-14', '2024-08-17', 'JFK Airport', 'JFK Airport', 12, 10, 'confirmed', 'pending', (SELECT id FROM events LIMIT 1))
ON CONFLICT DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Advanced Travel Coordination System migration completed successfully!';
  RAISE NOTICE 'Created tables: travel_groups, travel_group_members, flight_coordination, flight_passenger_assignments, ground_transportation_coordination, transportation_passenger_assignments, hotel_room_assignments, travel_coordination_timeline';
  RAISE NOTICE 'Created views: travel_coordination_analytics, travel_group_utilization';
  RAISE NOTICE 'Added comprehensive RLS policies and triggers';
  RAISE NOTICE 'Integrated with existing lodging and crew management systems';
END $$; 