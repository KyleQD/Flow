# Staff Management and Onboarding System

## Overview

The Staff Management and Onboarding System is a comprehensive ecosystem designed to streamline the entire employee lifecycle for venue management. This system integrates job posting, application management, onboarding workflows, communication tools, and staff management into a unified platform.

## System Architecture

### Core Components

1. **Staff Onboarding System** (`app/venue/staff/components/staff-onboarding-system.tsx`)
   - Comprehensive candidate management
   - Multi-stage onboarding workflows
   - Document tracking and progress monitoring
   - Template-based onboarding processes

2. **Enhanced Staff Onboarding** (`app/venue/staff/components/enhanced-staff-onboarding.tsx`)
   - Simplified onboarding interface
   - Progress tracking with visual indicators
   - Quick actions and status management

3. **Job Board Integration** 
   - Job posting creation and management
   - Application review and hiring pipeline
   - Seamless integration with onboarding

4. **Communication Hub**
   - Broadcast messaging to all staff
   - Department-specific communications
   - Emergency alert system
   - Priority-based messaging

5. **Contract Generation System**
   - Automated contract generation
   - Digital signature workflows
   - Template-based contracts
   - Status tracking and management

## Features

### Job Posting and Recruitment

- **Create Job Postings**: Post positions for all venue departments
- **Manage Applications**: Review, rate, and track applications
- **Hiring Pipeline**: Visualize candidates through different hiring stages
- **Quick Hire**: Fast-track hiring with automated onboarding

### Staff Onboarding

- **Multi-Stage Process**: 
  - Application Review
  - Interview Scheduling
  - Background Checks
  - Documentation Collection
  - Training and Orientation
  - Final Completion

- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Template System**: Pre-configured onboarding workflows for different positions
- **Document Management**: Track required documents and completion status
- **Automated Notifications**: Keep all stakeholders informed of progress

### Communication System

- **Broadcast Messaging**: Send announcements to all staff
- **Department Communications**: Target specific teams
- **Schedule Updates**: Notify staff of schedule changes
- **Emergency Alerts**: Immediate notifications for urgent situations
- **Priority Levels**: Low, Normal, High, and Urgent message priorities

### Contract Management

- **Automated Generation**: Create contracts from templates
- **Digital Signatures**: Electronic signature workflow
- **Status Tracking**: Monitor contract states (Draft, Pending, Signed, Expired)
- **Template Library**: Pre-built contract templates for different employment types

### Staff Management

- **Three-Tier System**:
  - **Staff Members**: Full-time and part-time employees
  - **Crew Members**: Event-specific technical crew
  - **Team Contractors**: Freelancers and project-based workers

- **Performance Tracking**: Monitor staff performance metrics
- **Scheduling Integration**: Manage staff schedules and assignments
- **Permission Management**: Role-based access control

## Database Schema

### Core Tables

#### Onboarding Candidates
```sql
CREATE TABLE onboarding_candidates (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venue_profiles(id),
  application_id UUID REFERENCES staff_applications(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  stage TEXT CHECK (stage IN ('application', 'interview', 'background_check', 'documentation', 'training', 'completed')),
  onboarding_progress INTEGER DEFAULT 0,
  -- Additional fields...
);
```

#### Staff Jobs (Enhanced)
```sql
ALTER TABLE staff_jobs ADD COLUMN venue_id UUID REFERENCES venue_profiles(id);
ALTER TABLE staff_jobs ADD COLUMN job_category TEXT DEFAULT 'staff';
ALTER TABLE staff_jobs ADD COLUMN required_skills TEXT[] DEFAULT '{}';
ALTER TABLE staff_jobs ADD COLUMN urgent BOOLEAN DEFAULT FALSE;
```

#### Staff Messages
```sql
CREATE TABLE staff_messages (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venue_profiles(id),
  sender_id UUID REFERENCES auth.users(id),
  recipients UUID[] NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  type TEXT CHECK (type IN ('announcement', 'schedule', 'training', 'emergency')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Staff Contracts
```sql
CREATE TABLE staff_contracts (
  id UUID PRIMARY KEY,
  venue_id UUID REFERENCES venue_profiles(id),
  employee_id TEXT NOT NULL,
  contract_type TEXT CHECK (contract_type IN ('employment', 'contractor', 'nda', 'performance')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'pending_signature', 'signed', 'expired')),
  terms JSONB DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  signed_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ
);
```

## API Integration

### Service Layer

The system uses a comprehensive service layer (`lib/services/enhanced-staff-management.service.ts`) that provides:

#### Job Management
- `createJobPosting(venueId, jobData)`
- `getJobPostings(venueId)`
- `updateJobPosting(jobId, updates)`

#### Application Management
- `getJobApplications(venueId)`
- `updateApplicationStatus(applicationId, status)`
- `hireFromApplication(applicationId, hireDetails)`

#### Onboarding Management
- `getOnboardingCandidates(venueId)`
- `updateOnboardingProgress(candidateId, progress)`
- `completeOnboarding(candidateId)`

#### Communication
- `sendStaffMessage(venueId, recipients, message)`
- `broadcastToAllStaff(venueId, message)`

#### Contract Management
- `generateContract(venueId, employeeId, contractType, templateData)`
- `getContracts(venueId)`

### Authentication & Authorization

The system integrates with Supabase authentication and uses Row Level Security (RLS) policies:

```sql
-- Venue owners can manage their staff
CREATE POLICY "Venue owners can manage staff" ON onboarding_candidates
  FOR ALL USING (venue_id IN (
    SELECT id FROM venue_profiles WHERE user_id = auth.uid()
  ));

