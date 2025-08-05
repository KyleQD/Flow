"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Check, Heart, MessageSquare, Ticket, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface NotificationCenterProps {
  trigger?: React.ReactNode
}

export function NotificationCenter({ trigger }: NotificationCenterProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock notifications data
  const mockNotifications = [
    {
      id: "notif-1",
      type: "like",
      user: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40&text=JS",
      },
      content: "liked your post",
      target: "New Album Announcement",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "notif-2",
      type: "comment",
      user: {
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      },
      content: "commented on your post",
      target: "Summer Tour Dates",
      time: "5 hours ago",
      read: false,
    },
    {
      id: "notif-3",
      type: "follow",
      user: {
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40&text=SW",
      },
      content: "started following you",
      target: "",
      time: "1 day ago",
      read: true,
    },
    {
      id: "notif-4",
      type: "ticket",
      user: {
        name: "David Brown",
        avatar: "/placeholder.svg?height=40&width=40&text=DB",
      },
      content: "purchased a ticket for",
      target: "Summer Jam Festival",
      time: "2 days ago",
      read: true,
    },
    {
      id: "notif-5",
      type: "event",
      user: {
        name: "Event Reminder",
        avatar: "/placeholder.svg?height=40&width=40&text=ER",
      },
      content: "Your event is coming up",
      target: "Acoustic Sessions",
      time: "3 days ago",
      read: true,
    },
  ]

  // Initialize notifications
  useEffect(() => {
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)
  }, [])

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    if (activeTab === "mentions") return notification.type === "comment" || notification.type === "mention"
    return true
  })

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead(notification.id)

    // Navigate based on notification type
    switch (notification.type) {
      case "like":
      case "comment":
        router.push(`/posts/${notification.id}`)
        break
      case "follow":
        // Use username if available, otherwise fallback to name processing
        const profileUsername = notification.user.username || 
          notification.user.name?.toLowerCase().replace(/\s+/g, "")
        router.push(`/profile/${profileUsername}`)
        break
      case "ticket":
      case "event":
        router.push(`/events/${notification.id}`)
        break
      default:
        break
    }

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-600 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 bg-gray-900 border-gray-800 text-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-medium">Notifications</h3>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-800">
            <TabsList className="bg-transparent w-full justify-start h-auto p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent px-4 py-2"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent px-4 py-2"
              >
                Unread
              </TabsTrigger>
              <TabsTrigger
                value="mentions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent px-4 py-2"
              >
                Mentions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>No notifications to show</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-800 cursor-pointer ${!notification.read ? "bg-gray-800/50" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                      <AvatarFallback>
                        {notification.user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-medium">{notification.user.name}</span> {notification.content}{" "}
                        {notification.target && <span className="font-medium">{notification.target}</span>}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{notification.time}</p>
                    </div>
                    <div>
                      {notification.type === "like" && (
                        <div className="bg-red-500/10 p-2 rounded-full">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                      {notification.type === "comment" && (
                        <div className="bg-blue-500/10 p-2 rounded-full">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                      {notification.type === "follow" && (
                        <div className="bg-green-500/10 p-2 rounded-full">
                          <Users className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {notification.type === "ticket" && (
                        <div className="bg-purple-500/10 p-2 rounded-full">
                          <Ticket className="h-4 w-4 text-purple-500" />
                        </div>
                      )}
                      {notification.type === "event" && (
                        <div className="bg-amber-500/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-2 border-t border-gray-800">
          <Button variant="link" className="w-full text-purple-400" onClick={() => router.push("/notifications")}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
