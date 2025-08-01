'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

import { toast } from 'sonner'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2,
  Settings,
  Edit,
  Pin,
  Send,
  Loader2,
  ExternalLink,
  UserPlus,
  Star,
  ChevronDown,
  ChevronUp,
  Ticket,
  Music,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Activity,
  Zap,
  Radio,
  Headphones
} from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const floatingAnimation = {
  y: [0, -10, 0]
}

const floatingTransition = {
  duration: 3,
  repeat: Infinity,
  ease: "easeInOut" as const
}

// Types
interface EventData {
  id: string
  title: string
  description?: string
  type: string
  venue_name?: string
  venue_city?: string
  venue_state?: string
  event_date: string
  start_time?: string
  end_time?: string
  doors_open?: string
  ticket_url?: string
  ticket_price_min?: number
  ticket_price_max?: number
  capacity?: number
  status: string
  is_public: boolean
  poster_url?: string
  user_id: string
  creator: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    is_verified: boolean
  }
}

interface AttendanceData {
  attending: number
  interested: number
  not_going: number
  user_status: string | null
  attendees: Array<{
    user_id: string
    profiles: {
      id: string
      username: string
      full_name: string
      avatar_url?: string
      is_verified: boolean
    }
  }>
  interested_users: Array<{
    user_id: string
    profiles: {
      id: string
      username: string
      full_name: string
      avatar_url?: string
      is_verified: boolean
    }
  }>
}

interface EventPost {
  id: string
  user_id: string
  content: string
  type: string
  media_urls: string[]
  is_announcement: boolean
  is_pinned: boolean
  visibility: string
  likes_count: number
  comments_count: number
  created_at: string
  is_liked: boolean
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    is_verified: boolean
  }
}

interface PageSettings {
  is_page_enabled: boolean
  allow_public_posts: boolean
  allow_attendee_posts: boolean
  require_approval_for_posts: boolean
  show_attendance_count: boolean
  show_attendee_list: boolean
  allow_comments: boolean
  page_theme: {
    primary_color: string
    cover_image?: string
  }
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = params.id as string

