'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Music, 
  Calendar, 
  DollarSign, 
  Globe, 
  MapPin, 
  Play, 
  Heart, 
  Share, 
  Eye,
  Target,
  PieChart,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Video,
  ImageIcon,
  FileText,
  ShoppingBag
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalFans: number
    totalStreams: number
    engagementRate: number
    monthlyListeners: number
    growthRate: number
  }
  audience: {
    demographics: {
      ageGroups: { range: string; percentage: number }[]
      gender: { type: string; percentage: number }[]
      topCountries: { country: string; percentage: number }[]
      topCities: { city: string; percentage: number }[]
    }
    engagement: {
      activeFans: number
      superFans: number
      casualListeners: number
      newFollowers: number
    }
  }
  content: {
    performance: {
      tracks: { total: number; avgPlays: number; topTrack: string }
      videos: { total: number; avgViews: number; topVideo: string }
      photos: { total: number; avgLikes: number; topPhoto: string }
      blogs: { total: number; avgReads: number; topBlog: string }
    }
    trends: {
      weeklyGrowth: number
      monthlyGrowth: number
      topPerformingContent: string
    }
  }
  revenue: {
    breakdown: {
      liveShows: number
      merchandise: number
      streaming: number
      collaborations: number
      sponsorships: number
    }
    projections: {
      nextMonth: number
      nextQuarter: number
      nextYear: number
    }
  }
  platforms: {
    spotify: { listeners: number; streams: number; growth: number }
    appleMusic: { listeners: number; streams: number; growth: number }
    youtube: { subscribers: number; views: number; growth: number }
    instagram: { followers: number; engagement: number; growth: number }
    tiktok: { followers: number; views: number; growth: number }
  }
}

interface ArtistAnalyticsOverviewProps {
  data?: AnalyticsData
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalRevenue: 15420,
    totalFans: 12450,
    totalStreams: 892300,
    engagementRate: 8.7,
    monthlyListeners: 45600,
    growthRate: 23.5
  },
  audience: {
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 35 },
        { range: '25-34', percentage: 42 },
        { range: '35-44', percentage: 15 },
        { range: '45+', percentage: 8 }
      ],
      gender: [
        { type: 'Female', percentage: 58 },
        { type: 'Male', percentage: 38 },
        { type: 'Other', percentage: 4 }
      ],
      topCountries: [
        { country: 'United States', percentage: 45 },
        { country: 'United Kingdom', percentage: 18 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Germany', percentage: 7 }
      ],
      topCities: [
        { city: 'New York', percentage: 12 },
        { city: 'Los Angeles', percentage: 10 },
        { city: 'London', percentage: 8 },
        { city: 'Toronto', percentage: 6 },
        { city: 'Sydney', percentage: 5 }
      ]
    },
    engagement: {
      activeFans: 3200,
      superFans: 450,
      casualListeners: 8900,
      newFollowers: 1250
    }
  },
  content: {
    performance: {
      tracks: { total: 24, avgPlays: 18500, topTrack: 'Midnight Dreams' },
      videos: { total: 12, avgViews: 8900, topVideo: 'Live at Blue Note' },
      photos: { total: 156, avgLikes: 340, topPhoto: 'Studio Session' },
      blogs: { total: 8, avgReads: 1200, topBlog: 'My Musical Journey' }
    },
    trends: {
      weeklyGrowth: 12.5,
      monthlyGrowth: 23.5,
      topPerformingContent: 'Midnight Dreams - Music Video'
    }
  },
  revenue: {
    breakdown: {
      liveShows: 8500,
      merchandise: 3200,
      streaming: 1800,
      collaborations: 1200,
      sponsorships: 720
    },
    projections: {
      nextMonth: 18200,
      nextQuarter: 52000,
      nextYear: 185000
    }
  },
  platforms: {
    spotify: { listeners: 28000, streams: 450000, growth: 18.5 },
    appleMusic: { listeners: 12000, streams: 180000, growth: 12.3 },
    youtube: { subscribers: 8500, views: 125000, growth: 25.7 },
    instagram: { followers: 15600, engagement: 6.8, growth: 15.2 },
    tiktok: { followers: 8900, views: 89000, growth: 42.1 }
  }
}

const getGrowthIcon = (value: number) => {
  if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-400" />
  if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-400" />
  return <Minus className="h-4 w-4 text-slate-400" />
}

const getGrowthColor = (value: number) => {
  if (value > 0) return 'text-green-400'
  if (value < 0) return 'text-red-400'
  return 'text-slate-400'
}

