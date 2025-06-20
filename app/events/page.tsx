"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign, MoreVertical, Search, Plus } from "lucide-react"
import { format } from "date-fns"
import { EventCard } from "@/components/events/event-card"
import { CreateEventDialog } from "@/components/events/create-event-dialog"

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
  status: "upcoming" | "past" | "draft"
  views: number
  ticketsSold: number
  revenue: number
}

// Mock data - replace with actual API calls
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Jam Festival 2025",
    description: "The biggest music festival of the year with an amazing lineup of artists.",
    date: "2025-07-15",
    time: "14:00",
    location: "Central Park, New York",
    venue: "Main Stage",
    capacity: 5000,
    ticketPrice: 49.99,
    category: "Festival",
    coverImage: "/placeholder.svg",
    isPublic: true,
    status: "upcoming",
    views: 124,
    ticketsSold: 0,
    revenue: 0
  },
  // Add more mock events as needed
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("upcoming")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = event.status === activeTab
    return matchesSearch && matchesTab
  })

  const handleEventCreated = (newEvent: Event) => {
    // Here you would typically update your state or make an API call
    console.log("New event created:", newEvent)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Events</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#13151c] border-gray-800"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-[#13151c] border border-gray-800">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-purple-600">
            Past
          </TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-purple-600">
            Drafts
          </TabsTrigger>
        </TabsList>

        {["upcoming", "past", "draft"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {filteredEvents.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No {tab} events found</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
