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
    const type = searchParams.get('type') || 'all' // all, artists, venues, events, users, music
    const location = searchParams.get('location')
    const genre = searchParams.get('genre')
    const verified = searchParams.get('verified')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const results: {
      artists: any[]
      venues: any[]
      events: any[]
      users: any[]
      music: any[]
      posts: any[]
      total: number
    } = {
      artists: [],
      venues: [],
      events: [],
      users: [],
      music: [],
      posts: [],
      total: 0
    }

    // Search profiles (artists, venues, general users)
    if (type === 'all' || type === 'artists' || type === 'venues' || type === 'users') {
      // Search in profiles table (general users)
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          id,
          name,
          username,
          bio,
          avatar_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (query) {
        profilesQuery = profilesQuery.or(`username.ilike.%${query}%,name.ilike.%${query}%,bio.ilike.%${query}%`)
      }

      const { data: profiles, error: profileError } = await profilesQuery
        .range(offset, offset + limit - 1)

      if (!profileError && profiles) {
        results.users.push(...profiles.map(profile => ({
          ...profile,
          account_type: 'general',
          display_name: profile.name || profile.username,
          location: null,
          verified: false,
          stats: { followers: 0, following: 0, posts: 0 }
        })))
      }

      // Search in artist_profiles table
      if (type === 'all' || type === 'artists') {
        let artistQuery = supabase
          .from('artist_profiles')
          .select(`
            id,
            user_id,
            artist_name,
            bio,
            genres,
            social_links,
            created_at,
            updated_at,
            profiles!inner(
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (query) {
          artistQuery = artistQuery.or(`artist_name.ilike.%${query}%,bio.ilike.%${query}%`)
        }

        if (genre) {
          artistQuery = artistQuery.contains('genres', [genre])
        }

        const { data: artists, error: artistError } = await artistQuery
          .range(offset, offset + limit - 1)

        if (!artistError && artists) {
          results.artists.push(...artists.map(artist => ({
            id: artist.id,
            user_id: artist.user_id,
            username: artist.profiles?.[0]?.username,
            artist_name: artist.artist_name,
            bio: artist.bio,
            genres: artist.genres || [],
            social_links: artist.social_links,
            avatar_url: artist.profiles?.[0]?.avatar_url,
            account_type: 'artist',
            display_name: artist.artist_name,
            location: null,
            verified: false,
            stats: { followers: 0, following: 0, posts: 0 },
            created_at: artist.created_at,
            updated_at: artist.updated_at
          })))
        }
      }

      // Search in venue_profiles table
      if (type === 'all' || type === 'venues') {
        let venueQuery = supabase
          .from('venue_profiles')
          .select(`
            id,
            user_id,
            venue_name,
            description,
            address,
            city,
            state,
            country,
            capacity,
            amenities,
            created_at,
            updated_at,
            profiles!inner(
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (query) {
          venueQuery = venueQuery.or(`venue_name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
        }

        if (location) {
          venueQuery = venueQuery.or(`city.ilike.%${location}%,state.ilike.%${location}%,country.ilike.%${location}%`)
        }

        const { data: venues, error: venueError } = await venueQuery
          .range(offset, offset + limit - 1)

        if (!venueError && venues) {
          results.venues.push(...venues.map(venue => ({
            id: venue.id,
            user_id: venue.user_id,
            username: venue.profiles?.[0]?.username,
            venue_name: venue.venue_name,
            description: venue.description,
            address: venue.address,
            city: venue.city,
            state: venue.state,
            country: venue.country,
            capacity: venue.capacity,
            amenities: venue.amenities || [],
            avatar_url: venue.profiles?.[0]?.avatar_url,
            account_type: 'venue',
            display_name: venue.venue_name,
            location: `${venue.city || ''}${venue.city && venue.state ? ', ' : ''}${venue.state || ''}`,
            verified: false,
            stats: { followers: 0, following: 0, posts: 0 },
            created_at: venue.created_at,
            updated_at: venue.updated_at
          })))
        }
      }
    }

    // Search events
    if (type === 'all' || type === 'events') {
      let eventQuery = supabase
        .from('demo_events')
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
        .order('event_date', { ascending: true })

      if (query) {
        eventQuery = eventQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      }

      if (location) {
        eventQuery = eventQuery.ilike('location', `%${location}%`)
      }

      if (genre) {
        eventQuery = eventQuery.contains('genres', [genre])
      }

      const { data: events, error: eventError } = await eventQuery
        .range(offset, offset + limit - 1)

      if (!eventError && events) {
        results.events = events
      }
    }

    // Search music releases
    if (type === 'all' || type === 'music') {
      let musicQuery = supabase
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

      if (query) {
        musicQuery = musicQuery.or(`title.ilike.%${query}%,artist_name.ilike.%${query}%,album_name.ilike.%${query}%`)
      }

      if (genre) {
        musicQuery = musicQuery.contains('genres', [genre])
      }

      const { data: music, error: musicError } = await musicQuery
        .range(offset, offset + limit - 1)

      if (!musicError && music) {
        results.music = music
      }
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      let postQuery = supabase
        .from('demo_posts')
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
        .order('created_at', { ascending: false })

      if (query) {
        postQuery = postQuery.ilike('content', `%${query}%`)
      }

      const { data: posts, error: postError } = await postQuery
        .range(offset, offset + limit - 1)

      if (!postError && posts) {
        results.posts = posts
      }
    }

    // Calculate total results
    results.total = results.artists.length + results.venues.length + 
                   results.events.length + results.users.length + 
                   results.music.length + results.posts.length

    return NextResponse.json({
      success: true,
      results,
      query,
      filters: {
        type,
        location,
        genre,
        verified,
        limit,
        offset
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 