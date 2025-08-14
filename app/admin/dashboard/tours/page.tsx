"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CreateTourForm } from "@/components/admin/create-tour-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  Truck,
  Music,
  Building,
  DollarSign,
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
  MapPin as LocationIcon,
  Receipt
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameMonth,
  isToday
} from "date-fns"
import Link from "next/link"

interface Tour {
  id: string
  name: string
  artist: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  totalShows: number
  completedShows: number
  revenue: number
  expenses: number
  profit: number
  venues: Array<{
    id: string
    name: string
    city: string
    state: string
    date: string
    capacity: number
    ticketsSold: number
    revenue: number
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  }>
  logistics: {
    transportation: string
    accommodation: string
    equipment: string
    crew: number
    budget: number
    spent: number
  }
  team: Array<{
    id: string
    name: string
    role: string
    contact: string
    status: 'confirmed' | 'pending' | 'declined'
  }>
}

export default function ToursPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isCreateTourOpen, setIsCreateTourOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check for success message from tour planner
  useEffect(() => {
    const published = searchParams.get('published')
    if (published === 'true') {
      toast({
        title: "🎉 Tour Published Successfully!",
        description: "Your tour is now live and ready to go!",
      })
      // Clean up the URL
      router.replace('/admin/dashboard/tours')
    }
  }, [searchParams, router])

  // Fetch tours from API
  const fetchTours = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
      
      const response = await fetch(`/api/tours?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tours')
      }
      
      const data = await response.json()
      setTours(data.tours || [])
    } catch (error) {
      console.error('Error fetching tours:', error)
      setTours([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTours()
  }, [filterStatus])

  const handleTourCreated = () => {
    setIsCreateTourOpen(false)
    fetchTours() // Refresh the tours list
  }

  // Mock data for fallback/development
  const mockTours = [
    {
      id: '1',
      name: 'Summer Electronic Tour 2025',
      artist: 'DJ Luna',
              status: 'active' as const,
      startDate: '2025-06-01',
      endDate: '2025-08-15',
      totalShows: 12,
      completedShows: 4,
      revenue: 485000,
      expenses: 285000,
      profit: 200000,
      venues: [
        {
          id: '1',
          name: 'Madison Square Garden',
          city: 'New York',
          state: 'NY',
          date: '2025-06-15',
          capacity: 20000,
          ticketsSold: 18500,
          revenue: 85000,
          status: 'completed'
        },
        {
          id: '2',
          name: 'Hollywood Bowl',
          city: 'Los Angeles',
          state: 'CA',
          date: '2025-06-22',
          capacity: 15000,
          ticketsSold: 14200,
          revenue: 75000,
          status: 'completed'
        },
        {
          id: '3',
          name: 'Red Rocks Amphitheatre',
          city: 'Denver',
          state: 'CO',
          date: '2025-06-29',
          capacity: 9500,
          ticketsSold: 9500,
          revenue: 65000,
          status: 'completed'
        },
        {
          id: '4',
          name: 'Austin City Limits',
          city: 'Austin',
          state: 'TX',
          date: '2025-07-06',
          capacity: 12000,
          ticketsSold: 11800,
          revenue: 68000,
          status: 'completed'
        },
        {
          id: '5',
          name: 'The Fillmore',
          city: 'San Francisco',
          state: 'CA',
          date: '2025-07-13',
          capacity: 8000,
          ticketsSold: 6500,
          revenue: 45000,
          status: 'confirmed'
        }
      ],
      logistics: {
        transportation: 'Tour Bus + Truck',
        accommodation: 'Hotels',
        equipment: 'Full Production',
        crew: 12,
        budget: 350000,
        spent: 185000
      },
      team: [
        { id: '1', name: 'Sarah Johnson', role: 'Tour Manager', contact: 'sarah@email.com', status: 'confirmed' },
        { id: '2', name: 'Mike Chen', role: 'Sound Engineer', contact: 'mike@email.com', status: 'confirmed' },
        { id: '3', name: 'Lisa Rodriguez', role: 'Lighting Designer', contact: 'lisa@email.com', status: 'confirmed' },
        { id: '4', name: 'David Kim', role: 'Stage Manager', contact: 'david@email.com', status: 'confirmed' }
      ]
    },
    {
      id: '2',
      name: 'Indie Rock Circuit 2025',
      artist: 'The Midnight Runners',
      status: 'planning',
      startDate: '2025-09-01',
      endDate: '2025-11-30',
      totalShows: 18,
      completedShows: 0,
      revenue: 0,
      expenses: 45000,
      profit: -45000,
      venues: [
        {
          id: '6',
          name: 'The Bowery Ballroom',
          city: 'New York',
          state: 'NY',
          date: '2025-09-05',
          capacity: 550,
          ticketsSold: 0,
          revenue: 0,
          status: 'scheduled'
        },
        {
          id: '7',
          name: 'The Troubadour',
          city: 'Los Angeles',
          state: 'CA',
          date: '2025-09-12',
          capacity: 500,
          ticketsSold: 0,
          revenue: 0,
          status: 'scheduled'
        }
      ],
      logistics: {
        transportation: 'Van',
        accommodation: 'Budget Hotels',
        equipment: 'Minimal Setup',
        crew: 4,
        budget: 125000,
        spent: 45000
      },
      team: [
        { id: '5', name: 'Alex Thompson', role: 'Tour Manager', contact: 'alex@email.com', status: 'confirmed' },
        { id: '6', name: 'Emma Davis', role: 'Sound Tech', contact: 'emma@email.com', status: 'pending' }
      ]
    },
    {
      id: '3',
      name: 'Jazz Festival Circuit',
      artist: 'Marcus Williams Quartet',
      status: 'completed',
      startDate: '2025-03-01',
      endDate: '2025-05-31',
      totalShows: 8,
      completedShows: 8,
      revenue: 180000,
      expenses: 85000,
      profit: 95000,
      venues: [
        {
          id: '8',
          name: 'Blue Note',
          city: 'New York',
          state: 'NY',
          date: '2025-03-15',
          capacity: 300,
          ticketsSold: 300,
          revenue: 25000,
          status: 'completed'
        }
      ],
      logistics: {
        transportation: 'Flights',
        accommodation: 'Mid-range Hotels',
        equipment: 'Acoustic Setup',
        crew: 3,
        budget: 95000,
        spent: 85000
      },
      team: [
        { id: '7', name: 'Jennifer Lee', role: 'Tour Manager', contact: 'jennifer@email.com', status: 'confirmed' }
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'planning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Calendar View for cross-tour events
  function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    })

    // Build events map by YYYY-MM-DD
    const eventsByDate: Record<string, Array<{ id: string; tourId: string; name: string; tourName: string; status: string }>> = {}

    for (const t of filteredTours as any[]) {
      const tourName = t.name
      const tourId = t.id
      const events = (t.events || t.venues || []) as any[]
      for (const e of events) {
        const dateStr = (e.event_date || e.date) as string | undefined
        if (!dateStr) continue
        const key = dateStr
        if (!eventsByDate[key]) eventsByDate[key] = []
        eventsByDate[key].push({
          id: e.id,
          tourId,
          name: e.name || e.venue_name || e.venue || 'Event',
          tourName,
          status: e.status || 'scheduled'
        })
      }
    }

    const monthLabel = format(currentMonth, 'MMMM yyyy')

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <div className="text-white font-semibold">{monthLabel}</div>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[key] || []
            const isCurrent = isSameMonth(d, currentMonth)
            const isCurrentDay = isToday(d)
            return (
              <div key={key} className={`${isCurrent ? 'bg-slate-900/40 border-slate-700/60' : 'bg-slate-900/20 border-slate-800/60'} ${isCurrentDay ? 'ring-1 ring-purple-500/60' : ''} min-h-28 rounded-lg border p-2 overflow-hidden`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`${isCurrent ? 'text-slate-300' : 'text-slate-600'} text-xs`}>{format(d, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-600/30 h-5 px-1 text-[10px]">{dayEvents.length}</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <button key={ev.id} onClick={() => router.push(`/admin/dashboard/tours/${ev.tourId}?tab=events&eventId=${ev.id}`)} className="w-full text-left truncate text-[11px] px-1 py-0.5 rounded bg-slate-800/70 text-slate-200 border border-slate-700/60 hover:bg-slate-700/70">
                      <span className="font-medium">{ev.name}</span>
                      <span className="text-slate-400"> • {ev.tourName}</span>
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[11px] text-slate-400">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Logistics status component for tours
  const TourLogisticsStatus = ({ tour }: { tour: any }) => {
    const calculateLogisticsProgress = () => {
      const logistics = tour.logistics || {}
      let completed = 0
      let total = 0
      
      if (logistics.transportation) { total++; if (logistics.transportation !== 'pending') completed++ }
      if (logistics.accommodation) { total++; if (logistics.accommodation !== 'pending') completed++ }
      if (logistics.equipment) { total++; if (logistics.equipment !== 'pending') completed++ }
      if (logistics.crew) { total++; if (logistics.crew > 0) completed++ }
      
      return total > 0 ? Math.round((completed / total) * 100) : 0
    }

    const progress = calculateLogisticsProgress()
    const status = progress === 100 ? 'Complete' : progress > 50 ? 'In Progress' : 'Not Started'

    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Logistics Status</span>
          <span className="text-sm font-bold text-white">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{status}</span>
          <Link href={`/admin/dashboard/logistics?tourId=${tour.id}`}>
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Target className="h-3 w-3 mr-1" />
              Manage
            </Button>
          </Link>
        </div>
        
        {/* Logistics breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Truck className="h-3 w-3 text-blue-400" />
            <span className="text-slate-400">Transport</span>
            <span className={`${tour.logistics?.transportation === 'confirmed' ? 'text-green-400' : 'text-slate-500'}`}>
              {tour.logistics?.transportation || 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Hotel className="h-3 w-3 text-green-400" />
            <span className="text-slate-400">Accommodation</span>
            <span className={`${tour.logistics?.accommodation === 'confirmed' ? 'text-green-400' : 'text-slate-500'}`}>
              {tour.logistics?.accommodation || 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Headphones className="h-3 w-3 text-purple-400" />
            <span className="text-slate-400">Equipment</span>
            <span className={`${tour.logistics?.equipment === 'confirmed' ? 'text-green-400' : 'text-slate-500'}`}>
              {tour.logistics?.equipment || 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 text-orange-400" />
            <span className="text-slate-400">Crew</span>
            <span className="text-white">{tour.logistics?.crew || 0}</span>
          </div>
        </div>
      </div>
    )
  }

  // Use real tours data, fallback to mock for empty state
  const displayTours = tours.length > 0 ? tours : (isLoading ? [] : mockTours as any)
  const filteredTours = (displayTours as any[]).filter((tour: any) => 
    filterStatus === 'all' || tour.status === filterStatus
  )

  const TourCard = ({ tour }: { tour: any }) => {
    // Safely extract values with fallbacks
    const revenue = tour.revenue || tour.expected_revenue || 0
    const expenses = tour.expenses || 0
    const profit = revenue - expenses
    const totalShows = tour.total_shows || tour.totalShows || 0
    const completedShows = tour.completed_shows || tour.completedShows || 0
    const crewSize = tour.crew_size || tour.logistics?.crew || 0
    const startDate = tour.start_date || tour.startDate
    const endDate = tour.end_date || tour.endDate
    const artist = tour.artist || tour.main_artist || 'Unknown Artist'
    const status = tour.status || 'planning'

    return (
      <Card className="bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg text-white">{tour.name}</CardTitle>
              <p className="text-sm text-slate-400">{artist}</p>
            </div>
            <Badge className={getStatusColor(status)}>
              {getStatusIcon(status)}
              <span className="ml-1 capitalize">{status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Duration</p>
              <p className="text-sm text-white">
                {startDate ? new Date(startDate).toLocaleDateString() : 'TBD'} - {endDate ? new Date(endDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Shows</p>
              <p className="text-sm text-white">{completedShows}/{totalShows}</p>
            </div>
          </div>

          {totalShows > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Progress</span>
                <span className="text-xs text-white">{Math.round((completedShows / totalShows) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedShows / totalShows) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="text-sm font-semibold text-green-400">${revenue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Expenses</p>
              <p className="text-sm font-semibold text-red-400">${expenses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Profit</p>
              <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${profit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">{crewSize} crew</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push(`/admin/dashboard/tours/${tour.id}`)}
                className="text-slate-400 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Manage Tour
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Logistics Status */}
          <TourLogisticsStatus tour={tour} />
        </CardContent>
      </Card>
    )
  }

  const TourDetailModal = ({ tour, onClose }: { tour: any; onClose: () => void }) => {
    // Safely extract values with fallbacks
    const revenue = tour.revenue || tour.expected_revenue || 0
    const expenses = tour.expenses || 0
    const profit = revenue - expenses
    const totalShows = tour.total_shows || tour.totalShows || 0
    const completedShows = tour.completed_shows || tour.completedShows || 0
    const crewSize = tour.crew_size || tour.logistics?.crew || 0
    const startDate = tour.start_date || tour.startDate
    const endDate = tour.end_date || tour.endDate
    const artist = tour.artist || tour.main_artist || 'Unknown Artist'
    const status = tour.status || 'planning'
    const venues = tour.venues || tour.events || []
    const team = tour.team || []
    const logistics = tour.logistics || {
      transportation: tour.transportation || 'TBD',
      accommodation: tour.accommodation || 'TBD',
      equipment: tour.equipment_requirements || 'TBD',
      crew: crewSize,
      budget: tour.budget || 0,
      spent: expenses
    }

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl text-white">{tour.name}</DialogTitle>
                <p className="text-slate-400">{artist}</p>
              </div>
              <Badge className={getStatusColor(status)}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-slate-800/50 p-1 grid grid-cols-5 w-full">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="venues" className="text-xs">Venues ({venues.length})</TabsTrigger>
              <TabsTrigger value="logistics" className="text-xs">Logistics</TabsTrigger>
              <TabsTrigger value="team" className="text-xs">Team ({team.length})</TabsTrigger>
              <TabsTrigger value="finances" className="text-xs">Finances</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <CalendarIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Duration</p>
                    <p className="text-lg font-semibold text-white">
                      {startDate ? new Date(startDate).toLocaleDateString() : 'TBD'} - {endDate ? new Date(endDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Shows</p>
                    <p className="text-lg font-semibold text-white">{completedShows}/{totalShows}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Crew</p>
                    <p className="text-lg font-semibold text-white">{crewSize}</p>
                  </CardContent>
                </Card>
              </div>

              {tour.description && (
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{tour.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="venues" className="space-y-6">
              <div className="space-y-4">
                {venues.length > 0 ? venues.map((venue: any) => (
                  <Card key={venue.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{venue.name || venue.venue_name}</h4>
                            <p className="text-sm text-slate-400">{venue.city || venue.venue_address}</p>
                            <p className="text-sm text-slate-500">{venue.date || venue.event_date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(venue.status || 'scheduled')}>
                            {venue.status || 'scheduled'}
                          </Badge>
                          {venue.revenue && (
                            <p className="text-sm text-green-400 mt-1">${venue.revenue.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No venues added yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Transportation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{logistics.transportation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Accommodation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{logistics.accommodation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Equipment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{logistics.equipment}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Budget</span>
                      <span className="text-white">${logistics.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spent</span>
                      <span className="text-red-400">${logistics.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Remaining</span>
                      <span className="text-green-400">${(logistics.budget - logistics.spent).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="space-y-4">
                {team.length > 0 ? team.map((member: any) => (
                  <Card key={member.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{member.name || member.contact_email}</h4>
                            <p className="text-sm text-slate-400">{member.role}</p>
                            <p className="text-sm text-slate-500">{member.contact || member.contact_email}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(member.status || 'pending')}>
                          {member.status || 'pending'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No team members added yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="finances" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Revenue</p>
                    <p className="text-2xl font-bold text-green-400">${revenue.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Receipt className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Expenses</p>
                    <p className="text-2xl font-bold text-red-400">${expenses.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Profit</p>
                    <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${profit.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Tour Management
            </h1>
            <p className="text-slate-400 mt-2">
              Plan, coordinate, and track all your tour operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={() => router.push("/admin/dashboard/tours/planner")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Tours</p>
                  <p className="text-2xl font-bold text-white">
                    {displayTours.filter((t: any) => t.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20">
                  <PlayCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Shows</p>
                  <p className="text-2xl font-bold text-white">
                    {displayTours.reduce((sum: number, tour: any) => sum + (tour.total_shows || tour.totalShows || 0), 0)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Music className="h-6 w-6 text-blue-400" />
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
                    ${displayTours.reduce((sum: number, tour: any) => sum + (tour.revenue || 0), 0).toLocaleString()}
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
                  <p className="text-sm text-slate-400">Total Profit</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ${displayTours.reduce((sum: number, tour: any) => sum + (tour.profit || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Tour Form Modal */}
        <AnimatePresence>
          {isCreateTourOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsCreateTourOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <CreateTourForm
                  onSuccess={handleTourCreated}
                  onCancel={() => setIsCreateTourOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
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
        ) : filteredTours.length === 0 ? (
          /* Empty State */
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <Music className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Tours Found</h3>
              <p className="text-slate-400 mb-6">
                {filterStatus === 'all' 
                  ? "Get started by creating your first tour"
                  : `No tours with status "${filterStatus}" found`
                }
              </p>
              <Button 
                onClick={() => router.push("/admin/dashboard/tours/planner")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tour
              </Button>
            </CardContent>
          </Card>
        ) : (
          viewMode === 'calendar' ? (
            <CalendarView />
          ) : (
            /* Tours Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour: any) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )
        )}

        {/* Tour Detail Modal */}
        <AnimatePresence>
          {selectedTour && (
            <TourDetailModal 
              tour={selectedTour} 
              onClose={() => setSelectedTour(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 