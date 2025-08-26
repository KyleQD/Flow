#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthFix() {
  console.log('🧪 Testing Authentication Fix...\n')
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // Test 1: Basic signup
    console.log('1. Testing user signup...')
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser',
          account_type: 'general'
        }
      }
    })

    if (error) {
      console.log(`❌ Signup failed: ${error.message}`)
      console.log(`   Error code: ${error.code}`)
      console.log(`   Error status: ${error.status}`)
      return false
    }

    if (!data.user) {
      console.log('❌ No user returned from signup')
      return false
    }

    console.log(`✅ Signup successful!`)
    console.log(`   User ID: ${data.user.id}`)
    console.log(`   Email: ${data.user.email}`)
    console.log(`   Session: ${data.session ? 'Created' : 'None (email confirmation required)'}`)

    // Test 2: Check if profile was created
    console.log('\n2. Checking profile creation...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.log(`❌ Profile check failed: ${profileError.message}`)
      return false
    }

    if (!profile) {
      console.log('❌ Profile not found')
      return false
    }

    console.log(`✅ Profile created successfully!`)
    console.log(`   Name: ${profile.name}`)
    console.log(`   Username: ${profile.username}`)
    console.log(`   Email: ${profile.email}`)

    // Test 3: Check if active profile was created
    console.log('\n3. Checking active profile creation...')
    const { data: activeProfile, error: activeProfileError } = await supabase
      .from('user_active_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (activeProfileError) {
      console.log(`❌ Active profile check failed: ${activeProfileError.message}`)
      return false
    }

    if (!activeProfile) {
      console.log('❌ Active profile not found')
      return false
    }

    console.log(`✅ Active profile created successfully!`)
    console.log(`   Active profile type: ${activeProfile.active_profile_type}`)

    // Test 4: Check if onboarding state was created
    console.log('\n4. Checking onboarding state creation...')
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (onboardingError) {
      console.log(`❌ Onboarding check failed: ${onboardingError.message}`)
      return false
    }

    if (!onboarding) {
      console.log('❌ Onboarding state not found')
      return false
    }

    console.log(`✅ Onboarding state created successfully!`)
    console.log(`   Active profile type: ${onboarding.active_profile_type}`)
    console.log(`   General profile completed: ${onboarding.general_profile_completed}`)

    // Test 5: Clean up test user
    console.log('\n5. Cleaning up test user...')
    try {
      // Note: We can't delete the user with anon key, but we can clean up the profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', data.user.id)

      if (deleteError) {
        console.log(`⚠️  Could not clean up profile: ${deleteError.message}`)
      } else {
        console.log('✅ Test user cleaned up')
      }
    } catch (cleanupError) {
      console.log(`⚠️  Cleanup error: ${cleanupError.message}`)
    }

    console.log('\n🎉 All tests passed! Authentication system is working correctly.')
    return true

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
    return false
  }
}

// Run the test
testAuthFix().then((success) => {
  process.exit(success ? 0 : 1)
})
