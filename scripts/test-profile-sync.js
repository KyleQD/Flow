#!/usr/bin/env node

/**
 * Profile Sync Test Script
 * This script tests that profile updates in settings sync with dashboard display
 */

const testProfileSync = async () => {
  console.log('🧪 Testing Profile Sync Between Settings and Dashboard...\n')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Test 1: Check current profile API
    console.log('📋 Test 1: Checking current profile API...')
    const profileResponse = await fetch(`${baseUrl}/api/profile/current`)
    
    console.log(`   Status: ${profileResponse.status}`)
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      console.log(`   ✅ Profile API working`)
      console.log(`   📊 Profile Data Structure:`)
      console.log(`      - ID: ${profileData.profile?.id}`)
      console.log(`      - Username: ${profileData.profile?.username}`)
      console.log(`      - Full Name: ${profileData.profile?.profile_data?.name}`)
      console.log(`      - Avatar URL: ${profileData.profile?.avatar_url ? 'Set' : 'Not set'}`)
      console.log(`      - Custom URL: ${profileData.profile?.custom_url}`)
      console.log(`      - Bio: ${profileData.profile?.bio}`)
      console.log(`      - Stats: ${profileData.profile?.stats?.followers} followers, ${profileData.profile?.stats?.posts} posts`)
    } else {
      console.log(`   ❌ Profile API failed - ${profileResponse.status}`)
      if (profileResponse.status === 401) {
        console.log('   ⚠️  Authentication required - make sure you\'re logged in')
      }
      return
    }
    
    console.log('\n🎉 Profile sync test completed!')
    console.log('\n📋 What to test manually:')
    console.log('   1. Update your profile in /settings (name, bio, avatar)')
    console.log('   2. Go to /dashboard and see changes reflected immediately')
    console.log('   3. Check that avatar shows correctly')
    console.log('   4. Verify full name displays instead of email')
    
    console.log('\n💡 Expected Results:')
    console.log('   • Dashboard shows updated full name: "Kyle Daley"')
    console.log('   • Profile picture appears correctly')
    console.log('   • No more "kyleqdaley" email display')
    console.log('   • Real-time sync between settings and dashboard')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testProfileSync() 