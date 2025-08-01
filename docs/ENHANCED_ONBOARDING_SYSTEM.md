# Enhanced Onboarding System

## Overview

The Enhanced Onboarding System provides a comprehensive solution for managing new staff members through the onboarding process. It supports both adding existing users and inviting new users, with a complete workflow from invitation to team assignment.

## Features

### ✅ Admin Capabilities
- **Add Existing Users**: Admins can add users who already have accounts to the onboarding process
- **Invite New Users**: Send invitations to users who don't have accounts yet
- **Review & Approval**: Review completed onboarding and approve/reject candidates
- **Template Management**: Create and manage onboarding templates for different positions
- **Progress Tracking**: Monitor onboarding progress with detailed statistics

### ✅ User Experience
- **Invitation Flow**: Users receive invitations via email/phone with signup links
- **Multi-step Onboarding**: Complete onboarding forms with progress tracking
- **Document Upload**: Upload resumes, certifications, and other required documents
- **Notification System**: Receive updates about onboarding status

### ✅ Workflow Management
- **Status Tracking**: Track candidates through invitation → onboarding → review → approved/rejected
- **Team Assignment**: Automatically add approved candidates to venue teams
- **Notification Integration**: Send notifications at each stage of the process

## Database Schema

### Core Tables

#### `staff_onboarding_candidates`
```sql
CREATE TABLE staff_onboarding_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'approved')),
  stage TEXT DEFAULT 'invitation' CHECK (stage IN ('invitation', 'onboarding', 'review', 'approved', 'rejected')),
  application_date DATE DEFAULT CURRENT_DATE,
  avatar_url TEXT,
  experience_years INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  assigned_manager TEXT,
  start_date DATE,
  salary DECIMAL(10,2),
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
  onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
  template_id UUID,
  invitation_token TEXT,
  onboarding_responses JSONB,
  review_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `staff_onboarding_templates`
```sql
CREATE TABLE staff_onboarding_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  estimated_days INTEGER DEFAULT 14,
  required_documents TEXT[] DEFAULT '{}',
  required_fields JSONB DEFAULT '[]'::jsonb,
  assignees TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  last_used DATE,
  use_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Admin Endpoints

#### Add Existing User
```http
POST /api/admin/onboarding/add-existing-user
Content-Type: application/json

{
  "venue_id": "uuid",
  "user_id": "uuid",
  "position": "Sound Engineer",
  "department": "Technical",
  "employment_type": "full_time",
  "start_date": "2024-03-01",
  "salary": 50000,
  "notes": "Experienced sound engineer",
  "onboarding_template_id": "uuid"
}
```

#### Invite New User
```http
POST /api/admin/onboarding/invite-new-user
Content-Type: application/json

{
  "venue_id": "uuid",
  "email": "user@example.com",
  "phone": "+1234567890",
  "position": "Sound Engineer",
  "department": "Technical",
  "employment_type": "full_time",
  "start_date": "2024-03-01",
  "salary": 50000,
  "message": "Welcome to our team!",
  "notes": "Invited for sound engineering position",
  "onboarding_template_id": "uuid"
}
```

#### Get Onboarding Candidates
```http
GET /api/admin/onboarding/candidates?venue_id=uuid
```

#### Review Candidate
```http
POST /api/admin/onboarding/review
Content-Type: application/json

{
  "candidate_id": "uuid",
  "action": "approve",
  "review_notes": "Excellent candidate, approved for position"
}
```

### User Endpoints

#### Submit Onboarding Responses
```http
POST /api/onboarding/submit
Content-Type: application/json

{
  "candidate_id": "uuid",
  "responses": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "experience_years": 5,
    "skills": "Pro Tools, Live Sound, Mixing"
  },
  "documents": [
    {
      "name": "Resume",
      "url": "https://example.com/resume.pdf",
      "type": "resume"
    }
  ]
}
```

## User Journey

### 1. Admin Invites New User

1. **Admin Action**: Admin goes to Staff & Crew → Onboarding → Invite New User
2. **Form Completion**: Admin fills out invitation form with user details
3. **Invitation Sent**: System generates invitation token and sends email/SMS
4. **Database Update**: Creates candidate record with `status: 'pending'`, `stage: 'invitation'`

