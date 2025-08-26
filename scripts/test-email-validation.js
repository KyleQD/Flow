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

async function testEmailValidation() {
  console.log('🧪 Testing Email Validation\n')
  
  const testEmails = [
    `test-${Date.now()}@gmail.com`,
    `test-${Date.now()}@yahoo.com`,
    `test-${Date.now()}@outlook.com`,
    `test-${Date.now()}@hotmail.com`,
    `test-${Date.now()}@icloud.com`,
    `test-${Date.now()}@protonmail.com`,
    `test-${Date.now()}@example.com`,
    `test-${Date.now()}@test.com`,
    `test-${Date.now()}@domain.com`,
    `test-${Date.now()}@company.org`
  ]

  for (const email of testEmails) {
    console.log(`Testing email: ${email}`)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
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
        
        if (error.message.includes('invalid')) {
          console.log(`   🔍 Email validation error detected`)
        }
      } else {
        console.log(`   ✅ Success! User created: ${data.user?.id}`)
        console.log(`   🎉 Email format accepted: ${email}`)
        
        // Clean up - delete the test user
        if (data.user) {
          try {
            await supabase.auth.admin.deleteUser(data.user.id)
            console.log(`   🧹 Test user cleaned up`)
          } catch (cleanupError) {
            console.log(`   ⚠️  Could not clean up test user`)
          }
        }
        
        // Found a working email format, stop testing
        break
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`)
    }
    
    console.log('') // Add spacing between tests
  }

  console.log('📋 EMAIL VALIDATION SUMMARY')
  console.log('━'.repeat(50))
  console.log('If all emails failed with "email_address_invalid":')
  console.log('1. Check Supabase Auth settings')
  console.log('2. Verify email validation rules')
  console.log('3. Check for domain restrictions')
  console.log('4. Contact Supabase support')
  console.log('━'.repeat(50))
}

testEmailValidation()
