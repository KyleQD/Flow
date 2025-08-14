"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Truck, 
  Music, 
  Building, 
  Target, 
  Settings, 
  Plus, 
  Edit, 
  Eye, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Star, 
  Award, 
  Crown, 
  Zap, 
  Globe, 
  Plane, 
  Car, 
  Hotel, 
  Coffee, 
  Utensils, 
  Headphones, 
  Mic, 
  Volume2, 
  Camera, 
  Video, 
  Wifi, 
  Shield, 
  Heart, 
  Share, 
  Bookmark, 
  MessageSquare, 
  Bell, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  RotateCcw, 
  FileText, 
  Map, 
  Route, 
  Navigation, 
  Compass, 
  Flag, 
  Receipt,
  Trash2,
  Copy,
  ExternalLink,
  MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"
import { TourEventManager } from "@/components/admin/tour-event-manager"
import { TourTeamManager } from "@/components/admin/tour-team-manager"
import { TourVendorManager } from "@/components/admin/tour-vendor-manager"
import { TourJobPosting } from "@/components/admin/tour-job-posting"
import { TourJobsList } from "@/components/admin/tour-jobs-list"

interface Tour {
  id: string
  name: string
  description?: string
  artist_id: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  total_shows: number
  completed_shows: number
  expected_revenue: number
  actual_revenue: number
  expenses: number
  budget: number
  crew_size: number
  transportation: string
  accommodation: string
  equipment_requirements: string
  special_requirements?: string
  created_at: string
  updated_at: string
}

interface Event {
  id: string
  name: string
  description?: string
  tour_id: string
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
}

interface TourMember {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  status: 'confirmed' | 'pending' | 'declined'
  arrival_date?: string
  departure_date?: string
  responsibilities?: string
}

interface TourVendor {
  id: string
  name: string
  type: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  status: 'confirmed' | 'pending' | 'declined'
  services: string[]
  contract_amount?: number
  payment_status: 'paid' | 'partial' | 'pending'
  notes?: string
}

