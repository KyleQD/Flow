# Staff Management System Enhancement Plan

## Overview

This document outlines the comprehensive enhancements needed to perfect the job posting, onboarding, and management sections of the platform at `/admin/dashboard/staff`. The system is designed to handle high-volume event staffing scenarios including security (200+ guards), bartenders (100 staff), and street teams (400+ volunteers).

## Current State Analysis

### ✅ What's Already Implemented
- Basic database schema for job postings, applications, onboarding workflows
- Service layer with CRUD operations
- Type definitions for all entities
- Basic UI components and forms
- Staff dashboard with tabs and statistics

### ❌ What Needs Enhancement
- Job posting form lacks dynamic form builder
- No event-specific job postings
- Missing certification requirements
- No role-based templates
- Limited application review capabilities
- Basic onboarding workflow
- No team management features

## Enhanced Components Created

### 1. Enhanced Job Posting Form (`components/admin/enhanced-job-posting-form.tsx`)

**Features:**
- **Role-based templates** for Security, Bartender, Street Team
- **Dynamic form builder** with custom fields per role
- **Certification requirements** tracking
- **Compliance requirements** (background checks, drug tests)
- **Multi-step wizard** interface
- **Event-specific postings** with date/time requirements

**Key Improvements:**
```typescript
// Role templates with pre-configured requirements
const roleTemplates = {
  security: {
    required_certifications: ['Security License', 'First Aid/CPR'],
    background_check_required: true,
    drug_test_required: true,
    // ... more config
  }
}
```

### 2. Enhanced Application Review (`components/admin/enhanced-application-review.tsx`)

**Features:**
- **Auto-screening logic** for compliance checks
- **Bulk actions** for mass application processing
- **Advanced filtering** by status, department, date range
- **Performance metrics** and rating system
- **Document validation** and tracking
- **Export capabilities** for reporting

**Key Improvements:**
```typescript
// Auto-screening for compliance
const runAutoScreening = async () => {
  // Check required certifications
  // Validate age requirements
  // Check for red flags
  // Generate recommendations
}
```

### 3. Enhanced Onboarding Wizard (`components/admin/enhanced-onboarding-wizard.tsx`)

**Features:**
- **Multi-step onboarding** with progress tracking
- **Document upload** with secure storage
- **Training modules** with video and quiz integration
- **Meeting scheduling** for orientation
- **Compliance tracking** for legal requirements
- **Real-time messaging** with candidates

**Key Improvements:**
```typescript
// Step-based onboarding with dependencies
const onboardingSteps = [
  { type: 'document', title: 'ID Verification' },
  { type: 'training', title: 'Safety Training' },
  { type: 'meeting', title: 'Orientation' },
  // ... more steps
]
```

### 4. Enhanced Team Management (`components/admin/enhanced-team-management.tsx`)

**Features:**
- **Shift assignment** system
- **Zone management** for event areas
- **Performance tracking** with metrics
- **Team communications** with message types
- **Staff filtering** by status, department, certifications
- **Export capabilities** for team data

**Key Improvements:**
```typescript
// Performance metrics tracking
interface PerformanceMetrics {
  attendance_rate: number
  performance_rating: number
  incidents: number
  commendations: number
  training_completed: number
  certifications_valid: number
}
```

## Database Schema Enhancements Needed

### 1. Job Postings Table Updates

```sql
-- Add new fields to job_posting_templates
ALTER TABLE job_posting_templates ADD COLUMN IF NOT EXISTS
  event_id UUID,
  event_date TIMESTAMP WITH TIME ZONE,
  required_certifications TEXT[] DEFAULT '{}',
  role_type VARCHAR(50) CHECK (role_type IN ('security', 'bartender', 'street_team', 'production', 'management', 'other')),
  shift_duration INTEGER,
  age_requirement INTEGER CHECK (age_requirement >= 18),
  background_check_required BOOLEAN DEFAULT FALSE,
  drug_test_required BOOLEAN DEFAULT FALSE,
  uniform_provided BOOLEAN DEFAULT FALSE,
  training_provided BOOLEAN DEFAULT FALSE;
```

### 2. Applications Table Updates

```sql
-- Add new fields to job_applications
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS
  auto_screening_result JSONB DEFAULT '{}',
  screening_issues TEXT[] DEFAULT '{}',
  screening_recommendations TEXT[] DEFAULT '{}',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  performance_notes TEXT;
```

### 3. Staff Management Tables

```sql
-- Create shifts table
CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    max_staff INTEGER NOT NULL,
    staff_assigned TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create zones table
CREATE TABLE IF NOT EXISTS staff_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_staff INTEGER NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    staff_assigned TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS staff_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    attendance_rate INTEGER CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
    performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
    incidents INTEGER DEFAULT 0,
    commendations INTEGER DEFAULT 0,
    training_completed INTEGER DEFAULT 0,
    certifications_valid INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Team Communications Table

```sql
-- Create team communications table
CREATE TABLE IF NOT EXISTS team_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipients TEXT[] NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('announcement', 'schedule', 'training', 'emergency', 'general')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_by TEXT[] DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Service Layer Enhancements

### 1. Enhanced Job Posting Service

```typescript
// Add to AdminOnboardingStaffService
static async createJobPostingWithTemplate(
  venueId: string, 
  templateType: string, 
  data: CreateJobPostingData
): Promise<JobPostingTemplate> {
  // Apply role-based template
  // Create dynamic form fields
  // Set up compliance requirements
}

static async runAutoScreening(applications: JobApplication[]): Promise<AutoScreeningResult[]> {
  // Check certifications
  // Validate age requirements
  // Check for red flags
  // Generate recommendations
}
```

