'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Music2,
  Calendar,
  Video,
  MapPin,
  FileText,
  Play,
  Heart,
  Share2,
  MessageCircle,
  Clock,
  Star,
  Eye,
  ExternalLink,
  Bookmark,
  BookmarkPlus,
  X,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Search,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { ThreadCardV2 } from '@/components/forums/thread-card-v2'
import { ThreadComposerV2 } from '@/components/forums/thread-composer-v2'


interface ContentItem {
  id: string
  type: 'music' | 'event' | 'video' | 'tour' | 'news' | 'blog' | 'forum'
  title: string
  description?: string
  author?: {
    id: string
    name: string
    username: string
    avatar_url?: string
    is_verified: boolean
  }
  cover_image?: string
  created_at: string
  engagement: {
    likes: number
    views: number
    shares: number
    comments: number
  }
  metadata?: {
    genre?: string
    duration?: number
    location?: string
    date?: string
    venue?: string
    capacity?: number
    ticket_price?: number
    url?: string
    tags?: string[]
    forum?: {
      id: string
      name: string
      slug: string
    }
    user_vote?: number
  }
  is_liked?: boolean
  is_following?: boolean
  relevance_score?: number
  positive_score?: number
  is_bookmarked?: boolean
}

export function ForYouPage() {
  const [content, setContent] = useState<ContentItem[]>([
    // Add a hardcoded blog post for testing
    {
      id: 'test-blog-1',
      type: 'blog',
      title: 'The Future of Independent Music',
      description: 'Exploring how independent artists are reshaping the music industry through digital platforms and direct fan engagement.',
      author: {
        id: 'test-author-1',
        name: 'Sarah Johnson',
        username: 'sarahjohnson',
        avatar_url: 'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
        is_verified: false
      },
      cover_image: 'https://dummyimage.com/800x400/8b5cf6/ffffff?text=The+Future+of+Independent+Music',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      engagement: { likes: 89, views: 1247, shares: 45, comments: 23 },
      metadata: {
        url: '/blog/the-future-of-independent-music',
        tags: ['Independent Music', 'Digital Age', 'Music Industry']
        // reading_time: 14
      },
      relevance_score: 0.95
    }
  ])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'relevant' | 'recent' | 'popular'>('relevant')
  const [bookmarkedContent, setBookmarkedContent] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  const contentTypes = [
    { value: 'all', label: 'All', icon: Sparkles },
    { value: 'music', label: 'Music', icon: Music2 },
    { value: 'videos', label: 'Videos', icon: Video },
    { value: 'news', label: 'News', icon: FileText },
    { value: 'blogs', label: 'Blogs', icon: FileText },
    { value: 'forums', label: 'Forums', icon: Users },
    { value: 'indie', label: 'Indie', icon: Music2 },
    { value: 'hiphop', label: 'Hip-Hop', icon: Music2 },
    { value: 'electronic', label: 'Electronic', icon: Music2 },
    { value: 'metal', label: 'Metal', icon: Music2 },
    { value: 'jazz', label: 'Jazz', icon: Music2 },
    { value: 'underground', label: 'Underground', icon: Music2 },
    { value: 'local', label: 'Local', icon: MapPin }
  ]

  // Helper function to get placeholder images
  const getPlaceholderImage = (type: string, width: number = 400, height: number = 300) => {
    const colors = {
      music: '6366f1', // Indigo
      event: '10b981', // Emerald
      video: '3b82f6', // Blue
      tour: 'f59e0b', // Amber
      news: 'ef4444', // Red
      blog: '8b5cf6',  // Violet
      forum: '64748b' // Slate
    }
    
    const color = colors[type as keyof typeof colors] || '6b7280'
    const text = type.toUpperCase()
    
    // Use a different placeholder service that doesn't require domain configuration
    return `https://dummyimage.com/${width}x${height}/${color}/ffffff&text=${text}`
  }

  // Positive sentiment keywords for content prioritization
  const positiveKeywords = [
    'awesome', 'amazing', 'incredible', 'fantastic', 'brilliant', 'outstanding',
    'cool', 'epic', 'legendary', 'phenomenal', 'extraordinary', 'remarkable',
    'best', 'greatest', 'top', 'premium', 'excellent', 'superb', 'perfect',
    'super', 'amazing', 'wonderful', 'marvelous', 'splendid', 'magnificent',
    'funny', 'hilarious', 'comedy', 'humorous', 'entertaining', 'joyful',
    'elegant', 'beautiful', 'gorgeous', 'stunning', 'breathtaking', 'sophisticated',
    'exciting', 'thrilling', 'energetic', 'dynamic', 'vibrant', 'lively',
    'inspiring', 'motivational', 'uplifting', 'empowering', 'encouraging',
    'innovative', 'creative', 'groundbreaking', 'revolutionary', 'cutting-edge',
    'successful', 'winning', 'victorious', 'triumphant', 'achievement',
    'love', 'passion', 'enthusiasm', 'excitement', 'happiness', 'joy'
  ]

  // Function to calculate positive sentiment score
  const calculatePositiveScore = (text: string): number => {
    if (!text) return 0
    
    const lowerText = text.toLowerCase()
    let score = 0
    
    positiveKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = lowerText.match(regex)
      if (matches) {
        score += matches.length * 2 // Weight positive keywords more heavily
      }
    })
    
    // Bonus for multiple positive words
    const positiveWordCount = positiveKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length
    
    if (positiveWordCount > 1) {
      score += positiveWordCount * 0.5 // Bonus for variety
    }
    
    return score
  }

  const loadPersonalizedContent = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '50',
        sort: sortBy
      })
      
      // Add type parameter if a specific tab is selected
      if (activeTab !== 'all') {
        const typeMapping: { [key: string]: string } = {
          'videos': 'video',
          'blogs': 'blog',
          'forums': 'forum',
          'news': 'news' // Fix: explicitly map 'news' to 'news'
        }
        const targetType = typeMapping[activeTab] || activeTab.slice(0, -1)
        params.append('type', targetType)
      }
      
      console.log('[FYP] Loading content with params:', params.toString())
      const response = await fetch(`/api/feed/for-you?${params}`)
      const data = await response.json()
      
      if (data.success && data.content) {
        console.log('[FYP] Received content from API:', {
          totalItems: data.content.length,
          contentTypes: data.content.map((item: any) => item.type),
          newsItems: data.content.filter((item: any) => item.type === 'news').length
        })
        
        // Initialize engagement data to zero for all content and apply positive sentiment scoring
        const contentWithZeroEngagement = data.content.map((item: any) => {
          const title = item.title || item.metadata?.title || 'Untitled'
          const description = item.description || ''
          
          // Calculate positive sentiment score
          const titleScore = calculatePositiveScore(title)
          const descriptionScore = calculatePositiveScore(description)
          const positiveScore = titleScore + descriptionScore
          
          return {
            ...item,
            // Harmonize forum payload keys into ContentItem shape
            type: item.type,
            title,
            description,
            author: item.author,
            engagement: {
              likes: item.engagement?.likes || 0,
              views: item.engagement?.views || 0,
              shares: item.engagement?.shares || 0,
              comments: item.engagement?.comments || 0
            },
            // Add positive sentiment score to relevance
            relevance_score: (item.relevance_score || 0.8) + (positiveScore * 0.1),
            positive_score: positiveScore
          }
        })
        
        // Sort content by positive sentiment score (higher scores first)
        const sortedContent = contentWithZeroEngagement.sort((a: any, b: any) => 
          (b.positive_score || 0) - (a.positive_score || 0)
        )
        
        setContent(sortedContent)
      } else {
        console.log('[FYP] API failed, using hybrid content (mock + RSS + blogs)')
        // Hybrid approach: Use mock data + try to fetch RSS news + real blogs
        let hybridContent = generateMockContent()
        console.log('[FYP] Generated mock content:', hybridContent.length, 'items')
        
        // Try to fetch real blog posts (always fetch for testing)
        if (true) { // activeTab === 'blogs' || activeTab === 'all'
          try {
            console.log('[FYP] Attempting to fetch real blog posts... (activeTab:', activeTab, ')')
            const blogsResponse = await fetch('/api/feed/blogs?limit=10')
            console.log('[FYP] Blog API response status:', blogsResponse.status)
            if (blogsResponse.ok) {
              const blogsData = await blogsResponse.json()
              console.log('[FYP] Blog API response data:', blogsData)
              if (blogsData.data && blogsData.data.length > 0) {
                console.log('[FYP] Successfully fetched blog posts:', blogsData.data.length, 'items')
                
                // Convert blog posts to ContentItem format
                const blogContent = blogsData.data.map((blog: any) => ({
                  id: blog.id,
                  type: 'blog' as const,
                  title: blog.title,
                  description: blog.description,
                  author: blog.author,
                  cover_image: blog.cover_image,
                  created_at: blog.created_at,
                  engagement: blog.engagement,
                  metadata: {
                    ...blog.metadata,
                    url: blog.metadata?.url || `/blog/${blog.slug}`,
                    // reading_time: blog.metadata?.reading_time || 5
                  },
                  relevance_score: blog.relevance_score || 0.85
                }))
                
                // Add blog content to hybrid content (prioritize real blogs)
                hybridContent = [...blogContent, ...hybridContent.filter(item => item.type !== 'blog')]
                console.log('[FYP] Hybrid content created with real blog posts:', hybridContent.length, 'total items')
              }
            }
          } catch (blogsError) {
            console.error('[FYP] Blog posts fetch failed in hybrid mode:', blogsError)
            console.error('[FYP] Blog posts fetch error details:', blogsError instanceof Error ? blogsError.message : blogsError)
          }
        }
        
        // Try to fetch RSS news for various tabs
                  const shouldFetchRSS = ['news', 'all', 'indie', 'hiphop', 'electronic', 'metal', 'jazz', 'underground', 'local'].includes(activeTab)
        if (shouldFetchRSS) {
          try {
            console.log('[FYP] Attempting to fetch RSS news for hybrid content...')
            
            // Build RSS query parameters based on active tab
            let rssParams = 'limit=15'
                         if (activeTab === 'indie') {
               rssParams += '&category=Indie Music'
             } else if (activeTab === 'hiphop') {
               rssParams += '&category=Hip-Hop'
             } else if (activeTab === 'electronic') {
               rssParams += '&category=Electronic Music'
             } else if (activeTab === 'metal') {
               rssParams += '&category=Metal Music'
             } else if (activeTab === 'jazz') {
               rssParams += '&category=Jazz Music'
             } else if (activeTab === 'underground') {
               rssParams += '&category=Underground Music'
             } else if (activeTab === 'local') {
               rssParams += '&category=Local Music'
             }
            
            const rssResponse = await fetch(`/api/feed/rss-news?${rssParams}`)
            if (rssResponse.ok) {
              const rssData = await rssResponse.json()
              if (rssData.success && rssData.news && rssData.news.length > 0) {
                console.log('[FYP] Successfully fetched RSS news:', rssData.news.length, 'items')
                
                // Convert RSS items to ContentItem format with positive sentiment scoring
                const rssContent = rssData.news.map((item: any, index: number) => {
                  const title = item.title || ''
                  const description = item.description || ''
                  
                  // Calculate positive sentiment score
                  const titleScore = calculatePositiveScore(title)
                  const descriptionScore = calculatePositiveScore(description)
                  const positiveScore = titleScore + descriptionScore
                  
                  return {
                    id: `rss_${item.id}`,
                    type: 'news' as const,
                    title,
                    description,
                    author: {
                      id: `rss_${item.source}`,
                      name: item.author || item.source,
                      username: item.source.toLowerCase().replace(/\s+/g, ''),
                      avatar_url: item.image || `https://dummyimage.com/40x40/ef4444/ffffff?text=${item.source.charAt(0)}`,
                      is_verified: true
                    },
                    cover_image: item.image || getPlaceholderImage('news', 400, 250),
                    created_at: item.pubDate,
                    engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
                    metadata: {
                      url: item.link,
                      tags: [item.category, item.source].filter(Boolean)
                    },
                    relevance_score: (0.8 + (index * 0.05)) + (positiveScore * 0.1),
                    positive_score: positiveScore
                  }
                })
                
                // Add RSS content to hybrid content
                hybridContent = [...rssContent, ...hybridContent]
                console.log('[FYP] Hybrid content created with RSS news:', hybridContent.length, 'total items')
              }
            }
          } catch (rssError) {
            console.error('[FYP] RSS fetch failed in hybrid mode:', rssError)
          }
        }
        
        console.log('[FYP] Final hybrid content:', hybridContent.length, 'items, types:', hybridContent.map(item => item.type))
        setContent(hybridContent)
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setContent(generateMockContent())
    } finally {
      setLoading(false)
    }
  }

  const generateMockContent = (): ContentItem[] => {
    const mockItems = [
      // Add a hardcoded blog post for testing
      {
        id: 'test-blog-1',
        type: 'blog' as const,
        title: 'The Future of Independent Music',
        description: 'Exploring how independent artists are reshaping the music industry through digital platforms and direct fan engagement.',
        author: {
          id: 'test-author-1',
          name: 'Sarah Johnson',
          username: 'sarahjohnson',
          avatar_url: 'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
          is_verified: false
        },
        cover_image: 'https://dummyimage.com/800x400/8b5cf6/ffffff?text=The+Future+of+Independent+Music',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 89, views: 1247, shares: 45, comments: 23 },
        metadata: {
          url: '/blog/the-future-of-independent-music',
          tags: ['Independent Music', 'Digital Age', 'Music Industry'],
          // reading_time: 14
        },
        relevance_score: 0.95
      },
      {
        id: '1',
        type: 'music',
        title: 'Midnight Dreams - New Single',
        description: 'Fresh indie rock vibes with haunting vocals and atmospheric production that will transport you to another dimension.',
        author: {
          id: '1',
          name: 'Luna Echo',
          username: 'lunaecho',
          avatar_url: getPlaceholderImage('music', 40, 40),
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 400),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { genre: 'Indie Rock', duration: 180 },
        relevance_score: 0.95
      },
      {
        id: '2',
        type: 'event',
        title: 'Summer Music Festival 2024',
        description: 'Join us for an incredible day of live music featuring top indie artists from around the country. Food trucks, craft beer, and amazing vibes!',
        author: {
          id: '2',
          name: 'Central Park Arena',
          username: 'centralparkarena',
          avatar_url: getPlaceholderImage('event', 40, 40),
          is_verified: true
        },
        cover_image: getPlaceholderImage('event', 400, 300),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { date: '2024-07-15', location: 'Central Park Arena', venue: 'Central Park Arena', capacity: 5000, ticket_price: 75 },
        relevance_score: 0.88
      },
      {
        id: '3',
        type: 'video',
        title: 'Behind the Scenes: Studio Session',
        description: 'Exclusive look at the recording process for our latest album. See how the magic happens in the studio.',
        author: {
          id: '3',
          name: 'The Midnight Collective',
          username: 'midnightcollective',
          avatar_url: getPlaceholderImage('video', 40, 40),
          is_verified: false
        },
        cover_image: getPlaceholderImage('video', 400, 225),
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { duration: 480 },
        relevance_score: 0.92
      },
      {
        id: '4',
        type: 'tour',
        title: 'Luna Echo World Tour 2024',
        description: 'Luna Echo embarks on their first world tour, bringing their ethereal sound to fans across the globe.',
        author: {
          id: '4',
          name: 'Echo & The Bunnymen',
          username: 'echoandbunnymen',
          avatar_url: getPlaceholderImage('tour', 40, 40),
          is_verified: true
        },
        cover_image: getPlaceholderImage('tour', 400, 300),
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { date: '2024-06-01', location: 'Worldwide' },
        relevance_score: 0.87
      },
      {
        id: '5',
        type: 'news',
        title: 'New Album Release: Industry Insights',
        description: 'Breaking news in the music industry as top artists announce groundbreaking new albums and innovative collaborations.',
        author: {
          id: '5',
          name: 'Music Industry Weekly',
          username: 'musicindustryweekly',
          avatar_url: getPlaceholderImage('news', 40, 40),
          is_verified: true
        },
        cover_image: getPlaceholderImage('news', 400, 250),
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { tags: ['#MusicIndustry', '#NewReleases'] },
        relevance_score: 0.85
      },
      {
        id: '6',
        type: 'blog',
        title: 'The Future of Independent Music',
        description: 'Exploring how independent artists are reshaping the music industry through digital platforms and direct fan engagement.',
        author: {
          id: '6',
          name: 'Sarah Johnson',
          username: 'sarahjohnson',
          avatar_url: getPlaceholderImage('blog', 40, 40),
          is_verified: false
        },
        cover_image: getPlaceholderImage('blog', 400, 250),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { tags: ['#IndependentMusic', '#DigitalAge'] },
        relevance_score: 0.83
      },
      // Additional RSS-style news items for testing
      {
        id: 'rss_1',
        type: 'news',
        title: 'Anti-Flag\'s Justin Sane Ordered to Pay Nearly $2 Million in Damages',
        description: 'A federal judge handed down a default judgment after the punk singer never acknowledged the sexual assault lawsuit filed against him.',
        author: {
          id: 'rss_pitchfork',
          name: 'Matthew Strauss',
          username: 'pitchfork',
          avatar_url: 'https://dummyimage.com/40x40/ef4444/ffffff?text=P',
          is_verified: true
        },
        cover_image: getPlaceholderImage('news', 400, 250),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: 'https://pitchfork.com/news/anti-flags-justin-sane-ordered-to-pay-nearly-2-million-in-damages-in-sexual-assault-lawsuit',
          tags: ['News', 'Pitchfork', 'Legal']
        },
        relevance_score: 0.8
      },
      {
        id: 'rss_2',
        type: 'news',
        title: 'King Gizzard & the Lizard Wizard Leave Spotify',
        description: 'The Australian band opposes military investments made by Daniel Ek, following in the footsteps of Deerhoof and Xiu Xiu.',
        author: {
          id: 'rss_pitchfork',
          name: 'Matthew Strauss',
          username: 'pitchfork',
          avatar_url: 'https://dummyimage.com/40x40/ef4444/ffffff?text=P',
          is_verified: true
        },
        cover_image: getPlaceholderImage('news', 400, 250),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: 'https://pitchfork.com/news/king-gizzard-and-the-lizard-wizard-leave-spotify',
          tags: ['News', 'Pitchfork', 'Streaming']
        },
        relevance_score: 0.85
      },
      {
        id: 'rss_3',
        type: 'news',
        title: 'Amaarae Shares Video for New Song "Girlie-Pop!": Watch',
        description: 'The Ghanaian American singer releases a new music video showcasing her unique blend of Afropop and alternative sounds.',
        author: {
          id: 'rss_pitchfork',
          name: 'Jazz Monroe',
          username: 'pitchfork',
          avatar_url: 'https://dummyimage.com/40x40/ef4444/ffffff?text=P',
          is_verified: true
        },
        cover_image: getPlaceholderImage('news', 400, 250),
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: 'https://pitchfork.com/news/amaarae-shares-video-for-new-song-girlie-pop-watch',
          tags: ['News', 'Pitchfork', 'New Music']
        },
        relevance_score: 0.9
      },
      // Additional genre-specific content
      {
        id: 'indie_1',
        type: 'news',
        title: 'Indie Rock Revolution: New Bands Shaping the Scene',
        description: 'Discover the latest wave of independent artists who are redefining the indie rock landscape with innovative sounds and DIY ethics.',
        author: {
          id: 'stereogum',
          name: 'Stereogum',
          username: 'stereogum',
          avatar_url: 'https://dummyimage.com/40x40/10b981/ffffff?text=S',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Indie Music', 'Rock', 'New Artists']
        },
        relevance_score: 0.95
      },
      {
        id: 'hiphop_1',
        type: 'news',
        title: 'Hip-Hop\'s Evolution: From the Streets to Global Dominance',
        description: 'Exploring how hip-hop culture continues to influence music, fashion, and society worldwide.',
        author: {
          id: 'complex',
          name: 'Complex',
          username: 'complex',
          avatar_url: 'https://dummyimage.com/40x40/f59e0b/ffffff?text=C',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Hip-Hop', 'Culture', 'Music History']
        },
        relevance_score: 0.92
      },
      {
        id: 'electronic_1',
        type: 'news',
        title: 'Electronic Music Festival Season: What to Expect in 2024',
        description: 'A comprehensive guide to the biggest electronic music festivals and events happening around the world this year.',
        author: {
          id: 'resident_advisor',
          name: 'Resident Advisor',
          username: 'residentadvisor',
          avatar_url: 'https://dummyimage.com/40x40/3b82f6/ffffff?text=R',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Electronic Music', 'Festivals', 'Events']
        },
        relevance_score: 0.88
      },
      {
        id: 'metal_1',
        type: 'news',
        title: 'Metal Scene Report: Underground Bands Breaking Through',
        description: 'Discover the most promising underground metal bands that are pushing the boundaries of the genre.',
        author: {
          id: 'metal_injection',
          name: 'Metal Injection',
          username: 'metalinjection',
          avatar_url: 'https://dummyimage.com/40x40/64748b/ffffff?text=M',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Metal Music', 'Underground', 'New Bands']
        },
        relevance_score: 0.85
      },
      {
        id: 'jazz_1',
        type: 'news',
        title: 'Jazz Fusion: Modern Artists Bridging Traditional and Contemporary',
        description: 'Meet the jazz musicians who are creating innovative sounds by blending traditional jazz with modern influences.',
        author: {
          id: 'jazz_times',
          name: 'JazzTimes',
          username: 'jazztimes',
          avatar_url: 'https://dummyimage.com/40x40/8b5cf6/ffffff?text=J',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Jazz Music', 'Fusion', 'Modern Jazz']
        },
        relevance_score: 0.87
      },
      {
        id: 'underground_1',
        type: 'news',
        title: 'Underground Scene Explosion: DIY Venues and Independent Artists',
        description: 'The underground music scene is thriving with DIY venues, independent labels, and artists creating innovative sounds outside the mainstream.',
        author: {
          id: 'tiny_mix_tapes',
          name: 'Tiny Mix Tapes',
          username: 'tinymixtapes',
          avatar_url: 'https://dummyimage.com/40x40/7c3aed/ffffff?text=T',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Underground Music', 'DIY', 'Independent']
        },
        relevance_score: 0.92
      },
      {
        id: 'local_1',
        type: 'news',
        title: 'Local Music Scenes: Community-Driven Music Movements',
        description: 'How local music scenes are fostering community connections and supporting emerging artists in cities across the country.',
        author: {
          id: 'chicago_reader',
          name: 'Chicago Reader',
          username: 'chicagoreader',
          avatar_url: 'https://dummyimage.com/40x40/059669/ffffff?text=C',
          is_verified: true
        },
        cover_image: getPlaceholderImage('music', 400, 250),
        created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: { 
          url: '#',
          tags: ['Local Music', 'Community', 'Emerging Artists']
        },
        relevance_score: 0.85
      },
      // Positive sentiment mock content
      {
        id: 'positive-1',
        type: 'news' as const,
        title: 'Awesome New Album Release: Epic Collaboration Between Super Artists',
        description: 'This incredible collaboration is absolutely amazing and features the best musicians in the industry. The result is nothing short of phenomenal!',
        author: {
          id: 'music-news',
          name: 'Music News Daily',
          username: 'musicnews',
          avatar_url: 'https://dummyimage.com/40x40/ef4444/ffffff?text=M',
          is_verified: true
        },
        cover_image: getPlaceholderImage('news', 400, 250),
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: {
          url: '#',
          tags: ['Awesome', 'Epic', 'Super', 'Best', 'Amazing']
        },
        relevance_score: 0.95
      },
      {
        id: 'positive-2',
        type: 'blog' as const,
        title: 'Funny and Elegant: The Coolest Music Videos of 2024',
        description: 'These hilarious and sophisticated music videos are absolutely brilliant and showcase the most creative artists in the industry.',
        author: {
          id: 'video-blog',
          name: 'Video Blog Weekly',
          username: 'videoblog',
          avatar_url: 'https://dummyimage.com/40x40/3b82f6/ffffff?text=V',
          is_verified: true
        },
        cover_image: getPlaceholderImage('video', 400, 250),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: {
          url: '#',
          tags: ['Funny', 'Elegant', 'Cool', 'Brilliant', 'Creative']
        },
        relevance_score: 0.92
      },
      {
        id: 'positive-3',
        type: 'news' as const,
        title: 'Inspiring Success Story: From Local Talent to Global Superstar',
        description: 'This extraordinary journey from humble beginnings to worldwide fame is truly remarkable and shows what passion and dedication can achieve.',
        author: {
          id: 'success-stories',
          name: 'Success Stories',
          username: 'successstories',
          avatar_url: 'https://dummyimage.com/40x40/10b981/ffffff?text=S',
          is_verified: true
        },
        cover_image: getPlaceholderImage('news', 400, 250),
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        engagement: { likes: 0, views: 0, shares: 0, comments: 0 },
        metadata: {
          url: '#',
          tags: ['Inspiring', 'Success', 'Extraordinary', 'Remarkable', 'Passion']
        },
        relevance_score: 0.88
      }
    ]

    // Apply positive sentiment scoring to all mock items
    return mockItems.map((item: any) => {
      const titleScore = calculatePositiveScore(item.title)
      const descriptionScore = calculatePositiveScore(item.description)
      const positiveScore = titleScore + descriptionScore
      
      return {
        ...item,
        relevance_score: (item.relevance_score || 0.8) + (positiveScore * 0.1),
        positive_score: positiveScore
      }
    }).sort((a: any, b: any) => (b.positive_score || 0) - (a.positive_score || 0))
  }

  const filteredContent = useMemo(() => {
    let filtered = content

    console.log('[FYP] Filtering content:', {
      totalContent: content.length,
      activeTab,
      searchQuery,
      contentTypes: content.map(item => item.type)
    })

    // Temporarily disable filtering for testing
    console.log('[FYP] Temporarily disabled filtering, returning all content')
    console.log('[FYP] All content:', content.map(item => ({ id: item.id, type: item.type, title: item.title })))

    return content
  }, [content, searchQuery, activeTab, sortBy])

  const handleLike = (contentId: string) => {
    setContent(prev => prev.map(item =>
      item.id === contentId
        ? { ...item, is_liked: !item.is_liked, engagement: { ...item.engagement, likes: item.is_liked ? item.engagement.likes - 1 : item.engagement.likes + 1 } }
        : item
    ))
  }

  const handleFollow = (authorId: string) => {
    setContent(prev => prev.map(item =>
      item.author?.id === authorId
        ? { ...item, is_following: !item.is_following }
        : item
    ))
  }

  const handleBookmark = (contentId: string) => {
    setBookmarkedContent(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contentId)) {
        newSet.delete(contentId)
      } else {
        newSet.add(contentId)
      }
      return newSet
    })
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music2 className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'tour': return <MapPin className="h-4 w-4" />
      case 'news': return <FileText className="h-4 w-4" />
      case 'blog': return <FileText className="h-4 w-4" />
      case 'forum': return <Users className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  // Enhanced color coding system for different content types
  const getContentColor = (type: string) => {
    switch (type) {
      case 'music': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'event': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'video': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      case 'tour': return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white'
      case 'news': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      case 'blog': return 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
      case 'forum': return 'bg-gradient-to-r from-slate-600 to-slate-500 text-white'
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
    }
  }

  // Color coding for content cards - subtle border colors
  const getContentCardBorder = (type: string) => {
    switch (type) {
      case 'music': return 'hover:border-purple-500/50 group-hover:shadow-purple-500/10'
      case 'event': return 'hover:border-green-500/50 group-hover:shadow-green-500/10'
      case 'video': return 'hover:border-blue-500/50 group-hover:shadow-blue-500/10'
      case 'tour': return 'hover:border-orange-500/50 group-hover:shadow-orange-500/10'
      case 'news': return 'hover:border-red-500/50 group-hover:shadow-red-500/10'
      case 'blog': return 'hover:border-indigo-500/50 group-hover:shadow-indigo-500/10'
      case 'forum': return 'hover:border-slate-500/50 group-hover:shadow-slate-500/10'
      default: return 'hover:border-purple-500/50 group-hover:shadow-purple-500/10'
    }
  }

  // Color coding for content type indicators
  const getContentTypeIndicator = (type: string) => {
    switch (type) {
      case 'music': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'event': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'video': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'tour': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'news': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'blog': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'forum': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRelevanceBadge = (score?: number, positiveScore?: number) => {
    if (!score) return null
    
    // Check if content has high positive sentiment
    const isPositive = positiveScore && positiveScore > 5
    
    let color = 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30'
    let text = 'Relevant'
    let iconColor = 'text-gray-300'
    
    if (score >= 0.9) {
      if (isPositive) {
        color = 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30'
        text = '🌟 Positive & Highly Relevant'
        iconColor = 'text-yellow-300'
      } else {
        color = 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30'
        text = 'Highly Relevant'
        iconColor = 'text-green-300'
      }
    } else if (score >= 0.7) {
      if (isPositive) {
        color = 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30'
        text = '✨ Positive & Very Relevant'
        iconColor = 'text-pink-300'
      } else {
        color = 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30'
        text = 'Very Relevant'
        iconColor = 'text-blue-300'
      }
    } else if (score >= 0.5) {
      if (isPositive) {
        color = 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 border-purple-500/30'
        text = '💫 Positive & Relevant'
        iconColor = 'text-purple-300'
      } else {
        color = 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30'
        text = 'Relevant'
        iconColor = 'text-yellow-300'
      }
    } else if (isPositive) {
      color = 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30'
      text = '⭐ Positive Content'
      iconColor = 'text-indigo-300'
    }
    
    return (
      <Badge className={`${color} border px-4 py-2 rounded-2xl font-semibold shadow-lg`}>
        <Star className={`h-4 w-4 mr-2 ${iconColor}`} />
        {text}
      </Badge>
    )
  }

  useEffect(() => {
    console.log('[FYP] useEffect triggered, calling loadPersonalizedContent')
    loadPersonalizedContent()
  }, [sortBy, activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 relative overflow-hidden">

      {/* Jukebox background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Chrome accents */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"></div>
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-gray-400 via-gray-300 to-gray-400"></div>
        <div className="absolute top-0 right-0 bottom-0 w-2 bg-gradient-to-b from-gray-400 via-gray-300 to-gray-400"></div>
        
        {/* Neon lights */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-red-500/60 blur-sm animate-pulse"></div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500/60 blur-sm animate-pulse delay-500"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-green-500/60 blur-sm animate-pulse delay-1000"></div>
        
        {/* Vinyl record background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-48 h-48 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-900 rounded-full"></div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Jukebox Display Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 mb-12"
        >
          {/* Jukebox Display Panel */}
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-8">
              {/* Display Screen */}
              <div className="bg-black rounded-2xl border-2 border-gray-500 p-6 mb-6">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight font-mono">
                    <span className="text-red-500">♪</span> JUKEBOX <span className="text-blue-500">♪</span>
                  </h1>
                  <div className="text-2xl md:text-3xl font-mono text-green-400">
                    FOR YOU FEED
                  </div>
                  <div className="text-lg text-yellow-400 font-mono">
                    SELECT YOUR TUNES
                  </div>
                </div>
              </div>
              
              {/* Status Lights */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse delay-600"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-900"></div>
              </div>
              
              {/* Info Display */}
              <div className="bg-gray-800 rounded-xl border border-gray-600 p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-sm font-mono">
                  <div className="bg-red-900/50 rounded-lg p-2 border border-red-500/30">
                    <div className="text-red-400">PERSONALIZED</div>
                  </div>
                  <div className="bg-blue-900/50 rounded-lg p-2 border border-blue-500/30">
                    <div className="text-blue-400">REAL-TIME</div>
                  </div>
                  <div className="bg-green-900/50 rounded-lg p-2 border border-green-500/30">
                    <div className="text-green-400">CURATED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Jukebox Control Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Search - Jukebox Style */}
                  <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                      <Input
                        placeholder="SEARCH TUNES, ARTISTS, GENRES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-12 bg-black border-2 border-gray-500 text-white placeholder:text-gray-400 h-14 rounded-2xl focus:border-red-400/50 focus:ring-red-400/20 font-mono text-lg"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 text-gray-400 hover:text-white rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sort Button - Jukebox Style */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-14 border-2 border-gray-500 text-gray-300 hover:text-white hover:border-red-400/50 transition-all whitespace-nowrap rounded-2xl bg-black hover:bg-gray-800 font-mono"
                  >
                    <SlidersHorizontal className="h-5 w-5 mr-3" />
                    <span className="text-lg font-medium">SORT</span>
                  </Button>
                </div>

                {/* Sort Options - Jukebox Style */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t-2 border-gray-500"
                    >
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { value: 'relevant', label: 'MOST RELEVANT', icon: Star },
                          { value: 'recent', label: 'MOST RECENT', icon: Clock },
                          { value: 'popular', label: 'MOST POPULAR', icon: TrendingUp }
                        ].map((option) => {
                          const Icon = option.icon
                          return (
                            <Button
                              key={option.value}
                              variant={sortBy === option.value ? "default" : "outline"}
                              onClick={() => setSortBy(option.value as any)}
                              className={`h-12 whitespace-nowrap rounded-2xl text-lg font-medium font-mono border-2 ${
                                sortBy === option.value 
                                  ? 'bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white shadow-lg shadow-red-500/25 border-red-400' 
                                  : 'bg-black border-gray-500 text-gray-300 hover:text-white hover:border-red-400/50 hover:bg-gray-800'
                              } transition-all duration-300`}
                            >
                              <Icon className="h-5 w-5 mr-3" />
                              {option.label}
                            </Button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Jukebox Selection Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Main content types - Jukebox Style */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-4">
                  <div className="text-center mb-4">
                    <div className="text-lg font-mono text-yellow-400">SELECT CONTENT TYPE</div>
                  </div>
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-black border-2 border-gray-500 rounded-2xl p-2 gap-2">
                    {contentTypes.slice(0, 6).map((type) => {
                      const Icon = type.icon
                      return (
                        <TabsTrigger
                          key={type.value}
                          value={type.value}
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/25 data-[state=active]:border-red-400 border-2 border-gray-500 bg-black text-gray-300 hover:text-white hover:border-red-400/50 hover:bg-gray-800 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base font-medium font-mono rounded-2xl h-10 sm:h-12 px-2 sm:px-4 touch-manipulation"
                        >
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">{type.label}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>
              
              {/* Music genre tabs - Jukebox Style */}
              <div className="mt-4">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border-4 border-gray-400 shadow-2xl p-4">
                  <div className="text-center mb-4">
                    <div className="text-lg font-mono text-blue-400">SELECT MUSIC GENRE</div>
                  </div>
                  <TabsList className="bg-black border-2 border-gray-500 rounded-2xl p-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 w-full">
                      {contentTypes.slice(6).map((type) => {
                        const Icon = type.icon
                        return (
                          <TabsTrigger
                            key={type.value}
                            value={type.value}
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 data-[state=active]:border-blue-400 border-2 border-gray-500 bg-black text-gray-300 hover:text-white hover:border-blue-400/50 hover:bg-gray-800 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base font-medium font-mono rounded-2xl h-10 sm:h-12 px-2 sm:px-3 touch-manipulation"
                          >
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{type.label}</span>
                          </TabsTrigger>
                        )
                      })}
                    </div>
                  </TabsList>
                </div>
              </div>
            </Tabs>
            </motion.div>

            {/* Content Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Thread composer for Forums tab */}
              {activeTab === 'forums' && user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <ThreadComposerV2 onSuccess={() => loadPersonalizedContent()} />
                </motion.div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse rounded-3xl overflow-hidden">
                      <div className="p-6 md:p-8">
                        <div className="flex items-start gap-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-2xl flex-shrink-0"></div>
                          <div className="flex-1 space-y-4">
                            <div className="h-6 bg-white/10 rounded-xl w-3/4"></div>
                            <div className="h-4 bg-white/10 rounded-xl w-1/2"></div>
                            <div className="h-4 bg-white/10 rounded-xl w-2/3"></div>
                            <div className="flex gap-3">
                              <div className="h-8 bg-white/10 rounded-xl w-20"></div>
                              <div className="h-8 bg-white/10 rounded-xl w-24"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContent.length > 0 ? (
                <div className="space-y-6">
                  {filteredContent.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item.type === 'forum' ? (
                        <div className="space-y-2">
                          <ThreadCardV2
                            id={item.id.replace('thread_','')}
                            forum={{
                              id: item.metadata?.forum?.slug || '',
                              slug: item.metadata?.forum?.slug || '',
                              title: item.metadata?.forum?.name || ''
                            }}
                            title={item.title}
                            kind={'text'}
                            contentMd={item.description}
                            linkUrl={item.metadata?.url}
                            author={{
                              id: item.author?.id || '',
                              username: item.author?.username || 'Unknown',
                              avatar_url: item.author?.avatar_url,
                              is_verified: item.author?.is_verified
                            }}
                            score={item.engagement?.likes || 0}
                            userVote={item.metadata?.user_vote === 1 ? 'up' : item.metadata?.user_vote === -1 ? 'down' : null}
                            commentsCount={item.engagement?.comments || 0}
                            createdAt={item.created_at}
                            compact={true}
                          />
                        </div>
                      ) : (
                        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-gray-400 transition-all duration-500 group hover:shadow-2xl hover:shadow-red-500/25 rounded-3xl overflow-hidden">
                          {/* Jukebox chrome accents */}
                          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"></div>
                          
                          {/* Neon glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-yellow-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:via-yellow-500/10 group-hover:to-red-500/10 transition-all duration-500"></div>
                          
                          <div className="relative p-6 md:p-8">
                            {/* Clickable overlay for blog posts */}
                            {item.type === 'blog' && item.metadata?.url && (
                              <div 
                                className="absolute inset-0 z-10 cursor-pointer"
                                onClick={(e) => {
                                  // Don't trigger if clicking on interactive elements
                                  const target = e.target as HTMLElement
                                  if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
                                    return
                                  }
                                  window.location.href = item.metadata?.url || '#'
                                }}
                                title="Read full blog post"
                              />
                            )}
                            {/* Enhanced Content Header */}
                            <div className="flex items-start gap-6 md:gap-8 mb-6">
                              {item.cover_image && (
                                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-gray-300 shadow-2xl group-hover:shadow-red-500/25 transition-all duration-300">
                                  <Image
                                    src={item.cover_image}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 768px) 96px, 128px"
                                  />
                                  {item.type === 'video' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-full">
                                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                        <Play className="h-6 w-6 md:h-8 md:w-8 text-white fill-white" />
                                      </div>
                                    </div>
                                  )}
                                  {/* Vinyl record center label */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-900 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                      <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-300 rounded-full"></div>
                                    </div>
                                  </div>
                                  {/* Record grooves */}
                                  <div className="absolute inset-0 rounded-full border-2 border-gray-400 opacity-30"></div>
                                  {/* Vinyl record shine effect */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                {/* Jukebox badges */}
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                  <Badge className="bg-black border-2 border-gray-500 text-gray-300 text-sm md:text-base font-semibold px-4 py-2 rounded-2xl shadow-lg flex-shrink-0 font-mono">
                                    {getContentIcon(item.type)}
                                    <span className="ml-2 uppercase">{item.type}</span>
                                  </Badge>
                                  {item.metadata?.genre && (
                                    <Badge className="bg-black border-2 border-blue-500 text-blue-300 text-sm px-4 py-2 rounded-2xl font-medium flex-shrink-0 font-mono">
                                      {item.metadata.genre}
                                    </Badge>
                                  )}
                                  <div className="flex-shrink-0">
                                    {getRelevanceBadge(item.relevance_score, item.positive_score)}
                                  </div>
                                </div>

                                {/* Jukebox title */}
                                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-red-300 transition-colors line-clamp-2 leading-tight tracking-tight font-mono">
                                  {item.title}
                                  {item.type === 'blog' && item.metadata?.url && (
                                    <span className="ml-3 text-red-400 text-xl font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">♪ PLAY</span>
                                  )}
                                </h3>

                                {item.metadata?.forum && (
                                  <div className="mb-2 text-xs md:text-sm text-slate-400">
                                    in <a className="text-purple-300 hover:text-purple-200" href={`/forums/${item.metadata.forum.slug}`}>{item.metadata.forum.name}</a>
                                  </div>
                                )}

                                {item.description && (
                                  <div className="mb-6">
                                    <p className="text-gray-300 text-lg md:text-xl line-clamp-3 leading-relaxed font-light">
                                      {item.description}
                                    </p>
                                    {/* Reading time indicator for blog posts */}
                                    {item.type === 'blog' && (
                                      <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <span>5 min read</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Enhanced Metadata with better visual design */}
                                <div className="flex items-center gap-3 md:gap-4 text-gray-400 text-sm md:text-base flex-wrap">
                                  {item.metadata?.duration && (
                                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                                      <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                                        <Clock className="h-4 w-4 text-purple-300" />
                                      </div>
                                      <span className="font-semibold text-white">{Math.floor(item.metadata.duration / 60)}:{String(item.metadata.duration % 60).padStart(2, '0')}</span>
                                    </div>
                                  )}
                                  {item.metadata?.forum && (
                                    <a className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group" href={`/forums/${item.metadata?.forum?.slug}/thread/${item.id.replace('thread_','')}`}>
                                      <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                                        <MessageCircle className="h-4 w-4 text-blue-300" />
                                      </div>
                                      <span className="font-semibold text-white">Open thread</span>
                                    </a>
                                  )}
                                  {item.metadata?.location && (
                                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-green-500/20">
                                      <div className="p-2 bg-green-500/20 rounded-xl">
                                        <MapPin className="h-4 w-4 text-green-300" />
                                      </div>
                                      <span className="truncate max-w-32 font-semibold text-white">{item.metadata.location}</span>
                                    </div>
                                  )}
                                  {item.metadata?.date && (
                                    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-orange-500/20">
                                      <div className="p-2 bg-orange-500/20 rounded-xl">
                                        <Calendar className="h-4 w-4 text-orange-300" />
                                      </div>
                                      <span className="font-semibold text-white">{new Date(item.metadata.date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-500/10 to-slate-500/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-500/20 flex-shrink-0">
                                    <div className="p-2 bg-gray-500/20 rounded-xl">
                                      <Clock className="h-4 w-4 text-gray-300" />
                                    </div>
                                    <span className="font-semibold text-white whitespace-nowrap">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                                  </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                  <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <button className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors duration-300 group flex-shrink-0">
                                        <div className="p-2 bg-white/5 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                          <Heart className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-sm font-medium whitespace-nowrap">Like</span>
                                      </button>
                                      <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-300 group flex-shrink-0">
                                        <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                          <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-sm font-medium whitespace-nowrap">Comment</span>
                                      </button>
                                      <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors duration-300 group flex-shrink-0">
                                        <div className="p-2 bg-white/5 rounded-xl group-hover:bg-green-500/20 transition-colors">
                                          <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-sm font-medium whitespace-nowrap">Share</span>
                                      </button>
                                    </div>
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors duration-300 group flex-shrink-0">
                                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                                        <Bookmark className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                      </div>
                                      <span className="text-sm font-medium whitespace-nowrap">Save</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-12 md:p-16 text-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full"></div>
                      <Search className="relative h-16 w-16 md:h-20 md:w-20 text-gray-400 mx-auto" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">No content found</h3>
                    <p className="text-gray-300 mb-8 text-lg md:text-xl font-light max-w-2xl mx-auto">
                      Try adjusting your search or filters to discover more content.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('')
                        setActiveTab('all')
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl px-8 py-3 text-lg font-medium shadow-lg shadow-purple-500/25"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 