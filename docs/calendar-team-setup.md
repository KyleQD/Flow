# Calendar Team Members Setup

## Overview

The enhanced schedule planner now supports adding real team members and crew to calendar events. This feature fetches actual crew members and team members from your venue's database instead of using dummy data.

## Database Tables

The system uses two main tables for team members:

### 1. `venue_crew_members`
- Event-specific technical crew (sound engineers, lighting techs, etc.)
- Specialized skills and certifications
- Hourly/daily rates
- Availability status

### 2. `venue_team_members`
- Full-time and part-time staff
- Administrative and management roles
- Employment types and permissions

## Setup Instructions

### 1. Add Sample Crew Members

To test the calendar team selection feature, run the sample data script:

```sql
-- Run this in your Supabase SQL editor
-- File: scripts/add-sample-crew-members.sql
```

This will add sample crew members and team members to your venue.

### 2. Verify Database Tables

Ensure these tables exist in your database:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('venue_crew_members', 'venue_team_members');
```

### 3. API Endpoints

The system uses these API endpoints:

- `GET /api/admin/team-members` - Fetches available team members
- `POST /api/admin/calendar` - Creates events with team assignments

## Features

### Team Member Selection
- **Real-time search** through team members
- **Role-based filtering** (crew vs staff)
- **Availability status** checking
- **Contact information** display

### Notifications
- **Email notifications** to selected team members
- **Calendar invitations** for external calendars
- **In-app notifications** for platform users

### Reminders
- **Configurable reminder times** (5min, 15min, 30min, 1hour, 1day)
- **Multiple reminder options** per event
- **Automated notification system**

## Troubleshooting

### No Team Members Showing
1. Check if you have a venue profile created
2. Verify crew members are marked as `is_available = true`
3. Ensure team members have `status = 'active'`
4. Check browser console for API errors

### Missing Avatars
- The system gracefully handles missing avatar images
- Falls back to initials with gradient background
- Only loads external URLs (http/https)

### API Errors
- Check authentication status
- Verify admin permissions
- Review database connection
- Check RLS policies

## Adding Real Team Members

### Via Admin Dashboard
1. Navigate to Staff Management
2. Add new crew members or team members
3. Set appropriate roles and permissions
4. Mark as available/active

### Via Database
```sql
-- Add a crew member
INSERT INTO venue_crew_members (
  venue_id,
  name,
  email,
  specialty,
  rate,
  is_available
) VALUES (
  'your-venue-id',
  'John Doe',
  'john@venue.com',
  'Sound Engineer',
  150.00,
  true
);

-- Add a team member
INSERT INTO venue_team_members (
  venue_id,
  name,
  email,
  role,
  status
) VALUES (
  'your-venue-id',
  'Jane Smith',
  'jane@venue.com',
  'Event Coordinator',
  'active'
);
```

## Security

- **Row Level Security (RLS)** ensures users only see their venue's team members
- **Admin permissions** required for calendar management
- **Audit trails** for team assignments and notifications 