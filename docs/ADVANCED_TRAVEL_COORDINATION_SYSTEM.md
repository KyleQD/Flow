# Advanced Travel Coordination System

## Overview

The Advanced Travel Coordination System is a comprehensive solution designed to manage large-scale travel logistics for events and tours involving 100+ people. It provides logical categorization, automated coordination, and streamlined management across flights, hotels, and ground transportation.

## Key Features

### 🎯 **Logical Group Management**
- **Travel Groups**: Categorize travelers by role (crew, artists, staff, vendors, guests, VIP, media, security, catering, technical, management)
- **Department Organization**: Group by specific departments or teams
- **Priority Levels**: 5-tier priority system (1=Critical, 5=Optional)
- **Group Leaders**: Assign group leaders and backup contacts

### 🚀 **Automated Coordination**
- **Auto-Coordination**: One-click setup for flights, hotels, and transportation
- **Smart Grouping**: Automatically group travelers by arrival time and location
- **Capacity Optimization**: Optimize vehicle and room assignments
- **Timeline Management**: Master timeline view of all travel events

### 📊 **Comprehensive Analytics**
- **Coordination Metrics**: Track completion rates and success metrics
- **Utilization Analysis**: Monitor resource utilization across groups
- **Cost Tracking**: Track expenses across flights, hotels, and transportation
- **Performance Insights**: Real-time coordination status and bottlenecks

### 🔄 **Real-time Integration**
- **Calendar Integration**: Sync with event calendars and timelines
- **Team Management**: Link with existing staff and crew systems
- **Lodging Integration**: Connect with comprehensive lodging management
- **Transportation Coordination**: Ground transport and airport transfers

## Database Schema

### Core Tables

#### `travel_groups`
Logical categorization of travelers with coordination status tracking.

```sql
CREATE TABLE travel_groups (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL, -- crew, artists, staff, vendors, guests, vip, media, security, catering, technical, management
  department TEXT,
  priority_level INTEGER DEFAULT 3,
  arrival_date DATE,
  departure_date DATE,
  total_members INTEGER DEFAULT 0,
  confirmed_members INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning',
  coordination_status TEXT DEFAULT 'pending',
  -- ... additional fields
);
```

#### `travel_group_members`
Individual assignments to travel groups with preferences and requirements.

```sql
CREATE TABLE travel_group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES travel_groups(id),
  member_name TEXT NOT NULL,
  member_email TEXT,
  member_role TEXT,
  seat_preference TEXT,
  meal_preference TEXT,
  special_assistance BOOLEAN DEFAULT FALSE,
  wheelchair_required BOOLEAN DEFAULT FALSE,
  -- ... additional fields
);
```

#### `flight_coordination`
Enhanced flight management with group coordination.

```sql
CREATE TABLE flight_coordination (
  id UUID PRIMARY KEY,
  flight_number TEXT NOT NULL,
  airline TEXT NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  group_id UUID REFERENCES travel_groups(id),
  is_group_flight BOOLEAN DEFAULT FALSE,
  total_seats INTEGER,
  booked_seats INTEGER DEFAULT 0,
  -- ... additional fields
);
```

#### `ground_transportation_coordination`
Ground transportation management with passenger assignments.

```sql
CREATE TABLE ground_transportation_coordination (
  id UUID PRIMARY KEY,
  transport_type TEXT NOT NULL, -- shuttle_bus, limo, van, car, train, subway, walking
  provider_name TEXT,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_time TIMESTAMPTZ NOT NULL,
  vehicle_capacity INTEGER,
  assigned_passengers INTEGER DEFAULT 0,
  group_id UUID REFERENCES travel_groups(id),
  -- ... additional fields
);
```

#### `hotel_room_assignments`
Room assignments linked to lodging bookings and travel groups.

```sql
CREATE TABLE hotel_room_assignments (
  id UUID PRIMARY KEY,
  lodging_booking_id UUID REFERENCES lodging_bookings(id),
  group_member_id UUID REFERENCES travel_group_members(id),
  room_number TEXT,
  room_type TEXT,
  roommate_preference TEXT,
  accessibility_required BOOLEAN DEFAULT FALSE,
  -- ... additional fields
);
```

### Analytics Views

#### `travel_coordination_analytics`
Comprehensive analytics across all travel coordination data.

```sql
CREATE VIEW travel_coordination_analytics AS
SELECT 
  DATE_TRUNC('day', tg.arrival_date) as date,
  COUNT(DISTINCT tg.id) as total_groups,
  COUNT(DISTINCT tgm.id) as total_travelers,
  COUNT(DISTINCT CASE WHEN tg.coordination_status = 'complete' THEN tg.id END) as fully_coordinated_groups,
  COUNT(DISTINCT fc.id) as total_flights,
  COUNT(DISTINCT gtc.id) as total_transport_runs,
  COALESCE(SUM(fc.total_cost), 0) as total_flight_cost,
  COALESCE(SUM(gtc.total_cost), 0) as total_transport_cost,
  -- ... additional metrics
FROM travel_groups tg
LEFT JOIN travel_group_members tgm ON tg.id = tgm.group_id
LEFT JOIN flight_coordination fc ON tg.id = fc.group_id
LEFT JOIN ground_transportation_coordination gtc ON tg.id = gtc.group_id
GROUP BY DATE_TRUNC('day', tg.arrival_date);
```

