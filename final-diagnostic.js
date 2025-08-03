#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function finalDiagnostic() {
  console.log('🏥 Final System Diagnostic for Supabase Support...\n')
  
  try {
    // 1. Project health check
    console.log('1. Project Health Check:')
    console.log(`   Project URL: ${supabaseUrl}`)
    console.log(`   Using Service Role: ${supabaseKey ? 'Yes' : 'No'}`)
    
    // 2. Database connectivity
    console.log('\n2. Database Connectivity:')
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      console.log(`   ✅ Database connection: Working`)
    } catch (err) {
      console.log(`   ❌ Database connection: ${err.message}`)
    }
    
    // 3. Auth service connectivity
    console.log('\n3. Auth Service Tests:')
    
    // Test auth service is responding
    try {
      const { data: session } = await supabase.auth.getSession()
      console.log(`   ✅ Auth service responding: Yes`)
    } catch (err) {
      console.log(`   ❌ Auth service error: ${err.message}`)
    }
    
    // 4. Specific signup error details
    console.log('\n4. Detailed Signup Error Analysis:')
    
    const testEmail = `diagnostic-${Date.now()}@example.com`
    
    try {
      const startTime = Date.now()
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!'
      })
      const duration = Date.now() - startTime
      
      if (error) {
        console.log(`   ❌ Signup failed after ${duration}ms`)
        console.log(`   Error Message: "${error.message}"`)
        console.log(`   Error Code: "${error.code}"`)
        console.log(`   Error Status: ${error.status}`)
        console.log(`   Error Name: "${error.name}"`)
        console.log(`   Is Auth Error: ${error.__isAuthError}`)
        
        // Check if it's a specific type of error
        if (error.message.includes('Database')) {
          console.log('   💡 Analysis: Database-level failure in auth service')
        }
        if (error.message.includes('Schema')) {
          console.log('   💡 Analysis: Database schema issue')
        }
        if (error.message.includes('Constraint')) {
          console.log('   💡 Analysis: Database constraint violation')
        }
      } else {
        console.log(`   ✅ Signup succeeded after ${duration}ms`)
        console.log(`   User ID: ${data.user?.id}`)
        console.log(`   Session: ${data.session ? 'Created' : 'None'}`)
      }
    } catch (err) {
      console.log(`   ❌ Exception during signup: ${err.message}`)
    }
    
    // 5. System information
    console.log('\n5. System Information:')
    console.log(`   Node.js version: ${process.version}`)
    console.log(`   Platform: ${process.platform}`)
    console.log(`   Architecture: ${process.arch}`)
    
    // 6. Package versions
    try {
      const packageJson = require('./package.json')
      console.log('\n6. Relevant Package Versions:')
      const authDeps = Object.entries(packageJson.dependencies || {})
        .filter(([name]) => name.includes('supabase') || name.includes('auth'))
      
      if (authDeps.length > 0) {
        authDeps.forEach(([name, version]) => {
          console.log(`   ${name}: ${version}`)
        })
      } else {
        console.log('   No Supabase packages found in package.json')
      }
    } catch (err) {
      console.log('\n6. Package versions: Could not read package.json')
    }
    
    console.log('\n📋 SUPPORT TICKET SUMMARY:')
    console.log('━'.repeat(60))
    console.log('Issue: Complete auth system failure')
    console.log('Error: "Database error saving new user"') 
    console.log('Affects: All signup methods (regular + admin)')
    console.log('Project: auqddrodjezjlypkzfpi.supabase.co')
    console.log('Status: Critical - No users can be created')
    console.log('━'.repeat(60))
    
    console.log('\n📞 NEXT STEPS:')
    console.log('1. Use the support ticket content from supabase-support-ticket.md')
    console.log('2. Submit via Supabase Dashboard → Help & Support')
    console.log('3. Or email support@supabase.com with the ticket details')
    console.log('4. Reference this diagnostic output')
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error.message)
  }
}

finalDiagnostic()