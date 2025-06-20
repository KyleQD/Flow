"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MapPin, Users, DollarSign, Share2, BarChart2, Ticket, Settings } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"

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

// Mock data - replace with actual API call
const getEvent = (id: string): Event => ({
  id,
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
})

export default function EventManagePage() {
  const params = useParams()
  const event = getEvent(params.id as string)
  const [activeTab, setActiveTab] = React.useState("overview")

  const formattedDate = format(new Date(`${event.date}T${event.time}`), "MMM d, yyyy")
  const formattedTime = format(new Date(`${event.date}T${event.time}`), "h:mm a")

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <p className="text-gray-400">{formattedDate} at {formattedTime}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/events/${event.id}`}>
              Preview
            </Link>
          </Button>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#13151c] border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-purple-600">
            Tickets
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-[#13151c] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-400">Event Title</Label>
                    <Input
                      id="title"
                      value={event.title}
                      className="bg-[#1a1c23] border-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-400">Description</Label>
                    <Textarea
                      id="description"
                      value={event.description}
                      className="bg-[#1a1c23] border-gray-800 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-gray-400">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={event.date}
                        className="bg-[#1a1c23] border-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-gray-400">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={event.time}
                        className="bg-[#1a1c23] border-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-400">Location</Label>
                      <Input
                        id="location"
                        value={event.location}
                        className="bg-[#1a1c23] border-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue" className="text-gray-400">Venue</Label>
                      <Input
                        id="venue"
                        value={event.venue}
                        className="bg-[#1a1c23] border-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-gray-400">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={event.capacity}
                        className="bg-[#1a1c23] border-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticketPrice" className="text-gray-400">Ticket Price ($)</Label>
                      <Input
                        id="ticketPrice"
                        type="number"
                        step="0.01"
                        value={event.ticketPrice}
                        className="bg-[#1a1c23] border-gray-800"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-[#13151c] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      <span>Views</span>
                    </div>
                    <span className="text-white">{event.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400">
                      <Ticket className="h-4 w-4 mr-2" />
                      <span>Tickets Sold</span>
                    </div>
                    <span className="text-white">{event.ticketsSold}/{event.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Revenue</span>
                    </div>
                    <span className="text-white">${event.revenue.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#13151c] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Event Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Status</span>
                    </div>
                    <span className="text-white capitalize">{event.status}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="bg-[#13151c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Ticket Management</CardTitle>
              <CardDescription className="text-gray-400">
                Manage ticket sales and attendee information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ticket management content will go here */}
              <p className="text-gray-400">Ticket management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-[#13151c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Event Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                View detailed analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Analytics content will go here */}
              <p className="text-gray-400">Analytics features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-[#13151c] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Event Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure event settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Settings content will go here */}
              <p className="text-gray-400">Settings features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 