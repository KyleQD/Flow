import * as React from "react"
import { EventCard, AdminEvent } from "./event-card"

interface EventListProps {
  events: AdminEvent[]
  isLoading: boolean
  onEdit: (event: AdminEvent) => void
  onDelete: (event: AdminEvent) => void
  onView: (event: AdminEvent) => void
}

export function EventList({ events, isLoading, onEdit, onDelete, onView }: EventListProps) {
  if (isLoading)
    return <div className="text-center py-8 text-gray-400">Loading events...</div>

  if (!events.length)
    return <div className="text-center py-8 text-gray-400">No events found. Click 'Create Event' to get started.</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  )
} 