-- =============================================================================
-- FINAL FIXED STAFF MANAGEMENT TABLES
-- This version drops existing policies first and creates tables
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- DROP EXISTING POLICIES IF THEY EXIST
-- =============================================================================

DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable all for authenticated users on onboarding_candidates" ON staff_onboarding_candidates;
  DROP POLICY IF EXISTS "Enable all for authenticated users on onboarding_templates" ON staff_onboarding_templates;
  DROP POLICY IF EXISTS "Enable all for authenticated users on onboarding_steps" ON staff_onboarding_steps;
  DROP POLICY IF EXISTS "Enable all for authenticated users on onboarding_activities" ON staff_onboarding_activities;
  DROP POLICY IF EXISTS "Enable all for authenticated users on staff_messages" ON staff_messages;
  DROP POLICY IF EXISTS "Enable all for authenticated users on staff_contracts" ON staff_contracts;
  
  RAISE NOTICE '🗑️ Dropped existing policies if they existed';
END $$;

-- =============================================================================
-- STAFF ONBOARDING CANDIDATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_onboarding_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES staff_applications(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  stage TEXT DEFAULT 'application' CHECK (stage IN ('application', 'interview', 'background_check', 'documentation', 'training', 'completed')),
  application_date DATE DEFAULT CURRENT_DATE,
  avatar_url TEXT,
  experience_years INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  assigned_manager TEXT,
  start_date DATE,
  salary DECIMAL(10,2),
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'volunteer')),
  onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STAFF ONBOARDING TEMPLATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_onboarding_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  estimated_days INTEGER DEFAULT 14,
  required_documents TEXT[] DEFAULT '{}',
  assignees TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  last_used DATE,
  use_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STAFF ONBOARDING STEPS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES staff_onboarding_templates(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL CHECK (step_type IN ('document', 'training', 'meeting', 'setup', 'review', 'task', 'approval')),
  category TEXT NOT NULL CHECK (category IN ('admin', 'training', 'equipment', 'social', 'performance')),
  required BOOLEAN DEFAULT true,
  estimated_hours INTEGER DEFAULT 1,
  assigned_to TEXT,
  depends_on TEXT[] DEFAULT '{}',
  due_date_offset INTEGER,
  instructions TEXT,
  completion_criteria TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STAFF ONBOARDING ACTIVITIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_onboarding_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES staff_onboarding_candidates(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES staff_onboarding_steps(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('step_started', 'step_completed', 'document_uploaded', 'meeting_scheduled', 'email_sent', 'note_added')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STAFF MESSAGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipients UUID[] NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'announcement' CHECK (message_type IN ('announcement', 'schedule', 'training', 'emergency', 'general')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read_by UUID[] DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STAFF CONTRACTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS staff_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID,
  contract_type TEXT DEFAULT 'employment' CHECK (contract_type IN ('employment', 'contractor', 'nda', 'performance')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'expired')),
  created_date DATE DEFAULT CURRENT_DATE,
  signed_date DATE,
  expiry_date DATE,
  terms JSONB DEFAULT '{}'::jsonb,
  signatures JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_venue_id ON staff_onboarding_candidates(venue_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_status ON staff_onboarding_candidates(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_stage ON staff_onboarding_candidates(stage);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_venue_id ON staff_onboarding_templates(venue_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_template_id ON staff_onboarding_steps(template_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_activities_candidate_id ON staff_onboarding_activities(candidate_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_venue_id ON staff_messages(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_sender_id ON staff_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_priority ON staff_messages(priority);
CREATE INDEX IF NOT EXISTS idx_staff_messages_sent_at ON staff_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_staff_contracts_venue_id ON staff_contracts(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_contracts_employee_id ON staff_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_contracts_status ON staff_contracts(status);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE staff_onboarding_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_onboarding_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_contracts ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable all for authenticated users on onboarding_candidates"
  ON staff_onboarding_candidates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on onboarding_templates"
  ON staff_onboarding_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on onboarding_steps"
  ON staff_onboarding_steps FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on onboarding_activities"
  ON staff_onboarding_activities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on staff_messages"
  ON staff_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on staff_contracts"
  ON staff_contracts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- ESSENTIAL FUNCTIONS
-- =============================================================================

-- Function to calculate AI match score
CREATE OR REPLACE FUNCTION calculate_ai_match_score(
  p_application_id UUID,
  p_job_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  app_skills TEXT[];
  job_skills TEXT[];
  app_experience INTEGER;
  app_availability TEXT;
  skill_matches INTEGER;
  skill_score INTEGER;
  experience_score INTEGER;
  availability_score INTEGER;
  total_score INTEGER;
BEGIN
  -- Get application data
  SELECT skills, experience_years, availability
  INTO app_skills, app_experience, app_availability
  FROM staff_applications
  WHERE id = p_application_id;

  -- Get job requirements
  SELECT required_skills
  INTO job_skills
  FROM staff_jobs
  WHERE id = p_job_id;

  -- Calculate skill matches
  SELECT COALESCE(array_length(array(
    SELECT unnest(app_skills) INTERSECT SELECT unnest(job_skills)
  ), 1), 0) INTO skill_matches;

  -- Calculate scores
  skill_score := CASE 
    WHEN array_length(job_skills, 1) > 0 THEN
      LEAST((skill_matches::float / array_length(job_skills, 1) * 40)::INTEGER, 40)
    ELSE 20
  END;

  experience_score := LEAST((app_experience::float / 5 * 30)::INTEGER, 30);
  
  availability_score := CASE 
    WHEN app_availability = 'Immediate' THEN 20
    WHEN app_availability LIKE '%week%' THEN 15
    ELSE 10
  END;

  total_score := skill_score + experience_score + availability_score + 10;

  RETURN LEAST(total_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to get staff dashboard statistics
CREATE OR REPLACE FUNCTION get_staff_dashboard_stats(p_venue_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalJobs', COALESCE((SELECT COUNT(*) FROM staff_jobs WHERE venue_id = p_venue_id), 0),
    'activeJobs', COALESCE((SELECT COUNT(*) FROM staff_jobs WHERE venue_id = p_venue_id AND status = 'open'), 0),
    'totalApplications', COALESCE((
      SELECT COUNT(*) FROM staff_applications sa
      JOIN staff_jobs sj ON sa.job_id = sj.id
      WHERE sj.venue_id = p_venue_id
    ), 0),
    'pendingReviews', COALESCE((
      SELECT COUNT(*) FROM staff_applications sa
      JOIN staff_jobs sj ON sa.job_id = sj.id
      WHERE sj.venue_id = p_venue_id AND sa.status = 'pending'
    ), 0),
    'onboardingCandidates', COALESCE((
      SELECT COUNT(*) FROM staff_onboarding_candidates 
      WHERE venue_id = p_venue_id AND status = 'in_progress'
    ), 0),
    'totalStaff', COALESCE((
      SELECT COUNT(*) FROM venue_team_members 
      WHERE venue_id = p_venue_id AND status = 'active'
    ), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ FINAL FIXED STAFF TABLES CREATED SUCCESSFULLY!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Created tables with fresh policies:';
  RAISE NOTICE '   ✅ staff_onboarding_candidates';
  RAISE NOTICE '   ✅ staff_onboarding_templates';
  RAISE NOTICE '   ✅ staff_onboarding_steps';
  RAISE NOTICE '   ✅ staff_onboarding_activities';
  RAISE NOTICE '   ✅ staff_messages';
  RAISE NOTICE '   ✅ staff_contracts';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 No policy conflicts - ready for seed data!';
  RAISE NOTICE '=================================================';
END $$; 