import { NextRequest, NextResponse } from 'next/server'

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

interface RssItem {
  id: string
  title: string
  description: string
  link: string
  pubDate?: string
  author?: string
  category?: string
  image?: string
  source: string
}

async function fetchRSSFeed(feedUrl: string, sourceName: string): Promise<RssItem[]> {
  try {
    console.log(`🔍 Fetching RSS feed: ${sourceName} from ${feedUrl}`)
    
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

    // Simple XML parsing using regex
    const items: RssItem[] = []
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

      // Extract image
      let image: string | undefined
      const mediaContentMatch = itemContent.match(/<media:content[^>]+url="([^"]+)"/)
      if (mediaContentMatch) {
        image = mediaContentMatch[1]
      } else {
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
    return [] as RssItem[]
  }
}

function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function triggerRSSFetch() {
  try {
    console.log('🚀 Triggering RSS feed fetch...')
    
    let allItems: RssItem[] = []
    const feedResults: Array<{ source: string; itemsCount: number; status: string; error?: string }> = []

    // Fetch from all feeds concurrently
    const feedPromises = musicRSSFeeds.map(async (feed) => {
      const items = await fetchRSSFeed(feed.url, feed.name)
      feedResults.push({
        source: feed.name,
        itemsCount: items.length,
        status: items.length > 0 ? 'success' : 'no-items'
      })
      return items
    })

    const results = await Promise.allSettled<RssItem[]>(feedPromises)
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      } else {
        feedResults[index].status = 'error'
        feedResults[index].error = result.reason?.message || 'Unknown error'
      }
    })

    // Sort by publication date (newest first)
    allItems.sort((a: RssItem, b: RssItem) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
      return dateB - dateA
    })

    // Limit to 50 items
    const limitedItems = allItems.slice(0, 50)

    console.log(`✅ RSS feeds fetched: ${limitedItems.length} items from ${feedResults.filter(r => r.status === 'success').length} sources`)

    return {
      success: true,
      message: 'RSS feeds triggered successfully',
      results: {
        totalItems: limitedItems.length,
        feeds: feedResults,
        timestamp: new Date().toISOString()
      },
      sampleItems: limitedItems.slice(0, 3) // Show first 3 items as preview
    }

  } catch (error) {
    console.error('Error triggering RSS feeds:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Handle GET requests (for browser access)
export async function GET(request: NextRequest) {
  const result = await triggerRSSFetch()
  
  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

// Handle POST requests (for API calls)
export async function POST(request: NextRequest) {
  const result = await triggerRSSFetch()
  
  if (result.success) {
    return NextResponse.json(result)
  } else {
    return NextResponse.json(result, { status: 500 })
  }
} 