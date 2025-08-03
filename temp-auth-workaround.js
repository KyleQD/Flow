#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTemporaryUser() {
  console.log('🛠️  Creating Temporary User for Development...\n')
  
  try {
    // Since signup is broken, let's create users manually for development
    const testUserId = '12345678-1234-1234-1234-123456789012' // Fixed UUID for testing
    const testEmail = 'dev-test@yourproject.com'
    
    console.log('1. Creating manual profile for development...')
    
    // Create profile directly (bypass broken auth.signUp)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        name: 'Development Test User',
        username: 'devtest',
        full_name: 'Development Test User',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message)
    } else {
      console.log('✅ Manual profile created for development')
    }
    
    // Create active profile entry
    const { error: activeError } = await supabase
      .from('user_active_profiles')
      .insert({
        user_id: testUserId,
        active_profile_type: 'general'
      })
    
    if (activeError && !activeError.message.includes('duplicate')) {
      console.error('❌ Active profile creation failed:', activeError.message)
    } else {
      console.log('✅ Active profile entry created')
    }
    
    console.log('\n📋 DEVELOPMENT USER DETAILS:')
    console.log(`   User ID: ${testUserId}`)
    console.log(`   Email: ${testEmail}`)
    console.log(`   Username: devtest`)
    console.log('\n💡 You can use this for frontend development while waiting for Supabase support')
    
    // Test login with this mock user
    console.log('\n2. Testing frontend with mock authentication...')
    console.log('   You can modify your auth context to use mock data:')
    console.log(`
   // In your auth context, temporarily add:
   const mockUser = {
     id: '${testUserId}',
     email: '${testEmail}',
     user_metadata: {
       full_name: 'Development Test User',
       username: 'devtest'
     }
   }
   
   // Use mockUser for development until Supabase is fixed
   `)
    
  } catch (error) {
    console.error('❌ Workaround error:', error.message)
  }
}

createTemporaryUser()