#### `travel_group_utilization`
Group-specific utilization and efficiency metrics.

```sql
CREATE VIEW travel_group_utilization AS
SELECT 
  tg.id as group_id,
  tg.name as group_name,
  tg.group_type,
  tg.total_members,
  COUNT(DISTINCT fc.id) as total_flights,
  COUNT(DISTINCT fpa.id) as flight_passengers,
  COUNT(DISTINCT gtc.id) as total_transport_runs,
  COUNT(DISTINCT tpa.id) as transport_passengers,
  -- ... utilization percentages and costs
FROM travel_groups tg
LEFT JOIN flight_coordination fc ON tg.id = fc.group_id
LEFT JOIN flight_passenger_assignments fpa ON fc.id = fpa.flight_id
LEFT JOIN ground_transportation_coordination gtc ON tg.id = gtc.group_id
LEFT JOIN transportation_passenger_assignments tpa ON gtc.id = tpa.transportation_id
GROUP BY tg.id, tg.name, tg.group_type, tg.total_members;
```

## API Integration

### Travel Coordination API

#### Endpoints

```typescript
// GET /api/admin/travel-coordination
// Fetch travel coordination data by type
GET /api/admin/travel-coordination?type=groups&status=confirmed&group_type=crew

// POST /api/admin/travel-coordination
// Create travel groups, members, flights, transportation
POST /api/admin/travel-coordination
{
  "action": "create_travel_group",
  "name": "Main Stage Crew",
  "group_type": "crew",
  "department": "Technical",
  "priority_level": 1,
  "arrival_date": "2024-08-14",
  "departure_date": "2024-08-17"
}

// PUT /api/admin/travel-coordination
// Update travel coordination entities
PUT /api/admin/travel-coordination
{
  "action": "update_travel_group",
  "id": "group-uuid",
  "status": "confirmed"
}

// DELETE /api/admin/travel-coordination
// Delete travel coordination entities
DELETE /api/admin/travel-coordination?action=delete_travel_group&id=group-uuid
```

#### Special Actions

```typescript
// Bulk create group members
POST /api/admin/travel-coordination
{
  "action": "bulk_create_group_members",
  "group_id": "group-uuid",
  "members": [
    {
      "name": "John Smith",
      "email": "john@example.com",
      "role": "Sound Engineer",
      "seat_preference": "window"
    }
  ]
}

// Auto-coordinate group
POST /api/admin/travel-coordination
{
  "action": "auto_coordinate_group",
  "group_id": "group-uuid"
}
```

## React Hooks

### Main Hook

```typescript
import { useTravelCoordination } from '@/hooks/use-travel-coordination'

function TravelComponent() {
  const {
    // Data
    groups,
    groupMembers,
    flights,
    transportation,
    analytics,
    utilization,
    
    // Loading states
    groupsLoading,
    analyticsLoading,
    
    // Fetch functions
    fetchGroups,
    fetchAnalytics,
    
    // CRUD functions
    createTravelGroup,
    updateTravelGroup,
    deleteTravelGroup,
    bulkCreateGroupMembers,
    autoCoordinateGroup
  } = useTravelCoordination()

  // Use the data and functions
}
```

### Specialized Hooks

```typescript
import { 
  useTravelGroups, 
  useTravelAnalytics, 
  useTravelUtilization 
} from '@/hooks/use-travel-coordination'

// Use specific data types
const { groups, loading, createTravelGroup } = useTravelGroups()
const { analytics, loading } = useTravelAnalytics()
const { utilization, loading } = useTravelUtilization()
```

## Component Integration

### Travel Coordination Hub

The main component for managing travel coordination:

```typescript
import { TravelCoordinationHub } from '@/components/admin/travel-coordination-hub'

function LogisticsPage() {
  return (
    <TabsContent value="accommodations">
      <TravelCoordinationHub 
        eventId={selectedEvent} 
        tourId={selectedTour} 
      />
    </TabsContent>
  )
}
```

### Features

- **Overview Tab**: Summary metrics and recent activity
- **Travel Groups Tab**: Manage groups with expandable member details
- **Coordination Tab**: Flight, transportation, and hotel coordination
- **Timeline Tab**: Master timeline view (coming soon)

## Usage Examples

### Creating a Travel Group

```typescript
const handleCreateGroup = async () => {
  try {
    await createTravelGroup({
      name: "Main Stage Crew",
      description: "Technical crew for main stage operations",
      group_type: "crew",
      department: "Technical",
      priority_level: 1,
      arrival_date: "2024-08-14",
      departure_date: "2024-08-17",
      arrival_location: "JFK Airport",
      departure_location: "JFK Airport",
      special_requirements: ["Late night setup", "Technical equipment"],
      dietary_restrictions: ["Vegetarian", "Gluten-free"],
      accessibility_needs: ["Wheelchair access"]
    })
  } catch (error) {
    console.error("Error creating group:", error)
  }
}
```

