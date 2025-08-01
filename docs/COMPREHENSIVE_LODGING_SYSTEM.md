# Comprehensive Lodging Management System

## Overview

The Comprehensive Lodging Management System is a complete solution for managing hotel bookings, guest assignments, and accommodations for events and tours. It integrates seamlessly with the existing crew/team management system and calendar functionality.

## 🏗️ Architecture

### Database Schema

The system consists of 8 main tables and 2 analytics views:

#### Core Tables

1. **`lodging_providers`** - Hotel, resort, and accommodation providers
2. **`lodging_room_types`** - Room configurations and pricing
3. **`lodging_bookings`** - Main booking records
4. **`lodging_guest_assignments`** - Individual guest assignments to bookings
5. **`lodging_payments`** - Payment tracking and processing
6. **`lodging_calendar_events`** - Calendar integration
7. **`lodging_availability`** - Real-time availability tracking
8. **`lodging_reviews`** - Guest reviews and ratings

#### Analytics Views

1. **`lodging_analytics`** - Revenue, booking metrics, and performance data
2. **`lodging_utilization`** - Room utilization and occupancy rates

### Key Features

#### 🏨 Provider Management
- **Comprehensive Provider Profiles**: Name, type, location, amenities, contact info
- **Room Type Management**: Different room configurations with pricing
- **Amenity Tracking**: WiFi, parking, pool, gym, breakfast, etc.
- **Rating System**: Guest reviews and provider ratings
- **Preferred Vendor System**: Mark and prioritize preferred providers

#### 📅 Booking Management
- **Event/Tour Integration**: Link bookings to specific events or tours
- **Flexible Booking Options**: Multiple rooms, different guest counts
- **Status Tracking**: Pending, confirmed, checked-in, checked-out, cancelled
- **Payment Status**: Track deposits, partial payments, full payments
- **Special Requirements**: Dietary restrictions, accessibility needs
- **Cancellation Policies**: Flexible cancellation terms and deadlines

#### 👥 Guest Assignment System
- **Crew Integration**: Assign crew members to specific bookings
- **Team Member Linking**: Connect to existing staff profiles
- **Guest Types**: Crew, artist, staff, vendor, guest, VIP
- **Room Preferences**: Bed preferences, roommate assignments
- **Check-in/out Tracking**: Real-time status updates
- **Special Requirements**: Individual dietary and accessibility needs

#### 💰 Payment Processing
- **Multiple Payment Methods**: Cash, check, credit card, bank transfer, PayPal
- **Payment Types**: Deposits, partial payments, final payments, refunds
- **Transaction Tracking**: Payment dates, processed by, transaction IDs
- **Status Management**: Pending, completed, failed, refunded

#### 📊 Analytics & Reporting
- **Revenue Analytics**: Monthly, quarterly, yearly revenue tracking
- **Booking Metrics**: Total bookings, unique providers, events, tours
- **Guest Analytics**: Average guests per booking, total guests
- **Utilization Reports**: Room utilization percentages, occupancy rates
- **Performance Metrics**: Provider ratings, booking success rates

#### 🗓️ Calendar Integration
- **Calendar Events**: Automatic calendar event creation for bookings
- **External Calendar Support**: Google Calendar, Outlook integration
- **Reminder System**: Configurable reminder notifications
- **All-day Events**: Support for multi-day bookings
- **Status Synchronization**: Calendar events reflect booking status

## 🚀 Setup Instructions

### 1. Database Migration

