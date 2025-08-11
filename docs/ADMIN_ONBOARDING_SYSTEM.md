# Admin Onboarding & Staff Management System

## Overview

The Admin Onboarding & Staff Management System is a comprehensive solution for managing the entire staff hiring and onboarding process within the `/admin` dashboard. This system streamlines job posting creation, application management, onboarding workflows, and team communication.

## Features

### 🎯 Core Workflow

1. **Job Posting Creation**
   - Create customizable job postings with detailed requirements
   - Build dynamic application forms with various field types
   - Set employment types, salary ranges, and experience levels
   - Manage posting status (draft, published, paused, closed)

2. **Application Management**
   - Review and process job applications
   - Update application status (pending, reviewed, shortlisted, approved, rejected)
   - Provide feedback and ratings for candidates
   - Track application metrics and analytics

3. **Onboarding Workflows**
   - Create customizable onboarding workflows per department/position
   - Multi-step onboarding process with progress tracking
   - Document collection and verification
   - Certification and training management

4. **Team Management**
   - View and manage all staff members
   - Track onboarding progress and status
   - Send team communications and announcements
   - Monitor staff performance and metrics

### 🏗️ Architecture

#### Database Schema

The system uses the following key tables:

```sql
-- Job posting templates with application forms
job_posting_templates
application_form_templates

-- Job applications and responses
job_applications

-- Onboarding workflows and candidates
onboarding_workflows
onboarding_steps
staff_onboarding_candidates
onboarding_activities

-- Staff management
staff_members
staff_messages
```

#### Type Safety

All data structures are defined in `types/admin-onboarding.ts`:

```typescript
interface JobPostingTemplate {
  id: string
  venue_id: string
  title: string
  description: string
  department: string
  position: string
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'volunteer'
  // ... additional fields
}

interface OnboardingCandidate {
  id: string
  venue_id: string
  name: string
  email: string
  position: string
  department: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  stage: 'invitation' | 'onboarding' | 'review' | 'approved' | 'rejected'
  onboarding_progress: number
  // ... additional fields
}
```

### 🔧 Components

#### Core Components

1. **Staff Management Dashboard** (`app/admin/dashboard/staff-management/page.tsx`)
   - Overview with statistics and metrics
   - Tabbed interface for different management areas
   - Real-time data loading and error handling

2. **Job Posting Form** (`components/admin/job-posting-form.tsx`)
   - Comprehensive form with validation
   - Dynamic application form field builder
   - Employment type and requirement management

3. **Onboarding Wizard** (`components/onboarding/onboarding-wizard.tsx`)
   - Multi-step onboarding process
   - Progress tracking and validation
   - Document collection and acknowledgments

#### API Routes

- `GET/POST /api/admin/job-postings` - Job posting management
- `GET/PATCH /api/admin/job-postings/[id]` - Individual job posting operations
- `GET /api/admin/applications` - Application listing
- `PATCH /api/admin/applications/[id]` - Application status updates
- `GET/POST /api/admin/onboarding` - Onboarding workflow management
- `PATCH/POST /api/admin/onboarding/candidates/[id]` - Candidate progress updates
- `GET/POST /api/admin/staff` - Staff member management
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### 🛠️ Services

#### AdminOnboardingStaffService

The main service class handles all business logic:

```typescript
export class AdminOnboardingStaffService {
  // Job posting management
  static async createJobPosting(venueId: string, data: CreateJobPostingData)
  static async getJobPostings(venueId: string)
  static async updateJobPostingStatus(jobId: string, status)

  // Application management
  static async getJobApplications(venueId: string)
  static async updateApplicationStatus(applicationId: string, data)

  // Onboarding workflows
  static async createOnboardingWorkflow(venueId: string, data)
  static async getOnboardingWorkflows(venueId: string)
  static async getOnboardingCandidates(venueId: string)
  static async updateOnboardingProgress(candidateId: string, data)

  // Staff management
  static async getStaffMembers(venueId: string)
  static async completeOnboarding(candidateId: string)
  static async sendTeamCommunication(venueId: string, data)

  // Dashboard statistics
  static async getDashboardStats(venueId: string)
}
```

### 🔐 Security & Validation

#### Zod Schemas

All form inputs are validated using Zod schemas:

```typescript
const jobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  department: z.string().min(1, 'Department is required'),
  // ... additional validation rules
})

const onboardingSchema = z.object({
  personal_info: z.object({
    full_name: z.string().min(1, 'Full name is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    ssn: z.string().min(9, 'SSN must be at least 9 characters'),
    // ... additional validation rules
  }),
  // ... additional sections
})
```

#### Error Handling

Comprehensive error handling throughout the system:

```typescript
try {
  const result = await AdminOnboardingStaffService.createJobPosting(venueId, data)
  toast({
    title: 'Success',
    description: 'Job posting created successfully',
  })
} catch (error) {
  console.error('❌ [Service] Error:', error)
  toast({
    title: 'Error',
    description: 'Failed to create job posting. Please try again.',
    variant: 'destructive'
  })
}
```

### 📊 Dashboard Features

#### Overview Tab
- **Onboarding Statistics**: Total candidates, progress tracking, completion rates
- **Job Posting Metrics**: Published postings, applications, pending reviews
- **Staff Management**: Active staff, departments, recent hires
- **Quick Actions**: Create job posting, add candidate, view applications

#### Job Postings Tab
- List all job postings with status indicators
- Create new job postings with custom application forms
- Update posting status (draft, published, paused, closed)
- Track application and view counts