-- Staff can view their own onboarding progress
CREATE POLICY "Staff can view own onboarding" ON onboarding_candidates
  FOR SELECT USING (email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ));
```

## User Interface

### Main Navigation

The system is accessed through the venue dashboard with dedicated tabs:
- **Overview**: Dashboard with key metrics and activity feed
- **Active Staff**: Current staff management and performance
- **Onboarding**: Candidate management and progress tracking
- **Job Board**: Job posting and application management
- **Communications**: Messaging and announcement system
- **Analytics**: Performance metrics and insights
- **Scheduler**: Staff scheduling and assignments

### Key UI Components

#### Staff Cards
- Display staff information, status, and performance metrics
- Real-time status indicators (online, busy, away, offline)
- Quick action buttons for communication and management

#### Onboarding Progress
- Visual progress bars showing completion percentage
- Stage indicators with icons and status colors
- Document checklist with completion tracking

#### Communication Hub
- Quick message composition
- Broadcast buttons for different message types
- Recent message history with priority indicators

## Workflow Examples

### Complete Hiring Workflow

1. **Job Posting Creation**
   ```typescript
   const job = await EnhancedStaffManagementService.createJobPosting(venueId, {
     title: "Sound Engineer",
     department: "Technical",
     employment_type: "full_time",
     salary_range: { min: 65000, max: 85000, type: "salary" }
   });
   ```

2. **Application Review**
   ```typescript
   const applications = await EnhancedStaffManagementService.getJobApplications(venueId);
   await EnhancedStaffManagementService.updateApplicationStatus(appId, "shortlisted");
   ```

3. **Hiring and Onboarding**
   ```typescript
   await EnhancedStaffManagementService.hireFromApplication(applicationId, {
     hire_type: "staff",
     venue_id: venueId,
     rate: 75000,
     start_date: "2024-02-01"
   });
   ```

4. **Contract Generation**
   ```typescript
   const contract = await EnhancedStaffManagementService.generateContract(
     venueId,
     employeeId,
     "employment",
     templateData
   );
   ```

5. **Staff Activation**
   ```typescript
   const staffMember = await EnhancedStaffManagementService.completeOnboarding(candidateId);
   ```

### Communication Workflow

1. **Broadcast Announcement**
   ```typescript
   await EnhancedStaffManagementService.broadcastToAllStaff(venueId, {
     subject: "Team Meeting Today",
     content: "Mandatory team meeting at 3 PM in the main conference room.",
     priority: "high",
     type: "announcement"
   });
   ```

2. **Emergency Alert**
   ```typescript
   await EnhancedStaffManagementService.sendStaffMessage(venueId, staffIds, {
     subject: "EMERGENCY: Evacuation Procedure",
     content: "Please follow emergency evacuation procedures immediately.",
     priority: "urgent",
     type: "emergency"
   });
   ```

## Analytics and Reporting

### Key Metrics

- **Onboarding Analytics**:
  - Average onboarding time
  - Success rate
  - Cost per hire
  - Time to productivity

- **Staff Performance**:
  - Performance trends
  - Efficiency scores
  - Communication response times
  - Schedule adherence

- **Job Board Analytics**:
  - Application rates
  - Hire rates
  - Time to hire
  - Source effectiveness

### Dashboard Components

The analytics system provides real-time insights through:
- Interactive charts and graphs
- Trend analysis
- Comparative metrics
- Predictive analytics for staffing needs

## Security Considerations

### Data Protection
- All sensitive data is encrypted at rest and in transit
- Personal information is handled according to GDPR/CCPA requirements
- Role-based access control limits data exposure

### Authentication
- Multi-factor authentication for administrative access
- Session management with automatic timeouts
- Audit logging for all administrative actions

### Compliance
- Employment law compliance checking
- Document retention policies
- Privacy controls for staff information

## Deployment and Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
1. Run the migration files in order:
   - `supabase/migrations/20250118000000_enhanced_staff_management.sql`
   - Additional schema files as needed

2. Set up Row Level Security policies
3. Configure authentication providers

### Feature Flags
```typescript
const FEATURE_FLAGS = {
  CONTRACT_GENERATION: true,
  DIGITAL_SIGNATURES: true,
  AI_SCHEDULING: false,
  AUTOMATED_ONBOARDING: true
};
```

## Future Enhancements

### Planned Features
- **AI-Powered Scheduling**: Intelligent staff scheduling based on performance and availability
- **Mobile Application**: Native mobile app for staff communication and schedule management
- **Integration APIs**: Connect with external HR systems and payroll providers
- **Advanced Analytics**: Machine learning-based performance predictions
- **Video Onboarding**: Interactive video-based training modules

### Technical Improvements
- **Real-time Notifications**: WebSocket-based real-time updates
- **Offline Support**: Progressive Web App capabilities
- **Performance Optimization**: Caching and lazy loading improvements
- **Accessibility**: Enhanced accessibility features and compliance

## Support and Maintenance

### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Database performance metrics
- User activity analytics

### Backup and Recovery
- Automated daily backups
- Point-in-time recovery capabilities
- Disaster recovery procedures
- Data export functionality

## Conclusion

The Staff Management and Onboarding System provides a comprehensive solution for venue staff management, from initial job posting through complete employee lifecycle management. The system's modular architecture allows for easy customization and extension while maintaining security and performance standards.

The integrated approach ensures that venue managers can efficiently handle all aspects of staff management through a single, cohesive platform, improving operational efficiency and employee satisfaction. 