"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  Download, 
  MapPin, 
  Users, 
  DollarSign, 
  ChevronLeft, 
  Share2, 
  Plus, 
  Search,
  Settings,
  BarChart3,
  Ticket,
  Users2,
  Truck,
  FileText,
  Bell,
  Edit,
  Trash2,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Star,
  Shield,
  Wifi,
  Music,
  Video,
  Camera,
  Mic,
  Lightbulb,
  Speaker,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Printer,
  Archive,
  BookOpen,
  Clipboard,
  CalendarDays,
  Clock4
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { EventTaskManager } from "@/components/admin/event-task-manager"
import { EventLocationsTab } from "@/components/admin/event-locations-tab"
import { EventParticipantsTab } from "@/components/admin/event-participants-tab"
import { EntityAccessAudit } from "@/components/admin/entity-access-audit"
import { EventStaffManager } from "@/components/admin/event-staff-manager"
import { EventVendorManager } from "@/components/admin/event-vendor-manager"
import { EventVendorRequests } from "@/components/admin/event-vendor-requests"
import { EventJobPosting } from "@/components/admin/event-job-posting"
import { EventJobsList } from "@/components/admin/event-jobs-list"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format, parseISO, addDays, differenceInDays } from "date-fns"

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
  sound_requirements?: string
  lighting_requirements?: string
  stage_requirements?: string
  special_requirements?: string
  load_in_time?: string
  sound_check_time?: string
  tour?: {
    id: string
    name: string
    artist_id: string
    status: string
  }
}

interface Task {
  id: string
  name: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  assigned_to?: string
  category: 'logistics' | 'marketing' | 'technical' | 'financial' | 'staffing' | 'vendor'
}

interface Staff {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  status: 'confirmed' | 'pending' | 'declined'
  arrival_time?: string
  departure_time?: string
}

interface Vendor {
  id: string
  name: string
  type: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  status: 'confirmed' | 'pending' | 'declined'
  arrival_time?: string
  departure_time?: string
  requirements?: string
}

