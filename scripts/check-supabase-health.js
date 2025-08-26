#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.log('Please check your .env.local file has:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabaseHealth() {
  console.log('🏥 Supabase Project Health Check\n')
  
  try {
    // Check 1: Environment variables
    console.log('1. Checking environment variables...')
    console.log(`   URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
    console.log(`   Anon Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
    
    if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
      console.log('   ⚠️  URL format looks incorrect')
    }

    // Check 2: Basic connection
    console.log('\n2. Testing basic connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log(`❌ Connection failed: ${connectionError.message}`)
      console.log('   This suggests database connection issues')
      return
    }
    console.log('✅ Database connection successful')

    // Check 3: Auth service
    console.log('\n3. Testing auth service...')
    const { data: authTest, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log(`❌ Auth service failed: ${authError.message}`)
      console.log('   This suggests auth configuration issues')
    } else {
      console.log('✅ Auth service responding')
      console.log(`   Current session: ${authTest.session ? 'Active' : 'None'}`)
    }

    // Check 4: Check if profiles table exists and has correct structure
    console.log('\n4. Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log(`❌ Profiles table error: ${profilesError.message}`)
      console.log('   This suggests table structure issues')
    } else {
      console.log('✅ Profiles table accessible')
      console.log(`   Records found: ${profiles?.length || 0}`)
    }

    // Check 5: Check if user_active_profiles table exists
    console.log('\n5. Checking user_active_profiles table...')
    const { data: activeProfiles, error: activeProfilesError } = await supabase
      .from('user_active_profiles')
      .select('*')
      .limit(1)
    
    if (activeProfilesError) {
      console.log(`❌ user_active_profiles table error: ${activeProfilesError.message}`)
      console.log('   This table might be missing')
    } else {
      console.log('✅ user_active_profiles table accessible')
      console.log(`   Records found: ${activeProfiles?.length || 0}`)
    }

    // Check 6: Test a simple database operation
    console.log('\n6. Testing database write operation...')
    const testId = `health-check-${Date.now()}`
    const { error: writeError } = await supabase
      .from('profiles')
      .insert([{
        id: testId,
        name: 'Health Check',
        username: 'healthcheck',
        full_name: 'Health Check User',
        email: 'health@check.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])

    if (writeError) {
      console.log(`❌ Write operation failed: ${writeError.message}`)
      console.log('   This suggests permission or constraint issues')
    } else {
      console.log('✅ Write operation successful')
      
      // Clean up test record
      await supabase.from('profiles').delete().eq('id', testId)
      console.log('   ✅ Test record cleaned up')
    }

    console.log('\n📋 HEALTH CHECK SUMMARY:')
    console.log('━'.repeat(50))
    console.log('If all checks passed except auth, the issue is:')
    console.log('1. Supabase Auth configuration')
    console.log('2. Database permissions for auth')
    console.log('3. Supabase project settings')
    console.log('\nNext steps:')
    console.log('1. Check Supabase Dashboard → Settings → Auth')
    console.log('2. Verify email confirmation settings')
    console.log('3. Check database permissions')
    console.log('4. Contact Supabase support if needed')
    console.log('━'.repeat(50))

  } catch (error) {
    console.error('❌ Health check failed:', error.message)
  }
}

checkSupabaseHealth()
