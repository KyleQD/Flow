-- Adaptive Artist Account Fix
-- This script detects the actual table structure and adapts accordingly

-- First, inspect the account_relationships table structure if it exists
DO $$
DECLARE
    has_owner_user_id BOOLEAN := FALSE;
    has_owner_profile_id BOOLEAN := FALSE;
    has_is_active BOOLEAN := FALSE;
    table_exists BOOLEAN := FALSE;
BEGIN
    -- Check if account_relationships table exists
    SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'account_relationships') INTO table_exists;
    
    IF table_exists THEN
        -- Check which column naming convention is used
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'owner_user_id'
        ) INTO has_owner_user_id;
        
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'owner_profile_id'
        ) INTO has_owner_profile_id;
        
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'is_active'
        ) INTO has_is_active;
        
        RAISE NOTICE 'Table structure detected: owner_user_id=%, owner_profile_id=%, is_active=%', 
                     has_owner_user_id, has_owner_profile_id, has_is_active;
        
        -- Version 1: Uses owner_user_id (newer schema)
        IF has_owner_user_id THEN
            RAISE NOTICE 'Using owner_user_id schema';
            
            -- Create account relationships for existing artist profiles
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
                ap.user_id,
                'artist',
                '{}'::jsonb,
                CASE WHEN has_is_active THEN true ELSE NULL END,
                NOW()
            FROM artist_profiles ap
            LEFT JOIN account_relationships ar ON (
                ar.owner_user_id = ap.user_id 
                AND ar.account_type = 'artist'
            )
            WHERE ar.id IS NULL;
            
            -- Update existing relationships to be active if column exists
            IF has_is_active THEN
                UPDATE account_relationships 
                SET is_active = true
                WHERE account_type = 'artist' AND is_active = false;
            END IF;
            
        -- Version 2: Uses owner_profile_id (older schema)
        ELSIF has_owner_profile_id THEN
            RAISE NOTICE 'Using owner_profile_id schema';
            
            -- Create account relationships for existing artist profiles
            INSERT INTO account_relationships (
                owner_profile_id,
                owned_profile_id,
                account_type,
                permissions,
                created_at
            )
            SELECT 
                ap.user_id,
                ap.user_id,
                'artist',
                '{}'::jsonb,
                NOW()
            FROM artist_profiles ap
            LEFT JOIN account_relationships ar ON (
                ar.owner_profile_id = ap.user_id 
                AND ar.account_type = 'artist'
            )
            WHERE ar.id IS NULL;
            
        ELSE
            RAISE NOTICE 'Unknown account_relationships table structure';
        END IF;
        
        RAISE NOTICE 'Artist account relationships updated successfully';
    ELSE
        RAISE NOTICE 'account_relationships table does not exist - artist accounts will work without multi-account system';
    END IF;
END $$;

-- Create a flexible trigger function that works with any schema
CREATE OR REPLACE FUNCTION create_artist_account_relationship()
RETURNS TRIGGER AS $$
DECLARE
    table_exists BOOLEAN := FALSE;
    has_owner_user_id BOOLEAN := FALSE;
    has_owner_profile_id BOOLEAN := FALSE;
    has_is_active BOOLEAN := FALSE;
BEGIN
    -- Check if account_relationships table exists
    SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'account_relationships') INTO table_exists;
    
    IF table_exists THEN
        -- Check table structure
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'owner_user_id'
        ) INTO has_owner_user_id;
        
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'owner_profile_id'
        ) INTO has_owner_profile_id;
        
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'is_active'
        ) INTO has_is_active;
        
        -- Insert based on schema version
        IF has_owner_user_id THEN
            -- Schema with owner_user_id
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
                CASE WHEN has_is_active THEN true ELSE NULL END
            )
            ON CONFLICT (owner_user_id, owned_profile_id, account_type) 
            DO UPDATE SET 
                is_active = CASE WHEN has_is_active THEN true ELSE account_relationships.is_active END;
                
        ELSIF has_owner_profile_id THEN
            -- Schema with owner_profile_id
            INSERT INTO account_relationships (
                owner_profile_id,
                owned_profile_id,
                account_type,
                permissions
            ) VALUES (
                NEW.user_id,
                NEW.user_id,
                'artist',
                '{}'::jsonb
            )
            ON CONFLICT (owner_profile_id, owned_profile_id, account_type) 
            DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safely create the trigger
