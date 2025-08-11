-- Enhanced Staff Management Database Migration
-- This script adds new fields and tables for the enhanced staff management system
-- Run this after the existing setup-admin-tables-final.sql

-- =============================================================================
-- PHASE 1: ENHANCE EXISTING TABLES
-- =============================================================================

-- 1.1 Enhance job_posting_templates table with new fields
ALTER TABLE job_posting_templates 
ADD COLUMN IF NOT EXISTS event_id UUID,
ADD COLUMN IF NOT EXISTS event_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS required_certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS role_type VARCHAR(50) CHECK (role_type IN ('security', 'bartender', 'street_team', 'production', 'management', 'other')),
ADD COLUMN IF NOT EXISTS shift_duration INTEGER, -- in hours
ADD COLUMN IF NOT EXISTS age_requirement INTEGER CHECK (age_requirement >= 18),
ADD COLUMN IF NOT EXISTS background_check_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drug_test_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uniform_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS training_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS application_form_template JSONB DEFAULT '{"fields": []}';

-- 1.2 Enhance job_applications table with screening and performance fields
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS auto_screening_result JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screening_issues TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screening_recommendations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS performance_notes TEXT,
ADD COLUMN IF NOT EXISTS interview_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS interview_notes TEXT,
ADD COLUMN IF NOT EXISTS offer_made BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS offer_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS offer_details JSONB DEFAULT '{}';

-- 1.3 Enhance staff_onboarding_candidates table with compliance fields
ALTER TABLE staff_onboarding_candidates 
ADD COLUMN IF NOT EXISTS background_check_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS background_check_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS drug_test_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS drug_test_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS certifications_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certifications_verified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS training_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS training_completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS uniform_issued BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uniform_issue_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personal_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS employment_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_agreements JSONB DEFAULT '{}';

-- 1.4 Enhance staff_members table with performance and assignment fields
ALTER TABLE staff_members 
ADD COLUMN IF NOT EXISTS performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
ADD COLUMN IF NOT EXISTS attendance_rate DECIMAL(5,2) CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
ADD COLUMN IF NOT EXISTS incidents_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS commendations_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS training_completed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certifications_valid_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_performance_review TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_performance_review TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_zones TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_shifts TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}';

-- =============================================================================
-- PHASE 2: CREATE NEW TABLES
-- =============================================================================

-- 2.1 Create staff_shifts table for shift management
CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    event_id UUID,
    job_posting_id UUID,
    staff_member_id UUID NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 0, -- in minutes
    zone_assignment TEXT,
    role_assignment VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Create staff_zones table for zone management
CREATE TABLE IF NOT EXISTS staff_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    event_id UUID,
    zone_name VARCHAR(100) NOT NULL,
    zone_description TEXT,
    zone_type VARCHAR(50) NOT NULL CHECK (zone_type IN ('security', 'bartending', 'crowd_control', 'vip', 'general', 'backstage')),
    capacity INTEGER,
    required_staff_count INTEGER DEFAULT 1,
    assigned_staff_count INTEGER DEFAULT 0,
    supervisor_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Create staff_performance_metrics table for detailed performance tracking
CREATE TABLE IF NOT EXISTS staff_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID NOT NULL,
    venue_id UUID NOT NULL,
    event_id UUID,
    metric_date DATE NOT NULL,
    attendance_rate DECIMAL(5,2) CHECK (attendance_rate >= 0 AND attendance_rate <= 100),
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    incidents_count INTEGER DEFAULT 0,
    commendations_count INTEGER DEFAULT 0,
    training_completed BOOLEAN DEFAULT FALSE,
    certifications_valid BOOLEAN DEFAULT FALSE,
    customer_feedback_score DECIMAL(3,2) CHECK (customer_feedback_score >= 0 AND customer_feedback_score <= 5),
    supervisor_rating DECIMAL(3,2) CHECK (supervisor_rating >= 0 AND supervisor_rating <= 5),
    notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Create team_communications table for enhanced team messaging
