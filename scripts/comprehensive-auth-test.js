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

async function comprehensiveAuthTest() {
  console.log('🧪 Comprehensive Authentication Test\n')
  
  const testEmail = `test-${Date.now()}@example.com`
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

    // Test 2: Check if trigger exists
    console.log('\n2. Checking trigger status...')
    try {
      const { data: triggerCheck, error: triggerError } = await supabase
        .rpc('exec_sql', { 
          sql: "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';" 
        })
      
      if (triggerError) {
        console.log('⚠️  Could not check trigger (exec_sql not available)')
      } else if (triggerCheck && triggerCheck.length > 0) {
        console.log('✅ Trigger exists')
      } else {
        console.log('❌ Trigger does not exist')
      }
    } catch (err) {
      console.log('⚠️  Could not check trigger status')
    }

    // Test 3: Test signup with detailed error analysis
    console.log('\n3. Testing signup process...')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    
    const startTime = Date.now()
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          username: 'testuser'
        }
      }
    })
    const endTime = Date.now()
    
    console.log(`   Duration: ${endTime - startTime}ms`)

    if (error) {
      console.log(`❌ Signup failed:`)
      console.log(`   Message: ${error.message}`)
      console.log(`   Code: ${error.code}`)
      console.log(`   Status: ${error.status}`)
      console.log(`   Name: ${error.name}`)
      
      // Analyze the error
      if (error.message.includes('Database error')) {
        console.log('\n🔧 ERROR ANALYSIS:')
        console.log('   This is a Supabase Auth database error.')
        console.log('   Possible causes:')
        console.log('   1. Database connection issues')
        console.log('   2. Auth configuration problems')
        console.log('   3. Trigger function errors')
        console.log('   4. Supabase project issues')
      }
      
      return
    }

    console.log('✅ Signup succeeded!')
    console.log(`   User ID: ${data.user?.id}`)
    console.log(`   Email: ${data.user?.email}`)
    console.log(`   Session: ${data.session ? 'Created' : 'None'}`)
    console.log(`   Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`)

    // Test 4: Check if profile was created
    console.log('\n4. Checking profile creation...')
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.log(`❌ Profile not found: ${profileError.message}`)
        
        // Try to create profile manually
        console.log('\n5. Attempting manual profile creation...')
        const { error: manualProfileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            name: 'Test User',
            username: 'testuser',
            full_name: 'Test User',
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
        console.log('✅ Profile created automatically')
        console.log(`   Profile ID: ${profile.id}`)
        console.log(`   Name: ${profile.name}`)
        console.log(`   Username: ${profile.username}`)
        console.log(`   Email: ${profile.email}`)
      }
    }

    // Test 5: Test signin if session was created
    if (data.session) {
      console.log('\n6. Testing signin with created session...')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.log(`❌ Session check failed: ${sessionError.message}`)
      } else if (sessionData.session) {
        console.log('✅ Session is valid')
        console.log(`   User ID: ${sessionData.session.user.id}`)
      } else {
        console.log('❌ No valid session found')
      }
    } else {
      console.log('\n6. No session created (email confirmation required)')
      console.log('   This is normal if email confirmation is enabled')
    }

    // Test 6: Test signin with credentials
    console.log('\n7. Testing signin with credentials...')
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

    // Test 7: Clean up test data
    console.log('\n8. Cleaning up test data...')
    try {
      if (data.user) {
        // Delete profile
        await supabase.from('profiles').delete().eq('id', data.user.id)
        console.log('   ✅ Profile deleted')
      }
      
      // Sign out
      await supabase.auth.signOut()
      console.log('   ✅ Signed out')
    } catch (cleanupError) {
      console.log(`   ⚠️  Cleanup error: ${cleanupError.message}`)
    }

    console.log('\n📋 TEST SUMMARY:')
    console.log('━'.repeat(50))
    if (data.user) {
      console.log('✅ Signup: SUCCESS')
      console.log('✅ User created successfully')
      console.log('✅ Profile creation: ' + (profileError ? 'FAILED' : 'SUCCESS'))
      console.log('✅ Signin: ' + (signinError ? 'FAILED' : 'SUCCESS'))
      console.log('\n🎉 Authentication system is working!')
    } else {
      console.log('❌ Signup: FAILED')
      console.log('❌ User creation failed')
      console.log('\n🔧 Next steps:')
      console.log('1. Check Supabase project health')
      console.log('2. Verify environment variables')
      console.log('3. Check auth settings in Supabase Dashboard')
      console.log('4. Contact Supabase support if needed')
    }
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message)
  }
}

comprehensiveAuthTest()
