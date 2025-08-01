import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing RSS integration in FYP API...')
    
    // Test the RSS API directly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const rssUrl = `${baseUrl}/api/feed/rss-news?limit=5`
    
    console.log('🔍 Testing RSS URL:', rssUrl)
    console.log('🌐 Base URL:', baseUrl)
    console.log('🔧 Environment:', {
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    })
    
    const rssResponse = await fetch(rssUrl)
    console.log('📡 RSS Response Status:', rssResponse.status)
    
    if (rssResponse.ok) {
      const rssData = await rssResponse.json()
      console.log('✅ RSS Data:', {
        success: rssData.success,
        newsCount: rssData.news?.length || 0,
        total: rssData.total,
        sources: rssData.sources
      })
      
      // Test transforming RSS data to FYP format
      if (rssData.success && rssData.news && rssData.news.length > 0) {
        const transformedContent = rssData.news.map((item: any) => ({
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
          relevance_score: 0.8
        }))
        
        return NextResponse.json({
          success: true,
          message: 'RSS integration test successful',
          testResults: {
            rssApiWorking: true,
            rssDataReceived: true,
            transformedContent: transformedContent.length,
            sampleContent: transformedContent.slice(0, 2)
          },
          environment: {
            baseUrl,
            hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'RSS API returned no data',
          testResults: {
            rssApiWorking: true,
            rssDataReceived: false
          }
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'RSS API request failed',
        testResults: {
          rssApiWorking: false,
          status: rssResponse.status,
          statusText: rssResponse.statusText
        }
      })
    }
    
  } catch (error) {
    console.error('❌ RSS integration test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'RSS integration test failed'
    }, { status: 500 })
  }
} 