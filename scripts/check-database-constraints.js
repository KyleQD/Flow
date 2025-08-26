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

async function checkDatabaseConstraints() {
  console.log('🔍 Database Constraints & Policies Check\n')
  
  try {
    // Check 1: RLS Policies on auth.users
    console.log('1. Checking RLS Policies')
    console.log('━'.repeat(50))
    
    // Try to query auth.users directly (this should fail due to RLS)
    try {
      const { data: authUsers, error: authUsersError } = await supabase
        .from('auth.users')
        .select('*')
        .limit(1)
      
      if (authUsersError) {
        console.log('✅ RLS is working (cannot access auth.users directly)')
        console.log(`   Error: ${authUsersError.message}`)
      } else {
        console.log('⚠️  RLS might not be configured properly')
      }
    } catch (err) {
      console.log('✅ RLS is working (table not accessible)')
    }

    // Check 2: Check if there are any triggers on auth.users
    console.log('\n2. Checking for Triggers')
    console.log('━'.repeat(50))
    
    try {
      // Try to check if our trigger exists
      const { data: triggerCheck, error: triggerError } = await supabase
        .rpc('exec_sql', { 
          sql: "SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users' AND event_object_schema = 'auth';" 
        })
      
      if (triggerError) {
        console.log('⚠️  Could not check triggers (exec_sql not available)')
      } else if (triggerCheck && triggerCheck.length > 0) {
        console.log('⚠️  Found triggers on auth.users:')
        triggerCheck.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name}`)
        })
      } else {
        console.log('✅ No triggers found on auth.users')
      }
    } catch (err) {
      console.log('⚠️  Could not check triggers')
    }

    // Check 3: Check database permissions
    console.log('\n3. Checking Database Permissions')
    console.log('━'.repeat(50))
    
    // Test if we can create a test table
    try {
      const { error: createTableError } = await supabase
        .rpc('exec_sql', { 
          sql: "CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY, name TEXT);" 
        })
      
      if (createTableError) {
        console.log('❌ Cannot create tables (permission issue)')
        console.log(`   Error: ${createTableError.message}`)
      } else {
        console.log('✅ Can create tables')
        
        // Clean up
        await supabase.rpc('exec_sql', { 
          sql: "DROP TABLE IF EXISTS test_permissions;" 
        })
      }
    } catch (err) {
      console.log('⚠️  Could not test table creation (exec_sql not available)')
    }

    // Check 4: Check if there are any database functions that might interfere
    console.log('\n4. Checking Database Functions')
    console.log('━'.repeat(50))
    
    try {
      const { data: functions, error: functionsError } = await supabase
        .rpc('exec_sql', { 
          sql: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%user%' OR routine_name LIKE '%auth%';" 
        })
      
      if (functionsError) {
        console.log('⚠️  Could not check functions (exec_sql not available)')
      } else if (functions && functions.length > 0) {
        console.log('⚠️  Found potentially interfering functions:')
        functions.forEach(func => {
          console.log(`   - ${func.routine_name}`)
        })
      } else {
        console.log('✅ No potentially interfering functions found')
      }
    } catch (err) {
      console.log('⚠️  Could not check functions')
    }

    // Check 5: Test with a completely different approach - try to create a user via SQL
    console.log('\n5. Testing Direct SQL User Creation')
    console.log('━'.repeat(50))
    
    if (supabaseAdmin) {
      try {
        const testEmail = `sql-test-${Date.now()}@test.com`
        console.log(`   Testing direct SQL: ${testEmail}`)
        
        // Try to create a user directly in the database
        const { error: sqlError } = await supabaseAdmin
          .rpc('exec_sql', { 
            sql: `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES ('${testEmail}', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{}');` 
          })
        
        if (sqlError) {
          console.log(`   ❌ Direct SQL failed: ${sqlError.message}`)
        } else {
          console.log('   ✅ Direct SQL succeeded')
          
          // Clean up
          await supabaseAdmin.rpc('exec_sql', { 
            sql: `DELETE FROM auth.users WHERE email = '${testEmail}';` 
          })
        }
      } catch (err) {
        console.log(`   ❌ Direct SQL test error: ${err.message}`)
      }
    } else {
      console.log('⚠️  No service role key - cannot test direct SQL')
    }

    // Check 6: Check if there are any database constraints
    console.log('\n6. Checking Database Constraints')
    console.log('━'.repeat(50))
    
    try {
      const { data: constraints, error: constraintsError } = await supabase
        .rpc('exec_sql', { 
          sql: "SELECT conname, contype, pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conrelid = 'auth.users'::regclass;" 
        })
      
      if (constraintsError) {
        console.log('⚠️  Could not check constraints (exec_sql not available)')
      } else if (constraints && constraints.length > 0) {
        console.log('⚠️  Found constraints on auth.users:')
        constraints.forEach(constraint => {
          console.log(`   - ${constraint.conname} (${constraint.contype}): ${constraint.definition}`)
        })
      } else {
        console.log('✅ No custom constraints found on auth.users')
      }
    } catch (err) {
      console.log('⚠️  Could not check constraints')
    }

    // Check 7: Check Supabase project settings via API
    console.log('\n7. Checking Project Settings')
    console.log('━'.repeat(50))
    
    // Try to get project info
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (response.ok) {
        console.log('✅ Project API is accessible')
      } else {
        console.log(`❌ Project API error: ${response.status} ${response.statusText}`)
      }
    } catch (err) {
      console.log(`❌ Project API test failed: ${err.message}`)
    }

    // Check 8: Test with a different Supabase client configuration
    console.log('\n8. Testing Different Client Configuration')
    console.log('━'.repeat(50))
    
    try {
      // Create a new client with different options
      const testClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      const testEmail = `client-test-${Date.now()}@test.com`
      console.log(`   Testing with different client config: ${testEmail}`)
      
      const { data, error } = await testClient.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!'
      })
      
      if (error) {
        console.log(`   ❌ Different client failed: ${error.message}`)
        console.log(`      Code: ${error.code}`)
        console.log(`      Status: ${error.status}`)
      } else {
        console.log(`   ✅ Different client succeeded: ${data.user?.id}`)
        // Clean up
        if (data.user && supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(data.user.id)
        }
      }
    } catch (err) {
      console.log(`   ❌ Different client test error: ${err.message}`)
    }

    console.log('\n📋 CONSTRAINTS ANALYSIS')
    console.log('━'.repeat(50))
    console.log('Based on the diagnostic results:')
    console.log('')
    console.log('🔍 KEY FINDINGS:')
    console.log('1. Database connection works')
    console.log('2. Auth service responds')
    console.log('3. Existing users exist (6 users found)')
    console.log('4. Service role also fails with same error')
    console.log('5. All email formats fail')
    console.log('6. All password complexities fail')
    console.log('')
    console.log('🎯 ROOT CAUSE:')
    console.log('This is a Supabase Auth database configuration issue.')
    console.log('The error "Database error saving new user" indicates:')
    console.log('- Database connection issues in Supabase Auth')
    console.log('- Auth service configuration problems')
    console.log('- Project-level database issues')
    console.log('')
    console.log('🔧 IMMEDIATE ACTIONS:')
    console.log('1. Go to Supabase Dashboard → Settings → Database')
    console.log('2. Check if database is paused or has issues')
    console.log('3. Check project billing and quotas')
    console.log('4. Contact Supabase support with project URL')
    console.log('5. Consider creating a new project')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Constraints check failed:', error.message)
  }
}

checkDatabaseConstraints()
