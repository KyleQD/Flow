# Enhanced Scheduling & Shifts System

## Overview

The Enhanced Scheduling & Shifts System provides comprehensive shift management capabilities for venues, including calendar views, shift creation, staff assignments, recurring shifts, shift swaps, and analytics. This system builds upon the existing staff profiles and roles/permissions infrastructure to deliver a complete scheduling solution.

## Features

### 📅 **Calendar View**
- **Month/Week/Day Views**: Flexible calendar interface with multiple view modes
- **Interactive Calendar**: Click on shifts to view details and manage assignments
- **Visual Indicators**: Color-coded shifts by status, priority, and department
- **Navigation**: Easy date navigation with previous/next controls
- **Filtering**: Filter by department, status, and search functionality

### 🕐 **Shift Management**
- **Create Shifts**: Comprehensive shift creation with all necessary details
- **Edit & Clone**: Modify existing shifts or clone them for new dates
- **Status Tracking**: Track shift status (open, filled, in_progress, completed, cancelled)
- **Priority Levels**: Set priority (low, normal, high, urgent)
- **Location & Requirements**: Specify location, dress code, and special requirements

### 👥 **Staff Assignments**
- **Assign Staff**: Assign multiple staff members to shifts
- **Assignment Status**: Track assignment status (assigned, confirmed, declined, cancelled)
- **Conflict Detection**: Automatic detection of scheduling conflicts
- **Notes & Communication**: Add notes to assignments for better communication

### 🔄 **Recurring Shifts**
- **Shift Templates**: Create reusable shift templates
- **Recurring Patterns**: Set up daily, weekly, or monthly recurring shifts
- **Flexible Scheduling**: Customize recurrence patterns with specific days and intervals
- **Auto-Generation**: Automatically generate individual shifts from recurring patterns

### 🔀 **Shift Management Tools**
- **Shift Swaps**: Request and approve shift swaps between staff members
- **Drop/Pickup Requests**: Allow staff to request dropping or picking up shifts
- **Approval Workflow**: Admin approval for all shift changes
- **Request Tracking**: Track all requests with status and history

### 📝 **Shift Notes & Communication**
- **Public/Private Notes**: Add notes visible to all assigned staff or private notes
- **Note Types**: Categorize notes (general, dress code, call time, special instructions, emergency)
- **Pinned Notes**: Pin important notes for easy visibility
- **Communication Hub**: Centralized communication for shift-specific information

### ⏱️ **Check-In/Check-Out System**
- **Multiple Check-in Methods**: Manual, QR code, PIN, or GPS-based check-in
- **Location Tracking**: Optional GPS-based location verification
- **Late Detection**: Automatic detection of late arrivals
- **Manual Override**: Admin override for missed check-ins
- **QR Code Generation**: Generate QR codes for easy check-in

### 📊 **Analytics & Reporting**
- **Performance Metrics**: Track completion rates, on-time arrival, staff utilization
- **Cost Analysis**: Monitor labor costs and budget tracking
- **Department Breakdown**: Analyze performance by department
- **Trend Analysis**: View performance trends over time
- **Export Capabilities**: Export reports in various formats

## Database Schema

### Core Tables

#### `venue_shifts`
Main shifts table with comprehensive shift information:
```sql
CREATE TABLE venue_shifts (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL,
  event_id UUID, -- Optional event association
  shift_title TEXT NOT NULL,
  shift_description TEXT,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  department TEXT,
  role_required TEXT,
  staff_needed INTEGER DEFAULT 1,
  staff_assigned INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  flat_rate DECIMAL(10,2),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB,
  shift_status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  dress_code TEXT,
  special_requirements TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venue_shift_assignments`
Many-to-many relationship between shifts and staff:
```sql
CREATE TABLE venue_shift_assignments (
  id UUID PRIMARY KEY,
  shift_id UUID REFERENCES venue_shifts(id),
  staff_member_id UUID REFERENCES venue_team_members(id),
  assignment_status TEXT DEFAULT 'assigned',
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_id, staff_member_id)
);
```

#### `venue_shift_templates`
Reusable shift templates:
```sql
CREATE TABLE venue_shift_templates (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_description TEXT,
  department TEXT,
  role_required TEXT,
  staff_needed INTEGER DEFAULT 1,
  hourly_rate DECIMAL(10,2),
  flat_rate DECIMAL(10,2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  dress_code TEXT,
  special_requirements TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venue_recurring_shifts`
