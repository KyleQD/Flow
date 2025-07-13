import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const timeframe = searchParams.get('timeframe') || '7d' // 1d, 7d, 30d

    // Calculate date range based on timeframe
    const now = new Date()
    const daysBack = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get trending hashtags from posts
    const { data: posts, error: postsError } = await supabase
      .from('demo_posts')
      .select('content, likes_count, created_at')
      .gte('created_at', startDate.toISOString())
      .order('likes_count', { ascending: false })

    if (postsError) {
      console.error('Error fetching posts for trending:', postsError)
      return NextResponse.json({ error: 'Failed to fetch trending data' }, { status: 500 })
    }

    // Extract hashtags and calculate engagement
    const hashtagStats = new Map<string, { count: number; engagement: number; trend: string }>()
    
    posts?.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || []
      hashtags.forEach((tag: string) => {
        const normalizedTag = tag.toLowerCase()
        const existing = hashtagStats.get(normalizedTag) || { count: 0, engagement: 0, trend: '+0%' }
        existing.count += 1
        existing.engagement += post.likes_count || 0
        hashtagStats.set(normalizedTag, existing)
      })
    })

    // Get trending genres from music and events
    const { data: music, error: musicError } = await supabase
      .from('demo_music_releases')
      .select('genres, streams_count, created_at')
      .gte('created_at', startDate.toISOString())

    const { data: events, error: eventsError } = await supabase
      .from('demo_events')
      .select('genres, attendees_count, created_at')
      .gte('created_at', startDate.toISOString())

    // Add genre-based trends
    const genreStats = new Map<string, { count: number; engagement: number; trend: string }>()
    
    music?.forEach(release => {
      release.genres?.forEach((genre: string) => {
        const existing = genreStats.get(genre) || { count: 0, engagement: 0, trend: '+0%' }
        existing.count += 1
        existing.engagement += release.streams_count || 0
        genreStats.set(genre, existing)
      })
    })

    events?.forEach(event => {
      event.genres?.forEach((genre: string) => {
        const existing = genreStats.get(genre) || { count: 0, engagement: 0, trend: '+0%' }
        existing.count += 1
        existing.engagement += event.attendees_count || 0
        genreStats.set(genre, existing)
      })
    })

    // Combine and sort trending items
    const trendingItems = []

    // Add hashtags
    for (const [tag, stats] of hashtagStats.entries()) {
      trendingItems.push({
        tag,
        type: 'hashtag',
        count: `${stats.count}K`,
        engagement: stats.engagement,
        trend: `+${Math.floor(Math.random() * 50) + 10}%` // Simulate trend percentage
      })
    }

    // Add genres
    for (const [genre, stats] of genreStats.entries()) {
      trendingItems.push({
        tag: `#${genre}`,
        type: 'genre',
        count: `${Math.floor(stats.engagement / 100)}K`,
        engagement: stats.engagement,
        trend: `+${Math.floor(Math.random() * 40) + 15}%`
      })
    }

    // Add some popular static trending tags
    const staticTrends = [
      { tag: '#CyberpunkVibes', type: 'hashtag', count: '127K', engagement: 12700, trend: '+24%' },
      { tag: '#NeonNights', type: 'hashtag', count: '89K', engagement: 8900, trend: '+18%' },
      { tag: '#DigitalBeats', type: 'hashtag', count: '156K', engagement: 15600, trend: '+31%' },
      { tag: '#FutureSounds', type: 'hashtag', count: '203K', engagement: 20300, trend: '+12%' },
      { tag: '#VirtualConcert', type: 'hashtag', count: '78K', engagement: 7800, trend: '+45%' },
      { tag: '#ElectronicMusic', type: 'genre', count: '340K', engagement: 34000, trend: '+22%' },
      { tag: '#IndieRock', type: 'genre', count: '256K', engagement: 25600, trend: '+16%' },
      { tag: '#Jazz', type: 'genre', count: '178K', engagement: 17800, trend: '+8%' },
      { tag: '#TechHouse', type: 'genre', count: '145K', engagement: 14500, trend: '+35%' },
      { tag: '#AmbientMusic', type: 'genre', count: '92K', engagement: 9200, trend: '+28%' }
    ]

    // Merge with static trends and sort by engagement
    const allTrends = [...trendingItems, ...staticTrends]
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      trending: allTrends,
      timeframe,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Trending API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 