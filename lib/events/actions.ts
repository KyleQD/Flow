"use server"

import { revalidatePath } from "next/cache"

// In a real app, this would interact with a database
// For this demo, we'll simulate API responses

// Mock database
let events = [
  {
    id: "1",
    title: "Summer Jam Festival",
    performer: "Various Artists",
    date: "June 15, 2025",
    time: "6:00 PM - 11:00 PM",
    status: "upcoming",
    ticketsSold: 450,
    totalTickets: 850,
    ticketPrice: "$35",
    revenue: "$15,750",
    description:
      "A summer music festival featuring a lineup of local and regional artists across multiple genres. Food vendors and merchandise will be available.",
    image: "/vibrant-summer-beats.png",
    venue: "Main Stage",
    genres: ["Rock", "Pop", "Hip-Hop"],
    promoter: "Echo Events",
    staffAssigned: ["Alex Johnson", "Sarah Williams", "Michael Chen"],
    createdAt: "January 15, 2025",
  },
  {
    id: "2",
    title: "Midnight Echo",
    performer: "The Midnight Echoes",
    date: "June 22, 2025",
    time: "9:00 PM - 1:00 AM",
    status: "upcoming",
    ticketsSold: 325,
    totalTickets: 850,
    ticketPrice: "$25",
    revenue: "$8,125",
    description:
      "Album release party for The Midnight Echoes' new album 'Neon Dreams'. Special guest performances and exclusive merchandise available.",
    image: "/energetic-stage-performance.png",
    venue: "Main Stage",
    genres: ["Indie Rock", "Alternative"],
    promoter: "Soundwave Promotions",
    staffAssigned: ["Jessica Rodriguez", "David Kim"],
    createdAt: "February 5, 2025",
  },
  {
    id: "3",
    title: "Jazz Night",
    performer: "The Blue Note Quartet",
    date: "June 28, 2025",
    time: "8:00 PM - 11:00 PM",
    status: "upcoming",
    ticketsSold: 275,
    totalTickets: 850,
    ticketPrice: "$30",
    revenue: "$8,250",
    description:
      "An intimate evening of jazz classics and original compositions by The Blue Note Quartet. Cocktail service available throughout the performance.",
    image: "/smoky-jazz-night.png",
    venue: "Lounge Area",
    genres: ["Jazz", "Blues"],
    promoter: "Blue Note Productions",
    staffAssigned: ["Robert Johnson", "Emily Taylor"],
    createdAt: "February 20, 2025",
  },
  {
    id: "4",
    title: "Electronic Dance Night",
    performer: "DJ Electra",
    date: "May 12, 2025",
    time: "10:00 PM - 3:00 AM",
    status: "completed",
    ticketsSold: 750,
    totalTickets: 850,
    ticketPrice: "$20",
    revenue: "$15,000",
    description:
      "A night of electronic music featuring DJ Electra and special guests. Full light show and sound system.",
    image: "/vibrant-dj-set.png",
    venue: "Main Stage",
    genres: ["Electronic", "Dance", "House"],
    promoter: "Pulse Promotions",
    staffAssigned: ["Alex Johnson", "Michael Chen"],
    createdAt: "January 10, 2025",
  },
  {
    id: "5",
    title: "Rock Revival",
    performer: "Thunderstruck",
    date: "May 20, 2025",
    time: "7:00 PM - 11:00 PM",
    status: "completed",
    ticketsSold: 820,
    totalTickets: 850,
    ticketPrice: "$30",
    revenue: "$24,600",
    description:
      "A tribute to classic rock with covers of legendary bands. Full bar service and rock-themed decorations.",
    image: "/energetic-stage.png",
    venue: "Main Stage",
    genres: ["Rock", "Classic Rock"],
    promoter: "Rock Legends Promotions",
    staffAssigned: ["Sarah Williams", "Jessica Rodriguez", "David Kim"],
    createdAt: "January 5, 2025",
  },
  {
    id: "6",
    title: "Acoustic Sessions",
    performer: "Various Artists",
    date: "May 5, 2025",
    time: "7:30 PM - 10:30 PM",
    status: "completed",
    ticketsSold: 600,
    totalTickets: 850,
    ticketPrice: "$15",
    revenue: "$9,000",
    description:
      "An intimate evening featuring acoustic performances from local singer-songwriters. Coffee and desserts available.",
    image: "/concert-hall-ambiance.png",
    venue: "Lounge Area",
    genres: ["Acoustic", "Folk", "Singer-Songwriter"],
    promoter: "Echo Events",
    staffAssigned: ["Emily Taylor", "Robert Johnson"],
    createdAt: "December 15, 2024",
  },
  {
    id: "7",
    title: "Hip-Hop Showcase",
    performer: "Urban Collective",
    date: "July 10, 2025",
    time: "8:00 PM - 1:00 AM",
    status: "draft",
    ticketsSold: 0,
    totalTickets: 850,
    ticketPrice: "$25",
    revenue: "$0",
    description:
      "A showcase of local hip-hop talent featuring performances from the Urban Collective and guest artists.",
    image: "/vibrant-hip-hop-stage.png",
    venue: "Main Stage",
    genres: ["Hip-Hop", "R&B"],
    promoter: "Urban Beat Promotions",
    staffAssigned: [],
    createdAt: "March 1, 2025",
  },
  {
    id: "8",
    title: "Comedy Night",
    performer: "Laugh Factory Tour",
    date: "July 15, 2025",
    time: "7:00 PM - 10:00 PM",
    status: "draft",
    ticketsSold: 0,
    totalTickets: 850,
    ticketPrice: "$20",
    revenue: "$0",
    description:
      "A night of stand-up comedy featuring comedians from the Laugh Factory Tour. Full bar service available.",
    image: "/stand-up-spotlight.png",
    venue: "Main Stage",
    genres: ["Comedy"],
    promoter: "Laugh Factory Productions",
    staffAssigned: [],
    createdAt: "March 5, 2025",
  },
]

