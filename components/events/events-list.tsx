"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Event {
  id: string
  title: string
  performer: string
  date: string
  time: string
  status: string
  ticketsSold: number
  totalTickets: number
  ticketPrice: string
  revenue: string
  description: string
  image: string
  venue: string
  genres: string[]
  promoter: string
  staffAssigned: string[]
  createdAt: string
}

interface EventsListProps {
  events: Event[]
  selectedEventId: string | null
  onSelectEvent: (id: string) => void
}

export function EventsList({ events, selectedEventId, onSelectEvent }: EventsListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">Upcoming</Badge>
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-0">Completed</Badge>
      case "draft":
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0">Draft</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">Cancelled</Badge>
      default:
        return <Badge className="bg-white/10 text-white hover:bg-white/20 border-0">{status}</Badge>
    }
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="bg-[#0f1117] rounded-md p-4 text-center text-white/60">No events match your filters</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-md cursor-pointer transition-colors ${
                selectedEventId === event.id
                  ? "bg-purple-600/20 border border-purple-600/50"
                  : "bg-[#0f1117] hover:bg-[#0f1117]/80"
              }`}
              onClick={() => onSelectEvent(event.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-white">{event.title}</h3>
                {getStatusBadge(event.status)}
              </div>
              <p className="text-white/60 text-sm mb-2">{event.performer}</p>
              <div className="flex justify-between text-xs text-white/40">
                <span>{event.date}</span>
                <span>
                  {event.ticketsSold}/{event.totalTickets} tickets
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
