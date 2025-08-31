import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || 'all'

    const results: any = {}

    if (table === 'all' || table === 'profiles') {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, name, created_at')
        .limit(10)

      results.profiles = {
        count: profiles?.length || 0,
        data: profiles,
        error: profileError?.message
      }
    }

    if (table === 'all' || table === 'artist_profiles') {
      const { data: artists, error: artistError } = await supabase
        .from('artist_profiles')
        .select('id, user_id, artist_name, created_at')
        .limit(10)

      results.artist_profiles = {
        count: artists?.length || 0,
        data: artists,
        error: artistError?.message
      }
    }

    if (table === 'all' || table === 'venue_profiles') {
      const { data: venues, error: venueError } = await supabase
        .from('venue_profiles')
        .select('id, user_id, venue_name, created_at')
        .limit(10)

      results.venue_profiles = {
        count: venues?.length || 0,
        data: venues,
        error: venueError?.message
      }
    }

    // Check if tables exist
    if (table === 'all' || table === 'tables') {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['profiles', 'artist_profiles', 'venue_profiles'])

      results.tables = {
        data: tables,
        error: tablesError?.message
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Debug search tables error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
