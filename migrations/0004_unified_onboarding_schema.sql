-- Migration: Unified Onboarding Schema
-- This migration consolidates the onboarding tables into a unified schema
-- Date: January 2025

-- Step 1: Create the unified onboarding_flows table
CREATE TABLE IF NOT EXISTS onboarding_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('artist', 'venue', 'staff', 'invitation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  template_id UUID,
  responses JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional flow-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, flow_type)
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_flows_user_id ON onboarding_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_flows_flow_type ON onboarding_flows(flow_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_flows_status ON onboarding_flows(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_flows_created_at ON onboarding_flows(created_at);

-- Step 3: Create a unified onboarding_templates table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('artist', 'venue', 'staff', 'invitation')),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for templates
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_flow_type ON onboarding_templates(flow_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_is_default ON onboarding_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_is_active ON onboarding_templates(is_active);

-- Step 5: Add foreign key constraint to onboarding_flows
ALTER TABLE onboarding_flows 
ADD CONSTRAINT fk_onboarding_flows_template 
FOREIGN KEY (template_id) REFERENCES onboarding_templates(id) ON DELETE SET NULL;

-- Step 6: Create RLS policies for onboarding_flows
ALTER TABLE onboarding_flows ENABLE ROW LEVEL SECURITY;

-- Users can view their own onboarding flows
CREATE POLICY "Users can view their own onboarding flows" ON onboarding_flows
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own onboarding flows
CREATE POLICY "Users can update their own onboarding flows" ON onboarding_flows
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own onboarding flows
CREATE POLICY "Users can insert their own onboarding flows" ON onboarding_flows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin users can view all onboarding flows
CREATE POLICY "Admin users can view all onboarding flows" ON onboarding_flows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Step 7: Create RLS policies for onboarding_templates
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

-- Users can view active templates
CREATE POLICY "Users can view active onboarding templates" ON onboarding_templates
  FOR SELECT USING (is_active = true);

-- Step 8: Insert default templates for each flow type
INSERT INTO onboarding_templates (name, description, flow_type, fields, is_default) VALUES
(
  'Artist Profile Setup',
  'Basic information required for artist accounts',
  'artist',
  '[
    {
      "id": "artist_name",
      "type": "text",
      "label": "Artist Name",
      "placeholder": "Enter your artist or stage name",
      "required": true,
      "description": "Your artist or stage name as it appears on your music"
    },
    {
      "id": "bio",
      "type": "textarea",
      "label": "Bio",
      "placeholder": "Tell the world about your music and artistic journey...",
      "required": false,
      "description": "A brief description of your music and artistic background"
    },
    {
      "id": "genres",
      "type": "multiselect",
      "label": "Genres",
      "required": false,
      "options": ["Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", "Country", "R&B", "Folk", "Metal", "Punk", "Indie", "Alternative", "Blues", "Reggae", "World", "Other"],
      "description": "Select the genres that best describe your music"
    },
    {
      "id": "instagram",
      "type": "text",
      "label": "Instagram",
      "placeholder": "@your_handle",
      "required": false,
      "description": "Your Instagram handle"
    },
    {
      "id": "spotify",
      "type": "text",
      "label": "Spotify",
      "placeholder": "Spotify artist URL",
      "required": false,
      "description": "Link to your Spotify artist page"
    }
  ]'::jsonb,
  true
),
(
  'Venue Profile Setup',
  'Basic information required for venue accounts',
  'venue',
  '[
    {
      "id": "venue_name",
      "type": "text",
      "label": "Venue Name",
      "placeholder": "Name of your venue or event space",
      "required": true,
      "description": "The official name of your venue"
    },
    {
      "id": "description",
      "type": "textarea",
      "label": "Description",
      "placeholder": "Describe your venue, its atmosphere, and what makes it special...",
      "required": false,
      "description": "A description of your venue and its unique features"
    },
    {
      "id": "address",
      "type": "text",
      "label": "Address",
      "placeholder": "123 Music St, City, State",
      "required": false,
      "description": "The physical address of your venue"
    },
    {
      "id": "capacity",
      "type": "number",
      "label": "Capacity",
      "placeholder": "Maximum capacity",
      "required": false,
      "description": "Maximum number of people your venue can accommodate"
    },
    {
      "id": "venue_types",
      "type": "multiselect",
      "label": "Venue Types",
      "required": false,
      "options": ["Concert Hall", "Club", "Bar", "Theater", "Outdoor", "Studio", "Arena", "Amphitheater", "Cafe", "Restaurant", "Gallery", "Warehouse", "Other"],
      "description": "Select the types that describe your venue"
    }
  ]'::jsonb,
  true
),
(
  'Staff Onboarding',
  'Information required for new staff members',
  'staff',
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
      "id": "phone",
      "type": "text",
      "label": "Phone Number",
      "placeholder": "+1 (555) 123-4567",
      "required": true,
      "description": "Your primary contact phone number"
    },
    {
      "id": "emergency_contact",
      "type": "text",
      "label": "Emergency Contact",
      "placeholder": "Name and phone number",
      "required": true,
      "description": "Name and phone number of your emergency contact"
    },
    {
      "id": "experience",
      "type": "textarea",
      "label": "Relevant Experience",
      "placeholder": "Describe your relevant experience...",
      "required": false,
      "description": "Any relevant experience in the music or events industry"
    },
    {
      "id": "availability",
      "type": "multiselect",
      "label": "Availability",
      "required": false,
      "options": ["Weekdays", "Weekends", "Evenings", "Overnight", "Flexible", "Part-time", "Full-time"],
      "description": "Select your general availability"
    }
  ]'::jsonb,
  true
),
(
  'Invitation Onboarding',
  'Account creation for invited users',
  'invitation',
  '[
    {
      "id": "email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "Enter your email address",
      "required": true,
      "description": "Your primary email address"
    },
    {
      "id": "password",
      "type": "password",
      "label": "Password",
      "placeholder": "Create a strong password",
      "required": true,
      "description": "Create a strong password for your account"
    },
    {
      "id": "full_name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "required": true,
      "description": "Your full legal name"
    },
    {
      "id": "phone",
      "type": "text",
      "label": "Phone Number",
      "placeholder": "+1 (555) 123-4567",
      "required": false,
      "description": "Your phone number for contact purposes"
    }
  ]'::jsonb,
  true
);

-- Step 9: Create a function to handle new user onboarding flow creation
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS trigger AS $$
BEGIN
  -- Create default onboarding flow for new users
  INSERT INTO public.onboarding_flows (user_id, flow_type, status)
  VALUES (new.id, 'artist', 'pending');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create trigger for new user onboarding flow creation
DROP TRIGGER IF EXISTS on_auth_user_created_onboarding ON auth.users;
CREATE TRIGGER on_auth_user_created_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();

-- Step 11: Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create triggers for updated_at
CREATE TRIGGER update_onboarding_flows_updated_at
  BEFORE UPDATE ON onboarding_flows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_templates_updated_at
  BEFORE UPDATE ON onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 13: Add a comment to document the migration
COMMENT ON TABLE onboarding_flows IS 'Unified onboarding flows for all user types';
COMMENT ON TABLE onboarding_templates IS 'Templates for different onboarding flow types';