export async function getEvents() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return events
}

export async function getEvent(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return events.find((event) => event.id === id)
}

export async function createEvent(eventData: any) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Generate a new ID (in a real app, this would be done by the database)
  const newId = (events.length + 1).toString()

  // Format the ticket price
  const formattedTicketPrice =
    typeof eventData.ticketPrice === "number" ? `$${eventData.ticketPrice}` : eventData.ticketPrice

  // Create the new event
  const newEvent = {
    id: newId,
    ...eventData,
    ticketPrice: formattedTicketPrice,
    // Ensure these fields exist
    ticketsSold: eventData.ticketsSold || 0,
    revenue: eventData.revenue || "$0",
    staffAssigned: eventData.staffAssigned || [],
    createdAt: eventData.createdAt || new Date().toISOString(),
  }

  // Add to our "database"
  events = [...events, newEvent]

  // Revalidate the events page to show the new event
  revalidatePath("/events")

  return newEvent
}

export async function updateEvent(id: string, eventData: any) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Find the event
  const eventIndex = events.findIndex((event) => event.id === id)

  if (eventIndex === -1) {
    throw new Error("Event not found")
  }

  // Format the ticket price if it's a number
  const formattedTicketPrice =
    typeof eventData.ticketPrice === "number" ? `$${eventData.ticketPrice}` : eventData.ticketPrice

  // Update the event
  const updatedEvent = {
    ...events[eventIndex],
    ...eventData,
    ticketPrice: formattedTicketPrice,
  }

  // Update our "database"
  events[eventIndex] = updatedEvent

  // Revalidate the events page
  revalidatePath("/events")

  return updatedEvent
}

export async function deleteEvent(id: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Filter out the event
  const initialLength = events.length
  events = events.filter((event) => event.id !== id)

  // Check if an event was actually deleted
  if (events.length === initialLength) {
    throw new Error("Event not found")
  }

  // Revalidate the events page
  revalidatePath("/events")

  return { success: true }
}
