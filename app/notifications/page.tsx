"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, Search, Filter, Check, Trash2, Settings, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const notificationIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
  like: { icon: "❤️", color: "#ef4444", bgColor: "#fef2f2" },
  comment: { icon: "💬", color: "#3b82f6", bgColor: "#eff6ff" },
  follow: { icon: "👤", color: "#10b981", bgColor: "#f0fdf4" },
  mention: { icon: "@", color: "#f59e0b", bgColor: "#fffbeb" },
  message: { icon: "✉️", color: "#8b5cf6", bgColor: "#faf5ff" },
  message_request: { icon: "❓", color: "#f97316", bgColor: "#fff7ed" },
  event_invite: { icon: "📅", color: "#06b6d4", bgColor: "#ecfeff" },
  booking_request: { icon: "🎵", color: "#84cc16", bgColor: "#f7fee7" },
  booking_accepted: { icon: "✅", color: "#10b981", bgColor: "#f0fdf4" },
  booking_declined: { icon: "❌", color: "#ef4444", bgColor: "#fef2f2" },
  system_alert: { icon: "⚠️", color: "#f59e0b", bgColor: "#fffbeb" },
  feature_update: { icon: "✨", color: "#8b5cf6", bgColor: "#faf5ff" },
  job_application: { icon: "💼", color: "#3b82f6", bgColor: "#eff6ff" },
  collaboration_request: { icon: "🤝", color: "#06b6d4", bgColor: "#ecfeff" }
}

const notificationTypes = [
  { value: "all", label: "All Types" },
  { value: "like", label: "Likes" },
  { value: "comment", label: "Comments" },
  { value: "follow", label: "Follows" },
  { value: "message", label: "Messages" },
  { value: "booking_request", label: "Bookings" },
  { value: "event_invite", label: "Events" },
  { value: "system_alert", label: "System" }
]

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()

  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notification.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === "all" || notification.type === filterType
      const matchesTab = activeTab === "all" || 
                        (activeTab === "unread" && !notification.is_read) ||
                        (activeTab === "read" && notification.is_read)
      
      return matchesSearch && matchesType && matchesTab
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === "priority") {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return 0
    })

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {} as Record<string, typeof notifications>)

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    return notificationIcons[type] || { icon: "🔔", color: "#6b7280", bgColor: "#f9fafb" }
  }

  // Get notification link
  const getNotificationLink = (notification: any) => {
    if (notification.metadata?.link) return notification.metadata.link
    
    switch (notification.type) {
      case 'message':
        return `/messages/${notification.related_user?.id}`
      case 'booking_request':
        return `/bookings/requests`
      case 'event_invite':
        return `/events/${notification.metadata?.eventId}`
      case 'follow':
        return `/profile/${notification.related_user?.username}`
      default:
        return null
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Link href="/settings/notifications">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredNotifications.length} notifications
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({notifications.filter(n => !n.is_read).length})
              </TabsTrigger>
              <TabsTrigger value="read">
                Read ({notifications.filter(n => n.is_read).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your search or filters"
                    : "You're all caught up! Check back later for new notifications."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
                  <div key={date}>
                    <div className="px-6 py-3 text-sm font-medium text-gray-500 bg-gray-50 border-b">
                      {formatDistanceToNow(new Date(date), { addSuffix: true })}
                    </div>
                    {dayNotifications.map((notification) => {
                      const icon = getNotificationIcon(notification.type)
                      const link = getNotificationLink(notification)
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                            !notification.is_read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Notification Icon */}
                            <div 
                              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl"
                              style={{ backgroundColor: icon.bgColor }}
                            >
                              {icon.icon}
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className={`text-base font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h4>
                                    {notification.priority === 'urgent' && (
                                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                    )}
                                    {notification.priority === 'high' && (
                                      <Badge variant="secondary" className="text-xs">High</Badge>
                                    )}
                                  </div>
                                  
                                  <p className="text-gray-600 mb-3 line-clamp-2">
                                    {notification.content}
                                  </p>
                                  
                                  {/* Related User */}
                                  {notification.related_user && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={notification.related_user.avatar_url} />
                                        <AvatarFallback className="text-xs">
                                          {notification.related_user.full_name?.charAt(0) || notification.related_user.username?.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-gray-500">
                                        {notification.related_user.full_name || notification.related_user.username}
                                      </span>
                                    </div>
                                  )}

                                  {/* Timestamp */}
                                  <p className="text-sm text-gray-400">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  {!notification.is_read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {!notification.is_read && (
                                        <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                          <Check className="h-4 w-4 mr-2" />
                                          Mark as read
                                        </DropdownMenuItem>
                                      )}
                                      {link && (
                                        <DropdownMenuItem asChild>
                                          <Link href={link}>
                                            View details
                                          </Link>
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleDelete(notification.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 