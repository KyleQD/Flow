"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useVenueEvents, type VenueEvent } from "@/lib/hooks/use-venue-events"

interface EventsContextType {
  events: VenueEvent[]
  isLoading: boolean
  error: string | null
  createEvent: (eventData: VenueEvent) => Promise<void>
  updateEvent: (id: number, eventData: Partial<VenueEvent>) => Promise<void>
  deleteEvent: (id: number) => Promise<void>
  getEventById: (id: number) => VenueEvent | undefined
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: ReactNode }) {
  const { events, setEvents, isLoading, error } = useVenueEvents()

  // Create a new event
  const createEvent = async (eventData: VenueEvent): Promise<void> => {
    // Generate a new ID if one isn't provided
    const newEvent = {
      ...eventData,
      id: eventData.id || Math.floor(Math.random() * 10000),
    }

    // Add the new event to the events array
    setEvents((prevEvents) => [...prevEvents, newEvent])
  }

  // Update an existing event
  const updateEvent = async (id: number, eventData: Partial<VenueEvent>): Promise<void> => {
    setEvents((prevEvents) => prevEvents.map((event) => (event.id === id ? { ...event, ...eventData } : event)))
  }

  // Delete an event
  const deleteEvent = async (id: number): Promise<void> => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id))
  }

  // Get event by ID
  const getEventById = (id: number): VenueEvent | undefined => {
    return events.find((event) => event.id === id)
  }

  return (
    <EventsContext.Provider
      value={{
        events,
        isLoading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider")
  }
  return context
}
