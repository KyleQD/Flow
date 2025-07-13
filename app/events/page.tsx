"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Search, 
  Plus, 
  Filter,
  Grid3X3,
  List,
  CalendarDays,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  BarChart3,
  Zap,
  Sparkles,
  Music,
  Ticket,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon
} from "lucide-react"
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns"
import { CreateEventDialog } from "@/components/events/create-event-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  capacity: number
  ticketPrice: number
  category: string
  coverImage: string
  isPublic: boolean
  status: "upcoming" | "past" | "draft" | "live" | "cancelled"
  views: number
  ticketsSold: number
  revenue: number
  priority: "low" | "medium" | "high"
  tags: string[]
  attendees?: number
  createdAt: string
}

// Enhanced mock data with more realistic event information
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Jam Festival 2025",
    description: "The biggest music festival of the year featuring an incredible lineup of top artists from around the world. Join us for three days of non-stop music, food, and entertainment.",
    date: "2025-07-15",
    time: "14:00",
    location: "Central Park, New York",
    venue: "Main Stage",
    capacity: 5000,
    ticketPrice: 49.99,
    category: "Festival",
    coverImage: "/placeholder.svg?height=300&width=500&text=Summer+Jam+Festival",
    isPublic: true,
    status: "upcoming",
    views: 1240,
    ticketsSold: 2850,
    revenue: 142475,
    priority: "high",
    tags: ["music", "festival", "outdoor", "multi-day"],
    attendees: 2850,
    createdAt: "2024-12-01T10:00:00Z"
  },
  {
    id: "2",
    title: "Intimate Acoustic Session",
    description: "A cozy evening of acoustic performances in an intimate setting. Perfect for music lovers who appreciate raw, unfiltered talent.",
    date: "2025-01-20",
    time: "19:30",
    location: "Blue Note Jazz Club, NYC",
    venue: "Main Room",
    capacity: 150,
    ticketPrice: 75.00,
    category: "Concert",
    coverImage: "/placeholder.svg?height=300&width=500&text=Acoustic+Session",
    isPublic: true,
    status: "upcoming",
    views: 456,
    ticketsSold: 120,
    revenue: 9000,
    priority: "medium",
    tags: ["acoustic", "intimate", "jazz"],
    attendees: 120,
    createdAt: "2024-11-15T14:30:00Z"
  },
  {
    id: "3",
    title: "Electronic Beats Underground",
    description: "Underground electronic music showcase featuring local DJs and producers. Experience the cutting edge of electronic music.",
    date: "2024-12-28",
    time: "22:00",
    location: "Warehouse District, Brooklyn",
    venue: "Underground Venue",
    capacity: 300,
    ticketPrice: 35.00,
    category: "Electronic",
    coverImage: "/placeholder.svg?height=300&width=500&text=Electronic+Beats",
    isPublic: true,
    status: "past",
    views: 892,
    ticketsSold: 275,
    revenue: 9625,
    priority: "medium",
    tags: ["electronic", "underground", "DJ"],
    attendees: 275,
    createdAt: "2024-10-20T16:45:00Z"
  },
  {
    id: "4",
    title: "Holiday Charity Concert",
    description: "Join us for a special holiday concert benefiting local charities. An evening of music, giving, and community spirit.",
    date: "2024-12-22",
    time: "18:00",
    location: "Carnegie Hall, NYC",
    venue: "Main Hall",
    capacity: 2800,
    ticketPrice: 125.00,
    category: "Charity",
    coverImage: "/placeholder.svg?height=300&width=500&text=Holiday+Concert",
    isPublic: true,
    status: "draft",
    views: 0,
    ticketsSold: 0,
    revenue: 0,
    priority: "high",
    tags: ["holiday", "charity", "classical"],
    attendees: 0,
    createdAt: "2024-12-10T09:15:00Z"
  }
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  // Filter and sort events
  const filteredEvents = React.useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = filterCategory === "all" || event.category.toLowerCase() === filterCategory.toLowerCase()
      const matchesStatus = filterStatus === "all" || event.status === filterStatus
      
      if (activeTab === "all") return matchesSearch && matchesCategory && matchesStatus
      if (activeTab === "upcoming") return matchesSearch && matchesCategory && event.status === "upcoming"
      if (activeTab === "past") return matchesSearch && matchesCategory && event.status === "past"
      if (activeTab === "drafts") return matchesSearch && matchesCategory && event.status === "draft"
      
      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "revenue":
          return b.revenue - a.revenue
        case "attendees":
          return (b.attendees || 0) - (a.attendees || 0)
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return 0
      }
    })

    return filtered
  }, [events, searchQuery, activeTab, filterCategory, filterStatus, sortBy])

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalEvents = events.length
    const upcomingEvents = events.filter(e => e.status === "upcoming").length
    const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0)
    const totalAttendees = events.reduce((sum, e) => sum + (e.attendees || 0), 0)
    const avgTicketPrice = events.length > 0 ? events.reduce((sum, e) => sum + e.ticketPrice, 0) / events.length : 0
    
    return {
      totalEvents,
      upcomingEvents,
      totalRevenue,
      totalAttendees,
      avgTicketPrice
    }
  }, [events])

  const handleEventCreated = (basicEvent: any) => {
    // Convert basic event from dialog to enhanced event with additional properties
    const enhancedEvent: Event = {
      ...basicEvent,
      priority: "medium" as const,
      tags: [basicEvent.category.toLowerCase()],
      attendees: 0,
      createdAt: new Date().toISOString(),
      status: "upcoming" as const
    }
    setEvents(prev => [enhancedEvent, ...prev])
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'live': return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'past': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-3 w-3" />
      case 'live': return <Zap className="h-3 w-3" />
      case 'past': return <CheckCircle className="h-3 w-3" />
      case 'draft': return <Edit className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const formatEventDate = (date: string) => {
    const eventDate = parseISO(date)
    if (isToday(eventDate)) return "Today"
    if (isTomorrow(eventDate)) return "Tomorrow"
    return format(eventDate, "MMM d, yyyy")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Event Management
              </h1>
              <p className="text-slate-400 mt-1">
                Organize, track, and manage all your events in one place
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Upcoming</p>
                  <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Attendees</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAttendees.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg. Ticket</p>
                  <p className="text-2xl font-bold text-white">${stats.avgTicketPrice.toFixed(0)}</p>
                </div>
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Ticket className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 items-center justify-between"
        >
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-500/50"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
                <SelectItem value="charity">Charity</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="attendees">Attendees</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-600/50 rounded-lg bg-slate-800/50 p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-purple-600" : ""}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-purple-600" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={viewMode === "calendar" ? "bg-purple-600" : ""}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                All Events
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
                Upcoming ({events.filter(e => e.status === "upcoming").length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-purple-600">
                Past ({events.filter(e => e.status === "past").length})
              </TabsTrigger>
              <TabsTrigger value="drafts" className="data-[state=active]:bg-purple-600">
                Drafts ({events.filter(e => e.status === "draft").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-slate-800/50 border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 overflow-hidden group">
                          <div className="aspect-[16/9] relative overflow-hidden">
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                              <Badge className={`${getStatusColor(event.status)} border`}>
                                {getStatusIcon(event.status)}
                                <span className="ml-1 capitalize">{event.status}</span>
                              </Badge>
                              <Badge variant="secondary" className="bg-black/40 text-white border-0">
                                {event.category}
                              </Badge>
                            </div>
                            <div className="absolute top-3 right-3">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority).replace('text-', 'bg-')}`} />
                            </div>
                          </div>
                          
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-white text-lg leading-tight">{event.title}</CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-1 line-clamp-2">
                                  {event.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="flex items-center text-slate-300 text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                <span>{formatEventDate(event.date)} at {format(parseISO(`${event.date}T${event.time}`), "h:mm a")}</span>
                              </div>
                              <div className="flex items-center text-slate-300 text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                                <span className="truncate">{event.venue}, {event.location}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-slate-300">
                                  <Users className="h-4 w-4 mr-2 text-slate-400" />
                                  <span>{event.ticketsSold}/{event.capacity}</span>
                                </div>
                                <div className="flex items-center text-slate-300">
                                  <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                                  <span>${event.ticketPrice}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-slate-400">
                                <div className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  <span>{event.views}</span>
                                </div>
                                <div className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  <span>${event.revenue.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="my-4 bg-slate-700/50" />
                            
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                                  <Link href={`/events/${event.id}`}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
                                  <Link href={`/events/${event.id}/manage`}>
                                    <Edit className="h-3 w-3 mr-1" />
                                    Manage
                                  </Link>
                                </Button>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {filteredEvents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                  <p className="text-slate-400 mb-4">
                    {searchQuery ? `No events match "${searchQuery}"` : "You haven't created any events yet."}
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
