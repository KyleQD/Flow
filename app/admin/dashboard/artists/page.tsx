"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import {
  Music,
  Search,
  Plus,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
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
  Youtube,
  Music2,
  Apple,
  Disc,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Volume2,
  Headphones,
  Mic,
  Radio,
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
  PieChart
} from "lucide-react"

interface Artist {
  id: string
  name: string
  stage_name?: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  genres: string[]
  status: 'active' | 'inactive' | 'pending' | 'verified'
  tier: 'emerging' | 'established' | 'headliner' | 'legend'
  location?: string
  social_links: {
    website?: string
    instagram?: string
    twitter?: string
    facebook?: string
    youtube?: string
    spotify?: string
    apple_music?: string
    soundcloud?: string
  }
  stats: {
    total_bookings: number
    completed_events: number
    total_revenue: number
    average_rating: number
    followers: number
    monthly_listeners: number
  }
  upcoming_events: number
  last_performance?: string
  joined_date: string
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  contract_status: 'none' | 'pending' | 'active' | 'expired'
}

interface Booking {
  id: string
  artist_id: string
  event_title: string
  event_date: string
  venue: string
  location: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  fee: number
  type: 'headliner' | 'support' | 'opening' | 'special_guest'
  booking_date: string
  notes?: string
}

interface Performance {
  id: string
  artist_id: string
  event_title: string
  date: string
  venue: string
  attendance: number
  rating: number
  revenue: number
  feedback?: string
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([
    {
      id: '1',
      name: 'Elena Rodriguez',
      stage_name: 'The Electric Waves',
      email: 'elena@electricwaves.com',
      phone: '+1 (555) 123-4567',
      avatar_url: '/placeholder-user.jpg',
      bio: 'Electronic music producer and performer with 10+ years of experience',
      genres: ['Electronic', 'House', 'Techno'],
      status: 'active',
      tier: 'established',
      location: 'Los Angeles, CA',
      social_links: {
        website: 'https://electricwaves.com',
        instagram: '@electricwaves',
        spotify: 'The Electric Waves',
        youtube: 'Electric Waves Official'
      },
      stats: {
        total_bookings: 45,
        completed_events: 42,
        total_revenue: 285000,
        average_rating: 4.8,
        followers: 125000,
        monthly_listeners: 75000
      },
      upcoming_events: 3,
      last_performance: '2025-06-15',
      joined_date: '2023-01-15',
      verification_status: 'verified',
      contract_status: 'active'
    },
    {
      id: '2',
      name: 'Marcus Chen',
      stage_name: 'DJ Luna',
      email: 'marcus@djluna.com',
      phone: '+1 (555) 234-5678',
      avatar_url: '/placeholder-user.jpg',
      bio: 'Progressive house and ambient electronic music artist',
      genres: ['Progressive House', 'Ambient', 'Electronic'],
      status: 'active',
      tier: 'headliner',
      location: 'New York, NY',
      social_links: {
        website: 'https://djluna.com',
        instagram: '@djlunaofficial',
        spotify: 'DJ Luna',
        soundcloud: 'DJ Luna Music'
      },
      stats: {
        total_bookings: 67,
        completed_events: 63,
        total_revenue: 445000,
        average_rating: 4.9,
        followers: 250000,
        monthly_listeners: 150000
      },
      upcoming_events: 5,
      last_performance: '2025-06-20',
      joined_date: '2022-08-10',
      verification_status: 'verified',
      contract_status: 'active'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      stage_name: 'Acoustic Soul',
      email: 'sarah@acousticsoul.com',
      phone: '+1 (555) 345-6789',
      avatar_url: '/placeholder-user.jpg',
      bio: 'Singer-songwriter specializing in acoustic folk and indie music',
      genres: ['Folk', 'Indie', 'Acoustic'],
      status: 'active',
      tier: 'emerging',
      location: 'Nashville, TN',
      social_links: {
        website: 'https://acousticsoul.com',
        instagram: '@acousticsoul',
        youtube: 'Acoustic Soul Music',
        apple_music: 'Acoustic Soul'
      },
      stats: {
        total_bookings: 23,
        completed_events: 20,
        total_revenue: 125000,
        average_rating: 4.6,
        followers: 45000,
        monthly_listeners: 25000
      },
      upcoming_events: 2,
      last_performance: '2025-06-10',
      joined_date: '2024-03-20',
      verification_status: 'verified',
      contract_status: 'pending'
    }
  ])