CREATE TABLE IF NOT EXISTS team_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    recipients TEXT[] NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('announcement', 'schedule', 'training', 'emergency', 'general', 'performance', 'compliance')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_by TEXT[] DEFAULT '{}',
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledged_by TEXT[] DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.5 Create staff_training_records table for training tracking
CREATE TABLE IF NOT EXISTS staff_training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID NOT NULL,
    venue_id UUID NOT NULL,
    training_type VARCHAR(100) NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    training_description TEXT,
    completion_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'failed')),
    score DECIMAL(5,2) CHECK (score >= 0 AND score <= 100),
    instructor_id UUID,
    training_materials TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Create staff_certifications table for certification tracking
CREATE TABLE IF NOT EXISTS staff_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_member_id UUID NOT NULL,
    venue_id UUID NOT NULL,
    certification_name VARCHAR(255) NOT NULL,
    certification_type VARCHAR(100) NOT NULL,
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiration_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'revoked')),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PHASE 3: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- 3.1 Indexes for enhanced job_posting_templates
CREATE INDEX IF NOT EXISTS idx_job_posting_templates_role_type ON job_posting_templates(role_type);
CREATE INDEX IF NOT EXISTS idx_job_posting_templates_event_id ON job_posting_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_job_posting_templates_event_date ON job_posting_templates(event_date);

-- 3.2 Indexes for enhanced job_applications
CREATE INDEX IF NOT EXISTS idx_job_applications_rating ON job_applications(rating);
CREATE INDEX IF NOT EXISTS idx_job_applications_interview_scheduled ON job_applications(interview_scheduled);
CREATE INDEX IF NOT EXISTS idx_job_applications_offer_made ON job_applications(offer_made);

-- 3.3 Indexes for enhanced staff_onboarding_candidates
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_candidates_background_check ON staff_onboarding_candidates(background_check_completed);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_candidates_drug_test ON staff_onboarding_candidates(drug_test_completed);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_candidates_training ON staff_onboarding_candidates(training_completed);

-- 3.4 Indexes for enhanced staff_members
CREATE INDEX IF NOT EXISTS idx_staff_members_performance_rating ON staff_members(performance_rating);
CREATE INDEX IF NOT EXISTS idx_staff_members_attendance_rate ON staff_members(attendance_rate);
CREATE INDEX IF NOT EXISTS idx_staff_members_last_performance_review ON staff_members(last_performance_review);

