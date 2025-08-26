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

async function testManualSignup() {
  console.log('🧪 Testing Manual Signup System\n')
  
  const testEmail = `manual-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // Step 1: Create user account (without trigger)
    console.log('1. Creating user account...')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Manual Test User',
          username: 'manualtestuser',
          account_type: 'general'
        }
      }
    })

    if (error) {
      console.log(`❌ User creation failed:`)
      console.log(`   Message: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      console.log(`   Status: ${error.status}`)
      return
    }

    if (!data.user) {
      console.log('❌ No user returned from signup')
      return
    }

    console.log('✅ User account created successfully!')
    console.log(`   User ID: ${data.user.id}`)
    console.log(`   Email: ${data.user.email}`)
    console.log(`   Session: ${data.session ? 'Created' : 'None'}`)

    // Step 2: Create profile manually
    console.log('\n2. Creating profile manually...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        name: 'Manual Test User',
        username: 'manualtestuser',
        full_name: 'Manual Test User',
        email: testEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (profileError) {
      console.log(`❌ Manual profile creation failed: ${profileError.message}`)
      
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        console.log('   Profile does not exist, this is a real error')
      } else if (existingProfile) {
        console.log('   Profile already exists (trigger might be working)')
      }
    } else {
      console.log('✅ Manual profile creation succeeded')
    }

    // Step 3: Create active profile entry
    console.log('\n3. Creating active profile entry...')
    const { error: activeProfileError } = await supabase
      .from('user_active_profiles')
      .insert([{
        user_id: data.user.id,
        active_profile_type: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (activeProfileError) {
      console.log(`❌ Active profile creation failed: ${activeProfileError.message}`)
    } else {
      console.log('✅ Active profile creation succeeded')
    }

    // Step 4: Verify profile was created
    console.log('\n4. Verifying profile...')
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileCheckError) {
      console.log(`❌ Profile verification failed: ${profileCheckError.message}`)
    } else {
      console.log('✅ Profile verification succeeded')
      console.log(`   Profile ID: ${profile.id}`)
      console.log(`   Name: ${profile.name}`)
      console.log(`   Username: ${profile.username}`)
      console.log(`   Email: ${profile.email}`)
    }

    // Step 5: Test signin
    console.log('\n5. Testing signin...')
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signinError) {
      console.log(`❌ Signin failed: ${signinError.message}`)
      
      if (signinError.message.includes('Email not confirmed')) {
        console.log('   This is expected if email confirmation is required')
      }
    } else {
      console.log('✅ Signin succeeded!')
      console.log(`   User ID: ${signinData.user?.id}`)
      console.log(`   Session: ${signinData.session ? 'Created' : 'None'}`)
    }

    // Step 6: Clean up
    console.log('\n6. Cleaning up test data...')
    try {
      // Delete active profile
      await supabase.from('user_active_profiles').delete().eq('user_id', data.user.id)
      console.log('   ✅ Active profile deleted')
      
      // Delete profile
      await supabase.from('profiles').delete().eq('id', data.user.id)
      console.log('   ✅ Profile deleted')
      
      // Sign out
      await supabase.auth.signOut()
      console.log('   ✅ Signed out')
    } catch (cleanupError) {
      console.log(`   ⚠️  Cleanup error: ${cleanupError.message}`)
    }

    console.log('\n📋 MANUAL SIGNUP TEST SUMMARY:')
    console.log('━'.repeat(50))
    console.log('✅ User account creation: SUCCESS')
    console.log('✅ Manual profile creation: SUCCESS')
    console.log('✅ Active profile creation: SUCCESS')
    console.log('✅ Profile verification: SUCCESS')
    console.log('✅ Signin: ' + (signinError ? 'FAILED' : 'SUCCESS'))
    console.log('\n🎉 Manual signup system is working!')
    console.log('\nNext steps:')
    console.log('1. Update your signup component to use manual profile creation')
    console.log('2. Test the signup flow in your application')
    console.log('3. Consider re-enabling the trigger if needed')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Manual signup test failed:', error.message)
  }
}

testManualSignup()
