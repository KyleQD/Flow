import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// RSS Feed Sources - Expanded Music Industry Focus with Indie & Underground
const RSS_SOURCES = [
  // Major Music Publications
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
  
  // Indie & Underground Music
  {
    name: 'Stereogum',
    url: 'https://www.stereogum.com/feed/',
    category: 'Indie Music',
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
    category: 'Indie Music',
    priority: 2
  },
  {
    name: 'Consequence',
    url: 'https://consequence.net/feed/',
    category: 'Indie Music',
    priority: 2
  },
  {
    name: 'Alternative Press',
    url: 'https://www.altpress.com/feed/',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'Under the Radar',
    url: 'https://undertheradarmag.com/feed/',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'Aquarium Drunkard',
    url: 'https://aquariumdrunkard.com/feed/',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'Gorilla vs Bear',
    url: 'https://gorillavsbear.net/feed/',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The Line of Best Fit',
    url: 'https://www.thelineofbestfit.com/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'DIY Magazine',
    url: 'https://diymag.com/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The 405',
    url: 'https://www.thefourohfive.com/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The Quietus',
    url: 'https://thequietus.com/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'Drowned in Sound',
    url: 'https://drownedinsound.com/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The Skinny',
    url: 'https://www.theskinny.co.uk/music/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'Clash Magazine',
    url: 'https://www.clashmusic.com/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The Music',
    url: 'https://themusic.com.au/feed',
    category: 'Indie Music',
    priority: 3
  },
  {
    name: 'The Ringer',
    url: 'https://www.theringer.com/music/feed',
    category: 'Indie Music',
    priority: 2
  },
  
  // Underground & Experimental
  {
    name: 'Tiny Mix Tapes',
    url: 'https://www.tinymixtapes.com/feed',
    category: 'Underground Music',
    priority: 3
  },
  {
    name: 'Fact Magazine',
    url: 'https://www.factmag.com/feed/',
    category: 'Underground Music',
    priority: 3
  },
  {
    name: 'The Wire',
    url: 'https://www.thewire.co.uk/feed',
    category: 'Underground Music',
    priority: 3
  },
  {
    name: 'Bandcamp Daily',
    url: 'https://daily.bandcamp.com/feed',
    category: 'Underground Music',
    priority: 3
  },
  {
    name: 'Noisey',
    url: 'https://www.vice.com/en_us/rss/topic/music',
    category: 'Underground Music',
    priority: 2
  },
  {
    name: 'Pitchfork Reviews',
    url: 'https://pitchfork.com/feed/feed-album-reviews/rss/',
    category: 'Underground Music',
    priority: 2
  },
  {
    name: 'The Needle Drop',
    url: 'https://www.theneedledrop.com/feed',
    category: 'Underground Music',
    priority: 3
  },
  {
    name: 'Sputnik Music',
    url: 'https://www.sputnikmusic.com/rss.php',
    category: 'Underground Music',
    priority: 3
  },
  {
    name: 'Rate Your Music',
    url: 'https://rateyourmusic.com/rss/news',
    category: 'Underground Music',
    priority: 3
  },
  
  // Hip-Hop & Urban
  {
    name: 'Complex',
    url: 'https://www.complex.com/feed/rss',
    category: 'Hip-Hop',
    priority: 2
  },
  {
    name: 'Hypebeast',
    url: 'https://hypebeast.com/music/feed',
    category: 'Hip-Hop',
    priority: 3
  },
  {
    name: 'XXL',
    url: 'https://www.xxlmag.com/feed/',
    category: 'Hip-Hop',
    priority: 2
  },
  {
    name: 'HotNewHipHop',
    url: 'https://www.hotnewhiphop.com/feed/',
    category: 'Hip-Hop',
    priority: 3
  },
  {
    name: 'Rap Radar',
    url: 'https://rapradar.com/feed/',
    category: 'Hip-Hop',
    priority: 3
  },
  {
    name: 'Okayplayer',
    url: 'https://www.okayplayer.com/feed',
    category: 'Hip-Hop',
    priority: 3
  },
  {
    name: 'The Source',
    url: 'https://thesource.com/feed/',
    category: 'Hip-Hop',
    priority: 3
  },
  {
    name: 'Vibe',
    url: 'https://www.vibe.com/feed/',
    category: 'Hip-Hop',
    priority: 3
  },
  
  // Electronic & Dance
  {
    name: 'Resident Advisor',
    url: 'https://ra.co/feed',
    category: 'Electronic Music',
    priority: 2
  },
  {
    name: 'Electronic Beats',
    url: 'https://www.electronicbeats.net/feed/',
    category: 'Electronic Music',
    priority: 3
  },
  {
    name: 'Mixmag',
    url: 'https://mixmag.net/feed',
    category: 'Electronic Music',
    priority: 2
  },
  {
    name: 'DJ Mag',
    url: 'https://djmag.com/feed',
    category: 'Electronic Music',
    priority: 2
  },
  {
    name: 'XLR8R',
    url: 'https://www.xlr8r.com/feed/',
    category: 'Electronic Music',
    priority: 3
  },
  
  // Metal & Heavy Music
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
    name: 'Lambgoat',
    url: 'https://lambgoat.com/feed/',
    category: 'Metal Music',
    priority: 3
  },
  {
    name: 'Metal Hammer',
    url: 'https://www.loudersound.com/feed',
    category: 'Metal Music',
    priority: 2
  },
  {
    name: 'Decibel Magazine',
    url: 'https://decibelmagazine.com/feed/',
    category: 'Metal Music',
    priority: 3
  },
  {
    name: 'Blabbermouth',
    url: 'https://blabbermouth.net/feed',
    category: 'Metal Music',
    priority: 3
  },
  {
    name: 'Metal Archives',
    url: 'https://www.metal-archives.com/rss/news',
    category: 'Metal Music',
    priority: 3
  },
  
  // Jazz & Experimental
  {
    name: 'JazzTimes',
    url: 'https://jazztimes.com/feed/',
    category: 'Jazz Music',
    priority: 3
  },
  {
    name: 'DownBeat',
    url: 'https://downbeat.com/feed/',
    category: 'Jazz Music',
    priority: 3
  },
  {
    name: 'All About Jazz',
    url: 'https://www.allaboutjazz.com/feed',
    category: 'Jazz Music',
    priority: 3
  },
  {
    name: 'Jazzwise',
    url: 'https://www.jazzwise.com/feed',
    category: 'Jazz Music',
    priority: 3
  },
  
  // Local & Regional
  {
    name: 'Chicago Reader',
    url: 'https://chicagoreader.com/music/feed/',
    category: 'Local Music',
    priority: 3
  },
  {
    name: 'LA Weekly',
    url: 'https://www.laweekly.com/music/feed/',
    category: 'Local Music',
    priority: 3
  },
  {
    name: 'Austin Chronicle',
    url: 'https://www.austinchronicle.com/music/feed/',
    category: 'Local Music',
    priority: 3
  },
  {
    name: 'Nashville Scene',
    url: 'https://www.nashvillescene.com/music/feed/',
    category: 'Local Music',
    priority: 3
  },
  {
    name: 'Seattle Weekly',
    url: 'https://www.seattleweekly.com/music/feed/',
    category: 'Local Music',
    priority: 3
  },
  {
    name: 'SF Weekly',
    url: 'https://www.sfweekly.com/music/feed/',
    category: 'Local Music',
    priority: 3
  },
  {
    name: 'Village Voice',
    url: 'https://www.villagevoice.com/music/feed/',
    category: 'Local Music',
    priority: 3
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
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes (reduced for fresher content)

// Content quality filters
const NEWSWORTHY_KEYWORDS = [
  'album', 'release', 'announce', 'tour', 'concert', 'festival', 'single', 'ep', 'mixtape',
  'collaboration', 'feature', 'remix', 'cover', 'interview', 'review', 'award', 'chart',
  'streaming', 'platform', 'label', 'sign', 'contract', 'breakup', 'reunion', 'debut',
  'comeback', 'retirement', 'death', 'birthday', 'anniversary', 'milestone', 'record',
  'break', 'hit', 'viral', 'trending', 'controversy', 'scandal', 'lawsuit', 'settlement'
]

const LOW_QUALITY_KEYWORDS = [
  'clickbait', 'gossip', 'rumor', 'unconfirmed', 'allegedly', 'supposedly', 'maybe',
  'could', 'might', 'possibly', 'reportedly', 'sources say', 'insider', 'exclusive'
]

function isNewsworthy(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  
  // Check for newsworthy keywords
  const hasNewsworthyKeywords = NEWSWORTHY_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  )
  
  // Check for low-quality indicators
  const hasLowQualityKeywords = LOW_QUALITY_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  )
  
  // Must have newsworthy keywords and not have low-quality indicators
  return hasNewsworthyKeywords && !hasLowQualityKeywords
}

