# Staff Management System - Technical Documentation

## 🏗️ **Architecture Overview**

### **System Components**
- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Framework**: Shadcn UI, Radix UI, Tailwind CSS
- **State Management**: React Server Components, React Hooks
- **API**: Next.js API Routes with Supabase integration

### **Database Schema**
```sql
-- Core tables for staff management
CREATE TABLE admin_onboarding_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  stage TEXT DEFAULT 'invitation',
  onboarding_progress INTEGER DEFAULT 0,
  experience_years INTEGER,
  skills TEXT[],
  application_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_onboarding_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  estimated_days INTEGER,
  required_documents TEXT[],
  steps JSONB
);

CREATE TABLE admin_job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  requirements TEXT[],
  compensation TEXT,
  schedule TEXT,
  status TEXT DEFAULT 'draft',
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES admin_job_postings(id),
  applicant_id UUID REFERENCES users(id),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  status TEXT DEFAULT 'pending',
  form_responses JSONB,
  applied_at TIMESTAMP DEFAULT NOW(),
  rating DECIMAL(3,2)
);
```

## 🔧 **Service Layer**

### **AdminOnboardingStaffService**
```typescript
class AdminOnboardingStaffService {
  // Dashboard statistics
  static async getDashboardStats(venueId: string): Promise<DashboardStats>
  
  // Job posting management
  static async createJobPosting(venueId: string, data: JobPostingData): Promise<JobPosting>
  static async updateJobPosting(id: string, data: Partial<JobPostingData>): Promise<JobPosting>
  static async deleteJobPosting(id: string): Promise<void>
  
  // Application management
  static async getApplications(venueId: string): Promise<Application[]>
  static async updateApplicationStatus(id: string, status: string): Promise<Application>
  static async bulkUpdateApplications(ids: string[], status: string): Promise<void>
  
  // Onboarding management
  static async getOnboardingCandidates(venueId: string): Promise<OnboardingCandidate[]>
  static async updateOnboardingProgress(id: string, progress: number): Promise<OnboardingCandidate>
  static async completeOnboardingStep(id: string, stepId: string): Promise<void>
  
  // Team management
  static async getStaffMembers(venueId: string): Promise<StaffMember[]>
  static async updateStaffStatus(id: string, status: string): Promise<StaffMember>
  static async assignShift(staffId: string, shiftData: ShiftData): Promise<void>
}
```

### **Enhanced Staff Analytics Service**
```typescript
class EnhancedStaffAnalyticsService {
  // Performance analytics
  static async getPerformanceMetrics(venueId: string): Promise<PerformanceMetrics>
  
  // Onboarding analytics
  static async getOnboardingAnalytics(venueId: string): Promise<OnboardingAnalytics>
  
  // Application analytics
  static async getApplicationAnalytics(venueId: string): Promise<ApplicationAnalytics>
  
  // Predictive analytics
  static async getStaffingPredictions(venueId: string): Promise<StaffingPredictions>
}
```

### **Real-time Staff Service**
```typescript
class RealTimeStaffService {
  // Real-time subscriptions
  static subscribeToApplications(venueId: string, callback: (data: any) => void): Subscription
  static subscribeToOnboardingProgress(venueId: string, callback: (data: any) => void): Subscription
  static subscribeToStaffUpdates(venueId: string, callback: (data: any) => void): Subscription
  
  // Real-time notifications
  static sendNotification(userId: string, message: string): Promise<void>
  static broadcastToTeam(venueId: string, message: string): Promise<void>
}
```

## 🎨 **Component Architecture**

### **Enhanced Components**
1. **EnhancedJobPostingForm**: Dynamic job posting creation with validation
2. **EnhancedApplicationReview**: Comprehensive application management interface
3. **EnhancedOnboardingWizard**: Multi-step onboarding workflow
4. **EnhancedTeamManagement**: Staff directory and performance tracking
5. **EnhancedAnalyticsDashboard**: Real-time analytics and reporting

### **Component Structure**
```typescript
// Example component structure
interface EnhancedJobPostingFormProps {
  venueId: string
  onSubmit: (data: JobPostingData) => Promise<void>
  onCancel: () => void
}

function EnhancedJobPostingForm({ venueId, onSubmit, onCancel }: EnhancedJobPostingFormProps) {
  // Component implementation
}
```

