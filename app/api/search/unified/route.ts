import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UnifiedProfile {
  id: string
  username: string
  account_type: 'artist' | 'venue' | 'general'
  profile_data?: any
  avatar_url?: string
  cover_image?: string
  verified: boolean
  bio?: string
  location?: string
  social_links?: any
  stats?: {
    followers?: number
    following?: number
    posts?: number
    likes?: number
    views?: number
    streams?: number
    events?: number
  }
  created_at: string
  is_demo?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const location = searchParams.get('location')
    const verified = searchParams.get('verified')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const results: UnifiedProfile[] = []

    // 1. Search Demo Profiles (existing demo data)
    if (type === 'all' || type === 'artists' || type === 'venues' || type === 'users') {
      let demoQuery = supabase
        .from('demo_profiles')
        .select('*')
        .order('stats->followers', { ascending: false })

      if (query) {
        demoQuery = demoQuery.or(`username.ilike.%${query}%,bio.ilike.%${query}%,profile_data->>artist_name.ilike.%${query}%,profile_data->>venue_name.ilike.%${query}%,profile_data->>name.ilike.%${query}%`)
      }

      if (location) {
        demoQuery = demoQuery.ilike('location', `%${location}%`)
      }

      if (verified === 'true') {
        demoQuery = demoQuery.eq('verified', true)
      }

      if (type === 'artists') {
        demoQuery = demoQuery.eq('account_type', 'artist')
      } else if (type === 'venues') {
        demoQuery = demoQuery.eq('account_type', 'venue')
      } else if (type === 'users') {
        demoQuery = demoQuery.eq('account_type', 'general')
      }

      const { data: demoProfiles, error: demoError } = await demoQuery
        .range(0, limit - 1)

      if (!demoError && demoProfiles) {
        results.push(...demoProfiles.map(profile => ({
          ...profile,
          is_demo: true
        })))
      }
    }

    // 2. Search Real Artist Profiles
    if ((type === 'all' || type === 'artists') && results.length < limit) {
      let artistQuery = supabase
        .from('artist_profiles')
        .select(`
          id,
          user_id,
          artist_name,
          bio,
          genres,
          social_links,
          verification_status,
          created_at,
          profiles!inner(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (query) {
        artistQuery = artistQuery.or(`artist_name.ilike.%${query}%,bio.ilike.%${query}%,profiles.username.ilike.%${query}%,profiles.name.ilike.%${query}%`)
      }

      const { data: artistProfiles, error: artistError } = await artistQuery
        .range(0, Math.max(0, limit - results.length - 1))

      if (!artistError && artistProfiles) {
        const convertedArtists = artistProfiles.map(artist => ({
          id: artist.id,
          username: artist.profiles?.username || `artist-${artist.id.slice(0, 8)}`,
          account_type: 'artist' as const,
          profile_data: {
            artist_name: artist.artist_name,
            name: artist.artist_name,
            genres: artist.genres
          },
          avatar_url: artist.profiles?.avatar_url,
          verified: artist.verification_status === 'verified',
          bio: artist.bio,
          social_links: artist.social_links,
          stats: {
            followers: 0,
            following: 0,
            posts: 0,
            likes: 0,
            views: 0
          },
          created_at: artist.created_at,
          is_demo: false
        }))

        results.push(...convertedArtists)
      }
    }

    // 3. Search Real Venue Profiles
    if ((type === 'all' || type === 'venues') && results.length < limit) {
      let venueQuery = supabase
        .from('venue_profiles')
        .select(`
          id,
          user_id,
          venue_name,
          description,
          city,
          state,
          capacity,
          venue_types,
          verification_status,
          created_at,
          profiles!inner(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (query) {
        venueQuery = venueQuery.or(`venue_name.ilike.%${query}%,description.ilike.%${query}%,profiles.username.ilike.%${query}%,profiles.name.ilike.%${query}%`)
      }

      if (location) {
        venueQuery = venueQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%`)
      }

      const { data: venueProfiles, error: venueError } = await venueQuery
        .range(0, Math.max(0, limit - results.length - 1))

      if (!venueError && venueProfiles) {
        const convertedVenues = venueProfiles.map(venue => ({
          id: venue.id,
          username: venue.profiles?.username || `venue-${venue.id.slice(0, 8)}`,
          account_type: 'venue' as const,
          profile_data: {
            venue_name: venue.venue_name,
            name: venue.venue_name,
            capacity: venue.capacity,
            venue_types: venue.venue_types
          },
          avatar_url: venue.profiles?.avatar_url,
          verified: venue.verification_status === 'verified',
          bio: venue.description,
          location: venue.city && venue.state ? `${venue.city}, ${venue.state}` : venue.city || venue.state,
          stats: {
            followers: 0,
            following: 0,
            posts: 0,
            likes: 0,
            views: 0,
            events: 0
          },
          created_at: venue.created_at,
          is_demo: false
        }))

        results.push(...convertedVenues)
      }
    }

    // 4. Search Real General User Profiles
    if ((type === 'all' || type === 'users') && results.length < limit) {
      let profileQuery = supabase
        .from('profiles')
        .select(`
          id,
          name,
          username,
          bio,
          avatar_url,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (query) {
        profileQuery = profileQuery.or(`name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
      }

      const { data: generalProfiles, error: profileError } = await profileQuery
        .range(0, Math.max(0, limit - results.length - 1))

      if (!profileError && generalProfiles) {
        const convertedProfiles = generalProfiles.map(profile => ({
          id: profile.id,
          username: profile.username || `user-${profile.id.slice(0, 8)}`,
          account_type: 'general' as const,
          profile_data: {
            name: profile.name
          },
          avatar_url: profile.avatar_url,
          verified: false,
          bio: profile.bio,
          stats: {
            followers: 0,
            following: 0,
            posts: 0,
            likes: 0,
            views: 0
          },
          created_at: profile.created_at,
          is_demo: false
        }))

        results.push(...convertedProfiles)
      }
    }

    // Sort combined results by relevance and date
    const sortedResults = results
      .sort((a, b) => {
        // Prioritize verified accounts
        if (a.verified && !b.verified) return -1
        if (!a.verified && b.verified) return 1
        
        // Then by relevance (demo profiles first for now, then by date)
        if (a.is_demo && !b.is_demo) return -1
        if (!a.is_demo && b.is_demo) return 1
        
        // Finally by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(offset, offset + limit)

    // Separate results by type for backward compatibility
    const categorizedResults = {
      artists: sortedResults.filter(p => p.account_type === 'artist'),
      venues: sortedResults.filter(p => p.account_type === 'venue'),
      users: sortedResults.filter(p => p.account_type === 'general'),
      events: [], // Will be populated from events search if needed
      music: [], // Will be populated from music search if needed
      posts: [], // Will be populated from posts search if needed
      total: sortedResults.length
    }

    return NextResponse.json({
      success: true,
      results: categorizedResults,
      unified_results: sortedResults,
      query,
      filters: {
        type,
        location,
        verified,
        limit,
        offset
      }
    })

  } catch (error) {
    console.error('Unified Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}