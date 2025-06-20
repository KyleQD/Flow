-- Fix Artist Account Display Issues (Clean Version)
-- This script safely ensures existing artist profiles are properly connected to the multi-account system

-- First, check if account_relationships table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account_relationships') THEN
        
        -- Create account relationships for existing artist profiles that don't have them
        INSERT INTO account_relationships (
          owner_user_id,
          owned_profile_id, 
          account_type,
          permissions,
          is_active,
          created_at
        )
        SELECT 
          ap.user_id,
          ap.user_id, -- Artist profiles use user_id as profile_id
          'artist',
          '{}'::jsonb,
          true,
          NOW()
        FROM artist_profiles ap
        LEFT JOIN account_relationships ar ON (
          ar.owner_user_id = ap.user_id 
          AND ar.account_type = 'artist'
        )
        WHERE ar.id IS NULL; -- Only insert if relationship doesn't exist
        
        -- Update any existing artist account relationships to be active
        UPDATE account_relationships 
        SET is_active = true
        WHERE account_type = 'artist' 
        AND is_active = false;
        
        RAISE NOTICE 'Updated artist account relationships successfully';
    ELSE
        RAISE NOTICE 'account_relationships table does not exist, skipping relationship updates';
    END IF;
END $$;

-- Function to automatically create artist account relationship when artist profile is created
CREATE OR REPLACE FUNCTION create_artist_account_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create relationship if account_relationships table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account_relationships') THEN
    -- Create account relationship for the new artist profile
    INSERT INTO account_relationships (
      owner_user_id,
      owned_profile_id,
      account_type,
      permissions,
      is_active
    ) VALUES (
      NEW.user_id,
      NEW.user_id,
      'artist',
      '{}'::jsonb,
      true
    )
    ON CONFLICT (owner_user_id, owned_profile_id, account_type) 
    DO UPDATE SET is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safely create trigger to automatically create account relationships for new artist profiles
DO $$
BEGIN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS artist_profile_account_relationship_trigger ON artist_profiles;
    
    -- Create the trigger
    CREATE TRIGGER artist_profile_account_relationship_trigger
      AFTER INSERT ON artist_profiles
      FOR EACH ROW
      EXECUTE FUNCTION create_artist_account_relationship();
      
    RAISE NOTICE 'Created artist profile account relationship trigger';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create trigger: %', SQLERRM;
END $$;

-- Function to get user accounts with proper artist profile data (only if multi-account system exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account_relationships') THEN
        CREATE OR REPLACE FUNCTION get_user_accounts_with_artist_data(target_user_id UUID)
        RETURNS TABLE (
          account_type TEXT,
          profile_id UUID,
          profile_data JSONB,
          permissions JSONB,
          is_active BOOLEAN
        ) AS $func$
        BEGIN
          RETURN QUERY
          SELECT 
            ar.account_type,
            ar.owned_profile_id as profile_id,
            CASE 
              WHEN ar.account_type = 'artist' THEN
                jsonb_build_object(
                  'artist_name', ap.artist_name,
                  'bio', ap.bio,
                  'genres', ap.genres,
                  'verification_status', ap.verification_status
                )
              WHEN ar.account_type = 'venue' AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'venue_profiles') THEN
                jsonb_build_object(
                  'venue_name', vp.venue_name,
                  'description', vp.description,
                  'venue_type', vp.venue_type
                )
              ELSE
                jsonb_build_object(
                  'full_name', p.full_name,
                  'bio', p.bio
                )
            END as profile_data,
            ar.permissions,
            ar.is_active
          FROM account_relationships ar
          LEFT JOIN artist_profiles ap ON (ar.account_type = 'artist' AND ap.user_id = ar.owned_profile_id)
          LEFT JOIN venue_profiles vp ON (ar.account_type = 'venue' AND vp.user_id = ar.owned_profile_id)
          LEFT JOIN profiles p ON (ar.account_type = 'general' AND p.id = ar.owned_profile_id)
          WHERE ar.owner_user_id = target_user_id
            AND ar.is_active = true
          
          UNION ALL
          
          -- Also include general account even if no explicit relationship exists
          SELECT 
            'general' as account_type,
            p.id as profile_id,
            jsonb_build_object(
              'full_name', p.full_name,
              'bio', p.bio
            ) as profile_data,
            '{}'::jsonb as permissions,
            true as is_active
          FROM profiles p
          WHERE p.id = target_user_id
            AND NOT EXISTS (
              SELECT 1 FROM account_relationships 
              WHERE owner_user_id = target_user_id 
              AND account_type = 'general'
            );
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
        
        RAISE NOTICE 'Created get_user_accounts_with_artist_data function';
    ELSE
        RAISE NOTICE 'Multi-account system not detected, skipping account data function creation';
    END IF;
END $$;

-- Add helpful comments
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'create_artist_account_relationship') THEN
        COMMENT ON FUNCTION create_artist_account_relationship() IS 'Automatically creates account relationship when artist profile is created (safe for systems without multi-account)';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'get_user_accounts_with_artist_data') THEN
        COMMENT ON FUNCTION get_user_accounts_with_artist_data(UUID) IS 'Returns user accounts with properly formatted profile data including artist names';
    END IF;
END $$; 