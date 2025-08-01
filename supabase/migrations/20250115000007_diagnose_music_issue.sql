-- =============================================
-- Diagnose Music Function Issue
-- =============================================
-- This migration will help us understand what's causing the function error

-- Start transaction
BEGIN;

-- Check if the function exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE p.proname = 'get_music_with_stats' 
      AND n.nspname = 'public'
    ) 
    THEN 'Function EXISTS' 
    ELSE 'Function DOES NOT EXIST' 
  END as function_status;

-- Check if there are any views that reference this function
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE definition LIKE '%get_music_with_stats%';

-- Check if there are any triggers that reference this function
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgfoid::regproc::text LIKE '%get_music_with_stats%';

-- Check if there are any other functions that call this function
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE pg_get_functiondef(p.oid) LIKE '%get_music_with_stats%'
AND p.proname != 'get_music_with_stats'
AND n.nspname = 'public';

-- Check for any materialized views that might reference the function
SELECT 
  schemaname,
  matviewname,
  definition
FROM pg_matviews 
WHERE definition LIKE '%get_music_with_stats%';

-- List all functions in the public schema to see what's there
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'
AND proname LIKE '%music%'
ORDER BY proname;

-- Commit transaction
COMMIT; 