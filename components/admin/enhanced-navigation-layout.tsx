"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { motion, AnimatePresence } from "framer-motion"
import { TourEventSelector } from "./tour-event-selector"
import { EnhancedGlobalSearch } from "./enhanced-global-search"
import { ContextualNavigation } from "./contextual-navigation"
import { RealtimeActivityFeed } from "./realtime-activity-feed"
import { Sidebar } from "@/app/admin/dashboard/components/sidebar"
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Activity,
  Bell,
  Settings,
  Layout,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from "lucide-react"

interface EnhancedNavigationLayoutProps {
  children: React.ReactNode
  tourId?: string
  eventId?: string
  showContextualNav?: boolean
  showActivityFeed?: boolean
  showTourSelector?: boolean
  defaultSidebarCollapsed?: boolean
  className?: string
}

export function EnhancedNavigationLayout({
  children,
  tourId,
  eventId,
  showContextualNav = true,
  showActivityFeed = true,
  showTourSelector = true,
  defaultSidebarCollapsed = false,
  className = ""
}: EnhancedNavigationLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Navigation state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultSidebarCollapsed)
  const [isContextualNavVisible, setIsContextualNavVisible] = useState(showContextualNav)
  const [isActivityFeedVisible, setIsActivityFeedVisible] = useState(showActivityFeed)
  const [isTourSelectorVisible, setIsTourSelectorVisible] = useState(showTourSelector)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLayoutCustomizing, setIsLayoutCustomizing] = useState(false)
  
  // Layout dimensions
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)
  
  // Activity tracking
  const [unreadActivities, setUnreadActivities] = useState(5)
  const [currentTour, setCurrentTour] = useState<string | null>(tourId || null)
  const [currentEvent, setCurrentEvent] = useState<string | null>(eventId || null)

  // Auto-detect context from URL
  useEffect(() => {
    const pathSegments = pathname.split('/')
    const tourIndex = pathSegments.indexOf('tours')
    const eventIndex = pathSegments.indexOf('events')

    if (tourIndex !== -1 && pathSegments[tourIndex + 1]) {
      setCurrentTour(pathSegments[tourIndex + 1])
    } else {
      setCurrentTour(null)
    }

    if (eventIndex !== -1 && pathSegments[eventIndex + 1]) {
      setCurrentEvent(pathSegments[eventIndex + 1])
    } else {
      setCurrentEvent(null)
    }
  }, [pathname])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      
      // Toggle sidebar (Cmd/Ctrl + B)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setIsSidebarCollapsed(!isSidebarCollapsed)
      }

      // Toggle activity feed (Cmd/Ctrl + A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        setIsActivityFeedVisible(!isActivityFeedVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSidebarCollapsed, isActivityFeedVisible])

  const handleTourSelect = (tourId: string) => {
    setCurrentTour(tourId)
    setCurrentEvent(null)
  }

  const handleEventSelect = (eventId: string) => {
    setCurrentEvent(eventId)
  }

  const toggleLayoutCustomization = () => {
    setIsLayoutCustomizing(!isLayoutCustomizing)
  }

  const resetLayout = () => {
    setSidebarWidth(320)
    setRightPanelWidth(380)
    setIsSidebarCollapsed(false)
    setIsContextualNavVisible(true)
    setIsActivityFeedVisible(true)
    setIsTourSelectorVisible(true)
  }

  const hasRightPanel = (isContextualNavVisible && (currentTour || currentEvent)) || isActivityFeedVisible

  return (
    <div className={`flex h-screen bg-slate-950 ${className}`}>
      {/* Enhanced Global Search Dialog */}
      <EnhancedGlobalSearch
        trigger={null}
        onResultSelect={(result) => {
          setIsSearchOpen(false)
          // Handle result selection
        }}
      />

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar Panel */}
        <ResizablePanel
          defaultSize={isSidebarCollapsed ? 5 : 25}
          minSize={5}
          maxSize={35}
          collapsible={true}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
        >
          <div className="h-full flex flex-col">
            {/* Main Sidebar */}
            <div className="flex-1">
              <Sidebar />
            </div>

            {/* Tour/Event Selector */}
            {isTourSelectorVisible && !isSidebarCollapsed && (
              <div className="p-4 border-t border-slate-800/50">
                <TourEventSelector
                  onTourSelect={handleTourSelect}
                  onEventSelect={handleEventSelect}
                />
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-slate-800 hover:bg-slate-700 transition-colors" />

        {/* Main Content Panel */}
        <ResizablePanel defaultSize={hasRightPanel ? 50 : 75} minSize={30}>
          <div className="h-full flex flex-col">
            {/* Top Navigation Bar */}
            <div className="bg-slate-900/50 border-b border-slate-800/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Sidebar Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="text-slate-400 hover:text-white"
                  >
                    {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  </Button>

                  {/* Global Search Trigger */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearchOpen(true)}
                    className="bg-slate-800/30 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/50 min-w-48"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search tours, events, people...
                    <kbd className="ml-auto text-xs bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Layout Controls */}
                  {isLayoutCustomizing && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-2 mr-4"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTourSelectorVisible(!isTourSelectorVisible)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isTourSelectorVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="ml-1 text-xs">Selector</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsContextualNavVisible(!isContextualNavVisible)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isContextualNavVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="ml-1 text-xs">Context</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsActivityFeedVisible(!isActivityFeedVisible)}
                        className="text-slate-400 hover:text-white"
                      >
                        {isActivityFeedVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="ml-1 text-xs">Activity</span>
                      </Button>
                      <Separator orientation="vertical" className="h-4 bg-slate-700" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetLayout}
                        className="text-slate-400 hover:text-white"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Activity Indicator */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsActivityFeedVisible(!isActivityFeedVisible)}
                    className="text-slate-400 hover:text-white relative"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadActivities > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white border-0">
                        {unreadActivities > 9 ? '9+' : unreadActivities}
                      </Badge>
                    )}
                  </Button>

                  {/* Layout Customization Toggle */}
                  <Button
                    variant={isLayoutCustomizing ? "default" : "ghost"}
                    size="sm"
                    onClick={toggleLayoutCustomization}
                    className="text-slate-400 hover:text-white"
                  >
                    <Layout className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </ResizablePanel>

        {/* Right Panel */}
        {hasRightPanel && (
          <>
            <ResizableHandle className="w-1 bg-slate-800 hover:bg-slate-700 transition-colors" />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full bg-slate-950/50 border-l border-slate-800/50 flex flex-col">
                {/* Right Panel Content */}
                <div className="flex-1 overflow-hidden">
                  {/* Contextual Navigation */}
                  {isContextualNavVisible && (currentTour || currentEvent) && (
                    <div className="h-1/2 border-b border-slate-800/50">
                      <ContextualNavigation
                        tourId={currentTour || undefined}
                        eventId={currentEvent || undefined}
                        className="h-full"
                      />
                    </div>
                  )}

                  {/* Activity Feed */}
                  {isActivityFeedVisible && (
                    <div className={`${
                      isContextualNavVisible && (currentTour || currentEvent) ? 'h-1/2' : 'h-full'
                    }`}>
                      <RealtimeActivityFeed
                        tourId={currentTour || undefined}
                        eventId={currentEvent || undefined}
                        maxItems={20}
                        showFilters={true}
                        showHeader={true}
                        autoRefresh={true}
                        onActivityClick={(activity) => {
                          // Handle activity click
                          if (activity.url) {
                            router.push(activity.url)
                          }
                        }}
                        className="h-full"
                      />
                    </div>
                  )}

                  {/* Empty State */}
                  {!isContextualNavVisible && !isActivityFeedVisible && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Activity className="h-12 w-12 mx-auto text-slate-600" />
                        <div>
                          <h3 className="text-lg font-medium text-slate-400">Panel Hidden</h3>
                          <p className="text-sm text-slate-500">Enable contextual navigation or activity feed</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsContextualNavVisible(true)}
                            className="border-slate-700 text-slate-300"
                          >
                            Show Context
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsActivityFeedVisible(true)}
                            className="border-slate-700 text-slate-300"
                          >
                            Show Activity
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Layout Customization Overlay */}
      <AnimatePresence>
        {isLayoutCustomizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
          >
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <Card className="bg-slate-900/95 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-300">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">⌘B</kbd>
                      <span>Toggle Sidebar</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">⌘K</kbd>
                      <span>Global Search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">⌘A</kbd>
                      <span>Toggle Activity</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLayoutCustomization}
                      className="text-slate-400 hover:text-white"
                    >
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 