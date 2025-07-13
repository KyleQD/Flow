import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('demo_music_releases')
      .select(`
        *,
        profile:demo_profiles(
          id,
          username,
          account_type,
          profile_data,
          avatar_url,
          verified
        )
      `)
      .order('release_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching music releases:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ music: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 