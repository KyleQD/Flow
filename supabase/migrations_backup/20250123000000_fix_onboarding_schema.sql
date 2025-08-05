-- =============================================================================
-- FIX ONBOARDING SCHEMA ISSUES
-- This migration fixes the missing employment_type column and foreign key relationships
-- =============================================================================

-- Add missing employment_type column to staff_onboarding_templates
ALTER TABLE staff_onboarding_templates 
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'full_time' 
CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer', 'intern'));

-- Add missing required_fields column to staff_onboarding_templates
ALTER TABLE staff_onboarding_templates 
ADD COLUMN IF NOT EXISTS required_fields JSONB DEFAULT '[]'::jsonb;

-- Add foreign key constraint for template_id in staff_onboarding_candidates
ALTER TABLE staff_onboarding_candidates 
ADD CONSTRAINT IF NOT EXISTS fk_onboarding_candidates_template 
FOREIGN KEY (template_id) REFERENCES staff_onboarding_templates(id) ON DELETE SET NULL;

-- Add missing columns to staff_onboarding_candidates for enhanced functionality
ALTER TABLE staff_onboarding_candidates 
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS onboarding_responses JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Update status check constraint to include 'approved'
ALTER TABLE staff_onboarding_candidates 
DROP CONSTRAINT IF EXISTS staff_onboarding_candidates_status_check;

ALTER TABLE staff_onboarding_candidates 
ADD CONSTRAINT staff_onboarding_candidates_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'approved'));

-- Update stage check constraint to include new stages
ALTER TABLE staff_onboarding_candidates 
DROP CONSTRAINT IF EXISTS staff_onboarding_candidates_stage_check;

ALTER TABLE staff_onboarding_candidates 
ADD CONSTRAINT staff_onboarding_candidates_stage_check 
CHECK (stage IN ('invitation', 'onboarding', 'review', 'approved', 'rejected'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_template_id ON staff_onboarding_candidates(template_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_candidates_invitation_token ON staff_onboarding_candidates(invitation_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_employment_type ON staff_onboarding_templates(employment_type);

-- Add RLS policies for the new columns
ALTER TABLE staff_onboarding_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_onboarding_templates ENABLE ROW LEVEL SECURITY;

-- Policy for staff_onboarding_candidates
CREATE POLICY "Users can view candidates for their venues" ON staff_onboarding_candidates
FOR SELECT USING (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert candidates for their venues" ON staff_onboarding_candidates
FOR INSERT WITH CHECK (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update candidates for their venues" ON staff_onboarding_candidates
FOR UPDATE USING (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Policy for staff_onboarding_templates
CREATE POLICY "Users can view templates for their venues" ON staff_onboarding_templates
FOR SELECT USING (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert templates for their venues" ON staff_onboarding_templates
FOR INSERT WITH CHECK (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update templates for their venues" ON staff_onboarding_templates
FOR UPDATE USING (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete templates for their venues" ON staff_onboarding_templates
FOR DELETE USING (
  venue_id IN (
    SELECT id FROM venue_profiles 
    WHERE user_id = auth.uid()
  )
); 