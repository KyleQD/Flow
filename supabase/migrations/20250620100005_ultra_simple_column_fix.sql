-- =============================================================================
-- ULTRA SIMPLE COLUMN FIX - NO TYPE CASTING ISSUES
-- Run this FIRST to add missing columns to existing tables
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ADD MISSING COLUMNS TO STAFF_JOBS TABLE
-- =============================================================================

DO $$
BEGIN
  -- Add venue_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'venue_id') THEN
    ALTER TABLE staff_jobs ADD COLUMN venue_id UUID;
    RAISE NOTICE '✅ Added venue_id column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ venue_id column already exists in staff_jobs';
  END IF;

  -- Add job_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'job_type') THEN
    ALTER TABLE staff_jobs ADD COLUMN job_type TEXT DEFAULT 'full_time';
    RAISE NOTICE '✅ Added job_type column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ job_type column already exists in staff_jobs';
  END IF;

  -- Add salary_min column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'salary_min') THEN
    ALTER TABLE staff_jobs ADD COLUMN salary_min DECIMAL(10,2);
    RAISE NOTICE '✅ Added salary_min column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ salary_min column already exists in staff_jobs';
  END IF;

  -- Add salary_max column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'salary_max') THEN
    ALTER TABLE staff_jobs ADD COLUMN salary_max DECIMAL(10,2);
    RAISE NOTICE '✅ Added salary_max column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ salary_max column already exists in staff_jobs';
  END IF;

  -- Add priority column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'priority') THEN
    ALTER TABLE staff_jobs ADD COLUMN priority TEXT DEFAULT 'normal';
    RAISE NOTICE '✅ Added priority column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ priority column already exists in staff_jobs';
  END IF;

  -- Add required_skills column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'required_skills') THEN
    ALTER TABLE staff_jobs ADD COLUMN required_skills TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added required_skills column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ required_skills column already exists in staff_jobs';
  END IF;

  -- Add benefits column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'benefits') THEN
    ALTER TABLE staff_jobs ADD COLUMN benefits TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added benefits column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ benefits column already exists in staff_jobs';
  END IF;

  -- Add application_deadline column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'application_deadline') THEN
    ALTER TABLE staff_jobs ADD COLUMN application_deadline DATE;
    RAISE NOTICE '✅ Added application_deadline column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ application_deadline column already exists in staff_jobs';
  END IF;

  -- Add shift_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'shift_type') THEN
    ALTER TABLE staff_jobs ADD COLUMN shift_type TEXT DEFAULT 'flexible';
    RAISE NOTICE '✅ Added shift_type column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ shift_type column already exists in staff_jobs';
  END IF;

  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'is_featured') THEN
    ALTER TABLE staff_jobs ADD COLUMN is_featured BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Added is_featured column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ is_featured column already exists in staff_jobs';
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_jobs' AND column_name = 'tags') THEN
    ALTER TABLE staff_jobs ADD COLUMN tags TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added tags column to staff_jobs';
  ELSE
    RAISE NOTICE '⚠️ tags column already exists in staff_jobs';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎯 STAFF_JOBS TABLE UPDATED SUCCESSFULLY!';
END $$;

-- =============================================================================
-- ADD MISSING COLUMNS TO STAFF_APPLICATIONS TABLE
-- =============================================================================

DO $$
BEGIN
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'full_name') THEN
    ALTER TABLE staff_applications ADD COLUMN full_name TEXT;
    RAISE NOTICE '✅ Added full_name column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ full_name column already exists in staff_applications';
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'email') THEN
    ALTER TABLE staff_applications ADD COLUMN email TEXT;
    RAISE NOTICE '✅ Added email column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ email column already exists in staff_applications';
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'phone') THEN
    ALTER TABLE staff_applications ADD COLUMN phone TEXT;
    RAISE NOTICE '✅ Added phone column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ phone column already exists in staff_applications';
  END IF;

  -- Add experience_years column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'experience_years') THEN
    ALTER TABLE staff_applications ADD COLUMN experience_years INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added experience_years column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ experience_years column already exists in staff_applications';
  END IF;

  -- Add skills column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'skills') THEN
    ALTER TABLE staff_applications ADD COLUMN skills TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Added skills column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ skills column already exists in staff_applications';
  END IF;

  -- Add availability column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'availability') THEN
    ALTER TABLE staff_applications ADD COLUMN availability TEXT;
    RAISE NOTICE '✅ Added availability column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ availability column already exists in staff_applications';
  END IF;

  -- Add ai_match_score column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'ai_match_score') THEN
    ALTER TABLE staff_applications ADD COLUMN ai_match_score INTEGER DEFAULT 0;
    RAISE NOTICE '✅ Added ai_match_score column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ ai_match_score column already exists in staff_applications';
  END IF;

  -- Add rating column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'rating') THEN
    ALTER TABLE staff_applications ADD COLUMN rating INTEGER;
    RAISE NOTICE '✅ Added rating column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ rating column already exists in staff_applications';
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'notes') THEN
    ALTER TABLE staff_applications ADD COLUMN notes TEXT;
    RAISE NOTICE '✅ Added notes column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ notes column already exists in staff_applications';
  END IF;

  -- Add interview_scheduled column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'interview_scheduled') THEN
    ALTER TABLE staff_applications ADD COLUMN interview_scheduled TIMESTAMPTZ;
    RAISE NOTICE '✅ Added interview_scheduled column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ interview_scheduled column already exists in staff_applications';
  END IF;

  -- Add hired_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'hired_date') THEN
    ALTER TABLE staff_applications ADD COLUMN hired_date DATE;
    RAISE NOTICE '✅ Added hired_date column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ hired_date column already exists in staff_applications';
  END IF;

  -- Add resume_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'resume_url') THEN
    ALTER TABLE staff_applications ADD COLUMN resume_url TEXT;
    RAISE NOTICE '✅ Added resume_url column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ resume_url column already exists in staff_applications';
  END IF;

  -- Add cover_letter column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'cover_letter') THEN
    ALTER TABLE staff_applications ADD COLUMN cover_letter TEXT;
    RAISE NOTICE '✅ Added cover_letter column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ cover_letter column already exists in staff_applications';
  END IF;

  -- Add stage column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_applications' AND column_name = 'stage') THEN
    ALTER TABLE staff_applications ADD COLUMN stage TEXT DEFAULT 'applied';
    RAISE NOTICE '✅ Added stage column to staff_applications';
  ELSE
    RAISE NOTICE '⚠️ stage column already exists in staff_applications';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎯 STAFF_APPLICATIONS TABLE UPDATED SUCCESSFULLY!';
END $$;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ ULTRA SIMPLE COLUMN FIX COMPLETED!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Enhanced existing tables:';
  RAISE NOTICE '   ✅ staff_jobs (added job_type, salary, priority, etc.)';
  RAISE NOTICE '   ✅ staff_applications (added applicant details, AI scores, etc.)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for Step 2: Create new tables';
  RAISE NOTICE '=================================================';
END $$; 