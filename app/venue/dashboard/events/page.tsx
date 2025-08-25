"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Grid, List, Search, Plus, Music, Film, Users, Tag, Loader2, Mic, Video } from "lucide-react"
import { PageHeader } from "../../components/navigation/page-header"
import { useVenueEvents, type VenueEvent } from "../../lib/hooks/use-venue-events"
import { useRouter } from "next/navigation"

export default function EventsPage() {
  const router = useRouter()
  const { events, isLoading, error, filterEvents } = useVenueEvents()
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "draft" | "my-events">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter events based on active tab and search query
  const filteredEvents = filterEvents(activeTab).filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateEvent = () => {
    router.push("/events/create")
  }

  const handleViewCalendar = () => {
    router.push("/events/calendar")
  }

  const handleViewDetails = (eventId: number) => {
    router.push(`/events/${eventId}`)
  }

  const handleManageEvent = (eventId: number) => {
    router.push(`/events/${eventId}/manage`)
  }

  const renderEventCard = (event: VenueEvent) => (
    <Card key={event.id} className="overflow-hidden">
      <div className="aspect-video w-full relative">
        <img src={event.image || "/placeholder.svg"} alt={event.title} className="object-cover w-full h-full" />
        <div className="absolute top-2 right-2">
          <Badge
            className={`
              ${
                event.type === "performance"
                  ? "bg-purple-600"
                  : event.type === "meeting"
                    ? "bg-blue-600"
                    : event.type === "recording"
                      ? "bg-green-600"
                      : event.type === "media"
                        ? "bg-orange-600"
                        : "bg-gray-600"
              }
              text-white px-2 py-1 rounded text-xs font-medium
            `}
          >
            {event.type === "performance" ? (
              <Music className="h-3 w-3 mr-1" />
            ) : event.type === "meeting" ? (
              <Users className="h-3 w-3 mr-1" />
            ) : event.type === "recording" ? (
              <Mic className="h-3 w-3 mr-1" />
            ) : event.type === "media" ? (
              <Video className="h-3 w-3 mr-1" />
            ) : (
              <Calendar className="h-3 w-3 mr-1" />
            )}
            {event.type === "performance"
              ? "Performance"
              : event.type === "meeting"
                ? "Meeting"
                : event.type === "recording"
                  ? "Recording"
                  : event.type === "media"
                    ? "Media"
                    : "Other"}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {event.startDate} • {event.startDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ticket Sales</span>
            <span className="font-medium">
              {0}/{event.capacity}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${(0 / event.capacity) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(Number(event.id))}>
              Details
            </Button>
            <Button size="sm" onClick={() => handleManageEvent(Number(event.id))}>
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Events"
        description="Manage your venue's upcoming and past events"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleViewCalendar}>
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
            <Button size="sm" onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8 bg-background w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="concert">Concerts</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 border rounded-md">
            <Button variant="ghost" size="icon" className="rounded-r-none">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="upcoming"
        className="space-y-4"
        onValueChange={(value) => setActiveTab(value as "upcoming" | "past" | "draft" | "my-events")}
      >
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>{error.message}</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <p>No events found</p>
                  <Button className="mt-4" onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredEvents.map(renderEventCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredEvents.map(renderEventCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="draft">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredEvents.map(renderEventCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="my-events">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredEvents.map(renderEventCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