### 2. User Receives Invitation

1. **Email/SMS**: User receives invitation with signup link
2. **Signup Process**: User clicks link and creates account
3. **Token Validation**: System validates invitation token
4. **Status Update**: Updates invitation status to `'accepted'`
5. **Redirect**: User redirected to onboarding completion page

### 3. User Completes Onboarding

1. **Multi-step Form**: User completes personal info, professional details, documents
2. **Progress Tracking**: System tracks completion percentage
3. **Document Upload**: User uploads required documents
4. **Submission**: User submits completed onboarding
5. **Status Update**: Updates to `status: 'completed'`, `stage: 'review'`

### 4. Admin Reviews Onboarding

1. **Notification**: Admin receives notification of completed onboarding
2. **Review Process**: Admin reviews submitted information
3. **Decision**: Admin approves or rejects the candidate
4. **Team Assignment**: If approved, automatically added to venue team
5. **Notification**: User receives approval/rejection notification

## Component Structure

### EnhancedOnboardingSystem
Main component that provides the admin interface for managing onboarding.

**Props:**
- `venueId: string` - The venue ID for filtering candidates

**Features:**
- Dashboard with statistics
- Candidate management
- Add existing user form
- Invite new user form
- Review and approval workflow

### OnboardingCompletePage
User-facing component for completing onboarding process.

**Features:**
- Multi-step form wizard
- Progress tracking
- Document upload
- Form validation
- Submission handling

## Service Layer

### EnhancedOnboardingService
Core service class that handles all onboarding business logic.

**Key Methods:**
- `addExistingUser()` - Add existing user to onboarding
- `inviteNewUser()` - Invite new user with token
- `getOnboardingCandidates()` - Fetch candidates for venue
- `submitOnboardingResponses()` - Submit user responses
- `reviewCandidate()` - Review and approve/reject candidate
- `getOnboardingStats()` - Get statistics for dashboard

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
Run the migration files to create the required tables:
- `supabase/migrations/20250620100007_final_fixed_tables.sql`

## Usage Examples

### Adding an Existing User
```typescript
const result = await EnhancedOnboardingService.addExistingUser({
  venue_id: "venue-uuid",
  user_id: "user-uuid",
  position: "Sound Engineer",
  department: "Technical",
  employment_type: "full_time",
  start_date: "2024-03-01",
  salary: 50000,
  notes: "Experienced engineer"
})
```

### Inviting a New User
```typescript
const result = await EnhancedOnboardingService.inviteNewUser({
  venue_id: "venue-uuid",
  email: "newuser@example.com",
  position: "Security Guard",
  department: "Security",
  employment_type: "part_time",
  message: "Welcome to our security team!"
})
```

### Reviewing a Candidate
```typescript
const result = await EnhancedOnboardingService.reviewCandidate(
  "candidate-uuid",
  "approve",
  "Excellent candidate, approved for position",
  "admin-uuid"
)
```

## Best Practices

### Security
- Always validate user permissions before allowing admin actions
- Use Row Level Security (RLS) policies in database
- Validate all input data with Zod schemas
- Sanitize file uploads and user inputs

### Performance
- Use pagination for large candidate lists
- Implement caching for frequently accessed data
- Optimize database queries with proper indexes
- Use background jobs for email sending

### User Experience
- Provide clear progress indicators
- Send timely notifications at each stage
- Allow users to save progress and continue later
- Provide helpful error messages and validation feedback

## Troubleshooting

### Common Issues

1. **Invitation Links Not Working**
   - Check token expiration
   - Verify invitation status in database
   - Ensure proper URL encoding

2. **Onboarding Not Submitting**
   - Check form validation
   - Verify user authentication
   - Check database constraints

3. **Admin Not Receiving Notifications**
   - Check notification preferences
   - Verify admin user permissions
   - Check notification service configuration

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=onboarding:*
```

## Future Enhancements

### Planned Features
- [ ] Bulk invitation system
- [ ] Advanced template builder
- [ ] Integration with HR systems
- [ ] Automated background checks
- [ ] Multi-language support
- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Integration with payroll systems

### API Improvements
- [ ] GraphQL support
- [ ] Webhook notifications
- [ ] Rate limiting
- [ ] API versioning
- [ ] Comprehensive error handling 