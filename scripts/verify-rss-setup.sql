-- RSS Setup Verification Script
-- Run this to verify your RSS feed integration is properly configured

-- Check if cache table exists and has correct structure
SELECT 
  'Cache Table Status' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cache') 
    THEN '✅ Cache table exists'
    ELSE '❌ Cache table missing'
  END as status;

-- Check table structure
SELECT 
  'Table Structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cache' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN roles = '{authenticated}' THEN '✅ Authenticated users can read'
    WHEN roles = '{service_role}' THEN '✅ Service role can manage'
    ELSE '❓ Unknown policy'
  END as policy_status
FROM pg_policies 
WHERE tablename = 'cache';

-- Check if sample cache entries exist
SELECT 
  'Cache Entries' as check_type,
  COUNT(*) as entry_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Sample entries found'
    ELSE '⚠️ Missing sample entries'
  END as status
FROM cache 
WHERE key LIKE 'rss_news_%';

-- Check cache table permissions
SELECT 
  'Table Permissions' as check_type,
  grantee,
  privilege_type,
  CASE 
    WHEN privilege_type = 'SELECT' THEN '✅ Read permission'
    WHEN privilege_type = 'INSERT' THEN '✅ Write permission'
    WHEN privilege_type = 'UPDATE' THEN '✅ Update permission'
    WHEN privilege_type = 'DELETE' THEN '✅ Delete permission'
    ELSE '❓ Unknown permission'
  END as permission_status
FROM information_schema.table_privileges 
WHERE table_name = 'cache';

-- Test insert (will be rolled back)
BEGIN;
  INSERT INTO cache (key, data) VALUES ('test_rss_verification', '{"test": true}'::jsonb);
  SELECT 
    'Test Insert' as check_type,
    CASE 
      WHEN EXISTS (SELECT 1 FROM cache WHERE key = 'test_rss_verification') 
      THEN '✅ Insert works'
      ELSE '❌ Insert failed'
    END as status;
ROLLBACK;

-- Summary
SELECT 
  'RSS Setup Summary' as summary,
  'If all checks above show ✅, your RSS integration is ready!' as message; 