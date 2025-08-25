import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
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
    const supabase = createServiceRoleClient()
    const results = []

    // Step 1: Update the account function to properly retrieve artist data
    const fixedAccountFunction = `
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
        IF p_account_type = 'artist' THEN
          -- Get artist profile data
          SELECT 
            ap.id,
            ap.artist_name,
            LOWER(REPLACE(ap.artist_name, ' ', '')),
            '',
            FALSE
          INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
          FROM artist_profiles ap
          WHERE ap.user_id = p_user_id
          LIMIT 1;
          
          -- If no artist profile found, use fallback
          IF v_display_name IS NULL THEN
            v_account_id := p_user_id;
            v_display_name := 'Artist';
            v_username := 'artist';
            v_avatar_url := '';
            v_is_verified := FALSE;
          END IF;
          
        ELSE
          -- Get primary profile data
          SELECT 
            p.id,
            p.full_name,
            COALESCE(p.username, 'user'),
            COALESCE(p.avatar_url, ''),
            COALESCE(p.is_verified, FALSE)
          INTO v_account_id, v_display_name, v_username, v_avatar_url, v_is_verified
          FROM profiles p
          WHERE p.id = p_user_id
          LIMIT 1;
          
          -- If no primary profile found, use fallback
          IF v_display_name IS NULL THEN
            v_account_id := p_user_id;
            v_display_name := 'User';
            v_username := 'user';
            v_avatar_url := '';
            v_is_verified := FALSE;
          END IF;
        END IF;
        
        -- Return the results
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
    `

    try {
      await supabase.rpc('exec_sql', { sql: fixedAccountFunction })
      results.push('✅ Updated account function')
    } catch (error) {
      results.push(`❌ Failed to update account function: ${error}`)
    }

    // Step 2: Test the fixed function
    try {
      const { data: testData } = await supabase
        .rpc('get_account_info_flexible', {
          p_user_id: 'bce15693-d2bf-42db-a2f2-68239568fafe',
          p_account_type: 'artist'
        })

      if (testData && testData.length > 0) {
        results.push(`✅ Artist test: ${testData[0].display_name}`)
      } else {
        results.push('❌ Artist test failed')
      }
    } catch (error) {
      results.push(`❌ Artist test failed: ${error}`)
    }

    // Step 3: Test primary account
    try {
      const { data: testData } = await supabase
        .rpc('get_account_info_flexible', {
          p_user_id: 'bce15693-d2bf-42db-a2f2-68239568fafe',
          p_account_type: 'primary'
        })

      if (testData && testData.length > 0) {
        results.push(`✅ Primary test: ${testData[0].display_name}`)
      } else {
        results.push('❌ Primary test failed')
      }
    } catch (error) {
      results.push(`❌ Primary test failed: ${error}`)
    }

    // Step 4: Update existing posts with correct account names
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, user_id, posted_as_account_type')
        .eq('user_id', 'bce15693-d2bf-42db-a2f2-68239568fafe')
        .limit(20)

      if (posts && posts.length > 0) {
        let updateCount = 0
        for (const post of posts) {
          const { data: accountData } = await supabase
            .rpc('get_account_info_flexible', {
              p_user_id: post.user_id,
              p_account_type: post.posted_as_account_type || 'primary'
            })

          if (accountData && accountData.length > 0) {
            const account = accountData[0]
            await supabase
              .from('posts')
              .update({
                account_display_name: account.display_name,
                account_username: account.username,
                account_avatar_url: account.avatar_url,
                posted_as_account_type: account.account_type,
                posted_as_profile_id: account.account_id
              })
              .eq('id', post.id)
            updateCount++
          }
        }
        results.push(`✅ Updated ${updateCount} posts with correct names`)
      }
    } catch (error) {
      results.push(`❌ Failed to update posts: ${error}`)
    }

    return NextResponse.json({
      success: true,
      results: results
    })

  } catch (error) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 })
  }
} 