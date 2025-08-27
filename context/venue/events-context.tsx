"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useVenueEvents, type VenueEvent } from "@/app/venue/lib/hooks/use-venue-events"

interface EventsContextType {
  events: VenueEvent[]
  isLoading: boolean
  error: Error | null
  createEvent: (eventData: Omit<VenueEvent, 'id' | 'analytics' | 'attendees' | 'interested' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEvent: (id: string, eventData: Partial<VenueEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  getEventById: (id: string) => VenueEvent | undefined
  getEventBySlug: (slug: string) => VenueEvent | undefined
  filterEvents: (query: string) => VenueEvent[]
  filterEventsByType: (type: VenueEvent['type']) => VenueEvent[]
  filterEventsByDate: (startDate: string, endDate: string) => VenueEvent[]
  filterEventsByLocation: (location: string) => VenueEvent[]
  filterEventsByGenre: (genre: string) => VenueEvent[]
  // Analytics methods
  incrementEventViews: (eventId: string) => void
  incrementEventShares: (eventId: string) => void
  incrementEventLikes: (eventId: string, userId: string) => void
  decrementEventLikes: (eventId: string, userId: string) => void
  addEventRSVP: (eventId: string, userId: string) => void
  removeEventRSVP: (eventId: string, userId: string) => void
  addEventInterest: (eventId: string, userId: string) => void
  removeEventInterest: (eventId: string, userId: string) => void
  // Event sharing
  shareEvent: (eventId: string, platform: string) => Promise<void>
  generateEventLink: (eventId: string) => string
}

const EventsContext = createContext<EventsContextType | undefined>(undefined)

export function EventsProvider({ children }: { children: ReactNode }) {
  const { 
    events, 
    setEvents, 
    isLoading, 
    error,
    filterEvents,
    filterEventsByType,
    filterEventsByDate,
    filterEventsByLocation,
    filterEventsByGenre,
    getEventBySlug,
    incrementEventViews,
    incrementEventShares,
    incrementEventLikes,
    decrementEventLikes,
    addEventRSVP,
    removeEventRSVP,
    addEventInterest,
    removeEventInterest
  } = useVenueEvents()

  // Create a new event
  const createEvent = async (eventData: Omit<VenueEvent, 'id' | 'analytics' | 'attendees' | 'interested' | 'likes' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const newEvent: VenueEvent = {
      ...eventData,
      id: Math.floor(Math.random() * 10000).toString(),
      analytics: {
        views: 0,
        shares: 0,
        rsvps: 0,
        likes: 0,
        comments: 0
      },
      attendees: [],
      interested: [],
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setEvents((prevEvents) => [...prevEvents, newEvent])
  }

  // Update an existing event
  const updateEvent = async (id: string, eventData: Partial<VenueEvent>): Promise<void> => {
    setEvents((prevEvents) => 
      prevEvents.map((event) => 
        event.id === id 
          ? { 
              ...event, 
              ...eventData, 
              updatedAt: new Date().toISOString() 
            } 
          : event
      )
    )
  }

  // Delete an event
  const deleteEvent = async (id: string): Promise<void> => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id))
  }

  // Get event by ID
  const getEventById = (id: string): VenueEvent | undefined => {
    return events.find((event) => event.id === id)
  }

  // Share event
  const shareEvent = async (eventId: string, platform: string): Promise<void> => {
    const event = getEventById(eventId)
    if (!event) return

    // Increment shares count
    incrementEventShares(eventId)

    const eventUrl = generateEventLink(eventId)
    const shareText = `Check out ${event.title} on Tourify!`

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`)
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`)
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`)
        break
      case 'copy':
        await navigator.clipboard.writeText(`${shareText} ${eventUrl}`)
        break
      default:
        if (navigator.share) {
          await navigator.share({
            title: event.title,
            text: shareText,
            url: eventUrl
          })
        }
    }
  }

  // Generate event link
  const generateEventLink = (eventId: string): string => {
    const event = getEventById(eventId)
    if (!event) return ''
    
    return `${window.location.origin}/events/${event.slug}`
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
        getEventBySlug,
        filterEvents,
        filterEventsByType,
        filterEventsByDate,
        filterEventsByLocation,
        filterEventsByGenre,
        incrementEventViews,
        incrementEventShares,
        incrementEventLikes,
        decrementEventLikes,
        addEventRSVP,
        removeEventRSVP,
        addEventInterest,
        removeEventInterest,
        shareEvent,
        generateEventLink
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
