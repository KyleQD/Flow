"use client"

import { useState, useEffect } from "react"

export interface VenueEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  venue: string
  isPublic: boolean
  capacity: number
  image?: string
  type: "performance" | "meeting" | "recording" | "media"
  // New fields for enhanced event lifecycle
  slug: string
  organizerId: string
  organizerName?: string
  organizerAvatar?: string
  tags: string[]
  flyer?: string
  links?: {
    ticketUrl?: string
    socialMedia?: string[]
    website?: string
  }
  // Analytics fields
  analytics: {
    views: number
    shares: number
    rsvps: number
    likes: number
    comments: number
    lastViewed?: string
  }
  // Engagement tracking
  attendees: string[]
  interested: string[]
  likes: string[]
  createdAt: string
  updatedAt: string
}

export function useVenueEvents() {
  const [events, setEvents] = useState<VenueEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const filterEvents = (query: string) => {
    return events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  const filterEventsByType = (type: VenueEvent['type']) => {
    return events.filter(event => event.type === type)
  }

  const filterEventsByDate = (startDate: string, endDate: string) => {
    return events.filter(event => 
      event.startDate >= startDate && event.startDate <= endDate
    )
  }

  const filterEventsByLocation = (location: string) => {
    return events.filter(event => 
      event.location.toLowerCase().includes(location.toLowerCase())
    )
  }

  const filterEventsByGenre = (genre: string) => {
    return events.filter(event => 
      event.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
    )
  }

  const getEventBySlug = (slug: string) => {
    return events.find(event => event.slug === slug)
  }

  const incrementEventViews = (eventId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                views: event.analytics.views + 1,
                lastViewed: new Date().toISOString()
              }
            }
          : event
      )
    )
  }

  const incrementEventShares = (eventId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                shares: event.analytics.shares + 1
              }
            }
          : event
      )
    )
  }

  const incrementEventLikes = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                likes: event.analytics.likes + 1
              },
              likes: [...event.likes, userId]
            }
          : event
      )
    )
  }

  const decrementEventLikes = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                likes: Math.max(0, event.analytics.likes - 1)
              },
              likes: event.likes.filter(id => id !== userId)
            }
          : event
      )
    )
  }

  const addEventRSVP = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                rsvps: event.analytics.rsvps + 1
              },
              attendees: [...event.attendees, userId]
            }
          : event
      )
    )
  }

  const removeEventRSVP = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              analytics: {
                ...event.analytics,
                rsvps: Math.max(0, event.analytics.rsvps - 1)
              },
              attendees: event.attendees.filter(id => id !== userId)
            }
          : event
      )
    )
  }

  const addEventInterest = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              interested: [...event.interested, userId]
            }
          : event
      )
    )
  }

  const removeEventInterest = (eventId: string, userId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? {
              ...event,
              interested: event.interested.filter(id => id !== userId)
            }
          : event
      )
    )
  }

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchEvents = async () => {
      try {
        // Mock data for now
        const mockEvents: VenueEvent[] = [
          {
            id: "1",
            title: "Test Event",
            description: "This is a test event",
            startDate: "2024-05-01T18:00:00",
            endDate: "2024-05-01T22:00:00",
            location: "Test Location",
            venue: "Test Venue",
            isPublic: true,
            capacity: 100,
            image: "/images/event-1.jpg",
            type: "performance",
            slug: "test-event",
            organizerId: "artist-1",
            organizerName: "Test Artist",
            organizerAvatar: "/avatars/artist-1.jpg",
            tags: ["rock", "live", "concert"],
            flyer: "/flyers/test-event.jpg",
            links: {
              ticketUrl: "https://tickets.example.com/test-event",
              socialMedia: ["https://instagram.com/testartist"],
              website: "https://testartist.com"
            },
            analytics: {
              views: 150,
              shares: 25,
              rsvps: 45,
              likes: 67,
              comments: 12,
              lastViewed: "2024-01-15T10:30:00Z"
            },
            attendees: ["user-1", "user-2", "user-3"],
            interested: ["user-4", "user-5"],
            likes: ["user-1", "user-2", "user-6"],
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-15T10:30:00Z"
          }
        ]
        setEvents(mockEvents)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch events"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { 
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
  }
} 