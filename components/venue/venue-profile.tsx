"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Edit,
  FileText,
  ImageIcon,
  Info,
  MapPin,
  MessageSquare,
  Music,
  Share2,
  Star,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VenueOverview } from "@/components/venue/venue-profile/venue-overview"
import { VenueEvents } from "@/components/venue/venue-profile/venue-events"
import { VenueGallery } from "@/components/venue/venue-profile/venue-gallery"
import { VenueTeam } from "@/components/venue/venue-profile/venue-team"
import { VenueDocuments } from "@/components/venue/venue-profile/venue-documents"
import { EditVenueDialog, type VenueData } from "@/components/venue/edit-venue-dialog"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function VenueProfile({ venueId }: { venueId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // This would be fetched from an API in a real application
  const [venueData, setVenueData] = useState<VenueData>({
    id: venueId,
    name: "The Echo Lounge",
    type: "Music Venue",
    location: "Atlanta, GA",
    capacity: 1200,
    rating: 4.8,
    reviewCount: 124,
    description:
      "The Echo Lounge is a premier music venue located in the heart of Atlanta. With state-of-the-art sound and lighting systems, we provide an unforgettable experience for both artists and audiences. Our venue hosts a variety of events from live concerts to private functions.",
    amenities: [
      "Professional Sound System",
      "Full Bar",
      "Green Room",
      "Backstage Area",
      "VIP Section",
      "Merchandise Area",
    ],
    contactEmail: "bookings@echolounge.com",
    contactPhone: "(404) 555-1234",
    website: "https://echolounge.com",
    socialMedia: {
      instagram: "@echoloungeatl",
      twitter: "@echoloungeatl",
      facebook: "EchoLoungeATL",
    },
  })

  useEffect(() => {
    // Simulate loading venue data
    const fetchVenueData = async () => {
      try {
        // In a real app, this would be an API call
        setIsLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load venue data",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchVenueData()
  }, [venueId])

  const handleSaveVenueData = async (updatedVenue: VenueData) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setVenueData(updatedVenue)
      toast({
        title: "Profile updated",
        description: "Your venue profile has been updated successfully.",
        variant: "default",
        className: "bg-green-600 text-white border-green-700",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update venue profile",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const isOwner = user?.role === "venue" && user?.id === venueData.id

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="relative h-64 bg-gradient-to-r from-purple-900 to-purple-700">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container relative z-10 flex h-full flex-col justify-end p-6">
          <div className="mb-4 flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-purple-500">
              Back to Dashboard
            </Link>
            <Badge className="bg-purple-600 text-white hover:bg-purple-700">{venueData.type}</Badge>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{venueData.name}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{venueData.location}</span>
                <span className="text-white/40">•</span>
                <span>Capacity: {venueData.capacity}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="bg-black/20 text-white hover:bg-black/40">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button className="bg-white text-purple-900 hover:bg-white/90">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-lg font-bold text-white">{venueData.rating}</span>
              <span className="text-sm text-white/60">({venueData.reviewCount} reviews)</span>
            </div>
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            <div className="text-sm text-white/80">
              <span className="font-medium text-white">ID:</span> {venueData.id}
            </div>
          </div>

          {isOwner && (
            <Button
              variant="outline"
              className="border-[#1a1d29] text-white hover:bg-[#1a1d29]"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#1a1d29] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Info className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <ImageIcon className="mr-2 h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="music" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Music className="mr-2 h-4 w-4" />
              Music
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <VenueOverview venue={venueData} />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <VenueEvents venueId={venueId} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <VenueGallery venueId={venueId} />
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <VenueTeam venueId={venueId} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <VenueDocuments venueId={venueId} />
          </TabsContent>

          <TabsContent value="music" className="mt-6">
            <Card className="bg-[#1a1d29] border-0 text-white">
              <CardContent className="p-6">
                <div className="flex h-64 flex-col items-center justify-center">
                  <Music className="h-16 w-16 text-white/20" />
                  <p className="mt-4 text-center text-white/60">Music content will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EditVenueDialog
        venue={venueData}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveVenueData}
      />
    </div>
  )
}
