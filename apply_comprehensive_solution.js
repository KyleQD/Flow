#!/usr/bin/env node

/**
 * Apply Comprehensive Multi-Account Solution
 * Safely applies the complete migration to production database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper function to execute SQL
async function executeSQLChunk(sql, description) {
  console.log(`🔄 Executing: ${description}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`❌ Failed: ${description}`);
      console.error('Error:', error.message);
      return false;
    }
    
    console.log(`✅ Success: ${description}`);
    return true;
    
  } catch (err) {
    console.error(`❌ Error executing: ${description}`);
    console.error('Error:', err.message);
    return false;
  }
}

// Main migration function
async function applyComprehensiveSolution() {
  console.log('🚀 APPLYING COMPREHENSIVE SCALABLE MULTI-ACCOUNT SOLUTION');
  console.log('=========================================================');
  
  // Step 1: Fix posts table schema
  console.log('\n📋 STEP 1: Fixing posts table schema...');
  
  const schemaSQL = `
    -- Add media_urls column if missing
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'media_urls') THEN
        ALTER TABLE posts ADD COLUMN media_urls TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added media_urls column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'type') THEN
        ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'text';
        RAISE NOTICE 'Added type column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'visibility') THEN
        ALTER TABLE posts ADD COLUMN visibility TEXT DEFAULT 'public';
        RAISE NOTICE 'Added visibility column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'location') THEN
        ALTER TABLE posts ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'hashtags') THEN
        ALTER TABLE posts ADD COLUMN hashtags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added hashtags column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'posted_as_profile_id') THEN
        ALTER TABLE posts ADD COLUMN posted_as_profile_id UUID;
        RAISE NOTICE 'Added posted_as_profile_id column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'posted_as_account_type') THEN
        ALTER TABLE posts ADD COLUMN posted_as_account_type TEXT DEFAULT 'primary';
        RAISE NOTICE 'Added posted_as_account_type column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'account_display_name') THEN
        ALTER TABLE posts ADD COLUMN account_display_name TEXT;
        RAISE NOTICE 'Added account_display_name column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'account_username') THEN
        ALTER TABLE posts ADD COLUMN account_username TEXT;
        RAISE NOTICE 'Added account_username column to posts table';
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'account_avatar_url') THEN
        ALTER TABLE posts ADD COLUMN account_avatar_url TEXT;
        RAISE NOTICE 'Added account_avatar_url column to posts table';
      END IF;
    END $$;
  `;
  
  if (!(await executeSQLChunk(schemaSQL, 'Posts table schema update'))) {
    console.error('❌ Failed to update posts table schema');
    return false;
  }
  
  // Step 2: Create user_accounts table
  console.log('\n👥 STEP 2: Creating user_accounts table...');
  
  const accountsTableSQL = `
    CREATE TABLE IF NOT EXISTS user_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      account_type TEXT NOT NULL,
      profile_reference TEXT NOT NULL,
      display_name TEXT NOT NULL,
      username TEXT,
      avatar_url TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, account_type, display_name)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_accounts_user ON user_accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_accounts_type ON user_accounts(account_type);
    CREATE INDEX IF NOT EXISTS idx_user_accounts_active ON user_accounts(is_active) WHERE is_active = TRUE;
  `;
  
  if (!(await executeSQLChunk(accountsTableSQL, 'User accounts table creation'))) {
    console.error('❌ Failed to create user_accounts table');
    return false;
  }
  
  // Step 3: Create indexes for performance
  console.log('\n🚀 STEP 3: Creating performance indexes...');
  
  const indexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_posts_account_context ON posts(posted_as_profile_id, posted_as_account_type);
    CREATE INDEX IF NOT EXISTS idx_posts_account_type ON posts(posted_as_account_type);
    CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
  `;
  
  if (!(await executeSQLChunk(indexesSQL, 'Performance indexes creation'))) {
    console.error('❌ Failed to create performance indexes');
    return false;
  }
  
  // Step 4: Create account management functions
  console.log('\n🔧 STEP 4: Creating account management functions...');
  
  const functionsSQL = `
    CREATE OR REPLACE FUNCTION get_or_create_account(
      p_user_id UUID,
      p_account_type TEXT,
      p_profile_id UUID DEFAULT NULL
    )
    RETURNS TABLE (
      account_id UUID,
      display_name TEXT,
      username TEXT,
      avatar_url TEXT,
      is_verified BOOLEAN,
      account_type TEXT
    ) AS $$
    DECLARE
      v_account_id UUID;
      v_display_name TEXT;
      v_username TEXT;
      v_avatar_url TEXT;
      v_is_verified BOOLEAN;
      v_profile_ref TEXT;
    BEGIN
      IF p_account_type = 'artist' THEN
        SELECT 
          ap.id,
          COALESCE(ap.stage_name, ap.artist_name, 'Artist'),
          LOWER(REPLACE(COALESCE(ap.stage_name, ap.artist_name), ' ', '')),
          ap.profile_image_url,
          COALESCE(ap.is_verified, FALSE)
        INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
        FROM artist_profiles ap
        WHERE ap.user_id = p_user_id
        AND (p_profile_id IS NULL OR ap.id = p_profile_id);
        
        IF v_account_id IS NULL THEN
          RAISE EXCEPTION 'Artist profile not found for user %', p_user_id;
        END IF;
        
        v_profile_ref := json_build_object('table', 'artist_profiles', 'id', v_account_id)::text;
        
      ELSIF p_account_type = 'venue' THEN
        SELECT 
          vp.id,
          COALESCE(vp.name, 'Venue'),
          LOWER(REPLACE(vp.name, ' ', '')),
          vp.logo_url,
          COALESCE(vp.is_verified, FALSE)
        INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
        FROM venue_profiles vp
        WHERE vp.user_id = p_user_id
        AND (p_profile_id IS NULL OR vp.id = p_profile_id);
        
        IF v_account_id IS NULL THEN
          RAISE EXCEPTION 'Venue profile not found for user %', p_user_id;
        END IF;
        
        v_profile_ref := json_build_object('table', 'venue_profiles', 'id', v_account_id)::text;
        
      ELSE
        SELECT 
          p.id,
          COALESCE(p.full_name, 'User'),
          COALESCE(p.username, 'user'),
          p.avatar_url,
          COALESCE(p.is_verified, FALSE)
        INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
        FROM profiles p
        WHERE p.id = p_user_id;
        
        IF v_account_id IS NULL THEN
          RAISE EXCEPTION 'Primary profile not found for user %', p_user_id;
        END IF;
        
        v_profile_ref := json_build_object('table', 'profiles', 'id', v_account_id)::text;
      END IF;
      
      INSERT INTO user_accounts (
        user_id, account_type, profile_reference, display_name, username, avatar_url, is_verified
      ) VALUES (
        p_user_id, p_account_type, v_profile_ref, v_display_name, v_username, v_avatar_url, v_is_verified
      )
      ON CONFLICT (user_id, account_type, display_name)
      DO UPDATE SET
        profile_reference = EXCLUDED.profile_reference,
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW();
      
      RETURN QUERY
      SELECT 
        v_account_id,
        v_display_name,
        v_username,
        v_avatar_url,
        v_is_verified,
        p_account_type;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  if (!(await executeSQLChunk(functionsSQL, 'Account management function creation'))) {
    console.error('❌ Failed to create account management functions');
    return false;
  }
  
  // Step 5: Create display info function
  console.log('\n🎨 STEP 5: Creating display info function...');
  
  const displayFunctionSQL = `
    CREATE OR REPLACE FUNCTION get_account_display_info_by_context(
      p_profile_id UUID,
      p_account_type TEXT
    )
    RETURNS TABLE (
      display_name TEXT,
      username TEXT,
      avatar_url TEXT,
      is_verified BOOLEAN,
      account_type TEXT
    ) AS $$
    BEGIN
      IF p_account_type = 'artist' THEN
        RETURN QUERY
        SELECT 
          COALESCE(ap.stage_name, ap.artist_name, 'Artist'),
          LOWER(REPLACE(COALESCE(ap.stage_name, ap.artist_name), ' ', '')),
          ap.profile_image_url,
          COALESCE(ap.is_verified, FALSE),
          'artist'::TEXT
        FROM artist_profiles ap
        WHERE ap.id = p_profile_id;
        
      ELSIF p_account_type = 'venue' THEN
        RETURN QUERY
        SELECT 
          COALESCE(vp.name, 'Venue'),
          LOWER(REPLACE(vp.name, ' ', '')),
          vp.logo_url,
          COALESCE(vp.is_verified, FALSE),
          'venue'::TEXT
        FROM venue_profiles vp
        WHERE vp.id = p_profile_id;
        
      ELSE
        RETURN QUERY
        SELECT 
          COALESCE(p.full_name, 'User'),
          COALESCE(p.username, 'user'),
          p.avatar_url,
          COALESCE(p.is_verified, FALSE),
          'primary'::TEXT
        FROM profiles p
        WHERE p.id = p_profile_id;
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  if (!(await executeSQLChunk(displayFunctionSQL, 'Display info function creation'))) {
    console.error('❌ Failed to create display info function');
    return false;
  }
  
  // Step 6: Enable RLS
  console.log('\n🔒 STEP 6: Setting up RLS policies...');
  
  const rlsSQL = `
    ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own accounts"
      ON user_accounts FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own accounts"
      ON user_accounts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own accounts"
      ON user_accounts FOR UPDATE
      USING (auth.uid() = user_id);
  `;
  
  if (!(await executeSQLChunk(rlsSQL, 'RLS policies setup'))) {
    console.error('❌ Failed to set up RLS policies');
    return false;
  }
  
  // Step 7: Migrate existing data
  console.log('\n🔄 STEP 7: Migrating existing data...');
  
  const migrationSQL = `
    DO $$
    DECLARE
      post_record RECORD;
      account_info RECORD;
      updated_count INTEGER := 0;
    BEGIN
      FOR post_record IN (
        SELECT id, user_id, posted_as_profile_id, posted_as_account_type
        FROM posts
        WHERE posted_as_account_type IS NOT NULL
        AND account_display_name IS NULL
        LIMIT 100
      ) LOOP
        SELECT * INTO account_info
        FROM get_account_display_info_by_context(
          COALESCE(post_record.posted_as_profile_id, post_record.user_id),
          COALESCE(post_record.posted_as_account_type, 'primary')
        );
        
        IF account_info.display_name IS NOT NULL THEN
          UPDATE posts 
          SET 
            account_display_name = account_info.display_name,
            account_username = account_info.username,
            account_avatar_url = account_info.avatar_url,
            posted_as_profile_id = COALESCE(posted_as_profile_id, user_id),
            posted_as_account_type = COALESCE(posted_as_account_type, 'primary')
          WHERE id = post_record.id;
          
          updated_count := updated_count + 1;
        END IF;
      END LOOP;
      
      FOR post_record IN (
        SELECT id, user_id
        FROM posts
        WHERE posted_as_account_type IS NULL
        LIMIT 100
      ) LOOP
        SELECT * INTO account_info
        FROM get_account_display_info_by_context(post_record.user_id, 'primary');
        
        IF account_info.display_name IS NOT NULL THEN
          UPDATE posts 
          SET 
            posted_as_profile_id = user_id,
            posted_as_account_type = 'primary',
            account_display_name = account_info.display_name,
            account_username = account_info.username,
            account_avatar_url = account_info.avatar_url
          WHERE id = post_record.id;
          
          updated_count := updated_count + 1;
        END IF;
      END LOOP;
      
      RAISE NOTICE 'Updated % posts with account context', updated_count;
    END $$;
  `;
  
  if (!(await executeSQLChunk(migrationSQL, 'Existing data migration'))) {
    console.error('❌ Failed to migrate existing data');
    return false;
  }
  
  console.log('\n🎉 COMPREHENSIVE SOLUTION APPLIED SUCCESSFULLY!');
  console.log('================================================');
  console.log('✅ Posts table schema updated with all required columns');
  console.log('✅ User accounts system created');
  console.log('✅ Performance indexes added');
  console.log('✅ Account management functions created');
  console.log('✅ Display info functions created');
  console.log('✅ RLS policies enabled');
  console.log('✅ Existing data migrated');
  console.log('');
  console.log('🔥 READY FOR PRODUCTION USE!');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Restart your Next.js server');
  console.log('2. Test artist posting functionality');
  console.log('3. Test feed display');
  console.log('4. Run the comprehensive test suite');
  
  return true;
}

// Test the solution
async function testSolution() {
  console.log('\n🧪 Testing the solution...');
  
  // Test user bce15693-d2bf-42db-a2f2-68239568fafe (Clive Malone)
  const userId = 'bce15693-d2bf-42db-a2f2-68239568fafe';
  
  try {
    const { data, error } = await supabase
      .rpc('get_or_create_account', {
        p_user_id: userId,
        p_account_type: 'artist',
        p_profile_id: null
      });
    
    if (error) {
      console.error('❌ Test failed:', error.message);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Test passed! Artist account:', data[0].display_name);
      return true;
    } else {
      console.error('❌ Test failed: No account data returned');
      return false;
    }
  } catch (err) {
    console.error('❌ Test error:', err.message);
    return false;
  }
}

// Main execution
async function main() {
  try {
    const success = await applyComprehensiveSolution();
    if (success) {
      await testSolution();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyComprehensiveSolution }; 