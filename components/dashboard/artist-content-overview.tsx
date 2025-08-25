"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Eye, 
  Music, 
  Video, 
  Image as ImageIcon, 
  FileText,
  Upload,
  Play,
  Heart,
  Share2,
  ArrowRight,
  TrendingDown,
  BarChart3,
  Plus
} from "lucide-react"
import { format, addDays } from "date-fns"
import Link from "next/link"
import { cn } from "@/utils"

interface ContentItem {
  id: string
  title: string
  type: 'track' | 'video' | 'photo' | 'blog'
  plays?: number
  views?: number
  likes: number
  shares: number
  uploadDate: Date
  trend: 'up' | 'down' | 'stable'
  status: 'published' | 'draft' | 'processing'
}

interface ContentSummary {
  totalTracks: number
  totalVideos: number
  totalPhotos: number
  totalBlogs: number
  totalViews: number
  totalLikes: number
  totalShares: number
  engagementRate: number
}

interface ArtistContentOverviewProps {
  content: ContentItem[]
  summary: ContentSummary
  isLoading?: boolean
  onUploadContent?: () => void
  onViewAll?: () => void
}

export function ArtistContentOverview({ 
  content, 
  summary, 
  isLoading = false, 
  onUploadContent,
  onViewAll 
}: ArtistContentOverviewProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'track' | 'video' | 'photo' | 'blog'>('all')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'track': return <Music className="h-4 w-4 text-purple-400" />
      case 'video': return <Video className="h-4 w-4 text-blue-400" />
      case 'photo': return <ImageIcon className="h-4 w-4 text-green-400" />
      case 'blog': return <FileText className="h-4 w-4 text-orange-400" />
      default: return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'track': return 'bg-purple-500/20'
      case 'video': return 'bg-blue-500/20'
      case 'photo': return 'bg-green-500/20'
      case 'blog': return 'bg-orange-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />
      default: return <BarChart3 className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const filteredContent = selectedType === 'all' 
    ? content 
    : content.filter(item => item.type === selectedType)

  const recentContent = filteredContent
    .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Content Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Content Performance
            </CardTitle>
            <CardDescription className="text-gray-400">
              How your content is performing
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-700 text-gray-300 hover:text-white"
            onClick={onViewAll}
            asChild
          >
            <Link href="/artist/content">
              <ArrowRight className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Content Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{summary.totalTracks}</div>
            <div className="text-sm text-gray-400">Tracks</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{summary.totalVideos}</div>
            <div className="text-sm text-gray-400">Videos</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{summary.totalPhotos}</div>
            <div className="text-sm text-gray-400">Photos</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{summary.totalBlogs}</div>
            <div className="text-sm text-gray-400">Blogs</div>
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Total Views</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {(summary.totalViews / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-white">Total Likes</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {summary.totalLikes.toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {summary.engagementRate}%
            </div>
          </div>
        </div>

        {/* Content Type Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All', count: content.length },
            { key: 'track', label: 'Tracks', count: content.filter(c => c.type === 'track').length },
            { key: 'video', label: 'Videos', count: content.filter(c => c.type === 'video').length },
            { key: 'photo', label: 'Photos', count: content.filter(c => c.type === 'photo').length },
            { key: 'blog', label: 'Blogs', count: content.filter(c => c.type === 'blog').length }
          ].map((type) => (
            <Button
              key={type.key}
              variant={selectedType === type.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.key as any)}
              className={cn(
                selectedType === type.key 
                  ? "bg-purple-600 hover:bg-purple-700" 
                  : "border-slate-700 text-gray-300 hover:text-white"
              )}
            >
              {type.label}
              <Badge variant="secondary" className="ml-2 bg-slate-700/50 text-white">
                {type.count}
              </Badge>
            </Button>
          ))}
        </div>
        
        {/* Recent Content Performance */}
        <div className="space-y-3">
          {recentContent.length > 0 ? (
            recentContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", getTypeColor(item.type))}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{item.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        {item.plays ? `${(item.plays / 1000).toFixed(1)}K plays` : `${((item.views || 0) / 1000).toFixed(1)}K views`}
                      </span>
                      <span>{format(item.uploadDate, 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className="h-4 w-4 text-red-400" />
                    {item.likes}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Share2 className="h-4 w-4 text-green-400" />
                    {item.shares}
                  </div>
                  {getTrendIcon(item.trend)}
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No content found</p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={onUploadContent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-6">
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 flex-1"
            onClick={onUploadContent}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-slate-700 text-gray-300 hover:text-white"
            asChild
          >
            <Link href="/artist/content/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 