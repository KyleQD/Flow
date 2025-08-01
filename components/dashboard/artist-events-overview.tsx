"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { format, addDays, isToday, isTomorrow, differenceInDays, isAfter } from "date-fns"
import Link from "next/link"
import { cn } from "@/utils"

interface Event {
  id: string
  title: string
  date: Date
  venue: string
  city: string
  status: 'confirmed' | 'pending' | 'draft' | 'cancelled'
  ticketSales: number
  capacity: number
  revenue: number
  type: 'concert' | 'festival' | 'tour' | 'recording' | 'interview' | 'other'
  ticketPrice?: number
  expectedAttendance?: number
}

interface ArtistEventsOverviewProps {
  events: Event[]
  isLoading?: boolean
  onCreateEvent?: () => void
  onViewAll?: () => void
}

export function ArtistEventsOverview({ 
  events, 
  isLoading = false, 
  onCreateEvent,
  onViewAll 
}: ArtistEventsOverviewProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Filter and sort upcoming events
  const upcomingEvents = events
    .filter(event => isAfter(event.date, currentTime))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const nextEvent = upcomingEvents[0]
  const confirmedEvents = upcomingEvents.filter(e => e.status === 'confirmed')
  const pendingEvents = upcomingEvents.filter(e => e.status === 'pending')
  const totalRevenue = upcomingEvents.reduce((sum, e) => sum + e.revenue, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'concert': return '🎤'
      case 'festival': return '🎪'
      case 'tour': return '🚌'
      case 'recording': return '🎧'
      case 'interview': return '🎙️'
      default: return '🎵'
    }
  }

  const getCountdownText = (date: Date) => {
    const days = differenceInDays(date, currentTime)
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return `in ${days} days`
    if (days < 30) return `in ${Math.floor(days / 7)} weeks`
    return `in ${Math.floor(days / 30)} months`
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-400" />
            Scheduled Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              Scheduled Events
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your upcoming performances and events
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-slate-700 text-gray-300 hover:text-white"
            onClick={onViewAll}
            asChild
          >
            <Link href="/artist/events">
              <ArrowRight className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {/* Next Event Highlight */}
            {nextEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Next Event</h3>
                      <p className="text-sm text-gray-400">
                        {getCountdownText(nextEvent.date)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(nextEvent.status)}>
                    {nextEvent.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getEventTypeIcon(nextEvent.type)}</span>
                  <h4 className="text-lg font-semibold text-white">
                    {nextEvent.title}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {nextEvent.venue}, {nextEvent.city}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {nextEvent.ticketSales}/{nextEvent.capacity} tickets
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${nextEvent.revenue.toLocaleString()}
                  </div>
                </div>
                
                {/* Ticket Sales Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Ticket Sales</span>
                    <span className="text-white">
                      {Math.round((nextEvent.ticketSales / nextEvent.capacity) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(nextEvent.ticketSales / nextEvent.capacity) * 100} 
                    className="h-2"
                  />
                </div>
              </motion.div>
            )}
            
            {/* Events Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{upcomingEvents.length}</div>
                <div className="text-sm text-gray-400">Total Events</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{confirmedEvents.length}</div>
                <div className="text-sm text-gray-400">Confirmed</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{pendingEvents.length}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">${(totalRevenue / 1000).toFixed(1)}K</div>
                <div className="text-sm text-gray-400">Projected Revenue</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 flex-1"
                onClick={onCreateEvent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-slate-700 text-gray-300 hover:text-white"
                asChild
              >
                <Link href="/artist/events/calendar">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No upcoming events scheduled</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={onCreateEvent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 