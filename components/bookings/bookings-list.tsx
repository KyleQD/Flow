"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Booking {
  id: string
  title: string
  artist: string
  date: string
  time: string
  status: string
  attendees: number
  fee: string
  description: string
  requirements: string
  contactName: string
  contactEmail: string
  contactPhone: string
  createdAt: string
}

interface BookingsListProps {
  bookings: Booking[]
  selectedBookingId: string | null
  onSelectBooking: (id: string) => void
}

export function BookingsList({ bookings, selectedBookingId, onSelectBooking }: BookingsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">Rejected</Badge>
      default:
        return <Badge className="bg-white/10 text-white hover:bg-white/20 border-0">{status}</Badge>
    }
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-2">
        {bookings.length === 0 ? (
          <div className="bg-[#0f1117] rounded-md p-4 text-center text-white/60">No bookings match your filters</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className={`p-4 rounded-md cursor-pointer transition-colors ${
                selectedBookingId === booking.id
                  ? "bg-purple-600/20 border border-purple-600/50"
                  : "bg-[#0f1117] hover:bg-[#0f1117]/80"
              }`}
              onClick={() => onSelectBooking(booking.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-white">{booking.title}</h3>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-white/60 text-sm mb-2">{booking.artist}</p>
              <div className="flex justify-between text-xs text-white/40">
                <span>{booking.date}</span>
                <span>{booking.attendees} attendees</span>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
