-- Add organizer-related columns to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_data JSONB DEFAULT '{}'::jsonb;

-- Add index for organizer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_organization_name ON profiles(organization_name);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_type ON profiles(organization_type);

-- Update profiles table comments
COMMENT ON COLUMN profiles.organization_name IS 'Name of the organization for organizer accounts';
COMMENT ON COLUMN profiles.organization_type IS 'Type of organization (event_management, talent_agency, etc.)';
COMMENT ON COLUMN profiles.organization_data IS 'Additional organization metadata including contact info, social links, etc.'; 