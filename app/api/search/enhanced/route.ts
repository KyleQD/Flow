import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface EnhancedSearchParams {
  q?: string
  type?: 'all' | 'artists' | 'venues' | 'users' | 'events' | 'music'
  location?: string
  genre?: string
  skills?: string[]
  experience?: 'beginner' | 'intermediate' | 'expert'
  availability?: 'available' | 'busy' | 'unavailable'
  verified?: boolean
  sortBy?: 'relevance' | 'popularity' | 'recent' | 'rating'
  limit?: number
  offset?: number
  includeRecommendations?: boolean
  includeSocialData?: boolean
}

interface EnhancedSearchResult {
  id: string
  type: 'artist' | 'venue' | 'user' | 'event' | 'music'
  username: string
  displayName: string
  avatar?: string
  bio?: string
  location?: string
  genres?: string[]
  skills?: string[]
  experience?: string
  availability?: string
  verified: boolean
  rating?: number
  followers: number
  following: number
  posts: number
  events?: number
  portfolio?: any[]
  socialConnections?: {
    mutualConnections: number
    isFollowing: boolean
    isFollowed: boolean
    connectionStrength: number
  }
  recommendations?: {
    reason: string
    score: number
  }
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const params: EnhancedSearchParams = {
      q: searchParams.get('q') || undefined,
      type: (searchParams.get('type') as any) || 'all',
      location: searchParams.get('location') || undefined,
      genre: searchParams.get('genre') || undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      experience: (searchParams.get('experience') as any) || undefined,
      availability: (searchParams.get('availability') as any) || undefined,
      verified: searchParams.get('verified') === 'true',
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50),
      offset: parseInt(searchParams.get('offset') || '0'),
      includeRecommendations: searchParams.get('includeRecommendations') === 'true',
      includeSocialData: searchParams.get('includeSocialData') === 'true'
    }

    const results: EnhancedSearchResult[] = []
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id

    // 1. Search Demo Profiles (existing demo data)
    if (params.type && ['all', 'artists', 'venues', 'users'].includes(params.type)) {
      let demoQuery = supabase
        .from('demo_profiles')
        .select('*')
        .order('stats->followers', { ascending: false })

      if (params.q) {
        demoQuery = demoQuery.or(`username.ilike.%${params.q}%,bio.ilike.%${params.q}%,profile_data->>artist_name.ilike.%${params.q}%,profile_data->>venue_name.ilike.%${params.q}%,profile_data->>name.ilike.%${params.q}%`)
      }

      if (params.location) {
        demoQuery = demoQuery.ilike('location', `%${params.location}%`)
      }

      if (params.verified) {
        demoQuery = demoQuery.eq('verified', true)
      }

      if (params.genre) {
        demoQuery = demoQuery.contains('profile_data->genres', [params.genre])
      }

      // Apply type-specific filters
      if (params.type === 'artists') {
        demoQuery = demoQuery.eq('account_type', 'artist')
      } else if (params.type === 'venues') {
        demoQuery = demoQuery.eq('account_type', 'venue')
      } else if (params.type === 'users') {
        demoQuery = demoQuery.eq('account_type', 'general')
      }

      const { data: demoProfiles, error: demoError } = await demoQuery
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 10) - 1)

      if (!demoError && demoProfiles) {
        for (const profile of demoProfiles) {
          const enhancedResult: EnhancedSearchResult = {
            id: profile.id,
            type: profile.account_type as any,
            username: profile.username,
            displayName: profile.profile_data?.artist_name || profile.profile_data?.venue_name || profile.profile_data?.name || profile.username,
            avatar: profile.avatar_url,
            bio: profile.bio,
            location: profile.location,
            genres: profile.profile_data?.genres || [],
            skills: profile.profile_data?.skills || [],
            experience: profile.profile_data?.experience_level || 'intermediate',
            availability: profile.profile_data?.availability_status || 'available',
            verified: profile.verified,
            rating: profile.stats?.client_rating || 0,
            followers: profile.stats?.followers || 0,
            following: profile.stats?.following || 0,
            posts: profile.stats?.posts || 0,
            events: profile.stats?.events || 0,
            created_at: profile.created_at,
            updated_at: profile.updated_at || profile.created_at
          }

          // Add social connections if requested
          if (params.includeSocialData && currentUserId) {
            enhancedResult.socialConnections = {
              mutualConnections: Math.floor(Math.random() * 10), // Mock data
              isFollowing: false, // Would check actual follow status
              isFollowed: false,
              connectionStrength: Math.random()
            }
          }

          // Add recommendations if requested
          if (params.includeRecommendations) {
            enhancedResult.recommendations = {
              reason: 'Based on your interests and location',
              score: Math.random() * 0.8 + 0.2
            }
          }

          results.push(enhancedResult)
        }
      }
    }

    // 2. Search Real Artist Profiles
    if (params.type && ['all', 'artists'].includes(params.type) && results.length < (params.limit || 10)) {
      let artistQuery = supabase
        .from('artist_profiles')
        .select(`
          id,
          user_id,
          artist_name,
          bio,
          genres,
          location,
          experience_level,
          availability_status,
          hourly_rate,
          created_at,
          updated_at,
          profiles!inner (
            username,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })

      if (params.q) {
        artistQuery = artistQuery.or(`artist_name.ilike.%${params.q}%,bio.ilike.%${params.q}%,genres.ilike.%${params.q}%`)
      }

      if (params.location) {
        artistQuery = artistQuery.ilike('location', `%${params.location}%`)
      }

      if (params.genre) {
        artistQuery = artistQuery.contains('genres', [params.genre])
      }

      if (params.experience) {
        artistQuery = artistQuery.eq('experience_level', params.experience)
      }

      if (params.availability) {
        artistQuery = artistQuery.eq('availability_status', params.availability)
      }

      const { data: artistProfiles, error: artistError } = await artistQuery
        .range(0, Math.max(0, (params.limit || 10) - results.length - 1))

      if (!artistError && artistProfiles) {
        for (const artist of artistProfiles) {
          const enhancedResult: EnhancedSearchResult = {
            id: artist.id,
            type: 'artist',
            username: artist.profiles?.[0]?.username || `artist-${artist.id.slice(0, 8)}`,
            displayName: artist.artist_name,
            avatar: artist.profiles?.[0]?.avatar_url,
            bio: artist.bio,
            location: artist.location,
            genres: artist.genres || [],
            skills: [], // Would fetch from skills table
            experience: artist.experience_level || 'intermediate',
            availability: artist.availability_status || 'available',
            verified: artist.profiles?.[0]?.is_verified || false,
            rating: 0, // Would calculate from reviews
            followers: 0, // Would fetch from followers table
            following: 0,
            posts: 0,
            events: 0,
            created_at: artist.created_at,
            updated_at: artist.updated_at || artist.created_at
          }

          // Add social connections if requested
          if (params.includeSocialData && currentUserId) {
            enhancedResult.socialConnections = {
              mutualConnections: Math.floor(Math.random() * 10),
              isFollowing: false,
              isFollowed: false,
              connectionStrength: Math.random()
            }
          }

          // Add recommendations if requested
          if (params.includeRecommendations) {
            enhancedResult.recommendations = {
              reason: 'Based on your music preferences',
              score: Math.random() * 0.8 + 0.2
            }
          }

          results.push(enhancedResult)
        }
      }
    }

    // 3. Search Real Venue Profiles
    if (params.type && ['all', 'venues'].includes(params.type) && results.length < (params.limit || 10)) {
      let venueQuery = supabase
        .from('venue_profiles')
        .select(`
          id,
          user_id,
          venue_name,
          description,
          venue_type,
          location,
          capacity,
          amenities,
          created_at,
          updated_at,
          profiles!inner (
            username,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })

      if (params.q) {
        venueQuery = venueQuery.or(`venue_name.ilike.%${params.q}%,description.ilike.%${params.q}%,venue_type.ilike.%${params.q}%`)
      }

      if (params.location) {
        venueQuery = venueQuery.ilike('location', `%${params.location}%`)
      }

      const { data: venueProfiles, error: venueError } = await venueQuery
        .range(0, Math.max(0, (params.limit || 10) - results.length - 1))

      if (!venueError && venueProfiles) {
        for (const venue of venueProfiles) {
          const enhancedResult: EnhancedSearchResult = {
            id: venue.id,
            type: 'venue',
            username: venue.profiles?.[0]?.username || `venue-${venue.id.slice(0, 8)}`,
            displayName: venue.venue_name,
            avatar: venue.profiles?.[0]?.avatar_url,
            bio: venue.description,
            location: venue.location,
            genres: [venue.venue_type || 'General'],
            skills: venue.amenities || [],
            experience: 'expert', // Venues are typically established
            availability: 'available',
            verified: venue.profiles?.[0]?.is_verified || false,
            rating: 0,
            followers: 0,
            following: 0,
            posts: 0,
            events: 0,
            created_at: venue.created_at,
            updated_at: venue.updated_at || venue.created_at
          }

          // Add social connections if requested
          if (params.includeSocialData && currentUserId) {
            enhancedResult.socialConnections = {
              mutualConnections: Math.floor(Math.random() * 10),
              isFollowing: false,
              isFollowed: false,
              connectionStrength: Math.random()
            }
          }

          // Add recommendations if requested
          if (params.includeRecommendations) {
            enhancedResult.recommendations = {
              reason: 'Popular venue in your area',
              score: Math.random() * 0.8 + 0.2
            }
          }

          results.push(enhancedResult)
        }
      }
    }

    // 4. Search Real General User Profiles
    if (params.type && ['all', 'users'].includes(params.type) && results.length < (params.limit || 10)) {
      let profileQuery = supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          bio,
          location,
          avatar_url,
          is_verified,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })

      if (params.q) {
        profileQuery = profileQuery.or(`full_name.ilike.%${params.q}%,username.ilike.%${params.q}%,bio.ilike.%${params.q}%`)
      }

      if (params.location) {
        profileQuery = profileQuery.ilike('location', `%${params.location}%`)
      }

      if (params.verified) {
        profileQuery = profileQuery.eq('is_verified', true)
      }

      const { data: generalProfiles, error: profileError } = await profileQuery
        .range(0, Math.max(0, (params.limit || 10) - results.length - 1))

      if (!profileError && generalProfiles) {
        for (const profile of generalProfiles) {
          const enhancedResult: EnhancedSearchResult = {
            id: profile.id,
            type: 'user',
            username: profile.username || `user-${profile.id.slice(0, 8)}`,
            displayName: profile.full_name || profile.username,
            avatar: profile.avatar_url,
            bio: profile.bio,
            location: profile.location,
            genres: [],
            skills: [],
            experience: 'intermediate',
            availability: 'available',
            verified: profile.is_verified || false,
            rating: 0,
            followers: 0,
            following: 0,
            posts: 0,
            events: 0,
            created_at: profile.created_at,
            updated_at: profile.updated_at || profile.created_at
          }

          // Add social connections if requested
          if (params.includeSocialData && currentUserId) {
            enhancedResult.socialConnections = {
              mutualConnections: Math.floor(Math.random() * 10),
              isFollowing: false,
              isFollowed: false,
              connectionStrength: Math.random()
            }
          }

          // Add recommendations if requested
          if (params.includeRecommendations) {
            enhancedResult.recommendations = {
              reason: 'Based on your network',
              score: Math.random() * 0.8 + 0.2
            }
          }

          results.push(enhancedResult)
        }
      }
    }

    // Sort results based on sortBy parameter
    const sortedResults = results.sort((a, b) => {
      switch (params.sortBy) {
        case 'popularity':
          return (b.followers + b.posts) - (a.followers + a.posts)
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'relevance':
        default:
          // Prioritize verified accounts, then by recommendations score
          if (a.verified && !b.verified) return -1
          if (!a.verified && b.verified) return 1
          return (b.recommendations?.score || 0) - (a.recommendations?.score || 0)
      }
    })

    // Apply final limit
    const finalResults = sortedResults.slice(0, params.limit || 10)

    return NextResponse.json({
      results: finalResults,
      total: finalResults.length,
      hasMore: results.length > (params.limit || 10),
      searchParams: params,
      metadata: {
        searchTime: new Date().toISOString(),
        totalSearched: results.length,
        filtersApplied: Object.keys(params).filter(key => params[key as keyof EnhancedSearchParams] !== undefined).length
      }
    })

  } catch (error) {
    console.error('Enhanced search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}