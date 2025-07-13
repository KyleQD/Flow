-- =============================================================================
-- STAFF TABLES DIAGNOSTIC SCRIPT
-- Run this to see what tables and columns currently exist
-- =============================================================================

-- Check if staff_jobs table exists and show its structure
DO $$
DECLARE
  table_exists BOOLEAN;
  col_record RECORD;
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE '🔍 STAFF TABLES DIAGNOSTIC REPORT';
  RAISE NOTICE '=================================================';
  
  -- Check if staff_jobs table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'staff_jobs'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '✅ staff_jobs table EXISTS';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Current columns in staff_jobs:';
    
    FOR col_record IN 
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'staff_jobs'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '   - % (% %)', 
        col_record.column_name, 
        col_record.data_type,
        CASE WHEN col_record.is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULLABLE' END;
    END LOOP;
  ELSE
    RAISE NOTICE '❌ staff_jobs table DOES NOT EXIST';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check if staff_applications table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'staff_applications'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '✅ staff_applications table EXISTS';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Current columns in staff_applications:';
    
    FOR col_record IN 
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'staff_applications'
      ORDER BY ordinal_position
    LOOP
      RAISE NOTICE '   - % (% %)', 
        col_record.column_name, 
        col_record.data_type,
        CASE WHEN col_record.is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULLABLE' END;
    END LOOP;
  ELSE
    RAISE NOTICE '❌ staff_applications table DOES NOT EXIST';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check for venue_profiles table (dependency)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'venue_profiles'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE '✅ venue_profiles table EXISTS (required dependency)';
  ELSE
    RAISE NOTICE '❌ venue_profiles table DOES NOT EXIST (required dependency)';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '💡 NEXT STEPS:';
  RAISE NOTICE '=================================================';
  
  -- Provide recommendations
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'staff_jobs' AND column_name = 'job_type'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE NOTICE '1. ⚠️  Missing enhanced columns detected!';
    RAISE NOTICE '   Run: 20250620100001_fix_staff_jobs_columns.sql';
    RAISE NOTICE '';
    RAISE NOTICE '2. Then run the seed data script';
  ELSE
    RAISE NOTICE '1. ✅ Enhanced columns exist - you can run seed data';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🔧 If you need to start fresh:';
  RAISE NOTICE '   1. Run the main migration first';
  RAISE NOTICE '   2. Run the fix script if needed';
  RAISE NOTICE '   3. Run the seed data last';
  RAISE NOTICE '=================================================';

END $$; 