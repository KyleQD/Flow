# Enhanced Staff Profiles System

## Overview

The Enhanced Staff Profiles System is a comprehensive staff management solution designed specifically for venue management. This system provides detailed staff profiles with advanced features including role assignment, performance tracking, certification management, and more.

## Features Implemented

### 👤 Staff Profiles - Connected to Users Primary Account

✅ **Staff role assignment** - Comprehensive role categorization (FOH, tech, security, bar, etc.)
✅ **Personal details** - Name, contact, pronouns, bio, address, etc.
✅ **Profile picture upload** - Avatar management with preview
✅ **Certification uploads** - Support for alcohol handling, rigging, safety certifications
✅ **Internal staff notes** - Admin-only notes and internal documentation
✅ **Staff rating or performance tracking** - Performance reviews and metrics
✅ **User-to-staff linking** - Via Supabase Auth integration

## Database Schema

### Enhanced `venue_team_members` Table

The existing `venue_team_members` table has been enhanced with comprehensive fields:

```sql
-- Personal details
first_name TEXT
last_name TEXT
pronouns TEXT
bio TEXT
avatar_url TEXT
date_of_birth DATE
address TEXT
city TEXT
state TEXT
postal_code TEXT
country TEXT

-- Role and department details
department TEXT
role_level TEXT DEFAULT 'entry' CHECK (role_level IN ('entry', 'mid', 'senior', 'manager', 'director'))
role_category TEXT CHECK (role_category IN ('foh', 'tech', 'security', 'bar', 'kitchen', 'management', 'marketing', 'maintenance', 'other'))

-- Employment details
hourly_rate DECIMAL(10,2)
salary DECIMAL(10,2)
pay_frequency TEXT DEFAULT 'hourly' CHECK (pay_frequency IN ('hourly', 'weekly', 'biweekly', 'monthly'))
termination_date DATE
termination_reason TEXT

-- Performance and tracking
performance_rating DECIMAL(3,2) DEFAULT 0
reliability_score DECIMAL(3,2) DEFAULT 0
events_completed INTEGER DEFAULT 0
total_hours_worked INTEGER DEFAULT 0
last_performance_review DATE
next_review_date DATE

-- Emergency contact
emergency_contact JSONB DEFAULT '{}'

-- Internal notes (admin-only)
internal_notes TEXT
admin_notes TEXT

-- Availability and scheduling
weekly_availability JSONB DEFAULT '{}'
preferred_shifts JSONB DEFAULT '[]'
blackout_dates JSONB DEFAULT '[]'

-- System fields
last_active TIMESTAMPTZ
is_available BOOLEAN DEFAULT true
onboarding_completed BOOLEAN DEFAULT false
onboarding_completed_at TIMESTAMPTZ
```

### New Supporting Tables

#### `staff_certifications`
- Certification management with expiration tracking
- Support for various certification types (alcohol handling, rigging, safety, etc.)
- File upload support for certification documents
- Verification status tracking

#### `staff_performance_reviews`
- Comprehensive performance review system
- Multiple rating categories (reliability, teamwork, communication, technical skills)
- Review period tracking
- Goals and improvement areas

#### `staff_skills`
- Skills inventory with proficiency levels
- Experience tracking
- Verification system
- Skill categorization

#### `staff_documents`
- Document management beyond certifications
- Support for ID documents, tax forms, contracts, etc.
- Expiration tracking
- Required document flagging

#### `staff_availability`
- Weekly availability management
- Day-of-week scheduling
- Time slot management
- Availability notes

#### `staff_time_off_requests`
- Time off request system
- Multiple request types (vacation, sick leave, personal, etc.)
- Approval workflow
- Date range management

## Components

### StaffProfileCard
A comprehensive card component that displays:
- Staff member information with avatar
- Role and department details
- Performance metrics
- Quick stats (performance rating, events completed)
- Alert indicators (expiring certifications)
- Action buttons (view profile, edit)

### StaffProfileForm
A multi-tab form for creating and editing staff profiles:
- **Personal Tab**: Name, pronouns, bio, address, etc.
- **Employment Tab**: Role, department, employment type, pay details
- **Contact Tab**: Email, phone information
- **Emergency Tab**: Emergency contact details
- **Avatar Tab**: Profile picture upload

### EnhancedStaffManagement
Main management page with:
- Statistics dashboard
- Search and filtering capabilities
- Staff grid view
- Analytics overview
- Settings management

## API Endpoints

### GET `/api/venue/staff-profiles?venueId={id}`
Fetches all staff profiles for a venue with related data.

### POST `/api/venue/staff-profiles`
Creates a new staff profile.

### PUT `/api/venue/staff-profiles/{id}`
Updates an existing staff profile.

### DELETE `/api/venue/staff-profiles/{id}`
Deletes a staff profile.

## Service Layer

### EnhancedStaffProfilesService
Comprehensive service class providing:

#### Staff Profile Management
- `getStaffProfiles(venueId)` - Fetch all staff with related data
- `getStaffProfile(staffId)` - Fetch single staff profile
- `createStaffProfile(data)` - Create new staff profile
- `updateStaffProfile(staffId, data)` - Update existing profile
- `deleteStaffProfile(staffId)` - Delete staff profile

#### Certifications
- `getStaffCertifications(staffId)` - Fetch staff certifications
- `addCertification(data)` - Add new certification
- `updateCertification(id, data)` - Update certification
- `deleteCertification(id)` - Delete certification