export default function EventManagementPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  // State management
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Quick actions state
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false)
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false)
  const [showTicketsDialog, setShowTicketsDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  
  // Edit event state
  const [editForm, setEditForm] = useState<Partial<Event>>({})
  
  // Event data state
  const [tasks, setTasks] = useState<Task[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [ticketSales, setTicketSales] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch event details
        const response = await fetch(`/api/events/${eventId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch event data')
        }
        
        const data = await response.json()
        setEvent(data.event)
        setEditForm(data.event) // Initialize edit form with current event data
        
        // In a real app, you would fetch related data here
        // For now, we'll use mock data
        setTasks(mockTasks)
        setStaff(mockStaff)
        setVendors(mockVendors)
        setTicketSales(mockTicketSales)
        setExpenses(mockExpenses)
        setNotifications(mockNotifications)
        
      } catch (error) {
        console.error('Error fetching event data:', error)
        toast.error("Failed to load event data")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  // Quick action handlers
  const handleAddTask = () => {
    setActiveTab('tasks')
    setShowAddTaskDialog(true)
  }

  const handleManageStaff = () => {
    setActiveTab('staff')
    setShowAddStaffDialog(true)
  }

  const handleAddVendor = () => {
    setActiveTab('vendors')
    setShowAddVendorDialog(true)
  }

  const handleViewTickets = () => {
    setActiveTab('tickets')
    setShowTicketsDialog(true)
  }

  const handleShare = () => {
    setShowShareDialog(true)
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const handleDuplicateEvent = async () => {
    if (!event) return
    
    try {
      const duplicateData = {
        ...event,
        name: `${event.name} (Copy)`,
        status: 'scheduled' as const,
        tickets_sold: 0,
        actual_revenue: 0
      }
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      })
      
      if (!response.ok) throw new Error('Failed to duplicate event')
      
      const newEvent = await response.json()
      toast.success("Event duplicated successfully")
      router.push(`/admin/dashboard/events/${newEvent.event.id}`)
    } catch (error) {
      toast.error("Failed to duplicate event")
    }
  }

  const handleSaveEvent = async () => {
    if (!event) return
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      
      if (!response.ok) throw new Error('Failed to update event')
      
      const updatedEvent = await response.json()
      setEvent(updatedEvent.event)
      setIsEditing(false)
      toast.success("Event updated successfully")
    } catch (error) {
      toast.error("Failed to update event")
    }
  }

  const handleStatusChange = async (newStatus: Event['status']) => {
    if (!event) return
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update status')
      
      setEvent({ ...event, status: newStatus })
      toast.success(`Event status changed to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update event status")
    }
  }

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete event')
      
      toast.success("Event deleted successfully")
      router.push('/admin/dashboard/events')
    } catch (error) {
      toast.error("Failed to delete event")
    }
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="h-64 bg-slate-800 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-slate-800 rounded"></div>
              <div className="h-32 bg-slate-800 rounded"></div>
              <div className="h-32 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-slate-400 mb-6">The event you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/admin/dashboard/events')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const daysUntilEvent = differenceInDays(new Date(event.event_date), new Date())
  const ticketSalesPercentage = event.capacity > 0 ? (event.tickets_sold / event.capacity) * 100 : 0
  const revenuePercentage = event.expected_revenue > 0 ? (event.actual_revenue / event.expected_revenue) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin/dashboard/events')}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{event.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-slate-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(event.event_date), 'MMM dd, yyyy')}
                  {event.event_time && ` at ${event.event_time}`}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.venue_name}
                </div>
                <Badge className={getStatusColor(event.status)}>
                  {event.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Settings className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicateEvent}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Event
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-400 focus:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Days Until Event</p>
                  <p className="text-2xl font-bold text-white">{daysUntilEvent}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Ticket Sales</p>
                  <p className="text-2xl font-bold text-white">{event.tickets_sold.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">of {event.capacity.toLocaleString()}</p>
                </div>
                <Ticket className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Revenue</p>
                  <p className="text-2xl font-bold text-white">${event.actual_revenue.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">of ${event.expected_revenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Staff</p>
                  <p className="text-2xl font-bold text-white">{staff.length}</p>
                  <p className="text-sm text-slate-400">Confirmed</p>
                </div>
                <Users2 className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-11 bg-slate-800/50 border-slate-700/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600">Tasks</TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-purple-600">Staff</TabsTrigger>
            <TabsTrigger value="vendors" className="data-[state=active]:bg-purple-600">Vendors</TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-purple-600">Tickets</TabsTrigger>
            <TabsTrigger value="finances" className="data-[state=active]:bg-purple-600">Finances</TabsTrigger>
            <TabsTrigger value="logistics" className="data-[state=active]:bg-purple-600">Logistics</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">Analytics</TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-purple-600">Locations</TabsTrigger>
            <TabsTrigger value="participants" className="data-[state=active]:bg-purple-600">Participants</TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-purple-600">Access</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Event Details */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-slate-400">Description</Label>
                      <p className="text-white mt-1">{event.description || 'No description provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400">Venue</Label>
                        <p className="text-white mt-1">{event.venue_name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Address</Label>
                        <p className="text-white mt-1">{event.venue_address || 'No address provided'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Doors Open</Label>
                        <p className="text-white mt-1">{event.doors_open || 'TBD'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Duration</Label>
                        <p className="text-white mt-1">{event.duration_minutes ? `${event.duration_minutes} minutes` : 'TBD'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Tracking */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Progress Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-400">Ticket Sales Progress</Label>
                        <span className="text-white">{ticketSalesPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={ticketSalesPercentage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-slate-400">Revenue Progress</Label>
                        <span className="text-white">{revenuePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={revenuePercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" onClick={handleAddTask}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={handleManageStaff}>
                      <Users2 className="mr-2 h-4 w-4" />
                      Manage Staff
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={handleAddVendor}>
                      <Truck className="mr-2 h-4 w-4" />
                      Add Vendor
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={handleViewTickets}>
                      <Ticket className="mr-2 h-4 w-4" />
                      View Tickets
                    </Button>
                    <Separator className="bg-slate-700" />
                    <EventJobPosting
                      eventId={eventId}
                      eventName={event.name}
                      eventDate={event.event_date}
                      eventLocation={event.venue_name}
                      onJobPosted={(job) => {
                        toast.success(`Job "${job.title}" posted successfully!`)
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Status Management */}
                <Card className="bg-slate-900/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Status Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={event.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <EventTaskManager
              eventId={eventId}
              tasks={tasks}
              onTasksUpdate={setTasks}
            />
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Event Staff</h2>
                <p className="text-slate-400">Manage staff and post jobs for this event</p>
              </div>
              <EventJobPosting
                eventId={eventId}
                eventName={event.name}
                eventDate={event.event_date}
                eventLocation={event.venue_name}
                onJobPosted={(job) => {
                  toast.success(`Job "${job.title}" posted successfully!`)
                }}
              />
            </div>
            <EventStaffManager
              eventId={eventId}
              staff={staff}
              onStaffUpdate={setStaff}
            />
            
            <Separator className="bg-slate-700" />
            
            <EventJobsList eventId={eventId} />
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <EventVendorRequests eventId={eventId} />
            <EventVendorManager
              eventId={eventId}
              vendors={vendors}
              onVendorsUpdate={setVendors}
            />
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Ticket Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white">{event.tickets_sold.toLocaleString()}</h3>
                    <p className="text-slate-400">Tickets Sold</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white">${event.actual_revenue.toLocaleString()}</h3>
                    <p className="text-slate-400">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white">{ticketSalesPercentage.toFixed(1)}%</h3>
                    <p className="text-slate-400">Capacity Filled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finances Tab */}
          <TabsContent value="finances" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-400">${event.actual_revenue.toLocaleString()}</h3>
                    <p className="text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-red-400">${event.expenses.toLocaleString()}</h3>
                    <p className="text-slate-400">Expenses</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-400">${(event.actual_revenue - event.expenses).toLocaleString()}</h3>
                    <p className="text-slate-400">Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Logistics & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-400">Sound Requirements</Label>
                    <p className="text-white mt-1">{event.sound_requirements || 'No specific requirements'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Lighting Requirements</Label>
                    <p className="text-white mt-1">{event.lighting_requirements || 'No specific requirements'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Stage Requirements</Label>
                    <p className="text-white mt-1">{event.stage_requirements || 'No specific requirements'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Special Requirements</Label>
                    <p className="text-white mt-1">{event.special_requirements || 'No special requirements'}</p>
                  </div>
                </div>
                
                <Separator className="bg-slate-700" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-400">Load-in Time</Label>
                    <p className="text-white mt-1">{event.load_in_time || 'TBD'}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Sound Check Time</Label>
                    <p className="text-white mt-1">{event.sound_check_time || 'TBD'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Event Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Analytics Coming Soon</h3>
                  <p className="text-slate-400">Detailed analytics and reporting features will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <EventLocationsTab eventId={eventId} />
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <EventParticipantsTab eventId={eventId} />
          </TabsContent>

          {/* Access & Audit Tab */}
          <TabsContent value="access" className="space-y-6">
            <EntityAccessAudit entityType="Event" entityId={eventId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Event</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update event details and information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Event Name</Label>
                <Input
                  id="name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="venue" className="text-slate-300">Venue Name</Label>
                <Input
                  id="venue"
                  value={editForm.venue_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, venue_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-slate-300">Event Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editForm.event_date || ''}
                  onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-slate-300">Event Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={editForm.event_time || ''}
                  onChange={(e) => setEditForm({ ...editForm, event_time: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="text-slate-300">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={editForm.capacity || 0}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="ticket_price" className="text-slate-300">Ticket Price</Label>
                <Input
                  id="ticket_price"
                  type="number"
                  step="0.01"
                  value={editForm.ticket_price || 0}
                  onChange={(e) => setEditForm({ ...editForm, ticket_price: parseFloat(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEvent} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Share Event</DialogTitle>
            <DialogDescription className="text-slate-400">
              Share this event with your team or external stakeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Event Link</Label>
              <div className="flex space-x-2">
                <Input
                  value={`${window.location.origin}/admin/dashboard/events/${eventId}`}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/admin/dashboard/events/${eventId}`)
                    toast.success("Link copied to clipboard")
                  }}
                  className="border-slate-600 text-slate-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Share via Email</Label>
              <Input
                placeholder="Enter email addresses"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="border-slate-600 text-slate-300">
              Close
            </Button>
            <Button onClick={() => {
              toast.success("Event shared successfully")
              setShowShareDialog(false)
            }} className="bg-purple-600 hover:bg-purple-700">
              Share Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Export Event Data</DialogTitle>
            <DialogDescription className="text-slate-400">
              Export event information in various formats.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-slate-600 text-slate-300 h-20 flex flex-col items-center justify-center">
                <FileText className="h-6 w-6 mb-2" />
                PDF Report
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 h-20 flex flex-col items-center justify-center">
                <BarChart3 className="h-6 w-6 mb-2" />
                Excel Data
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-slate-600 text-slate-300 h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                Calendar Event
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                Staff List
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success("Event data exported successfully")
              setShowExportDialog(false)
            }} className="bg-purple-600 hover:bg-purple-700">
              Export All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tickets Dialog */}
      <Dialog open={showTicketsDialog} onOpenChange={setShowTicketsDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Ticket Management</DialogTitle>
            <DialogDescription className="text-slate-400">
              View and manage ticket sales for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">{event?.tickets_sold || 0}</p>
                  <p className="text-sm text-slate-400">Tickets Sold</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">{event?.capacity || 0}</p>
                  <p className="text-sm text-slate-400">Total Capacity</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">${event?.actual_revenue || 0}</p>
                  <p className="text-sm text-slate-400">Revenue</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Label className="text-slate-300">Sales Progress</Label>
              <Progress value={ticketSalesPercentage} className="h-3 mt-2" />
              <p className="text-sm text-slate-400 mt-1">{ticketSalesPercentage.toFixed(1)}% sold</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketsDialog(false)} className="border-slate-600 text-slate-300">
              Close
            </Button>
            <Button onClick={() => {
              toast.success("Ticket data updated")
              setShowTicketsDialog(false)
            }} className="bg-purple-600 hover:bg-purple-700">
              Update Sales
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Venue Setup',
    description: 'Coordinate with venue for setup requirements',
    status: 'completed',
    priority: 'high',
    category: 'logistics',
    due_date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sound Check',
    description: 'Schedule and conduct sound check',
    status: 'in_progress',
    priority: 'medium',
    category: 'technical',
    due_date: '2024-01-20'
  },
  {
    id: '3',
    name: 'Staff Briefing',
    description: 'Brief all staff on event procedures',
    status: 'not_started',
    priority: 'high',
    category: 'staffing',
    due_date: '2024-01-25'
  }
]

const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Event Manager',
    email: 'john@example.com',
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Technical Director',
    email: 'sarah@example.com',
    status: 'confirmed'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    role: 'Security Lead',
    email: 'mike@example.com',
    status: 'pending'
  }
]

const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'SoundMasters Pro',
    type: 'Audio Equipment',
    contact_name: 'David Brown',
    contact_email: 'david@soundmasters.com',
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'LightWorks',
    type: 'Lighting',
    contact_name: 'Lisa Chen',
    contact_email: 'lisa@lightworks.com',
    status: 'confirmed'
  },
  {
    id: '3',
    name: 'FoodTruck Collective',
    type: 'Food & Beverage',
    contact_name: 'Tom Garcia',
    contact_email: 'tom@foodtruck.com',
    status: 'pending'
  }
]

const mockTicketSales: any[] = []
const mockExpenses: any[] = []
const mockNotifications: any[] = []
