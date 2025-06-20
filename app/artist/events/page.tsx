"use client"

import { useState, useEffect } from "react"
import { useArtist } from "@/contexts/artist-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Share2,
  Copy,
  BarChart,
  Megaphone,
  Wallet,
  Settings,
  Bell,
  Download
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import EventAnalytics from "./components/event-analytics"
import Link from "next/link"

interface Event {
  id?: string
  title: string
  description?: string
  type: 'concert' | 'festival' | 'tour' | 'recording' | 'interview' | 'other'
  venue_name?: string
  venue_address?: string
  venue_city?: string
  venue_state?: string
  venue_country?: string
  event_date: string
  start_time?: string
  end_time?: string
  doors_open?: string
  ticket_url?: string
  ticket_price_min?: number
  ticket_price_max?: number
  capacity?: number
  expected_attendance?: number
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  is_public: boolean
  poster_url?: string
  setlist?: string[]
  notes?: string
  created_at?: string
  updated_at?: string
}

export default function EventsPage() {
  const { user, profile, isLoading: isUserLoading } = useArtist()
  const supabase = createClientComponentClient()
  
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("overview")
  
  // Form state
  const [formData, setFormData] = useState<Event>({
    title: '',
    description: '',
    type: 'concert',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_state: '',
    venue_country: 'USA',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '19:00',
    end_time: '22:00',
    doors_open: '18:30',
    ticket_price_min: 0,
    ticket_price_max: 0,
    capacity: 0,
    expected_attendance: 0,
    status: 'upcoming',
    is_public: true,
    setlist: [],
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  useEffect(() => {
    if (editingEvent) {
      setFormData(editingEvent)
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'concert',
        venue_name: '',
        venue_address: '',
        venue_city: '',
        venue_state: '',
        venue_country: 'USA',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '19:00',
        end_time: '22:00',
        doors_open: '18:30',
        ticket_price_min: 0,
        ticket_price_max: 0,
        capacity: 0,
        expected_attendance: 0,
        status: 'upcoming',
        is_public: true,
        setlist: [],
        notes: ''
      })
    }
  }, [editingEvent])

  const loadEvents = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('artist_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEvent = async () => {
    // Debug logging
    console.log('Form data before validation:', formData)
    console.log('User:', user ? 'Present' : 'Missing')
    console.log('Profile:', profile ? 'Present' : 'Missing')
    console.log('Loading state:', isUserLoading)
    
    // Comprehensive validation with better error messages
    const validationErrors = []
    
    // Check for both user and profile (required by artist context)
    if (!user) {
      validationErrors.push('User not authenticated')
    }
    
    if (!profile) {
      validationErrors.push('Artist profile not loaded. Please wait a moment and try again.')
    }
    
    // If still loading, prevent submission
    if (isUserLoading) {
      validationErrors.push('Please wait while your profile loads...')
    }
    
    if (!formData.title.trim()) {
      validationErrors.push('Event title is required')
    }
    
    if (!formData.event_date) {
      validationErrors.push('Event date is required')
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]) // Show first error
      console.log('Validation errors:', validationErrors)
      return
    }

    try {
      setIsSubmitting(true)
      
      const eventData = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (editingEvent?.id) {
        // Update existing event
        const { error } = await supabase
          .from('artist_events')
          .update(eventData)
          .eq('id', editingEvent.id)
          .eq('user_id', user.id)

        if (error) throw error
        
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id ? { ...event, ...eventData } : event
        ))
        toast.success('Event updated successfully!')
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('artist_events')
          .insert(eventData)
          .select()
          .single()

        if (error) throw error
        
        if (data) {
          setEvents(prev => [data, ...prev])
        }
        toast.success('Event created successfully!')
      }
      
      setShowCreateModal(false)
      setEditingEvent(null)
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('artist_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setEvents(prev => prev.filter(event => event.id !== eventId))
      toast.success('Event deleted successfully')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setDeleteEventId(null)
    }
  }

  const handleStatusChange = async (eventId: string, newStatus: Event['status']) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('artist_events')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', eventId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      ))
      
      toast.success(`Event marked as ${newStatus}`)
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error('Failed to update event status')
    }
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-600/20 text-blue-300'
      case 'in_progress': return 'bg-green-600/20 text-green-300'
      case 'completed': return 'bg-gray-600/20 text-gray-300'
      case 'cancelled': return 'bg-red-600/20 text-red-300'
      case 'postponed': return 'bg-yellow-600/20 text-yellow-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'concert': return 'bg-purple-600/20 text-purple-300'
      case 'festival': return 'bg-green-600/20 text-green-300'
      case 'tour': return 'bg-blue-600/20 text-blue-300'
      case 'recording': return 'bg-red-600/20 text-red-300'
      case 'interview': return 'bg-yellow-600/20 text-yellow-300'
      default: return 'bg-gray-600/20 text-gray-300'
    }
  }

  const getTotalStats = () => {
    const now = new Date()
    return events.reduce((acc, event) => {
      const eventDate = new Date(event.event_date)
      const isUpcoming = eventDate > now
      const revenue = (event.ticket_price_min || 0) * (event.expected_attendance || 0)
      
      return {
        totalEvents: acc.totalEvents + 1,
        upcomingEvents: acc.upcomingEvents + (isUpcoming ? 1 : 0),
        totalCapacity: acc.totalCapacity + (event.capacity || 0),
        projectedRevenue: acc.projectedRevenue + revenue,
        completedEvents: acc.completedEvents + (event.status === 'completed' ? 1 : 0)
      }
    }, { totalEvents: 0, upcomingEvents: 0, totalCapacity: 0, projectedRevenue: 0, completedEvents: 0 })
  }

  const stats = getTotalStats()

  // Show loading state if user/profile aren't ready
  if (isUserLoading || !user || !profile) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Events</h1>
              <p className="text-gray-400">
                {isUserLoading ? 'Loading your profile...' : 'Manage your shows, tours, and appearances'}
              </p>
            </div>
          </div>
          <Button 
            disabled
            className="bg-purple-600 hover:bg-purple-700 text-white opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Loading state */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isUserLoading ? 'Loading your artist profile...' : 'Setting up your account...'}
            </h3>
            <p className="text-gray-400">
              {isUserLoading ? 'Please wait while we fetch your data.' : 'Please wait while we set up your artist account.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Events</h1>
            <p className="text-gray-400">Manage your shows, tours, and appearances</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                // Simple CSV export functionality
                const csvData = events.map(event => ({
                  title: event.title,
                  date: event.event_date,
                  venue: event.venue_name || '',
                  city: event.venue_city || '',
                  status: event.status,
                  type: event.type
                }))
                
                const headers = Object.keys(csvData[0])
                const csvContent = [
                  headers.join(','),
                  ...csvData.map(row => 
                    headers.map(header => row[header as keyof typeof row]).join(',')
                  )
                ].join('\n')
                
                const blob = new Blob([csvContent], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'events.csv'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                
                toast.success('Events exported to CSV')
              }}
              className="border-slate-700 text-gray-300 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button 
            onClick={() => {
              setEditingEvent(null)
              setShowCreateModal(true)
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
              </div>
              <Bell className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Capacity</p>
                <p className="text-2xl font-bold text-white">{stats.totalCapacity.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Projected Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.projectedRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedEvents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-6 gap-4 bg-slate-800/50 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="marketing">
            <Megaphone className="h-4 w-4 mr-1" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Wallet className="h-4 w-4 mr-1" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-1" />
            Team
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Events List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-700/50 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">
                  Start planning your performances by creating your first event.
                </p>
                <Button 
                  onClick={() => {
                    setEditingEvent(null)
                    setShowCreateModal(true)
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="bg-slate-900/50 border-slate-700/50 group hover:border-purple-500/50 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {event.title}
                          </h3>
                          <Badge variant="secondary" className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                          {!event.is_public && (
                            <Badge variant="outline" className="border-gray-500/30 text-gray-400">
                              Private
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-400 mb-3">{event.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span>{format(new Date(event.event_date), 'PPP')}</span>
                          </div>
                          {event.start_time && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="h-4 w-4 text-green-400" />
                              <span>{event.start_time}</span>
                            </div>
                          )}
                          {event.venue_name && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <MapPin className="h-4 w-4 text-red-400" />
                              <span>{event.venue_name}</span>
                              {event.venue_city && <span>, {event.venue_city}</span>}
                            </div>
                          )}
                        </div>

                        {(event.capacity || event.ticket_price_min) && (
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
                            {event.capacity && (
                              <span>Capacity: {event.capacity.toLocaleString()}</span>
                            )}
                            {event.ticket_price_min && (
                              <span>
                                Tickets: ${event.ticket_price_min}
                                {event.ticket_price_max && event.ticket_price_max !== event.ticket_price_min && 
                                  ` - $${event.ticket_price_max}`
                                }
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingEvent(event)
                              setShowCreateModal(true)
                            }}
                            className="text-gray-300 hover:text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:text-white">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:text-white">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          
                          {event.status === 'upcoming' && (
                            <>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(event.id!, 'in_progress')}
                                className="text-gray-300 hover:text-white"
                              >
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(event.id!, 'completed')}
                                className="text-gray-300 hover:text-white"
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(event.id!, 'cancelled')}
                                className="text-gray-300 hover:text-white"
                              >
                                Cancel Event
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem 
                            onClick={() => setDeleteEventId(event.id!)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <EventAnalytics />
        </TabsContent>

        <TabsContent value="marketing">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Marketing Tools</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Megaphone className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Marketing Features Coming Soon</h3>
              <p className="text-gray-400">
                Create promotional campaigns, social media posts, and event announcements.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Financial Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Financial Tools Coming Soon</h3>
              <p className="text-gray-400">
                Track expenses, revenue, and profit margins for each event.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Team Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Team Features Coming Soon</h3>
              <p className="text-gray-400">
                Collaborate with your team on event planning and management.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Event Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Default Event Settings</Label>
                <p className="text-sm text-gray-400 mb-4">Configure default values for new events</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_country" className="text-gray-300">Default Country</Label>
                    <Select defaultValue="USA">
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="CAN">Canada</SelectItem>
                        <SelectItem value="GBR">United Kingdom</SelectItem>
                        <SelectItem value="AUS">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="default_currency" className="text-gray-300">Default Currency</Label>
                    <Select defaultValue="USD">
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Event Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Event['type'] }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concert">Concert</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="tour">Tour</SelectItem>
                        <SelectItem value="recording">Recording</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-300">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Event['status'] }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label htmlFor="is_public" className="text-gray-300">Public Event</Label>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date" className="text-gray-300">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doors_open" className="text-gray-300">Doors Open</Label>
                    <Input
                      id="doors_open"
                      type="time"
                      value={formData.doors_open || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, doors_open: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="text-gray-300">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time" className="text-gray-300">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Venue Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venue_name" className="text-gray-300">Venue Name</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                    placeholder="Venue name..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_address" className="text-gray-300">Address</Label>
                  <Input
                    id="venue_address"
                    value={formData.venue_address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                    placeholder="Street address..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue_city" className="text-gray-300">City</Label>
                    <Input
                      id="venue_city"
                      value={formData.venue_city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_city: e.target.value }))}
                      placeholder="City..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue_state" className="text-gray-300">State/Province</Label>
                    <Input
                      id="venue_state"
                      value={formData.venue_state || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_state: e.target.value }))}
                      placeholder="State/Province..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_country" className="text-gray-300">Country</Label>
                  <Input
                    id="venue_country"
                    value={formData.venue_country || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_country: e.target.value }))}
                    placeholder="Country..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tickets & Capacity */}
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Tickets & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-gray-300">Venue Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected_attendance" className="text-gray-300">Expected Attendance</Label>
                    <Input
                      id="expected_attendance"
                      type="number"
                      value={formData.expected_attendance || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, expected_attendance: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket_price_min" className="text-gray-300">Min Ticket Price</Label>
                    <Input
                      id="ticket_price_min"
                      type="number"
                      step="0.01"
                      value={formData.ticket_price_min || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, ticket_price_min: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket_price_max" className="text-gray-300">Max Ticket Price</Label>
                    <Input
                      id="ticket_price_max"
                      type="number"
                      step="0.01"
                      value={formData.ticket_price_max || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, ticket_price_max: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket_url" className="text-gray-300">Ticket URL</Label>
                  <Input
                    id="ticket_url"
                    type="url"
                    value={formData.ticket_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticket_url: e.target.value }))}
                    placeholder="https://..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isSubmitting || isUserLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEvent} 
              disabled={isSubmitting || isUserLoading || !user || !profile} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUserLoading ? 'Loading Profile...' : isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && handleDeleteEvent(deleteEventId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 