Run the lodging system migration:

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/20250131000001_comprehensive_lodging_system.sql
```

This creates all necessary tables, views, indexes, RLS policies, and sample data.

### 2. API Integration

The system provides a comprehensive API at `/api/admin/lodging`:

#### GET Endpoints
- `GET /api/admin/lodging?type=providers` - Fetch lodging providers
- `GET /api/admin/lodging?type=bookings` - Fetch bookings
- `GET /api/admin/lodging?type=guest_assignments` - Fetch guest assignments
- `GET /api/admin/lodging?type=analytics` - Fetch analytics data
- `GET /api/admin/lodging?type=utilization` - Fetch utilization data

#### POST Endpoints
- `POST /api/admin/lodging` with `action=create_provider` - Create provider
- `POST /api/admin/lodging` with `action=create_booking` - Create booking
- `POST /api/admin/lodging` with `action=create_guest_assignment` - Assign guest

#### PUT Endpoints
- `PUT /api/admin/lodging` with `action=update_booking` - Update booking
- `PUT /api/admin/lodging` with `action=update_provider` - Update provider

#### DELETE Endpoints
- `DELETE /api/admin/lodging?action=delete_booking&id={id}` - Delete booking
- `DELETE /api/admin/lodging?action=delete_provider&id={id}` - Delete provider

### 3. Frontend Integration

#### React Hooks

The system provides comprehensive React hooks:

```typescript
import { 
  useLodging, 
  useLodgingBookings, 
  useLodgingProviders, 
  useLodgingAnalytics 
} from '@/hooks/use-lodging'

// Main hook with all functionality
const { 
  bookings, 
  providers, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} = useLodging()

// Specialized hooks
const { bookings, loading, createBooking } = useLodgingBookings()
const { providers, loading, createProvider } = useLodgingProviders()
const { analytics, loading } = useLodgingAnalytics()
```

#### Components

Use the comprehensive lodging management component:

```typescript
import { LodgingManagement } from '@/components/admin/lodging-management'

// In your page
<LodgingManagement eventId="event-123" tourId="tour-456" />
```

## 📋 Usage Examples

### Creating a New Booking

```typescript
const { createBooking } = useLodging()

const newBooking = await createBooking({
  provider_id: "provider-uuid",
  room_type_id: "room-type-uuid",
  check_in_date: "2024-08-14",
  check_out_date: "2024-08-17",
  rooms_booked: 2,
  total_guests: 4,
  primary_guest_name: "John Smith",
  primary_guest_email: "john@example.com",
  rate_per_night: 250.00,
  event_id: "event-uuid"
})
```

### Assigning Guests to Bookings

```typescript
const { createGuestAssignment } = useLodging()

const assignment = await createGuestAssignment({
  booking_id: "booking-uuid",
  guest_name: "Sarah Johnson",
  guest_type: "crew",
  crew_member_id: "crew-member-uuid",
  room_number: "301",
  bed_preference: "King",
  dietary_restrictions: ["vegetarian"],
  accessibility_needs: ["wheelchair_accessible"]
})
```

### Fetching Analytics

```typescript
const { analytics } = useLodgingAnalytics()

// Analytics data includes:
// - Total revenue
// - Booking counts
// - Guest metrics
// - Provider performance
// - Utilization rates
```

## 🔧 Configuration

### Environment Variables

No additional environment variables required - uses existing Supabase configuration.

### Permissions

The system uses Row Level Security (RLS) with the following policies:

- **View Access**: All authenticated users can view lodging data
- **Admin Access**: Only admin users can create, update, and delete records
- **Provider Management**: Admin users can manage provider information
- **Booking Management**: Admin users can manage all booking operations

### Customization

#### Adding New Provider Types

```sql
-- Add new provider type to enum
ALTER TYPE lodging_provider_type ADD VALUE 'boutique_hotel';
```

#### Custom Amenities

```sql
-- Add custom amenities to provider
UPDATE lodging_providers 
SET amenities = array_append(amenities, 'custom_amenity')
WHERE id = 'provider-uuid';
```

#### Custom Guest Types

```sql
-- Add new guest type to enum
ALTER TYPE lodging_guest_type ADD VALUE 'contractor';
```

## 📊 Analytics & Reporting

### Key Metrics

1. **Revenue Analytics**
   - Monthly/quarterly/yearly revenue
   - Average booking value
   - Revenue per provider
   - Payment status breakdown

2. **Booking Analytics**
   - Total bookings by status
   - Booking trends over time
   - Event/tour booking distribution
   - Cancellation rates

3. **Guest Analytics**
   - Total guests accommodated
   - Average guests per booking
   - Guest type distribution
   - Special requirements tracking

4. **Utilization Analytics**
   - Room utilization percentages
   - Provider occupancy rates
   - Peak booking periods
   - Availability trends

### Sample Queries

```sql
-- Monthly revenue by provider
SELECT 
  lp.name as provider_name,
  DATE_TRUNC('month', lb.check_in_date) as month,
  SUM(lb.total_amount) as revenue
