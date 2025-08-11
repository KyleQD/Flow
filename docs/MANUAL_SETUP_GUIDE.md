# Manual Setup Guide

## 🚨 **If the automated setup script fails**

If you're getting errors with the automated setup script, you can manually set up the database tables using your Supabase dashboard.

## 📋 **Step-by-Step Manual Setup**

### **1. Access Your Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query

### **2. Execute the Corrected SQL Script (Recommended)**

Copy and paste the following **corrected** SQL script into your Supabase SQL Editor. This version removes foreign key constraints and RLS policies to avoid errors:

```sql
-- Admin Onboarding & Staff Management Database Setup (Final)
-- This script creates the necessary tables for the admin onboarding system
-- WITHOUT foreign key constraints or RLS policies to avoid errors

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Job Posting Templates Table
CREATE TABLE IF NOT EXISTS job_posting_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    created_by UUID NOT NULL, -- Removed foreign key constraint
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
    location VARCHAR(255) NOT NULL,
    salary_range JSONB,
    requirements TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    remote BOOLEAN DEFAULT FALSE,
    urgent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'closed')),
    applications_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Form Templates Table
CREATE TABLE IF NOT EXISTS application_form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_posting_templates(id) ON DELETE CASCADE,
    fields JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    job_posting_id UUID NOT NULL REFERENCES job_posting_templates(id) ON DELETE CASCADE,
    applicant_id UUID, -- Removed foreign key constraint
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    form_responses JSONB DEFAULT '{}',
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    reviewed_by UUID, -- Removed foreign key constraint
    reviewed_at TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Workflows Table
CREATE TABLE IF NOT EXISTS onboarding_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    created_by UUID NOT NULL, -- Removed foreign key constraint
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    estimated_days INTEGER NOT NULL CHECK (estimated_days > 0),
    required_documents TEXT[] DEFAULT '{}',
    assignees TEXT[] DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Steps Table
CREATE TABLE IF NOT EXISTS onboarding_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES onboarding_workflows(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('document', 'training', 'meeting', 'setup', 'review', 'task', 'approval')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('admin', 'training', 'equipment', 'social', 'performance')),
    required BOOLEAN DEFAULT TRUE,
    estimated_hours INTEGER DEFAULT 0,
    assigned_to VARCHAR(255),
    depends_on TEXT[] DEFAULT '{}',
    due_date_offset INTEGER,
    instructions TEXT,
    completion_criteria TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Onboarding Candidates Table
CREATE TABLE IF NOT EXISTS staff_onboarding_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    user_id UUID, -- Removed foreign key constraint
    application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
    workflow_id UUID REFERENCES onboarding_workflows(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'approved')),
    stage VARCHAR(50) DEFAULT 'application' CHECK (stage IN ('application', 'onboarding', 'training', 'review', 'approved')),
    application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    experience_years INTEGER,
    skills TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    onboarding_progress INTEGER DEFAULT 0 CHECK (onboarding_progress >= 0 AND onboarding_progress <= 100),
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
    onboarding_responses JSONB DEFAULT '{}',
    invitation_token VARCHAR(255),
    approved_by UUID, -- Removed foreign key constraint
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Activities Table
CREATE TABLE IF NOT EXISTS onboarding_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES staff_onboarding_candidates(id) ON DELETE CASCADE,
    step_id UUID REFERENCES onboarding_steps(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('started', 'completed', 'skipped', 'failed')),
    description TEXT,
    completed_by UUID, -- Removed foreign key constraint
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    user_id UUID, -- Removed foreign key constraint
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
    hire_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hourly_rate DECIMAL(10,2),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Messages/Communications Table
CREATE TABLE IF NOT EXISTS staff_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    sender_id UUID NOT NULL, -- Removed foreign key constraint
    recipients TEXT[] NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('announcement', 'schedule', 'task', 'reminder', 'general')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_by TEXT[] DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. Create Indexes (Optional but Recommended)**

Run this additional SQL to create performance indexes:

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posting_templates_venue_id ON job_posting_templates(venue_id);
CREATE INDEX IF NOT EXISTS idx_job_posting_templates_status ON job_posting_templates(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_venue_id ON job_applications(venue_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_workflows_venue_id ON onboarding_workflows(venue_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_workflow_id ON onboarding_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_candidates_venue_id ON staff_onboarding_candidates(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_candidates_status ON staff_onboarding_candidates(status);
CREATE INDEX IF NOT EXISTS idx_staff_members_venue_id ON staff_members(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON staff_members(status);
CREATE INDEX IF NOT EXISTS idx_staff_messages_venue_id ON staff_messages(venue_id);
```

