-- =============================================================================
-- INDIVIDUAL COLUMN FIX FOR STAFF TABLES
-- This fixes columns one by one to avoid conflicts
-- =============================================================================

-- Fix staff_jobs table columns individually
DO $$
BEGIN
  RAISE NOTICE 'Fixing staff_jobs table columns individually...';

  -- Check and add venue_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'venue_id') THEN
    ALTER TABLE staff_jobs ADD COLUMN venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added venue_id column';
  ELSE
    RAISE NOTICE '✅ venue_id already exists';
  END IF;

  -- Check and add job_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'job_type') THEN
    ALTER TABLE staff_jobs ADD COLUMN job_type TEXT DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary'));
    RAISE NOTICE '✅ Added job_type column';
  ELSE
    RAISE NOTICE '✅ job_type already exists';
  END IF;

  -- Check and add salary_range_min
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'salary_range_min') THEN
    ALTER TABLE staff_jobs ADD COLUMN salary_range_min DECIMAL(10,2);
    RAISE NOTICE '✅ Added salary_range_min column';
  ELSE
    RAISE NOTICE '✅ salary_range_min already exists';
  END IF;

  -- Check and add salary_range_max
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'salary_range_max') THEN
    ALTER TABLE staff_jobs ADD COLUMN salary_range_max DECIMAL(10,2);
    RAISE NOTICE '✅ Added salary_range_max column';
  ELSE
    RAISE NOTICE '✅ salary_range_max already exists';
  END IF;

  -- Check and add salary_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'salary_type') THEN
    ALTER TABLE staff_jobs ADD COLUMN salary_type TEXT DEFAULT 'annual' CHECK (salary_type IN ('hourly', 'daily', 'annual', 'project'));
    RAISE NOTICE '✅ Added salary_type column';
  ELSE
    RAISE NOTICE '✅ salary_type already exists';
  END IF;

  -- Check and add priority
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'priority') THEN
    ALTER TABLE staff_jobs ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    RAISE NOTICE '✅ Added priority column';
  ELSE
    RAISE NOTICE '✅ priority already exists';
  END IF;

  -- Check and add deadline
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'deadline') THEN
    ALTER TABLE staff_jobs ADD COLUMN deadline TIMESTAMPTZ;
    RAISE NOTICE '✅ Added deadline column';
  ELSE
    RAISE NOTICE '✅ deadline already exists';
  END IF;

  -- Check and add benefits (individual check)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'benefits') THEN
    ALTER TABLE staff_jobs ADD COLUMN benefits TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added benefits column';
  ELSE
    RAISE NOTICE '✅ benefits already exists';
  END IF;

  -- Check and add required_skills (individual check)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'required_skills') THEN
    ALTER TABLE staff_jobs ADD COLUMN required_skills TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added required_skills column';
  ELSE
    RAISE NOTICE '✅ required_skills already exists';
  END IF;

  -- Check and add preferred_skills (individual check)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'preferred_skills') THEN
    ALTER TABLE staff_jobs ADD COLUMN preferred_skills TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added preferred_skills column';
  ELSE
    RAISE NOTICE '✅ preferred_skills already exists';
  END IF;

  -- Check and add certifications_required (individual check)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'certifications_required') THEN
    ALTER TABLE staff_jobs ADD COLUMN certifications_required TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added certifications_required column';
  ELSE
    RAISE NOTICE '✅ certifications_required already exists';
  END IF;

  -- Check and add applications_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'applications_count') THEN
    ALTER TABLE staff_jobs ADD COLUMN applications_count INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added applications_count column';
  ELSE
    RAISE NOTICE '✅ applications_count already exists';
  END IF;

END $$;

