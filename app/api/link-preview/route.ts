import { NextRequest, NextResponse } from 'next/server'

interface LinkPreviewData {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // For now, we'll return mock data based on the domain
    // In production, you'd want to:
    // 1. Fetch the HTML content of the URL
    // 2. Parse meta tags (og:title, og:description, og:image, etc.)
    // 3. Extract favicon
    // 4. Handle rate limiting and caching
    
    let previewData: LinkPreviewData = {
      url,
      siteName: parsedUrl.hostname.replace('www.', ''),
      favicon: `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`
    }

    // Special handling for known domains
    if (parsedUrl.hostname.includes('cnn.com')) {
      previewData = {
        ...previewData,
        title: 'Burning Man: Radical self-expression and wellness',
        description: 'Explore the unique culture and wellness aspects of Burning Man festival',
        image: '/placeholder.svg?height=200&width=400'
      }
    } else if (parsedUrl.hostname.includes('youtube.com')) {
      previewData = {
        ...previewData,
        title: 'YouTube Video',
        description: 'Watch this video on YouTube',
        image: '/placeholder.svg?height=200&width=400'
      }
    } else if (parsedUrl.hostname.includes('twitter.com') || parsedUrl.hostname.includes('x.com')) {
      previewData = {
        ...previewData,
        title: 'Twitter Post',
        description: 'View this post on Twitter',
        image: '/placeholder.svg?height=200&width=400'
      }
    } else if (parsedUrl.hostname.includes('instagram.com')) {
      previewData = {
        ...previewData,
        title: 'Instagram Post',
        description: 'View this post on Instagram',
        image: '/placeholder.svg?height=200&width=400'
      }
    } else {
      // Generic preview for unknown domains
      previewData = {
        ...previewData,
        title: `Visit ${parsedUrl.hostname}`,
        description: `Click to visit ${parsedUrl.hostname}`,
        image: undefined
      }
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json(previewData)
  } catch (error) {
    console.error('Link preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate link preview' },
      { status: 500 }
    )
  }
}
