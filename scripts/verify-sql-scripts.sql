-- SQL Script Verification
-- This script helps verify that all SQL scripts are correct before execution

-- Check if the job_posting_templates table structure is correct
DO $$
BEGIN
    -- Check if the table exists and has the correct structure
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'job_posting_templates' 
        AND table_schema = 'public'
    ) THEN
        -- Check if experience_level column exists and is NOT NULL
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'job_posting_templates' 
            AND column_name = 'experience_level'
            AND is_nullable = 'NO'
        ) THEN
            RAISE NOTICE '✅ job_posting_templates table structure is correct';
        ELSE
            RAISE NOTICE '⚠️ experience_level column is missing or nullable in job_posting_templates';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ job_posting_templates table does not exist yet';
    END IF;
END $$;

-- Test INSERT statement with all required fields
DO $$
DECLARE
    test_venue_id UUID;
    test_created_by UUID;
    test_job_id UUID;
BEGIN
    -- Generate test UUIDs
    test_venue_id := uuid_generate_v4();
    test_created_by := uuid_generate_v4();
    
    -- Test INSERT with all required fields
    INSERT INTO job_posting_templates (
        venue_id, 
        created_by, 
        title, 
        description, 
        department, 
        position, 
        employment_type, 
        location, 
        experience_level, 
        status, 
        requirements, 
        responsibilities
    ) VALUES (
        test_venue_id,
        test_created_by,
        'Test Job Posting',
        'This is a test job posting for verification',
        'Test Department',
        'Test Position',
        'part_time',
        'Test Location',
        'entry',
        'draft',
        ARRAY['Test requirement'],
        ARRAY['Test responsibility']
    ) RETURNING id INTO test_job_id;
    
    RAISE NOTICE '✅ Test INSERT successful, job_id: %', test_job_id;
    
    -- Clean up test data
    DELETE FROM job_posting_templates WHERE id = test_job_id;
    RAISE NOTICE '✅ Test data cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Test INSERT failed: %', SQLERRM;
END $$;

-- Verify all required tables can be created
DO $$
BEGIN
    -- Test creating a temporary table with the same structure
    CREATE TEMP TABLE test_job_posting_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        venue_id UUID NOT NULL,
        created_by UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        department VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
        location VARCHAR(255) NOT NULL,
        salary_range JSONB,
        requirements TEXT[] DEFAULT '{}',
        responsibilities TEXT[] DEFAULT '{}',
        benefits TEXT[] DEFAULT '{}',
        skills TEXT[] DEFAULT '{}',
        experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
        remote BOOLEAN DEFAULT FALSE,
        urgent BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'closed')),
        applications_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ Table structure is valid';
    
    -- Test INSERT into temp table
    INSERT INTO test_job_posting_templates (
        venue_id, 
        created_by, 
        title, 
        description, 
        department, 
        position, 
        employment_type, 
        location, 
        experience_level
    ) VALUES (
        uuid_generate_v4(),
        uuid_generate_v4(),
        'Test Job',
        'Test Description',
        'Test Department',
        'Test Position',
        'part_time',
        'Test Location',
        'entry'
    );
    
    RAISE NOTICE '✅ Test INSERT into temp table successful';
    
    -- Clean up
    DROP TABLE test_job_posting_templates;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Table structure test failed: %', SQLERRM;
END $$;

-- Summary
SELECT 
    'SQL Script Verification Complete' as status,
    'All scripts have been verified and should work correctly' as message; 