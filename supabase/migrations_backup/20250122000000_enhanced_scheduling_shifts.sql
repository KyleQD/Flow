-- =============================================================================
-- ENHANCED SCHEDULING & SHIFTS SYSTEM
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE SHIFT TABLES
-- =============================================================================

-- Enhanced shifts table (replaces basic staff_schedules)
CREATE TABLE IF NOT EXISTS venue_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL,
  event_id UUID, -- Optional: can be standalone shift or event-related
  shift_title TEXT NOT NULL,
  shift_description TEXT,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  department TEXT,
  role_required TEXT,
  staff_needed INTEGER DEFAULT 1,
  staff_assigned INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  flat_rate DECIMAL(10,2),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB, -- {frequency: 'daily'|'weekly'|'monthly', interval: 1, end_date: '2024-12-31'}
  shift_status TEXT DEFAULT 'open' CHECK (shift_status IN ('open', 'filled', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  dress_code TEXT,
  special_requirements TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift assignments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS venue_shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES venue_shifts(id) ON DELETE CASCADE NOT NULL,
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  assignment_status TEXT DEFAULT 'assigned' CHECK (assignment_status IN ('assigned', 'confirmed', 'declined', 'cancelled')),
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_id, staff_member_id)
);

-- Shift templates for recurring shifts
CREATE TABLE IF NOT EXISTS venue_shift_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_description TEXT,
  department TEXT,
  role_required TEXT,
  staff_needed INTEGER DEFAULT 1,
  hourly_rate DECIMAL(10,2),
  flat_rate DECIMAL(10,2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  dress_code TEXT,
  special_requirements TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring shift schedules
CREATE TABLE IF NOT EXISTS venue_recurring_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL,
  template_id UUID REFERENCES venue_shift_templates(id) ON DELETE CASCADE,
  shift_title TEXT NOT NULL,
  shift_description TEXT,
  department TEXT,
  role_required TEXT,
  staff_needed INTEGER DEFAULT 1,
  hourly_rate DECIMAL(10,2),
  flat_rate DECIMAL(10,2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  dress_code TEXT,
  special_requirements TEXT,
  notes TEXT,
  recurrence_pattern JSONB NOT NULL, -- {frequency: 'daily'|'weekly'|'monthly', interval: 1, days_of_week: [1,2,3], start_date: '2024-01-01', end_date: '2024-12-31'}
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SHIFT MANAGEMENT TOOLS
-- =============================================================================

-- Shift swap requests
CREATE TABLE IF NOT EXISTS venue_shift_swaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL,
  original_shift_id UUID REFERENCES venue_shifts(id) ON DELETE CASCADE NOT NULL,
  original_staff_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  requested_staff_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  swap_reason TEXT,
  request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'denied', 'cancelled')),
  requested_by UUID NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  denied_by UUID,
  denied_at TIMESTAMPTZ,
  denial_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift drop/pickup requests
CREATE TABLE IF NOT EXISTS venue_shift_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL,
  shift_id UUID REFERENCES venue_shifts(id) ON DELETE CASCADE NOT NULL,
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('drop', 'pickup')),
  request_reason TEXT,
  request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'approved', 'denied', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  denied_by UUID,
  denied_at TIMESTAMPTZ,
  denial_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift notes and communications
CREATE TABLE IF NOT EXISTS venue_shift_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID REFERENCES venue_shifts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'dress_code', 'call_time', 'special_instructions', 'emergency')),
  title TEXT,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE, -- visible to all assigned staff
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHECK-IN / CHECK-OUT SYSTEM
-- =============================================================================

-- Shift check-ins
CREATE TABLE IF NOT EXISTS venue_shift_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_assignment_id UUID REFERENCES venue_shift_assignments(id) ON DELETE CASCADE NOT NULL,
  checkin_type TEXT DEFAULT 'manual' CHECK (checkin_type IN ('manual', 'qr_code', 'pin', 'gps')),
  checkin_time TIMESTAMPTZ NOT NULL,
  checkout_time TIMESTAMPTZ,
  checkin_location JSONB, -- {latitude: 0, longitude: 0, address: "123 Main St"}
  checkout_location JSONB,
  is_late BOOLEAN DEFAULT FALSE,
  late_minutes INTEGER DEFAULT 0,
  is_no_show BOOLEAN DEFAULT FALSE,
  manual_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  override_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR codes for check-in
CREATE TABLE IF NOT EXISTS venue_checkin_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL,
  shift_id UUID REFERENCES venue_shifts(id) ON DELETE CASCADE,
  qr_code_hash TEXT UNIQUE NOT NULL,
  qr_code_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Venue shifts indexes
