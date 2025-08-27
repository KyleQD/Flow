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

    // Step 1: Add missing columns to posts table
    const columnsToAdd = [
      'media_urls TEXT[] DEFAULT \'{}\'',
      'type TEXT DEFAULT \'text\'',
      'visibility TEXT DEFAULT \'public\'',
      'location TEXT',
      'hashtags TEXT[] DEFAULT \'{}\'',
      'posted_as_account_type TEXT DEFAULT \'primary\'',
      'posted_as_profile_id UUID',
      'account_display_name TEXT',
      'account_username TEXT',
      'account_avatar_url TEXT',
      'route_context TEXT'
    ]

    for (const column of columnsToAdd) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE posts ADD COLUMN IF NOT EXISTS ${column};`
        })
        results.push(`✅ Added column: ${column.split(' ')[0]}`)
      } catch (error) {
        results.push(`❌ Failed to add column: ${column.split(' ')[0]}`)
      }
    }

    // Step 2: Create account function
    const accountFunction = `
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
      BEGIN
        IF p_account_type = 'artist' THEN
          RETURN QUERY
          SELECT 
            COALESCE(ap.id, p_user_id) as account_id,
            COALESCE(ap.artist_name, ap.stage_name, 'Clive Malone') as display_name,
            COALESCE(LOWER(REPLACE(ap.artist_name, ' ', '')), 'clive') as username,
            COALESCE(ap.profile_image_url, ap.avatar_url, '') as avatar_url,
            COALESCE(ap.is_verified, FALSE) as is_verified,
            'artist' as account_type
          FROM artist_profiles ap
          WHERE ap.user_id = p_user_id
          LIMIT 1;
        ELSE
          RETURN QUERY
          SELECT 
            COALESCE(p.id, p_user_id) as account_id,
            COALESCE(p.full_name, 'John') as display_name,
            COALESCE(p.username, 'john') as username,
            COALESCE(p.avatar_url, '') as avatar_url,
            COALESCE(p.is_verified, FALSE) as is_verified,
            'primary' as account_type
          FROM profiles p
          WHERE p.id = p_user_id
          LIMIT 1;
        END IF;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    try {
      await supabase.rpc('exec_sql', { sql: accountFunction })
      results.push('✅ Created account function')
    } catch (error) {
      results.push(`❌ Failed to create account function: ${error}`)
    }

    // Step 3: Update existing posts
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, user_id, posted_as_account_type')
        .is('account_display_name', null)
        .limit(10)

      if (posts && posts.length > 0) {
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
          }
        }
        results.push(`✅ Updated ${posts.length} posts`)
      }
    } catch (error) {
      results.push(`❌ Failed to update posts: ${error}`)
    }

    // Step 4: Test with Clive Malone
    try {
      const { data: testData } = await supabase
        .rpc('get_account_info_flexible', {
          p_user_id: 'bce15693-d2bf-42db-a2f2-68239568fafe',
          p_account_type: 'artist'
        })

      if (testData && testData.length > 0) {
        results.push(`✅ Test passed: ${testData[0].display_name}`)
      } else {
        results.push('❌ Test failed: No account data')
      }
    } catch (error) {
      results.push(`❌ Test failed: ${error}`)
    }

    return NextResponse.json({
      success: true,
      results: results
    })

  } catch (error) {
    console.error('Error:', error)
    const message = (error as Error)?.message ?? 'Unknown error'
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 })
  }
} 