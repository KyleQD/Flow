"use client"

import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import EventHeader from "../components/event-details/event-header"
import EventTabs from "../components/event-details/event-tabs"
import { useVenueEvents } from "../lib/hooks/use-venue-events"

interface EventDetailsPageProps {
  params: {
    id: string
  }
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { events, isLoading } = useVenueEvents()
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  useEffect(() => {
    if (events && events.length > 0) {
      // Find the event that matches the ID from params
      const event = events.find((e: any) => e.id === params.id)
      if (event) {
        setSelectedEvent(event)
      } else {
        notFound()
      }
    }
  }, [events, params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!selectedEvent) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <EventHeader event={selectedEvent} />
      <EventTabs event={selectedEvent} />
    </div>
  )
}
