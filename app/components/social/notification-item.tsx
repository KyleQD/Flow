"use client"

import { useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, MessageSquare, UserPlus, Calendar, Award, Bell } from "lucide-react"

interface NotificationItemProps {
  notification: {
    id: string
    type: "like" | "comment" | "follow" | "event" | "achievement"
    userId: string
    targetId: string
    timestamp: string
    content?: string
    isRead: boolean
  }
  user: {
    id: string
    username: string
    fullName: string
    avatar?: string
  }
  onMarkAsRead: (id: string) => void
  className?: string
}

export function NotificationItem({ notification, user, onMarkAsRead, className = "" }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get notification icon based on type
  const getNotificationIcon = useCallback(() => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "event":
        return <Calendar className="h-4 w-4 text-yellow-500" />
      case "achievement":
        return <Award className="h-4 w-4 text-amber-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }, [notification.type])

  // Get notification text based on type
  const getNotificationText = useCallback(() => {
    switch (notification.type) {
      case "like":
        return "liked your post"
      case "comment":
        return "commented on your post"
      case "follow":
        return "started following you"
      case "event":
        return "invited you to an event"
      case "achievement":
        return "earned an achievement"
      default:
        return "sent you a notification"
    }
  }, [notification.type])

  // Handle mark as read
  const handleMarkAsRead = useCallback(() => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }, [notification.id, notification.isRead, onMarkAsRead])

  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })

  return (
    <motion.div
      className={`p-4 hover:bg-gray-800/50 transition-colors ${
        !notification.isRead ? "bg-gray-800/20" : ""
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMarkAsRead}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start space-x-3">
        <Link href={`/profile/${user.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getNotificationIcon()}
              <div>
                <p className="text-sm">
                  <Link href={`/profile/${user.username}`} className="font-medium hover:underline">
                    {user.fullName}
                  </Link>{" "}
                  {getNotificationText()}
                </p>
                {notification.content && (
                  <p className="text-xs text-gray-500 mt-1 italic">"{notification.content}"</p>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{timeAgo}</span>
          </div>
        </div>

        {!notification.isRead && isHovered && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              handleMarkAsRead()
            }}
          >
            Mark as read
          </Button>
        )}
      </div>
    </motion.div>
  )
} 