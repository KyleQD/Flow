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


interface ContentItem {
  id: string
  type: 'music' | 'event' | 'video' | 'tour' | 'news' | 'blog'
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
  }
  is_liked?: boolean
  is_following?: boolean
  relevance_score?: number
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
        tags: ['Independent Music', 'Digital Age', 'Music Industry'],
        reading_time: 14
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
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'videos', label: 'Videos', icon: Video },
    { value: 'tours', label: 'Tours', icon: MapPin },
    { value: 'news', label: 'News', icon: FileText },
    { value: 'blogs', label: 'Blogs', icon: FileText }
  ]

  // Helper function to get placeholder images
  const getPlaceholderImage = (type: string, width: number = 400, height: number = 300) => {
    const colors = {
      music: '6366f1', // Indigo
      event: '10b981', // Emerald
      video: '3b82f6', // Blue
      tour: 'f59e0b', // Amber
      news: 'ef4444', // Red
      blog: '8b5cf6'  // Violet
    }
    
    const color = colors[type as keyof typeof colors] || '6b7280'
    const text = type.toUpperCase()
    
    // Use a different placeholder service that doesn't require domain configuration
    return `https://dummyimage.com/${width}x${height}/${color}/ffffff&text=${text}`
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
          'events': 'event',
          'videos': 'video',
          'tours': 'tour',
          'blogs': 'blog',
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
        
        // Initialize engagement data to zero for all content
        const contentWithZeroEngagement = data.content.map((item: ContentItem) => ({
          ...item,
          engagement: {
            likes: 0,
            views: 0,
            shares: 0,
            comments: 0
          }
        }))
        setContent(contentWithZeroEngagement)
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
                    reading_time: blog.metadata?.reading_time || 5
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
            console.error('[FYP] Blog posts fetch error details:', blogsError.message)
          }
        }
        
        // Try to fetch RSS news if we're on news tab or all tab
        if (activeTab === 'news' || activeTab === 'all') {
          try {
            console.log('[FYP] Attempting to fetch RSS news for hybrid content...')
            const rssResponse = await fetch('/api/feed/rss-news?limit=10')
            if (rssResponse.ok) {
              const rssData = await rssResponse.json()
              if (rssData.success && rssData.news && rssData.news.length > 0) {
                console.log('[FYP] Successfully fetched RSS news:', rssData.news.length, 'items')
                
                // Convert RSS items to ContentItem format
                const rssContent = rssData.news.map((item: any, index: number) => ({
                  id: `rss_${item.id}`,
                  type: 'news' as const,
                  title: item.title,
                  description: item.description,
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
                  relevance_score: 0.8 + (index * 0.05) // Slightly different scores
                }))
                
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
    return [
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
          tags: ['Independent Music', 'Digital Age', 'Music Industry'],
          reading_time: 14
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
      }
    ]
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
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRelevanceBadge = (score?: number) => {
    if (!score) return null
    
    let color = 'bg-gray-500/20 text-gray-400'
    let text = 'Relevant'
    
    if (score >= 0.9) {
      color = 'bg-green-500/20 text-green-400'
      text = 'Highly Relevant'
    } else if (score >= 0.7) {
      color = 'bg-blue-500/20 text-blue-400'
      text = 'Very Relevant'
    } else if (score >= 0.5) {
      color = 'bg-yellow-500/20 text-yellow-400'
      text = 'Relevant'
    }
    
    return (
      <Badge className={`${color} border-0`}>
        <Star className="h-3 w-3 mr-1" />
        {text}
      </Badge>
    )
  }

  useEffect(() => {
    console.log('[FYP] useEffect triggered, calling loadPersonalizedContent')
    loadPersonalizedContent()
  }, [sortBy, activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            For You <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Feed</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Personalized content curated just for you. Discover music, events, videos, and more based on your interests and preferences.
          </p>
          <div className="flex justify-center gap-4 md:gap-6 text-sm text-gray-300 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span>Personalized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              <span>Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              <span>Curated</span>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm shadow-xl rounded-2xl">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search content, artists, genres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400 h-12 focus:border-purple-500/50 focus:ring-purple-500/20"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Sort Button */}
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="h-12 border-slate-700 text-gray-300 hover:text-white hover:border-purple-500/50 transition-all whitespace-nowrap rounded-xl"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </div>

                  {/* Sort Options */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-700/50"
                      >
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { value: 'relevant', label: 'Most Relevant', icon: Star },
                            { value: 'recent', label: 'Most Recent', icon: Clock },
                            { value: 'popular', label: 'Most Popular', icon: TrendingUp }
                          ].map((option) => {
                            const Icon = option.icon
                            return (
                              <Button
                                key={option.value}
                                variant={sortBy === option.value ? "default" : "outline"}
                                onClick={() => setSortBy(option.value as any)}
                                className={`h-10 whitespace-nowrap rounded-xl ${
                                  sortBy === option.value 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                                    : 'border-slate-700 text-gray-300 hover:text-white hover:border-purple-500/50'
                                } transition-all`}
                              >
                                <Icon className="h-4 w-4 mr-2" />
                                {option.label}
                              </Button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Tabs - Removed number counters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-7 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-x-auto rounded-2xl">
                  {contentTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <TabsTrigger
                        key={type.value}
                        value={type.value}
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-300 whitespace-nowrap text-xs md:text-sm"
                      >
                        <Icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">{type.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Content Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {loading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[...Array(3)].map((_, i) => (
                                          <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse rounded-2xl">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                            <div className="h-3 bg-slate-800 rounded w-2/3"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                      <Card className={`relative bg-slate-900/50 border-slate-700/30 transition-all duration-300 group hover:shadow-xl rounded-2xl ${getContentCardBorder(item.type)} ${item.type === 'blog' && item.metadata?.url ? 'hover:border-purple-500/50 hover:bg-slate-900/70' : ''}`}>
                        <CardContent className="p-4 md:p-6">
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
                                window.location.href = item.metadata!.url
                              }}
                              title="Read full blog post"
                            />
                          )}
                          {/* Content Header */}
                          <div className="flex items-start gap-3 md:gap-4 mb-4">
                            {item.cover_image && (
                              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all">
                                <Image
                                  src={item.cover_image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 64px, 80px"
                                />
                                {item.type === 'video' && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Play className="h-4 w-4 md:h-6 md:w-6 text-white" />
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge className={`${getContentColor(item.type)} text-xs md:text-sm`}>
                                  {getContentIcon(item.type)}
                                  <span className="ml-1 capitalize hidden sm:inline">{item.type}</span>
                                </Badge>
                                {item.metadata?.genre && (
                                  <Badge variant="secondary" className={`${getContentTypeIndicator(item.type)} text-xs`}>
                                    {item.metadata.genre}
                                  </Badge>
                                )}
                                {getRelevanceBadge(item.relevance_score)}
                              </div>

                              <h3 className="text-lg md:text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                                {item.title}
                                {item.type === 'blog' && item.metadata?.url && (
                                  <span className="ml-2 text-purple-400 text-sm font-normal">→ Read more</span>
                                )}
                              </h3>

                              {item.description && (
                                <p className="text-slate-300 text-sm mb-3 line-clamp-3 leading-relaxed">
                                  {item.description}
                                </p>
                              )}

                              {/* Metadata */}
                              <div className="flex items-center gap-3 md:gap-4 text-slate-400 text-xs md:text-sm flex-wrap">
                                {item.metadata?.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{Math.floor(item.metadata.duration / 60)}:{String(item.metadata.duration % 60).padStart(2, '0')}</span>
                                  </div>
                                )}
                                {item.metadata?.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate max-w-32">{item.metadata.location}</span>
                                  </div>
                                )}
                                {item.metadata?.date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(item.metadata.date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Author Info */}
                          {item.author && (
                            <div className="flex items-center justify-between mb-4 p-3 md:p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-2xl border border-slate-700/30">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-purple-500/20 flex-shrink-0">
                                  <AvatarImage src={item.author.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-xs md:text-sm">
                                    {item.author.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white text-sm truncate">
                                      {item.author.name}
                                    </span>
                                    {item.author.is_verified && (
                                      <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Star className="w-1.5 h-1.5 md:w-2 md:h-2 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-slate-400 text-xs truncate">
                                    @{item.author.username}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant={item.is_following ? "outline" : "default"}
                                  onClick={() => handleFollow(item.author!.id)}
                                  className={`text-xs whitespace-nowrap rounded-xl ${
                                    item.is_following 
                                      ? 'border-green-500/50 text-green-400 hover:bg-green-500/20' 
                                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                  } transition-all`}
                                >
                                  {item.is_following ? 'Following' : 'Follow'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleBookmark(item.id)}
                                  className="text-slate-400 hover:text-yellow-400 transition-colors"
                                >
                                  {bookmarkedContent.has(item.id) ? (
                                    <Bookmark className="h-4 w-4 fill-current" />
                                  ) : (
                                    <BookmarkPlus className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Engagement Stats - Now showing real data starting at zero */}
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(item.id)}
                                className={`${item.is_liked ? 'text-red-500' : 'text-slate-400'} hover:text-red-400 transition-colors text-xs md:text-sm`}
                              >
                                <Heart className={`h-4 w-4 mr-2 ${item.is_liked ? 'fill-current' : ''}`} />
                                {item.engagement.likes.toLocaleString()}
                              </Button>
                              <div className="flex items-center gap-1 text-slate-400 text-xs md:text-sm">
                                <Eye className="h-4 w-4" />
                                <span>{item.engagement.views.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-xs md:text-sm">
                                <Share2 className="h-4 w-4" />
                                <span>{item.engagement.shares.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-xs md:text-sm">
                                <MessageCircle className="h-4 w-4" />
                                <span>{item.engagement.comments.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.metadata?.url && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => window.open(item.metadata!.url, '_blank', 'noopener,noreferrer')}
                                  className="text-slate-400 hover:text-blue-400 transition-colors"
                                  title="Open external link"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400 transition-colors">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-900/50 border-slate-700/50 rounded-2xl">
                  <CardContent className="p-8 md:p-12 text-center">
                    <Search className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No content found</h3>
                    <p className="text-gray-400 mb-6 text-sm md:text-base">
                      Try adjusting your search or filters to discover more content.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery('')
                        setActiveTab('all')
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 