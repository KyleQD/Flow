"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Music, 
  Video, 
  Mic, 
  Users2,
  Sparkles,
  TrendingUp,
  Plus
} from "lucide-react"
import { useEvents } from "@/context/venue/events-context"
import { useAuth } from "@/contexts/auth-context"
import { EnhancedEventCard } from "./enhanced-event-card"
import { EnhancedEventCreator } from "./enhanced-event-creator"
import type { VenueEvent } from "@/app/venue/lib/hooks/use-venue-events"

interface EnhancedDiscoverEventsProps {
  className?: string
}

export function EnhancedDiscoverEvents({ className }: EnhancedDiscoverEventsProps) {
  const { 
    events, 
    filterEvents, 
    filterEventsByType, 
    filterEventsByDate, 
    filterEventsByLocation, 
    filterEventsByGenre 
  } = useEvents()
  const { user } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("date")

  // Get public events only
  const publicEvents = useMemo(() => events.filter(event => event.isPublic), [events])

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...publicEvents]

    // Search filter
    if (searchQuery) {
      filtered = filterEvents(searchQuery)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.type === selectedType)
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter(event => 
        event.tags.some(tag => tag.toLowerCase().includes(selectedGenre.toLowerCase()))
      )
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date()
      const futureDate = new Date()
      
      switch (dateRange) {
        case "today":
          futureDate.setDate(now.getDate() + 1)
          break
        case "week":
          futureDate.setDate(now.getDate() + 7)
          break
        case "month":
          futureDate.setMonth(now.getMonth() + 1)
          break
        case "upcoming":
          futureDate.setMonth(now.getMonth() + 3)
          break
      }
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate)
        return eventDate >= now && eventDate <= futureDate
      })
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case "popularity":
          return b.analytics.views - a.analytics.views
        case "engagement":
          return (b.analytics.likes + b.analytics.comments + b.analytics.shares) - 
                 (a.analytics.likes + a.analytics.comments + a.analytics.shares)
        case "rsvps":
          return b.analytics.rsvps - a.analytics.rsvps
        default:
          return 0
      }
    })

    return filtered
  }, [publicEvents, searchQuery, selectedType, selectedLocation, selectedGenre, dateRange, sortBy])

  // Get unique locations and genres for filters
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(publicEvents.map(event => event.location))]
    return uniqueLocations.sort()
  }, [publicEvents])

  const genres = useMemo(() => {
    const allTags = publicEvents.flatMap(event => event.tags)
    const uniqueGenres = [...new Set(allTags)]
    return uniqueGenres.sort()
  }, [publicEvents])

  const handleEventClick = (event: VenueEvent) => {
    // Navigate to event page
    window.location.href = `/events/${event.slug}`
  }

  const handleEventCreated = (event: VenueEvent) => {
    // Event was created successfully
    setIsCreateModalOpen(false)
  }

  const getEventTypeIcon = (type: VenueEvent['type']) => {
    switch (type) {
      case 'performance':
        return <Music className="h-4 w-4" />
      case 'recording':
        return <Video className="h-4 w-4" />
      case 'meeting':
        return <Users2 className="h-4 w-4" />
      case 'media':
        return <Mic className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Discover Events</h2>
            <p className="text-sm text-gray-400">
              {filteredEvents.length} events found
            </p>
          </div>
        </div>
        
        {user && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Event Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="recording">Recording</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>

            {/* Location */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Genre */}
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue placeholder="When" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <span className="text-sm text-gray-400">Sort by:</span>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("date")}
                className={sortBy === "date" ? "bg-purple-600" : "border-white/20 text-white"}
              >
                Date
              </Button>
              <Button
                variant={sortBy === "popularity" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("popularity")}
                className={sortBy === "popularity" ? "bg-purple-600" : "border-white/20 text-white"}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Popularity
              </Button>
              <Button
                variant={sortBy === "engagement" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("engagement")}
                className={sortBy === "engagement" ? "bg-purple-600" : "border-white/20 text-white"}
              >
                Engagement
              </Button>
              <Button
                variant={sortBy === "rsvps" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rsvps")}
                className={sortBy === "rsvps" ? "bg-purple-600" : "border-white/20 text-white"}
              >
                RSVPs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EnhancedEventCard
              key={event.id}
              event={event}
              onEventClick={handleEventClick}
              showAnalytics={false}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-400/50" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-sm">
                Try adjusting your filters or search terms to find more events.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedType("all")
                setSelectedLocation("all")
                setSelectedGenre("all")
                setDateRange("all")
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Event Type Stats */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['performance', 'recording', 'meeting', 'media'] as const).map((type) => {
              const count = publicEvents.filter(event => event.type === type).length
              return (
                <div key={type} className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getEventTypeIcon(type)}
                  </div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-gray-400 capitalize">{type}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      <EnhancedEventCreator
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
