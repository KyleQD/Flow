import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const accountType = searchParams.get('type')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action')
    const profileId = searchParams.get('profileId')
    const userId = searchParams.get('userId')

    // Handle checkFollow action
    if (action === 'checkFollow' && profileId && userId) {
      const { data, error } = await supabase
        .from('demo_follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', profileId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking follow status:', error)
        return NextResponse.json({ isFollowing: false })
      }

      return NextResponse.json({ isFollowing: !!data })
    }

    // Handle regular profile search
    // Use the search function
    const { data, error } = await supabase.rpc('search_demo_profiles', {
      search_query: query,
      account_type_filter: accountType,
      location_filter: location,
      limit_count: limit,
      offset_count: offset
    })

    if (error) {
      console.error('Error searching demo profiles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profiles: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, profileId, userId } = body

    if (action === 'follow') {
      // Add follow relationship
      const { error } = await supabase
        .from('demo_follows')
        .insert({
          follower_id: userId,
          following_id: profileId
        })

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'unfollow') {
      // Remove follow relationship
      const { error } = await supabase
        .from('demo_follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', profileId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 