import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const results: any = {}

    // Test 1: Check demo_profiles table
    const { data: demoProfiles, error: demoError } = await supabase
      .from('demo_profiles')
      .select('id, username, account_type, created_at')
      .limit(5)

    results.demo_profiles = {
      count: demoProfiles?.length || 0,
      error: demoError?.message,
      sample: demoProfiles?.slice(0, 3) || []
    }

    // Test 2: Check artist_profiles table
    const { data: artistProfiles, error: artistError } = await supabase
      .from('artist_profiles')
      .select(`
        id,
        artist_name,
        created_at,
        profiles!inner(username)
      `)
      .limit(5)

    results.artist_profiles = {
      count: artistProfiles?.length || 0,
      error: artistError?.message,
      sample: artistProfiles?.slice(0, 3) || []
    }

    // Test 3: Check venue_profiles table
    const { data: venueProfiles, error: venueError } = await supabase
      .from('venue_profiles')
      .select(`
        id,
        venue_name,
        created_at,
        profiles!inner(username)
      `)
      .limit(5)

    results.venue_profiles = {
      count: venueProfiles?.length || 0,
      error: venueError?.message,
      sample: venueProfiles?.slice(0, 3) || []
    }

    // Test 4: Check profiles table
    const { data: generalProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, username, created_at')
      .limit(5)

    results.general_profiles = {
      count: generalProfiles?.length || 0,
      error: profileError?.message,
      sample: generalProfiles?.slice(0, 3) || []
    }

    // Test 5: Test unified search
    const { searchParams } = new URL(request.url)
    const testQuery = searchParams.get('q') || 'test'
    
    const unifiedResponse = await fetch(`${request.nextUrl.origin}/api/search/unified?q=${testQuery}&limit=5`)
    const unifiedData = await unifiedResponse.json()

    results.unified_search = {
      query: testQuery,
      success: unifiedData.success,
      total_results: unifiedData.unified_results?.length || 0,
      error: !unifiedResponse.ok ? 'API Error' : unifiedData.error,
      sample: unifiedData.unified_results?.slice(0, 3) || []
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: results,
      summary: {
        demo_profiles_count: results.demo_profiles.count,
        real_artist_count: results.artist_profiles.count,
        real_venue_count: results.venue_profiles.count,
        real_general_count: results.general_profiles.count,
        unified_search_working: results.unified_search.success && results.unified_search.total_results > 0
      }
    })

  } catch (error) {
    console.error('Test Search API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}