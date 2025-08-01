'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Calendar, 
  Music, 
  Video, 
  Image as ImageIcon,
  FileText,
  Target,
  Zap,
  ArrowRight,
  Star,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface Recommendation {
  id: string
  type: 'content' | 'event' | 'collaboration' | 'revenue' | 'audience' | 'platform'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  estimatedValue: number
  confidence: number
  actionUrl?: string
  actionText?: string
  tags: string[]
  priority: number
}

interface SmartRecommendationsProps {
  artistStats?: {
    totalRevenue: number
    totalFans: number
    totalStreams: number
    engagementRate: number
    monthlyListeners: number
    totalTracks: number
    totalEvents: number
    totalCollaborations: number
    musicCount: number
    videoCount: number
    photoCount: number
    blogCount: number
    eventCount: number
    merchandiseCount: number
    totalPlays: number
    totalViews: number
  }
  recentContent?: Array<{
    id: string
    title: string
    type: 'track' | 'video' | 'photo' | 'blog'
    views: number
    likes: number
    shares: number
    createdAt: string
  }>
  upcomingEvents?: Array<{
    id: string
    title: string
    date: string
    venue: string
    ticketSales: number
    capacity: number
  }>
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'content',
    title: 'Optimize Your Top-Performing Track',
    description: 'Your track "Midnight Dreams" has 2.3x higher engagement than average. Consider creating a music video or remix to capitalize on this momentum.',
    impact: 'high',
    effort: 'medium',
    estimatedValue: 1500,
    confidence: 92,
    actionUrl: '/artist/content',
    actionText: 'View Content',
    tags: ['music', 'optimization', 'engagement'],
    priority: 1
  },
  {
    id: '2',
    type: 'event',
    title: 'Promote Your Upcoming Show',
    description: 'Your show at "The Grand Hall" in 2 weeks is only 45% sold. Boost ticket sales with targeted social media campaigns.',
    impact: 'high',
    effort: 'low',
    estimatedValue: 800,
    confidence: 88,
    actionUrl: '/artist/events',
    actionText: 'Manage Events',
    tags: ['promotion', 'tickets', 'social media'],
    priority: 2
  },
  {
    id: '3',
    type: 'collaboration',
    title: 'Collaborate with Local Artists',
    description: '3 artists in your area have similar fan bases. Consider collaboration opportunities to expand your reach.',
    impact: 'medium',
    effort: 'medium',
    estimatedValue: 600,
    confidence: 75,
    actionUrl: '/artist/community',
    actionText: 'Find Artists',
    tags: ['collaboration', 'networking', 'growth'],
    priority: 3
  },
  {
    id: '4',
    type: 'revenue',
    title: 'Launch Merchandise Collection',
    description: 'Your fan base has grown 40% this month. Launch exclusive merchandise to increase revenue streams.',
    impact: 'medium',
    effort: 'high',
    estimatedValue: 1200,
    confidence: 82,
    actionUrl: '/artist/business',
    actionText: 'Business Tools',
    tags: ['merchandise', 'revenue', 'fans'],
    priority: 4
  },
  {
    id: '5',
    type: 'audience',
    title: 'Engage with Your Top Fans',
    description: 'You have 15 super fans who engage with 80% of your content. Create exclusive content for them.',
    impact: 'medium',
    effort: 'low',
    estimatedValue: 400,
    confidence: 90,
    actionUrl: '/artist/community',
    actionText: 'Fan Engagement',
    tags: ['fans', 'engagement', 'exclusive'],
    priority: 5
  },
  {
    id: '6',
    type: 'platform',
    title: 'Optimize Your Profile',
    description: 'Your profile completion is at 75%. Complete your bio and add more photos to increase discoverability.',
    impact: 'low',
    effort: 'low',
    estimatedValue: 200,
    confidence: 95,
    actionUrl: '/artist/profile',
    actionText: 'Complete Profile',
    tags: ['profile', 'discovery', 'optimization'],
    priority: 6
  }
]

