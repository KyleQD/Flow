"use client"

import { useState } from "react"
import { Bell, Edit, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TourifyLogo } from "@/components/tourify-logo"
import { EditVenueDialog, type VenueData } from "@/components/venue/edit-venue-dialog"
import { toast } from "@/components/ui/use-toast"
import { EnhancedNotificationCenter } from "@/components/notifications/enhanced-notification-center"

export function VenueHeader() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [venueData, setVenueData] = useState<VenueData>({
    id: "venue-123",
    name: "The Echo Lounge",
    type: "Music Venue",
    location: "Atlanta, GA",
    capacity: 1200,
    rating: 4.8,
    reviewCount: 124,
    description:
      "The Echo Lounge is a premier music venue located in the heart of Atlanta. With state-of-the-art sound and lighting systems, we provide an unforgettable experience for both artists and audiences.",
    amenities: ["Professional Sound System", "Full Bar", "Green Room", "Backstage Area"],
    contactEmail: "bookings@echolounge.com",
    contactPhone: "(404) 555-1234",
    website: "https://echolounge.com",
    socialMedia: {
      instagram: "@echoloungeatl",
      twitter: "@echoloungeatl",
      facebook: "EchoLoungeATL",
    },
  })

  const handleSaveVenueData = (updatedVenue: VenueData) => {
    setVenueData(updatedVenue)
    toast({
      title: "Profile updated",
      description: "Your venue profile has been updated successfully.",
      variant: "default",
      className: "bg-green-600 text-white border-green-700",
    })
  }

  return (
    <header className="border-b border-[#1a1d29] bg-[#0f1117] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TourifyLogo className="h-6 w-auto text-white" />
          <div>
            <h1 className="text-xl font-bold text-white">{venueData.name}</h1>
            <div className="text-sm text-white/60">Venue Management Dashboard</div>
          </div>
          <div className="ml-2 px-2 py-1 text-xs font-medium text-white bg-purple-900/50 rounded-md">
            {venueData.type}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search..."
              className="pl-8 bg-[#1a1d29] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40">⌘K</div>
          </div>

          <EnhancedNotificationCenter />

          <Button className="bg-white text-[#0f1117] hover:bg-white/90" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <EditVenueDialog
        venue={venueData}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveVenueData}
      />
    </header>
  )
}
