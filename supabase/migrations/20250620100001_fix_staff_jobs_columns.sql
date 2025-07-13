-- =============================================================================
-- FIX STAFF JOBS COLUMNS MIGRATION
-- This ensures all required columns exist in staff_jobs table
-- Run this if you get "column does not exist" errors
-- =============================================================================

-- First, let's check what we're working with
DO $$
BEGIN
  RAISE NOTICE 'Checking current staff_jobs table structure...';
END $$;

-- Add missing columns one by one with explicit checks
DO $$
BEGIN
  -- Add venue_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'venue_id') THEN
    ALTER TABLE staff_jobs ADD COLUMN venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added venue_id column';
  ELSE
    RAISE NOTICE '✅ venue_id column already exists';
  END IF;

  -- Add job_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'job_type') THEN
    ALTER TABLE staff_jobs ADD COLUMN job_type TEXT DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary'));
    RAISE NOTICE '✅ Added job_type column';
  ELSE
    RAISE NOTICE '✅ job_type column already exists';
  END IF;

  -- Add salary columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'salary_range_min') THEN
    ALTER TABLE staff_jobs ADD COLUMN salary_range_min DECIMAL(10,2);
    ALTER TABLE staff_jobs ADD COLUMN salary_range_max DECIMAL(10,2);
    ALTER TABLE staff_jobs ADD COLUMN salary_type TEXT DEFAULT 'annual' CHECK (salary_type IN ('hourly', 'daily', 'annual', 'project'));
    RAISE NOTICE '✅ Added salary range columns';
  ELSE
    RAISE NOTICE '✅ salary range columns already exist';
  END IF;

  -- Add priority if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'priority') THEN
    ALTER TABLE staff_jobs ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    RAISE NOTICE '✅ Added priority column';
  ELSE
    RAISE NOTICE '✅ priority column already exists';
  END IF;

  -- Add deadline if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'deadline') THEN
    ALTER TABLE staff_jobs ADD COLUMN deadline TIMESTAMPTZ;
    RAISE NOTICE '✅ Added deadline column';
  ELSE
    RAISE NOTICE '✅ deadline column already exists';
  END IF;

  -- Add skills and benefits arrays if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'required_skills') THEN
    ALTER TABLE staff_jobs ADD COLUMN benefits TEXT[] DEFAULT '{}';
    ALTER TABLE staff_jobs ADD COLUMN required_skills TEXT[] DEFAULT '{}';
    ALTER TABLE staff_jobs ADD COLUMN preferred_skills TEXT[] DEFAULT '{}';
    ALTER TABLE staff_jobs ADD COLUMN certifications_required TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added skills and benefits columns';
  ELSE
    RAISE NOTICE '✅ skills and benefits columns already exist';
  END IF;

  -- Add applications_count if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'applications_count') THEN
    ALTER TABLE staff_jobs ADD COLUMN applications_count INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added applications_count column';
  ELSE
    RAISE NOTICE '✅ applications_count column already exists';
  END IF;

END $$;

-- Also fix staff_applications table
DO $$
BEGIN
  -- Add applicant info columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'applicant_name') THEN
    ALTER TABLE staff_applications ADD COLUMN applicant_name TEXT;
    ALTER TABLE staff_applications ADD COLUMN applicant_email TEXT;
    ALTER TABLE staff_applications ADD COLUMN applicant_phone TEXT;
    RAISE NOTICE '✅ Added applicant info columns to staff_applications';
  ELSE
    RAISE NOTICE '✅ applicant info columns already exist in staff_applications';
  END IF;

  -- Add resume and portfolio columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'resume_url') THEN
    ALTER TABLE staff_applications ADD COLUMN resume_url TEXT;
    ALTER TABLE staff_applications ADD COLUMN portfolio_url TEXT;
    RAISE NOTICE '✅ Added resume/portfolio columns to staff_applications';
  ELSE
    RAISE NOTICE '✅ resume/portfolio columns already exist in staff_applications';
  END IF;

  -- Add experience and skills columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'experience_years') THEN
    ALTER TABLE staff_applications ADD COLUMN experience_years INTEGER DEFAULT 0;
    ALTER TABLE staff_applications ADD COLUMN skills TEXT[] DEFAULT '{}';
    ALTER TABLE staff_applications ADD COLUMN availability TEXT DEFAULT 'Immediate';
    RAISE NOTICE '✅ Added experience/skills columns to staff_applications';
  ELSE
    RAISE NOTICE '✅ experience/skills columns already exist in staff_applications';
  END IF;

  -- Add rating and AI score columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'rating') THEN
    ALTER TABLE staff_applications ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
    ALTER TABLE staff_applications ADD COLUMN notes TEXT;
    ALTER TABLE staff_applications ADD COLUMN ai_match_score INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added rating/AI score columns to staff_applications';
  ELSE
    RAISE NOTICE '✅ rating/AI score columns already exist in staff_applications';
  END IF;

  -- Add hiring tracking columns if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff_applications' AND column_name = 'interview_scheduled') THEN
    ALTER TABLE staff_applications ADD COLUMN interview_scheduled TIMESTAMPTZ;
    ALTER TABLE staff_applications ADD COLUMN hired_as TEXT CHECK (hired_as IN ('staff', 'crew', 'contractor'));
    ALTER TABLE staff_applications ADD COLUMN hired_date TIMESTAMPTZ;
    ALTER TABLE staff_applications ADD COLUMN final_rate DECIMAL(10,2);
    RAISE NOTICE '✅ Added hiring tracking columns to staff_applications';
  ELSE
    RAISE NOTICE '✅ hiring tracking columns already exist in staff_applications';
  END IF;

END $$;

-- Show final table structure
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ STAFF JOBS TABLE COLUMNS FIX COMPLETE!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Now you can run the seed data script safely.';
  RAISE NOTICE 'All required columns have been added to:';
  RAISE NOTICE '  - staff_jobs table';
  RAISE NOTICE '  - staff_applications table';
  RAISE NOTICE '=================================================';
END $$; 