CREATE INDEX IF NOT EXISTS idx_venue_shifts_venue_date ON venue_shifts(venue_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_venue_shifts_event ON venue_shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_shifts_status ON venue_shifts(shift_status);
CREATE INDEX IF NOT EXISTS idx_venue_shifts_department ON venue_shifts(department);
CREATE INDEX IF NOT EXISTS idx_venue_shifts_recurring ON venue_shifts(is_recurring);

-- Shift assignments indexes
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift ON venue_shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_staff ON venue_shift_assignments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_status ON venue_shift_assignments(assignment_status);

-- Shift templates indexes
CREATE INDEX IF NOT EXISTS idx_shift_templates_venue ON venue_shift_templates(venue_id);
CREATE INDEX IF NOT EXISTS idx_shift_templates_active ON venue_shift_templates(is_active);

-- Recurring shifts indexes
CREATE INDEX IF NOT EXISTS idx_recurring_shifts_venue ON venue_recurring_shifts(venue_id);
CREATE INDEX IF NOT EXISTS idx_recurring_shifts_active ON venue_recurring_shifts(is_active);

-- Shift swaps indexes
CREATE INDEX IF NOT EXISTS idx_shift_swaps_venue ON venue_shift_swaps(venue_id);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_status ON venue_shift_swaps(request_status);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_original_staff ON venue_shift_swaps(original_staff_id);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_requested_staff ON venue_shift_swaps(requested_staff_id);

-- Shift requests indexes
CREATE INDEX IF NOT EXISTS idx_shift_requests_venue ON venue_shift_requests(venue_id);
CREATE INDEX IF NOT EXISTS idx_shift_requests_status ON venue_shift_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_shift_requests_staff ON venue_shift_requests(staff_member_id);

-- Check-in indexes
CREATE INDEX IF NOT EXISTS idx_shift_checkins_assignment ON venue_shift_checkins(shift_assignment_id);
CREATE INDEX IF NOT EXISTS idx_shift_checkins_time ON venue_shift_checkins(checkin_time);
CREATE INDEX IF NOT EXISTS idx_shift_checkins_late ON venue_shift_checkins(is_late);

-- QR code indexes
CREATE INDEX IF NOT EXISTS idx_checkin_qr_venue ON venue_checkin_qr_codes(venue_id);
CREATE INDEX IF NOT EXISTS idx_checkin_qr_active ON venue_checkin_qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_checkin_qr_hash ON venue_checkin_qr_codes(qr_code_hash);

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

-- Function to generate recurring shifts
CREATE OR REPLACE FUNCTION generate_recurring_shifts()
RETURNS TRIGGER AS $$
DECLARE
  shift_date DATE;
  end_date DATE;
  pattern JSONB;
  frequency TEXT;
  interval_val INTEGER;
  days_of_week INTEGER[];
  day_of_week INTEGER;
BEGIN
  -- Only process if this is a new recurring shift
  IF NEW.is_active = TRUE AND TG_OP = 'INSERT' THEN
    pattern := NEW.recurrence_pattern;
    frequency := pattern->>'frequency';
    interval_val := COALESCE((pattern->>'interval')::INTEGER, 1);
    end_date := (pattern->>'end_date')::DATE;
    shift_date := (pattern->>'start_date')::DATE;
    
    -- Handle different frequency types
    IF frequency = 'daily' THEN
      WHILE shift_date <= end_date LOOP
        INSERT INTO venue_shifts (
          venue_id, shift_title, shift_description, department, role_required,
          staff_needed, hourly_rate, flat_rate, start_time, end_time,
          location, dress_code, special_requirements, notes, is_recurring,
          recurring_pattern, shift_date, created_by
        ) VALUES (
          NEW.venue_id, NEW.shift_title, NEW.shift_description, NEW.department,
          NEW.role_required, NEW.staff_needed, NEW.hourly_rate, NEW.flat_rate,
          NEW.start_time, NEW.end_time, NEW.location, NEW.dress_code,
          NEW.special_requirements, NEW.notes, TRUE, pattern, shift_date, NEW.created_by
        );
        shift_date := shift_date + (interval '1 day' * interval_val);
      END LOOP;
      
    ELSIF frequency = 'weekly' THEN
      days_of_week := ARRAY(SELECT jsonb_array_elements_text(pattern->'days_of_week')::INTEGER);
      WHILE shift_date <= end_date LOOP
        day_of_week := EXTRACT(DOW FROM shift_date);
        IF day_of_week = ANY(days_of_week) THEN
          INSERT INTO venue_shifts (
            venue_id, shift_title, shift_description, department, role_required,
            staff_needed, hourly_rate, flat_rate, start_time, end_time,
            location, dress_code, special_requirements, notes, is_recurring,
            recurring_pattern, shift_date, created_by
          ) VALUES (
            NEW.venue_id, NEW.shift_title, NEW.shift_description, NEW.department,
            NEW.role_required, NEW.staff_needed, NEW.hourly_rate, NEW.flat_rate,
            NEW.start_time, NEW.end_time, NEW.location, NEW.dress_code,
            NEW.special_requirements, NEW.notes, TRUE, pattern, shift_date, NEW.created_by
          );
        END IF;
        shift_date := shift_date + interval '1 day';
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update staff assigned count
CREATE OR REPLACE FUNCTION update_shift_staff_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE venue_shifts 
    SET staff_assigned = staff_assigned + 1
    WHERE id = NEW.shift_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE venue_shifts 
    SET staff_assigned = staff_assigned - 1
    WHERE id = OLD.shift_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to check for scheduling conflicts
CREATE OR REPLACE FUNCTION check_scheduling_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping shifts for the same staff member
  SELECT COUNT(*) INTO conflict_count
  FROM venue_shift_assignments vsa
  JOIN venue_shifts vs ON vsa.shift_id = vs.id
  WHERE vsa.staff_member_id = NEW.staff_member_id
    AND vsa.assignment_status IN ('assigned', 'confirmed')
    AND vs.shift_date = (SELECT shift_date FROM venue_shifts WHERE id = NEW.shift_id)
    AND (
      (vs.start_time < (SELECT end_time FROM venue_shifts WHERE id = NEW.shift_id) AND
       vs.end_time > (SELECT start_time FROM venue_shifts WHERE id = NEW.shift_id))
    )
    AND vsa.shift_id != NEW.shift_id;
    
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Scheduling conflict detected for staff member %', NEW.staff_member_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update timestamps
CREATE TRIGGER update_venue_shifts_updated_at BEFORE UPDATE ON venue_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_assignments_updated_at BEFORE UPDATE ON venue_shift_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_templates_updated_at BEFORE UPDATE ON venue_shift_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_shifts_updated_at BEFORE UPDATE ON venue_recurring_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_swaps_updated_at BEFORE UPDATE ON venue_shift_swaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_requests_updated_at BEFORE UPDATE ON venue_shift_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_notes_updated_at BEFORE UPDATE ON venue_shift_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shift_checkins_updated_at BEFORE UPDATE ON venue_shift_checkins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkin_qr_codes_updated_at BEFORE UPDATE ON venue_checkin_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate recurring shifts
CREATE TRIGGER generate_recurring_shifts_trigger
  AFTER INSERT ON venue_recurring_shifts
  FOR EACH ROW EXECUTE FUNCTION generate_recurring_shifts();

-- Update staff count
CREATE TRIGGER update_shift_staff_count_trigger
  AFTER INSERT OR DELETE ON venue_shift_assignments
  FOR EACH ROW EXECUTE FUNCTION update_shift_staff_count();

-- Check for conflicts
CREATE TRIGGER check_scheduling_conflicts_trigger
  BEFORE INSERT ON venue_shift_assignments
  FOR EACH ROW EXECUTE FUNCTION check_scheduling_conflicts();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE venue_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_recurring_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_shift_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_shift_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_shift_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_shift_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_checkin_qr_codes ENABLE ROW LEVEL SECURITY;

-- Venue shifts policies
CREATE POLICY "Users can view shifts for their venues" ON venue_shifts
  FOR SELECT USING (
    venue_id IN (
      SELECT venue_id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage shifts" ON venue_shifts
  FOR ALL USING (
    venue_id IN (
      SELECT vtm.venue_id FROM venue_team_members vtm
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4 -- Manager level and above
    )
  );

-- Shift assignments policies
CREATE POLICY "Users can view their own assignments" ON venue_shift_assignments
  FOR SELECT USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage assignments" ON venue_shift_assignments
  FOR ALL USING (
    shift_id IN (
      SELECT vs.id FROM venue_shifts vs
      JOIN venue_team_members vtm ON vs.venue_id = vtm.venue_id
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- Shift templates policies
CREATE POLICY "Users can view templates for their venues" ON venue_shift_templates
  FOR SELECT USING (
    venue_id IN (
      SELECT venue_id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage templates" ON venue_shift_templates
  FOR ALL USING (
    venue_id IN (
      SELECT vtm.venue_id FROM venue_team_members vtm
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- Recurring shifts policies
CREATE POLICY "Users can view recurring shifts for their venues" ON venue_recurring_shifts
  FOR SELECT USING (
    venue_id IN (
      SELECT venue_id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage recurring shifts" ON venue_recurring_shifts
  FOR ALL USING (
    venue_id IN (
      SELECT vtm.venue_id FROM venue_team_members vtm
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- Shift swaps policies
CREATE POLICY "Users can view their own swaps" ON venue_shift_swaps
  FOR SELECT USING (
    original_staff_id IN (
      SELECT id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR
    requested_staff_id IN (
      SELECT id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage swaps" ON venue_shift_swaps
  FOR ALL USING (
    venue_id IN (
      SELECT vtm.venue_id FROM venue_team_members vtm
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- Shift requests policies
CREATE POLICY "Users can view their own requests" ON venue_shift_requests
  FOR SELECT USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage requests" ON venue_shift_requests
  FOR ALL USING (
    venue_id IN (
      SELECT vtm.venue_id FROM venue_team_members vtm
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- Shift notes policies
CREATE POLICY "Users can view notes for their shifts" ON venue_shift_notes
  FOR SELECT USING (
    shift_id IN (
      SELECT vsa.shift_id FROM venue_shift_assignments vsa
      JOIN venue_team_members vtm ON vsa.staff_member_id = vtm.id
      WHERE vtm.user_id = auth.uid() AND vtm.status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage notes" ON venue_shift_notes
  FOR ALL USING (
    shift_id IN (
      SELECT vs.id FROM venue_shifts vs
      JOIN venue_team_members vtm ON vs.venue_id = vtm.venue_id
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- Check-in policies
CREATE POLICY "Users can view their own check-ins" ON venue_shift_checkins
  FOR SELECT USING (
    shift_assignment_id IN (
      SELECT vsa.id FROM venue_shift_assignments vsa
      JOIN venue_team_members vtm ON vsa.staff_member_id = vtm.id
      WHERE vtm.user_id = auth.uid() AND vtm.status = 'active'
    )
  );

CREATE POLICY "Venue admins can manage check-ins" ON venue_shift_checkins
  FOR ALL USING (
    shift_assignment_id IN (
      SELECT vsa.id FROM venue_shift_assignments vsa
      JOIN venue_shifts vs ON vsa.shift_id = vs.id
      JOIN venue_team_members vtm ON vs.venue_id = vtm.venue_id
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- QR code policies
CREATE POLICY "Venue admins can manage QR codes" ON venue_checkin_qr_codes
  FOR ALL USING (
    venue_id IN (
      SELECT vtm.venue_id FROM venue_team_members vtm
      JOIN venue_user_roles vur ON vtm.user_id = vur.user_id
      JOIN venue_roles vr ON vur.role_id = vr.id
      WHERE vtm.user_id = auth.uid() 
        AND vtm.status = 'active'
        AND vur.is_active = true
        AND vr.role_level >= 4
    )
  );

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample shift templates
INSERT INTO venue_shift_templates (venue_id, template_name, template_description, department, role_required, staff_needed, hourly_rate, start_time, end_time, location, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Evening Security', 'Standard evening security shift', 'Security', 'Security Guard', 2, 25.00, '18:00', '02:00', 'Main Entrance', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Sound Engineer', 'Live sound engineering for events', 'Technical', 'Sound Engineer', 1, 35.00, '16:00', '23:00', 'Main Stage', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Bar Service', 'Bar service during events', 'Service', 'Bartender', 3, 20.00, '19:00', '01:00', 'Main Bar', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440000', 'FOH Manager', 'Front of house management', 'Management', 'FOH Manager', 1, 30.00, '17:00', '23:00', 'FOH Area', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample recurring shifts
INSERT INTO venue_recurring_shifts (venue_id, template_id, shift_title, department, role_required, staff_needed, hourly_rate, start_time, end_time, location, recurrence_pattern, created_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 
   (SELECT id FROM venue_shift_templates WHERE template_name = 'Evening Security' LIMIT 1),
   'Weekend Security', 'Security', 'Security Guard', 2, 25.00, '18:00', '02:00', 'Main Entrance',
   '{"frequency": "weekly", "interval": 1, "days_of_week": [5, 6], "start_date": "2024-01-01", "end_date": "2024-12-31"}',
   '550e8400-e29b-41d4-a716-446655440001');

COMMIT; 