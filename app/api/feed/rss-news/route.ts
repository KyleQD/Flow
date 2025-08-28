import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// RSS Feed Sources - Music Industry Focus
const RSS_SOURCES = [
  {
    name: 'Pitchfork',
    url: 'https://pitchfork.com/feed/feed-news/rss/',
    category: 'Music News',
    priority: 1
  },
  {
    name: 'Billboard',
    url: 'https://www.billboard.com/feed/rss/news',
    category: 'Music Industry',
    priority: 1
  },
  {
    name: 'Rolling Stone',
    url: 'https://www.rollingstone.com/feed/',
    category: 'Music & Culture',
    priority: 1
  },
  {
    name: 'NME',
    url: 'https://www.nme.com/feed',
    category: 'Music News',
    priority: 2
  },
  {
    name: 'Stereogum',
    url: 'https://www.stereogum.com/feed/',
    category: 'Indie Music',
    priority: 2
  },
  {
    name: 'Consequence',
    url: 'https://consequence.net/feed/',
    category: 'Music & Culture',
    priority: 2
  },
  {
    name: 'BrooklynVegan',
    url: 'https://www.brooklynvegan.com/feed/',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The FADER',
    url: 'https://www.thefader.com/feed',
    category: 'Music & Culture',
    priority: 2
  },
  {
    name: 'Complex',
    url: 'https://www.complex.com/feed/rss',
    category: 'Hip-Hop & Culture',
    priority: 2
  },
  {
    name: 'Hypebeast',
    url: 'https://hypebeast.com/music/feed',
    category: 'Music & Culture',
    priority: 3
  },
  {
    name: 'The Guardian Music',
    url: 'https://www.theguardian.com/music/rss',
    category: 'Music News',
    priority: 2
  },
  {
    name: 'BBC Music',
    url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/music/rss.xml',
    category: 'Music News',
    priority: 2
  },
  {
    name: 'Variety',
    url: 'https://variety.com/feed/music/',
    category: 'Music Industry',
    priority: 1
  },
  {
    name: 'Spin',
    url: 'https://www.spin.com/feed/',
    category: 'Music News',
    priority: 2
  },
  {
    name: 'Alternative Press',
    url: 'https://www.altpress.com/feed/',
    category: 'Alternative Music',
    priority: 3
  },
  {
    name: 'Metal Injection',
    url: 'https://metalinjection.net/feed',
    category: 'Metal Music',
    priority: 3
  },
  {
    name: 'MetalSucks',
    url: 'https://www.metalsucks.net/feed/',
    category: 'Metal Music',
    priority: 3
  },
  {
    name: 'JazzTimes',
    url: 'https://jazztimes.com/feed/',
    category: 'Jazz Music',
    priority: 3
  },
  {
    name: 'Electronic Beats',
    url: 'https://www.electronicbeats.net/feed/',
    category: 'Electronic Music',
    priority: 3
  },
  {
    name: 'Resident Advisor',
    url: 'https://ra.co/feed',
    category: 'Electronic Music',
    priority: 2
  }
]

interface RSSItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  author?: string
  category?: string
  image?: string
  source: string
  priority: number
}

// Cache for RSS feeds to avoid hitting rate limits
const RSS_CACHE = new Map<string, { data: RSSItem[], timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

async function fetchRSSFeed(source: typeof RSS_SOURCES[0]): Promise<RSSItem[]> {
  const cacheKey = source.name
  const cached = RSS_CACHE.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    // Use a CORS proxy to fetch RSS feeds
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TourifyBot/1.0)'
      }
    })

    if (!response.ok) {
      console.warn(`Failed to fetch RSS from ${source.name}: ${response.status}`)
      return []
    }

    const data = await response.json()
    const xmlText = data.contents

    // Parse XML (simplified parsing)
    const items: RSSItem[] = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) && items.length < 10) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(/<title[^>]*>([^<]+)<\/title>/)
      const descriptionMatch = itemXml.match(/<description[^>]*>([^<]+)<\/description>/)
      const linkMatch = itemXml.match(/<link[^>]*>([^<]+)<\/link>/)
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/)
      const authorMatch = itemXml.match(/<author[^>]*>([^<]+)<\/author>/)
      const categoryMatch = itemXml.match(/<category[^>]*>([^<]+)<\/category>/)
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        const description = descriptionMatch ? descriptionMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : ''
        const link = linkMatch[1]
        const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString()
        const author = authorMatch ? authorMatch[1] : source.name
        const category = categoryMatch ? categoryMatch[1] : source.category

        // Extract image from description or use placeholder
        let image = `https://dummyimage.com/400x250/ef4444/ffffff?text=${source.name.charAt(0)}`
        const imgMatch = itemXml.match(/<img[^>]+src="([^"]+)"/)
        if (imgMatch) {
          image = imgMatch[1]
        }

        items.push({
          id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${items.length}`,
          title,
          description,
          link,
          pubDate,
          author,
          category,
          image,
          source: source.name,
          priority: source.priority
        })
      }
    }

    // Cache the results
    RSS_CACHE.set(cacheKey, { data: items, timestamp: Date.now() })
    
    return items
  } catch (error) {
    console.error(`Error fetching RSS from ${source.name}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const source = searchParams.get('source')

    // Filter sources based on parameters
    let sourcesToFetch = RSS_SOURCES
    if (source) {
      sourcesToFetch = RSS_SOURCES.filter(s => 
        s.name.toLowerCase().includes(source.toLowerCase())
      )
    }
    if (category) {
      sourcesToFetch = RSS_SOURCES.filter(s => 
        s.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Fetch RSS feeds in parallel
    const fetchPromises = sourcesToFetch.map(fetchRSSFeed)
    const results = await Promise.allSettled(fetchPromises)

    // Combine all successful results
    let allItems: RSSItem[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      }
    })

    // Sort by priority and date
    allItems.sort((a, b) => {
      // First by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      // Then by date (newer first)
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    })

    // Apply limit
    allItems = allItems.slice(0, limit)

    // Get unique sources
    const sources = [...new Set(allItems.map(item => item.source))]

    return NextResponse.json({
      success: true,
      news: allItems,
      total: allItems.length,
      sources,
      categories: [...new Set(RSS_SOURCES.map(s => s.category))],
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in RSS news API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RSS news',
      news: [],
      total: 0,
      sources: [],
      categories: []
    }, { status: 500 })
  }
}
