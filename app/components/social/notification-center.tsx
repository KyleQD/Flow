"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSocial } from "@/context/social-context"
import { useAuth } from "@/context/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCircle, Clock } from "lucide-react"
import { NotificationItem } from "./notification-item"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "event" | "achievement"
  userId: string
  targetId: string
  timestamp: string
  content?: string
  isRead: boolean
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const { user: currentUser } = useAuth()
  const { users, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useSocial()
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [isLoading, setIsLoading] = useState(true)

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  // Filter notifications based on active tab
  const filteredNotifications = useCallback(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead)
    }
    return notifications
  }, [notifications, activeTab])

  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId)
  }

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markNotificationAsRead(notificationId)
    },
    [markNotificationAsRead],
  )

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    markAllNotificationsAsRead()
  }, [markAllNotificationsAsRead])

  // Loading state
  if (isLoading) {
    return (
      <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Bell className="h-4 w-4 mr-2 text-purple-400" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center">
            <Bell className="h-4 w-4 mr-2 text-purple-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-white"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <div className="border-b border-gray-800 px-4">
            <TabsList className="h-10">
              <TabsTrigger value="all" className="text-xs">
                <Bell className="h-4 w-4 mr-1" />
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                <Clock className="h-4 w-4 mr-1" />
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredNotifications().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No notifications to display</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredNotifications().map((notification: Notification) => {
                    const user = getUserById(notification.userId)
                    if (!user) return null

                    return (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        user={user}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
} 