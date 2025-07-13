-- Add profile_data column to account_relationships table
-- This allows storing organizer account information directly in relationships

-- Check if the column exists before adding it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'account_relationships' 
    AND column_name = 'profile_data'
  ) THEN
    ALTER TABLE account_relationships 
    ADD COLUMN profile_data JSONB DEFAULT NULL;
    
    COMMENT ON COLUMN account_relationships.profile_data IS 'Stores profile information for accounts that don''t have separate profile tables (e.g., organizer accounts)';
    
    -- Create an index for better performance when querying profile data
    CREATE INDEX IF NOT EXISTS idx_account_relationships_profile_data_org_name 
    ON account_relationships USING gin ((profile_data->>'organization_name'));
    
    RAISE NOTICE 'Added profile_data column to account_relationships table';
  ELSE
    RAISE NOTICE 'profile_data column already exists in account_relationships table';
  END IF;
END $$; 