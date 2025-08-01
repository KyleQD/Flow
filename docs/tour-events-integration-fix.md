# Tour and Events Integration Fix

## Problem Description

After creating and publishing a new tour, it was not appearing on:
1. The tours page
2. The events tab
3. The dashboard calendar

## Root Causes Identified

1. **Events API returning empty arrays**: The `/api/events/route.ts` was hardcoded to return empty arrays instead of fetching actual events from the database.

2. **Tour creation not creating events**: When tours were created via the basic tour creation form, they weren't automatically creating associated events that should be visible on the events tab.

3. **Database schema inconsistencies**: Multiple different event table schemas existed (`events`, `artist_events`, `tour_events`) causing confusion.

## Fixes Implemented

### 1. Fixed Events API (`app/api/events/route.ts`)

**Before:**
```typescript
// Always return empty events array with proper structure for now
console.log('[Events API] Returning empty events array to ensure dashboard loads')
const emptyEventsResponse = { events: [] }
return NextResponse.json(emptyEventsResponse)
```

**After:**
```typescript
// Build query to fetch events with tour information
let query = supabase
  .from('events')
  .select(`
    *,
    tour:tours(id, name, status, start_date, end_date)
  `)
  .order('event_date', { ascending: true })
  .range(offset, offset + limit - 1)

// Transform events to include computed fields
const eventsWithStats = events?.map((event: any) => {
  const ticketSalesPercentage = event.capacity > 0 ? (event.tickets_sold / event.capacity) * 100 : 0
  const profit = (event.actual_revenue || 0) - (event.expenses || 0)
  
  return {
    ...event,
    ticket_sales_percentage: ticketSalesPercentage,
    profit,
    venue: {
      name: event.venue_name,
      address: event.venue_address,
      contact: {
        name: event.venue_contact_name,
        email: event.venue_contact_email,
        phone: event.venue_contact_phone
      }
    }
  }
}) || []
```

### 2. Enhanced Tour Creation (`app/api/tours/route.ts`)

**Added automatic event creation:**
```typescript
// Create a default event for the tour so it appears on the events tab and calendar
const defaultEvent = {
  tour_id: tour.id,
  name: `${tour.name} - Tour Event`,
  description: `Default event for ${tour.name}`,
  venue_name: 'TBD',
  event_date: validatedData.start_date,
  event_time: '19:00',
  capacity: 0,
  status: 'scheduled',
  created_by: user.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const { data: event, error: eventError } = await supabase
  .from('events')
  .insert(defaultEvent)
  .select('*')
  .single()

// Update tour with total_shows count
await supabase
  .from('tours')
  .update({ total_shows: 1 })
  .eq('id', tour.id)
```

### 3. Database Schema Setup (`scripts/setup-tour-events-tables.sql`)

Created a comprehensive SQL script to ensure proper table structure with:
- Tours table with all required fields
- Events table with tour relationships
- Tour team members table
- Event expenses table
- Proper indexes for performance
- Row Level Security (RLS) policies
- Triggers for updated_at timestamps

### 4. Test Script (`scripts/test-tour-events-integration.js`)

Created a comprehensive test script to verify:
- Database tables exist
- Tour creation works
- Event creation works
- Tour fetching works
- Event fetching works
- Calendar integration works
- Tour-event relationships work

## How to Test the Fix

### 1. Setup Database Tables

Run the setup script in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of scripts/setup-tour-events-tables.sql
```

### 2. Test the Integration

Run the test script:
```bash
node scripts/test-tour-events-integration.js
```

### 3. Manual Testing

1. **Create a new tour:**
   - Go to `/admin/dashboard/tours`
   - Click "+ Create Tour"
   - Fill out the form and submit
   - Verify the tour appears in the tours list

2. **Check events tab:**
   - Go to `/admin/dashboard/events`
   - Verify the tour's default event appears in the events list

3. **Check dashboard calendar:**
   - Go to `/admin/dashboard`
   - Look at the calendar view
   - Verify the tour and its events appear on the calendar

4. **Test tour planner:**
   - Go to `/admin/dashboard/tours/planner`
   - Create a tour with multiple events
   - Verify all events appear on the events tab and calendar

## Expected Behavior After Fix

1. **Tour Creation:**
   - When a tour is created, it immediately appears on the tours page
   - A default event is automatically created for the tour
   - The tour's total_shows count is updated

2. **Events Tab:**
   - All events (including those from tours) are visible
   - Events show their associated tour information
   - Events can be filtered by status and searched

3. **Dashboard Calendar:**
   - Both tours and individual events appear on the calendar
   - Tours show as date ranges
   - Events show as specific time slots
   - Color coding distinguishes between tours and events

4. **Data Relationships:**
   - Events are properly linked to tours via `tour_id`
   - Tour statistics are calculated from associated events
   - Calendar events include both tour and event data

## Files Modified

- `app/api/events/route.ts` - Fixed events API to fetch real data
- `app/api/tours/route.ts` - Added automatic event creation
- `scripts/setup-tour-events-tables.sql` - Database setup script
- `scripts/test-tour-events-integration.js` - Test script
- `docs/tour-events-integration-fix.md` - This documentation

## Database Schema

### Tours Table
```sql
CREATE TABLE tours (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    total_shows INTEGER DEFAULT 0,
    completed_shows INTEGER DEFAULT 0,
    budget DECIMAL(12,2) DEFAULT 0,
    expenses DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    transportation VARCHAR(255),
    accommodation VARCHAR(255),
    equipment_requirements TEXT,
    crew_size INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);
```

### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    venue_name VARCHAR(255),
    venue_address TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    doors_open TIME,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled',
    capacity INTEGER DEFAULT 0,
    tickets_sold INTEGER DEFAULT 0,
    ticket_price DECIMAL(10,2),
    vip_price DECIMAL(10,2),
    expected_revenue DECIMAL(12,2) DEFAULT 0,
    actual_revenue DECIMAL(12,2) DEFAULT 0,
    expenses DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);
```

## Troubleshooting

### If tours still don't appear:
1. Check browser console for API errors
2. Verify database tables exist and have data
3. Check RLS policies are not blocking access
4. Ensure user has proper permissions

### If events don't appear:
1. Check if events table has data
2. Verify tour_id relationships are correct
3. Check events API response in browser network tab
4. Ensure events are within the date range being queried

### If calendar doesn't show events:
1. Check admin calendar API response
2. Verify date formatting in calendar queries
3. Check if events have valid event_date values
4. Ensure calendar component is receiving data properly 