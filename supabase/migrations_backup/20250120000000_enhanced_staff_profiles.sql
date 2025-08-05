-- Enhanced Staff Profiles Migration
-- =============================================================================
-- This migration enhances the venue_team_members table and adds new tables
-- for comprehensive staff profile management
-- =============================================================================

-- Enhance existing venue_team_members table for comprehensive staff profiles
-- =============================================================================
DO $$
BEGIN
  -- Add new columns to existing venue_team_members table for enhanced staff profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venue_team_members') THEN
    
    -- Personal details
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS first_name TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS last_name TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS pronouns TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS postal_code TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
    
    -- Role and department details
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS department TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS role_level TEXT DEFAULT 'entry' CHECK (role_level IN ('entry', 'mid', 'senior', 'manager', 'director'));
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS role_category TEXT CHECK (role_category IN ('foh', 'tech', 'security', 'bar', 'kitchen', 'management', 'marketing', 'maintenance', 'other'));
    
    -- Employment details
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS salary DECIMAL(10,2);
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS pay_frequency TEXT DEFAULT 'hourly' CHECK (pay_frequency IN ('hourly', 'weekly', 'biweekly', 'monthly'));
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS termination_date DATE;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS termination_reason TEXT;
    
    -- Performance and tracking
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS performance_rating DECIMAL(3,2) DEFAULT 0;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS reliability_score DECIMAL(3,2) DEFAULT 0;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS events_completed INTEGER DEFAULT 0;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS total_hours_worked INTEGER DEFAULT 0;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS last_performance_review DATE;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS next_review_date DATE;
    
    -- Emergency contact
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';
    
    -- Internal notes (admin-only)
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS internal_notes TEXT;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS admin_notes TEXT;
    
    -- Availability and scheduling
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS weekly_availability JSONB DEFAULT '{}';
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS preferred_shifts JSONB DEFAULT '[]';
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS blackout_dates JSONB DEFAULT '[]';
    
    -- System fields
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
    ALTER TABLE venue_team_members ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
    
    RAISE NOTICE 'Enhanced venue_team_members table for comprehensive staff profiles';
  END IF;
END $$;

-- Create Staff Certifications Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS staff_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  certification_name TEXT NOT NULL,
  certification_type TEXT NOT NULL CHECK (certification_type IN (
    'alcohol_handling', 'food_safety', 'rigging', 'safety', 'first_aid', 
    'fire_safety', 'security', 'technical', 'management', 'other'
  )),
  issuing_organization TEXT,
  certification_number TEXT,
  issue_date DATE NOT NULL,
  expiration_date DATE,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Staff Performance Reviews Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS staff_performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  review_date DATE NOT NULL,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
  reliability_rating DECIMAL(3,2) CHECK (reliability_rating >= 0 AND reliability_rating <= 5),
  teamwork_rating DECIMAL(3,2) CHECK (teamwork_rating >= 0 AND teamwork_rating <= 5),
  communication_rating DECIMAL(3,2) CHECK (communication_rating >= 0 AND communication_rating <= 5),
  technical_skills_rating DECIMAL(3,2) CHECK (technical_skills_rating >= 0 AND technical_skills_rating <= 5),
  strengths TEXT[],
  areas_for_improvement TEXT[],
  goals TEXT[],
  comments TEXT,
  staff_comments TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Staff Skills Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS staff_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT CHECK (skill_category IN (
    'technical', 'soft_skills', 'safety', 'management', 'customer_service', 'other'
  )),
  proficiency_level TEXT DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_member_id, skill_name)
);

-- Create Staff Documents Table (for additional documents beyond certifications)
-- =============================================================================
CREATE TABLE IF NOT EXISTS staff_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'id', 'tax_forms', 'contract', 'training_certificate', 'background_check', 
    'drug_test', 'medical_clearance', 'other'
  )),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  upload_date DATE NOT NULL,
  expiration_date DATE,
  is_required BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Staff Availability Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_member_id, day_of_week)
);

