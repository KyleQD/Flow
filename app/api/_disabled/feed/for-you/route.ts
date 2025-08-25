import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[For You API] Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // 'all', 'music', 'events', etc.
    const sort = searchParams.get('sort') || 'relevant' // 'relevant', 'recent', 'popular'

    console.log('[For You API] Fetching personalized content for user:', user.id, 'sort:', sort)

    // Get user profile and interests
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, primary_genres, interests, location, username, full_name')
      .eq('id', user.id)
      .single()

    // Get user's following relationships
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = following?.map(f => f.following_id) || []
    const userInterests = profile?.primary_genres || profile?.interests || []

    // Initialize content array
    let allContent: any[] = []

    // Fetch music content from artist_music table
    if (!type || type === 'all' || type === 'music') {
      const { data: music, error: musicError } = await supabase
        .from('artist_music')
        .select(`
          id,
          title,
          description,
          genre,
          duration,
          cover_art_url,
          created_at,
          user_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (musicError) {
        console.error('[For You API] Music query error:', musicError)
      } else if (music) {
        const pickProfile = (p: any) => Array.isArray(p) ? p[0] : p
        allContent.push(...music.map(item => {
          // Calculate relevance score based on user interests
          const genreMatch = userInterests.includes(item.genre) ? 0.3 : 0
          const followingMatch = followingIds.includes(item.user_id) ? 0.4 : 0
          const recencyScore = Math.max(0, 1 - (Date.now() - new Date(item.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)) * 0.3
          const prof = pickProfile(item.profiles)
          
          return {
            id: item.id,
            type: 'music',
            title: item.title,
            description: item.description,
            author: {
              id: prof?.id,
              name: prof?.full_name || prof?.username,
              username: prof?.username,
              avatar_url: prof?.avatar_url,
              is_verified: prof?.is_verified
            },
            cover_image: item.cover_art_url,
            created_at: item.created_at,
            engagement: { likes: 0, views: 0, shares: 0, comments: 0 }, // Placeholder
            metadata: {
              genre: item.genre,
              duration: item.duration
            },
            relevance_score: genreMatch + followingMatch + recencyScore
          }
        }))
      }
    }

    // Fetch events content from both events and artist_events tables
    if (!type || type === 'all' || type === 'events') {
      // Query main events table
      const { data: mainEvents, error: mainEventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          event_date,
          venue_name,
          venue_address,
          capacity,
          ticket_price,
          created_at,
          user_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(limit)

      if (mainEventsError) {
        console.error('[For You API] Main events query error:', mainEventsError)
      } else if (mainEvents) {
        const pickProfile = (p: any) => Array.isArray(p) ? p[0] : p
        allContent.push(...mainEvents.map(item => {
          const followingMatch = followingIds.includes(item.user_id) ? 0.5 : 0
          const upcomingScore = Math.max(0, 1 - (new Date(item.event_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 0.5
          const prof = pickProfile(item.profiles)
          
          return {
            id: item.id,
            type: 'event',
            title: item.title,
            description: item.description,
            author: {
              id: prof?.id,
              name: prof?.full_name || prof?.username,
              username: prof?.username,
              avatar_url: prof?.avatar_url,
              is_verified: prof?.is_verified
            },
            created_at: item.created_at,
            engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
            metadata: {
              date: item.event_date,
              location: item.venue_address,
              venue: item.venue_name,
              capacity: item.capacity,
              ticket_price: item.ticket_price
            },
            relevance_score: followingMatch + upcomingScore
          }
        }))
      }

      // Query artist_events table
      const { data: artistEvents, error: artistEventsError } = await supabase
        .from('artist_events')
        .select(`
          id,
          title,
          description,
          event_date,
          venue_name,
          venue_address,
          capacity,
          ticket_price_min,
          created_at,
          user_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .gte('event_date', new Date().toISOString())
        .eq('is_public', true)
        .order('event_date', { ascending: true })
        .limit(limit)

      if (artistEventsError) {
        console.error('[For You API] Artist events query error:', artistEventsError)
      } else if (artistEvents) {
        const pickProfile = (p: any) => Array.isArray(p) ? p[0] : p
        allContent.push(...artistEvents.map(item => {
          const followingMatch = followingIds.includes(item.user_id) ? 0.5 : 0
          const upcomingScore = Math.max(0, 1 - (new Date(item.event_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) * 0.5
          const prof = pickProfile(item.profiles)
          
          return {
            id: `artist_${item.id}`,
            type: 'event',
            title: item.title,
            description: item.description,
            author: {
              id: prof?.id,
              name: prof?.full_name || prof?.username,
              username: prof?.username,
              avatar_url: prof?.avatar_url,
              is_verified: prof?.is_verified
            },
            created_at: item.created_at,
            engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
            metadata: {
              date: item.event_date,
              location: item.venue_address,
              venue: item.venue_name,
              capacity: item.capacity,
              ticket_price: item.ticket_price_min
            },
            relevance_score: followingMatch + upcomingScore
          }
        }))
      }
    }

    // Fetch tours content
    if (!type || type === 'all' || type === 'tours') {
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          status,
          budget,
          created_at,
          created_by,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit)

      if (toursError) {
        console.error('[For You API] Tours query error:', toursError)
      } else if (tours) {
        const pickProfile = (p: any) => Array.isArray(p) ? p[0] : p
        allContent.push(...tours.map(item => {
          const followingMatch = followingIds.includes(item.created_by) ? 0.6 : 0
          const upcomingScore = Math.max(0, 1 - (new Date(item.start_date).getTime() - Date.now()) / (60 * 24 * 60 * 60 * 1000)) * 0.4
          const prof = pickProfile(item.profiles)
          
          return {
            id: item.id,
            type: 'tour',
            title: item.name,
            description: item.description,
            author: {
              id: prof?.id,
              name: prof?.full_name || prof?.username,
              username: prof?.username,
              avatar_url: prof?.avatar_url,
              is_verified: prof?.is_verified
            },
            created_at: item.created_at,
            engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
            metadata: {
              start_date: item.start_date,
              end_date: item.end_date,
              status: item.status,
              budget: item.budget
            },
            relevance_score: followingMatch + upcomingScore
          }
        }))
      }
    }

    // Fetch posts content (for news/blogs) - using artist_blog_posts if available
    if (!type || type === 'all' || type === 'news' || type === 'blogs') {
      // Fetch local posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          type,
          created_at,
          user_id,
          profiles!inner(
            id,
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (postsError) {
        console.error('[For You API] Posts query error:', postsError)
      } else if (posts) {
        const pickProfile = (p: any) => Array.isArray(p) ? p[0] : p
        allContent.push(...posts.map(item => {
          const followingMatch = followingIds.includes(item.user_id) ? 0.6 : 0
          const recencyScore = Math.max(0, 1 - (Date.now() - new Date(item.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)) * 0.4
          const prof = pickProfile(item.profiles)
          
          return {
            id: item.id,
            type: item.type === 'blog' ? 'blog' : 'news',
            title: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
            description: item.content,
            author: {
              id: prof?.id,
              name: prof?.full_name || prof?.username,
              username: prof?.username,
              avatar_url: prof?.avatar_url,
              is_verified: prof?.is_verified
            },
            created_at: item.created_at,
            engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
            metadata: {
              tags: item.content.match(/#\w+/g) || []
            },
            relevance_score: followingMatch + recencyScore
          }
        }))
      }

      // Fetch RSS news if this is a news request
      if (type === 'news' || type === 'all') {
        try {
          console.log('[For You API] Fetching RSS news...')
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const rssUrl = `${baseUrl}/api/feed/rss-news?limit=${Math.floor(limit / 2)}`
          console.log('[For You API] RSS URL:', rssUrl)
          
          const rssResponse = await fetch(rssUrl)
          console.log('[For You API] RSS response status:', rssResponse.status)
          
          if (rssResponse.ok) {
            const rssData = await rssResponse.json()
            console.log('[For You API] RSS data received:', {
              success: rssData.success,
              newsCount: rssData.news?.length || 0,
              total: rssData.total
            })
            
            if (rssData.success && rssData.news && rssData.news.length > 0) {
              const rssContent = rssData.news.map((item: any) => ({
                id: `rss_${item.id}`,
                type: 'news',
                title: item.title,
                description: item.description,
                author: {
                  id: `rss_${item.source}`,
                  name: item.author || item.source,
                  username: item.source.toLowerCase().replace(/\s+/g, ''),
                  avatar_url: item.image || `https://dummyimage.com/40x40/ef4444/ffffff?text=${item.source.charAt(0)}`,
                  is_verified: true
                },
                created_at: item.pubDate,
                engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
                metadata: {
                  url: item.link,
                  tags: [item.category, item.source].filter(Boolean)
                },
                relevance_score: 0.8 // High relevance for external news
              }))
              
              console.log('[For You API] Adding RSS content:', rssContent.length, 'items')
              allContent.push(...rssContent)
            } else {
              console.log('[For You API] No RSS news data available')
            }
          } else {
            console.error('[For You API] RSS response not ok:', rssResponse.status, rssResponse.statusText)
          }
        } catch (error) {
          console.error('[For You API] RSS news fetch error:', error)
        }
      }
    }

    // Sort content based on parameter
    switch (sort) {
      case 'recent':
        allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        allContent.sort((a, b) => (b.engagement.likes + b.engagement.views) - (a.engagement.likes + a.engagement.views))
        break
      case 'relevant':
      default:
        allContent.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
        break
    }

    // Apply pagination
    const paginatedContent = allContent.slice(offset, offset + limit)

    // Calculate content type counts
    const contentCounts = {
      all: allContent.length,
      music: allContent.filter(item => item.type === 'music').length,
      events: allContent.filter(item => item.type === 'event').length,
      videos: allContent.filter(item => item.type === 'video').length,
      tours: allContent.filter(item => item.type === 'tour').length,
      news: allContent.filter(item => item.type === 'news').length,
      blogs: allContent.filter(item => item.type === 'blog').length
    }

    console.log('[For You API] Successfully fetched content:', paginatedContent.length, 'counts:', contentCounts)

    return NextResponse.json({
      success: true,
      content: paginatedContent,
      interests: userInterests,
      counts: contentCounts,
      total: allContent.length,
      hasMore: offset + limit < allContent.length
    })

  } catch (error) {
    console.error('[For You API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 