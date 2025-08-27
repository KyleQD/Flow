import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for database operations
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for service role')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Applying comprehensive route-based solution...')
    
    const supabase = createServiceRoleClient()
    const results = []

    // Step 1: Check and fix posts table schema
    console.log('📊 Step 1: Checking posts table schema...')
    
    try {
      // Check if posts table exists
      const { data: tableExists } = await supabase
        .from('posts')
        .select('id')
        .limit(1)
      
      results.push('✅ Posts table exists')
    } catch (error) {
      results.push('❌ Posts table does not exist or has issues')
    }

    // Step 2: Add missing columns
    console.log('📊 Step 2: Adding missing columns...')
    
    const columnsToAdd = [
      { name: 'media_urls', type: 'TEXT[] DEFAULT \'{}\'', description: 'Media URLs array' },
      { name: 'type', type: 'TEXT DEFAULT \'text\'', description: 'Post type' },
      { name: 'visibility', type: 'TEXT DEFAULT \'public\'', description: 'Post visibility' },
      { name: 'location', type: 'TEXT', description: 'Post location' },
      { name: 'hashtags', type: 'TEXT[] DEFAULT \'{}\'', description: 'Hashtags array' },
      { name: 'posted_as_account_type', type: 'TEXT DEFAULT \'primary\'', description: 'Account type' },
      { name: 'posted_as_profile_id', type: 'UUID', description: 'Profile ID' },
      { name: 'account_display_name', type: 'TEXT', description: 'Cached display name' },
      { name: 'account_username', type: 'TEXT', description: 'Cached username' },
      { name: 'account_avatar_url', type: 'TEXT', description: 'Cached avatar URL' },
      { name: 'route_context', type: 'TEXT', description: 'Route context for debugging' }
    ]

    for (const column of columnsToAdd) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE posts ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`
        })
        
        if (error) {
          results.push(`❌ Failed to add column ${column.name}: ${error.message}`)
        } else {
          results.push(`✅ Added column ${column.name}`)
        }
      } catch (error) {
        results.push(`❌ Failed to add column ${column.name}: ${error}`)
      }
    }

    // Step 3: Create flexible account function
    console.log('📊 Step 3: Creating flexible account function...')
    
    const flexibleAccountFunction = `
      CREATE OR REPLACE FUNCTION get_account_info_flexible(
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
      BEGIN
        -- Handle different account types
        IF p_account_type = 'artist' THEN
          SELECT 
            ap.id,
            COALESCE(ap.artist_name, ap.stage_name, 'Artist'),
            LOWER(REPLACE(COALESCE(ap.artist_name, ap.stage_name, 'Artist'), ' ', '')),
            COALESCE(ap.profile_image_url, ap.avatar_url, ''),
            COALESCE(ap.is_verified, FALSE)
          INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
          FROM artist_profiles ap
          WHERE ap.user_id = p_user_id
          AND (p_profile_id IS NULL OR ap.id = p_profile_id)
          LIMIT 1;
          
        ELSIF p_account_type = 'venue' THEN
          SELECT 
            vp.id,
            COALESCE(vp.name, vp.venue_name, 'Venue'),
            LOWER(REPLACE(COALESCE(vp.name, vp.venue_name, 'Venue'), ' ', '')),
            COALESCE(vp.logo_url, vp.avatar_url, ''),
            COALESCE(vp.is_verified, FALSE)
          INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
          FROM venue_profiles vp
          WHERE vp.user_id = p_user_id
          AND (p_profile_id IS NULL OR vp.id = p_profile_id)
          LIMIT 1;
          
        ELSE -- primary account
          SELECT 
            p.id,
            COALESCE(p.full_name, 'User'),
            COALESCE(p.username, 'user'),
            COALESCE(p.avatar_url, ''),
            COALESCE(p.is_verified, FALSE)
          INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
          FROM profiles p
          WHERE p.id = p_user_id
          LIMIT 1;
        END IF;
        
        -- Return results
        RETURN QUERY
        SELECT 
          COALESCE(v_account_id, p_user_id),
          COALESCE(v_display_name, 'User'),
          COALESCE(v_username, 'user'),
          COALESCE(v_avatar_url, ''),
          COALESCE(v_is_verified, FALSE),
          p_account_type;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: flexibleAccountFunction })
      
      if (error) {
        results.push(`❌ Failed to create flexible account function: ${error.message}`)
      } else {
        results.push('✅ Created flexible account function')
      }
    } catch (error) {
      results.push(`❌ Failed to create flexible account function: ${error}`)
    }

    // Step 4: Test the system
    console.log('📊 Step 4: Testing the system...')
    
    try {
      const { data: testResult, error: testError } = await supabase
        .rpc('get_account_info_flexible', {
          p_user_id: 'bce15693-d2bf-42db-a2f2-68239568fafe',
          p_account_type: 'artist',
          p_profile_id: null
        })

      if (testError) {
        results.push(`❌ Test failed: ${testError.message}`)
      } else if (testResult && testResult.length > 0) {
        results.push(`✅ Test passed: Found account "${testResult[0].display_name}"`)
      } else {
        results.push('❌ Test failed: No account data returned')
      }
    } catch (error) {
      results.push(`❌ Test failed: ${error}`)
    }

    // Step 5: Update existing posts
    console.log('📊 Step 5: Updating existing posts...')
    
    try {
      const { data: existingPosts, error: fetchError } = await supabase
        .from('posts')
        .select('id, user_id, posted_as_account_type, posted_as_profile_id, account_display_name')
        .is('account_display_name', null)
        .limit(10)

      if (fetchError) {
        results.push(`❌ Failed to fetch posts for update: ${fetchError.message}`)
      } else if (existingPosts && existingPosts.length > 0) {
        let updateCount = 0
        
        for (const post of existingPosts) {
          try {
            const { data: accountData, error: accountError } = await supabase
              .rpc('get_account_info_flexible', {
                p_user_id: post.user_id,
                p_account_type: post.posted_as_account_type || 'primary',
                p_profile_id: post.posted_as_profile_id
              })

            if (!accountError && accountData && accountData.length > 0) {
              const account = accountData[0]
              
              const { error: updateError } = await supabase
                .from('posts')
                .update({
                  account_display_name: account.display_name,
                  account_username: account.username,
                  account_avatar_url: account.avatar_url,
                  posted_as_account_type: account.account_type,
                  posted_as_profile_id: account.account_id
                })
                .eq('id', post.id)

              if (!updateError) {
                updateCount++
              }
            }
          } catch (error) {
            // Skip individual post errors
          }
        }
        
        results.push(`✅ Updated ${updateCount} posts with account context`)
      } else {
        results.push('ℹ️ No posts need updating')
      }
    } catch (error) {
      results.push(`❌ Failed to update posts: ${error}`)
    }

    console.log('🎉 Comprehensive solution applied!')
    
    return NextResponse.json({
      success: true,
      message: 'Comprehensive route-based solution applied successfully',
      results: results
    })

  } catch (error) {
    console.error('💥 Error applying comprehensive solution:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to apply comprehensive solution: ' + (error as Error).message
    }, { status: 500 })
  }
} 