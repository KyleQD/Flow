"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventsViewProps {
  darkMode: boolean
  upcomingEvents: any[]
}

export function EventsView({ darkMode, upcomingEvents }: EventsViewProps) {
  const [activeTab, setActiveTab] = useState("upcoming")
  const { toast } = useToast()

  // Mock past events
  const pastEvents = [
    {
      id: 1,
      title: "Winter Music Conference",
      date: "Jan 15-17, 2023",
      location: "Miami, FL",
      attendees: 1200,
    },
    {
      id: 2,
      title: "Sound Engineering Workshop",
      date: "Feb 28, 2023",
      location: "Nashville, TN",
      attendees: 75,
    },
  ]

  // Mock my events
  const myEvents = [
    {
      id: 1,
      title: "Tour Planning Session",
      date: "May 5, 2023",
      location: "Online",
      attendees: 8,
      isOrganizer: true,
    },
    {
      id: 2,
      title: "Production Team Meetup",
      date: "May 12, 2023",
      location: "Los Angeles, CA",
      attendees: 15,
      isOrganizer: false,
    },
  ]

  const handleRSVP = (eventTitle: string) => {
    toast({
      title: "RSVP Confirmed",
      description: `You're attending ${eventTitle}`,
    })
  }

  const handleCreateEvent = () => {
    toast({
      title: "Create Event",
      description: "Opening event creation form",
    })
  }

  return (
    <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Events</CardTitle>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateEvent}>
          <Plus className="h-4 w-4 mr-2" /> Create Event
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Upcoming
            </TabsTrigger>
            <TabsTrigger value="my-events" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> My Events
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} hover:bg-opacity-80`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleRSVP(event.title)}>
                    RSVP
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="my-events" className="space-y-4">
            {myEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} hover:bg-opacity-80`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      {event.isOrganizer && <Badge className="ml-2 bg-green-600">Organizer</Badge>}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} hover:bg-opacity-80 opacity-80`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  <Button variant="outline">View Recap</Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