-- 3.5 Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_staff_shifts_venue_id ON staff_shifts(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_job_posting_id ON staff_shifts(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_member_id ON staff_shifts(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_shift_date ON staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON staff_shifts(status);

CREATE INDEX IF NOT EXISTS idx_staff_zones_venue_id ON staff_zones(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_zones_event_id ON staff_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_staff_zones_zone_type ON staff_zones(zone_type);

CREATE INDEX IF NOT EXISTS idx_staff_performance_metrics_staff_member_id ON staff_performance_metrics(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_performance_metrics_metric_date ON staff_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_staff_performance_metrics_venue_id ON staff_performance_metrics(venue_id);

CREATE INDEX IF NOT EXISTS idx_team_communications_venue_id ON team_communications(venue_id);
CREATE INDEX IF NOT EXISTS idx_team_communications_message_type ON team_communications(message_type);
CREATE INDEX IF NOT EXISTS idx_team_communications_priority ON team_communications(priority);

CREATE INDEX IF NOT EXISTS idx_staff_training_records_staff_member_id ON staff_training_records(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_training_records_training_type ON staff_training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_staff_training_records_status ON staff_training_records(status);

CREATE INDEX IF NOT EXISTS idx_staff_certifications_staff_member_id ON staff_certifications(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_certification_type ON staff_certifications(certification_type);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_status ON staff_certifications(status);

-- =============================================================================
-- PHASE 4: CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- 4.1 Create triggers for new tables
CREATE TRIGGER update_staff_shifts_updated_at BEFORE UPDATE ON staff_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_zones_updated_at BEFORE UPDATE ON staff_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_performance_metrics_updated_at BEFORE UPDATE ON staff_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_communications_updated_at BEFORE UPDATE ON team_communications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_training_records_updated_at BEFORE UPDATE ON staff_training_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_certifications_updated_at BEFORE UPDATE ON staff_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- PHASE 5: INSERT SAMPLE DATA FOR TESTING
-- =============================================================================

-- 5.1 Sample role-based job postings
INSERT INTO job_posting_templates (venue_id, created_by, title, description, department, position, employment_type, location, experience_level, status, requirements, responsibilities, role_type, required_certifications, background_check_required, drug_test_required, uniform_provided, training_provided, age_requirement, shift_duration)
VALUES 
    (uuid_generate_v4(), uuid_generate_v4(), 'Security Guard - Event Security', 'Maintain safety and security at large-scale events', 'Security', 'Security Guard', 'part_time', 'Los Angeles, CA', 'entry', 'published', ARRAY['Valid security license', 'Previous security experience', 'Physical fitness', 'First Aid/CPR certification'], ARRAY['Monitor event areas', 'Handle crowd control', 'Report incidents', 'Check credentials'], 'security', ARRAY['Security License', 'First Aid/CPR'], TRUE, TRUE, TRUE, TRUE, 21, 8),
    (uuid_generate_v4(), uuid_generate_v4(), 'Bartender - Premium Events', 'Serve beverages and maintain bar operations at high-end events', 'Food & Beverage', 'Bartender', 'part_time', 'New York, NY', 'mid', 'published', ARRAY['Valid alcohol serving license', 'Previous bartending experience', 'Age 21+', 'Food handler certificate'], ARRAY['Serve beverages', 'Maintain bar cleanliness', 'Check IDs', 'Handle cash transactions'], 'bartender', ARRAY['Alcohol Serving License', 'Food Handler Certificate'], TRUE, FALSE, TRUE, TRUE, 21, 6),
    (uuid_generate_v4(), uuid_generate_v4(), 'Street Team Member - Event Promotion', 'Promote events and engage with the community', 'Marketing', 'Street Team Member', 'part_time', 'Miami, FL', 'entry', 'published', ARRAY['Outgoing personality', 'Reliable transportation', 'Flexible schedule', 'Social media savvy'], ARRAY['Distribute promotional materials', 'Engage with potential attendees', 'Report feedback', 'Social media promotion'], 'street_team', ARRAY[], FALSE, FALSE, TRUE, TRUE, 18, 4);

-- 5.2 Sample zones for different event types
INSERT INTO staff_zones (venue_id, event_id, zone_name, zone_description, zone_type, capacity, required_staff_count, supervisor_id)
VALUES 
    (uuid_generate_v4(), uuid_generate_v4(), 'Main Entrance', 'Primary security checkpoint and crowd control', 'security', 500, 3, uuid_generate_v4()),
    (uuid_generate_v4(), uuid_generate_v4(), 'VIP Lounge', 'Exclusive area for VIP guests', 'vip', 50, 2, uuid_generate_v4()),
    (uuid_generate_v4(), uuid_generate_v4(), 'Main Bar', 'Primary beverage service area', 'bartending', 200, 4, uuid_generate_v4()),
    (uuid_generate_v4(), uuid_generate_v4(), 'Dance Floor', 'Crowd control and safety monitoring', 'crowd_control', 300, 2, uuid_generate_v4());

-- 5.3 Sample performance metrics
INSERT INTO staff_performance_metrics (staff_member_id, venue_id, metric_date, attendance_rate, performance_rating, incidents_count, commendations_count, training_completed, certifications_valid, customer_feedback_score, supervisor_rating)
VALUES 
    (uuid_generate_v4(), uuid_generate_v4(), CURRENT_DATE, 95.5, 4.2, 0, 3, TRUE, TRUE, 4.5, 4.3),
    (uuid_generate_v4(), uuid_generate_v4(), CURRENT_DATE, 88.0, 3.8, 1, 1, TRUE, TRUE, 4.0, 3.9),
    (uuid_generate_v4(), uuid_generate_v4(), CURRENT_DATE, 100.0, 4.8, 0, 5, TRUE, TRUE, 4.9, 4.7);

-- =============================================================================
-- PHASE 6: GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions for all new tables
GRANT ALL ON staff_shifts TO authenticated;
GRANT ALL ON staff_zones TO authenticated;
GRANT ALL ON staff_performance_metrics TO authenticated;
GRANT ALL ON team_communications TO authenticated;
GRANT ALL ON staff_training_records TO authenticated;
GRANT ALL ON staff_certifications TO authenticated;

-- Grant permissions for sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify the migration by checking table structure
SELECT 'Migration completed successfully!' as status; 