"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Music, 
  Building2, 
  Calendar, 
  Users,
  MapPin,
  Star,
  Clock,
  Filter,
  Heart,
  Plus,
  TrendingUp,
  Zap,
  Sparkles,
  Eye,
  Play,
  Headphones,
  Radio,
  Globe,
  Command
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isSearching, setIsSearching] = useState(false)

  // Mock data - would come from API
  const searchResults = {
    artists: [
      {
        id: 1,
        name: "The Midnight Club",
        bio: "Electronic duo creating atmospheric soundscapes",
        genres: ["Electronic", "Ambient", "Synthwave"],
        followers: 2400,
        avatar: "",
        verified: true,
        location: "Neo Tokyo District",
        gradient: "from-purple-500 to-pink-500",
        monthly_listeners: "15.2K"
      },
      {
        id: 2,
        name: "Neon Dreams",
        bio: "Singer-songwriter with cyberpunk influences",
        genres: ["Electronic", "Pop", "Futuristic"],
        followers: 890,
        avatar: "",
        verified: false,
        location: "Cyber City Central",
        gradient: "from-cyan-500 to-blue-500",
        monthly_listeners: "8.7K"
      },
      {
        id: 3,
        name: "Digital Pulse",
        bio: "Underground bass music collective",
        genres: ["Bass", "Electronic", "Experimental"],
        followers: 5600,
        avatar: "",
        verified: true,
        location: "Data Grid Sector 7",
        gradient: "from-green-500 to-emerald-500",
        monthly_listeners: "23.1K"
      }
    ],
    venues: [
      {
        id: 1,
        name: "Neon Underground",
        description: "Cyberpunk venue for emerging artists",
        capacity: 300,
        followers: 1200,
        avatar: "",
        verified: true,
        location: "Neo Tokyo District",
        types: ["Live Music", "Electronic", "Ambient"],
        gradient: "from-purple-600 to-pink-600",
        upcoming_events: 12
      },
      {
        id: 2,
        name: "Digital Dreams Arena",
        description: "Massive electronic music complex",
        capacity: 800,
        followers: 3400,
        avatar: "",
        verified: true,
        location: "Cyber City Heights",
        types: ["Electronic", "Dance", "Festivals"],
        gradient: "from-blue-600 to-cyan-600",
        upcoming_events: 8
      }
    ],
    events: [
      {
        id: 1,
        title: "Neon Nights Festival",
        description: "3-day cyberpunk music experience",
        date: "2024-07-15",
        time: "6:00 PM",
        venue: "Digital Dreams Arena",
        location: "Cyber City Heights",
        artists: ["The Midnight Club", "Neon Dreams"],
        price: "$120",
        image: "",
        gradient: "from-purple-500 via-pink-500 to-red-500",
        attendees: "2.3K"
      },
      {
        id: 2,
        title: "Underground Bass Matrix",
        description: "Monthly bass music immersion",
        date: "2024-06-20",
        time: "9:00 PM",
        venue: "Neon Underground",
        location: "Neo Tokyo District",
        artists: ["Digital Pulse"],
        price: "$45",
        image: "",
        gradient: "from-green-500 via-emerald-500 to-teal-500",
        attendees: "890"
      }
    ],
    users: [
      {
        id: 1,
        name: "Alex Cyberpunk",
        bio: "Digital artist and holographic photographer",
        interests: ["Digital Art", "Cyberpunk", "Music Tech"],
        followers: 1450,
        avatar: "",
        location: "Virtual Reality Hub",
        gradient: "from-indigo-500 to-purple-500",
        verified: false
      },
      {
        id: 2,
        name: "Luna Matrix",
        bio: "VR concert curator and digital experience designer",
        interests: ["VR Concerts", "Digital Curation", "Tech Innovation"],
        followers: 2680,
        avatar: "",
        location: "Metaverse Central",
        gradient: "from-pink-500 to-red-500",
        verified: true
      }
    ]
  }

  const trendingTags = [
    { tag: "#CyberpunkVibes", count: "127K", trend: "+24%" },
    { tag: "#NeonNights", count: "89K", trend: "+18%" },
    { tag: "#DigitalBeats", count: "156K", trend: "+31%" },
    { tag: "#FutureSounds", count: "203K", trend: "+12%" },
    { tag: "#VirtualConcert", count: "78K", trend: "+45%" }
  ]

  const handleFollow = (type: string, id: number) => {
    console.log(`Following ${type} with id ${id}`)
  }

  const handleSearch = (query: string) => {
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 1000)
  }

  const renderArtistCard = (artist: any, index: number) => (
    <motion.div
      key={artist.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${artist.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Animated Border */}
        <div className="absolute inset-0 rounded-lg">
          <div className={`absolute inset-0 bg-gradient-to-r ${artist.gradient} rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
        </div>

        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-slate-600 group-hover:ring-purple-400/50 transition-all duration-300">
                <AvatarImage src={artist.avatar} />
                <AvatarFallback className={`bg-gradient-to-br ${artist.gradient} text-white text-lg font-bold`}>
                  {artist.name[0]}
                </AvatarFallback>
              </Avatar>
              {artist.verified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-1">
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {artist.name}
                </h3>
                {artist.verified && (
                  <Badge className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-0 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              
              <p className="text-slate-300 text-sm">{artist.bio}</p>
              
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{artist.location}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{artist.followers.toLocaleString()}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Headphones className="h-3 w-3 mr-1" />
                  <span>{artist.monthly_listeners}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {artist.genres.map((genre: string) => (
                  <Badge key={genre} variant="outline" className="border-slate-600 text-slate-300 text-xs hover:border-purple-400/50">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                className={`bg-gradient-to-r ${artist.gradient} hover:shadow-lg hover:shadow-purple-500/25 text-white border-0`}
                onClick={() => handleFollow('artist', artist.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Follow
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <Play className="h-4 w-4 mr-1" />
                Listen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderVenueCard = (venue: any, index: number) => (
    <motion.div
      key={venue.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${venue.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-slate-600 group-hover:ring-blue-400/50 transition-all duration-300">
                <AvatarImage src={venue.avatar} />
                <AvatarFallback className={`bg-gradient-to-br ${venue.gradient} text-white text-lg font-bold`}>
                  {venue.name[0]}
                </AvatarFallback>
              </Avatar>
              {venue.verified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-1">
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {venue.name}
                </h3>
                {venue.verified && (
                  <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              
              <p className="text-slate-300 text-sm">{venue.description}</p>
              
              <div className="flex items-center space-x-3 text-sm text-slate-400">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{venue.location}</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{venue.capacity} capacity</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{venue.upcoming_events} events</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {venue.types.map((type: string) => (
                  <Badge key={type} variant="outline" className="border-slate-600 text-slate-300 text-xs hover:border-blue-400/50">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                className={`bg-gradient-to-r ${venue.gradient} hover:shadow-lg hover:shadow-blue-500/25 text-white border-0`}
                onClick={() => handleFollow('venue', venue.id)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Follow
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <Eye className="h-4 w-4 mr-1" />
                Visit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderEventCard = (event: any, index: number) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        <CardContent className="relative p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {event.title}
                </h3>
                <p className="text-slate-300 text-sm">{event.description}</p>
              </div>
              <Badge className={`bg-gradient-to-r ${event.gradient} text-white border-0 font-bold`}>
                {event.price}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                <span>{event.attendees} attending</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {event.artists.map((artist: string) => (
                  <Badge key={artist} variant="outline" className="border-slate-600 text-slate-300 text-xs hover:border-pink-400/50">
                    {artist}
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" className={`bg-gradient-to-r ${event.gradient} text-white border-0`}>
                  Get Tickets
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderUserCard = (user: any, index: number) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="group relative bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${user.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        <CardContent className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-slate-600 group-hover:ring-purple-400/50 transition-all duration-300">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className={`bg-gradient-to-br ${user.gradient} text-white font-bold`}>
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full p-1">
                  <Star className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-white">{user.name}</h3>
              <p className="text-slate-300 text-sm">{user.bio}</p>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <MapPin className="h-3 w-3" />
                <span>{user.location}</span>
                <span>•</span>
                <Users className="h-3 w-3" />
                <span>{user.followers.toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {user.interests.map((interest: string) => (
                  <Badge key={interest} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button 
              size="sm" 
              className={`bg-gradient-to-r ${user.gradient} hover:shadow-lg text-white border-0`}
              onClick={() => handleFollow('user', user.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Follow
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container max-w-7xl mx-auto py-12 space-y-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Discover the Future
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl opacity-30" />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Find artists, venues, events, and fellow digital music explorers in the cyberpunk universe
          </p>
          
          {/* Advanced Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur" />
              <div className="relative flex items-center space-x-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 border border-slate-700/50">
                <div className="relative flex-1">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                    isSearching ? 'text-cyan-400' : 'text-slate-400'
                  }`} />
                  <Input
                    placeholder="Search artists, venues, events, or digital citizens..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value) handleSearch(e.target.value)
                    }}
                    className="pl-12 pr-4 py-3 bg-transparent border-0 text-white placeholder-slate-400 text-lg focus:ring-0 focus:outline-none"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 px-6 py-3">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white border-0 px-6 py-3">
                  <Command className="h-4 w-4 mr-2" />
                  AI Search
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Trending Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="h-6 w-6 mr-3 text-green-400" />
                Trending in the Digital Underground
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {trendingTags.map((tag, index) => (
                  <motion.div
                    key={tag.tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 px-4 py-2">
                      <span className="font-medium">{tag.tag}</span>
                      <span className="ml-2 text-xs opacity-75">{tag.count}</span>
                      <TrendingUp className="h-3 w-3 ml-2 text-green-400" />
                      <span className="ml-1 text-xs text-green-400">{tag.trend}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Globe className="h-4 w-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger 
                value="artists"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Music className="h-4 w-4 mr-2" />
                Artists
              </TabsTrigger>
              <TabsTrigger 
                value="venues"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Venues
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Citizens
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="all" className="space-y-8 mt-8">
            {/* Featured Artists */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold flex items-center text-white">
                  <Music className="h-7 w-7 mr-3 text-purple-400" />
                  Digital Artists
                </h2>
                <Button variant="outline" size="sm" className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20">
                  <Radio className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.artists.slice(0, 2).map((artist, index) => renderArtistCard(artist, index))}
              </div>
            </div>

            {/* Featured Venues */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold flex items-center text-white">
                  <Building2 className="h-7 w-7 mr-3 text-blue-400" />
                  Cyber Venues
                </h2>
                <Button variant="outline" size="sm" className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.venues.map((venue, index) => renderVenueCard(venue, index))}
              </div>
            </div>

            {/* Featured Events */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold flex items-center text-white">
                  <Calendar className="h-7 w-7 mr-3 text-pink-400" />
                  Upcoming Experiences
                </h2>
                <Button variant="outline" size="sm" className="border-pink-400/30 text-pink-300 hover:bg-pink-500/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.events.map((event, index) => renderEventCard(event, index))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="artists" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.artists.map((artist, index) => renderArtistCard(artist, index))}
            </div>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.venues.map((venue, index) => renderVenueCard(venue, index))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.events.map((event, index) => renderEventCard(event, index))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.users.map((user, index) => renderUserCard(user, index))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 