-- Job Board and Organization Profile Migration
-- This script creates the necessary tables for job postings to appear on both
-- the job board and organization business profiles

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Job Board Postings Table
CREATE TABLE IF NOT EXISTS job_board_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  organization_logo TEXT,
  organization_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
  location TEXT NOT NULL,
  number_of_positions INTEGER NOT NULL DEFAULT 1,
  salary_range JSONB,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  remote BOOLEAN NOT NULL DEFAULT false,
  urgent BOOLEAN NOT NULL DEFAULT false,
  required_certifications TEXT[] DEFAULT '{}',
  role_type TEXT NOT NULL CHECK (role_type IN ('security', 'bartender', 'street_team', 'production', 'management', 'other')),
  background_check_required BOOLEAN NOT NULL DEFAULT false,
  drug_test_required BOOLEAN NOT NULL DEFAULT false,
  uniform_provided BOOLEAN NOT NULL DEFAULT false,
  training_provided BOOLEAN NOT NULL DEFAULT false,
  age_requirement INTEGER CHECK (age_requirement >= 18),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'paused', 'closed')),
  applications_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  application_form_template JSONB DEFAULT '{"fields": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Job Postings Table (for business profiles)
CREATE TABLE IF NOT EXISTS organization_job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  organization_logo TEXT,
  organization_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'volunteer')),
  location TEXT NOT NULL,
  number_of_positions INTEGER NOT NULL DEFAULT 1,
  salary_range JSONB,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  remote BOOLEAN NOT NULL DEFAULT false,
  urgent BOOLEAN NOT NULL DEFAULT false,
  required_certifications TEXT[] DEFAULT '{}',
  role_type TEXT NOT NULL CHECK (role_type IN ('security', 'bartender', 'street_team', 'production', 'management', 'other')),
  background_check_required BOOLEAN NOT NULL DEFAULT false,
  drug_test_required BOOLEAN NOT NULL DEFAULT false,
  uniform_provided BOOLEAN NOT NULL DEFAULT false,
  training_provided BOOLEAN NOT NULL DEFAULT false,
  age_requirement INTEGER CHECK (age_requirement >= 18),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'paused', 'closed')),
  applications_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  application_form_template JSONB DEFAULT '{"fields": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_board_postings_template_id ON job_board_postings(template_id);
