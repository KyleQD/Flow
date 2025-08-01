-- =============================================
-- Debug Function Issue
-- =============================================
-- This script will help us understand why get_music_with_stats() doesn't exist

-- Start transaction
BEGIN;

-- Check if the function exists before we start
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE p.proname = 'get_music_with_stats' 
      AND n.nspname = 'public'
    ) 
    THEN 'Function EXISTS before migration' 
    ELSE 'Function DOES NOT EXIST before migration' 
  END as function_status_before;

-- Check if there are any views that reference this function
SELECT 
  'Views referencing get_music_with_stats:' as info,
  schemaname,
  viewname
FROM pg_views 
WHERE definition LIKE '%get_music_with_stats%';

-- Check if there are any triggers that reference this function
SELECT 
  'Triggers referencing get_music_with_stats:' as info,
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgfoid::regproc::text LIKE '%get_music_with_stats%';

-- Check if there are any other functions that call this function
SELECT 
  'Functions calling get_music_with_stats:' as info,
  p.proname as function_name
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE pg_get_functiondef(p.oid) LIKE '%get_music_with_stats%'
AND p.proname != 'get_music_with_stats'
AND n.nspname = 'public';

-- Check for any materialized views that might reference the function
SELECT 
  'Materialized views referencing get_music_with_stats:' as info,
  schemaname,
  matviewname
FROM pg_matviews 
WHERE definition LIKE '%get_music_with_stats%';

-- List all functions in the public schema that contain 'music' in the name
SELECT 
  'All music-related functions:' as info,
  proname as function_name
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'
AND proname LIKE '%music%'
ORDER BY proname;

-- Check if there are any existing views that might be causing issues
SELECT 
  'All views in public schema:' as info,
  schemaname,
  viewname
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Check if the function was created successfully
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE p.proname = 'get_music_with_stats' 
      AND n.nspname = 'public'
    ) 
    THEN 'SUCCESS: Function get_music_with_stats exists' 
    ELSE 'ERROR: Function get_music_with_stats does not exist' 
  END as function_status_after;

-- Commit transaction
COMMIT; 