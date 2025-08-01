'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star, 
  DollarSign, 
  Calendar, 
  Users, 
  Music, 
  Video, 
  Image as ImageIcon,
  FileText,
  MessageCircle,
  Heart,
  Share,
  Eye,
  TrendingUp,
  Clock,
  X,
  Settings
} from 'lucide-react'

interface Notification {
  id: string
  type: 'event' | 'fan' | 'content' | 'payment' | 'collaboration' | 'system' | 'milestone'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionText?: string
  metadata?: {
    eventId?: string
    userId?: string
    contentId?: string
    amount?: number
    count?: number
    percentage?: number
  }
}

interface ArtistNotificationsProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (id: string) => void
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'Event Update: The Grand Hall Show',
    message: 'Your upcoming show at The Grand Hall has been moved to 8:30 PM. 15 fans have been notified.',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    priority: 'high',
    actionUrl: '/artist/events',
    actionText: 'View Event',
    metadata: { eventId: 'event-123', count: 15 }
  },
  {
    id: '2',
    type: 'fan',
    title: 'New Super Fan: Sarah Johnson',
    message: 'Sarah Johnson has become your 50th super fan! They\'ve engaged with 90% of your content this month.',
    timestamp: '2024-01-15T09:15:00Z',
    isRead: false,
    priority: 'medium',
    actionUrl: '/artist/community',
    actionText: 'View Profile',
    metadata: { userId: 'user-456', percentage: 90 }
  },
  {
    id: '3',
    type: 'content',
    title: 'Content Milestone: "Midnight Dreams"',
    message: 'Your track "Midnight Dreams" just reached 10,000 plays! This is your fastest-growing track.',
    timestamp: '2024-01-15T08:45:00Z',
    isRead: false,
    priority: 'medium',
    actionUrl: '/artist/content',
    actionText: 'View Analytics',
    metadata: { contentId: 'track-789', count: 10000 }
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received: $1,250',
    message: 'Payment for your show at Blue Note Jazz Club has been processed. Funds will be available in 2-3 business days.',
    timestamp: '2024-01-15T07:30:00Z',
    isRead: true,
    priority: 'high',
    actionUrl: '/artist/business',
    actionText: 'View Details',
    metadata: { amount: 1250 }
  },
  {
    id: '5',
    type: 'collaboration',
    title: 'Collaboration Request: DJ Max',
    message: 'DJ Max wants to collaborate on a new track. They have 25K followers and similar musical style.',
    timestamp: '2024-01-15T06:20:00Z',
    isRead: false,
    priority: 'medium',
    actionUrl: '/artist/community',
    actionText: 'Respond',
    metadata: { userId: 'user-789', count: 25000 }
  },
  {
    id: '6',
    type: 'milestone',
    title: 'Monthly Goal Achieved!',
    message: 'Congratulations! You\'ve reached your monthly goal of 5,000 new listeners. You\'re 20% ahead of schedule.',
    timestamp: '2024-01-15T05:10:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/artist/analytics',
    actionText: 'View Stats',
    metadata: { count: 5000, percentage: 20 }
  },
  {
    id: '7',
    type: 'system',
    title: 'Profile Optimization Complete',
    message: 'Your artist profile has been optimized for better discoverability. You\'re now appearing in 15% more searches.',
    timestamp: '2024-01-15T04:30:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/artist/profile',
    actionText: 'View Profile',
    metadata: { percentage: 15 }
  },
  {
    id: '8',
    type: 'fan',
    title: 'Fan Engagement Spike',
    message: 'Your latest post received 3x more engagement than usual. Consider posting similar content.',
    timestamp: '2024-01-15T03:45:00Z',
    isRead: false,
    priority: 'medium',
    actionUrl: '/artist/feed',
    actionText: 'View Post',
    metadata: { count: 3 }
  }
]

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'event': return <Calendar className="h-4 w-4" />
    case 'fan': return <Users className="h-4 w-4" />
    case 'content': return <Music className="h-4 w-4" />
    case 'payment': return <DollarSign className="h-4 w-4" />
    case 'collaboration': return <MessageCircle className="h-4 w-4" />
    case 'system': return <Info className="h-4 w-4" />
    case 'milestone': return <Star className="h-4 w-4" />
    default: return <Bell className="h-4 w-4" />
  }
}

const getTypeColor = (type: Notification['type']) => {
  switch (type) {
    case 'event': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'fan': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'content': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'payment': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'collaboration': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    case 'system': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    case 'milestone': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

export function ArtistNotifications({ 
  notifications = mockNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}: ArtistNotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')
  const [showSettings, setShowSettings] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'high') return notification.priority === 'high'
    return true
  })

  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id)
  }

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.()
  }

  const handleDelete = (id: string) => {
    onDelete?.(id)
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">Notifications</CardTitle>
              <CardDescription className="text-slate-400">
                Stay updated with your music career
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300'}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300'}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('high')}
            className={filter === 'high' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300'}
          >
            High Priority ({highPriorityCount})
          </Button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Quick Actions</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark All Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <BellOff className="h-3 w-3 mr-1" />
                    Mute All
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                notification.isRead 
                  ? 'bg-slate-800/30 border-slate-700/30' 
                  : 'bg-slate-800/50 border-slate-600/50'
              } ${!notification.isRead ? 'ring-1 ring-blue-500/20' : ''}`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{notification.message}</p>
                      
                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="flex items-center space-x-4 text-xs text-slate-500 mb-2">
                          {notification.metadata.amount && (
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${notification.metadata.amount.toLocaleString()}</span>
                            </span>
                          )}
                          {notification.metadata.count && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{notification.metadata.count.toLocaleString()}</span>
                            </span>
                          )}
                          {notification.metadata.percentage && (
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{notification.metadata.percentage}%</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      {notification.actionUrl && notification.actionText && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                          asChild
                        >
                          <a href={notification.actionUrl}>
                            {notification.actionText}
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-slate-400 hover:text-green-400"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-1 mt-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(notification.timestamp)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'high' ? 'No high priority notifications' : 
               'No notifications'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 