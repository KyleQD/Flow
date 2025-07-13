"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building,
  Search,
  Plus,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  MoreVertical,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Target,
  Zap,
  Sparkles,
  Crown,
  Shield,
  Heart,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Share,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  BarChart3,
  PieChart,
  Truck,
  Coffee,
  Wifi,
  ParkingMeter,
  Accessibility,
  Volume2,
  Headphones,
  Mic,
  Radio,
  Camera,
  Monitor,
  Lightbulb,
  Utensils,
  Car,
  Bell,
  Settings,
  UserCheck,
  Handshake,
  Bookmark,
  Map,
  Navigation
} from "lucide-react"

interface Venue {
  id: string
  name: string
  owner_name?: string
  email: string
  phone?: string
  avatar_url?: string
  description?: string
  address: string
  city: string
  state: string
  country: string
  capacity: number
  venue_types: string[]
  status: 'active' | 'inactive' | 'pending' | 'verified'
  tier: 'basic' | 'premium' | 'partner' | 'exclusive'
  amenities: {
    sound_system: boolean
    lighting_system: boolean
    stage: boolean
    parking: boolean
    wifi: boolean
    catering: boolean
    security: boolean
    accessibility: boolean
    green_room: boolean
    bar_service: boolean
  }
  social_links: {
    website?: string
    instagram?: string
    facebook?: string
    twitter?: string
  }
  stats: {
    total_bookings: number
    completed_events: number
    total_revenue: number
    average_rating: number
    response_rate: number
    booking_success_rate: number
  }
  pricing: {
    base_rate: number
    hourly_rate?: number
    deposit_required: boolean
    cancellation_policy: string
  }
  availability_status: 'available' | 'busy' | 'unavailable'
  last_event?: string
  joined_date: string
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  contract_status: 'none' | 'pending' | 'active' | 'expired'
  partnership_level: 'standard' | 'preferred' | 'exclusive'
}