const getTypeIcon = (type: Recommendation['type']) => {
  switch (type) {
    case 'content': return <Music className="h-4 w-4" />
    case 'event': return <Calendar className="h-4 w-4" />
    case 'collaboration': return <Users className="h-4 w-4" />
    case 'revenue': return <DollarSign className="h-4 w-4" />
    case 'audience': return <Target className="h-4 w-4" />
    case 'platform': return <BarChart3 className="h-4 w-4" />
    default: return <Lightbulb className="h-4 w-4" />
  }
}

const getImpactColor = (impact: Recommendation['impact']) => {
  switch (impact) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
  }
}

const getEffortColor = (effort: Recommendation['effort']) => {
  switch (effort) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
  }
}

export function ArtistSmartRecommendations({ 
  artistStats, 
  recentContent, 
  upcomingEvents 
}: SmartRecommendationsProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort' | 'value'>('priority')

  // Filter recommendations based on selected type
  const filteredRecommendations = selectedType === 'all' 
    ? mockRecommendations 
    : mockRecommendations.filter(rec => rec.type === selectedType)

  // Sort recommendations
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'priority': return a.priority - b.priority
      case 'impact': return a.impact === 'high' ? -1 : a.impact === 'medium' ? 0 : 1
      case 'effort': return a.effort === 'low' ? -1 : a.effort === 'medium' ? 0 : 1
      case 'value': return b.estimatedValue - a.estimatedValue
      default: return 0
    }
  })

  const totalPotentialValue = sortedRecommendations.reduce((sum, rec) => sum + rec.estimatedValue, 0)
  const averageConfidence = sortedRecommendations.reduce((sum, rec) => sum + rec.confidence, 0) / sortedRecommendations.length

  const typeFilters = [
    { value: 'all', label: 'All', icon: <Lightbulb className="h-4 w-4" /> },
    { value: 'content', label: 'Content', icon: <Music className="h-4 w-4" /> },
    { value: 'event', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
    { value: 'collaboration', label: 'Collaboration', icon: <Users className="h-4 w-4" /> },
    { value: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'audience', label: 'Audience', icon: <Target className="h-4 w-4" /> },
    { value: 'platform', label: 'Platform', icon: <BarChart3 className="h-4 w-4" /> }
  ]

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Smart Recommendations</CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered insights to grow your music career
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              {sortedRecommendations.length} recommendations
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-400">Potential Value</span>
            </div>
            <p className="text-lg font-semibold text-white">${totalPotentialValue.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Confidence</span>
            </div>
            <p className="text-lg font-semibold text-white">{Math.round(averageConfidence)}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-400">High Impact</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {sortedRecommendations.filter(r => r.impact === 'high').length}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-400">Quick Wins</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {sortedRecommendations.filter(r => r.effort === 'low').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {typeFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedType === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(filter.value)}
              className={`flex items-center space-x-2 ${
                selectedType === filter.value 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </Button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-2 mt-4">
          <span className="text-sm text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 rounded-md px-3 py-1 text-sm text-white"
          >
            <option value="priority">Priority</option>
            <option value="impact">Impact</option>
            <option value="effort">Effort</option>
            <option value="value">Value</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sortedRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    {getTypeIcon(recommendation.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{recommendation.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{recommendation.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {recommendation.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-slate-700/50 border-slate-600 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getImpactColor(recommendation.impact)}>
                      {recommendation.impact} impact
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getEffortColor(recommendation.effort)}>
                      {recommendation.effort} effort
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    <span className="text-sm text-slate-300">
                      ${recommendation.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Confidence</span>
                        <span>{recommendation.confidence}%</span>
                      </div>
                      <Progress value={recommendation.confidence} className="h-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {recommendation.actionUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                  asChild
                >
                  <a href={recommendation.actionUrl}>
                    {recommendation.actionText}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {sortedRecommendations.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No recommendations found for this category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 