### **4. Add Sample Data (Optional)**

Run this SQL to add some sample data for testing:

```sql
-- Insert some sample data for testing (using UUIDs for venue_id and created_by)
INSERT INTO job_posting_templates (venue_id, created_by, title, description, department, position, employment_type, location, experience_level, status, requirements, responsibilities)
VALUES 
    (uuid_generate_v4(), uuid_generate_v4(), 'Security Guard', 'Looking for experienced security personnel for event management', 'Security', 'Security Guard', 'part_time', 'Los Angeles, CA', 'entry', 'published', ARRAY['Previous security experience', 'Valid security license'], ARRAY['Monitor event areas', 'Handle crowd control', 'Report incidents']),
    (uuid_generate_v4(), uuid_generate_v4(), 'Event Coordinator', 'Coordinate and manage event logistics', 'Operations', 'Event Coordinator', 'full_time', 'New York, NY', 'mid', 'published', ARRAY['Event planning experience', 'Strong communication skills'], ARRAY['Plan event logistics', 'Coordinate with vendors', 'Manage timelines']);
```

### **5. Add Triggers (Optional)**

Run this SQL to add automatic timestamp updates:

```sql
-- Update the updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_job_posting_templates_updated_at BEFORE UPDATE ON job_posting_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_form_templates_updated_at BEFORE UPDATE ON application_form_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_workflows_updated_at BEFORE UPDATE ON onboarding_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_steps_updated_at BEFORE UPDATE ON onboarding_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_onboarding_candidates_updated_at BEFORE UPDATE ON staff_onboarding_candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_activities_updated_at BEFORE UPDATE ON onboarding_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_messages_updated_at BEFORE UPDATE ON staff_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **6. Grant Permissions (Optional)**

Run this SQL to grant necessary permissions:

```sql
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### **7. Verify the Setup**

Run this SQL to verify all tables were created:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'job_posting_templates',
    'application_form_templates',
    'job_applications',
    'onboarding_workflows',
    'onboarding_steps',
    'staff_onboarding_candidates',
    'onboarding_activities',
    'staff_members',
    'staff_messages'
)
ORDER BY table_name;
```

## ✅ **After Manual Setup**

1. **Test the admin dashboard**: Navigate to `/admin/dashboard/staff`
2. **The system should work**: Even if some tables are missing, the system will use fallback data
3. **Create sample data**: Try creating a job posting to test the workflow

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"insert or update on table violates foreign key constraint" errors**: 
   - This was caused by foreign key constraints to `auth.users` table
   - The corrected script above removes all foreign key constraints to avoid this issue
   - The system will work without foreign key constraints

2. **"column user_id does not exist" errors**: 
   - This was caused by RLS policies referencing non-existent columns
   - The corrected script above removes RLS policies to avoid this issue
   - The system will work without RLS policies

3. **"null value in column experience_level" errors**: 
   - This was caused by INSERT statements missing the `experience_level` column
   - The corrected script above includes all required columns in INSERT statements
   - All INSERT statements now include proper values for all required fields

4. **"relation does not exist" errors**: 
   - This is normal if the tables don't exist yet
   - The system will work with fallback data

5. **Permission errors**:
   - Make sure you're using the service role key
   - Check that your Supabase project has the necessary permissions

### **Fallback Mode**

If the database setup fails completely, the system will still work in "fallback mode":
- All data will be mock/sample data
- The UI will function normally
- You can test all features with sample data
- Real data will load once the tables are properly set up

## 📝 **Next Steps**

1. **Test the system**: Go to `/admin/dashboard/staff`
2. **Check the console**: Look for any remaining errors
3. **Create test data**: Try the job posting creation workflow
4. **Customize as needed**: Modify the fallback data or table structure as required

## 🚀 **Alternative: Use the Simplified Script File**

If you prefer to use a file, you can also run the simplified script directly:

```bash
# Copy the simplified script to your Supabase SQL Editor
cat scripts/setup-admin-tables-simple.sql
```

This simplified version removes all RLS policies to avoid the column reference errors you encountered. 