export function ArtistAnalyticsOverview({ 
  data = mockAnalyticsData,
  timeRange = '30d'
}: ArtistAnalyticsOverviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'content' | 'revenue' | 'platforms'>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'audience', label: 'Audience', icon: <Users className="h-4 w-4" /> },
    { id: 'content', label: 'Content', icon: <Music className="h-4 w-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'platforms', label: 'Platforms', icon: <Globe className="h-4 w-4" /> }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">${data.overview.totalRevenue.toLocaleString()}</p>
          <div className="flex items-center space-x-1 mt-1">
            {getGrowthIcon(data.overview.growthRate)}
            <span className={`text-sm ${getGrowthColor(data.overview.growthRate)}`}>
              {data.overview.growthRate}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Total Fans</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.overview.totalFans.toLocaleString()}</p>
          <div className="flex items-center space-x-1 mt-1">
            {getGrowthIcon(data.overview.growthRate)}
            <span className={`text-sm ${getGrowthColor(data.overview.growthRate)}`}>
              {data.overview.growthRate}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Play className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-400">Total Streams</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.overview.totalStreams.toLocaleString()}</p>
          <div className="flex items-center space-x-1 mt-1">
            {getGrowthIcon(data.overview.growthRate)}
            <span className={`text-sm ${getGrowthColor(data.overview.growthRate)}`}>
              {data.overview.growthRate}%
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Engagement Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.overview.engagementRate}%</p>
          <div className="flex items-center space-x-1 mt-1">
            {getGrowthIcon(data.overview.growthRate)}
            <span className={`text-sm ${getGrowthColor(data.overview.growthRate)}`}>
              {data.overview.growthRate}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Monthly Listeners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Monthly Listeners</h3>
            <p className="text-slate-400">{data.overview.monthlyListeners.toLocaleString()} listeners</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            +{data.overview.growthRate}% this month
          </Badge>
        </div>
        <Progress value={75} className="h-2" />
        <div className="flex justify-between text-sm text-slate-400 mt-2">
          <span>Goal: 60,000</span>
          <span>75% complete</span>
        </div>
      </motion.div>
    </div>
  )

  const renderAudience = () => (
    <div className="space-y-6">
      {/* Audience Engagement */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Active Fans</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.audience.engagement.activeFans.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Super Fans</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.audience.engagement.superFans.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-400">Casual Listeners</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.audience.engagement.casualListeners.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">New Followers</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.audience.engagement.newFollowers.toLocaleString()}</p>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Age Distribution</h3>
          <div className="space-y-3">
            {data.audience.demographics.ageGroups.map((group) => (
              <div key={group.range} className="flex items-center justify-between">
                <span className="text-slate-300">{group.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-8">{group.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries</h3>
          <div className="space-y-3">
            {data.audience.demographics.topCountries.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="text-slate-300">{country.country}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-8">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => (
    <div className="space-y-6">
      {/* Content Performance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Music className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Tracks</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.content.performance.tracks.total}</p>
          <p className="text-sm text-slate-400">{data.content.performance.tracks.avgPlays.toLocaleString()} avg plays</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Video className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-400">Videos</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.content.performance.videos.total}</p>
          <p className="text-sm text-slate-400">{data.content.performance.videos.avgViews.toLocaleString()} avg views</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <ImageIcon className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">Photos</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.content.performance.photos.total}</p>
          <p className="text-sm text-slate-400">{data.content.performance.photos.avgLikes.toLocaleString()} avg likes</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Blogs</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.content.performance.blogs.total}</p>
          <p className="text-sm text-slate-400">{data.content.performance.blogs.avgReads.toLocaleString()} avg reads</p>
        </div>
      </div>

      {/* Content Trends */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Content Growth Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{data.content.trends.weeklyGrowth}%</p>
            <p className="text-sm text-slate-400">Weekly Growth</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{data.content.trends.monthlyGrowth}%</p>
            <p className="text-sm text-slate-400">Monthly Growth</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white truncate">{data.content.trends.topPerformingContent}</p>
            <p className="text-sm text-slate-400">Top Performing</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRevenue = () => (
    <div className="space-y-6">
      {/* Revenue Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Live Shows</span>
          </div>
          <p className="text-xl font-bold text-white">${data.revenue.breakdown.liveShows.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-400">Merchandise</span>
          </div>
          <p className="text-xl font-bold text-white">${data.revenue.breakdown.merchandise.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Play className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">Streaming</span>
          </div>
          <p className="text-xl font-bold text-white">${data.revenue.breakdown.streaming.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Collaborations</span>
          </div>
          <p className="text-xl font-bold text-white">${data.revenue.breakdown.collaborations.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-slate-400">Sponsorships</span>
          </div>
          <p className="text-xl font-bold text-white">${data.revenue.breakdown.sponsorships.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Projections</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${data.revenue.projections.nextMonth.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Next Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${data.revenue.projections.nextQuarter.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Next Quarter</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${data.revenue.projections.nextYear.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Next Year</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPlatforms = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(data.platforms).map(([platform, stats]) => (
          <div key={platform} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white capitalize">{platform}</h3>
              <Badge className={getGrowthColor(stats.growth)}>
                {getGrowthIcon(stats.growth)}
                {stats.growth}%
              </Badge>
            </div>
            <div className="space-y-3">
              {platform === 'spotify' || platform === 'appleMusic' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Listeners</span>
                    <span className="text-white">{('listeners' in stats ? stats.listeners : 0)?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Streams</span>
                    <span className="text-white">{('streams' in stats ? stats.streams : 0)?.toLocaleString()}</span>
                  </div>
                </>
              ) : platform === 'youtube' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subscribers</span>
                    <span className="text-white">{('subscribers' in stats ? stats.subscribers : 0)?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Views</span>
                    <span className="text-white">{('views' in stats ? stats.views : 0)?.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Followers</span>
                    <span className="text-white">{('followers' in stats ? stats.followers : 0)?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      {platform === 'instagram' ? 'Engagement' : 'Views'}
                    </span>
                    <span className="text-white">
                      {platform === 'instagram' 
                        ? `${('engagement' in stats ? stats.engagement : 0)}%` 
                        : ('views' in stats ? stats.views : 0)?.toLocaleString()
                      }
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Analytics Overview</CardTitle>
              <CardDescription className="text-slate-400">
                Detailed performance metrics and insights
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-slate-800/50 border-slate-600 text-slate-300">
              Last {timeRange}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
            >
              <Activity className="h-4 w-4 mr-1" />
              Full Analytics
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'audience' && renderAudience()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'revenue' && renderRevenue()}
        {activeTab === 'platforms' && renderPlatforms()}
      </CardContent>
    </Card>
  )
} 