#### Applications Tab
- Review all job applications
- Update application status with feedback
- Rate applications and provide comments
- Filter and search applications

#### Onboarding Tab
- View all onboarding candidates
- Track onboarding progress with visual indicators
- Update candidate status and stage
- Generate invitation tokens for candidates

#### Staff Tab
- Manage all staff members
- View staff details and employment information
- Track hire dates and employment types
- Access staff member profiles

#### Communications Tab
- Send team-wide announcements
- Create targeted communications
- Track message delivery and read status
- Manage communication priorities

### 🎨 UI/UX Features

#### Dark Theme Design
- Consistent dark theme throughout the admin interface
- Purple accent colors for interactive elements
- Proper contrast ratios for accessibility

#### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation and forms

#### Loading States
- Skeleton loading for data fetching
- Progress indicators for multi-step processes
- Disabled states during form submission

#### Error States
- Graceful error handling with user-friendly messages
- Retry mechanisms for failed operations
- Validation feedback for form inputs

### 🚀 Getting Started

#### Prerequisites
- Next.js 15 with App Router
- Supabase database with proper schema
- Tailwind CSS and Shadcn UI components
- React Hook Form with Zod validation

#### Installation

1. **Database Setup**
   ```sql
   -- Run the migration files in supabase/migrations/
   -- Ensure all required tables are created
   ```

2. **Component Installation**
   ```bash
   # Install required dependencies
   npm install react-hook-form @hookform/resolvers zod
   ```

3. **Service Integration**
   ```typescript
   // Import the service in your components
   import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'
   ```

#### Usage Examples

**Creating a Job Posting:**
```typescript
const jobData = {
  title: 'Security Guard',
  description: 'Event security position...',
  department: 'Security',
  position: 'Event Security',
  employment_type: 'part_time',
  location: 'Los Angeles, CA',
  application_form_template: {
    fields: [
      {
        name: 'cover_letter',
        label: 'Cover Letter',
        type: 'textarea',
        required: true,
        order: 0
      }
    ]
  }
}

await AdminOnboardingStaffService.createJobPosting(venueId, jobData)
```

**Updating Application Status:**
```typescript
await AdminOnboardingStaffService.updateApplicationStatus(applicationId, {
  status: 'approved',
  feedback: 'Excellent candidate with relevant experience',
  rating: 5
})
```

**Completing Onboarding:**
```typescript
await AdminOnboardingStaffService.completeOnboarding(candidateId)
// This creates a new staff member and updates candidate status
```

### 🔄 Workflow Examples

#### Complete Hiring Process

1. **Create Job Posting**
   - Admin creates job posting with custom application form
   - Posting is published and visible to candidates

2. **Application Review**
   - Candidates submit applications through custom form
   - Admin reviews applications and provides feedback
   - Approved candidates move to onboarding

3. **Onboarding Process**
   - Admin generates invitation token for candidate
   - Candidate completes multi-step onboarding wizard
   - Admin reviews and approves onboarding completion

4. **Staff Creation**
   - Onboarding completion automatically creates staff member
   - Staff member is available for team management

#### Team Communication

```typescript
await AdminOnboardingStaffService.sendTeamCommunication(venueId, {
  recipients: ['staff_member_1', 'staff_member_2'],
  subject: 'Important Event Update',
  content: 'Please review the updated schedule...',
  message_type: 'announcement',
  priority: 'high'
})
```

### 🧪 Testing

#### Unit Tests
```typescript
// Test service methods
describe('AdminOnboardingStaffService', () => {
  it('should create job posting successfully', async () => {
    const result = await AdminOnboardingStaffService.createJobPosting(venueId, mockData)
    expect(result).toBeDefined()
    expect(result.title).toBe(mockData.title)
  })
})
```

#### Integration Tests
```typescript
// Test API endpoints
describe('Job Postings API', () => {
  it('should return job postings for venue', async () => {
    const response = await fetch('/api/admin/job-postings?venue_id=test')
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
```

### 📈 Performance Considerations

#### Data Loading
- Parallel data fetching for dashboard statistics
- Lazy loading for large datasets
- Caching of frequently accessed data

#### Form Optimization
- Debounced form validation
- Optimistic updates for better UX
- Progressive form saving

#### Database Queries
- Efficient joins for related data
- Proper indexing on frequently queried fields
- Pagination for large result sets

### 🔧 Configuration

#### Environment Variables
```env
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin settings
ADMIN_ONBOARDING_ENABLED=true
MAX_FILE_UPLOAD_SIZE=10485760
```

#### Feature Flags
```typescript
// Enable/disable features
const FEATURES = {
  ADVANCED_ONBOARDING: true,
  TEAM_COMMUNICATIONS: true,
  CERTIFICATION_TRACKING: true,
  BACKGROUND_CHECK_INTEGRATION: false
}
```

### 🚨 Troubleshooting

#### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure proper RLS policies

2. **Form Validation Errors**
   - Check Zod schema definitions
   - Verify form field names match schema
   - Ensure all required fields are present

3. **Permission Errors**
   - Verify user has admin access
   - Check venue ownership
   - Ensure proper authentication

#### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('❌ [Service] Error details:', error)
}
```

### 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Shadcn UI Components](https://ui.shadcn.com/)

### 🤝 Contributing

When contributing to the admin onboarding system:

1. Follow the established TypeScript patterns
2. Use Zod for all form validation
3. Implement proper error handling
4. Add comprehensive tests
5. Update documentation for new features

### 📄 License

This system is part of the Tourify platform and follows the same licensing terms. 