function extractImageFromContent(itemXml: string, sourceName: string): string {
  // Try multiple image extraction methods
  const imgPatterns = [
    /<img[^>]+src="([^"]+)"/i,
    /<image[^>]*>.*?<url[^>]*>([^<]+)<\/url>/i,
    /<media:content[^>]+url="([^"]+)"/i,
    /<enclosure[^>]+url="([^"]+)"/i
  ]
  
  for (const pattern of imgPatterns) {
    const match = itemXml.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  // Generate a themed placeholder based on source
  const colors = {
    'Pitchfork': 'ef4444',
    'Billboard': '3b82f6', 
    'Rolling Stone': 'dc2626',
    'NME': 'f59e0b',
    'Stereogum': '8b5cf6',
    'BrooklynVegan': '10b981',
    'Complex': 'f97316',
    'XXL': '000000',
    'Resident Advisor': '06b6d4',
    'Mixmag': 'ec4899'
  }
  
  const color = colors[sourceName as keyof typeof colors] || '6b7280'
  return `https://dummyimage.com/400x250/${color}/ffffff?text=${sourceName.charAt(0)}`
}

async function fetchRSSFeed(source: typeof RSS_SOURCES[0]): Promise<RSSItem[]> {
  const cacheKey = source.name
  const cached = RSS_CACHE.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    console.log(`[RSS] Fetching from ${source.name}: ${source.url}`)
    
    // Try multiple CORS proxies for better reliability
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}`,
      `https://cors-anywhere.herokuapp.com/${source.url}`,
      `https://thingproxy.freeboard.io/fetch/${source.url}`
    ]
    
    let xmlText = ''
    let proxyUsed = ''
    
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TourifyBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*'
          }
        })

        if (response.ok) {
          const data = await response.json()
          xmlText = data.contents || data
          proxyUsed = proxyUrl
          break
        }
      } catch (proxyError) {
        console.warn(`[RSS] Proxy failed for ${source.name}: ${proxyUrl}`)
        continue
      }
    }
    
    if (!xmlText) {
      console.warn(`[RSS] All proxies failed for ${source.name}`)
      return []
    }

    console.log(`[RSS] Successfully fetched from ${source.name} via ${proxyUsed}`)

    // Parse XML with improved regex patterns
    const items: RSSItem[] = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) && items.length < 15) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(/<title[^>]*>([^<]+)<\/title>/)
      const descriptionMatch = itemXml.match(/<description[^>]*>([^<]+)<\/description>/)
      const linkMatch = itemXml.match(/<link[^>]*>([^<]+)<\/link>/)
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/)
      const authorMatch = itemXml.match(/<author[^>]*>([^<]+)<\/author>/)
      const categoryMatch = itemXml.match(/<category[^>]*>([^<]+)<\/category>/)
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
        
        const description = descriptionMatch 
          ? descriptionMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .trim()
          : ''
        
        const link = linkMatch[1].trim()
        const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString()
        const author = authorMatch ? authorMatch[1].trim() : source.name
        const category = categoryMatch ? categoryMatch[1].trim() : source.category

        // Only include newsworthy content
        if (isNewsworthy(title, description)) {
          const image = extractImageFromContent(itemXml, source.name)
          
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
    }

    console.log(`[RSS] ${source.name}: Found ${items.length} newsworthy items`)
    
    // Cache the results
    RSS_CACHE.set(cacheKey, { data: items, timestamp: Date.now() })
    
    return items
  } catch (error) {
    console.error(`[RSS] Error fetching from ${source.name}:`, error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const source = searchParams.get('source')

    console.log(`[RSS API] Request: limit=${limit}, category=${category}, source=${source}`)

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

    console.log(`[RSS API] Fetching from ${sourcesToFetch.length} sources`)

    // Fetch RSS feeds in parallel with timeout
    const fetchPromises = sourcesToFetch.map(async (source) => {
      try {
        const items = await Promise.race([
          fetchRSSFeed(source),
          new Promise<RSSItem[]>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 15000)
          )
        ])
        return { source: source.name, items, success: true }
      } catch (error) {
        console.warn(`[RSS API] Failed to fetch from ${source.name}:`, error)
        return { source: source.name, items: [], success: false }
      }
    })

    const results = await Promise.allSettled(fetchPromises)

    // Combine all successful results
    let allItems: RSSItem[] = []
    const successfulSources: string[] = []
    const failedSources: string[] = []

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        allItems.push(...result.value.items)
        successfulSources.push(result.value.source)
      } else if (result.status === 'fulfilled' && !result.value.success) {
        failedSources.push(result.value.source)
      } else {
        console.warn(`[RSS API] Promise rejected:`, result)
      }
    })

    console.log(`[RSS API] Results: ${successfulSources.length} successful, ${failedSources.length} failed`)
    console.log(`[RSS API] Successful sources:`, successfulSources)
    console.log(`[RSS API] Failed sources:`, failedSources)

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

    // Get unique sources and categories
    const sources = [...new Set(allItems.map(item => item.source))]
    const categories = [...new Set(allItems.map(item => item.category))]

    console.log(`[RSS API] Final results: ${allItems.length} items from ${sources.length} sources`)

    return NextResponse.json({
      success: true,
      news: allItems,
      total: allItems.length,
      sources,
      categories,
      successfulSources,
      failedSources,
      lastUpdated: new Date().toISOString(),
      cacheInfo: {
        cacheDuration: CACHE_DURATION / 1000, // seconds
        cachedSources: Array.from(RSS_CACHE.keys())
      }
    })

  } catch (error) {
    console.error('[RSS API] Error in RSS news API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch RSS news',
      news: [],
      total: 0,
      sources: [],
      categories: [],
      successfulSources: [],
      failedSources: []
    }, { status: 500 })
  }
}
