'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Music, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Filter,
  Search,
  Calendar,
  Star,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageCircle,
  TrendingUp,
  Zap,
  Heart,
  Share2,
  MoreHorizontal,
  Sparkles,
  Target,
  Globe,
  Award,
  CheckCircle,
  Verified,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  ArtistJob, 
  CollaborationFilters,
  GENRE_OPTIONS,
  INSTRUMENT_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS
} from '@/types/artist-jobs'

interface EnhancedCollaborationFeedProps {
  onCollaborationClick?: (collaboration: ArtistJob) => void
  onApply?: (collaborationId: string) => void
  onSave?: (collaborationId: string) => void
  userId?: string
  className?: string
  enableAIMatching?: boolean
  showAdvancedFilters?: boolean
  enableRealTimeUpdates?: boolean
}

interface AIMatchScore {
  score: number
  reasons: string[]
  compatibilityFactors: {
    genre: number
    skills: number
    experience: number
    location: number
    schedule: number
  }
}

// Mock AI matching function
const calculateAIMatch = (collaboration: ArtistJob, userProfile: any): AIMatchScore => {
  // Simulate AI matching algorithm
  const genreMatch = Math.random() * 100
  const skillsMatch = Math.random() * 100
  const experienceMatch = Math.random() * 100
  const locationMatch = Math.random() * 100
  const scheduleMatch = Math.random() * 100
  
  const overallScore = (genreMatch + skillsMatch + experienceMatch + locationMatch + scheduleMatch) / 5
  
  const reasons = []
  if (genreMatch > 80) reasons.push("Perfect genre match")
  if (skillsMatch > 75) reasons.push("Complementary skills")
  if (experienceMatch > 70) reasons.push("Similar experience level")
  if (locationMatch > 85) reasons.push("Same location")
  
  return {
    score: Math.round(overallScore),
    reasons,
    compatibilityFactors: {
      genre: Math.round(genreMatch),
      skills: Math.round(skillsMatch),
      experience: Math.round(experienceMatch),
      location: Math.round(locationMatch),
      schedule: Math.round(scheduleMatch)
    }
  }
}

// Mock collaborations data with enhanced features
const mockCollaborations: (ArtistJob & { 
  aiMatch?: AIMatchScore, 
  isHot?: boolean, 
  isUrgent?: boolean,
  artistVerified?: boolean,
  responseRate?: number,
  lastSeen?: string
})[] = [
  {
    id: '1',
    title: 'Looking for Vocalist - Indie Rock Project',
    description: 'Seeking a versatile vocalist with strong harmonizing skills for our upcoming indie rock album. We have 8 tracks ready and need someone who can bring emotional depth to the lyrics.',
    category_id: 'collaboration',
    posted_by: 'user-123',
    posted_by_type: 'artist',
    poster_profile_id: 'profile-123',
    job_type: 'collaboration',
    payment_type: 'revenue_share',
    payment_amount: null,
    payment_currency: 'USD',
    payment_description: 'Revenue share from album sales',
    location: 'Remote',
    location_type: 'remote',
    city: null,
    state: null,
    country: null,
    event_date: null,
    event_time: null,
    duration_hours: null,
    deadline: '2024-02-15',
    required_skills: ['Vocals', 'Harmonizing'],
    required_equipment: ['Microphone', 'Audio Interface'],
    required_experience: 'intermediate',
    required_genres: ['Indie Rock'],
    age_requirement: null,
    instruments_needed: ['Vocals', 'Harmonies'],
    genre: 'Indie Rock',
    attachments: {},
    collaboration_details: {
      project_timeline: '3 months',
      estimated_hours: '40-60 hours',
      collaboration_type: 'album',
      file_sharing_preferences: 'Google Drive',
      communication_preferences: 'Discord, Email'
    },
    benefits: ['Creative freedom', 'Revenue share'],
    special_requirements: null,
    contact_email: 'contact@example.com',
    contact_phone: null,
    external_link: null,
    status: 'open',
    priority: 'normal',
    featured: false,
    applications_count: 5,
    views_count: 25,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    expires_at: null,
    isHot: true,
    artistVerified: true,
    responseRate: 95,
    lastSeen: '2 hours ago'
  },
  {
    id: '2',
    title: 'Electronic Producer Needed - Ambient/Downtempo',
    description: 'Working on a series of ambient electronic pieces that blend organic and synthetic elements. Looking for a producer skilled in sound design and atmospheric textures.',
    category_id: 'collaboration',
    posted_by: 'user-456',
    posted_by_type: 'artist',
    poster_profile_id: 'profile-456',
    job_type: 'collaboration',
    payment_type: 'paid',
    payment_amount: 1500,
    payment_currency: 'USD',
    payment_description: 'Flat rate payment for project completion',
    location: 'Los Angeles, CA',
    location_type: 'hybrid',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    event_date: null,
    event_time: null,
    duration_hours: null,
    deadline: '2024-03-01',
    required_skills: ['Production', 'Sound Design'],
    required_equipment: ['DAW', 'Synthesizers'],
    required_experience: 'professional',
    required_genres: ['Electronic', 'Ambient'],
    age_requirement: null,
    instruments_needed: ['Production', 'Sound Design', 'Synthesizers'],
    genre: 'Electronic',
    attachments: {},
    collaboration_details: {
      project_timeline: '6 weeks',
      estimated_hours: '80-100 hours',
      collaboration_type: 'ep',
      file_sharing_preferences: 'Dropbox',
      communication_preferences: 'Slack, Video calls'
    },
    benefits: ['Creative collaboration', 'Professional networking'],
    special_requirements: null,
    contact_email: 'producer@example.com',
    contact_phone: null,
    external_link: null,
    status: 'open',
    priority: 'high',
    featured: false,
    applications_count: 3,
    views_count: 18,
    created_at: '2024-01-08T14:30:00Z',
    updated_at: '2024-01-08T14:30:00Z',
    expires_at: null,
    isUrgent: true,
    artistVerified: false,
    responseRate: 87,
    lastSeen: '1 day ago'
  }
]

