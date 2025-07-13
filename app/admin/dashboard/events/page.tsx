"use client"

import { useState, useEffect } from "react"
import { CreateEventForm } from "@/components/admin/create-event-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Music, 
  Ticket,
  TrendingUp,
  PlayCircle,
  BarChart3,
  Eye,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
  CheckCircle,
  Target,
  Download
} from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: string
  name: string
  description?: string
  tour_id?: string
  venue_name: string
  venue_address?: string
  event_date: string
  event_time?: string
  doors_open?: string
  duration_minutes?: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  capacity: number
  tickets_sold: number
  ticket_price?: number
  vip_price?: number
  expected_revenue: number
  actual_revenue: number
  expenses: number
  venue_contact_name?: string
  venue_contact_email?: string
  venue_contact_phone?: string
  tour?: {
    id: string
    name: string
    artist_id: string
    status: string
  }
}

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
      
      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [filterStatus])

  const handleEventCreated = () => {
    setIsCreateEventOpen(false)
    fetchEvents() // Refresh the events list
  }

  // Mock data for development
  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Summer Music Festival',
      venue_name: 'Central Park Bandshell',
      venue_address: 'Central Park, New York, NY',
      event_date: '2025-07-15',
      event_time: '19:00',
      doors_open: '18:00',
      status: 'confirmed',
      capacity: 5000,
      tickets_sold: 3750,
      ticket_price: 85,
      vip_price: 150,
      expected_revenue: 400000,
      actual_revenue: 318750,
      expenses: 120000,
      venue_contact_name: 'Sarah Johnson',
      venue_contact_email: 'sarah@centralparkbandshell.com',
      venue_contact_phone: '+1 (555) 123-4567'
    },
    {
      id: '2',
      name: 'Electronic Showcase',
      venue_name: 'Brooklyn Warehouse',
      venue_address: '123 Industrial Ave, Brooklyn, NY',
      event_date: '2025-07-22',
      event_time: '21:00',
      doors_open: '20:00',
      status: 'scheduled',
      capacity: 2000,
      tickets_sold: 1200,
      ticket_price: 45,
      vip_price: 80,
      expected_revenue: 80000,
      actual_revenue: 54000,
      expenses: 25000,
      tour: {
        id: '1',
        name: 'Summer Electronic Tour 2025',
        artist_id: 'artist1',
        status: 'active'
      }
    }
  ]

  // Use real events data, fallback to mock for development
  const displayEvents = events.length > 0 ? events : (isLoading ? [] : mockEvents)
  const filteredEvents = displayEvents.filter((event: any) => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      case 'confirmed': return 'bg-green-500/20 text-green-400'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-purple-500/20 text-purple-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      case 'postponed': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const EventCard = ({ event }: { event: Event }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                {event.name}
              </CardTitle>
              <div className="flex items-center text-sm text-slate-400">
                <MapPin className="h-4 w-4 mr-1" />
                {event.venue_name}
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(event.event_date), 'MMM dd, yyyy')}
                {event.event_time && ` at ${event.event_time}`}
              </div>
            </div>
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-slate-400">Capacity</div>
              <div className="text-lg font-semibold text-white">{event.capacity.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Sold</div>
              <div className="text-lg font-semibold text-green-400">{event.tickets_sold.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Revenue</div>
              <div className="text-lg font-semibold text-blue-400">
                ${(event.actual_revenue || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tickets Sold</span>
              <span className="text-white">
                {((event.tickets_sold / event.capacity) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((event.tickets_sold / event.capacity) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Tour Badge */}
          {event.tour && (
            <div className="flex items-center">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                <Music className="h-3 w-3 mr-1" />
                {event.tour.name}
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedEvent(event)}
              className="text-slate-400 hover:text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Events Management
            </h1>
            <p className="text-slate-400 mt-2">
              Coordinate events, manage bookings, and track performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsCreateEventOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Events</p>
                  <p className="text-2xl font-bold text-white">
                    {displayEvents.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Attendance</p>
                  <p className="text-2xl font-bold text-white">
                    {displayEvents.reduce((sum: number, event: any) => sum + (event.tickets_sold || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${displayEvents.reduce((sum: number, event: any) => sum + (event.actual_revenue || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Capacity</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {displayEvents.length > 0 
                      ? Math.round(displayEvents.reduce((sum: number, event: any) => 
                          sum + ((event.tickets_sold || 0) / (event.capacity || 1)), 0) / displayEvents.length * 100) + '%'
                      : '0%'
                    }
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Create Event Form Modal */}
        <AnimatePresence>
          {isCreateEventOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsCreateEventOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <CreateEventForm
                  onSuccess={handleEventCreated}
                  onCancel={() => setIsCreateEventOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-slate-400 mb-6">
                {filterStatus === 'all' 
                  ? "Get started by creating your first event"
                  : `No events with status "${filterStatus}" found`
                }
              </p>
              <Button 
                onClick={() => setIsCreateEventOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