CREATE INDEX IF NOT EXISTS idx_organization_job_postings_template_id ON organization_job_postings(template_id);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_status ON job_board_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_location ON job_board_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_department ON job_board_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_employment_type ON job_board_postings(employment_type);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_created_at ON job_board_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_organization_id ON job_board_postings(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_board_postings_urgent ON job_board_postings(urgent) WHERE urgent = true;

CREATE INDEX IF NOT EXISTS idx_organization_job_postings_organization_id ON organization_job_postings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_job_postings_status ON organization_job_postings(status);
CREATE INDEX IF NOT EXISTS idx_organization_job_postings_created_at ON organization_job_postings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE job_board_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_job_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_board_postings
CREATE POLICY "Public read access to published job postings" ON job_board_postings
  FOR SELECT USING (status = 'published');

CREATE POLICY "Organization can manage their job postings" ON job_board_postings
  FOR ALL USING (
    organization_id IN (
      SELECT venue_id FROM user_venues WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Venue can manage their job postings" ON job_board_postings
  FOR ALL USING (
    venue_id IN (
      SELECT venue_id FROM user_venues WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for organization_job_postings
CREATE POLICY "Public read access to published organization job postings" ON organization_job_postings
  FOR SELECT USING (status = 'published');

CREATE POLICY "Organization can manage their profile job postings" ON organization_job_postings
  FOR ALL USING (
    organization_id IN (
      SELECT venue_id FROM user_venues WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Venue can manage their profile job postings" ON organization_job_postings
  FOR ALL USING (
    venue_id IN (
      SELECT venue_id FROM user_venues WHERE user_id = auth.uid()
    )
  );

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment()
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(views_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;

-- Safe increment applications_count function
CREATE OR REPLACE FUNCTION increment_applications_count(p_job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE job_posting_templates
  SET applications_count = COALESCE(applications_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_board_postings_updated_at
  BEFORE UPDATE ON job_board_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_job_postings_updated_at
  BEFORE UPDATE ON organization_job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO job_board_postings (
  venue_id,
  organization_id,
  organization_name,
  organization_description,
  created_by,
  title,
  description,
  department,
  position,
  employment_type,
  location,
  number_of_positions,
  requirements,
  responsibilities,
  benefits,
  skills,
  experience_level,
  urgent,
  required_certifications,
  role_type,
  background_check_required,
  drug_test_required,
  uniform_provided,
  training_provided,
  age_requirement,
  status,
  applications_count,
  views_count
) VALUES (
  'mock-venue-id',
  'mock-venue-id',
  'Event Security Pro',
  'Professional event security and staffing services',
  'mock-user-id',
  'Security Guard - Event Staff',
  'We are seeking experienced security guards for upcoming events. Must have valid security license and first aid certification.',
  'Security',
  'Security Guard',
  'part_time',
  'Los Angeles, CA',
  5,
  ARRAY['Security License', 'First Aid/CPR', 'Background Check'],
  ARRAY['Monitor event areas', 'Handle security incidents', 'Assist with crowd control'],
  ARRAY['Competitive pay', 'Flexible schedule', 'Training provided'],
  ARRAY['Security', 'Crowd Control', 'First Aid'],
  'mid',
  true,
  ARRAY['Security License', 'First Aid/CPR'],
  'security',
  true,
  true,
  true,
  true,
  21,
  'published',
  12,
  45
) ON CONFLICT DO NOTHING;

INSERT INTO organization_job_postings (
  venue_id,
  organization_id,
  organization_name,
  organization_description,
  created_by,
  title,
  description,
  department,
  position,
  employment_type,
  location,
  number_of_positions,
  requirements,
  responsibilities,
  benefits,
  skills,
  experience_level,
  urgent,
  required_certifications,
  role_type,
  background_check_required,
  drug_test_required,
  uniform_provided,
  training_provided,
  age_requirement,
  status,
  applications_count,
  views_count
) VALUES (
  'mock-venue-id',
  'mock-venue-id',
  'Event Security Pro',
  'Professional event security and staffing services',
  'mock-user-id',
  'Bartender - Premium Events',
  'Join our team of professional bartenders for high-end events and venues.',
  'Food & Beverage',
  'Bartender',
  'part_time',
  'Los Angeles, CA',
  3,
  ARRAY['Alcohol Serving License', 'Food Handler Certificate', 'Customer Service Experience'],
  ARRAY['Prepare and serve drinks', 'Maintain bar cleanliness', 'Handle customer requests'],
  ARRAY['Competitive tips', 'Flexible hours', 'Professional development'],
  ARRAY['Bartending', 'Customer Service', 'POS Systems'],
  'mid',
  false,
  ARRAY['Alcohol License', 'Food Handler Cert'],
  'bartender',
  true,
  false,
  true,
  true,
  21,
  'published',
  8,
  23
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON job_board_postings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON job_board_postings TO authenticated;
GRANT SELECT ON organization_job_postings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON organization_job_postings TO authenticated;

-- Create a view for public job board access
CREATE OR REPLACE VIEW public_job_board AS
SELECT 
  id,
  organization_id,
  organization_name,
  organization_logo,
  organization_description,
  title,
  description,
  department,
  position,
  employment_type,
  location,
  number_of_positions,
  requirements,
  responsibilities,
  benefits,
  skills,
  experience_level,
  remote,
  urgent,
  required_certifications,
  role_type,
  background_check_required,
  drug_test_required,
  uniform_provided,
  training_provided,
  age_requirement,
  applications_count,
  views_count,
  created_at
FROM job_board_postings
WHERE status = 'published' AND (expires_at IS NULL OR expires_at > NOW());

-- Grant access to the public view
GRANT SELECT ON public_job_board TO anon;
GRANT SELECT ON public_job_board TO authenticated;

COMMENT ON TABLE job_board_postings IS 'Job postings that appear on the public job board';
COMMENT ON TABLE organization_job_postings IS 'Job postings that appear on organization business profiles';
COMMENT ON VIEW public_job_board IS 'Public view of published job postings for the job board'; 