#### Performance Reviews
- `getPerformanceReviews(staffId)` - Fetch performance reviews
- `createPerformanceReview(data)` - Create new review
- `updatePerformanceReview(id, data)` - Update review

#### Skills Management
- `getStaffSkills(staffId)` - Fetch staff skills
- `addSkill(data)` - Add new skill
- `updateSkill(id, data)` - Update skill
- `deleteSkill(id)` - Delete skill

#### Documents
- `getStaffDocuments(staffId)` - Fetch staff documents
- `addDocument(data)` - Add new document
- `updateDocument(id, data)` - Update document
- `deleteDocument(id)` - Delete document

#### Availability
- `getStaffAvailability(staffId)` - Fetch availability
- `updateAvailability(data)` - Update availability

#### Time Off Requests
- `getTimeOffRequests(staffId)` - Fetch time off requests
- `createTimeOffRequest(data)` - Create new request
- `updateTimeOffRequest(id, data)` - Update request

#### Utility Methods
- `getExpiringCertifications(venueId, daysThreshold)` - Get certifications expiring soon
- `getUpcomingReviews(venueId, daysThreshold)` - Get upcoming performance reviews
- `getStaffByRole(venueId, roleCategory)` - Get staff by role category
- `getAvailableStaff(venueId)` - Get currently available staff

## Security Features

### Row Level Security (RLS)
All tables have comprehensive RLS policies:

- **Venue owners** can manage all staff data for their venues
- **Staff members** can view their own profiles and related data
- **Staff members** can manage their own availability and time off requests
- **Proper isolation** between different venues

### Data Validation
- Input validation for all form fields
- Type checking for all data structures
- Proper error handling and user feedback

## Usage Examples

### Creating a New Staff Profile

```typescript
import { EnhancedStaffProfilesService } from "@/lib/services/enhanced-staff-profiles.service"

const newStaff = await EnhancedStaffProfilesService.createStaffProfile({
  venue_id: "venue-uuid",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@venue.com",
  phone: "(555) 123-4567",
  role: "Sound Engineer",
  department: "Technical",
  role_category: "tech",
  role_level: "senior",
  employment_type: "full_time",
  hourly_rate: 25.00,
  hire_date: "2024-01-15",
  pronouns: "he/him",
  bio: "Experienced sound engineer with 8 years in live events",
  emergency_contact: {
    name: "Jane Doe",
    phone: "(555) 987-6543",
    relationship: "Spouse",
    email: "jane.doe@email.com"
  }
})
```

### Adding a Certification

```typescript
await EnhancedStaffProfilesService.addCertification({
  staff_member_id: "staff-uuid",
  venue_id: "venue-uuid",
  certification_name: "Alcohol Server Certification",
  certification_type: "alcohol_handling",
  issuing_organization: "State Liquor Authority",
  certification_number: "ALC-2024-001",
  issue_date: "2024-01-01",
  expiration_date: "2025-01-01",
  file_url: "https://example.com/cert.pdf",
  is_verified: true
})
```

### Creating a Performance Review

```typescript
await EnhancedStaffProfilesService.createPerformanceReview({
  staff_member_id: "staff-uuid",
  venue_id: "venue-uuid",
  reviewer_id: "reviewer-uuid",
  review_date: "2024-06-15",
  review_period_start: "2024-01-01",
  review_period_end: "2024-06-30",
  overall_rating: 4.5,
  reliability_rating: 4.8,
  teamwork_rating: 4.2,
  communication_rating: 4.6,
  technical_skills_rating: 4.7,
  strengths: ["Technical expertise", "Reliability", "Problem solving"],
  areas_for_improvement: ["Documentation", "Training others"],
  goals: ["Lead technical training sessions", "Improve documentation"],
  comments: "Excellent performance this review period. Strong technical skills and reliability."
})
```

## Migration

To implement this system, run the migration file:

```bash
# Apply the enhanced staff profiles migration
supabase db push
```

The migration will:
1. Enhance the existing `venue_team_members` table with new fields
2. Create all new supporting tables
3. Set up proper indexes for performance
4. Enable Row Level Security
5. Create RLS policies for data protection

## Next Steps

This implementation covers the **Staff Profiles** feature completely. The next items to implement would be:

1. **🔐 Roles & Permissions** - Admin vs. staff vs. viewer access levels
2. **📆 Scheduling & Shifts** - Create and assign shifts by role and time
3. **🔁 Shift Management Tools** - Shift swapping, drop/pickup workflows
4. **✅ Availability & Time Off** - Weekly availability, time-off requests
5. **⏱️ Check-In / Check-Out** - QR code or PIN-based check-in
6. **💵 Payroll & Compensation** - Hourly rate tracking, payroll reports
7. **📬 Communication & Messaging** - Broadcast messages, notifications
8. **📊 Admin Dashboard & Reporting** - Analytics and reporting
9. **🔎 Search & Filtering** - Advanced search capabilities
10. **📁 File & Document Handling** - Enhanced document management
11. **⚠️ Error Handling & Logging** - Comprehensive error handling
12. **🌐 Real-Time & Sync** - Real-time updates and synchronization

## Benefits

- **Comprehensive Staff Management**: Complete staff lifecycle management
- **Performance Tracking**: Detailed performance reviews and metrics
- **Certification Management**: Track and manage staff certifications
- **Flexible Role System**: Support for various venue roles and departments
- **Security**: Proper data isolation and access control
- **Scalability**: Designed to handle multiple venues and large staff teams
- **User Experience**: Intuitive interface with comprehensive features 