interface BookingRequest {
  id: string
  venue_id: string
  event_name: string
  requester_name: string
  event_date: string
  event_type: string
  expected_attendance: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requested_at: string
  budget_range?: string
  special_requirements?: string
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: '1',
      name: 'Madison Square Garden',
      owner_name: 'MSG Entertainment',
      email: 'bookings@msg.com',
      phone: '+1 (212) 465-6741',
      avatar_url: '/venue/msg.jpg',
      description: 'Iconic arena in the heart of Manhattan, perfect for major concerts and events',
      address: '4 Pennsylvania Plaza',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      capacity: 20000,
      venue_types: ['Arena', 'Concert Hall', 'Sports Venue'],
      status: 'active',
      tier: 'exclusive',
      amenities: {
        sound_system: true,
        lighting_system: true,
        stage: true,
        parking: true,
        wifi: true,
        catering: true,
        security: true,
        accessibility: true,
        green_room: true,
        bar_service: true
      },
      social_links: {
        website: 'https://msg.com',
        instagram: '@thegarden',
        twitter: '@TheGarden'
      },
      stats: {
        total_bookings: 125,
        completed_events: 120,
        total_revenue: 2500000,
        average_rating: 4.9,
        response_rate: 98,
        booking_success_rate: 85
      },
      pricing: {
        base_rate: 50000,
        hourly_rate: 5000,
        deposit_required: true,
        cancellation_policy: '30 days notice required'
      },
      availability_status: 'busy',
      last_event: '2025-06-20',
      joined_date: '2022-01-15',
      verification_status: 'verified',
      contract_status: 'active',
      partnership_level: 'exclusive'
    },
    {
      id: '2',
      name: 'Brooklyn Warehouse',
      owner_name: 'Underground Events LLC',
      email: 'info@brooklynwarehouse.com',
      phone: '+1 (718) 555-0123',
      avatar_url: '/venue/warehouse.jpg',
      description: 'Industrial warehouse space perfect for electronic music events and festivals',
      address: '1234 Industrial Blvd',
      city: 'Brooklyn',
      state: 'NY',
      country: 'USA',
      capacity: 2500,
      venue_types: ['Warehouse', 'Club', 'Festival Space'],
      status: 'active',
      tier: 'premium',
      amenities: {
        sound_system: true,
        lighting_system: true,
        stage: false,
        parking: true,
        wifi: true,
        catering: false,
        security: true,
        accessibility: true,
        green_room: true,
        bar_service: true
      },
      social_links: {
        website: 'https://brooklynwarehouse.com',
        instagram: '@brooklynwarehouse'
      },
      stats: {
        total_bookings: 78,
        completed_events: 75,
        total_revenue: 750000,
        average_rating: 4.6,
        response_rate: 92,
        booking_success_rate: 78
      },
      pricing: {
        base_rate: 8500,
        hourly_rate: 750,
        deposit_required: true,
        cancellation_policy: '14 days notice required'
      },
      availability_status: 'available',
      last_event: '2025-06-18',
      joined_date: '2023-03-20',
      verification_status: 'verified',
      contract_status: 'active',
      partnership_level: 'preferred'
    },
    {
      id: '3',
      name: 'Central Park Bandshell',
      owner_name: 'NYC Parks Department',
      email: 'permits@nycparks.org',
      phone: '+1 (212) 360-8111',
      avatar_url: '/venue/bandshell.jpg',
      description: 'Outdoor amphitheater in Central Park, ideal for summer concerts and festivals',
      address: 'Central Park',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      capacity: 5000,
      venue_types: ['Outdoor', 'Amphitheater', 'Park'],
      status: 'active',
      tier: 'partner',
      amenities: {
        sound_system: false,
        lighting_system: false,
        stage: true,
        parking: false,
        wifi: false,
        catering: false,
        security: true,
        accessibility: true,
        green_room: false,
        bar_service: false
      },
      social_links: {
        website: 'https://nycparks.org'
      },
      stats: {
        total_bookings: 45,
        completed_events: 42,
        total_revenue: 350000,
        average_rating: 4.4,
        response_rate: 85,
        booking_success_rate: 72
      },
      pricing: {
        base_rate: 12000,
        deposit_required: false,
        cancellation_policy: '7 days notice required'
      },
      availability_status: 'available',
      last_event: '2025-06-15',
      joined_date: '2024-01-10',
      verification_status: 'verified',
      contract_status: 'pending',
      partnership_level: 'standard'
    }
  ])

  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Mock booking requests
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      venue_id: '1',
      event_name: 'Summer Music Festival',
      requester_name: 'Festival Productions',
      event_date: '2025-08-15',
      event_type: 'Festival',
      expected_attendance: 15000,
      status: 'pending',
      requested_at: '2025-06-25T10:30:00Z',
      budget_range: '$40,000 - $60,000',
      special_requirements: 'Need extended load-in time and additional security'
    },
    {
      id: '2',
      venue_id: '2',
      event_name: 'Electronic Night',
      requester_name: 'Underground Events',
      event_date: '2025-07-22',
      event_type: 'Club Night',
      expected_attendance: 2000,
      status: 'approved',
      requested_at: '2025-06-20T14:15:00Z',
      budget_range: '$8,000 - $12,000'
    }
  ])

  // Filter venues based on search and filters
  useEffect(() => {
    let filtered = venues

    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.venue_types.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(venue => venue.status === statusFilter)
    }

    if (tierFilter !== "all") {
      filtered = filtered.filter(venue => venue.tier === tierFilter)
    }

    setFilteredVenues(filtered)
  }, [venues, searchQuery, statusFilter, tierFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactive</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
      case 'verified':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Verified</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Basic</Badge>
      case 'premium':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Premium</Badge>
      case 'partner':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Partner</Badge>
      case 'exclusive':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="h-3 w-3 mr-1" />Exclusive</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
      case 'busy':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Busy</Badge>
      case 'unavailable':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Unavailable</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Unverified</Badge>
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string
    value: string | number
    icon: any
    color: string
    trend?: number
  }) => (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                )}
                <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Venue Coordination
            </h1>
            <p className="text-slate-400 mt-2">
              Manage venue partnerships, bookings, and relationship coordination
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Venues"
            value={venues.length}
            icon={Building}
            color="bg-orange-600"
            trend={8}
          />
          <StatCard
            title="Active Venues"
            value={venues.filter(v => v.status === 'active').length}
            icon={Activity}
            color="bg-green-600"
            trend={12}
          />
          <StatCard
            title="Total Capacity"
            value={formatNumber(venues.reduce((sum, v) => sum + v.capacity, 0))}
            icon={Users}
            color="bg-blue-600"
            trend={15}
          />
          <StatCard
            title="Avg Rating"
            value={(venues.reduce((sum, v) => sum + v.stats.average_rating, 0) / venues.length).toFixed(1)}
            icon={Star}
            color="bg-yellow-600"
            trend={5}
          />
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search venues by name, location, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700/50 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={venue.avatar_url} />
                        <AvatarFallback>{venue.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-white">{venue.name}</h3>
                        <p className="text-sm text-slate-400">{venue.city}, {venue.state}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVenue(venue)
                        setIsDetailsOpen(true)
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {getStatusBadge(venue.status)}
                        {getTierBadge(venue.tier)}
                      </div>
                      {getAvailabilityBadge(venue.availability_status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {getVerificationBadge(venue.verification_status)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Capacity</p>
                        <p className="font-semibold text-white">{formatNumber(venue.capacity)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {venue.venue_types.slice(0, 3).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {venue.venue_types.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{venue.venue_types.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Bookings</p>
                        <p className="font-semibold text-white">{venue.stats.total_bookings}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Revenue</p>
                        <p className="font-semibold text-green-400">
                          ${formatNumber(venue.stats.total_revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Rating</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <p className="font-semibold text-white">{venue.stats.average_rating}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400">Response Rate</p>
                        <p className="font-semibold text-white">{venue.stats.response_rate}%</p>
                      </div>
                    </div>

                    {/* Amenities Icons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {venue.amenities.sound_system && <Volume2 className="h-4 w-4 text-slate-400" />}
                      {venue.amenities.lighting_system && <Lightbulb className="h-4 w-4 text-slate-400" />}
                      {venue.amenities.parking && <Car className="h-4 w-4 text-slate-400" />}
                      {venue.amenities.wifi && <Wifi className="h-4 w-4 text-slate-400" />}
                      {venue.amenities.catering && <Utensils className="h-4 w-4 text-slate-400" />}
                      {venue.amenities.accessibility && <Accessibility className="h-4 w-4 text-slate-400" />}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Success Rate</span>
                        <span className="text-xs text-slate-400">
                          {venue.stats.booking_success_rate}%
                        </span>
                      </div>
                      <Progress value={venue.stats.booking_success_rate} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        {venue.social_links.website && (
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Globe className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                        {venue.social_links.instagram && (
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Instagram className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                        {venue.social_links.facebook && (
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Facebook className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVenue(venue)
                            setIsDetailsOpen(true)
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Booking Requests */}
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-400" />
              Recent Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingRequests.map((request) => {
                const venue = venues.find(v => v.id === request.venue_id)
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{venue?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-white">{request.event_name}</h4>
                        <p className="text-sm text-slate-400">
                          {venue?.name} • {new Date(request.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Expected</p>
                        <p className="font-medium text-white">{formatNumber(request.expected_attendance)}</p>
                      </div>
                      <Badge className={
                        request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {request.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Venue Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Venue Profile - {selectedVenue?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedVenue && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedVenue.avatar_url} />
                    <AvatarFallback className="text-2xl">{selectedVenue.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedVenue.name}</h2>
                      <p className="text-slate-400">{selectedVenue.description}</p>
                      <p className="text-slate-400 mt-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {selectedVenue.address}, {selectedVenue.city}, {selectedVenue.state}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(selectedVenue.status)}
                      {getTierBadge(selectedVenue.tier)}
                      {getAvailabilityBadge(selectedVenue.availability_status)}
                      {getVerificationBadge(selectedVenue.verification_status)}
                    </div>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatCard
                        title="Capacity"
                        value={formatNumber(selectedVenue.capacity)}
                        icon={Users}
                        color="bg-blue-600"
                      />
                      <StatCard
                        title="Total Bookings"
                        value={selectedVenue.stats.total_bookings}
                        icon={CalendarIcon}
                        color="bg-green-600"
                      />
                      <StatCard
                        title="Total Revenue"
                        value={`$${formatNumber(selectedVenue.stats.total_revenue)}`}
                        icon={DollarSign}
                        color="bg-yellow-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-300">{selectedVenue.email}</span>
                          </div>
                          {selectedVenue.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">{selectedVenue.phone}</span>
                            </div>
                          )}
                          {selectedVenue.owner_name && (
                            <div className="flex items-center space-x-3">
                              <UserCheck className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">{selectedVenue.owner_name}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader>
                          <CardTitle className="text-white">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Average Rating</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span className="text-white">{selectedVenue.stats.average_rating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Response Rate</span>
                            <span className="text-white">{selectedVenue.stats.response_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Success Rate</span>
                            <span className="text-white">{selectedVenue.stats.booking_success_rate}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="amenities">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Venue Amenities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(selectedVenue.amenities).map(([amenity, available]) => {
                            const getAmenityIcon = (amenity: string) => {
                              switch (amenity) {
                                case 'sound_system': return <Volume2 className="h-5 w-5" />
                                case 'lighting_system': return <Lightbulb className="h-5 w-5" />
                                case 'stage': return <Monitor className="h-5 w-5" />
                                case 'parking': return <Car className="h-5 w-5" />
                                case 'wifi': return <Wifi className="h-5 w-5" />
                                case 'catering': return <Utensils className="h-5 w-5" />
                                case 'security': return <Shield className="h-5 w-5" />
                                case 'accessibility': return <Accessibility className="h-5 w-5" />
                                case 'green_room': return <Coffee className="h-5 w-5" />
                                case 'bar_service': return <Coffee className="h-5 w-5" />
                                default: return <CheckCircle className="h-5 w-5" />
                              }
                            }

                            return (
                              <div 
                                key={amenity} 
                                className={`flex items-center space-x-3 p-3 rounded-lg ${
                                  available ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-700/50'
                                }`}
                              >
                                <div className={available ? 'text-green-400' : 'text-slate-500'}>
                                  {getAmenityIcon(amenity)}
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${available ? 'text-white' : 'text-slate-500'}`}>
                                    {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </p>
                                  <p className={`text-xs ${available ? 'text-green-400' : 'text-slate-500'}`}>
                                    {available ? 'Available' : 'Not Available'}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pricing">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Pricing Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-slate-400">Base Rate</Label>
                            <p className="text-2xl font-bold text-green-400">
                              ${selectedVenue.pricing.base_rate.toLocaleString()}
                            </p>
                          </div>
                          {selectedVenue.pricing.hourly_rate && (
                            <div>
                              <Label className="text-slate-400">Hourly Rate</Label>
                              <p className="text-2xl font-bold text-blue-400">
                                ${selectedVenue.pricing.hourly_rate.toLocaleString()}/hr
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-slate-400">Deposit Required</Label>
                          <p className="text-white">
                            {selectedVenue.pricing.deposit_required ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-slate-400">Cancellation Policy</Label>
                          <p className="text-white">{selectedVenue.pricing.cancellation_policy}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bookings">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Booking History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-slate-400">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Booking history integration would be implemented here</p>
                          <p className="text-sm">Connect to the booking management system</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Performance Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-slate-400">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Venue analytics charts would be displayed here</p>
                          <p className="text-sm">Revenue trends, booking patterns, and performance metrics</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 