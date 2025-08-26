#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDatabaseStructure() {
  console.log('🔍 Checking Database Structure...\n')
  
  try {
    // Check 1: Check if profiles table structure is correct
    console.log('1. Checking profiles table structure...')
    const { data: profilesStructure, error: profilesStructureError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })
    
    if (profilesStructureError) {
      console.log('❌ Could not check profiles structure:', profilesStructureError.message)
      console.log('   Trying alternative method...')
      
      // Try to get structure by attempting to insert
      const { data: testInsert, error: testInsertError } = await supabase
        .from('profiles')
        .insert([{
          id: 'test-structure-check',
          name: 'Test',
          username: 'test',
          full_name: 'Test User',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
      
      if (testInsertError) {
        console.log('❌ Profiles table structure issue:', testInsertError.message)
        console.log('   This suggests the table structure is incorrect')
      } else {
        console.log('✅ Profiles table structure appears correct')
        // Clean up test record
        await supabase.from('profiles').delete().eq('id', 'test-structure-check')
      }
    } else {
      console.log('✅ Profiles table structure:')
      profilesStructure.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
      })
    }

    // Check 2: Check if user_active_profiles table structure is correct
    console.log('\n2. Checking user_active_profiles table structure...')
    const { data: activeProfilesStructure, error: activeProfilesStructureError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'user_active_profiles' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })
    
    if (activeProfilesStructureError) {
      console.log('❌ Could not check user_active_profiles structure:', activeProfilesStructureError.message)
      console.log('   Trying alternative method...')
      
      // Try to get structure by attempting to insert
      const { data: testInsert, error: testInsertError } = await supabase
        .from('user_active_profiles')
        .insert([{
          user_id: 'test-structure-check',
          active_profile_type: 'general',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
      
      if (testInsertError) {
        console.log('❌ user_active_profiles table structure issue:', testInsertError.message)
        console.log('   This suggests the table structure is incorrect')
      } else {
        console.log('✅ user_active_profiles table structure appears correct')
        // Clean up test record
        await supabase.from('user_active_profiles').delete().eq('user_id', 'test-structure-check')
      }
    } else {
      console.log('✅ user_active_profiles table structure:')
      activeProfilesStructure.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
      })
    }

    // Check 3: Check if the trigger function exists and is working
    console.log('\n3. Checking trigger function...')
    const { data: triggerCheck, error: triggerCheckError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT trigger_name, event_manipulation, action_statement
          FROM information_schema.triggers 
          WHERE trigger_name = 'on_auth_user_created';
        `
      })
    
    if (triggerCheckError) {
      console.log('❌ Could not check trigger:', triggerCheckError.message)
    } else if (triggerCheck && triggerCheck.length > 0) {
      console.log('✅ Trigger exists:', triggerCheck[0].trigger_name)
      console.log('   Event:', triggerCheck[0].event_manipulation)
    } else {
      console.log('❌ Trigger does not exist!')
    }

    // Check 4: Check if the function exists
    console.log('\n4. Checking handle_new_user function...')
    const { data: functionCheck, error: functionCheckError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT routine_name, routine_type
          FROM information_schema.routines 
          WHERE routine_name = 'handle_new_user';
        `
      })
    
    if (functionCheckError) {
      console.log('❌ Could not check function:', functionCheckError.message)
    } else if (functionCheck && functionCheck.length > 0) {
      console.log('✅ Function exists:', functionCheck[0].routine_name)
    } else {
      console.log('❌ Function does not exist!')
    }

    // Check 5: Test the trigger manually
    console.log('\n5. Testing trigger manually...')
    try {
      const { data: triggerTest, error: triggerTestError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            -- Create a test user to see if trigger works
            INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
            VALUES ('trigger-test@example.com', crypt('password', gen_salt('bf')), now(), now(), now())
            RETURNING id;
          `
        })
      
      if (triggerTestError) {
        console.log('❌ Trigger test failed:', triggerTestError.message)
      } else {
        console.log('✅ Trigger test succeeded')
        console.log('   Test user created:', triggerTest)
        
        // Check if profile was created
        const { data: profileCheck, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'trigger-test@example.com')
          .single()
        
        if (profileCheckError) {
          console.log('❌ Profile not created by trigger:', profileCheckError.message)
        } else {
          console.log('✅ Profile created by trigger:', profileCheck.id)
        }
      }
    } catch (err) {
      console.log('❌ Manual trigger test failed:', err.message)
    }

    console.log('\n📋 STRUCTURE ANALYSIS:')
    console.log('━'.repeat(50))
    console.log('If you see structure issues above, you may need to:')
    console.log('1. Create missing tables')
    console.log('2. Add missing columns')
    console.log('3. Fix column data types')
    console.log('4. Ensure proper constraints')
    console.log('\nThe trigger function needs the correct table structure to work.')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Structure check failed:', error.message)
  }
}

checkDatabaseStructure()
