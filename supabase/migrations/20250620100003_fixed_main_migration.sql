-- =============================================================================
-- FIXED COMPLETE STAFF MANAGEMENT & JOB BOARD SYSTEM MIGRATION
-- This version fixes the type casting issues in storage policies
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
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
  due_date_offset INTEGER, -- Days from start date
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
-- STORAGE BUCKETS FOR STAFF SYSTEM
-- =============================================================================

-- Create staff-specific storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('staff-resumes', 'staff-resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('staff-documents', 'staff-documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('staff-photos', 'staff-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES (FIXED TYPE CASTING)
-- =============================================================================

-- Staff Resumes Policies (Private)
CREATE POLICY "Venue owners can access resumes for their jobs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'staff-resumes' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM staff_applications sa
    JOIN staff_jobs sj ON sa.job_id = sj.id
    JOIN venue_profiles vp ON sj.venue_id = vp.id
    WHERE vp.user_id = auth.uid()
    AND sa.resume_url LIKE '%' || name
  )
);

CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'staff-resumes'
  AND auth.role() = 'authenticated'
);

-- Staff Documents Policies (Private) - FIXED TYPE CASTING
CREATE POLICY "Venue owners can access staff documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'staff-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT vp.user_id::text FROM venue_profiles vp WHERE vp.user_id = auth.uid()
  )
);

-- Staff Photos Policies (Public) - FIXED TYPE CASTING
CREATE POLICY "Staff photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'staff-photos');

CREATE POLICY "Users can upload their own staff photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'staff-photos'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Onboarding Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_venue_id ON staff_onboarding_candidates(venue_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_status ON staff_onboarding_candidates(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_stage ON staff_onboarding_candidates(stage);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_venue_id ON staff_onboarding_templates(venue_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_template_id ON staff_onboarding_steps(template_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_activities_candidate_id ON staff_onboarding_activities(candidate_id);

-- Communication Indexes
CREATE INDEX IF NOT EXISTS idx_staff_messages_venue_id ON staff_messages(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_sender_id ON staff_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_staff_messages_priority ON staff_messages(priority);
CREATE INDEX IF NOT EXISTS idx_staff_messages_sent_at ON staff_messages(sent_at);

-- Contract Indexes
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

-- Onboarding Candidates Policies
CREATE POLICY "Venue owners can manage their onboarding candidates"
  ON staff_onboarding_candidates FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

-- Onboarding Templates Policies
CREATE POLICY "Venue owners can manage their onboarding templates"
  ON staff_onboarding_templates FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

-- Onboarding Steps Policies
CREATE POLICY "Venue owners can manage onboarding steps"
  ON staff_onboarding_steps FOR ALL
  USING (
    template_id IN (
      SELECT id FROM staff_onboarding_templates 
      WHERE venue_id IN (
        SELECT id FROM venue_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Onboarding Activities Policies
CREATE POLICY "Venue owners can view onboarding activities"
  ON staff_onboarding_activities FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM staff_onboarding_candidates
      WHERE venue_id IN (
        SELECT id FROM venue_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create onboarding activities"
  ON staff_onboarding_activities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Staff Messages Policies
CREATE POLICY "Venue owners can manage their staff messages"
  ON staff_messages FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view messages sent to them"
  ON staff_messages FOR SELECT
  USING (auth.uid() = ANY(recipients));

-- Staff Contracts Policies
CREATE POLICY "Venue owners can manage their staff contracts"
  ON staff_contracts FOR ALL
  USING (
    venue_id IN (
      SELECT id FROM venue_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their own contracts"
  ON staff_contracts FOR SELECT
  USING (employee_id = auth.uid());

-- =============================================================================
-- FUNCTIONS FOR ENHANCED FUNCTIONALITY
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

  total_score := skill_score + experience_score + availability_score + 10; -- Base score

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
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger to update applications count on jobs
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE staff_jobs 
    SET applications_count = applications_count + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE staff_jobs 
    SET applications_count = applications_count - 1
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_job_applications_count'
  ) THEN
    CREATE TRIGGER trigger_update_job_applications_count
      AFTER INSERT OR DELETE ON staff_applications
      FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();
  END IF;
END $$;

-- Trigger to update timestamp on record changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_onboarding_candidates_updated_at'
  ) THEN
    CREATE TRIGGER trigger_onboarding_candidates_updated_at
      BEFORE UPDATE ON staff_onboarding_candidates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_onboarding_templates_updated_at'
  ) THEN
    CREATE TRIGGER trigger_onboarding_templates_updated_at
      BEFORE UPDATE ON staff_onboarding_templates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_contracts_updated_at'
  ) THEN
    CREATE TRIGGER trigger_contracts_updated_at
      BEFORE UPDATE ON staff_contracts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE '🚀 FIXED STAFF MANAGEMENT SYSTEM SETUP DONE!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '🆕 New Tables Created:';
  RAISE NOTICE '   ✅ staff_onboarding_candidates (candidate pipeline)';
  RAISE NOTICE '   ✅ staff_onboarding_templates (reusable workflows)';
  RAISE NOTICE '   ✅ staff_onboarding_steps (workflow steps)';
  RAISE NOTICE '   ✅ staff_onboarding_activities (progress tracking)';
  RAISE NOTICE '   ✅ staff_messages (communication system)';
  RAISE NOTICE '   ✅ staff_contracts (contract management)';
  RAISE NOTICE '';
  RAISE NOTICE '💾 Storage Buckets:';
  RAISE NOTICE '   ✅ staff-resumes (private, 10MB, documents)';
  RAISE NOTICE '   ✅ staff-documents (private, 10MB, documents)';
  RAISE NOTICE '   ✅ staff-photos (public, 5MB, images)';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Functions & Features:';
  RAISE NOTICE '   ✅ AI matching algorithm';
  RAISE NOTICE '   ✅ Dashboard statistics';
  RAISE NOTICE '   ✅ Automatic triggers';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '   ✅ Row Level Security policies';
  RAISE NOTICE '   ✅ Venue-based access control';
  RAISE NOTICE '   ✅ Performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for Frontend Integration!';
  RAISE NOTICE 'Type casting issues have been resolved.';
  RAISE NOTICE '=================================================';
END $$; 