### 2. Enhanced Application Review Service

```typescript
// Add bulk operations
static async bulkUpdateApplications(
  applicationIds: string[], 
  status: string, 
  feedback?: string
): Promise<void> {
  // Update multiple applications
  // Send notifications
  // Log actions
}

static async exportApplications(applications: JobApplication[]): Promise<Buffer> {
  // Generate CSV/Excel export
  // Include screening results
  // Format for reporting
}
```

### 3. Enhanced Team Management Service

```typescript
// Add shift and zone management
static async assignShift(staffId: string, shiftData: ShiftData): Promise<void> {
  // Assign staff to shift
  // Check capacity
  // Send notifications
}

static async assignZone(staffId: string, zoneData: ZoneData): Promise<void> {
  // Assign staff to zone
  // Check priority
  // Update zone capacity
}

static async trackPerformance(staffId: string, metrics: PerformanceMetrics): Promise<void> {
  // Update performance metrics
  // Generate reports
  // Trigger alerts for issues
}
```

## Implementation Roadmap

### Phase 1: Core Enhancements (Week 1-2)
1. **Database Schema Updates**
   - Apply all SQL migrations
   - Update existing data to new schema
   - Test data integrity

2. **Enhanced Job Posting Form**
   - Integrate role-based templates
   - Add dynamic form builder
   - Implement certification tracking

3. **Enhanced Application Review**
   - Add auto-screening logic
   - Implement bulk actions
   - Add advanced filtering

### Phase 2: Onboarding & Team Management (Week 3-4)
1. **Enhanced Onboarding Wizard**
   - Multi-step workflow
   - Document upload integration
   - Training module integration

2. **Enhanced Team Management**
   - Shift assignment system
   - Zone management
   - Performance tracking

### Phase 3: Advanced Features (Week 5-6)
1. **Real-time Communications**
   - Team messaging system
   - Notification system
   - Status updates

2. **Reporting & Analytics**
   - Performance dashboards
   - Export capabilities
   - Compliance reporting

## Integration Points

### 1. Main Staff Dashboard
Update `/app/admin/dashboard/staff/page.tsx` to use new components:

```typescript
// Replace existing components with enhanced versions
import EnhancedJobPostingForm from '@/components/admin/enhanced-job-posting-form'
import EnhancedApplicationReview from '@/components/admin/enhanced-application-review'
import EnhancedOnboardingWizard from '@/components/admin/enhanced-onboarding-wizard'
import EnhancedTeamManagement from '@/components/admin/enhanced-team-management'
```

### 2. Service Integration
Update service calls to use enhanced methods:

```typescript
// Enhanced job posting creation
await AdminOnboardingStaffService.createJobPostingWithTemplate(
  venueId, 
  'security', 
  jobData
)

// Auto-screening applications
const screeningResults = await AdminOnboardingStaffService.runAutoScreening(applications)

// Bulk application updates
await AdminOnboardingStaffService.bulkUpdateApplications(
  selectedIds, 
  'approved', 
  feedback
)
```

### 3. Type Updates
Update `types/admin-onboarding.ts` with new interfaces:

```typescript
// Add new interfaces for enhanced features
export interface AutoScreeningResult {
  applicationId: string
  passed: boolean
  issues: string[]
  recommendations: string[]
}

export interface ShiftData {
  id: string
  name: string
  start_time: string
  end_time: string
  date: string
  staff_assigned: string[]
  max_staff: number
}

export interface ZoneData {
  id: string
  name: string
  description: string
  staff_assigned: string[]
  max_staff: number
  priority: 'low' | 'medium' | 'high'
}
```

## Testing Strategy

### 1. Unit Tests
- Test role-based templates
- Test auto-screening logic
- Test bulk operations
- Test performance calculations

### 2. Integration Tests
- Test job posting workflow
- Test application review process
- Test onboarding wizard
- Test team management features

### 3. End-to-End Tests
- Complete job posting to hire workflow
- Multi-user team management scenarios
- High-volume application processing

## Performance Considerations

### 1. Database Optimization
- Add indexes for frequently queried fields
- Implement pagination for large datasets
- Use database views for complex queries

### 2. Caching Strategy
- Cache role templates
- Cache performance metrics
- Cache frequently accessed data

### 3. Real-time Updates
- Use Supabase real-time subscriptions
- Implement optimistic updates
- Handle offline scenarios

## Security Considerations

### 1. Data Protection
- Encrypt sensitive documents
- Implement secure file uploads
- Add audit logging for all actions

### 2. Access Control
- Implement role-based permissions
- Add data validation
- Secure API endpoints

### 3. Compliance
- GDPR compliance for personal data
- Industry-specific regulations
- Data retention policies

## Monitoring & Analytics

### 1. Key Metrics
- Application processing time
- Onboarding completion rates
- Team performance metrics
- System usage patterns

### 2. Alerts
- Failed auto-screening
- Low performance scores
- System errors
- Capacity warnings

## Conclusion

This enhancement plan provides a comprehensive upgrade to the staff management system, enabling it to handle high-volume event staffing scenarios with advanced features for job posting, application review, onboarding, and team management. The modular approach allows for phased implementation while maintaining system stability.

The enhanced system will support:
- **Security teams** (200+ guards) with license validation and zone assignment
- **Bartender teams** (100 staff) with age verification and alcohol licensing
- **Street teams** (400+ volunteers) with training tracking and performance monitoring

All components are designed to be scalable, type-safe, and follow the established conventions for the platform. 