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
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl hover:from-slate-900/90 hover:to-slate-800/90 transition-all duration-300 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient || 'from-blue-500/20 to-purple-600/20'} backdrop-blur-sm border border-slate-600/30`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{value}</p>
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            {change !== undefined && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                trend === 'up' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                trend === 'down' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-medium">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CalendarView({ events, view, currentDate, onDateChange, onEventClick }: {
  events: CalendarEvent[]
  view: 'month' | 'week' | 'day'
  currentDate: Date
  onDateChange: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}) {
  const [selectedDate, setSelectedDate] = useState(currentDate)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'tour': return 'bg-gradient-to-r from-purple-500 to-blue-500'
      case 'event': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'task': return 'bg-gradient-to-r from-orange-500 to-red-500'
      case 'meeting': return 'bg-gradient-to-r from-cyan-500 to-blue-500'
      case 'deadline': return 'bg-gradient-to-r from-red-500 to-pink-500'
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500'
    }
  }

  if (view === 'day') {
    const dayEvents = getEventsForDate(selectedDate)
    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                className="text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                className="text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              dayEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border border-slate-600/30 cursor-pointer ${getEventColor(event.type)}`}
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-white/20"></div>
                      <div>
                        <h4 className="font-medium text-white">{event.title}</h4>
                        <p className="text-sm text-white/80">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-white/60 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                        event.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (view === 'week') {
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      weekDays.push(new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000))
    }

    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                className="text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                className="text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
            {weekDays.map((date, index) => {
              const dayEvents = getEventsForDate(date)
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 rounded-lg border ${
                    date.toDateString() === selectedDate.toDateString()
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-slate-600/30 bg-slate-800/20'
                  }`}
                >
                  <div className="text-sm font-medium text-white mb-2">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer ${getEventColor(event.type)}`}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="text-white font-medium truncate">{event.title}</div>
                        <div className="text-white/80 text-xs">{formatTime(event.start)}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-slate-400 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Month view
  const days = getDaysInMonth(selectedDate)
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{monthName}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-20"></div>
            }
            const dayEvents = getEventsForDate(date)
            return (
              <div
                key={index}
                className={`h-20 p-1 rounded-lg border ${
                  date.toDateString() === selectedDate.toDateString()
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-slate-600/30 bg-slate-800/20'
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded cursor-pointer ${getEventColor(event.type)}`}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="text-white font-medium truncate">{event.title}</div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-slate-400 text-center">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Futuristic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-2xl blur-3xl"></div>
        <div className="relative bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                    Command Center
                  </h1>
                  <p className="text-slate-400">
                    Advanced tour & event management platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/admin/dashboard/tours/planner">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg">
                    <Rocket className="h-4 w-4 mr-2" />
                    Create Tour
                  </Button>
                </Link>
                <Link href="/admin/dashboard/events/planner">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </Link>
                <Link href="/admin/dashboard/settings">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Active Tours"
          value={stats.activeTours}
          change={12}
          icon={Globe}
          trend="up"
          subtitle={`${stats.totalTours} total tours`}
          color="text-purple-400"
          gradient="from-purple-500/20 to-purple-600/20"
        />
        <MetricCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          change={8}
          icon={Calendar}
          trend="up"
          subtitle={`${stats.totalEvents} total events`}
          color="text-green-400"
          gradient="from-green-500/20 to-green-600/20"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(0)}K`}
          change={15}
          icon={DollarSign}
          trend="up"
          subtitle={`$${(stats.totalRevenue / 1000).toFixed(0)}K total`}
          color="text-yellow-400"
          gradient="from-yellow-500/20 to-yellow-600/20"
        />
        <MetricCard
          title="Ticket Sales"
          value={`${Math.round((stats.ticketsSold / stats.totalCapacity) * 100)}%`}
          change={-3}
          icon={Ticket}
          trend="down"
          subtitle={`${stats.ticketsSold.toLocaleString()} / ${stats.totalCapacity.toLocaleString()}`}
          color="text-cyan-400"
          gradient="from-cyan-500/20 to-cyan-600/20"
        />
      </motion.div>

      {/* Calendar Section */}
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
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Team Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Artists</span>
              <span className="text-white font-semibold">{stats.totalArtists}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Venues</span>
              <span className="text-white font-semibold">{stats.totalVenues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Staff</span>
              <span className="text-white font-semibold">{stats.staffMembers}</span>
            </div>
            <Progress value={75} className="bg-slate-700" />
            <p className="text-xs text-slate-500">75% capacity utilization</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Activity className="h-5 w-5 text-green-400" />
              <span>Task Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Completed</span>
              <span className="text-green-400 font-semibold">{stats.completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pending</span>
              <span className="text-yellow-400 font-semibold">{stats.pendingTasks}</span>
            </div>
            <Progress 
              value={(stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100} 
              className="bg-slate-700" 
            />
            <p className="text-xs text-slate-500">
              {Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Avg Rating</span>
              <span className="text-white font-semibold">{stats.averageRating}/5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Success Rate</span>
              <span className="text-green-400 font-semibold">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Response Time</span>
              <span className="text-blue-400 font-semibold">2.3s</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 