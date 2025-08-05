import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
}

const musicRSSFeeds = [
  {
    name: 'Billboard',
    url: 'https://www.billboard.com/feed/rss/news',
    category: 'music-industry'
  },
  {
    name: 'Pitchfork',
    url: 'https://pitchfork.com/feed/feed-news/rss',
    category: 'music-culture'
  },
  {
    name: 'Rolling Stone',
    url: 'https://www.rollingstone.com/feed/',
    category: 'music-culture'
  },
  {
    name: 'NME',
    url: 'https://www.nme.com/news/music/feed',
    category: 'music-news'
  },
  {
    name: 'Stereogum',
    url: 'https://www.stereogum.com/feed/',
    category: 'indie-music'
  },
  {
    name: 'Consequence',
    url: 'https://consequence.net/feed/',
    category: 'music-culture'
  }
]

async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<RSSItem[]> {
  try {
    console.log(`🔍 Fetching RSS feed: ${sourceName} from ${feedUrl}`)
    
    // Use a CORS proxy to avoid CORS issues
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`
    
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    })

    if (!response.ok) {
      console.error(`❌ Failed to fetch RSS feed ${feedUrl}: ${response.status}`)
      return []
    }

    const data = await response.json()
    const xmlText = data.contents

    console.log(`📄 Received ${xmlText.length} characters from ${sourceName}`)

    // Simple XML parsing using regex (for server-side compatibility)
    const items: RSSItem[] = []
    
    // Extract items using regex
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1]
      
      const title = extractTagContent(itemContent, 'title')
      const description = extractTagContent(itemContent, 'description')
      const link = extractTagContent(itemContent, 'link')
      const pubDate = extractTagContent(itemContent, 'pubDate')
      const author = extractTagContent(itemContent, 'author') || 
                    extractTagContent(itemContent, 'dc:creator')
      const category = extractTagContent(itemContent, 'category')

      // Extract image from description or media:content
      let image: string | undefined
      const mediaContentMatch = itemContent.match(/<media:content[^>]+url="([^"]+)"/)
      if (mediaContentMatch) {
        image = mediaContentMatch[1]
      } else {
        // Try to extract image from description
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/)
        if (imgMatch) {
          image = imgMatch[1]
        }
      }

      if (title && link) {
        items.push({
          id: `${link}-${items.length}`,
          title: cleanText(title),
          description: cleanText(description),
          link,
          pubDate,
          author,
          category,
          image,
          source: sourceName
        })
      }
    }

    console.log(`✅ Parsed ${items.length} items from ${sourceName}`)
    return items
  } catch (error) {
    console.error(`❌ Error fetching RSS feed ${feedUrl}:`, error)
    return []
  }
}

function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 RSS News API called')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const source = searchParams.get('source')

    console.log(`📋 Parameters: limit=${limit}, category=${category}, source=${source}`)

    // For now, skip cache and fetch fresh data
    let allItems: RSSItem[] = []
    
    // Filter feeds based on source parameter
    const feedsToFetch = source 
      ? musicRSSFeeds.filter(feed => feed.name.toLowerCase() === source.toLowerCase())
      : musicRSSFeeds

    console.log(`📰 Fetching from ${feedsToFetch.length} feeds`)

    // Fetch from multiple feeds concurrently
    const feedPromises = feedsToFetch.map(feed => 
      fetchRSSFeed(feed.url, feed.name)
    )

    const results = await Promise.allSettled(feedPromises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      } else {
        console.error(`❌ Feed ${feedsToFetch[index].name} failed:`, result.reason)
      }
    })

    console.log(`📊 Total items fetched: ${allItems.length}`)

    // Filter by category if specified
    if (category) {
      allItems = allItems.filter(item => 
        item.category?.toLowerCase().includes(category.toLowerCase()) ||
        item.title.toLowerCase().includes(category.toLowerCase()) ||
        item.description.toLowerCase().includes(category.toLowerCase())
      )
      console.log(`🔍 After category filter: ${allItems.length} items`)
    }

    // Sort by publication date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime()
      const dateB = new Date(b.pubDate).getTime()
      return dateB - dateA
    })

    // Limit results
    const limitedItems = allItems.slice(0, limit)

    console.log(`✅ Returning ${limitedItems.length} items`)

    return NextResponse.json({
      success: true,
      news: limitedItems,
      total: allItems.length,
      sources: feedsToFetch.map(f => f.name),
      debug: {
        feedsAttempted: feedsToFetch.length,
        feedsSuccessful: results.filter(r => r.status === 'fulfilled').length,
        totalItemsBeforeLimit: allItems.length
      }
    })

  } catch (error) {
    console.error('❌ Error in RSS News API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        news: []
      },
      { status: 500 }
    )
  }
} 