  // State
  const [event, setEvent] = useState<EventData | null>(null)
  const [attendance, setAttendance] = useState<AttendanceData | null>(null)
  const [posts, setPosts] = useState<EventPost[]>([])
  const [settings, setSettings] = useState<PageSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false)
  const [isPostingUpdate, setIsPostingUpdate] = useState(false)
  const [showAttendeeList, setShowAttendeeList] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostType, setNewPostType] = useState('text')
  const [newPostVisibility, setNewPostVisibility] = useState('attendees')
  const [canPost, setCanPost] = useState(false)
  const [isEventCreator, setIsEventCreator] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  // Load event data
  useEffect(() => {
    if (eventId) {
      loadEventData()
    }
  }, [eventId, user])

  const loadEventData = async () => {
    try {
      setIsLoading(true)
      
      // Load event page data
      const pageResponse = await fetch(`/api/events/${eventId}/page`, {
        credentials: 'include'
      })
      
      if (!pageResponse.ok) {
        throw new Error('Failed to load event data')
      }
      
      const pageData = await pageResponse.json()
      
      setEvent(pageData.event)
      setAttendance(pageData.attendance)
      setSettings(pageData.settings)
      
      // Check if user is event creator
      if (user && pageData.event.user_id === user.id) {
        setIsEventCreator(true)
      }
      
      // Load event posts
      const postsResponse = await fetch(`/api/events/${eventId}/posts`, {
        credentials: 'include'
      })
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.posts || [])
      }
      
      // Determine if user can post
      if (user) {
        const isCreator = pageData.event.user_id === user.id
        const isAttending = pageData.attendance.user_status === 'attending'
        const allowAttendeePost = pageData.settings.allow_attendee_posts
        
        setCanPost(isCreator || (isAttending && allowAttendeePost))
      }
      
    } catch (error) {
      console.error('Error loading event data:', error)
      toast.error('Failed to load event data')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle attendance update
  const handleAttendanceUpdate = async (status: string) => {
    if (!user) {
      toast.error('Please sign in to RSVP')
      return
    }
    
    if (isUpdatingAttendance) return
    
    try {
      setIsUpdatingAttendance(true)
      
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update attendance')
      }
      
      const data = await response.json()
      
      // Update attendance state
      if (attendance) {
        const newAttendance = { ...attendance }
        newAttendance.user_status = status
        newAttendance.attending = data.counts.attending
        newAttendance.interested = data.counts.interested
        newAttendance.not_going = data.counts.not_going
        setAttendance(newAttendance)
      }
      
      toast.success(`Successfully marked as ${status}`)
    } catch (error) {
      console.error('Error updating attendance:', error)
      toast.error('Failed to update attendance')
    } finally {
      setIsUpdatingAttendance(false)
    }
  }

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isPostingUpdate) return
    
    try {
      setIsPostingUpdate(true)
      
      const response = await fetch(`/api/events/${eventId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newPostContent,
          type: newPostType,
          visibility: newPostVisibility
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create post')
      }
      
      const newPost = await response.json()
      setPosts([newPost, ...posts])
      setNewPostContent('')
      toast.success('Post created successfully')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setIsPostingUpdate(false)
    }
  }

  // Handle post like
  const handleLikePost = async (postId: string) => {
    // TODO: Implement post liking
    toast.info('Like functionality coming soon!')
  }

  // Share handlers
  const handleShareEvent = () => {
    setShowShareMenu(!showShareMenu)
  }

  const handleShareToFeed = () => {
    toast.info('Share to feed functionality coming soon!')
    setShowShareMenu(false)
  }

  const handleSendMessage = () => {
    toast.info('Send message functionality coming soon!')
    setShowShareMenu(false)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
    setShowShareMenu(false)
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
    setShowShareMenu(false)
  }



  // Utility functions
  const formatEventDate = (date: string, time?: string) => {
    const eventDate = new Date(date)
    if (time) {
      return `${format(eventDate, 'MMM d, yyyy')} at ${time}`
    }
    return format(eventDate, 'MMM d, yyyy')
  }

  const getAttendanceButtonStyle = (status: string) => {
    switch (status) {
      case 'attending':
        return 'bg-green-600 hover:bg-green-700'
      case 'interested':
        return 'bg-blue-600 hover:bg-blue-700'
      case 'not_going':
        return 'bg-gray-600 hover:bg-gray-700'
      default:
        return 'bg-purple-600 hover:bg-purple-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
            animate={floatingAnimation}
            transition={floatingTransition}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
            animate={floatingAnimation}
            transition={{ ...floatingTransition, delay: 1 }}
          />
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Loading event...
          </span>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <motion.div
             className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"
             animate={floatingAnimation}
             transition={floatingTransition}
           />
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Event Not Found
            </h1>
            <p className="text-gray-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => router.push('/discover')} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              <Radio className="w-4 h-4 mr-2" />
              Discover Events
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl"
          animate={floatingAnimation}
          transition={floatingTransition}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl"
          animate={floatingAnimation}
          transition={{ ...floatingTransition, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl"
          animate={floatingAnimation}
          transition={{ ...floatingTransition, delay: 2 }}
        />
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-50"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Image/Gradient */}
        <div className="h-[60vh] relative overflow-hidden">
          {event.poster_url ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center scale-110"
                style={{
                  backgroundImage: `url(${event.poster_url})`,
                  filter: 'blur(20px)'
                }}
              />
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${event.poster_url})`,
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Sparkles Effect */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-end justify-between"
            >
              <div className="flex-1 max-w-4xl">
                {/* Badges */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <Badge className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border-none backdrop-blur-sm px-4 py-2">
                    <Music className="w-3 h-3 mr-1" />
                    {event.type}
                  </Badge>
                  <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2">
                    <Activity className="w-3 h-3 mr-1" />
                    {event.status}
                  </Badge>
                  {attendance && (
                    <Badge className="bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white border-none backdrop-blur-sm px-4 py-2">
                      <Users className="w-3 h-3 mr-1" />
                      {attendance.attending + attendance.interested} going
                    </Badge>
                  )}
                </motion.div>
                
                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
                >
                  {event.title}
                </motion.h1>
                
                {/* Event Meta */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap items-center gap-6 text-white/90"
                >
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <span className="font-medium">{formatEventDate(event.event_date, event.start_time)}</span>
                  </div>
                  
                  {event.venue_name && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span className="font-medium">
                        {event.venue_name}
                        {event.venue_city && `, ${event.venue_city}`}
                      </span>
                    </div>
                  )}
                  
                  {event.doors_open && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                      <Clock className="h-5 w-5 text-emerald-400" />
                      <span className="font-medium">Doors {event.doors_open}</span>
                    </div>
                  )}
                </motion.div>
              </div>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-4"
              >
                {/* Share Button */}
                <div className="relative" ref={shareMenuRef}>
                  <Button
                    onClick={handleShareEvent}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white shadow-lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  {/* Share Menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50"
                      >
                        <div className="py-2">
                          <button
                            onClick={handleShareToFeed}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                          >
                            <Send className="h-4 w-4 text-purple-400" />
                            Share to Feed
                          </button>
                          <button
                            onClick={handleSendMessage}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                          >
                            <MessageCircle className="h-4 w-4 text-blue-400" />
                            Send Message
                          </button>
                          <button
                            onClick={handleCopyLink}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 text-emerald-400" />
                            Copy Link
                          </button>
                          {typeof navigator !== 'undefined' && 'share' in navigator && (
                            <button
                              onClick={handleNativeShare}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                            >
                              <Share2 className="h-4 w-4 text-pink-400" />
                              More Options
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Get Tickets Button */}
                {event.ticket_url && (
                  <Button
                    onClick={() => window.open(event.ticket_url, '_blank')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg px-8"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Get Tickets
                  </Button>
                )}
                
                {isEventCreator && (
                  <Button
                    onClick={() => router.push(`/artist/events/${eventId}`)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg px-8"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Event
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-8 pb-12">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Column - Event Details */}
            <motion.div variants={fadeIn} className="lg:col-span-2 space-y-8">
              {/* Description */}
              {event.description && (
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      About This Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Event Details */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                        <h4 className="font-semibold mb-3 text-purple-300 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Date & Time
                        </h4>
                        <div className="space-y-2">
                          <div className="text-white font-medium">
                            {formatEventDate(event.event_date, event.start_time)}
                          </div>
                          {event.doors_open && (
                            <div className="text-sm text-gray-400">
                              Doors open at {event.doors_open}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {event.venue_name && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                          <h4 className="font-semibold mb-3 text-blue-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Venue
                          </h4>
                          <div className="text-white font-medium">{event.venue_name}</div>
                          {event.venue_city && event.venue_state && (
                            <div className="text-sm text-gray-400">
                              {event.venue_city}, {event.venue_state}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {event.ticket_url && (
                        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
                          <h4 className="font-semibold mb-3 text-emerald-300 flex items-center gap-2">
                            <Ticket className="h-4 w-4" />
                            Tickets
                          </h4>
                          <div className="space-y-3">
                            {event.ticket_price_min && event.ticket_price_max ? (
                              <div className="text-white font-medium">
                                ${event.ticket_price_min} - ${event.ticket_price_max}
                              </div>
                            ) : event.ticket_price_min ? (
                              <div className="text-white font-medium">
                                From ${event.ticket_price_min}
                              </div>
                            ) : (
                              <div className="text-white font-medium">Tickets Available</div>
                            )}
                            <Button
                              size="sm"
                              onClick={() => window.open(event.ticket_url, '_blank')}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Buy Tickets
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {event.capacity && (
                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                          <h4 className="font-semibold mb-3 text-yellow-300 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Capacity
                          </h4>
                          <div className="text-white font-medium">{event.capacity} people</div>
                          {attendance && (
                            <div className="text-sm text-gray-400 mt-1">
                              {Math.round(((attendance.attending + attendance.interested) / event.capacity) * 100)}% interested/attending
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Feed */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Radio className="h-5 w-5 text-green-400" />
                    Event Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Post Creator */}
                  {canPost && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
                    >
                      <Textarea
                        placeholder="Share an update about this event..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="mb-4 bg-black/40 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <select
                            value={newPostType}
                            onChange={(e) => setNewPostType(e.target.value)}
                            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:border-purple-500/50"
                          >
                            <option value="text">Update</option>
                            {isEventCreator && <option value="announcement">Announcement</option>}
                          </select>
                          
                          <select
                            value={newPostVisibility}
                            onChange={(e) => setNewPostVisibility(e.target.value)}
                            className="px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white text-sm focus:border-purple-500/50"
                          >
                            <option value="attendees">Attendees</option>
                            <option value="public">Public</option>
                            {isEventCreator && <option value="collaborators">Collaborators</option>}
                          </select>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim() || isPostingUpdate}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {isPostingUpdate ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Post
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Posts Feed */}
                  <div className="space-y-6">
                    {posts.length > 0 ? (
                      posts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-gradient-to-r from-slate-800/40 to-slate-900/40 rounded-xl border border-white/10 backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="ring-2 ring-purple-500/30">
                              <AvatarImage src={post.profiles?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                                {post.profiles?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-white">
                                  {post.profiles?.full_name || post.profiles?.username}
                                </span>
                                {post.profiles?.is_verified && (
                                  <Star className="h-4 w-4 text-blue-400 fill-current" />
                                )}
                                {post.is_announcement && (
                                  <Badge className="bg-gradient-to-r from-red-600/80 to-orange-600/80 text-white border-none">
                                    <Zap className="w-3 h-3 mr-1" />
                                    Announcement
                                  </Badge>
                                )}
                                {post.is_pinned && (
                                  <Pin className="h-4 w-4 text-yellow-400" />
                                )}
                                <span className="text-sm text-gray-400">
                                  {format(new Date(post.created_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              
                              <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>
                              
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikePost(post.id)}
                                  className={`${post.is_liked ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-red-400'} hover:bg-red-500/10`}
                                >
                                  <Heart className={`h-4 w-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                                  {post.likes_count}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {post.comments_count}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
                          <Radio className="h-16 w-16 mx-auto mb-4 text-purple-400/50" />
                          <p className="text-gray-400 text-lg">No updates yet.</p>
                          <p className="text-gray-500 text-sm mt-1">Be the first to share something!</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Sidebar */}
            <motion.div variants={fadeIn} className="space-y-8">
              {/* RSVP Section */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-purple-400" />
                    RSVP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleAttendanceUpdate('attending')}
                          disabled={isUpdatingAttendance}
                          className={`${
                            attendance?.user_status === 'attending' 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                              : 'bg-white/10 hover:bg-green-600/20 border border-white/20 text-white'
                          } transition-all duration-300`}
                        >
                          {isUpdatingAttendance ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-1" />
                              Going
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleAttendanceUpdate('interested')}
                          disabled={isUpdatingAttendance}
                          className={`${
                            attendance?.user_status === 'interested' 
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                              : 'bg-white/10 hover:bg-blue-600/20 border border-white/20 text-white'
                          } transition-all duration-300`}
                        >
                          {isUpdatingAttendance ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-1" />
                              Interested
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {attendance?.user_status && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20"
                        >
                          <p className="text-sm text-green-300 font-medium">
                            ✨ You're marked as {attendance.user_status}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                        <p className="text-gray-300 mb-3">Sign in to RSVP</p>
                        <Button
                          onClick={() => router.push('/login')}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Sign In
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance Stats */}
              {attendance && (
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-400" />
                      Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 text-green-400" />
                            <span className="text-gray-300">Going</span>
                          </div>
                          <span className="text-2xl font-bold text-green-400">{attendance.attending}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-blue-400" />
                            <span className="text-gray-300">Interested</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-400">{attendance.interested}</span>
                        </div>
                      </div>
                      
                      {/* Total count */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-400" />
                            <span className="text-white font-medium">Total Interest</span>
                          </div>
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {attendance.attending + attendance.interested}
                          </span>
                        </div>
                      </div>
                      
                      {settings?.show_attendee_list && attendance.attendees.length > 0 && (
                        <div className="mt-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAttendeeList(!showAttendeeList)}
                            className="w-full justify-between text-white hover:bg-white/10"
                          >
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Who's Going
                            </span>
                            {showAttendeeList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          
                          <AnimatePresence>
                            {showAttendeeList && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 space-y-3 max-h-64 overflow-y-auto"
                              >
                                {attendance.attendees.slice(0, 10).map((attendee, index) => (
                                  <motion.div
                                    key={attendee.user_id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
                                      <AvatarImage src={attendee.profiles?.avatar_url} />
                                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs">
                                        {attendee.profiles?.full_name?.charAt(0) || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-white font-medium truncate">
                                          {attendee.profiles?.full_name || attendee.profiles?.username}
                                        </span>
                                        {attendee.profiles?.is_verified && (
                                          <Star className="h-3 w-3 text-blue-400 fill-current flex-shrink-0" />
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                                
                                {attendance.attendees.length > 10 && (
                                  <p className="text-sm text-gray-400 text-center p-2">
                                    +{attendance.attendees.length - 10} more attendees
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hosted By */}
              {event.creator && (
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-yellow-400" />
                      Hosted By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-yellow-500/30">
                          <AvatarImage src={event.creator.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500">
                            {event.creator.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">
                              {event.creator.full_name || event.creator.username}
                            </span>
                            {event.creator.is_verified && (
                              <Star className="h-4 w-4 text-blue-400 fill-current" />
                            )}
                          </div>
                          
                          <Link 
                            href={`/profile/${event.creator.username}`}
                            className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                          >
                            View Profile
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>


    </div>
  )
} 