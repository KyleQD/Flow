-- Create onboarding_templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  fields JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES staff_invitations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for onboarding_templates
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all templates
CREATE POLICY "Admin users can manage onboarding templates" ON onboarding_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can view templates (for onboarding process)
CREATE POLICY "Users can view onboarding templates" ON onboarding_templates
  FOR SELECT USING (true);

-- Add RLS policies for onboarding_responses
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Admin users can view all responses
CREATE POLICY "Admin users can view all onboarding responses" ON onboarding_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can only view their own responses
CREATE POLICY "Users can view own onboarding responses" ON onboarding_responses
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own responses
CREATE POLICY "Users can create onboarding responses" ON onboarding_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update staff_invitations to add completed status
ALTER TABLE staff_invitations 
ALTER COLUMN status TYPE TEXT;

-- Update the status check constraint if it exists
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'staff_invitations_status_check' 
    AND table_name = 'staff_invitations'
  ) THEN
    ALTER TABLE staff_invitations DROP CONSTRAINT staff_invitations_status_check;
  END IF;
END $$;

-- Add new status constraint including 'completed'
ALTER TABLE staff_invitations 
ADD CONSTRAINT staff_invitations_status_check 
CHECK (status IN ('pending', 'accepted', 'declined', 'completed'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_default ON onboarding_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_invitation ON onboarding_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON staff_invitations(status);

-- Insert a default onboarding template
INSERT INTO onboarding_templates (name, description, fields, is_default) VALUES (
  'Standard Staff Onboarding',
  'Basic information required for all new team members',
  '[
    {
      "id": "full_name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full legal name",
      "required": true,
      "description": "Your full legal name as it appears on official documents"
    },
    {
      "id": "address",
      "type": "textarea",
      "label": "Address",
      "placeholder": "Enter your complete address",
      "required": true,
      "description": "Your current residential address"
    },
    {
      "id": "phone_number",
      "type": "phone",
      "label": "Phone Number",
      "placeholder": "+1 (555) 000-0000",
      "required": true,
      "description": "Primary contact number"
    },
    {
      "id": "emergency_contact",
      "type": "text",
      "label": "Emergency Contact",
      "placeholder": "Name and phone number",
      "required": true,
      "description": "Emergency contact person and their phone number"
    },
    {
      "id": "experience_level",
      "type": "select",
      "label": "Experience Level",
      "required": true,
      "options": ["Beginner (0-1 years)", "Intermediate (2-5 years)", "Advanced (5+ years)", "Expert (10+ years)"],
      "description": "Your experience level in this field"
    },
    {
      "id": "previous_experience",
      "type": "textarea",
      "label": "Previous Experience",
      "placeholder": "Describe your relevant work experience...",
      "required": false,
      "description": "Brief description of your relevant work experience"
    },
    {
      "id": "skills",
      "type": "multiselect",
      "label": "Skills & Certifications",
      "required": false,
      "options": ["Audio Engineering", "Video Production", "Event Management", "Technical Support", "Safety Training", "First Aid Certified", "Equipment Operation"],
      "description": "Select all that apply to you"
    },
    {
      "id": "availability",
      "type": "multiselect",
      "label": "Availability",
      "required": true,
      "options": ["Weekdays", "Weekends", "Evenings", "Early Mornings", "Travel Available", "On-call Available"],
      "description": "When are you typically available to work?"
    },
    {
      "id": "references",
      "type": "textarea",
      "label": "References",
      "placeholder": "Name, relationship, and contact information",
      "required": false,
      "description": "Professional references (optional)"
    },
    {
      "id": "terms_agreement",
      "type": "checkbox",
      "label": "Terms and Conditions",
      "placeholder": "I agree to the terms and conditions of employment",
      "required": true,
      "description": "You must agree to the terms and conditions to proceed"
    }
  ]'::jsonb,
  true
);

-- Create function to handle onboarding notifications
CREATE OR REPLACE FUNCTION handle_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for admin when onboarding is completed
  INSERT INTO notifications (
    type,
    content,
    metadata,
    created_at
  ) VALUES (
    'onboarding_completed',
    'A team member has completed their onboarding',
    jsonb_build_object(
      'onboardingId', NEW.id,
      'userId', NEW.user_id,
      'invitationId', NEW.invitation_id
    ),
    CURRENT_TIMESTAMP
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for onboarding completion notifications
DROP TRIGGER IF EXISTS onboarding_completion_notification ON onboarding_responses;
CREATE TRIGGER onboarding_completion_notification
  AFTER INSERT ON onboarding_responses
  FOR EACH ROW
  EXECUTE FUNCTION handle_onboarding_completion(); 