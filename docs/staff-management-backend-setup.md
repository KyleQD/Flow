# 🚀 Staff Management & Job Board - Complete Backend Setup

## Overview

This document provides step-by-step instructions for setting up the complete Supabase backend for our enhanced staff management and job board system. The system includes job postings, applications with AI matching, comprehensive onboarding workflows, communication tools, and analytics.

## 🎯 Features Included

### ✅ **Enhanced Job Board**
- **Advanced Job Postings**: Priority levels, salary ranges, skill requirements, deadlines
- **AI-Powered Matching**: Automatic candidate scoring based on skills, experience, availability
- **Bulk Application Management**: Review, approve, reject multiple applications at once
- **Smart Filtering**: Sort by match score, rating, status, department

### ✅ **Comprehensive Onboarding System**
- **Template-Based Workflows**: Reusable onboarding processes for different positions
- **Progress Tracking**: Visual progress indicators and milestone completion
- **Activity Logging**: Track every action taken during onboarding
- **Document Management**: Required documents and completion status

### ✅ **Communication Hub**
- **Broadcast Messaging**: Send announcements to all staff or specific departments
- **Priority Levels**: Low, normal, high, urgent message classification
- **Message History**: Track all communications with read receipts

### ✅ **Analytics & Reporting**
- **Hiring Metrics**: Time to hire, conversion rates, application volumes
- **Department Analytics**: Performance metrics by department
- **Skill Demand Analysis**: Most requested skills and trends

## 📋 Prerequisites

- Supabase project set up and running
- Database access via Supabase Dashboard SQL Editor
- Venue profiles already created in your system

## 🛠️ Installation Steps

### Step 1: Run the Main Migration

1. **Open Supabase Dashboard** → Go to your project
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy and paste** the contents of `supabase/migrations/20250620100000_complete_staff_job_board_system.sql`
4. **Click "Run"** to execute the migration

This migration will:
- ✅ Enhance existing `staff_jobs` and `staff_applications` tables
- ✅ Create 7 new tables for comprehensive functionality
- ✅ Set up 3 storage buckets for documents and photos
- ✅ Configure Row Level Security policies
- ✅ Add performance indexes
- ✅ Create AI matching functions
- ✅ Set up automatic triggers

### Step 2: Add Sample Data (Optional)

For testing and demonstration purposes:

1. **In SQL Editor**, run: `supabase/seed-staff-management-data.sql`
2. This creates realistic sample data including:
   - 3 job postings (Sound Engineer, Security Guard, Event Coordinator)
   - 3 job applications with AI match scores
   - 2 onboarding templates with detailed steps
   - 1 active onboarding candidate
   - Sample staff messages and activities

### Step 3: Verify Setup

1. **Check Tables**: Go to Table Editor and verify these tables exist:
   - `staff_onboarding_candidates`
   - `staff_onboarding_templates`
   - `staff_onboarding_steps`
   - `staff_onboarding_activities`
   - `staff_messages`
   - `staff_contracts`

2. **Check Storage**: Go to Storage and verify these buckets exist:
   - `staff-resumes` (private)
   - `staff-documents` (private)
   - `staff-photos` (public)

3. **Test Functions**: In SQL Editor, test the dashboard stats:
   ```sql
   SELECT get_staff_dashboard_stats('your-venue-id-here');
   ```

## 📊 Database Schema Overview

### **Core Tables**

#### **staff_jobs** (Enhanced)
- **New Fields**: `venue_id`, `job_type`, `salary_range_min/max`, `priority`, `required_skills`, `benefits`
- **Purpose**: Advanced job posting management with venue integration

#### **staff_applications** (Enhanced)  
- **New Fields**: `applicant_name`, `skills`, `ai_match_score`, `rating`, `experience_years`
- **Purpose**: Comprehensive application tracking with AI matching

#### **staff_onboarding_candidates**
- **Purpose**: Track candidates through the onboarding pipeline
- **Key Fields**: `status`, `stage`, `onboarding_progress`, `template_id`

#### **staff_onboarding_templates**
- **Purpose**: Reusable onboarding workflows for different positions
- **Key Fields**: `name`, `department`, `estimated_days`, `steps`

#### **staff_onboarding_steps**
- **Purpose**: Individual steps within onboarding templates
- **Key Fields**: `step_type`, `category`, `estimated_hours`, `completion_criteria`

#### **staff_onboarding_activities**
- **Purpose**: Track all activities and progress during onboarding
- **Key Fields**: `activity_type`, `status`, `completed_at`

#### **staff_messages**
- **Purpose**: Internal communication system
- **Key Fields**: `message_type`, `priority`, `recipients`, `read_by`

#### **staff_contracts**
- **Purpose**: Contract management and digital signatures
- **Key Fields**: `contract_type`, `status`, `signatures`, `terms`

### **Storage Buckets**

#### **staff-resumes** (Private, 10MB)
- **Purpose**: Store candidate resumes securely
- **Access**: Venue owners can access resumes for their job applications

#### **staff-documents** (Private, 10MB)
- **Purpose**: Store contracts, onboarding documents, certifications
- **Access**: Venue-specific document access

#### **staff-photos** (Public, 5MB)
- **Purpose**: Staff profile photos and team images
- **Access**: Public read, authenticated upload

## 🔧 Key Functions

### **calculate_ai_match_score(application_id, job_id)**
- **Purpose**: Calculate AI matching score based on skills, experience, availability
- **Returns**: Integer score 0-100
- **Usage**: Automatically called when applications are created/updated

