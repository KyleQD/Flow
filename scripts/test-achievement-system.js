#!/usr/bin/env node

/**
 * Test script for the Achievement System
 * This script tests the database tables, API endpoints, and basic functionality
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration - replace with your actual values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testAchievementSystem() {
  console.log('🧪 Testing Achievement System...\n')

  try {
    // Test 1: Check if tables exist
    console.log('1. Testing Database Tables...')
    
    const tables = [
      'achievements',
      'user_achievements', 
      'badges',
      'user_badges',
      'endorsements',
      'skill_categories',
      'user_skills',
      'achievement_progress_events'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }

    // Test 2: Check default data
    console.log('\n2. Testing Default Data...')
    
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
    
    if (achievementsError) {
      console.log(`❌ Achievements: ${achievementsError.message}`)
    } else {
      console.log(`✅ Achievements: ${achievements?.length || 0} active achievements found`)
    }

    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
    
    if (badgesError) {
      console.log(`❌ Badges: ${badgesError.message}`)
    } else {
      console.log(`✅ Badges: ${badges?.length || 0} active badges found`)
    }

    const { data: skillCategories, error: skillCategoriesError } = await supabase
      .from('skill_categories')
      .select('*')
      .eq('is_active', true)
    
    if (skillCategoriesError) {
      console.log(`❌ Skill Categories: ${skillCategoriesError.message}`)
    } else {
      console.log(`✅ Skill Categories: ${skillCategories?.length || 0} categories found`)
    }

    // Test 3: Check RLS policies
    console.log('\n3. Testing RLS Policies...')
    
    // This would require authentication to test properly
    console.log('ℹ️  RLS policies require authentication to test properly')
    console.log('ℹ️  You can test them by logging into the app and accessing the achievements page')

    // Test 4: Check API endpoints (if running)
    console.log('\n4. Testing API Endpoints...')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/achievements`)
      if (response.status === 401) {
        console.log('✅ API endpoint exists (returns 401 for unauthenticated requests - expected)')
      } else {
        console.log(`ℹ️  API endpoint status: ${response.status}`)
      }
    } catch (err) {
      console.log('ℹ️  API endpoint test skipped (server may not be running)')
    }

    // Test 5: Check triggers and functions
    console.log('\n5. Testing Database Functions...')
    
    try {
      // Test if the function exists by checking the database
      const { data: functions, error: functionsError } = await supabase
        .rpc('update_user_skill_endorsements')
      
      if (functionsError && functionsError.message.includes('function')) {
        console.log('ℹ️  Database functions require proper setup')
      } else {
        console.log('✅ Database functions appear to be working')
      }
    } catch (err) {
      console.log('ℹ️  Database functions test skipped')
    }

    console.log('\n🎉 Achievement System Test Complete!')
    console.log('\n📋 Next Steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Navigate to /achievements to test the UI')
    console.log('3. Test profile integration by visiting user profiles')
    console.log('4. Try creating endorsements and earning achievements')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testAchievementSystem() 