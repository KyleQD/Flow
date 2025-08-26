#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentState() {
  console.log('🔍 Checking Current Database State...\n')
  
  try {
    // Check 1: Database connection
    console.log('1. Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log(`❌ Database connection failed: ${connectionError.message}`)
      return
    }
    console.log('✅ Database connection working')

    // Check 2: Check if profiles table exists and has data
    console.log('\n2. Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.log(`❌ Profiles table error: ${profilesError.message}`)
    } else {
      console.log(`✅ Profiles table exists with ${profiles?.length || 0} records`)
    }

    // Check 3: Check if user_active_profiles table exists
    console.log('\n3. Checking user_active_profiles table...')
    const { data: activeProfiles, error: activeProfilesError } = await supabase
      .from('user_active_profiles')
      .select('*')
      .limit(5)
    
    if (activeProfilesError) {
      console.log(`❌ user_active_profiles table error: ${activeProfilesError.message}`)
    } else {
      console.log(`✅ user_active_profiles table exists with ${activeProfiles?.length || 0} records`)
    }

    // Check 4: Test a simple signup to see the exact error
    console.log('\n4. Testing signup to see exact error...')
    const testEmail = `test-${Date.now()}@example.com`
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser'
        }
      }
    })

    if (error) {
      console.log(`❌ Signup failed with error:`)
      console.log(`   Message: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      console.log(`   Status: ${error.status}`)
      console.log(`   Name: ${error.name}`)
      
      if (error.message.includes('Database error')) {
        console.log('\n🔧 DIAGNOSIS: This is a database trigger issue.')
        console.log('   The handle_new_user function is failing when creating profiles.')
        console.log('   You need to apply the SQL fix in Supabase Dashboard.')
      }
    } else {
      console.log('✅ Signup succeeded!')
      console.log(`   User ID: ${data.user?.id}`)
      console.log(`   Session: ${data.session ? 'Created' : 'None'}`)
      
      // Check if profile was created
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.log(`❌ Profile not created: ${profileError.message}`)
        } else {
          console.log('✅ Profile created automatically')
        }
      }
    }

    console.log('\n📋 SUMMARY:')
    console.log('━'.repeat(50))
    console.log('The "Database error saving new user" error indicates that:')
    console.log('1. The database trigger (handle_new_user) is failing')
    console.log('2. This happens when a new user tries to sign up')
    console.log('3. The trigger tries to create a profile but crashes')
    console.log('4. This causes the entire signup to fail')
    console.log('\nSOLUTION: Apply the SQL fix in Supabase Dashboard')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Check failed:', error.message)
  }
}

checkCurrentState()
