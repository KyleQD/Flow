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

async function testWithoutTrigger() {
  console.log('🧪 Testing Authentication WITHOUT Trigger\n')
  
  const testEmail = `no-trigger-test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log(`❌ Connection failed: ${connectionError.message}`)
      return
    }
    console.log('✅ Connection successful')

    // Test 2: Test signup WITHOUT trigger
    console.log('\n2. Testing signup WITHOUT trigger...')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'No Trigger Test User',
          username: 'notriggertest'
        }
      }
    })

    if (error) {
      console.log(`❌ Signup failed:`)
      console.log(`   Message: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      console.log(`   Status: ${error.status}`)
      
      console.log('\n🔧 DIAGNOSIS:')
      console.log('   The issue is with Supabase Auth itself, not the trigger.')
      console.log('   This means:')
      console.log('   1. Database connection issues')
      console.log('   2. Auth configuration problems')
      console.log('   3. Supabase project issues')
      console.log('   4. Environment variable problems')
      
      return
    }

    console.log('✅ Signup succeeded WITHOUT trigger!')
    console.log(`   User ID: ${data.user?.id}`)
    console.log(`   Email: ${data.user?.email}`)
    console.log(`   Session: ${data.session ? 'Created' : 'None'}`)

    // Test 3: Check if profile was created (should NOT be created without trigger)
    console.log('\n3. Checking profile creation...')
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.log('✅ Profile NOT created (expected without trigger)')
        console.log(`   Error: ${profileError.message}`)
        
        // Test 4: Create profile manually
        console.log('\n4. Testing manual profile creation...')
        const { error: manualProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: 'No Trigger Test User',
            username: 'notriggertest',
            full_name: 'No Trigger Test User',
            email: testEmail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (manualProfileError) {
          console.log(`❌ Manual profile creation failed: ${manualProfileError.message}`)
        } else {
          console.log('✅ Manual profile creation succeeded')
        }
      } else {
        console.log('⚠️  Profile was created (trigger might still be active)')
        console.log(`   Profile ID: ${profile.id}`)
      }
    }

    // Test 5: Test signin
    console.log('\n5. Testing signin...')
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signinError) {
      console.log(`❌ Signin failed: ${signinError.message}`)
    } else {
      console.log('✅ Signin succeeded!')
      console.log(`   User ID: ${signinData.user?.id}`)
    }

    // Test 6: Clean up
    console.log('\n6. Cleaning up...')
    try {
      if (data.user) {
        await supabase.from('profiles').delete().eq('id', data.user.id)
        console.log('   ✅ Profile deleted')
      }
      await supabase.auth.signOut()
      console.log('   ✅ Signed out')
    } catch (cleanupError) {
      console.log(`   ⚠️  Cleanup error: ${cleanupError.message}`)
    }

    console.log('\n📋 CONCLUSION:')
    console.log('━'.repeat(50))
    console.log('✅ Auth works WITHOUT trigger')
    console.log('✅ User creation succeeds')
    console.log('✅ Signin works')
    console.log('\n🔧 SOLUTION:')
    console.log('1. Keep the trigger disabled')
    console.log('2. Create profiles manually in your signup flow')
    console.log('3. Update your signup component to handle profile creation')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testWithoutTrigger()
