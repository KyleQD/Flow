-- Enhanced Staff Management Migration
-- Three-Tier System: Staff (employees) | Crew (event specialists) | Team (contractors)
-- =============================================================================

-- Enhance existing venue_team_members table for Staff
-- =============================================================================
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer'));
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS weekly_schedule JSONB DEFAULT '{}';
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{}';
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create Event Crew Members Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS venue_crew_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  specialty TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  rate DECIMAL(10,2) NOT NULL,
  rate_type TEXT DEFAULT 'daily' CHECK (rate_type IN ('hourly', 'daily', 'project')),
  availability TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  events_completed INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  preferred_event_types TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Team/Contractor Members Table  
-- =============================================================================
CREATE TABLE IF NOT EXISTS venue_team_contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL,
  contract_type TEXT DEFAULT 'freelance' CHECK (contract_type IN ('freelance', 'contractor', 'agency')),
  specialization TEXT[] DEFAULT '{}',
  rate DECIMAL(10,2) NOT NULL,
  rate_type TEXT DEFAULT 'project' CHECK (rate_type IN ('hourly', 'project', 'monthly')),
  active_contracts INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_project TEXT,
  portfolio_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Event Crew Assignments Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS event_crew_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  crew_member_id UUID REFERENCES venue_crew_members(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  rate_agreed DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, crew_member_id)
);

-- Enhanced Job Board Integration
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_jobs') THEN
    ALTER TABLE staff_jobs ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE;
    ALTER TABLE staff_jobs ADD COLUMN IF NOT EXISTS job_category TEXT DEFAULT 'staff' CHECK (job_category IN ('staff', 'crew', 'team'));
    ALTER TABLE staff_jobs ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;
    ALTER TABLE staff_jobs ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_venue_crew_members_venue_id ON venue_crew_members(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_crew_members_specialty ON venue_crew_members(specialty);
CREATE INDEX IF NOT EXISTS idx_venue_crew_members_availability ON venue_crew_members(is_available);

CREATE INDEX IF NOT EXISTS idx_venue_team_contractors_venue_id ON venue_team_contractors(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_team_contractors_contract_type ON venue_team_contractors(contract_type);

CREATE INDEX IF NOT EXISTS idx_event_crew_assignments_event_id ON event_crew_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_crew_assignments_crew_member_id ON event_crew_assignments(crew_member_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================
ALTER TABLE venue_crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_team_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_crew_assignments ENABLE ROW LEVEL SECURITY;

-- Crew Members Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'venue_crew_members' 
    AND policyname = 'Venue owners can manage their crew members'
  ) THEN
    CREATE POLICY "Venue owners can manage their crew members"
      ON venue_crew_members FOR ALL
      USING (
        venue_id IN (
          SELECT id FROM venue_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'venue_crew_members' 
    AND policyname = 'Anyone can view available crew members'
  ) THEN
    CREATE POLICY "Anyone can view available crew members"
      ON venue_crew_members FOR SELECT
      USING (is_available = true);
  END IF;
END $$;

-- Team Contractors Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'venue_team_contractors' 
    AND policyname = 'Venue owners can manage their team contractors'
  ) THEN
    CREATE POLICY "Venue owners can manage their team contractors"
      ON venue_team_contractors FOR ALL
      USING (
        venue_id IN (
          SELECT id FROM venue_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Event Crew Assignments Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_crew_assignments' 
    AND policyname = 'Venue owners can manage event crew assignments'
  ) THEN
    CREATE POLICY "Venue owners can manage event crew assignments"
      ON event_crew_assignments FOR ALL
      USING (
        venue_id IN (
          SELECT id FROM venue_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to get staff dashboard stats
CREATE OR REPLACE FUNCTION get_staff_dashboard_stats(p_venue_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalStaff', COALESCE((SELECT COUNT(*) FROM venue_team_members WHERE venue_id = p_venue_id), 0),
    'activeStaff', COALESCE((SELECT COUNT(*) FROM venue_team_members WHERE venue_id = p_venue_id AND status = 'active'), 0),
    'totalCrew', COALESCE((SELECT COUNT(*) FROM venue_crew_members WHERE venue_id = p_venue_id), 0),
    'availableCrew', COALESCE((SELECT COUNT(*) FROM venue_crew_members WHERE venue_id = p_venue_id AND is_available = true), 0),
    'totalTeam', COALESCE((SELECT COUNT(*) FROM venue_team_contractors WHERE venue_id = p_venue_id), 0),
    'activeTeam', COALESCE((SELECT COUNT(*) FROM venue_team_contractors WHERE venue_id = p_venue_id AND is_active = true), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 