### **get_staff_dashboard_stats(venue_id)**
- **Purpose**: Get comprehensive dashboard statistics
- **Returns**: JSON object with metrics
- **Includes**: Total jobs, applications, onboarding candidates, staff count

### **update_job_applications_count()**
- **Purpose**: Automatically update application counts on job postings
- **Trigger**: Runs when applications are inserted/deleted

## 🔒 Security Features

### **Row Level Security (RLS)**
- ✅ **Venue Isolation**: Users can only access data for their venues
- ✅ **Role-Based Access**: Different access levels for venue owners vs staff
- ✅ **Storage Security**: File access restricted by venue ownership

### **Data Validation**
- ✅ **Check Constraints**: Validate status values, progress percentages
- ✅ **Foreign Key Constraints**: Ensure data integrity across tables
- ✅ **Required Fields**: Critical fields marked as NOT NULL

## 📱 Frontend Integration

### **Service Layer**
The system includes a comprehensive TypeScript service layer:
```typescript
import { StaffJobBoardService } from '@/lib/services/staff-job-board.service'

// Create job posting
const job = await StaffJobBoardService.createJobPosting(venueId, jobData)

// Get applications with AI scores
const apps = await StaffJobBoardService.getJobApplications(venueId)

// Start onboarding process
const candidate = await StaffJobBoardService.hireFromApplication(appId, venueId)
```

### **Component Integration**
Ready-to-use with existing components:
- `app/venue/staff/components/job-board-integration.tsx`
- `app/venue/staff/components/onboarding-wizard.tsx`
- `app/venue/staff/components/staff-onboarding-system.tsx`

## 🚀 Usage Examples

### **Creating a Job Posting**
```typescript
const jobData = {
  title: "Sound Engineer",
  department: "Technical",
  job_type: "full-time",
  salary_range_min: 65000,
  salary_range_max: 80000,
  priority: "high",
  required_skills: ["Pro Tools", "Live Sound", "Mixing"],
  deadline: "2024-07-15"
}

const job = await StaffJobBoardService.createJobPosting(venueId, jobData)
```

### **Processing Applications**
```typescript
// Get all applications for venue
const applications = await StaffJobBoardService.getJobApplications(venueId)

// Update application status
await StaffJobBoardService.updateApplicationStatus(appId, "reviewed", {
  rating: 4.5,
  notes: "Strong candidate, schedule interview"
})

// Hire candidate and start onboarding
const candidate = await StaffJobBoardService.hireFromApplication(appId, venueId)
```

### **Managing Onboarding**
```typescript
// Get onboarding templates
const templates = await StaffJobBoardService.getOnboardingTemplates(venueId)

// Update progress
await StaffJobBoardService.updateOnboardingProgress(candidateId, 75, "training")

// Get dashboard stats
const stats = await StaffJobBoardService.getDashboardStats(venueId)
```

## 📈 Analytics Queries

### **Hiring Metrics**
```sql
-- Average time to hire
SELECT AVG(DATE_PART('day', hired_date - created_at)) as avg_days_to_hire
FROM staff_applications 
WHERE status = 'hired' AND hired_date IS NOT NULL;

-- Application conversion rates by department
SELECT 
  sj.department,
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE sa.status = 'hired') as hired_count,
  ROUND(
    COUNT(*) FILTER (WHERE sa.status = 'hired')::decimal / COUNT(*) * 100, 2
  ) as conversion_rate
FROM staff_applications sa
JOIN staff_jobs sj ON sa.job_id = sj.id
GROUP BY sj.department;
```

### **Onboarding Analytics**
```sql
-- Average onboarding completion time
SELECT 
  department,
  AVG(onboarding_progress) as avg_progress,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count
FROM staff_onboarding_candidates
GROUP BY department;
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Migration Fails**
   - Check if venue_profiles table exists
   - Ensure user has sufficient permissions
   - Run migrations in order

2. **AI Matching Not Working**
   - Verify calculate_ai_match_score function exists
   - Check if skills arrays are properly formatted
   - Test function manually in SQL editor

3. **Storage Upload Fails**
   - Verify storage buckets were created
   - Check RLS policies are correct
   - Ensure file types are allowed

4. **Performance Issues**
   - Check if indexes were created properly
   - Monitor query performance in dashboard
   - Consider adding more specific indexes

### **Verification Queries**

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'staff_%';

-- Verify storage buckets
SELECT * FROM storage.buckets WHERE name LIKE 'staff-%';

-- Test AI matching function
SELECT calculate_ai_match_score(
  'application-id-here', 
  'job-id-here'
);

-- Check sample data
SELECT COUNT(*) as job_count FROM staff_jobs;
SELECT COUNT(*) as application_count FROM staff_applications;
SELECT COUNT(*) as candidate_count FROM staff_onboarding_candidates;
```

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs**: Dashboard → Logs → Check for errors
2. **Verify Permissions**: Ensure user has necessary database permissions
3. **Test Individual Components**: Test each function independently
4. **Review Documentation**: Check this guide and Supabase docs

## 🎉 Next Steps

After setup is complete:

1. ✅ **Test the Job Board**: Create job postings and applications
2. ✅ **Try Onboarding**: Set up templates and process candidates  
3. ✅ **Send Messages**: Test the communication system
4. ✅ **Review Analytics**: Check dashboard statistics
5. ✅ **Customize**: Adapt templates and workflows to your needs

---

**🎯 Your staff management and job board system is now ready for production use!** 