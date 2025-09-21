'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText,
  ExternalLink,
  Clock,
  Share2,
  Bookmark,
  BookmarkPlus,
  Star,
  TrendingUp
} from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

interface RSSNewsItemProps {
  item: {
    id: string
    title: string
    description: string
    link: string
    pubDate: string
    author?: string
    category?: string
    image?: string
    source: string
  }
  index: number
  onBookmark?: (id: string) => void
  isBookmarked?: boolean
}

export function RSSNewsItem({ item, index, onBookmark, isBookmarked = false }: RSSNewsItemProps) {
  const [imageError, setImageError] = useState(false)

  const handleExternalLink = () => {
    window.open(item.link, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: item.link
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(item.link)
        // You could add a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  const getSourceColor = (source: string) => {
    const colors = {
      'Billboard': 'bg-gradient-to-r from-red-500 to-pink-500',
      'Pitchfork': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'Rolling Stone': 'bg-gradient-to-r from-orange-500 to-red-500',
      'NME': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'Stereogum': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'Consequence': 'bg-gradient-to-r from-indigo-500 to-purple-500'
    }
    return colors[source as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-slate-500'
  }

  const getSourceBorder = (source: string) => {
    const colors = {
      'Billboard': 'hover:border-red-500/50 group-hover:shadow-red-500/10',
      'Pitchfork': 'hover:border-green-500/50 group-hover:shadow-green-500/10',
      'Rolling Stone': 'hover:border-orange-500/50 group-hover:shadow-orange-500/10',
      'NME': 'hover:border-purple-500/50 group-hover:shadow-purple-500/10',
      'Stereogum': 'hover:border-blue-500/50 group-hover:shadow-blue-500/10',
      'Consequence': 'hover:border-indigo-500/50 group-hover:shadow-indigo-500/10'
    }
    return colors[source as keyof typeof colors] || 'hover:border-purple-500/50 group-hover:shadow-purple-500/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`bg-slate-900/50 border-slate-700/30 transition-all duration-300 group hover:shadow-xl overflow-hidden ${getSourceBorder(item.source)}`}>
        <CardContent className="p-4 md:p-6 overflow-hidden">
          {/* Content Header */}
          <div className="flex items-start gap-3 md:gap-4 mb-4 min-w-0">
            {/* Image */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all">
              {item.image && !imageError ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 64px, 80px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${getSourceColor(item.source)}`}>
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`${getSourceColor(item.source)} text-white text-xs md:text-sm`}>
                  <FileText className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">News</span>
                </Badge>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {item.source}
                </Badge>
                {item.category && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {item.category}
                  </Badge>
                )}
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-2 cursor-pointer break-words overflow-hidden" onClick={handleExternalLink}>
                {item.title}
              </h3>

              {/* Description */}
              {item.description && (
                <p className="text-slate-300 text-sm mb-3 line-clamp-3 leading-relaxed break-words overflow-hidden">
                  {item.description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ')}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-2 md:gap-3 text-slate-400 text-xs md:text-sm flex-wrap min-w-0">
                {item.author && (
                  <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                    <span className="truncate max-w-[100px]">By {item.author}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  <span className="whitespace-nowrap">{formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
                  <span className="truncate max-w-[120px]">Source: {item.source}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-4 p-3 md:p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg border border-slate-700/30">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-purple-500/20 flex-shrink-0">
                <AvatarImage src={item.image} />
                <AvatarFallback className={`${getSourceColor(item.source)} text-white font-bold text-xs md:text-sm`}>
                  {item.source.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm truncate">
                    {item.author || item.source}
                  </span>
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-1.5 h-1.5 md:w-2 md:h-2 text-white" />
                  </div>
                </div>
                <span className="text-slate-400 text-xs truncate">
                  {item.source}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExternalLink}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 text-xs whitespace-nowrap transition-all"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Read
              </Button>
              {onBookmark && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onBookmark(item.id)}
                  className="text-slate-400 hover:text-yellow-400 transition-colors"
                >
                  {isBookmarked ? (
                    <Bookmark className="h-4 w-4 fill-current" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              <div className="flex items-center gap-1 text-slate-400 text-xs md:text-sm">
                <span>External Article</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-slate-400 hover:text-green-400 transition-colors"
                title="Share article"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExternalLink}
                className="text-slate-400 hover:text-blue-400 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 