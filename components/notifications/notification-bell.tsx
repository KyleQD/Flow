"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/use-notifications"
import { EnhancedNotificationCenter } from "./enhanced-notification-center"

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <EnhancedNotificationCenter />
  )
} 