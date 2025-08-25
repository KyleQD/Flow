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

interface RSSFeed {
  title: string
  description: string
  link: string
  items: RSSItem[]
}

class RSSFeedService {
  private readonly musicRSSFeeds = [
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

  private async fetchRSSFeed(feedUrl: string): Promise<RSSFeed | null> {
    try {
      // Use a CORS proxy or server-side fetch to avoid CORS issues
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status}`)
      }

      const data = await response.json()
      const xmlText = data.contents

      // Parse XML to extract RSS items
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      const channel = xmlDoc.querySelector('channel')
      if (!channel) {
        throw new Error('Invalid RSS feed format')
      }

      const title = channel.querySelector('title')?.textContent || 'Unknown Feed'
      const description = channel.querySelector('description')?.textContent || ''
      const link = channel.querySelector('link')?.textContent || ''

      const items: RSSItem[] = []
      const itemElements = xmlDoc.querySelectorAll('item')

      itemElements.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent || ''
        const description = item.querySelector('description')?.textContent || ''
        const link = item.querySelector('link')?.textContent || ''
        const pubDate = item.querySelector('pubDate')?.textContent || ''
        const author = item.querySelector('author')?.textContent || 
                      item.querySelector('dc\\:creator')?.textContent || undefined
        const category = item.querySelector('category')?.textContent || undefined

        // Extract image from description or media:content
        let image: string | undefined
        const mediaContent = item.querySelector('media\\:content, content')
        if (mediaContent) {
          image = mediaContent.getAttribute('url') || undefined
        } else {
          // Try to extract image from description
          const imgMatch = description.match(/<img[^>]+src="([^"]+)"/)
          if (imgMatch) {
            image = imgMatch[1]
          }
        }

        if (title && link) {
          items.push({
            id: `${link}-${index}`,
            title: this.cleanText(title),
            description: this.cleanText(description),
            link,
            pubDate,
            author,
            category,
            image,
            source: title
          })
        }
      })

      return {
        title,
        description,
        link,
        items
      }
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error)
      return null
    }
  }

  private cleanText(text: string): string {
    // Remove HTML tags and decode HTML entities
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

  async getMusicNews(limit: number = 20): Promise<RSSItem[]> {
    try {
      const allItems: RSSItem[] = []
      
      // Fetch from multiple feeds concurrently
      const feedPromises = this.musicRSSFeeds.map(feed => 
        this.fetchRSSFeed(feed.url).then(result => ({
          ...result,
          source: feed.name,
          category: feed.category
        }))
      )

      const results = await Promise.allSettled(feedPromises)
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const feed = result.value
          const items = (feed.items || []).map(item => ({
            ...item,
            source: this.musicRSSFeeds[index].name
          }))
          allItems.push(...items)
        }
      })

      // Sort by publication date (newest first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        return dateB - dateA
      })

      // Return limited results
      return allItems.slice(0, limit)
    } catch (error) {
      console.error('Error fetching music news:', error)
      return []
    }
  }

  async getNewsByCategory(category: string, limit: number = 10): Promise<RSSItem[]> {
    const allNews = await this.getMusicNews(100)
    return allNews
      .filter(item => 
        item.category?.toLowerCase().includes(category.toLowerCase()) ||
        item.title.toLowerCase().includes(category.toLowerCase()) ||
        item.description.toLowerCase().includes(category.toLowerCase())
      )
      .slice(0, limit)
  }
}

export const rssFeedService = new RSSFeedService()
export type { RSSItem, RSSFeed } 