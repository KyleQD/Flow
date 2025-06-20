"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  type: string
  status: string
  attendance?: number
  capacity: number
  ticketPrice: number
  isPublic: boolean
}

interface EventsContextType {
  events: Event[]
  createEvent: (event: Omit<Event, "id">) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  deleteEvent: (id: string) => void
}

const EventsContext = createContext<EventsContextType>({
  events: [],
  createEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
})

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])

  const createEvent = useCallback((event: Omit<Event, "id">) => {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    }
    setEvents((prev) => [...prev, newEvent])
  }, [])

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    )
  }, [])

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }, [])

  return (
    <EventsContext.Provider
      value={{
        events,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider")
  }
  return context
} 