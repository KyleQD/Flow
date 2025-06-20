"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VenueHeader } from "@/components/venue/venue-header"
import { BookingsList } from "@/components/bookings/bookings-list"
import { BookingDetails } from "@/components/bookings/booking-details"
import { BookingsFilters } from "@/components/bookings/bookings-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function BookingsManagement() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // This would be fetched from an API in a real application
  const bookings = [
    {
      id: "1",
      title: "Electronic Music Showcase",
      artist: "DJ Electra",
      date: "July 10, 2025",
      time: "8:00 PM - 1:00 AM",
      status: "pending",
      attendees: 500,
      fee: "$2,500",
      description: "A night of electronic music featuring DJ Electra and special guests.",
      requirements: "Full sound system, lighting rig, and green room access.",
      contactName: "Sarah Johnson",
      contactEmail: "sarah@djelectra.com",
      contactPhone: "(404) 555-1234",
      createdAt: "June 1, 2025",
    },
    {
      id: "2",
      title: "Album Release Party",
      artist: "The Midnight Echoes",
      date: "July 15, 2025",
      time: "7:00 PM - 11:00 PM",
      status: "approved",
      attendees: 350,
      fee: "$1,800",
      description: "Album release party for The Midnight Echoes' new album 'Neon Dreams'.",
      requirements: "Stage plot attached. Need 4 vocal mics, drum kit, and 3 guitar amps.",
      contactName: "Michael Chen",
      contactEmail: "michael@midnightechoes.com",
      contactPhone: "(404) 555-2345",
      createdAt: "May 28, 2025",
    },
    {
      id: "3",
      title: "Corporate Event",
      artist: "TechCorp Inc.",
      date: "July 22, 2025",
      time: "6:00 PM - 10:00 PM",
      status: "pending",
      attendees: 200,
      fee: "$3,500",
      description: "Annual company gathering with keynote speeches and networking.",
      requirements: "Projector, screen, podium, and wireless microphones.",
      contactName: "Jessica Rodriguez",
      contactEmail: "jessica@techcorp.com",
      contactPhone: "(404) 555-3456",
      createdAt: "June 5, 2025",
    },
    {
      id: "4",
      title: "Jazz Night",
      artist: "The Blue Note Quartet",
      date: "July 28, 2025",
      time: "7:30 PM - 10:30 PM",
      status: "approved",
      attendees: 150,
      fee: "$1,200",
      description: "An intimate evening of jazz classics and original compositions.",
      requirements: "Grand piano, upright bass, drum kit, and stage lighting.",
      contactName: "Robert Johnson",
      contactEmail: "robert@bluenotequartet.com",
      contactPhone: "(404) 555-4567",
      createdAt: "May 15, 2025",
    },
    {
      id: "5",
      title: "Rock Revival",
      artist: "Thunderstruck",
      date: "August 5, 2025",
      time: "9:00 PM - 12:00 AM",
      status: "rejected",
      attendees: 400,
      fee: "$2,000",
      description: "A tribute to classic rock with covers of legendary bands.",
      requirements: "Full PA system, lighting, and smoke machines.",
      contactName: "Alex Thompson",
      contactEmail: "alex@thunderstruck.com",
      contactPhone: "(404) 555-5678",
      createdAt: "June 10, 2025",
    },
    {
      id: "6",
      title: "Indie Showcase",
      artist: "Various Artists",
      date: "August 12, 2025",
      time: "7:00 PM - 11:00 PM",
      status: "pending",
      attendees: 250,
      fee: "$1,500",
      description: "Showcase featuring 4 up-and-coming indie bands.",
      requirements: "Basic backline for all bands, quick changeover setup.",
      contactName: "Emma Wilson",
      contactEmail: "emma@indieshowcase.com",
      contactPhone: "(404) 555-6789",
      createdAt: "June 15, 2025",
    },
  ]

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus
    const matchesSearch =
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.artist.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const selectedBooking = selectedBookingId ? bookings.find((booking) => booking.id === selectedBookingId) : null

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <VenueHeader />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Booking Management</h1>
              <p className="text-white/60">Manage your venue booking requests and schedule</p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Booking
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <BookingsFilters
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <BookingsList
                bookings={filteredBookings}
                selectedBookingId={selectedBookingId}
                onSelectBooking={setSelectedBookingId}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedBooking ? (
                <BookingDetails booking={selectedBooking} />
              ) : (
                <div className="bg-[#1a1d29] rounded-lg border-0 text-white p-8 h-full flex flex-col items-center justify-center">
                  <div className="text-white/20 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-medium text-white mb-2">No Booking Selected</h3>
                  <p className="text-white/60 text-center max-w-md">
                    Select a booking from the list to view details, or create a new booking to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
