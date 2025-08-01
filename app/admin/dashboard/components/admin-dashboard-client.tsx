"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Progress } from "../../../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { EnhancedCalendar } from "../../../../components/admin/enhanced-calendar"
import { 
  Calendar,
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Building,
  Music,
  Ticket,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Zap,
  Eye,
  Settings,
  BarChart3,
  Globe,
  Truck,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  CalendarDays,
  Clock3,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Rocket,
  Crown,
  Shield,
  Zap as Lightning
} from "lucide-react"
import Link from "next/link"

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
}

interface CalendarEvent {
  id: string
  title: string
  type: 'tour' | 'event' | 'task' | 'meeting' | 'deadline' | 'booking' | 'payment' | 'logistics'
  start: Date
  end: Date
  color: string
  description?: string
  location?: string
  attendees?: string[]
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  originalData?: any
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
}

function MetricCard({ title, value, change, icon: Icon, trend = 'neutral', subtitle, color = "text-blue-400", gradient }: MetricCardProps) {
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl ${gradient}`}
    >
      <Card className="border-0 bg-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400">{title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-white">{value}</p>
                {change !== undefined && (
                  <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(change)}%</span>
                  </div>
                )}
              </div>
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                )}
              </div>
            <div className={`p-3 rounded-lg bg-slate-800/50 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTours: 0,
    activeTours: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalArtists: 0,
    totalVenues: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    ticketsSold: 0,
    totalCapacity: 0,
    staffMembers: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageRating: 0
  })

  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  // Fetch calendar events
  const fetchCalendarEvents = async () => {
    try {
      setIsLoadingEvents(true)
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString().split('T')[0]
      
      const response = await fetch(`/api/admin/calendar?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchCalendarEvents()
  }, [currentDate])

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalTours: 3,
        activeTours: 2,
        totalEvents: 12,
        upcomingEvents: 8,
        totalArtists: 15,
        totalVenues: 8,
        totalRevenue: 485000,
        monthlyRevenue: 125000,
        ticketsSold: 2340,
        totalCapacity: 3200,
        staffMembers: 12,
        completedTasks: 23,
        pendingTasks: 7,
        averageRating: 4.8
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event)
    // Handle event click - could open modal, navigate to event details, etc.
    // For now, we'll just log the event details
    alert(`Event: ${event.title}\nType: ${event.type}\nTime: ${event.start.toLocaleString()}\nStatus: ${event.status}\nPriority: ${event.priority}`)
  }

  const handleAddEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh calendar events
          fetchCalendarEvents()
        }
      }
    } catch (error) {
      console.error('Failed to add event:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="absolute inset-0 animate-ping h-16 w-16 border-2 border-purple-400 rounded-full mx-auto opacity-20"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Loading Dashboard
            </h2>
            <p className="text-slate-400">Setting up your management center...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
                <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Admin Dashboard
                  </h1>
          <p className="text-slate-400 mt-1">Manage your tours, events, and business operations</p>
              </div>
              <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
                  </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
            Quick Action
                  </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Active Tours"
          value={`${stats.activeTours}/${stats.totalTours}`}
          change={12}
          icon={Music}
          trend="up"
          subtitle="Total tours"
          color="text-purple-400"
          gradient="from-purple-500/20 to-blue-500/20"
        />
        <MetricCard
          title="Upcoming Events"
          value={`${stats.upcomingEvents}/${stats.totalEvents}`}
          change={8}
          icon={Calendar}
          trend="up"
          subtitle="Total events"
          color="text-green-400"
          gradient="from-green-500/20 to-emerald-500/20"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(0)}K`}
          change={15}
          icon={DollarSign}
          trend="up"
          subtitle={`$${(stats.totalRevenue / 1000).toFixed(0)}K total`}
          color="text-yellow-400"
          gradient="from-yellow-500/20 to-orange-500/20"
        />
        <MetricCard
          title="Ticket Sales"
          value={`${Math.round((stats.ticketsSold / stats.totalCapacity) * 100)}%`}
          change={-3}
          icon={Ticket}
          trend="down"
          subtitle={`${stats.ticketsSold}/${stats.totalCapacity} sold`}
          color="text-blue-400"
          gradient="from-blue-500/20 to-cyan-500/20"
        />
      </motion.div>

      {/* Calendar & Schedule */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Calendar & Schedule
          </h2>
          <div className="flex items-center space-x-2">
            <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'month' | 'week' | 'day')}>
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger value="month" className="data-[state=active]:bg-purple-600">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-purple-600">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Week
                </TabsTrigger>
                <TabsTrigger value="day" className="data-[state=active]:bg-purple-600">
                  <Clock3 className="h-4 w-4 mr-2" />
                  Day
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Today
            </Button>
          </div>
        </div>

        {isLoadingEvents ? (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                <span className="text-slate-400">Loading calendar events...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EnhancedCalendar
            events={events}
            view={calendarView}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={handleEventClick}
            onAddEvent={handleAddEvent}
          />
        )}
      </motion.div>

      {/* Additional Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Team Overview */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Staff Members</span>
                <span className="text-white font-medium">{stats.staffMembers}</span>
              </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">Completed Tasks</span>
                <span className="text-green-400 font-medium">{stats.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">Pending Tasks</span>
                <span className="text-yellow-400 font-medium">{stats.pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">Average Rating</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-white font-medium">{stats.averageRating}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-400" />
              Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Overall Progress</span>
                  <span className="text-sm text-white font-medium">
                    {Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}%
                  </span>
            </div>
            <Progress 
              value={(stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100} 
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
                  <div className="text-xs text-slate-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingTasks}</div>
                  <div className="text-xs text-slate-400">Pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-400" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Revenue Growth</span>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="font-medium">+15%</span>
                </div>
              </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">Ticket Sales</span>
                <div className="flex items-center text-blue-400">
                  <Ticket className="h-4 w-4 mr-1" />
                  <span className="font-medium">+8%</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">Event Success</span>
                <div className="flex items-center text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="font-medium">92%</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">Customer Satisfaction</span>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="font-medium">4.8/5</span>
                </div>
            </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link href="/admin/dashboard/events">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Manage Events</h3>
                  <p className="text-sm text-slate-400">Create and organize events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard/tours">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Music className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Tour Management</h3>
                  <p className="text-sm text-slate-400">Plan and track tours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard/finances">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl hover:border-green-500/50 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Financial Reports</h3>
                  <p className="text-sm text-slate-400">View revenue and expenses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard/analytics">
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <BarChart3 className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Analytics</h3>
                  <p className="text-sm text-slate-400">Performance insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </div>
  )
} 