DO $$
BEGIN
    DROP TRIGGER IF EXISTS artist_profile_account_relationship_trigger ON artist_profiles;
    
    CREATE TRIGGER artist_profile_account_relationship_trigger
        AFTER INSERT ON artist_profiles
        FOR EACH ROW
        EXECUTE FUNCTION create_artist_account_relationship();
        
    RAISE NOTICE 'Created adaptive artist profile trigger';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create trigger: %', SQLERRM;
END $$;

-- Create function to get accounts that adapts to the schema
CREATE OR REPLACE FUNCTION get_user_accounts_adaptive(target_user_id UUID)
RETURNS TABLE (
    account_type TEXT,
    profile_id UUID,
    profile_data JSONB,
    permissions JSONB,
    is_active BOOLEAN
) AS $$
DECLARE
    table_exists BOOLEAN := FALSE;
    has_owner_user_id BOOLEAN := FALSE;
    has_owner_profile_id BOOLEAN := FALSE;
    has_is_active BOOLEAN := FALSE;
BEGIN
    -- Check if account_relationships table exists
    SELECT EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'account_relationships') INTO table_exists;
    
    IF table_exists THEN
        -- Check table structure
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'owner_user_id'
        ) INTO has_owner_user_id;
        
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'owner_profile_id'
        ) INTO has_owner_profile_id;
        
        SELECT EXISTS(
            SELECT FROM information_schema.columns 
            WHERE table_name = 'account_relationships' AND column_name = 'is_active'
        ) INTO has_is_active;
        
        IF has_owner_user_id THEN
            -- Schema with owner_user_id
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
                    ELSE
                        jsonb_build_object(
                            'full_name', p.full_name,
                            'bio', p.bio
                        )
                END as profile_data,
                ar.permissions,
                CASE WHEN has_is_active THEN ar.is_active ELSE true END as is_active
            FROM account_relationships ar
            LEFT JOIN artist_profiles ap ON (ar.account_type = 'artist' AND ap.user_id = ar.owned_profile_id)
            LEFT JOIN profiles p ON (ar.account_type = 'general' AND p.id = ar.owned_profile_id)
            WHERE ar.owner_user_id = target_user_id
                AND (NOT has_is_active OR ar.is_active = true);
                
        ELSIF has_owner_profile_id THEN
            -- Schema with owner_profile_id
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
                    ELSE
                        jsonb_build_object(
                            'full_name', p.full_name,
                            'bio', p.bio
                        )
                END as profile_data,
                ar.permissions,
                true as is_active
            FROM account_relationships ar
            LEFT JOIN artist_profiles ap ON (ar.account_type = 'artist' AND ap.user_id = ar.owned_profile_id)
            LEFT JOIN profiles p ON (ar.account_type = 'general' AND p.id = ar.owned_profile_id)
            WHERE ar.owner_profile_id = target_user_id;
        END IF;
    END IF;
    
    -- Always include general account from profiles table
    RETURN QUERY
    SELECT 
        'general'::TEXT as account_type,
        p.id as profile_id,
        jsonb_build_object(
            'full_name', p.full_name,
            'bio', p.bio
        ) as profile_data,
        '{}'::jsonb as permissions,
        true as is_active
    FROM profiles p
    WHERE p.id = target_user_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON FUNCTION create_artist_account_relationship() IS 'Automatically creates account relationship when artist profile is created (adapts to table schema)';
COMMENT ON FUNCTION get_user_accounts_adaptive(UUID) IS 'Returns user accounts with proper artist data (adapts to different table schemas)'; 