### Bulk Adding Members

```typescript
const handleBulkAddMembers = async () => {
  const members = [
    {
      name: "John Smith",
      email: "john@example.com",
      phone: "+1234567890",
      role: "Sound Engineer",
      seat_preference: "window",
      meal_preference: "vegetarian",
      special_assistance: false
    },
    {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1234567891",
      role: "Lighting Tech",
      seat_preference: "aisle",
      meal_preference: "vegan",
      special_assistance: true
    }
  ]

  await bulkCreateGroupMembers(groupId, members)
}
```

### Auto-Coordinating a Group

```typescript
const handleAutoCoordinate = async (groupId: string) => {
  try {
    await autoCoordinateGroup(groupId)
    // This will automatically:
    // 1. Create flight coordination for the group
    // 2. Assign all members to flights
    // 3. Create ground transportation
    // 4. Assign members to transportation
    // 5. Link with existing hotel bookings
    // 6. Update coordination status
  } catch (error) {
    console.error("Error auto-coordinating:", error)
  }
}
```

## Configuration

### Environment Variables

```env
# Required for API access
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

1. Run the migration:
```sql
-- Run the advanced travel coordination migration
\i supabase/migrations/20250131000002_advanced_travel_coordination.sql
```

2. Verify tables and views:
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'travel_%' OR table_name LIKE '%coordination%';

-- Check views
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE '%travel%' OR viewname LIKE '%coordination%';
```

## Analytics and Reporting

### Key Metrics

- **Coordination Completion Rate**: Percentage of fully coordinated groups
- **Arrival Success Rate**: Percentage of groups that arrived successfully
- **Resource Utilization**: Flight, transportation, and hotel utilization percentages
- **Cost Analysis**: Total travel costs and cost per traveler
- **Efficiency Metrics**: Time from booking to coordination completion

### Dashboard Integration

The system integrates with the main logistics dashboard:

```typescript
// In logistics page
const metrics = calculateStatusMetrics()
// Returns:
{
  travelCoordination: {
    percentage: 85,
    items: 8, // total groups
    completed: 7, // fully coordinated groups
    status: "In Progress",
    travelers: 156 // total travelers across all groups
  }
}
```

## Best Practices

### Group Organization

1. **Logical Categorization**: Use appropriate group types (crew, artists, staff, etc.)
2. **Priority Assignment**: Assign priority levels based on event criticality
3. **Department Grouping**: Group by departments for easier management
4. **Size Considerations**: Keep groups manageable (20-30 people max per group)

### Coordination Workflow

1. **Create Groups First**: Set up travel groups before adding members
2. **Bulk Member Addition**: Use bulk import for large groups
3. **Auto-Coordination**: Use auto-coordination for standard setups
4. **Manual Refinement**: Fine-tune assignments after auto-coordination
5. **Status Tracking**: Monitor coordination status throughout the process

### Performance Optimization

1. **Indexed Queries**: All queries use proper indexes for performance
2. **Pagination**: API supports pagination for large datasets
3. **Real-time Updates**: Use WebSocket connections for live updates
4. **Caching**: Implement caching for frequently accessed data

## Troubleshooting

### Common Issues

1. **Missing Tables**: Run the migration if tables don't exist
2. **Permission Errors**: Ensure admin permissions are set correctly
3. **Data Sync Issues**: Check event/tour ID associations
4. **Performance Issues**: Monitor query performance with large datasets

### Error Handling

The system includes comprehensive error handling:

```typescript
// Graceful fallback for missing tables
if (error.code === '42P01') {
  return {
    data: [],
    message: 'Travel coordination tables not found. Please run the migration first.'
  }
}
```

## Future Enhancements

### Planned Features

1. **Timeline View**: Master timeline of all travel events
2. **Real-time Tracking**: Live tracking of flights and transportation
3. **Automated Notifications**: Email/SMS notifications for status changes
4. **Mobile App**: Native mobile app for on-the-go coordination
5. **AI Optimization**: AI-powered route and assignment optimization
6. **Integration APIs**: Third-party travel booking system integration

### Scalability Considerations

1. **Database Partitioning**: Partition large tables by date/event
2. **Microservices**: Split into separate microservices for different domains
3. **CDN Integration**: Use CDN for static travel documents
4. **Queue Processing**: Implement background job processing for large operations

## Support and Maintenance

### Regular Maintenance

1. **Database Cleanup**: Archive old travel data periodically
2. **Index Optimization**: Monitor and optimize database indexes
3. **Performance Monitoring**: Track API response times and usage
4. **Backup Verification**: Ensure travel data is included in backups

### Monitoring

- **API Health**: Monitor `/api/admin/travel-coordination` endpoint health
- **Database Performance**: Track query performance and slow queries
- **Error Rates**: Monitor error rates and failed operations
- **Usage Metrics**: Track system usage and user adoption

---

This advanced travel coordination system provides a comprehensive solution for managing large-scale travel logistics, making it easier to coordinate 100+ people across flights, hotels, and transportation with logical grouping and automated processes. 