'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, User, Heart, MessageSquare, Calendar, CheckCircle, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  summary?: string
  metadata?: Record<string, any>
  related_user?: {
    id: string
    full_name: string
    username: string
    avatar_url: string
  }
  is_read: boolean
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
}

const notificationIcons = {
  follow_request: { icon: User, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  follow_accepted: { icon: CheckCircle, color: "text-green-400", bgColor: "bg-green-500/10" },
  like: { icon: Heart, color: "text-red-400", bgColor: "bg-red-500/10" },
  comment: { icon: MessageSquare, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  event_invite: { icon: Calendar, color: "text-purple-400", bgColor: "bg-purple-500/10" },
  default: { icon: Bell, color: "text-gray-400", bgColor: "bg-gray-500/10" }
}

interface WorkingNotificationBellProps {
  className?: string
}

export function WorkingNotificationBell({ className = "" }: WorkingNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          related_user:profiles!notifications_related_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error('Failed to fetch notifications:', error)
        return
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq("id", id)

      if (error) {
        console.error('Failed to mark notification as read:', error)
        return
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Handle follow request actions
  const handleFollowRequest = async (notification: Notification, action: 'accept' | 'reject') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Call the follow request API
      const response = await fetch('/api/social/follow-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          targetUserId: notification.related_user_id
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} follow request`)
      }

      // Mark notification as read
      await markAsRead(notification.id)

      toast.success(`Follow request ${action}ed successfully`)
      
      // Refresh notifications
      await fetchNotifications()
    } catch (error) {
      console.error(`Error ${action}ing follow request:`, error)
      toast.error(`Failed to ${action} follow request`)
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications()

    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return

      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications'
        }, (payload) => {
          // Only handle notifications for the current user
          if (payload.new && payload.new.user_id === session.user.id) {
            fetchNotifications()
          }
        })
        .subscribe()

      return channel
    }

    let channel: any
    setupSubscription().then(ch => {
      channel = ch
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchNotifications])

  const getNotificationIcon = (type: string) => {
    return notificationIcons[type as keyof typeof notificationIcons] || notificationIcons.default
  }

  const getNotificationAction = (notification: Notification) => {
    if (notification.type === 'follow_request') {
      return (
        <div className="flex space-x-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
            onClick={() => handleFollowRequest(notification, 'accept')}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            onClick={() => handleFollowRequest(notification, 'reject')}
          >
            <X className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      )
    }
    return null
  }

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-slate-800/50 rounded-full transition-all duration-200"
          >
            <Bell className="h-5 w-5 text-slate-300" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 p-0 bg-slate-900 border-slate-700 shadow-xl" 
          align="end"
        >
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-400 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <ScrollArea className="h-96">
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-400">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const iconConfig = getNotificationIcon(notification.type)
                    const Icon = iconConfig.icon
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-800/50 ${
                          !notification.is_read ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800/30'
                        }`}
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full ${iconConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${iconConfig.color}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                              {notification.content}
                            </p>
                            
                            {notification.related_user && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={notification.related_user.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {notification.related_user.full_name?.charAt(0) || notification.related_user.username?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-slate-400">
                                  {notification.related_user.full_name || notification.related_user.username}
                                </span>
                              </div>
                            )}
                            
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                            
                            {getNotificationAction(notification)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
