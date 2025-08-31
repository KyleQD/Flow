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
      // Search in profiles table (all account types)
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          id,
          name,
          username,
          bio,
          avatar_url,
          account_type,
          account_settings,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      // Apply filters based on account type
      if (type === 'artists') {
        profilesQuery = profilesQuery.eq('account_type', 'artist')
      } else if (type === 'venues') {
        profilesQuery = profilesQuery.eq('account_type', 'venue')
      } else if (type === 'users') {
        profilesQuery = profilesQuery.eq('account_type', 'general')
      }

      // Apply search query
      if (query) {
        profilesQuery = profilesQuery.or(`username.ilike.%${query}%,name.ilike.%${query}%,bio.ilike.%${query}%`)
      }

      const { data: profiles, error: profileError } = await profilesQuery
        .range(offset, offset + limit - 1)

      if (!profileError && profiles) {
        // Categorize profiles by account type
        profiles.forEach(profile => {
          const profileData = {
            ...profile,
            display_name: profile.name || profile.username,
            location: null,
            verified: false,
            stats: { followers: 0, following: 0, posts: 0 }
          }

          if (profile.account_type === 'artist') {
            results.artists.push({
              ...profileData,
              artist_name: profile.name || profile.username,
              genres: [],
              social_links: {}
            })
          } else if (profile.account_type === 'venue') {
            results.venues.push({
              ...profileData,
              venue_name: profile.name || profile.username,
              description: profile.bio,
              amenities: []
            })
          } else {
            results.users.push(profileData)
          }
        })

        // Also search within multi-account system (account_settings)
        profiles.forEach(profile => {
          if (profile.account_settings) {
            // Search in organizer_accounts (admin accounts)
            if (profile.account_settings.organizer_accounts) {
              profile.account_settings.organizer_accounts.forEach((organizer: any) => {
                if (query) {
                  const searchText = `${organizer.organization_name} ${organizer.description || ''}`.toLowerCase()
                  if (!searchText.includes(query.toLowerCase())) return
                }
                
                results.users.push({
                  id: organizer.id || `${profile.id}-organizer-${organizer.organization_name}`,
                  name: organizer.organization_name,
                  username: organizer.organization_name.toLowerCase().replace(/\s+/g, '-'),
                  bio: organizer.description || '',
                  avatar_url: organizer.logo_url || null,
                  account_type: 'admin',
                  display_name: organizer.organization_name,
                  location: organizer.location || null,
                  verified: false,
                  stats: { followers: 0, following: 0, posts: 0 }
                })
              })
            }

            // Search in artist_accounts (if they exist in account_settings)
            if (profile.account_settings.artist_accounts) {
              profile.account_settings.artist_accounts.forEach((artist: any) => {
                if (query) {
                  const searchText = `${artist.artist_name} ${artist.bio || ''}`.toLowerCase()
                  if (!searchText.includes(query.toLowerCase())) return
                }
                
                results.artists.push({
                  id: artist.id || `${profile.id}-artist-${artist.artist_name}`,
                  user_id: profile.id,
                  username: artist.artist_name.toLowerCase().replace(/\s+/g, '-'),
                  artist_name: artist.artist_name,
                  bio: artist.bio || '',
                  genres: artist.genres || [],
                  social_links: artist.social_links || {},
                  avatar_url: artist.avatar_url || null,
                  account_type: 'artist',
                  display_name: artist.artist_name,
                  location: artist.location || null,
                  verified: false,
                  stats: { followers: 0, following: 0, posts: 0 },
                  created_at: artist.created_at || profile.created_at,
                  updated_at: artist.updated_at || profile.updated_at
                })
              })
            }

            // Search in venue_accounts (if they exist in account_settings)
            if (profile.account_settings.venue_accounts) {
              profile.account_settings.venue_accounts.forEach((venue: any) => {
                if (query) {
                  const searchText = `${venue.venue_name} ${venue.description || ''}`.toLowerCase()
                  if (!searchText.includes(query.toLowerCase())) return
                }
                
                results.venues.push({
                  id: venue.id || `${profile.id}-venue-${venue.venue_name}`,
                  user_id: profile.id,
                  username: venue.venue_name.toLowerCase().replace(/\s+/g, '-'),
                  venue_name: venue.venue_name,
                  description: venue.description || '',
                  address: venue.address || '',
                  city: venue.city || '',
                  state: venue.state || '',
                  country: venue.country || '',
                  capacity: venue.capacity || 0,
                  amenities: venue.amenities || [],
                  avatar_url: venue.avatar_url || null,
                  account_type: 'venue',
                  display_name: venue.venue_name,
                  location: venue.city && venue.state ? `${venue.city}, ${venue.state}` : venue.city || venue.state || null,
                  verified: false,
                  stats: { followers: 0, following: 0, posts: 0 },
                  created_at: venue.created_at || profile.created_at,
                  updated_at: venue.updated_at || profile.updated_at
                })
              })
            }
          }
        })
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