export default function TourManagementPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tourId = params.id as string

  const [tour, setTour] = useState<Tour | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<TourMember[]>([])
  const [vendors, setVendors] = useState<TourVendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Tour>>({})
  const initialEventId = (searchParams.get('eventId') || undefined) as string | undefined

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  // Mock data for development
  const mockTour: Tour = {
    id: tourId,
    name: "Summer Electronic Tour 2025",
    description: "A nationwide electronic music tour featuring the best DJs and producers in the industry.",
    artist_id: "artist_123",
    status: "active",
    start_date: "2025-06-01",
    end_date: "2025-08-15",
    total_shows: 12,
    completed_shows: 4,
    expected_revenue: 500000,
    actual_revenue: 485000,
    expenses: 285000,
    budget: 350000,
    crew_size: 12,
    transportation: "Tour Bus + Equipment Truck",
    accommodation: "Hotels (4-star)",
    equipment_requirements: "Full Production Setup",
    special_requirements: "VIP meet & greet packages",
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2024-12-15T00:00:00Z"
  }

  const mockEvents: Event[] = [
    {
      id: "1",
      name: "Summer Electronic Tour - New York",
      tour_id: tourId,
      venue_name: "Madison Square Garden",
      venue_address: "4 Pennsylvania Plaza, New York, NY 10001",
      event_date: "2025-06-15",
      event_time: "20:00",
      doors_open: "19:00",
      duration_minutes: 180,
      status: "completed",
      capacity: 20000,
      tickets_sold: 18500,
      ticket_price: 85,
      vip_price: 250,
      expected_revenue: 85000,
      actual_revenue: 85000,
      expenses: 45000,
      venue_contact_name: "John Smith",
      venue_contact_email: "john.smith@msg.com",
      venue_contact_phone: "(555) 123-4567",
      sound_requirements: "Full PA system with subwoofers",
      lighting_requirements: "LED wall and moving lights",
      stage_requirements: "Main stage with risers",
      load_in_time: "14:00",
      sound_check_time: "16:00"
    },
    {
      id: "2",
      name: "Summer Electronic Tour - Los Angeles",
      tour_id: tourId,
      venue_name: "Hollywood Bowl",
      venue_address: "2301 N Highland Ave, Los Angeles, CA 90068",
      event_date: "2025-06-22",
      event_time: "19:30",
      doors_open: "18:30",
      duration_minutes: 180,
      status: "completed",
      capacity: 15000,
      tickets_sold: 14200,
      ticket_price: 95,
      vip_price: 300,
      expected_revenue: 75000,
      actual_revenue: 75000,
      expenses: 38000,
      venue_contact_name: "Sarah Johnson",
      venue_contact_email: "sarah.johnson@hollywoodbowl.com",
      venue_contact_phone: "(555) 987-6543",
      sound_requirements: "Outdoor PA system",
      lighting_requirements: "Concert lighting setup",
      stage_requirements: "Main stage with canopy",
      load_in_time: "12:00",
      sound_check_time: "15:00"
    }
  ]

  const mockMembers: TourMember[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Tour Manager",
      email: "sarah@email.com",
      phone: "(555) 123-4567",
      status: "confirmed",
      arrival_date: "2025-05-28",
      departure_date: "2025-08-20",
      responsibilities: "Overall tour coordination, scheduling, and logistics"
    },
    {
      id: "2",
      name: "Mike Chen",
      role: "Sound Engineer",
      email: "mike@email.com",
      phone: "(555) 234-5678",
      status: "confirmed",
      arrival_date: "2025-05-30",
      departure_date: "2025-08-18",
      responsibilities: "Sound system setup, mixing, and technical coordination"
    },
    {
      id: "3",
      name: "Lisa Rodriguez",
      role: "Lighting Designer",
      email: "lisa@email.com",
      phone: "(555) 345-6789",
      status: "confirmed",
      arrival_date: "2025-05-29",
      departure_date: "2025-08-19",
      responsibilities: "Lighting design, programming, and operation"
    }
  ]

  const mockVendors: TourVendor[] = [
    {
      id: "1",
      name: "Elite Transportation",
      type: "Transportation",
      contact_name: "David Wilson",
      contact_email: "david@elitetransport.com",
      contact_phone: "(555) 456-7890",
      status: "confirmed",
      services: ["Tour Bus", "Equipment Truck", "Driver Services"],
      contract_amount: 45000,
      payment_status: "partial"
    },
    {
      id: "2",
      name: "Premium Catering Co.",
      type: "Catering",
      contact_name: "Maria Garcia",
      contact_email: "maria@premiumcatering.com",
      contact_phone: "(555) 567-8901",
      status: "confirmed",
      services: ["Crew Meals", "VIP Catering", "Backstage Refreshments"],
      contract_amount: 25000,
      payment_status: "paid"
    }
  ]

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch tour data
        const tourResponse = await fetch(`/api/tours/${tourId}`)
        if (tourResponse.ok) {
          const tourData = await tourResponse.json()
          setTour(tourData)
          setEditForm(tourData)
        } else {
          // Use mock data for development
          setTour(mockTour)
          setEditForm(mockTour)
        }

          // Fetch events for this tour
  const eventsResponse = await fetch(`/api/tours/${tourId}/events`)
  if (eventsResponse.ok) {
    const eventsData = await eventsResponse.json()
    setEvents(eventsData.events || [])
  } else {
    setEvents(mockEvents)
  }

  // Fetch team members for this tour
  const teamResponse = await fetch(`/api/tours/${tourId}/team`)
  if (teamResponse.ok) {
    const teamData = await teamResponse.json()
    setMembers(teamData.team_members || [])
  } else {
    setMembers(mockMembers)
  }

  // Fetch vendors for this tour
  const vendorsResponse = await fetch(`/api/tours/${tourId}/vendors`)
  if (vendorsResponse.ok) {
    const vendorsData = await vendorsResponse.json()
    setVendors(vendorsData.vendors || [])
  } else {
    setVendors(mockVendors)
  }

      } catch (error) {
        console.error('Error fetching tour data:', error)
        toast.error('Failed to fetch tour data')
        
        // Fallback to mock data
        setTour(mockTour)
        setEditForm(mockTour)
        setEvents(mockEvents)
        setMembers(mockMembers)
        setVendors(mockVendors)
      } finally {
        setIsLoading(false)
      }
    }

    if (tourId) {
      fetchTourData()
    }
  }, [tourId])

  const handleStatusChange = async (newStatus: Tour['status']) => {
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setTour(prev => prev ? { ...prev, status: newStatus } : null)
        toast.success(`Tour status updated to ${newStatus}`)
      } else {
        throw new Error('Failed to update tour status')
      }
    } catch (error) {
      console.error('Error updating tour status:', error)
      toast.error('Failed to update tour status')
    }
  }

  const handleDeleteTour = async () => {
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Tour deleted successfully')
        router.push('/admin/dashboard/tours')
      } else {
        throw new Error('Failed to delete tour')
      }
    } catch (error) {
      console.error('Error deleting tour:', error)
      toast.error('Failed to delete tour')
    }
  }

  const handleSaveTour = async () => {
    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedTour = await response.json()
        setTour(updatedTour)
        setIsEditing(false)
        toast.success('Tour updated successfully')
      } else {
        throw new Error('Failed to update tour')
      }
    } catch (error) {
      console.error('Error updating tour:', error)
      toast.error('Failed to update tour')
    }
  }



  const handleShare = () => {
    setShowShareDialog(true)
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const handleDuplicateTour = async () => {
    try {
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tour,
          name: `${tour?.name} (Copy)`,
          status: 'planning'
        })
      })

      if (response.ok) {
        const newTour = await response.json()
        toast.success('Tour duplicated successfully')
        router.push(`/admin/dashboard/tours/${newTour.id}`)
      } else {
        throw new Error('Failed to duplicate tour')
      }
    } catch (error) {
      console.error('Error duplicating tour:', error)
      toast.error('Failed to duplicate tour')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'planning': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />
      case 'planning': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <StopCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
        <div className="container mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Tour Not Found</h1>
          <p className="text-slate-400 mb-6">The tour you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/admin/dashboard/tours')}>
            Back to Tours
          </Button>
        </div>
      </div>
    )
  }

  // Safety check to ensure all required fields exist
  const safeTour = {
    ...tour,
    total_shows: tour.total_shows || 0,
    completed_shows: tour.completed_shows || 0,
    actual_revenue: tour.actual_revenue || 0,
    expected_revenue: tour.expected_revenue || 0,
    expenses: tour.expenses || 0,
    budget: tour.budget || 0,
    crew_size: tour.crew_size || 0
  }

  const progressPercentage = safeTour.total_shows > 0 ? (safeTour.completed_shows / safeTour.total_shows) * 100 : 0
  const profit = safeTour.actual_revenue - safeTour.expenses
  const budgetRemaining = safeTour.budget - safeTour.expenses

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/dashboard/tours')}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Tours
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{safeTour.name}</h1>
              <p className="text-slate-400">Tour Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(safeTour.status)}>
              {getStatusIcon(safeTour.status)}
              <span className="ml-1 capitalize">{safeTour.status}</span>
            </Badge>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="border-slate-600 text-slate-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-slate-600 text-slate-300"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-slate-600 text-slate-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleDuplicateTour}
              className="border-slate-600 text-slate-300"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Progress</p>
                      <p className="text-2xl font-bold text-white">{safeTour.completed_shows}/{safeTour.total_shows}</p>
                      <p className="text-sm text-slate-400">Shows Completed</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500/20">
                      <Music className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Revenue</p>
                      <p className="text-2xl font-bold text-green-400">${safeTour.actual_revenue.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">of ${safeTour.expected_revenue.toLocaleString()}</p>
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
                  <p className="text-sm text-slate-400">Profit</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${profit.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">Net Income</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Crew</p>
                      <p className="text-2xl font-bold text-white">{safeTour.crew_size}</p>
                      <p className="text-sm text-slate-400">Team Members</p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('events')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Manage Events
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('team')}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('vendors')}>
                      <Truck className="mr-2 h-4 w-4" />
                      Manage Vendors
                    </Button>
                                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('finances')}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      View Finances
                    </Button>
                    <Separator className="bg-slate-700" />
                    <TourJobPosting
                      tourId={tourId}
                      tourName={safeTour.name}
                      tourStartDate={safeTour.start_date}
                      tourEndDate={safeTour.end_date}
                      onJobPosted={(job) => {
                        toast.success(`Job "${job.title}" posted successfully!`)
                      }}
                    />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 p-1 grid grid-cols-7 w-full">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events ({events.length})</TabsTrigger>
            <TabsTrigger value="team" className="text-xs">Team ({members.length})</TabsTrigger>
            <TabsTrigger value="vendors" className="text-xs">Vendors ({vendors.length})</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
            <TabsTrigger value="finances" className="text-xs">Finances</TabsTrigger>
            <TabsTrigger value="logistics" className="text-xs">Logistics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Tour Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-400">Description</Label>
                    <p className="text-white mt-1">{safeTour.description || 'No description provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400">Start Date</Label>
                      <p className="text-white mt-1">{new Date(safeTour.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">End Date</Label>
                      <p className="text-white mt-1">{new Date(safeTour.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400">Duration</Label>
                      <p className="text-white mt-1">
                        {Math.ceil((new Date(safeTour.end_date).getTime() - new Date(safeTour.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Status</Label>
                      <Badge className={`mt-1 ${getStatusColor(safeTour.status)}`}>
                        {getStatusIcon(safeTour.status)}
                        <span className="ml-1 capitalize">{safeTour.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400">Expected Revenue</Label>
                      <p className="text-white mt-1">${safeTour.expected_revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Actual Revenue</Label>
                      <p className="text-green-400 mt-1">${safeTour.actual_revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400">Expenses</Label>
                      <p className="text-red-400 mt-1">${safeTour.expenses.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Budget</Label>
                      <p className="text-white mt-1">${safeTour.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400">Profit</Label>
                      <p className={`mt-1 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${profit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-400">Budget Remaining</Label>
                      <p className={`mt-1 ${budgetRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${budgetRemaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="text-sm text-slate-400">Select an event below to view or edit. If you arrived here from the calendar, the targeted event opens automatically.</div>
            <TourEventManager
              tourId={tourId}
              events={events}
              onEventsUpdate={setEvents}
              initialEventId={initialEventId}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <TourTeamManager
              tourId={tourId}
              members={members}
              onMembersUpdate={setMembers}
            />
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <TourVendorManager
              tourId={tourId}
              vendors={vendors}
              onVendorsUpdate={setVendors}
            />
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Tour Jobs</h2>
                <p className="text-slate-400">Post jobs to find crew and team members for this tour</p>
              </div>
              <TourJobPosting
                tourId={tourId}
                tourName={safeTour.name}
                tourStartDate={safeTour.start_date}
                tourEndDate={safeTour.end_date}
                onJobPosted={(job) => {
                  toast.success(`Job "${job.title}" posted successfully!`)
                }}
              />
            </div>
            <TourJobsList tourId={tourId} />
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
                    <h3 className="text-2xl font-bold text-green-400">${safeTour.actual_revenue.toLocaleString()}</h3>
                    <p className="text-slate-400">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-red-400">${safeTour.expenses.toLocaleString()}</h3>
                    <p className="text-slate-400">Total Expenses</p>
                  </div>
                  <div className="text-center">
                    <h3 className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${profit.toLocaleString()}
                    </h3>
                    <p className="text-slate-400">Net Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Transportation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{safeTour.transportation || 'Not specified'}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Accommodation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{safeTour.accommodation || 'Not specified'}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Equipment Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{safeTour.equipment_requirements || 'Not specified'}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Special Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{safeTour.special_requirements || 'No special requirements'}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Tour</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Are you sure you want to delete this tour? This action cannot be undone and will also delete all associated events.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTour} className="bg-red-600 hover:bg-red-700">
                Delete Tour
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Share Tour</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Tour Link</Label>
                <div className="flex space-x-2 mt-1">
                  <Input 
                    value={`${window.location.origin}/admin/dashboard/tours/${tourId}`}
                    readOnly
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Export Tour Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-300">Choose what data to export:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="tour-info" defaultChecked />
                  <Label htmlFor="tour-info" className="text-slate-300">Tour Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="events" defaultChecked />
                  <Label htmlFor="events" className="text-slate-300">Events</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="team" defaultChecked />
                  <Label htmlFor="team" className="text-slate-300">Team Members</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="vendors" defaultChecked />
                  <Label htmlFor="vendors" className="text-slate-300">Vendors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="finances" defaultChecked />
                  <Label htmlFor="finances" className="text-slate-300">Financial Data</Label>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 