-- Create Staff Time Off Requests Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS staff_time_off_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_member_id UUID REFERENCES venue_team_members(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick_leave', 'personal', 'bereavement', 'jury_duty', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT true,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  denial_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_staff_certifications_staff_member_id ON staff_certifications(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_venue_id ON staff_certifications(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_expiration_date ON staff_certifications(expiration_date);

CREATE INDEX IF NOT EXISTS idx_staff_performance_reviews_staff_member_id ON staff_performance_reviews(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_reviews_venue_id ON staff_performance_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_reviews_review_date ON staff_performance_reviews(review_date);

CREATE INDEX IF NOT EXISTS idx_staff_skills_staff_member_id ON staff_skills(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_skills_venue_id ON staff_skills(venue_id);

CREATE INDEX IF NOT EXISTS idx_staff_documents_staff_member_id ON staff_documents(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_venue_id ON staff_documents(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_expiration_date ON staff_documents(expiration_date);

CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_member_id ON staff_availability(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_venue_id ON staff_availability(venue_id);

CREATE INDEX IF NOT EXISTS idx_staff_time_off_requests_staff_member_id ON staff_time_off_requests(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_requests_venue_id ON staff_time_off_requests(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_time_off_requests_status ON staff_time_off_requests(status);

-- Enhanced indexes for venue_team_members
CREATE INDEX IF NOT EXISTS idx_venue_team_members_role_category ON venue_team_members(role_category);
CREATE INDEX IF NOT EXISTS idx_venue_team_members_department ON venue_team_members(department);
CREATE INDEX IF NOT EXISTS idx_venue_team_members_performance_rating ON venue_team_members(performance_rating);
CREATE INDEX IF NOT EXISTS idx_venue_team_members_is_available ON venue_team_members(is_available);

-- Enable Row Level Security
-- =============================================================================
ALTER TABLE staff_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_off_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- =============================================================================

-- Staff Certifications Policies
CREATE POLICY "Venue owners can manage staff certifications"
  ON staff_certifications FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view their own certifications"
  ON staff_certifications FOR SELECT
  USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Staff Performance Reviews Policies
CREATE POLICY "Venue owners can manage performance reviews"
  ON staff_performance_reviews FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view their own performance reviews"
  ON staff_performance_reviews FOR SELECT
  USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Staff Skills Policies
CREATE POLICY "Venue owners can manage staff skills"
  ON staff_skills FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view their own skills"
  ON staff_skills FOR SELECT
  USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Staff Documents Policies
CREATE POLICY "Venue owners can manage staff documents"
  ON staff_documents FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view their own documents"
  ON staff_documents FOR SELECT
  USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Staff Availability Policies
CREATE POLICY "Venue owners can manage staff availability"
  ON staff_availability FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage their own availability"
  ON staff_availability FOR ALL
  USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Staff Time Off Requests Policies
CREATE POLICY "Venue owners can manage time off requests"
  ON staff_time_off_requests FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage their own time off requests"
  ON staff_time_off_requests FOR ALL
  USING (
    staff_member_id IN (
      SELECT id FROM venue_team_members WHERE user_id = auth.uid()
    )
  );

-- Update existing venue_team_members policies to include new fields
DROP POLICY IF EXISTS "Venue owners can manage their team members" ON venue_team_members;
CREATE POLICY "Venue owners can manage their team members"
  ON venue_team_members FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members can view their own profile" ON venue_team_members;
CREATE POLICY "Team members can view their own profile"
  ON venue_team_members FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create update triggers for updated_at timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staff_certifications_updated_at BEFORE UPDATE ON staff_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_performance_reviews_updated_at BEFORE UPDATE ON staff_performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_skills_updated_at BEFORE UPDATE ON staff_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_documents_updated_at BEFORE UPDATE ON staff_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON staff_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_time_off_requests_updated_at BEFORE UPDATE ON staff_time_off_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 