-- Fix staff_applications table columns individually
DO $$
BEGIN
  RAISE NOTICE 'Fixing staff_applications table columns individually...';

  -- Check and add applicant_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'applicant_name') THEN
    ALTER TABLE staff_applications ADD COLUMN applicant_name TEXT;
    RAISE NOTICE '✅ Added applicant_name column';
  ELSE
    RAISE NOTICE '✅ applicant_name already exists';
  END IF;

  -- Check and add applicant_email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'applicant_email') THEN
    ALTER TABLE staff_applications ADD COLUMN applicant_email TEXT;
    RAISE NOTICE '✅ Added applicant_email column';
  ELSE
    RAISE NOTICE '✅ applicant_email already exists';
  END IF;

  -- Check and add applicant_phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'applicant_phone') THEN
    ALTER TABLE staff_applications ADD COLUMN applicant_phone TEXT;
    RAISE NOTICE '✅ Added applicant_phone column';
  ELSE
    RAISE NOTICE '✅ applicant_phone already exists';
  END IF;

  -- Check and add resume_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'resume_url') THEN
    ALTER TABLE staff_applications ADD COLUMN resume_url TEXT;
    RAISE NOTICE '✅ Added resume_url column';
  ELSE
    RAISE NOTICE '✅ resume_url already exists';
  END IF;

  -- Check and add portfolio_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'portfolio_url') THEN
    ALTER TABLE staff_applications ADD COLUMN portfolio_url TEXT;
    RAISE NOTICE '✅ Added portfolio_url column';
  ELSE
    RAISE NOTICE '✅ portfolio_url already exists';
  END IF;

  -- Check and add experience_years
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'experience_years') THEN
    ALTER TABLE staff_applications ADD COLUMN experience_years INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added experience_years column';
  ELSE
    RAISE NOTICE '✅ experience_years already exists';
  END IF;

  -- Check and add skills
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'skills') THEN
    ALTER TABLE staff_applications ADD COLUMN skills TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added skills column';
  ELSE
    RAISE NOTICE '✅ skills already exists';
  END IF;

  -- Check and add availability
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'availability') THEN
    ALTER TABLE staff_applications ADD COLUMN availability TEXT DEFAULT 'Immediate';
    RAISE NOTICE '✅ Added availability column';
  ELSE
    RAISE NOTICE '✅ availability already exists';
  END IF;

  -- Check and add rating
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'rating') THEN
    ALTER TABLE staff_applications ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    RAISE NOTICE '✅ Added rating column';
  ELSE
    RAISE NOTICE '✅ rating already exists';
  END IF;

  -- Check and add notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'notes') THEN
    ALTER TABLE staff_applications ADD COLUMN notes TEXT;
    RAISE NOTICE '✅ Added notes column';
  ELSE
    RAISE NOTICE '✅ notes already exists';
  END IF;

  -- Check and add ai_match_score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'ai_match_score') THEN
    ALTER TABLE staff_applications ADD COLUMN ai_match_score INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added ai_match_score column';
  ELSE
    RAISE NOTICE '✅ ai_match_score already exists';
  END IF;

  -- Check and add interview_scheduled
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'interview_scheduled') THEN
    ALTER TABLE staff_applications ADD COLUMN interview_scheduled TIMESTAMPTZ;
    RAISE NOTICE '✅ Added interview_scheduled column';
  ELSE
    RAISE NOTICE '✅ interview_scheduled already exists';
  END IF;

  -- Check and add hired_as
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'hired_as') THEN
    ALTER TABLE staff_applications ADD COLUMN hired_as TEXT CHECK (hired_as IN ('staff', 'crew', 'contractor'));
    RAISE NOTICE '✅ Added hired_as column';
  ELSE
    RAISE NOTICE '✅ hired_as already exists';
  END IF;

  -- Check and add hired_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'hired_date') THEN
    ALTER TABLE staff_applications ADD COLUMN hired_date TIMESTAMPTZ;
    RAISE NOTICE '✅ Added hired_date column';
  ELSE
    RAISE NOTICE '✅ hired_date already exists';
  END IF;

  -- Check and add final_rate
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'final_rate') THEN
    ALTER TABLE staff_applications ADD COLUMN final_rate DECIMAL(10,2);
    RAISE NOTICE '✅ Added final_rate column';
  ELSE
    RAISE NOTICE '✅ final_rate already exists';
  END IF;

END $$;

-- Final verification
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ INDIVIDUAL COLUMN FIX COMPLETE!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Verified all required columns for:';
  RAISE NOTICE '  - staff_jobs table';
  RAISE NOTICE '  - staff_applications table';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 You can now run the seed data script safely!';
  RAISE NOTICE '=================================================';
END $$; 