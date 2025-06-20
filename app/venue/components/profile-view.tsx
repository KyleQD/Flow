"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  MapPin,
  Calendar,
  ImageIcon,
  Ticket,
  FileText,
  DollarSign,
  Wifi,
  ParkingMeterIcon as Parking,
  Accessibility,
  Music,
  Coffee,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileViewProps {
  darkMode: boolean
  venue: any
}

export function ProfileView({ darkMode, venue }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState("about")
  const { toast } = useToast()

  // Mock venue specs data
  const venueSpecs = {
    capacity: 850,
    soundSystem: "Meyer Sound with 32-channel Midas console",
    lighting: "Full DMX system with moving heads and LED pars",
    stage: "24' x 16' with 3' height",
    greenRoom: true,
    parking: "25 spots on-site, street parking available",
    accessibility: "ADA compliant with wheelchair ramp and accessible restrooms",
    bar: "Full-service bar with craft cocktails and local beers",
    foodService: "Small plates menu available until 10pm",
  }

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      artist: "The Resonants",
      date: "June 15, 2023",
      ticketsSold: 450,
      capacity: 850,
      status: "Confirmed",
    },
    {
      id: 2,
      artist: "Midnight Echo",
      date: "June 22, 2023",
      ticketsSold: 325,
      capacity: 850,
      status: "On Sale",
    },
  ]

  // Mock gallery
  const gallery = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `gallery${i + 1}`,
      url: `/placeholder.svg?height=200&width=200&text=Venue+${i + 1}`,
      alt: `Venue photo ${i + 1}`,
    }))

  // Mock amenities
  const amenities = [
    { name: "Wi-Fi", icon: <Wifi className="h-4 w-4 mr-2" /> },
    { name: "Parking", icon: <Parking className="h-4 w-4 mr-2" /> },
    { name: "ADA Access", icon: <Accessibility className="h-4 w-4 mr-2" /> },
    { name: "Green Room", icon: <Coffee className="h-4 w-4 mr-2" /> },
    { name: "Sound System", icon: <Music className="h-4 w-4 mr-2" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-purple-500">
              <AvatarImage src={venue.avatar || "/placeholder.svg"} alt={venue.name} />
              <AvatarFallback>
                {venue.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{venue.name}</h2>
              <p className="text-gray-500">@{venue.username}</p>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <Badge className="bg-purple-600">{venue.type}</Badge>
              </div>
              <div className="flex items-center justify-center md:justify-start mt-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {venue.location}
              </div>
              <p className="mt-4 text-sm">{venue.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700">Edit Profile</Button>
              <Button variant="outline">Share Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
        <CardContent className="p-0">
          <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b border-gray-700 bg-transparent p-0">
              <TabsTrigger
                value="about"
                className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                Venue Specs
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                Events
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        {amenity.icon}
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} text-center`}>
                      <p className="text-2xl font-bold">{venue.stats.events}</p>
                      <p className="text-sm text-gray-500">Events Hosted</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} text-center`}>
                      <p className="text-2xl font-bold">{venue.stats.capacity}</p>
                      <p className="text-sm text-gray-500">Capacity</p>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} text-center`}>
                      <p className="text-2xl font-bold">{venue.stats.rating}</p>
                      <p className="text-sm text-gray-500">Rating</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Booking Information</h3>
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className="mb-2">To book this venue, please contact:</p>
                    <p className="font-medium">{venue.bookingContact.name}</p>
                    <p>{venue.bookingContact.email}</p>
                    <p>{venue.bookingContact.phone}</p>
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Request Booking
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                    Venue Specifications
                  </h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Capacity</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.capacity} people</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Stage Dimensions</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.stage}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Sound System</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.soundSystem}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Lighting</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.lighting}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Parking</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.parking}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Accessibility</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.accessibility}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Bar Service</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.bar}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Food Service</h4>
                          <p className="text-sm text-gray-500">{venueSpecs.foodService}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-400" />
                    Documents & Resources
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Stage Plot & Technical Rider
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Floor Plan
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Booking Policy
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Hospitality Information
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <div className="flex justify-between">
                          <h4 className="font-medium">{event.artist}</h4>
                          <span className="text-sm text-gray-500">{event.date}</span>
                        </div>
                        <div className="mt-2 flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-purple-400" />
                          <span className="text-sm">
                            {event.ticketsSold} / {event.capacity} tickets sold
                          </span>
                          <Badge className="ml-4" variant="outline">
                            {event.status}
                          </Badge>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline">
                            Event Details
                          </Button>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            Buy Tickets
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4" variant="outline">
                    View All Events
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
                    Booking Calendar
                  </h3>
                  <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <p className="mb-4">Check availability and request dates for your event.</p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Availability Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-purple-400" />
                    Venue Gallery
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="relative group rounded-lg overflow-hidden">
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.alt}
                        className="w-full h-auto aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white border-white"
                          onClick={() => {
                            toast({
                              title: "View image",
                              description: "Opening image in full view",
                            })
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
