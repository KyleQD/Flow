import { NextRequest, NextResponse } from 'next/server'

// Use a simple, reliable RSS feed for testing
const testRSSFeed = {
  name: 'Test Feed',
  url: 'https://feeds.feedburner.com/TechCrunch/',
  category: 'tech'
}

async function fetchTestRSSFeed() {
  try {
    console.log('🧪 Testing RSS feed functionality...')
    
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(testRSSFeed.url)}`
    
    console.log(`🔍 Fetching from: ${proxyUrl}`)
    
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const xmlText = data.contents

    console.log(`📄 Received ${xmlText.length} characters`)

    // Simple XML parsing
    const items = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 5) {
      const itemContent = match[1]
      
      const title = extractTagContent(itemContent, 'title')
      const description = extractTagContent(itemContent, 'description')
      const link = extractTagContent(itemContent, 'link')
      const pubDate = extractTagContent(itemContent, 'pubDate')

      if (title && link) {
        items.push({
          id: `test-${items.length}`,
          title: cleanText(title),
          description: cleanText(description || ''),
          link,
          pubDate,
          source: testRSSFeed.name,
          category: testRSSFeed.category
        })
      }
    }

    console.log(`✅ Successfully parsed ${items.length} test items`)
    return items

  } catch (error) {
    console.error('❌ Test RSS fetch failed:', error)
    throw error
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

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 RSS Test endpoint called')
    
    const items = await fetchTestRSSFeed()
    
    return NextResponse.json({
      success: true,
      message: 'RSS test successful',
      items,
      total: items.length,
      source: testRSSFeed.name,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ RSS test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'RSS test failed - check console for details',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 