## 🔐 **Security & Authentication**

### **Row Level Security (RLS)**
```sql
-- RLS policies for staff management tables
ALTER TABLE admin_onboarding_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_job_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access data for their venue
CREATE POLICY "Users can access their venue data" ON admin_onboarding_candidates
  FOR ALL USING (venue_id IN (
    SELECT venue_id FROM user_venues WHERE user_id = auth.uid()
  ));
```

### **Authentication Flow**
1. **User Authentication**: Supabase Auth with JWT tokens
2. **Session Management**: Automatic token refresh
3. **Route Protection**: Middleware-based route protection
4. **Role-based Access**: Admin-only access to staff management

## 📊 **API Endpoints**

### **Dashboard Statistics**
```typescript
// GET /api/admin/dashboard/stats
interface DashboardStatsResponse {
  success: boolean
  data: {
    onboarding: OnboardingStats
    job_postings: JobPostingStats
    staff_management: StaffManagementStats
  }
  error?: string
}
```

### **Job Posting Management**
```typescript
// POST /api/admin/job-postings
// PUT /api/admin/job-postings/[id]
// DELETE /api/admin/job-postings/[id]
interface JobPostingRequest {
  venue_id: string
  title: string
  department: string
  position: string
  description?: string
  requirements?: string[]
  compensation?: string
  schedule?: string
}
```

### **Application Management**
```typescript
// GET /api/admin/applications
// PUT /api/admin/applications/[id]/status
// POST /api/admin/applications/bulk-update
interface ApplicationUpdateRequest {
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  notes?: string
}
```

## 🚀 **Performance Optimization**

### **Database Optimization**
- **Indexes**: Optimized indexes on frequently queried columns
- **Query Optimization**: Efficient queries with proper joins
- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Implemented for large datasets

### **Frontend Optimization**
- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js Image component with WebP format
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Browser caching and service worker implementation

### **Real-time Performance**
- **WebSocket Connections**: Efficient real-time subscriptions
- **Debouncing**: Debounced updates to prevent excessive API calls
- **Optimistic Updates**: UI updates before server confirmation
- **Offline Support**: Cached data for offline functionality

## 🧪 **Testing Strategy**

### **Unit Testing**
```typescript
// Example unit test
describe('AdminOnboardingStaffService', () => {
  it('should create job posting successfully', async () => {
    const mockData = {
      venue_id: 'test-venue',
      title: 'Security Guard',
      department: 'Security',
      position: 'Event Security'
    }
    
    const result = await AdminOnboardingStaffService.createJobPosting(
      mockData.venue_id,
      mockData
    )
    
    expect(result).toBeDefined()
    expect(result.title).toBe(mockData.title)
  })
})
```

### **Integration Testing**
- **API Testing**: Test all API endpoints
- **Component Testing**: Test component interactions
- **Service Testing**: Test service layer integration
- **Database Testing**: Test database operations

### **End-to-End Testing**
- **User Workflows**: Test complete user journeys
- **Error Scenarios**: Test error handling
- **Performance Testing**: Test under load
- **Security Testing**: Test authentication and authorization

## 📈 **Monitoring & Analytics**

### **Performance Monitoring**
- **Page Load Times**: Track component load times
- **API Response Times**: Monitor API performance
- **Database Query Times**: Track query performance
- **Memory Usage**: Monitor memory consumption

### **Error Tracking**
- **Error Logging**: Comprehensive error logging
- **User Feedback**: Collect user-reported issues
- **Performance Alerts**: Automated performance alerts
- **Health Checks**: System health monitoring

## 🔄 **Deployment**

### **Environment Configuration**
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Deployment Steps**
1. **Build Application**: `npm run build`
2. **Run Tests**: `npm run test`
3. **Deploy to Staging**: Test in staging environment
4. **Deploy to Production**: Deploy to production environment
5. **Monitor Health**: Monitor system health post-deployment

### **CI/CD Pipeline**
```yaml
# Example GitHub Actions workflow
name: Deploy Staff Management System
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm run test
      - name: Build application
        run: npm run build
```

## 📚 **Additional Resources**

### **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### **Code Examples**
- [Component Examples](./examples/components.md)
- [Service Examples](./examples/services.md)
- [API Examples](./examples/api.md)

---

**Last Updated**: January 2024
**Version**: 1.0
**System**: Staff Management Platform 