-- Admin Onboarding & Staff Management Database Setup (Simplified)
-- This script creates the necessary tables for the admin onboarding system
-- WITHOUT Row Level Security policies to avoid column reference errors

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Job Posting Templates Table
CREATE TABLE IF NOT EXISTS job_posting_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    form_responses JSONB DEFAULT '{}',
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Workflows Table
CREATE TABLE IF NOT EXISTS onboarding_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipients TEXT[] NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('announcement', 'schedule', 'task', 'reminder', 'general')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_by TEXT[] DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Insert some sample data for testing (using UUIDs for venue_id and created_by)
INSERT INTO job_posting_templates (venue_id, created_by, title, description, department, position, employment_type, location, experience_level, status, requirements, responsibilities)
VALUES 
    (uuid_generate_v4(), uuid_generate_v4(), 'Security Guard', 'Looking for experienced security personnel for event management', 'Security', 'Security Guard', 'part_time', 'Los Angeles, CA', 'entry', 'published', ARRAY['Previous security experience', 'Valid security license'], ARRAY['Monitor event areas', 'Handle crowd control', 'Report incidents']),
    (uuid_generate_v4(), uuid_generate_v4(), 'Event Coordinator', 'Coordinate and manage event logistics', 'Operations', 'Event Coordinator', 'full_time', 'New York, NY', 'mid', 'published', ARRAY['Event planning experience', 'Strong communication skills'], ARRAY['Plan event logistics', 'Coordinate with vendors', 'Manage timelines']);

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

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 