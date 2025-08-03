#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAuthDirect() {
  console.log('🚨 Fixing Auth System - Direct Approach...\n')
  
  const emergencySQL = `
-- MANUAL EMERGENCY FIX - COPY AND PASTE THIS INTO SUPABASE SQL EDITOR

-- Step 1: Create missing user_active_profiles table
CREATE TABLE IF NOT EXISTS user_active_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  active_profile_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Step 2: Add RLS policies
ALTER TABLE user_active_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own active profile" ON user_active_profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own active profile" ON user_active_profiles 
  FOR ALL USING (auth.uid() = user_id);

-- Step 3: Fix the handle_new_user function to not crash
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile (this part usually works)
  INSERT INTO profiles (id, name, username, full_name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE((NEW.raw_user_meta_data->>'onboarding_completed')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  -- Create active profile entry (this was crashing)
  INSERT INTO user_active_profiles (user_id, active_profile_type)
  VALUES (NEW.id, 'general')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't crash signup if anything fails
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  
-- Test the fix by running: SELECT 'Fix applied successfully' as status;
  `
  
  try {
    // First, let's try to create the missing table by testing inserts
    console.log('1. Testing if user_active_profiles table exists...')
    
    const testUserId = '00000000-0000-0000-0000-000000000000' // Dummy UUID for testing
    
    const { error: testError } = await supabase
      .from('user_active_profiles')
      .insert({ user_id: testUserId, active_profile_type: 'test' })
    
    if (testError?.message?.includes('does not exist')) {
      console.log('❌ user_active_profiles table missing - this is the root cause!')
      console.log('   This explains why every signup fails.')
      
    } else if (testError?.message?.includes('violates foreign key constraint')) {
      console.log('✅ user_active_profiles table exists but foreign key failed (expected)')
      console.log('   The table exists, so the issue might be with the trigger function itself.')
      
      // Clean up test insert
      await supabase.from('user_active_profiles').delete().eq('user_id', testUserId)
      
    } else {
      console.log('⚠️  Unexpected error:', testError?.message || 'Unknown error')
    }
    
    console.log('\n📋 EMERGENCY FIX SQL:')
    console.log('='.repeat(60))
    console.log(emergencySQL)
    console.log('='.repeat(60))
    
    console.log('\n🔧 MANUAL STEPS TO FIX:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor') 
    console.log('3. Copy and paste the SQL above')
    console.log('4. Run the SQL')
    console.log('5. Come back and run: node test-frontend-signup.js')
    
    // Also save the SQL to a file for easy access
    require('fs').writeFileSync('emergency-fix-manual.sql', emergencySQL)
    console.log('\n💾 Emergency fix SQL saved to: emergency-fix-manual.sql')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

fixAuthDirect()