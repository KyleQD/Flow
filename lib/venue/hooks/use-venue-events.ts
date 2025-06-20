"use client"

import { useState, useEffect } from "react"

export interface VenueEvent {
  id: number
  title: string
  description: string
  date: Date | string
  startTime: string
  endTime: string
  type: string
  status: string
  capacity: number
  ticketPrice: number
  isPublic: boolean
  attendance?: number
}

// Mock events data
const mockEvents: VenueEvent[] = [
  {
    id: 1,
    title: "Summer Jam Festival",
    description: "Annual summer music festival featuring local bands",
    date: new Date(2025, 4, 15),
    startTime: "20:00",
    endTime: "23:30",
    type: "concert",
    status: "confirmed",
    capacity: 250,
    ticketPrice: 25,
    isPublic: true,
    attendance: 180,
  },
  {
    id: 2,
    title: "Midnight Echo",
    description: "Late night electronic music showcase",
    date: new Date(2025, 4, 22),
    startTime: "21:00",
    endTime: "01:00",
    type: "concert",
    status: "confirmed",
    capacity: 250,
    ticketPrice: 20,
    isPublic: true,
    attendance: 210,
  },
  {
    id: 3,
    title: "Jazz Night",
    description: "Weekly jazz performance featuring rotating artists",
    date: new Date(2025, 4, 28),
    startTime: "19:30",
    endTime: "22:30",
    type: "concert",
    status: "confirmed",
    capacity: 250,
    ticketPrice: 15,
    isPublic: true,
    attendance: 150,
  },
  {
    id: 4,
    title: "Electronic Music Showcase",
    description: "Featuring top DJs from around the country",
    date: new Date(2025, 5, 10),
    startTime: "21:00",
    endTime: "02:00",
    type: "request",
    status: "pending",
    capacity: 250,
    ticketPrice: 30,
    isPublic: true,
  },
  {
    id: 5,
    title: "Album Release Party",
    description: "Celebration for local band's new album",
    date: new Date(2025, 5, 15),
    startTime: "20:00",
    endTime: "23:00",
    type: "request",
    status: "pending",
    capacity: 250,
    ticketPrice: 15,
    isPublic: true,
  },
  {
    id: 6,
    title: "Corporate Event",
    description: "Private event for local tech company",
    date: new Date(2025, 5, 22),
    startTime: "18:00",
    endTime: "22:00",
    type: "request",
    status: "pending",
    capacity: 150,
    ticketPrice: 0,
    isPublic: false,
  },
  {
    id: 7,
    title: "Indie Rock Night",
    description: "Showcase of indie rock bands",
    date: new Date(2025, 5, 25),
    startTime: "19:30",
    endTime: "23:30",
    type: "request",
    status: "pending",
    capacity: 250,
    ticketPrice: 18,
    isPublic: true,
  },
  {
    id: 8,
    title: "Venue Maintenance",
    description: "Regular maintenance and cleaning",
    date: new Date(2025, 4, 5),
    startTime: "10:00",
    endTime: "16:00",
    type: "maintenance",
    status: "confirmed",
    capacity: 0,
    ticketPrice: 0,
    isPublic: false,
  },
  {
    id: 9,
    title: "Staff Meeting",
    description: "Monthly staff meeting and training",
    date: new Date(2025, 5, 5),
    startTime: "14:00",
    endTime: "16:00",
    type: "internal",
    status: "confirmed",
    capacity: 0,
    ticketPrice: 0,
    isPublic: false,
  },
  {
    id: 10,
    title: "Comedy Night",
    description: "Stand-up comedy showcase",
    date: new Date(2025, 4, 18),
    startTime: "20:00",
    endTime: "22:00",
    type: "entertainment",
    status: "confirmed",
    capacity: 200,
    ticketPrice: 22,
    isPublic: true,
    attendance: 120,
  },
  {
    id: 11,
    title: "Private Birthday Party",
    description: "30th birthday celebration",
    date: new Date(2025, 4, 12),
    startTime: "19:00",
    endTime: "23:00",
    type: "private",
    status: "confirmed",
    capacity: 100,
    ticketPrice: 0,
    isPublic: false,
    attendance: 75,
  },
]

export function useVenueEvents() {
  const [events, setEvents] = useState<VenueEvent[]>(mockEvents)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simulate loading events
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents)
      setIsLoading(false)
    }, 500)
  }, [])

  // Filter events by status
  const filterEvents = (status: "upcoming" | "past" | "draft" | "my-events") => {
    const now = new Date()

    switch (status) {
      case "upcoming":
        return events.filter((event) => new Date(event.date) >= now && event.status !== "draft")
      case "past":
        return events.filter((event) => new Date(event.date) < now && event.status !== "draft")
      case "draft":
        return events.filter((event) => event.status === "draft")
      case "my-events":
        // In a real app, this would filter by the current user's events
        return events
      default:
        return events
    }
  }

  return {
    events,
    setEvents,
    isLoading,
    error,
    filterEvents,
  }
}