FROM lodging_bookings lb
JOIN lodging_providers lp ON lb.provider_id = lp.id
GROUP BY lp.name, DATE_TRUNC('month', lb.check_in_date)
ORDER BY month DESC, revenue DESC;

-- Guest type distribution
SELECT 
  lga.guest_type,
  COUNT(*) as guest_count
FROM lodging_guest_assignments lga
GROUP BY lga.guest_type
ORDER BY guest_count DESC;

-- Provider performance
SELECT 
  lp.name,
  lp.rating,
  COUNT(lb.id) as total_bookings,
  AVG(lb.total_amount) as avg_booking_value
FROM lodging_providers lp
LEFT JOIN lodging_bookings lb ON lp.id = lb.provider_id
GROUP BY lp.id, lp.name, lp.rating
ORDER BY lp.rating DESC;
```

## 🔄 Integration Points

### Calendar Integration

The system automatically creates calendar events for bookings:

```typescript
// Calendar events are created automatically when bookings are confirmed
const calendarEvent = {
  booking_id: "booking-uuid",
  title: "Hotel Check-in: Luxury Hotel & Spa",
  start_time: "2024-08-14T15:00:00Z",
  end_time: "2024-08-17T11:00:00Z",
  calendar_type: "lodging",
  reminder_minutes: [1440] // 24 hours
}
```

### Crew/Team Integration

Guest assignments link to existing crew and team members:

```typescript
// Link to existing crew member
const assignment = {
  booking_id: "booking-uuid",
  guest_name: "Mike Johnson",
  guest_type: "crew",
  crew_member_id: "existing-crew-member-uuid"
}

// Link to existing team member
const assignment = {
  booking_id: "booking-uuid",
  guest_name: "Sarah Wilson",
  guest_type: "staff",
  team_member_id: "existing-team-member-uuid"
}
```

### Event/Tour Integration

Bookings can be linked to specific events or tours:

```typescript
// Event-specific booking
const eventBooking = {
  event_id: "event-uuid",
  provider_id: "provider-uuid",
  // ... other booking details
}

// Tour-specific booking
const tourBooking = {
  tour_id: "tour-uuid",
  provider_id: "provider-uuid",
  // ... other booking details
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Missing Tables Error**
   - Ensure the migration has been run successfully
   - Check Supabase dashboard for migration status

2. **Permission Errors**
   - Verify user has admin permissions
   - Check RLS policies are properly configured

3. **Data Not Loading**
   - Check API endpoint responses
   - Verify authentication is working
   - Check for missing required fields

### Debug Commands

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'lodging_%';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename LIKE 'lodging_%';

-- Check sample data
SELECT COUNT(*) FROM lodging_providers;
SELECT COUNT(*) FROM lodging_bookings;
```

## 🚀 Future Enhancements

### Planned Features

1. **Advanced Calendar Integration**
   - Google Calendar sync
   - Outlook integration
   - Calendar conflict detection

2. **Payment Processing**
   - Stripe integration
   - PayPal integration
   - Automated payment reminders

3. **Mobile App Support**
   - Mobile check-in/out
   - QR code scanning
   - Push notifications

4. **Advanced Analytics**
   - Predictive booking trends
   - Revenue forecasting
   - Occupancy optimization

5. **Vendor Portal**
   - Provider self-service
   - Real-time availability updates
   - Direct booking capabilities

### API Extensions

```typescript
// Future API endpoints
GET /api/admin/lodging/calendar/sync
POST /api/admin/lodging/payments/process
GET /api/admin/lodging/analytics/forecast
POST /api/admin/lodging/notifications/send
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hook Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)

## 🤝 Support

For questions or issues with the lodging management system:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check the database migration logs
4. Contact the development team

---

**Last Updated**: January 31, 2025  
**Version**: 1.0.0  
**Compatibility**: Next.js 15, Supabase, TypeScript 