  const [filteredArtists, setFilteredArtists] = useState<Artist[]>(artists)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Filter artists based on search and filters
  useEffect(() => {
    let filtered = artists

    if (searchQuery) {
      filtered = filtered.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.stage_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(artist => artist.status === statusFilter)
    }

    if (tierFilter !== "all") {
      filtered = filtered.filter(artist => artist.tier === tierFilter)
    }

    setFilteredArtists(filtered)
  }, [artists, searchQuery, statusFilter, tierFilter])

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
      case 'emerging':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Emerging</Badge>
      case 'established':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Established</Badge>
      case 'headliner':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Headliner</Badge>
      case 'legend':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="h-3 w-3 mr-1" />Legend</Badge>
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
              Artist Management
            </h1>
            <p className="text-slate-400 mt-2">
              Manage artist profiles, bookings, and performance tracking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Artist
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
            title="Total Artists"
            value={artists.length}
            icon={Music}
            color="bg-purple-600"
            trend={12}
          />
          <StatCard
            title="Active Artists"
            value={artists.filter(a => a.status === 'active').length}
            icon={Activity}
            color="bg-green-600"
            trend={8}
          />
          <StatCard
            title="Total Revenue"
            value={`$${(artists.reduce((sum, a) => sum + a.stats.total_revenue, 0) / 1000).toFixed(0)}K`}
            icon={DollarSign}
            color="bg-yellow-600"
            trend={15}
          />
          <StatCard
            title="Avg Rating"
            value={(artists.reduce((sum, a) => sum + a.stats.average_rating, 0) / artists.length).toFixed(1)}
            icon={Star}
            color="bg-blue-600"
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
                  placeholder="Search artists by name, email, or genre..."
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
                  <SelectItem value="emerging">Emerging</SelectItem>
                  <SelectItem value="established">Established</SelectItem>
                  <SelectItem value="headliner">Headliner</SelectItem>
                  <SelectItem value="legend">Legend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <motion.div
              key={artist.id}
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
                        <AvatarImage src={artist.avatar_url} />
                        <AvatarFallback>{artist.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-white">{artist.stage_name || artist.name}</h3>
                        <p className="text-sm text-slate-400">{artist.location}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedArtist(artist)
                        setIsDetailsOpen(true)
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {getStatusBadge(artist.status)}
                        {getTierBadge(artist.tier)}
                      </div>
                      {getVerificationBadge(artist.verification_status)}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {artist.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {artist.genres.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{artist.genres.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Bookings</p>
                        <p className="font-semibold text-white">{artist.stats.total_bookings}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Revenue</p>
                        <p className="font-semibold text-green-400">
                          ${formatNumber(artist.stats.total_revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Rating</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <p className="font-semibold text-white">{artist.stats.average_rating}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400">Followers</p>
                        <p className="font-semibold text-white">{formatNumber(artist.stats.followers)}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Performance</span>
                        <span className="text-xs text-slate-400">
                          {Math.round((artist.stats.completed_events / artist.stats.total_bookings) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(artist.stats.completed_events / artist.stats.total_bookings) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        {artist.social_links.instagram && (
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Instagram className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                        {artist.social_links.spotify && (
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Music2 className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                        {artist.social_links.youtube && (
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Youtube className="h-4 w-4 text-slate-400" />
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedArtist(artist)
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

        {/* Artist Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Music className="h-5 w-5 mr-2" />
                Artist Profile - {selectedArtist?.stage_name || selectedArtist?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedArtist && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedArtist.avatar_url} />
                    <AvatarFallback className="text-2xl">{selectedArtist.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedArtist.stage_name || selectedArtist.name}</h2>
                      <p className="text-slate-400">{selectedArtist.bio}</p>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(selectedArtist.status)}
                      {getTierBadge(selectedArtist.tier)}
                      {getVerificationBadge(selectedArtist.verification_status)}
                    </div>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="social">Social & Media</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatCard
                        title="Total Bookings"
                        value={selectedArtist.stats.total_bookings}
                        icon={Calendar}
                        color="bg-blue-600"
                      />
                      <StatCard
                        title="Completed Events"
                        value={selectedArtist.stats.completed_events}
                        icon={CheckCircle}
                        color="bg-green-600"
                      />
                      <StatCard
                        title="Total Revenue"
                        value={`$${formatNumber(selectedArtist.stats.total_revenue)}`}
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
                            <span className="text-slate-300">{selectedArtist.email}</span>
                          </div>
                          {selectedArtist.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">{selectedArtist.phone}</span>
                            </div>
                          )}
                          {selectedArtist.location && (
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">{selectedArtist.location}</span>
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
                              <span className="text-white">{selectedArtist.stats.average_rating}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Followers</span>
                            <span className="text-white">{formatNumber(selectedArtist.stats.followers)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Monthly Listeners</span>
                            <span className="text-white">{formatNumber(selectedArtist.stats.monthly_listeners)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="bookings">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Recent Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-slate-400">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Booking history integration would be implemented here</p>
                          <p className="text-sm">Connect to the booking management system</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Performance Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-slate-400">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Performance analytics charts would be displayed here</p>
                          <p className="text-sm">Revenue trends, audience growth, and engagement metrics</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="social">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Social Media & Streaming</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(selectedArtist.social_links).map(([platform, handle]) => {
                            if (!handle) return null
                            
                            const getIcon = (platform: string) => {
                              switch (platform) {
                                case 'instagram': return <Instagram className="h-5 w-5" />
                                case 'twitter': return <Twitter className="h-5 w-5" />
                                case 'facebook': return <Facebook className="h-5 w-5" />
                                case 'youtube': return <Youtube className="h-5 w-5" />
                                case 'spotify': return <Music2 className="h-5 w-5" />
                                case 'apple_music': return <Apple className="h-5 w-5" />
                                case 'soundcloud': return <Disc className="h-5 w-5" />
                                default: return <Globe className="h-5 w-5" />
                              }
                            }

                            return (
                              <div key={platform} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                                {getIcon(platform)}
                                <div>
                                  <p className="text-sm font-medium text-white capitalize">{platform.replace('_', ' ')}</p>
                                  <p className="text-xs text-slate-400">{handle}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contracts">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">Contract Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-slate-400">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Contract management interface would be implemented here</p>
                          <p className="text-sm">Upload, manage, and track artist contracts and agreements</p>
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