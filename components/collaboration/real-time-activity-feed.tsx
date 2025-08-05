"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  Users, 
  MessageSquare, 
  Upload, 
  CheckCircle, 
  UserPlus,
  GitBranch,
  Music,
  Star,
  Heart,
  Clock,
  Zap,
  TrendingUp,
  Award,
  Target,
  PlayCircle,
  Share2,
  Calendar,
  MapPin,
  Mic,
  Headphones
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: 'collaboration_invite' | 'project_update' | 'message' | 'application' | 'milestone' | 'file_upload' | 'new_opportunity' | 'match_found' | 'collaboration_started' | 'project_completed'
  userId: string
  userName: string
  userAvatar?: string
  userRole?: string
  isVerified?: boolean
  message: string
  details?: string
  projectName?: string
  projectId?: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: {
    collaborationType?: string
    genre?: string[]
    instruments?: string[]
    matchScore?: number
    fileName?: string
    milestone?: string
  }
}

// Mock real-time activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'collaboration_invite',
    userId: 'user-123',
    userName: 'Sarah Chen',
    userAvatar: '/avatars/sarah.jpg',
    userRole: 'Producer',
    isVerified: true,
    message: 'invited you to collaborate',
    details: 'Join "Midnight Vibes EP" as a vocalist',
    projectName: 'Midnight Vibes EP',
    projectId: 'project-1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    priority: 'high',
    metadata: {
      collaborationType: 'album',
      genre: ['Electronic', 'Jazz'],
      instruments: ['Vocals', 'Harmonies']
    }
  },
  {
    id: '2',
    type: 'match_found',
    userId: 'ai-system',
    userName: 'AI Matching',
    userAvatar: '',
    message: 'found a perfect match for you',
    details: '95% compatibility with "Electronic Producer Needed"',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    priority: 'medium',
    metadata: {
      matchScore: 95,
      genre: ['Electronic', 'Ambient'],
      instruments: ['Production', 'Sound Design']
    }
  },
  {
    id: '3',
    type: 'project_update',
    userId: 'user-456',
    userName: 'Mike Johnson',
    userAvatar: '/avatars/mike.jpg',
    userRole: 'Vocalist',
    message: 'uploaded new vocal tracks',
    details: 'Added 3 new files to project',
    projectName: 'Acoustic Sessions',
    projectId: 'project-2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    metadata: {
      fileName: 'vocals_track_01.wav'
    }
  },
  {
    id: '4',
    type: 'new_opportunity',
    userId: 'user-789',
    userName: 'Luna Park',
    userAvatar: '/avatars/luna.jpg',
    userRole: 'Artist',
    message: 'posted a new collaboration opportunity',
    details: 'Looking for a drummer for indie rock project',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    priority: 'low',
    metadata: {
      genre: ['Indie Rock', 'Alternative'],
      instruments: ['Drums', 'Percussion']
    }
  },
  {
    id: '5',
    type: 'milestone',
    userId: 'user-123',
    userName: 'Sarah Chen',
    userAvatar: '/avatars/sarah.jpg',
    userRole: 'Producer',
    isVerified: true,
    message: 'completed project milestone',
    details: 'Mixing phase completed for "Midnight Vibes EP"',
    projectName: 'Midnight Vibes EP',
    projectId: 'project-1',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    metadata: {
      milestone: 'Mixing Complete'
    }
  }
]

