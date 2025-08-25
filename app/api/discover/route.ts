import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest(request)
    const supabase = authResult?.supabase || (await (await import('@/lib/supabase/server')).createClient())

    // Get popular artists (mix of real and demo data)
    const { data: realArtists } = await supabase
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
          avatar_url,
          followers_count
        )
      `)
      .order('profiles.followers_count', { ascending: false })
      .limit(8)

    // Get demo artists for additional content
    const { data: demoArtists } = await supabase
      .from('demo_profiles')
      .select('*')
      .eq('account_type', 'artist')
      .order('stats->followers', { ascending: false })
      .limit(4)

    // Get popular venues (mix of real and demo data)
    const { data: realVenues } = await supabase
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
          avatar_url,
          followers_count
        )
      `)
      .order('profiles.followers_count', { ascending: false })
      .limit(8)

    // Get demo venues for additional content
    const { data: demoVenues } = await supabase
      .from('demo_profiles')
      .select('*')
      .eq('account_type', 'venue')
      .order('stats->followers', { ascending: false })
      .limit(4)

    // Get trending posts from multiple sources
    const { data: realPosts } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        likes_count,
        comments_count,
        created_at,
        account_display_name,
        account_username,
        account_avatar_url
      `)
      .eq('visibility', 'public')
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)

    // Get promotion posts as well
    const { data: promotionPosts } = await supabase
      .from('promotion_posts')
      .select('id, title, content, images, tags, event_id, tour_id, author_id, created_at')
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(4)

    // Get upcoming events from multiple sources
    const today = new Date().toISOString().split('T')[0]
    const { data: realEvents } = await supabase
      .from('events')
      .select('id, name, event_date, status, venue_name, tour_id, capacity, tickets_sold')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(6)

    // Get demo events for additional content
    const { data: demoEvents } = await supabase
      .from('demo_events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(4)

    // Transform real artists to unified format
    const transformedRealArtists = (realArtists || []).map((artist: any) => ({
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
        followers: artist.profiles?.followers_count || 0,
        following: 0,
        posts: 0,
        likes: 0,
        views: 0
      },
      created_at: artist.created_at,
      is_demo: false
    }))

    // Transform real venues to unified format
    const transformedRealVenues = (realVenues || []).map((venue: any) => ({
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
        followers: venue.profiles?.followers_count || 0,
        following: 0,
        posts: 0,
        likes: 0,
        views: 0,
        events: 0
      },
      created_at: venue.created_at,
      is_demo: false
    }))

    // Transform real posts to unified format
    const transformedRealPosts = (realPosts || []).map((post: any) => ({
      id: post.id,
      content: post.content,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      created_at: post.created_at,
      profiles: {
        username: post.account_username,
        avatar_url: post.account_avatar_url
      }
    }))

    // Transform promotion posts to unified format
    const transformedPromotionPosts = (promotionPosts || []).map((post: any) => ({
      id: post.id,
      content: post.content || post.title,
      likes_count: 0,
      comments_count: 0,
      created_at: post.created_at,
      profiles: {
        username: 'Tourify',
        avatar_url: null
      }
    }))

    // Transform real events to unified format
    const transformedRealEvents = (realEvents || []).map((event: any) => ({
      id: event.id,
      name: event.name,
      title: event.name,
      event_date: event.event_date,
      date: event.event_date,
      venue_name: event.venue_name,
      status: event.status,
      capacity: event.capacity,
      tickets_sold: event.tickets_sold
    }))

    // Combine real and demo data
    const combinedArtists = [
      ...transformedRealArtists,
      ...(demoArtists || []).map((artist: any) => ({ ...artist, is_demo: true }))
    ].slice(0, 8)

    const combinedVenues = [
      ...transformedRealVenues,
      ...(demoVenues || []).map((venue: any) => ({ ...venue, is_demo: true }))
    ].slice(0, 8)

    const combinedPosts = [
      ...transformedRealPosts,
      ...transformedPromotionPosts
    ].slice(0, 8)

    const combinedEvents = [
      ...transformedRealEvents,
      ...(demoEvents || [])
    ].slice(0, 8)

    return NextResponse.json({
      sections: {
        trending: combinedPosts,
        upcoming: combinedEvents,
        artists: combinedArtists,
        venues: combinedVenues
      },
      stats: {
        total_artists: (realArtists?.length || 0) + (demoArtists?.length || 0),
        total_venues: (realVenues?.length || 0) + (demoVenues?.length || 0),
        total_posts: (realPosts?.length || 0) + (promotionPosts?.length || 0),
        total_events: (realEvents?.length || 0) + (demoEvents?.length || 0)
      }
    })
  } catch (error) {
    console.error('Discover API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


