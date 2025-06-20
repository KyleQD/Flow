"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, MapPin, Users, DollarSign, MoreVertical, Search, Plus, Copy, Archive, Trash2 } from "lucide-react"
import { format } from "date-fns"
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
    ticketsSold: 150,
    revenue: 7500
  },
  {
    id: "2",
    title: "Rock Night Live",
    description: "A night of classic rock hits performed by top tribute bands.",
    date: "2025-08-20",
    time: "19:00",
    location: "Madison Square Garden",
    venue: "Main Arena",
    capacity: 2000,
    ticketPrice: 39.99,
    category: "Concert",
    coverImage: "/placeholder.svg",
    isPublic: true,
    status: "upcoming",
    views: 89,
    ticketsSold: 100,
    revenue: 5000
  }
]

export default function BusinessEventsPage() {
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

  const handleEventAction = (eventId: string, action: string) => {
    // Here you would typically handle the event action
    console.log(`Event ${eventId} action:`, action)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="text-gray-400">Manage your events and ticket sales</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#13151c] border-gray-800"
          />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="bg-[#13151c] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-48 h-32 rounded-lg overflow-hidden">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white truncate">
                            {event.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                              {event.category}
                            </Badge>
                            {event.isPublic ? (
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                Public
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                Private
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1c23] border-gray-800">
                            <DropdownMenuItem
                              onClick={() => handleEventAction(event.id, "edit")}
                              className="text-gray-400 focus:text-white focus:bg-gray-800"
                            >
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEventAction(event.id, "duplicate")}
                              className="text-gray-400 focus:text-white focus:bg-gray-800"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEventAction(event.id, "archive")}
                              className="text-gray-400 focus:text-white focus:bg-gray-800"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEventAction(event.id, "delete")}
                              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="mt-2 text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <div className="text-sm">
                            {format(new Date(`${event.date}T${event.time}`), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <MapPin className="h-4 w-4 mr-2" />
                          <div className="text-sm truncate">
                            {event.venue}
                          </div>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Users className="h-4 w-4 mr-2" />
                          <div className="text-sm">
                            {event.ticketsSold}/{event.capacity} sold
                          </div>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <div className="text-sm">
                            ${event.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No {activeTab} events found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
} 