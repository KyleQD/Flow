"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile, useHapticFeedback, useTouchDevice } from "@/hooks/use-mobile"
import {
  Home,
  Calendar,
  Music,
  Users,
  MessageSquare,
  Settings,
  Building,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  role?: string[]
}

interface EnhancedMobileNavigationProps {
  user: any
  isOpen: boolean
  onClose: () => void
  roleTheme: string
  bottomNav?: boolean
}

export function EnhancedMobileNavigation({
  user,
  isOpen,
  onClose,
  roleTheme,
  bottomNav = false
}: EnhancedMobileNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useIsMobile()
  const { triggerHaptic } = useHapticFeedback()
  const isTouchDevice = useTouchDevice()
  
  const [activeTab, setActiveTab] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const touchEndRef = useRef<{ x: number; y: number } | null>(null)

  // Navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/events", label: "Events", icon: Calendar },
      { href: "/search", label: "Search", icon: Search },
      { href: "/messages", label: "Messages", icon: MessageSquare, badge: 3 },
      { href: "/notifications", label: "Notifications", icon: Bell, badge: 5 }
    ]

    // Add role-specific items
    if (user?.role === 'artist') {
      baseItems.push(
        { href: "/artist/profile", label: "Profile", icon: Music },
        { href: "/artist/gigs", label: "Gigs", icon: Calendar }
      )
    } else if (user?.role === 'venue_owner') {
      baseItems.push(
        { href: "/venue/dashboard", label: "Venue", icon: Building },
        { href: "/venue/bookings", label: "Bookings", icon: Calendar }
      )
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    touchEndRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const minSwipeDistance = 50

    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go back or close
        setSwipeDirection('right')
        triggerHaptic('light')
        if (bottomNav) {
          // In bottom nav, swipe right could cycle through tabs
          setActiveTab(prev => (prev - 1 + navigationItems.length) % navigationItems.length)
        } else {
          onClose()
        }
      } else {
        // Swipe left - go forward or next
        setSwipeDirection('left')
        triggerHaptic('light')
        if (bottomNav) {
          // In bottom nav, swipe left could cycle through tabs
          setActiveTab(prev => (prev + 1) % navigationItems.length)
        }
      }
    }

    // Reset touch refs
    touchStartRef.current = null
    touchEndRef.current = null
  }

  // Handle navigation with haptic feedback
  const handleNavigation = (href: string) => {
    triggerHaptic('light')
    router.push(href)
    if (!bottomNav) onClose()
  }

  // Bottom navigation variant
  if (bottomNav) {
    const primaryItems = navigationItems.slice(0, 4)

    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-around px-2 py-3 safe-area-bottom">
          {primaryItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <motion.div
                key={item.href}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.href)}
                  className={`flex-col h-auto p-3 space-y-1 w-full min-h-[60px] ${
                    isActive 
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </Button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // Full mobile navigation overlay
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 w-80 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 z-50"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Tourify</h2>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                triggerHaptic('light')
                onClose()
              }}
              className="text-slate-400 hover:text-white p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-2 px-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                
                return (
                  <motion.div
                    key={item.href}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full justify-start h-12 px-4 ${
                        isActive 
                          ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30" 
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="relative mr-3">
                        <Icon className="h-5 w-5" />
                        {item.badge && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 px-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation("/create")}
                  className="h-12 border-slate-700 text-slate-300 hover:bg-white/5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigation("/settings")}
                  className="h-12 border-slate-700 text-slate-300 hover:bg-white/5"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