Recurring shift schedules:
```sql
CREATE TABLE venue_recurring_shifts (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL,
  template_id UUID REFERENCES venue_shift_templates(id),
  shift_title TEXT NOT NULL,
  recurrence_pattern JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Management Tables

#### `venue_shift_swaps`
Shift swap requests:
```sql
CREATE TABLE venue_shift_swaps (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL,
  original_shift_id UUID REFERENCES venue_shifts(id),
  original_staff_id UUID REFERENCES venue_team_members(id),
  requested_staff_id UUID REFERENCES venue_team_members(id),
  swap_reason TEXT,
  request_status TEXT DEFAULT 'pending',
  requested_by UUID NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  denied_by UUID,
  denied_at TIMESTAMPTZ,
  denial_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venue_shift_requests`
Drop/pickup requests:
```sql
CREATE TABLE venue_shift_requests (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL,
  shift_id UUID REFERENCES venue_shifts(id),
  staff_member_id UUID REFERENCES venue_team_members(id),
  request_type TEXT NOT NULL, -- 'drop' or 'pickup'
  request_reason TEXT,
  request_status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  denied_by UUID,
  denied_at TIMESTAMPTZ,
  denial_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venue_shift_notes`
Shift-specific notes and communication:
```sql
CREATE TABLE venue_shift_notes (
  id UUID PRIMARY KEY,
  shift_id UUID REFERENCES venue_shifts(id),
  author_id UUID NOT NULL,
  note_type TEXT DEFAULT 'general',
  title TEXT,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Check-in System

#### `venue_shift_checkins`
Staff check-in/check-out records:
```sql
CREATE TABLE venue_shift_checkins (
  id UUID PRIMARY KEY,
  shift_assignment_id UUID REFERENCES venue_shift_assignments(id),
  checkin_type TEXT DEFAULT 'manual',
  checkin_time TIMESTAMPTZ NOT NULL,
  checkout_time TIMESTAMPTZ,
  checkin_location JSONB,
  checkout_location JSONB,
  is_late BOOLEAN DEFAULT FALSE,
  late_minutes INTEGER DEFAULT 0,
  is_no_show BOOLEAN DEFAULT FALSE,
  manual_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  override_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venue_checkin_qr_codes`
QR codes for check-in:
```sql
CREATE TABLE venue_checkin_qr_codes (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL,
  shift_id UUID REFERENCES venue_shifts(id),
  qr_code_hash TEXT UNIQUE NOT NULL,
  qr_code_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Service Layer

### VenueSchedulingService

The main service class provides comprehensive scheduling functionality:

#### Shift Management
```typescript
// Create a new shift
static async createShift(shiftData: CreateShiftData): Promise<VenueShift>

// Get shifts with filtering options
static async getShifts(venueId: string, options: {
  startDate?: string
  endDate?: string
  status?: ShiftStatus[]
  department?: string
  staffMemberId?: string
}): Promise<VenueShift[]>

// Update shift details
static async updateShift(shiftId: string, updateData: UpdateShiftData): Promise<VenueShift>

// Clone a shift to a new date
static async cloneShift(shiftId: string, newDate: string): Promise<VenueShift>
```

#### Staff Assignments
```typescript
// Assign staff to a shift
static async assignStaffToShift(assignmentData: CreateShiftAssignmentData): Promise<VenueShiftAssignment>

// Update assignment status
static async updateAssignmentStatus(
  assignmentId: string,
  status: AssignmentStatus,
  options: { declineReason?: string; notes?: string }
): Promise<VenueShiftAssignment>

// Check for scheduling conflicts
static async checkSchedulingConflicts(
  staffMemberId: string,
  shiftId: string
): Promise<ShiftConflictResponse[]>
```

#### Shift Templates & Recurring Shifts
```typescript
// Create shift template
static async createShiftTemplate(templateData: CreateShiftTemplateData): Promise<VenueShiftTemplate>

// Create recurring shift schedule
static async createRecurringShift(recurringData: CreateRecurringShiftData): Promise<VenueRecurringShift>

// Auto-generate shifts from recurring patterns
// (handled automatically by database triggers)
```

#### Shift Management Tools
```typescript
// Request shift swap
static async requestShiftSwap(swapData: CreateShiftSwapData): Promise<VenueShiftSwap>

// Approve/deny shift swap
static async approveShiftSwap(swapId: string, approvedBy: string): Promise<VenueShiftSwap>
static async denyShiftSwap(swapId: string, deniedBy: string, denialReason: string): Promise<VenueShiftSwap>

// Request shift drop/pickup
static async requestShiftChange(requestData: CreateShiftRequestData): Promise<VenueShiftRequest>
```

#### Check-in System
```typescript
// Check in staff
static async checkInStaff(checkinData: CreateCheckinData): Promise<VenueShiftCheckin>

// Check out staff
static async checkOutStaff(
  assignmentId: string,
  checkoutTime: string,
  location?: Record<string, any>
): Promise<VenueShiftCheckin>

// Generate QR code for check-in
static async generateCheckinQRCode(
  venueId: string,
  shiftId: string,
  createdBy: string
): Promise<VenueCheckinQrCode>
```

#### Analytics
```typescript
// Get scheduling analytics
static async getScheduleAnalytics(
  venueId: string,
  startDate: string,
  endDate: string
): Promise<ShiftAnalyticsResponse>

// Auto-schedule shifts based on availability
static async autoScheduleShifts(
  venueId: string,
  shiftIds: string[]
): Promise<VenueShiftAssignment[]>
```

## API Endpoints

### Shifts
- `GET /api/venue/shifts` - Get shifts with filtering
- `POST /api/venue/shifts` - Create new shift

### Assignments
- `GET /api/venue/shifts/assignments` - Get assignments
- `POST /api/venue/shifts/assignments` - Assign staff to shift
- `PATCH /api/venue/shifts/assignments` - Update assignment status

### Templates
- `GET /api/venue/shifts/templates` - Get shift templates
- `POST /api/venue/shifts/templates` - Create template

### Recurring Shifts
- `GET /api/venue/shifts/recurring` - Get recurring shifts
- `POST /api/venue/shifts/recurring` - Create recurring shift

### Shift Swaps
- `GET /api/venue/shifts/swaps` - Get swap requests
- `POST /api/venue/shifts/swaps` - Request swap
- `PATCH /api/venue/shifts/swaps/:id/approve` - Approve swap
- `PATCH /api/venue/shifts/swaps/:id/deny` - Deny swap

### Shift Requests
- `GET /api/venue/shifts/requests` - Get requests
- `POST /api/venue/shifts/requests` - Create request
- `PATCH /api/venue/shifts/requests/:id/approve` - Approve request
- `PATCH /api/venue/shifts/requests/:id/deny` - Deny request

### Check-ins
- `POST /api/venue/shifts/checkins` - Check in staff
- `PATCH /api/venue/shifts/checkins/:id/checkout` - Check out staff
- `POST /api/venue/shifts/qr-codes` - Generate QR code
- `POST /api/venue/shifts/qr-codes/validate` - Validate QR code

## UI Components

### ShiftCalendar
Main calendar component with:
- Month/week/day view modes
- Interactive shift display
- Shift creation dialog
- Staff assignment dialog
- Filtering and search

### ShiftManagement
List view for managing shifts:
- Shift cards with key information
- Quick actions (edit, assign, delete)
- Bulk operations
- Advanced filtering

### ShiftTemplates
Template management:
- Template creation and editing
- Template usage for creating shifts
- Template categories and organization

### ShiftRequests
Request management:
- Pending requests display
- Approval/denial workflow
- Request history and tracking

### ShiftAnalytics
Analytics dashboard:
- Key performance metrics
- Department breakdown
- Trend analysis
- Export capabilities

## Security & Permissions

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access data for venues they belong to
- Role-based access control for different operations
- Audit logging for all permission changes

### Permission Checks
The system integrates with the roles/permissions system:
- `shifts.view` - View shifts and calendar
- `shifts.create` - Create new shifts
- `shifts.edit` - Edit existing shifts
- `shifts.delete` - Delete shifts
- `shifts.assign` - Assign staff to shifts
- `shifts.approve` - Approve shift requests
- `shifts.analytics` - View analytics and reports

## Database Functions & Triggers

### Automatic Functions
- **`generate_recurring_shifts()`**: Automatically creates individual shifts from recurring patterns
- **`update_shift_staff_count()`**: Updates staff count when assignments change
- **`check_scheduling_conflicts()`**: Validates assignments for conflicts

### Triggers
- **Recurring shift generation**: Triggers when new recurring shifts are created
- **Staff count updates**: Triggers when assignments are added/removed
- **Conflict checking**: Triggers before new assignments to prevent conflicts
- **Timestamp updates**: Automatic `updated_at` field updates

## Usage Examples

### Creating a Shift
```typescript
const shift = await VenueSchedulingService.createShift({
  venue_id: 'venue-123',
  shift_title: 'Evening Security',
  shift_description: 'Main entrance security coverage',
  shift_date: '2024-12-15',
  start_time: '18:00',
  end_time: '02:00',
  location: 'Main Entrance',
  department: 'Security',
  role_required: 'Security Guard',
  staff_needed: 2,
  hourly_rate: 25.00,
  priority: 'high',
  created_by: 'user-456'
});
```

### Assigning Staff
```typescript
const assignment = await VenueSchedulingService.assignStaffToShift({
  shift_id: 'shift-789',
  staff_member_id: 'staff-123',
  assigned_by: 'user-456',
  notes: 'Primary security guard for main entrance'
});
```

### Creating Recurring Shifts
```typescript
const recurringShift = await VenueSchedulingService.createRecurringShift({
  venue_id: 'venue-123',
  shift_title: 'Weekend Security',
  department: 'Security',
  role_required: 'Security Guard',
  staff_needed: 2,
  start_time: '18:00',
  end_time: '02:00',
  location: 'Main Entrance',
  recurrence_pattern: {
    frequency: 'weekly',
    interval: 1,
    days_of_week: [5, 6], // Friday, Saturday
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  created_by: 'user-456'
});
```

### Requesting a Shift Swap
```typescript
const swap = await VenueSchedulingService.requestShiftSwap({
  venue_id: 'venue-123',
  original_shift_id: 'shift-789',
  original_staff_id: 'staff-123',
  requested_staff_id: 'staff-456',
  swap_reason: 'Personal emergency',
  requested_by: 'staff-123'
});
```

## Migration Instructions

1. **Run the migration**:
   ```bash
   # Apply the scheduling migration
   psql -d your_database -f supabase/migrations/20250122000000_enhanced_scheduling_shifts.sql
   ```

2. **Update TypeScript types**:
   - The types are already included in `types/database.types.ts`

3. **Deploy the service layer**:
   - Copy `lib/services/venue-scheduling.service.ts` to your project

4. **Deploy API routes**:
   - Copy the API route files to your project structure

5. **Deploy UI components**:
   - Copy the component files to your project structure

6. **Test the system**:
   - Create test shifts and assignments
   - Verify calendar functionality
   - Test permission controls

## Configuration

### Environment Variables
No additional environment variables are required beyond the existing Supabase configuration.

### Feature Flags
The system can be enabled/disabled via feature flags in your application configuration.

## Performance Considerations

### Indexing
The system includes comprehensive indexing for:
- Date-based queries on shifts
- Staff assignment lookups
- Status-based filtering
- Department-based filtering

### Query Optimization
- Efficient joins for shift details
- Pagination for large datasets
- Caching for frequently accessed data

### Real-time Updates
- Supabase real-time subscriptions for live updates
- WebSocket connections for instant notifications

## Troubleshooting

### Common Issues

1. **Scheduling Conflicts**
   - Check staff availability before assignments
   - Use the conflict detection function
   - Review overlapping shift times

2. **Permission Errors**
   - Verify user roles and permissions
   - Check venue membership
   - Review RLS policies

3. **Recurring Shift Issues**
   - Validate recurrence patterns
   - Check date ranges
   - Monitor trigger execution

### Debug Tools
- Database logs for trigger execution
- API request/response logging
- Real-time subscription debugging

## Future Enhancements

### Planned Features
- **Mobile App**: Native mobile app for staff check-ins
- **Advanced Analytics**: Machine learning for shift optimization
- **Integration**: Calendar system integration (Google Calendar, Outlook)
- **Notifications**: Advanced notification system with SMS/email
- **Reporting**: Advanced reporting and export capabilities

### Scalability
- **Multi-venue Support**: Enhanced multi-venue management
- **API Rate Limiting**: Implement rate limiting for API endpoints
- **Caching Strategy**: Redis-based caching for performance
- **Microservices**: Break down into microservices for scalability

## Support

For technical support or questions about the scheduling system:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team
- Submit issues through the project repository 