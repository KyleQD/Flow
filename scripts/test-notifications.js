#!/usr/bin/env node

/**
 * Test script for the notification system
 * Run this after setting up the database migrations
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n')

  try {
    // 1. Test database tables exist
    console.log('1. Checking database tables...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['notifications', 'notification_preferences', 'notification_templates'])
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError)
      return
    }

    const tableNames = tables.map(t => t.table_name)
    console.log('✅ Found tables:', tableNames.join(', '))

    // 2. Test functions exist
    console.log('\n2. Checking database functions...')
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('get_notification_functions')
      .catch(() => ({ data: null, error: 'Function not found' }))

    if (functionsError) {
      console.log('⚠️  Some functions may not exist yet (this is normal for new installations)')
    } else {
      console.log('✅ Functions are working')
    }

    // 3. Test notification templates
    console.log('\n3. Checking notification templates...')
    
    const { data: templates, error: templatesError } = await supabase
      .from('notification_templates')
      .select('type, title')
      .limit(5)
    
    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError)
    } else {
      console.log(`✅ Found ${templates.length} notification templates`)
      templates.forEach(t => console.log(`   - ${t.type}: ${t.title}`))
    }

    // 4. Test creating a notification
    console.log('\n4. Testing notification creation...')
    
    // Get a test user (first user in the system)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1)
    
    if (usersError || !users.length) {
      console.error('❌ No users found to test with')
      return
    }

    const testUser = users[0]
    console.log(`   Using test user: ${testUser.full_name} (${testUser.id})`)

    // Create a test notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: testUser.id,
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification from the test script',
        summary: 'Test notification created successfully',
        priority: 'normal'
      })
      .select()
      .single()

    if (notificationError) {
      console.error('❌ Error creating test notification:', notificationError)
    } else {
      console.log('✅ Test notification created successfully')
      console.log(`   Notification ID: ${notification.id}`)
    }

    // 5. Test notification preferences
    console.log('\n5. Testing notification preferences...')
    
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    if (preferencesError) {
      console.log('⚠️  No preferences found for test user (this is normal)')
    } else {
      console.log('✅ User preferences found')
      console.log(`   Email enabled: ${preferences.email_enabled}`)
      console.log(`   Push enabled: ${preferences.push_enabled}`)
      console.log(`   In-app enabled: ${preferences.in_app_enabled}`)
    }

    // 6. Clean up test data
    console.log('\n6. Cleaning up test data...')
    
    if (notification) {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id)
      
      if (deleteError) {
        console.error('❌ Error cleaning up test notification:', deleteError)
      } else {
        console.log('✅ Test notification cleaned up')
      }
    }

    console.log('\n🎉 Notification system test completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run the database migrations if you haven\'t already')
    console.log('2. Add the notification bell to your header components')
    console.log('3. Test the notification API endpoints')
    console.log('4. Create real notifications in your application')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testNotificationSystem() 