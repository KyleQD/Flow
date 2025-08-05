-- Test if event pages tables exist
DO $$
BEGIN
    -- Check if event_attendance table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_attendance') THEN
        RAISE NOTICE 'event_attendance table exists';
    ELSE
        RAISE NOTICE 'event_attendance table does not exist';
    END IF;
    
    -- Check if event_posts table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_posts') THEN
        RAISE NOTICE 'event_posts table exists';
    ELSE
        RAISE NOTICE 'event_posts table does not exist';
    END IF;
    
    -- Check if event_page_settings table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_page_settings') THEN
        RAISE NOTICE 'event_page_settings table exists';
    ELSE
        RAISE NOTICE 'event_page_settings table does not exist';
    END IF;
END $$;
