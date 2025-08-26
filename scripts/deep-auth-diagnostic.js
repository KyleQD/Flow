#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

async function deepAuthDiagnostic() {
  console.log('🔍 Deep Authentication Diagnostic\n')
  
  try {
    // Test 1: Environment Variables Analysis
    console.log('1. Environment Variables Analysis')
    console.log('━'.repeat(50))
    console.log(`URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
    console.log(`Anon Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
    console.log(`Service Role Key: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`)
    
    if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
      console.log('⚠️  URL format looks incorrect')
    }
    
    if (supabaseKey && supabaseKey.length < 100) {
      console.log('⚠️  Anon key seems too short')
    }

    // Test 2: Basic Connection Test
    console.log('\n2. Basic Connection Test')
    console.log('━'.repeat(50))
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log(`❌ Connection failed: ${connectionError.message}`)
      console.log(`   Code: ${connectionError.code}`)
      console.log(`   Details: ${connectionError.details}`)
      console.log(`   Hint: ${connectionError.hint}`)
      return
    }
    console.log('✅ Database connection successful')

    // Test 3: Auth Service Test
    console.log('\n3. Auth Service Test')
    console.log('━'.repeat(50))
    const { data: authTest, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log(`❌ Auth service failed: ${authError.message}`)
      console.log(`   Code: ${authError.code}`)
      console.log(`   Status: ${authError.status}`)
    } else {
      console.log('✅ Auth service responding')
      console.log(`   Current session: ${authTest.session ? 'Active' : 'None'}`)
    }

    // Test 4: Check Existing Users
    console.log('\n4. Existing Users Analysis')
    console.log('━'.repeat(50))
    if (supabaseAdmin) {
      try {
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        if (usersError) {
          console.log(`❌ Could not list users: ${usersError.message}`)
        } else {
          console.log(`✅ Found ${users.users.length} existing users`)
          if (users.users.length > 0) {
            const latestUser = users.users[0]
            console.log(`   Latest user: ${latestUser.email} (${latestUser.created_at})`)
            console.log(`   User ID format: ${latestUser.id}`)
          }
        }
      } catch (err) {
        console.log('⚠️  Could not check existing users (service role issue)')
      }
    } else {
      console.log('⚠️  No service role key - cannot check existing users')
    }

    // Test 5: Test Different Email Formats
    console.log('\n5. Email Format Testing')
    console.log('━'.repeat(50))
    const testEmails = [
      `test-${Date.now()}@example.com`,
      `test-${Date.now()}@gmail.com`,
      `test-${Date.now()}@test.com`
    ]

    for (const email of testEmails) {
      console.log(`\n   Testing email: ${email}`)
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'TestPassword123!',
        options: {
          data: {
            full_name: 'Test User',
            username: 'testuser'
          }
        }
      })

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
        console.log(`      Code: ${error.code}`)
        console.log(`      Status: ${error.status}`)
        
        // If it's a different error, log it
        if (error.message !== 'Database error saving new user') {
          console.log(`   🔍 Different error pattern detected!`)
        }
      } else {
        console.log(`   ✅ Success! User created: ${data.user?.id}`)
        // Clean up
        if (data.user) {
          await supabaseAdmin?.auth.admin.deleteUser(data.user.id)
        }
        break // Stop testing if one works
      }
    }

    // Test 6: Test Minimal Signup
    console.log('\n6. Minimal Signup Test')
    console.log('━'.repeat(50))
    const minimalEmail = `minimal-${Date.now()}@test.com`
    console.log(`   Testing minimal signup: ${minimalEmail}`)
    
    const { data: minimalData, error: minimalError } = await supabase.auth.signUp({
      email: minimalEmail,
      password: 'password123'
    })

    if (minimalError) {
      console.log(`   ❌ Minimal signup failed: ${minimalError.message}`)
      console.log(`      Code: ${minimalError.code}`)
      console.log(`      Status: ${minimalError.status}`)
    } else {
      console.log(`   ✅ Minimal signup succeeded: ${minimalData.user?.id}`)
      // Clean up
      if (minimalData.user) {
        await supabaseAdmin?.auth.admin.deleteUser(minimalData.user.id)
      }
    }

    // Test 7: Check Database Schema
    console.log('\n7. Database Schema Check')
    console.log('━'.repeat(50))
    try {
      // Check profiles table structure
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (profilesError) {
        console.log(`❌ Profiles table error: ${profilesError.message}`)
      } else {
        console.log('✅ Profiles table accessible')
        if (profiles && profiles.length > 0) {
          const sampleProfile = profiles[0]
          console.log(`   Sample profile ID: ${sampleProfile.id}`)
          console.log(`   ID type: ${typeof sampleProfile.id}`)
          console.log(`   ID length: ${sampleProfile.id?.length || 'N/A'}`)
        }
      }

      // Check user_active_profiles table
      const { data: activeProfiles, error: activeProfilesError } = await supabase
        .from('user_active_profiles')
        .select('*')
        .limit(1)
      
      if (activeProfilesError) {
        console.log(`❌ user_active_profiles table error: ${activeProfilesError.message}`)
      } else {
        console.log('✅ user_active_profiles table accessible')
      }
    } catch (err) {
      console.log(`⚠️  Schema check error: ${err.message}`)
    }

    // Test 8: Test with Service Role (if available)
    if (supabaseAdmin) {
      console.log('\n8. Service Role Test')
      console.log('━'.repeat(50))
      const serviceEmail = `service-${Date.now()}@test.com`
      console.log(`   Testing with service role: ${serviceEmail}`)
      
      try {
        const { data: serviceData, error: serviceError } = await supabaseAdmin.auth.admin.createUser({
          email: serviceEmail,
          password: 'TestPassword123!',
          email_confirm: true
        })

        if (serviceError) {
          console.log(`   ❌ Service role signup failed: ${serviceError.message}`)
          console.log(`      Code: ${serviceError.code}`)
          console.log(`      Status: ${serviceError.status}`)
        } else {
          console.log(`   ✅ Service role signup succeeded: ${serviceData.user?.id}`)
          // Clean up
          await supabaseAdmin.auth.admin.deleteUser(serviceData.user.id)
        }
      } catch (err) {
        console.log(`   ❌ Service role test error: ${err.message}`)
      }
    }

    // Test 9: Check Supabase Project Status
    console.log('\n9. Project Status Check')
    console.log('━'.repeat(50))
    try {
      // Try to get project info
      const { data: projectInfo, error: projectError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (projectError) {
        console.log(`❌ Project access error: ${projectError.message}`)
      } else {
        console.log('✅ Project is accessible')
      }
    } catch (err) {
      console.log(`⚠️  Project status check error: ${err.message}`)
    }

    // Test 10: Password Complexity Test
    console.log('\n10. Password Complexity Test')
    console.log('━'.repeat(50))
    const testPasswords = [
      'password123',
      'TestPassword123!',
      'VeryLongPassword123!@#',
      'short'
    ]

    for (const password of testPasswords) {
      const passwordEmail = `password-${Date.now()}@test.com`
      console.log(`   Testing password: "${password}"`)
      
      const { data, error } = await supabase.auth.signUp({
        email: passwordEmail,
        password: password
      })

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
        if (error.message.includes('password')) {
          console.log(`   🔍 Password-related error detected`)
        }
      } else {
        console.log(`   ✅ Password accepted`)
        // Clean up
        if (data.user) {
          await supabaseAdmin?.auth.admin.deleteUser(data.user.id)
        }
        break
      }
    }

    console.log('\n📋 DIAGNOSTIC SUMMARY')
    console.log('━'.repeat(50))
    console.log('Based on the tests above, the issue is likely:')
    console.log('')
    console.log('🔍 POSSIBLE CAUSES:')
    console.log('1. Supabase project configuration issue')
    console.log('2. Database permission problems')
    console.log('3. Auth service configuration')
    console.log('4. Project quota/billing issues')
    console.log('5. Region-specific problems')
    console.log('')
    console.log('🔧 RECOMMENDED ACTIONS:')
    console.log('1. Check Supabase Dashboard → Settings → Auth')
    console.log('2. Verify project status and billing')
    console.log('3. Check database permissions')
    console.log('4. Contact Supabase support')
    console.log('5. Consider creating a new project')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

deepAuthDiagnostic()