function ActivityIcon({ type, priority }: { type: ActivityItem['type'], priority: ActivityItem['priority'] }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-blue-400'
      default: return 'text-slate-400'
    }
  }

  const iconMap = {
    collaboration_invite: UserPlus,
    project_update: Upload,
    message: MessageSquare,
    application: GitBranch,
    milestone: CheckCircle,
    file_upload: Music,
    new_opportunity: Star,
    match_found: Target,
    collaboration_started: Users,
    project_completed: Award
  }

  const Icon = iconMap[type] || Bell

  return (
    <div className={`h-10 w-10 rounded-full bg-slate-800/50 flex items-center justify-center ${getPriorityColor(priority)}`}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

function ActivityCard({ activity, onAction }: { activity: ActivityItem, onAction?: (action: string, activityId: string) => void }) {
  const isAIActivity = activity.userId === 'ai-system'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="flex items-start space-x-3 p-4 hover:bg-slate-800/30 rounded-lg transition-colors">
        {isAIActivity ? (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.userAvatar} alt={activity.userName} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {activity.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <ActivityIcon type={activity.type} priority={activity.priority} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white">{activity.userName}</span>
            {activity.isVerified && (
              <CheckCircle className="h-4 w-4 text-blue-400" />
            )}
            {activity.userRole && (
              <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                {activity.userRole}
              </Badge>
            )}
            <span className="text-sm text-slate-400">{activity.message}</span>
          </div>

          {activity.details && (
            <p className="text-sm text-slate-300">{activity.details}</p>
          )}

          {activity.projectName && (
            <div className="flex items-center space-x-1">
              <Music className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">{activity.projectName}</span>
            </div>
          )}

          {/* Metadata Tags */}
          {activity.metadata && (
            <div className="flex flex-wrap gap-1">
              {activity.metadata.matchScore && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  {activity.metadata.matchScore}% match
                </Badge>
              )}
              {activity.metadata.genre?.map(genre => (
                <Badge key={genre} variant="outline" className="text-xs bg-slate-800/50 text-slate-300 border-slate-600">
                  {genre}
                </Badge>
              ))}
              {activity.metadata.instruments?.slice(0, 2).map(instrument => (
                <Badge key={instrument} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  <Mic className="h-3 w-3 mr-1" />
                  {instrument}
                </Badge>
              ))}
              {activity.metadata.milestone && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {activity.metadata.milestone}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {activity.type === 'collaboration_invite' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7 border-green-500/50 text-green-400 hover:bg-green-500/10"
                    onClick={() => onAction?.('accept', activity.id)}
                  >
                    Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => onAction?.('decline', activity.id)}
                  >
                    Decline
                  </Button>
                </>
              )}
              {activity.type === 'match_found' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => onAction?.('view_match', activity.id)}
                >
                  View
                </Button>
              )}
              {activity.type === 'new_opportunity' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => onAction?.('view_opportunity', activity.id)}
                >
                  Apply
                </Button>
              )}
              {activity.projectId && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 border-slate-500/50 text-slate-400 hover:bg-slate-500/10"
                  onClick={() => onAction?.('view_project', activity.id)}
                >
                  Open Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RealTimeActivityFeed({ className }: { className?: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities)
  const [isLive, setIsLive] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const lastActivityRef = useRef<string>('')

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Simulate new activities coming in
      if (Math.random() > 0.7) { // 30% chance of new activity
        const newActivity: ActivityItem = {
          id: `activity-${Date.now()}`,
          type: ['message', 'project_update', 'new_opportunity', 'match_found'][Math.floor(Math.random() * 4)] as ActivityItem['type'],
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          userName: ['Alex Chen', 'Taylor Swift', 'Jordan Miller', 'Sam Wilson'][Math.floor(Math.random() * 4)],
          userAvatar: `/avatars/user-${Math.floor(Math.random() * 10)}.jpg`,
          userRole: ['Producer', 'Vocalist', 'Guitarist', 'Drummer'][Math.floor(Math.random() * 4)],
          message: 'just updated their project',
          details: 'New activity detected',
          timestamp: new Date().toISOString(),
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as ActivityItem['priority']
        }

        setActivities(prev => [newActivity, ...prev.slice(0, 19)]) // Keep only 20 items
        setUnreadCount(prev => prev + 1)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isLive])

  const handleAction = (action: string, activityId: string) => {
    console.log(`Action: ${action} for activity: ${activityId}`)
    
    // Remove the activity from the list after action
    if (action === 'accept' || action === 'decline') {
      setActivities(prev => prev.filter(a => a.id !== activityId))
    }
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <Card className={`bg-slate-900/50 border-slate-700/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-white">Live Activity</CardTitle>
            {isLive && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-slate-400 hover:text-white"
            >
              Mark all read
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                <p>No recent activity</p>
                <p className="text-sm mt-2">New collaboration updates will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}