-- Create dedicated organizer_accounts table to bypass RLS issues
-- This table will store organizer accounts separately from the main profiles table

-- Create organizer_accounts table
CREATE TABLE IF NOT EXISTS organizer_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'event_management',
  description TEXT,
  contact_info JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  specialties TEXT[] DEFAULT '{}',
  admin_level TEXT DEFAULT 'super' CHECK (admin_level IN ('super', 'moderator', 'support')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_user_org_name UNIQUE(user_id, organization_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizer_accounts_user_id ON organizer_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_accounts_active ON organizer_accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_organizer_accounts_org_name ON organizer_accounts(organization_name);

-- Enable RLS
ALTER TABLE organizer_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizer_accounts
-- Users can view their own organizer accounts
CREATE POLICY "Users can view their own organizer accounts"
  ON organizer_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own organizer accounts
CREATE POLICY "Users can create their own organizer accounts"
  ON organizer_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own organizer accounts
CREATE POLICY "Users can update their own organizer accounts"
  ON organizer_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own organizer accounts
CREATE POLICY "Users can delete their own organizer accounts"
  ON organizer_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to get user organizer accounts
CREATE OR REPLACE FUNCTION get_user_organizer_accounts(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  organization_name TEXT,
  organization_type TEXT,
  description TEXT,
  contact_info JSONB,
  social_links JSONB,
  specialties TEXT[],
  admin_level TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    oa.id,
    oa.organization_name,
    oa.organization_type,
    oa.description,
    oa.contact_info,
    oa.social_links,
    oa.specialties,
    oa.admin_level,
    oa.is_active,
    oa.created_at,
    oa.updated_at
  FROM organizer_accounts oa
  WHERE oa.user_id = p_user_id
  AND oa.is_active = true
  ORDER BY oa.created_at DESC;
$$;

-- Create function to create organizer account
CREATE OR REPLACE FUNCTION create_organizer_account(
  p_user_id UUID,
  p_organization_name TEXT,
  p_organization_type TEXT DEFAULT 'event_management',
  p_description TEXT DEFAULT NULL,
  p_contact_info JSONB DEFAULT '{}'::jsonb,
  p_social_links JSONB DEFAULT '{}'::jsonb,
  p_specialties TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_account_id UUID;
BEGIN
  -- Insert the new organizer account
  INSERT INTO organizer_accounts (
    user_id,
    organization_name,
    organization_type,
    description,
    contact_info,
    social_links,
    specialties,
    admin_level,
    is_active
  ) VALUES (
    p_user_id,
    p_organization_name,
    p_organization_type,
    p_description,
    p_contact_info,
    p_social_links,
    p_specialties,
    'super',
    true
  )
  RETURNING id INTO new_account_id;
  
  RETURN new_account_id;
END;
$$;

-- Add comment
COMMENT ON TABLE organizer_accounts IS 'Dedicated table for organizer accounts to bypass RLS issues with profiles table';
COMMENT ON FUNCTION get_user_organizer_accounts(UUID) IS 'Get all active organizer accounts for a user';
COMMENT ON FUNCTION create_organizer_account(UUID, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT[]) IS 'Create a new organizer account for a user';
