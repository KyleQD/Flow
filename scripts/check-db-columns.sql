-- Check which columns exist in the profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;

-- Check specifically for the columns we need
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'custom_url') 
    THEN '✅ custom_url exists' 
    ELSE '❌ custom_url missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') 
    THEN '✅ phone exists' 
    ELSE '❌ phone missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') 
    THEN '✅ location exists' 
    ELSE '❌ location missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instagram') 
    THEN '✅ instagram exists' 
    ELSE '❌ instagram missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter') 
    THEN '✅ twitter exists' 
    ELSE '❌ twitter missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_email') 
    THEN '✅ show_email exists' 
    ELSE '❌ show_email missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_phone') 
    THEN '✅ show_phone exists' 
    ELSE '❌ show_phone missing' 
  END,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_location') 
    THEN '✅ show_location exists' 
    ELSE '❌ show_location missing' 
  END; 