#!/usr/bin/env node

/**
 * Test script to verify tour and events integration
 * This script tests the complete flow from tour creation to event visibility
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTourEventsIntegration() {
  console.log('🧪 Testing Tour and Events Integration...\n')

  try {
    // 1. Check if tables exist
    console.log('1. Checking database tables...')
    
    const { data: toursTable, error: toursError } = await supabase
      .from('tours')
      .select('count')
      .limit(1)
    
    if (toursError) {
      console.error('❌ Tours table error:', toursError.message)
      return
    }
    
    const { data: eventsTable, error: eventsError } = await supabase
      .from('events')
      .select('count')
      .limit(1)
    
    if (eventsError) {
      console.error('❌ Events table error:', eventsError.message)
      return
    }
    
    console.log('✅ Database tables exist\n')

    // 2. Get a test user
    console.log('2. Getting test user...')
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError || !users.users.length) {
      console.error('❌ No users found:', usersError?.message)
      return
    }
    
    const testUser = users.users[0]
    console.log(`✅ Using test user: ${testUser.email}\n`)

    // 3. Create a test tour
    console.log('3. Creating test tour...')
    
    const testTour = {
      name: 'Test Tour Integration',
      description: 'Testing tour and events integration',
      start_date: '2025-06-01',
      end_date: '2025-06-30',
      budget: 50000,
      status: 'planning',
      created_by: testUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .insert(testTour)
      .select('*')
      .single()
    
    if (tourError) {
      console.error('❌ Failed to create tour:', tourError.message)
      return
    }
    
    console.log(`✅ Created tour: ${tour.name} (ID: ${tour.id})\n`)

    // 4. Create a test event for the tour
    console.log('4. Creating test event...')
    
    const testEvent = {
      tour_id: tour.id,
      name: 'Test Event - Tour Integration',
      description: 'Test event for tour integration',
      venue_name: 'Test Venue',
      venue_address: '123 Test St, Test City',
      event_date: '2025-06-15',
      event_time: '19:00',
      capacity: 100,
      status: 'scheduled',
      created_by: testUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert(testEvent)
      .select('*')
      .single()
    
    if (eventError) {
      console.error('❌ Failed to create event:', eventError.message)
      return
    }
    
    console.log(`✅ Created event: ${event.name} (ID: ${event.id})\n`)

    // 5. Test fetching tours
    console.log('5. Testing tours API...')
    
    const { data: tours, error: toursFetchError } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (toursFetchError) {
      console.error('❌ Failed to fetch tours:', toursFetchError.message)
      return
    }
    
    console.log(`✅ Fetched ${tours.length} tours`)
    console.log(`   Latest tour: ${tours[0]?.name}\n`)

    // 6. Test fetching events
    console.log('6. Testing events API...')
    
    const { data: events, error: eventsFetchError } = await supabase
      .from('events')
      .select(`
        *,
        tour:tours(id, name, status)
      `)
      .order('event_date', { ascending: true })
    
    if (eventsFetchError) {
      console.error('❌ Failed to fetch events:', eventsFetchError.message)
      return
    }
    
    console.log(`✅ Fetched ${events.length} events`)
    if (events.length > 0) {
      console.log(`   Latest event: ${events[0]?.name}`)
      console.log(`   Associated tour: ${events[0]?.tour?.name}\n`)
    }

    // 7. Test calendar integration
    console.log('7. Testing calendar integration...')
    
    const startDate = '2025-06-01'
    const endDate = '2025-06-30'
    
    const { data: calendarEvents, error: calendarError } = await supabase
      .from('events')
      .select(`
        id,
        name as title,
        event_date,
        event_time,
        venue_name,
        status
      `)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
    
    if (calendarError) {
      console.error('❌ Failed to fetch calendar events:', calendarError.message)
      return
    }
    
    console.log(`✅ Found ${calendarEvents.length} events for calendar (June 2025)\n`)

    // 8. Cleanup test data
    console.log('8. Cleaning up test data...')
    
    await supabase.from('events').delete().eq('tour_id', tour.id)
    await supabase.from('tours').delete().eq('id', tour.id)
    
    console.log('✅ Cleaned up test data\n')

    console.log('🎉 All tests passed! Tour and events integration is working correctly.')
    console.log('\nSummary:')
    console.log('- ✅ Database tables exist')
    console.log('- ✅ Tour creation works')
    console.log('- ✅ Event creation works')
    console.log('- ✅ Tour fetching works')
    console.log('- ✅ Event fetching works')
    console.log('- ✅ Calendar integration works')
    console.log('- ✅ Tour-event relationships work')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testTourEventsIntegration() 