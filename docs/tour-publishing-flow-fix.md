# Tour Publishing Flow Fix

## Problem Description

When users clicked "Publish Tour" in the tour planner, it was not:
1. Actually publishing the tour to the database
2. Redirecting users to the tours tab
3. Showing the newly created tour on the tours page
4. Displaying events on the events tab
5. Showing events on the dashboard calendar

## Root Causes Identified

1. **Tour planner "Publish Tour" button was non-functional**: The button only logged to console instead of calling the API
2. **Database schema inconsistencies**: Multiple conflicting table definitions with different column names
3. **API column name mismatches**: APIs were using `artist_id` instead of `user_id`
4. **Missing redirect logic**: No proper navigation after successful publication
5. **No success feedback**: Users had no confirmation that their tour was published

## Fixes Implemented

### 1. Fixed Tour Planner Publishing (`app/admin/dashboard/tours/planner/page.tsx`)

**Before:**
```typescript
<Button
  onClick={() => console.log("Publish tour", tourData)}
  className="bg-green-600 hover:bg-green-700 text-white"
>
  <Rocket className="w-4 h-4 mr-2" />
  Publish Tour
</Button>
```

**After:**
```typescript
const handlePublishTour = async () => {
  if (!isStepComplete(7)) {
    toast({
      title: "Cannot Publish",
      description: "Please complete all required fields before publishing.",
      variant: "destructive",
    })
    return
  }

  setIsPublishing(true)
  
  try {
    // Transform tour data to match API schema
    const apiData = {
      step1: { /* tour initiation data */ },
      step2: { /* routing and dates */ },
      step3: { /* events */ },
      step4: { /* artists and crew */ },
      step5: { /* logistics */ },
      step6: { /* ticketing and financials */ }
    }

    const response = await fetch('/api/tours/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to publish tour')
    }

    toast({
      title: "🚀 Tour Published Successfully!",
      description: `"${tourData.name}" is now live and ready to go!`,
    })

    // Redirect to tours page after successful publication
    router.push('/admin/dashboard/tours?published=true')

  } catch (error) {
    toast({
      title: "Publishing Failed",
      description: error instanceof Error ? error.message : "Failed to publish tour. Please try again.",
      variant: "destructive",
    })
  } finally {
    setIsPublishing(false)
  }
}
```

### 2. Fixed Database Schema (`scripts/clean-setup-tour-events.sql`)

Created a clean setup script that:
- Drops existing conflicting tables
- Creates tables with correct column names (`user_id` instead of `artist_id`)
- Sets up proper foreign key relationships
- Enables Row Level Security (RLS)
- Creates performance indexes
- Adds automatic timestamps

### 3. Fixed Tour Planner API (`app/api/tours/planner/route.ts`)

**Updated column references:**
```typescript
// Before
artist_id: validatedData.step1.mainArtist,

// After  
user_id: user.id, // Use user_id instead of artist_id
```

**Fixed team members creation:**
```typescript
// Before
user_id: validatedData.step1.mainArtist,

// After
user_id: user.id, // Use the current user's ID
```

### 4. Fixed Tours API (`app/api/tours/route.ts`)

**Updated column references:**
```typescript
// Before
artist_id: z.string().uuid('Invalid artist ID').optional(),

// After
user_id: user.id, // Use user_id instead of artist_id
```

### 5. Fixed Events API (`app/api/events/route.ts`)

**Updated foreign key references:**
```typescript
// Before
.eq('tours.artist_id', user.id)

// After
.eq('tours.user_id', user.id) // Use user_id instead of artist_id
```

### 6. Added Success Feedback (`app/admin/dashboard/tours/page.tsx`)

**Added success message handling:**
```typescript
// Check for success message from tour planner
useEffect(() => {
  const published = searchParams.get('published')
  if (published === 'true') {
    toast({
      title: "🎉 Tour Published Successfully!",
      description: "Your tour is now live and ready to go!",
    })
    // Clean up the URL
    router.replace('/admin/dashboard/tours')
  }
}, [searchParams, router])
```

## Complete Flow

### 1. User Journey
1. **Navigate to tour planner**: `/admin/dashboard/tours/planner`
2. **Complete all steps**: Tour initiation → Routing → Events → Team → Logistics → Financials → Review
3. **Click "Publish Tour"**: Button now actually publishes the tour
4. **See success message**: Toast notification confirms publication
5. **Redirect to tours page**: Automatically navigates to `/admin/dashboard/tours?published=true`
6. **View published tour**: Tour appears in the tours list with success message

### 2. Data Flow
1. **Tour Creation**: Tour planner API creates tour in `tours` table
2. **Event Creation**: API creates events in `events` table linked to tour
3. **Team Creation**: API creates team members in `tour_team_members` table
4. **Expense Creation**: API creates expenses in `event_expenses` table
5. **Data Display**: Tours and events APIs fetch and display the data

### 3. Database Relationships
```
tours (user_id) ←→ auth.users (id)
events (tour_id) ←→ tours (id)
events (created_by) ←→ auth.users (id)
tour_team_members (tour_id) ←→ tours (id)
tour_team_members (user_id) ←→ auth.users (id)
event_expenses (tour_id) ←→ tours (id)
event_expenses (event_id) ←→ events (id)
```

## Testing

### 1. Setup Database
```sql
-- Run the clean setup script
-- Copy and paste scripts/clean-setup-tour-events.sql into Supabase SQL Editor
```

### 2. Test the Flow
```bash
# Run the test script
node scripts/test-tour-publishing-flow.js
```

### 3. Manual Testing
1. **Create a tour**: Go to `/admin/dashboard/tours/planner`
2. **Fill out all steps**: Complete the tour planning process
3. **Publish tour**: Click "Publish Tour" button
4. **Verify redirect**: Should redirect to tours page with success message
5. **Check tours page**: Tour should appear in the list
6. **Check events page**: Events should appear in the events tab
7. **Check calendar**: Events should appear on dashboard calendar

## Files Modified

### Core Files
- `app/admin/dashboard/tours/planner/page.tsx` - Fixed publish functionality
- `app/api/tours/planner/route.ts` - Fixed API column references
- `app/api/tours/route.ts` - Fixed column references
- `app/api/events/route.ts` - Fixed foreign key references
- `app/admin/dashboard/tours/page.tsx` - Added success message handling

### Database Files
- `scripts/clean-setup-tour-events.sql` - Clean database setup
- `scripts/test-tour-publishing-flow.js` - Test script

### Documentation
- `docs/tour-publishing-flow-fix.md` - This documentation

## Success Criteria

✅ **Tour publishing works**: Clicking "Publish Tour" actually creates the tour
✅ **Redirect works**: Users are redirected to tours page after publication
✅ **Success feedback**: Users see confirmation that tour was published
✅ **Tour appears**: Newly created tour shows up on tours page
✅ **Events appear**: Tour events show up on events tab
✅ **Calendar integration**: Events appear on dashboard calendar
✅ **Database consistency**: All tables use correct column names and relationships

## Troubleshooting

### If tour doesn't publish:
1. Check browser console for API errors
2. Verify database tables exist and have correct schema
3. Check user authentication and permissions
4. Ensure all required fields are completed

### If tour doesn't appear on tours page:
1. Check tours API response in browser network tab
2. Verify RLS policies allow user to view their tours
3. Check if tour was actually created in database

### If events don't appear:
1. Check events API response
2. Verify tour_id relationships are correct
3. Check if events were created during tour publishing

### If calendar doesn't show events:
1. Check calendar API response
2. Verify event dates are in the future
3. Check if events have proper tour relationships 