function AIMatchBadge({ score, compact = false }: { score: number, compact?: boolean }) {
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600'
    if (score >= 75) return 'from-blue-500 to-cyan-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-gray-500 to-slate-600'
  }

  const getMatchLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match'
    if (score >= 75) return 'Great Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  return (
    <div className={`flex items-center space-x-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${getMatchColor(score)}`} />
      <span className={`font-medium text-white ${compact ? 'text-xs' : ''}`}>
        {compact ? `${score}%` : getMatchLabel(score)}
      </span>
      {!compact && (
        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600 text-xs">
          {score}%
        </Badge>
      )}
    </div>
  )
}

function CollaborationCard({ 
  collaboration, 
  onApply, 
  onSave, 
  onView,
  enableAIMatching = false 
}: { 
  collaboration: ArtistJob & { 
    aiMatch?: AIMatchScore, 
    isHot?: boolean, 
    isUrgent?: boolean,
    artistVerified?: boolean,
    responseRate?: number,
    lastSeen?: string
  },
  onApply?: (id: string) => void,
  onSave?: (id: string) => void,
  onView?: (collaboration: ArtistJob) => void,
  enableAIMatching?: boolean
}) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
        {/* Status Indicators */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
          {collaboration.isHot && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Hot
            </Badge>
          )}
          {collaboration.isUrgent && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
          {enableAIMatching && collaboration.aiMatch && (
            <AIMatchBadge score={collaboration.aiMatch.score} compact />
          )}
        </div>

        <CardHeader className="pb-3">
          {/* Artist Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`/avatars/artist-${collaboration.posted_by}.jpg`} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  A
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white">Artist Name</h4>
                  {collaboration.artistVerified && (
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>{collaboration.responseRate}% response rate</span>
                  <span>•</span>
                  <span>Last seen {collaboration.lastSeen}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              className="p-2"
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-purple-400" />
              ) : (
                <Bookmark className="h-4 w-4 text-slate-400 hover:text-purple-400" />
              )}
            </Button>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors cursor-pointer"
                onClick={() => onView?.(collaboration)}>
              {collaboration.title}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-2">
              {collaboration.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {collaboration.instruments_needed?.map(instrument => (
              <Badge key={instrument} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                <Music className="h-3 w-3 mr-1" />
                {instrument}
              </Badge>
            ))}
            {collaboration.required_genres?.map(genre => (
              <Badge key={genre} variant="outline" className="text-xs bg-slate-800/50 text-slate-300 border-slate-600">
                {genre}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* AI Match Details */}
          {enableAIMatching && collaboration.aiMatch && collaboration.aiMatch.score >= 75 && (
            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Why this matches you:</span>
              </div>
              <div className="space-y-1">
                {collaboration.aiMatch.reasons.map((reason, index) => (
                  <div key={index} className="text-xs text-slate-300 flex items-center space-x-1">
                    <Target className="h-3 w-3 text-purple-400" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-400">
              <DollarSign className="h-4 w-4" />
              <span>{collaboration.payment_type === 'paid' ? `$${collaboration.payment_amount}` : 'Revenue Share'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{collaboration.collaboration_details?.project_timeline || 'Flexible'}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <MapPin className="h-4 w-4" />
              <span>{collaboration.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>Due {format(new Date(collaboration.deadline || ''), 'MMM d')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="text-slate-400 hover:text-red-400"
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-purple-400">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
            
            <Button 
              onClick={() => onApply?.(collaboration.id)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function EnhancedCollaborationFeed({
  onCollaborationClick,
  onApply,
  onSave,
  userId,
  className,
  enableAIMatching = true,
  showAdvancedFilters = true,
  enableRealTimeUpdates = true
}: EnhancedCollaborationFeedProps) {
  const [collaborations, setCollaborations] = useState(mockCollaborations)
  const [filteredCollaborations, setFilteredCollaborations] = useState(mockCollaborations)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [filterTab, setFilterTab] = useState('all')
  const [advancedFilters, setAdvancedFilters] = useState({
    genres: [] as string[],
    instruments: [] as string[],
    paymentType: '',
    experienceLevel: '',
    location: '',
    minMatchScore: 0,
    showOnlyVerified: false,
    showOnlyUrgent: false
  })

  // Add AI match scores to collaborations
  useEffect(() => {
    if (enableAIMatching) {
      const enhancedCollaborations = collaborations.map(collab => ({
        ...collab,
        aiMatch: calculateAIMatch(collab, { /* user profile */ })
      }))
      setCollaborations(enhancedCollaborations)
    }
  }, [enableAIMatching])

  // Filter and sort collaborations
  const processedCollaborations = useMemo(() => {
    let filtered = collaborations

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(collab => 
        collab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.required_genres?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        collab.instruments_needed?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Tab filters
    if (filterTab === 'ai_matched' && enableAIMatching) {
      filtered = filtered.filter(collab => collab.aiMatch && collab.aiMatch.score >= 75)
    } else if (filterTab === 'hot') {
      filtered = filtered.filter(collab => collab.isHot)
    } else if (filterTab === 'urgent') {
      filtered = filtered.filter(collab => collab.isUrgent)
    } else if (filterTab === 'verified') {
      filtered = filtered.filter(collab => collab.artistVerified)
    }

    // Advanced filters
    if (advancedFilters.minMatchScore > 0 && enableAIMatching) {
      filtered = filtered.filter(collab => collab.aiMatch && collab.aiMatch.score >= advancedFilters.minMatchScore)
    }

    if (advancedFilters.showOnlyVerified) {
      filtered = filtered.filter(collab => collab.artistVerified)
    }

    if (advancedFilters.showOnlyUrgent) {
      filtered = filtered.filter(collab => collab.isUrgent)
    }

    // Sorting
    if (sortBy === 'relevance' && enableAIMatching) {
      filtered.sort((a, b) => (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0))
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime())
    }

    return filtered
  }, [collaborations, searchQuery, filterTab, sortBy, advancedFilters, enableAIMatching])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search collaborations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700/50">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {enableAIMatching && <SelectItem value="relevance">Best Match</SelectItem>}
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterTab} onValueChange={setFilterTab}>
          <TabsList className="bg-slate-800/50 border-slate-700/50">
            <TabsTrigger value="all">All</TabsTrigger>
            {enableAIMatching && <TabsTrigger value="ai_matched">AI Matched</TabsTrigger>}
            <TabsTrigger value="hot">Hot 🔥</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* AI Matching Controls */}
        {enableAIMatching && showAdvancedFilters && (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Matching</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Minimum Match Score: {advancedFilters.minMatchScore}%</Label>
                <Slider
                  value={[advancedFilters.minMatchScore]}
                  onValueChange={([value]) => setAdvancedFilters(prev => ({ ...prev, minMatchScore: value }))}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={advancedFilters.showOnlyVerified}
                    onCheckedChange={(checked) => setAdvancedFilters(prev => ({ ...prev, showOnlyVerified: checked }))}
                  />
                  <Label className="text-sm text-slate-300">Verified artists only</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={advancedFilters.showOnlyUrgent}
                    onCheckedChange={(checked) => setAdvancedFilters(prev => ({ ...prev, showOnlyUrgent: checked }))}
                  />
                  <Label className="text-sm text-slate-300">Urgent opportunities</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {processedCollaborations.length} opportunities found
          </h3>
          {enableRealTimeUpdates && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live Updates
            </Badge>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-96 bg-slate-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {processedCollaborations.map((collaboration) => (
                <CollaborationCard
                  key={collaboration.id}
                  collaboration={collaboration}
                  onApply={onApply}
                  onSave={onSave}
                  onView={onCollaborationClick}
                  enableAIMatching={enableAIMatching}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {processedCollaborations.length === 0 && !isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="text-slate-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <p>No collaborations found matching your criteria</p>
            </div>
            <Button
              onClick={() => {
                setSearchQuery('')
                setFilterTab('all')
                setAdvancedFilters({
                  genres: [],
                  instruments: [],
                  paymentType: '',
                  experienceLevel: '',
                  location: '',
                  minMatchScore: 0,
                  showOnlyVerified: false,
                  showOnlyUrgent: false
                })
              }}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}