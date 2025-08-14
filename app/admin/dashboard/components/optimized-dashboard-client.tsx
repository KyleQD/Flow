"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VirtualTable, VirtualList } from "./virtual-scroll"
import { ErrorBoundary } from "./error-boundary"
import { HelpSystem, useHelpSystem } from "./help-system"
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from "./keyboard-shortcuts-help"
import { RealTimeStatusBar } from "@/components/admin/real-time-indicator"
import AnalyticsDashboard from "./analytics-dashboard"
import DataLoadingStatus from "./data-loading-status"
import DashboardCalendar from "./dashboard-calendar"
import { LogisticsIntegration } from "./logistics-integration"
import { 
  Globe, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Music, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Bell, 
  RefreshCw, 
  Database, 
  Grid3X3, 
  List, 
  Keyboard, 
  HelpCircle, 
  ArrowRight,
  Info,
  Target,
  Truck,
  Plane,
  Building
} from "lucide-react"
import Link from "next/link"
import { DashboardQuickHub } from "./dashboard-quick-hub"
import { WidgetsRow } from "./apple-widgets"

interface DashboardStats {
  totalTours: number
  activeTours: number
  totalEvents: number
  upcomingEvents: number
  totalArtists: number
  totalVenues: number
  totalRevenue: number
  monthlyRevenue: number
  ticketsSold: number
  totalCapacity: number
  staffMembers: number
  completedTasks: number
  pendingTasks: number
  averageRating: number
  // Travel coordination metrics
  totalTravelGroups: number
  totalTravelers: number
  confirmedTravelers: number
  coordinationCompletionRate: number
  fullyCoordinatedGroups: number
  // Logistics metrics
  activeTransportation: number
  completedTransportation: number
  logisticsCompletionRate: number
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  color?: string
  gradient?: string
  isLoading?: boolean
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral', 
  subtitle, 
  color = "text-blue-400", 
  gradient,
  isLoading = false
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />
      case 'down': return <TrendingDown className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Card className={`bg-slate-900/50 border-slate-700/50 ${gradient}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-white">
                {isLoading ? '...' : value}
              </p>
              {change !== undefined && (
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span>{change}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OptimizedDashboardClient() {
  // State for data
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tours, setTours] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Loading states
  const [statsLoading, setStatsLoading] = useState(true)
  const [toursLoading, setToursLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  
  // Error states
  const [statsError, setStatsError] = useState<string | null>(null)
  const [toursError, setToursError] = useState<string | null>(null)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showDataStatus, setShowDataStatus] = useState(false)

  // Help system
  const { isOpen: helpOpen, openHelp, closeHelp } = useHelpSystem()
  const { isOpen: shortcutsOpen, openHelp: openShortcuts, closeHelp: closeShortcuts } = useKeyboardShortcutsHelp()

  // Fetch data with real-time updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/admin/dashboard/stats', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
          console.log('Stats loaded:', statsData.stats)
        } else {
          setStatsError(`Stats API failed: ${statsResponse.status}`)
        }
      } catch (error) {
        setStatsError('Failed to load stats')
        console.error('Stats fetch error:', error)
      } finally {
        setStatsLoading(false)
      }

      try {
        // Fetch tours
        const toursResponse = await fetch('/api/admin/tours', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (toursResponse.ok) {
          const toursData = await toursResponse.json()
          setTours(toursData.tours || [])
          console.log('Tours loaded:', toursData.tours?.length || 0)
        } else {
          setToursError(`Tours API failed: ${toursResponse.status}`)
        }
      } catch (error) {
        setToursError('Failed to load tours')
        console.error('Tours fetch error:', error)
      } finally {
        setToursLoading(false)
      }

      try {
        // Fetch events
        const eventsResponse = await fetch('/api/admin/events', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData.events || [])
          console.log('Events loaded:', eventsData.events?.length || 0)
        } else {
          setEventsError(`Events API failed: ${eventsResponse.status}`)
        }
      } catch (error) {
        setEventsError('Failed to load events')
        console.error('Events fetch error:', error)
      } finally {
        setEventsLoading(false)
      }

      try {
        // Fetch notifications
        const notificationsResponse = await fetch('/api/admin/notifications', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData.notifications || [])
        } else {
          setNotificationsError(`Notifications API failed: ${notificationsResponse.status}`)
        }
      } catch (error) {
        setNotificationsError('Failed to load notifications')
        console.error('Notifications fetch error:', error)
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Real-time subscriptions for live updates
  useEffect(() => {
    // Import Supabase client dynamically to avoid SSR issues
    const setupRealTimeSubscriptions = async () => {
      try {
        const { createClient } = await import('./lib/supabase-browser')
        const supabase = createClient()

        // Subscribe to tours changes
        const toursSubscription = supabase
          .channel('tours-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'tours' },
            (payload) => {
              console.log('Tour change detected:', payload)
              // Refresh tours data
              fetch('/api/admin/tours', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(response => response.json())
              .then(data => setTours(data.tours || []))
              .catch(error => console.error('Error refreshing tours:', error))
            }
          )
          .subscribe()

        // Subscribe to events changes
        const eventsSubscription = supabase
          .channel('events-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'events' },
            (payload) => {
              console.log('Event change detected:', payload)
              // Refresh events data
              fetch('/api/admin/events', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(response => response.json())
              .then(data => setEvents(data.events || []))
              .catch(error => console.error('Error refreshing events:', error))
            }
          )
          .subscribe()

        // Subscribe to ticket sales changes
        const ticketSalesSubscription = supabase
          .channel('ticket-sales-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'ticket_sales' },
            (payload) => {
              console.log('Ticket sale change detected:', payload)
              // Refresh stats data
              fetch('/api/admin/dashboard/stats', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(response => response.json())
              .then(data => setStats(data.stats))
              .catch(error => console.error('Error refreshing stats:', error))
            }
          )
          .subscribe()

        // Subscribe to staff changes
        const staffSubscription = supabase
          .channel('staff-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'staff_profiles' },
            (payload) => {
              console.log('Staff change detected:', payload)
              // Refresh stats data
              fetch('/api/admin/dashboard/stats', {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              })
              .then(response => response.json())
              .then(data => setStats(data.stats))
              .catch(error => console.error('Error refreshing stats:', error))
            }
          )
          .subscribe()

        // Cleanup function
        return () => {
          toursSubscription.unsubscribe()
          eventsSubscription.unsubscribe()
          ticketSalesSubscription.unsubscribe()
          staffSubscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error setting up real-time subscriptions:', error)
      }
    }

    const cleanup = setupRealTimeSubscriptions()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // Transform data for display
  const recentTours = useMemo(() => {
    if (!tours || tours.length === 0) return []
    
    return tours.slice(0, 5).map(tour => ({
      id: tour.id,
      name: tour.name,
      artist: 'TBD', // You can add artist lookup logic here
      status: tour.status,
      progress: tour.totalShows > 0 ? (tour.completedShows / tour.totalShows) * 100 : 0,
      revenue: tour.revenue || 0,
      totalShows: tour.totalShows || 0,
      completedShows: tour.completedShows || 0,
      startDate: tour.startDate,
      endDate: tour.endDate
    }))
  }, [tours])

  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const now = new Date()
    return events
      .filter(event => {
        const eventDate = event.eventDate ? new Date(event.eventDate) : null
        return eventDate && eventDate > now
      })
      .sort((a, b) => {
        const dateA = a.eventDate ? new Date(a.eventDate) : new Date(0)
        const dateB = b.eventDate ? new Date(b.eventDate) : new Date(0)
        return dateA.getTime() - dateB.getTime()
      })
      .slice(0, 5)
      .map(event => ({
        id: event.id,
        name: event.name,
        venue_name: event.venueName || 'TBD',
        event_date: event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBD',
        tickets_sold: event.ticketsSold || 0,
        capacity: event.capacity || 0,
        expected_revenue: event.expectedRevenue || 0,
        status: event.status,
        eventTime: event.eventTime
      }))
  }, [events])

  const recentNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return []
    
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Unknown'
      }))
  }, [notifications])

  // Sample tasks data (you can replace with real task data)
  const upcomingTasks = useMemo(() => {
    const sampleTasks = [
      {
        id: 'task-1',
        title: 'Review tour contracts',
        description: 'Review and finalize contracts for upcoming tour',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        assignedTo: 'Kyle Daley',
        type: 'contract'
      },
      {
        id: 'task-2',
        title: 'Update event marketing materials',
        description: 'Update promotional materials for upcoming events',
        priority: 'medium',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assignedTo: 'Marketing Team',
        type: 'marketing'
      },
      {
        id: 'task-3',
        title: 'Finalize venue bookings',
        description: 'Confirm all venue bookings for the tour',
        priority: 'urgent',
        status: 'pending',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        assignedTo: 'Logistics Team',
        type: 'logistics'
      },
      {
        id: 'task-4',
        title: 'Sound check coordination',
        description: 'Coordinate sound checks for all venues',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignedTo: 'Technical Team',
        type: 'technical'
      },
      {
        id: 'task-5',
        title: 'Merchandise inventory',
        description: 'Complete inventory count for merchandise',
        priority: 'low',
        status: 'completed',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        assignedTo: 'Inventory Team',
        type: 'inventory'
      }
    ]

    const filteredTasks = sampleTasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5)

    console.log('Upcoming tasks:', filteredTasks)
    return filteredTasks
  }, [])

  // Error handling
  if (statsError && toursError && eventsError) {
    return (
      <div className="p-6">
        <Card className="bg-red-900/50 border-red-700/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Error Loading Dashboard</h3>
                <p className="text-red-300 text-sm">
                  {statsError && `Stats: ${statsError}`}
                  {toursError && `Tours: ${toursError}`}
                  {eventsError && `Events: ${eventsError}`}
                  {notificationsError && `Notifications: ${notificationsError}`}
                </p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm text-slate-400">Live Updates</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataStatus(!showDataStatus)}
            >
              <Database className="h-4 w-4 mr-2" />
              Data Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              disabled={statsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openShortcuts}
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openHelp()}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Apple-inspired Widgets overview */}
        <WidgetsRow tours={tours} events={events} stats={stats} isLoading={statsLoading || toursLoading || eventsLoading} />

        {/* Data Loading Status */}
        <AnimatePresence>
          {showDataStatus && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <DataLoadingStatus
                data={stats}
                dataType="dashboardStats"
                isLoading={statsLoading}
                error={statsError}
                onRetry={() => window.location.reload()}
                onRefresh={() => window.location.reload()}
                showDetails={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Tours"
            value={stats?.totalTours || 0}
            change={12}
            icon={Globe}
            trend="up"
            isLoading={statsLoading}
          />
          <MetricCard
            title="Active Events"
            value={stats?.totalEvents || 0}
            change={5}
            icon={Calendar}
            trend="down"
            isLoading={statsLoading}
          />
          <MetricCard
            title="Total Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            change={8}
            icon={DollarSign}
            trend="up"
            isLoading={statsLoading}
          />
          <MetricCard
            title="Tickets Sold"
            value={stats?.ticketsSold || 0}
            change={15}
            icon={Users}
            trend="up"
            isLoading={statsLoading}
          />
        </div>

        {/* Travel Coordination & Logistics Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Travel Groups"
            value={stats?.totalTravelGroups || 0}
            subtitle={`${stats?.totalTravelers || 0} travelers`}
            icon={Users}
            trend="neutral"
            isLoading={statsLoading}
            color="text-purple-400"
          />
          <MetricCard
            title="Coordination Rate"
            value={`${stats?.coordinationCompletionRate || 0}%`}
            subtitle={`${stats?.fullyCoordinatedGroups || 0} complete`}
            icon={CheckCircle}
            trend={(stats?.coordinationCompletionRate || 0) >= 80 ? "up" : "neutral"}
            isLoading={statsLoading}
            color="text-green-400"
          />
          <MetricCard
            title="Active Transport"
            value={stats?.activeTransportation || 0}
            subtitle={`${stats?.completedTransportation || 0} completed`}
            icon={Truck}
            trend="neutral"
            isLoading={statsLoading}
            color="text-blue-400"
          />
          <MetricCard
            title="Logistics Progress"
            value={`${stats?.logisticsCompletionRate || 0}%`}
            subtitle="Overall completion"
            icon={Target}
            trend={(stats?.logisticsCompletionRate || 0) >= 80 ? "up" : "neutral"}
            isLoading={statsLoading}
            color="text-orange-400"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 p-1 grid grid-cols-6 w-full max-w-2xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
            <TabsTrigger value="tours" className="data-[state=active]:bg-slate-700">Tours</TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-slate-700">Events</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-700">Calendar</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tours */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Recent Tours</span>
                    <Link href="/admin/dashboard/tours">
                      <Button variant="ghost" size="sm">
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VirtualList
                    items={recentTours}
                    height={300}
                    itemHeight={60}
                    loading={toursLoading}
                    renderItem={(tour, index) => (
                      <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Globe className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{tour.name}</p>
                            <p className="text-sm text-slate-400">{tour.artist}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${
                            tour.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            tour.status === 'planning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {tour.status}
                          </Badge>
                          <div className="mt-1">
                            <Progress value={tour.progress} className="h-1 w-16" />
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Upcoming Events</span>
                    <Link href="/admin/dashboard/events">
                      <Button variant="ghost" size="sm">
                        View All <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VirtualList
                    items={upcomingEvents}
                    height={300}
                    itemHeight={60}
                    loading={eventsLoading}
                    renderItem={(event, index) => (
                      <div className="flex items-center justify-between p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                            <Music className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{event.name}</p>
                            <p className="text-sm text-slate-400">{event.venue_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${
                            event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {event.status}
                          </Badge>
                          <p className="text-xs text-slate-400 mt-1">{event.event_date}</p>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Calendar and Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mini Calendar */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Calendar Overview</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('calendar')}
                    >
                      View Full <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mini Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <div key={`day-header-${index}`} className="text-center text-xs font-medium text-slate-400 py-2">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - date.getDay() + i)
                        const dayEvents = upcomingEvents.filter(event => {
                          const eventDate = event.event_date ? new Date(event.event_date) : null
                          return eventDate && eventDate.toDateString() === date.toDateString()
                        })
                        const dayTasks = upcomingTasks.filter(task => {
                          return task.dueDate.toDateString() === date.toDateString()
                        })
                        
                        return (
                          <div
                            key={i}
                            className={`
                              min-h-[40px] p-1 border border-slate-700/30 rounded text-xs cursor-pointer
                              ${date.toDateString() === new Date().toDateString() ? 'bg-blue-500/20 ring-1 ring-blue-500' : 'bg-slate-800/30'}
                              hover:bg-slate-700/50 transition-colors
                            `}
                          >
                            <div className="text-center text-slate-300 mb-1">
                              {date.getDate()}
                            </div>
                            <div className="space-y-0.5">
                              {dayEvents.slice(0, 2).map((event, idx) => (
                                <div
                                  key={`event-${idx}`}
                                  className="h-1 bg-blue-500 rounded-full"
                                  title={event.name}
                                />
                              ))}
                              {dayTasks.slice(0, 2).map((task, idx) => (
                                <div
                                  key={`task-${idx}`}
                                  className={`h-1 rounded-full ${
                                    task.priority === 'urgent' ? 'bg-red-500' :
                                    task.priority === 'high' ? 'bg-orange-500' :
                                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  title={task.title}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/30">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Events</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Tasks</span>
                        </div>
                      </div>
                      <div className="text-slate-500">
                        {upcomingEvents.length} events, {upcomingTasks.length} tasks
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Upcoming Tasks</span>
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingTasks && upcomingTasks.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {upcomingTasks.map((task, index) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700/30">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            task.priority === 'urgent' ? 'bg-red-500/20' :
                            task.priority === 'high' ? 'bg-orange-500/20' :
                            task.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                          }`}>
                            <Target className={`h-4 w-4 ${
                              task.priority === 'urgent' ? 'text-red-400' :
                              task.priority === 'high' ? 'text-orange-400' :
                              task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="font-medium text-white text-sm leading-tight">{task.title}</p>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{task.description}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-slate-400 font-medium">
                                  {task.dueDate.toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {task.assignedTo}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${
                                task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                              }`}>
                                {task.priority}
                              </Badge>
                              <Badge className={`text-xs ${
                                task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                      <div className="text-center">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No upcoming tasks</p>
                        <p className="text-xs text-slate-500 mt-1">Tasks will appear here when added</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Travel Coordination Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Travel Groups Summary */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Travel Coordination</span>
                    <Link href="/admin/dashboard/logistics">
                      <Button variant="ghost" size="sm">
                        Manage <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Coordination Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Travel Groups</p>
                          <p className="text-sm text-slate-400">{stats?.totalTravelGroups || 0} groups, {stats?.totalTravelers || 0} travelers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{stats?.coordinationCompletionRate || 0}%</p>
                        <p className="text-xs text-slate-400">Complete</p>
                      </div>
                    </div>
                    
                    <Progress value={stats?.coordinationCompletionRate || 0} className="h-2" />
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <p className="text-sm font-medium text-white">{stats?.fullyCoordinatedGroups || 0}</p>
                        <p className="text-xs text-slate-400">Complete</p>
                      </div>
                      <div className="text-center">
                        <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Truck className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-white">{stats?.activeTransportation || 0}</p>
                        <p className="text-xs text-slate-400">Active</p>
                      </div>
                      <div className="text-center">
                        <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Target className="h-4 w-4 text-orange-400" />
                        </div>
                        <p className="text-sm font-medium text-white">{stats?.logisticsCompletionRate || 0}%</p>
                        <p className="text-xs text-slate-400">Logistics</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/dashboard/logistics">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Plane className="h-4 w-4 mr-2" />
                        Manage Travel Coordination
                      </Button>
                    </Link>
                    <Link href="/admin/dashboard/logistics">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Truck className="h-4 w-4 mr-2" />
                        View Transportation
                      </Button>
                    </Link>
                    <Link href="/admin/dashboard/logistics">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Building className="h-4 w-4 mr-2" />
                        Manage Lodging
                      </Button>
                    </Link>
                    <Link href="/admin/dashboard/logistics">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Add Travel Group
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logistics Integration */}
            <LogisticsIntegration compact={false} showDetails={true} />
          </TabsContent>

          <TabsContent value="tours" className="space-y-6">
            {/* Inline widgets at top of Tours tab for quick context */}
            <WidgetsRow tours={tours} events={events} stats={stats} isLoading={statsLoading || toursLoading || eventsLoading} />
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">All Tours</CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualTable
                  items={tours || []}
                  height={400}
                  rowHeight={60}
                  loading={toursLoading}
                  columns={[
                    { key: 'name', header: 'Tour Name', width: '30%' },
                    { key: 'artist', header: 'Artist', width: '20%',
                      render: (tour) => {
                        const artistName = tour.artists && tour.artists.length > 0 ? tour.artists[0].name : 'Unknown Artist'
                        return artistName
                      }
                    },
                    { key: 'status', header: 'Status', width: '15%', 
                      render: (tour) => (
                        <Badge className={`text-xs ${
                          tour.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          tour.status === 'planning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {tour.status}
                        </Badge>
                      )
                    },
                    { key: 'totalShows', header: 'Shows', width: '15%',
                      render: (tour) => tour.totalShows || tour.venues?.length || 0
                    },
                    { key: 'revenue', header: 'Revenue', width: '20%',
                      render: (tour) => `$${(tour.revenue || tour.totalRevenue || 0).toLocaleString()}`
                    }
                  ]}
                  onRowClick={(tour) => {
                    window.location.href = `/admin/dashboard/tours/${tour.id}`
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* Inline widgets at top of Events tab for quick context */}
            <WidgetsRow tours={tours} events={events} stats={stats} isLoading={statsLoading || toursLoading || eventsLoading} />
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">All Events</CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualTable
                  items={events || []}
                  height={400}
                  rowHeight={60}
                  loading={eventsLoading}
                  columns={[
                    { key: 'name', header: 'Event Name', width: '25%' },
                    { key: 'venue_name', header: 'Venue', width: '20%',
                      render: (event) => {
                        const venueName = event.venueName || (event.venue ? event.venue.name : 'Unknown Venue')
                        return venueName
                      }
                    },
                    { key: 'event_date', header: 'Date', width: '15%',
                      render: (event) => {
                        return event.date ? new Date(event.date).toLocaleDateString() : 'TBD'
                      }
                    },
                    { key: 'status', header: 'Status', width: '15%',
                      render: (event) => (
                        <Badge className={`text-xs ${
                          event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {event.status}
                        </Badge>
                      )
                    },
                    { key: 'tickets_sold', header: 'Tickets', width: '15%',
                      render: (event) => `${event.ticketsSold || 0}/${event.capacity || 0}`
                    },
                    { key: 'expected_revenue', header: 'Revenue', width: '10%',
                      render: (event) => `$${(event.expectedRevenue || 0).toLocaleString()}`
                    }
                  ]}
                  onRowClick={(event) => {
                    window.location.href = `/admin/dashboard/events/${event.id}`
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <DashboardCalendar
              tours={tours || []}
              events={events || []}
              tasks={[]} // You can add real task data here
              onItemClick={(item) => {
                console.log('Calendar item clicked:', item)
                // Navigate to the appropriate detail page
                if (item.type === 'tour') {
                  window.location.href = `/admin/dashboard/tours/${item.id.replace('tour-', '')}`
                } else if (item.type === 'event') {
                  window.location.href = `/admin/dashboard/events/${item.id.replace('event-', '')}`
                } else if (item.type === 'task') {
                  // Handle task click - you can add task management here
                  console.log('Task clicked:', item)
                }
              }}
              onAddItem={(type) => {
                console.log('Add item clicked:', type)
                // Navigate to create page based on type
                if (type === 'event') {
                  window.location.href = '/admin/dashboard/events/create'
                } else if (type === 'tour') {
                  window.location.href = '/admin/dashboard/tours/create'
                } else if (type === 'task') {
                  // Handle task creation - you can add task management here
                  console.log('Create task')
                }
              }}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Recent Activity</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-xs text-slate-400">Live</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VirtualList
                  items={recentNotifications}
                  height={400}
                  itemHeight={60}
                  loading={notificationsLoading}
                  renderItem={(notification, index) => (
                    <div className="flex items-center space-x-3 p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        notification.type === 'success' ? 'bg-green-500/20' :
                        notification.type === 'warning' ? 'bg-yellow-500/20' :
                        notification.type === 'error' ? 'bg-red-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-400" /> :
                         notification.type === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-400" /> :
                         notification.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-400" /> :
                         <Bell className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-xs text-slate-400">{notification.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{notification.timestamp}</p>
                      </div>
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help System */}
        <HelpSystem isOpen={helpOpen} onClose={closeHelp} />
        <KeyboardShortcutsHelp isOpen={shortcutsOpen} onClose={closeShortcuts} />
        
        {/* Real-time Status Bar */}
        <RealTimeStatusBar />
      </div>
    </ErrorBoundary>
  )
} 