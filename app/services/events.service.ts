import "server-only"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type Event } from "@/app/types/events.types" // Assuming this type will be created

interface FetchActiveEventsError {
  error: string
}

// Placeholder for a more specific event type if needed for the active events section
// We might only need a subset of fields from the main Event type.
export interface ActiveEvent {
  id: string
  name: string
  ticketSalesPercentage: number
  // Add other fields if necessary, e.g., event_date for sorting
  startDate: string // Or Date, depending on how we want to handle it
}

/**
 * Fetches a list of active events (e.g., most recent or upcoming).
 * For now, let's fetch 3 events, ordered by start_date (descending for recent, ascending for upcoming).
 * We'll assume "active" means upcoming or very recent.
 */
export async function fetchActiveEvents(): Promise<ActiveEvent[] | FetchActiveEventsError> {
  const cookieStore = cookies()
  const supabase = createClient()

  // Explicitly type the expected shape of event data from the query
  type FetchedEventData = Pick<Event, 'id' | 'name' | 'start_date' | 'tickets_sold' | 'total_tickets'>

  const { data, error } = await supabase
    .from("events")
    .select("id, name, start_date, tickets_sold, total_tickets")
    .order("start_date", { ascending: false }) // Fetch most recent first, adjust if "upcoming" is preferred
    .limit(3)

  if (error) {
    console.error("Error fetching active events:", error)
    return { error: "Failed to fetch active events. Please try again later." }
  }

  if (!data) {
    return [] // Or handle as an error if events are expected
  }

  // Now 'event' in map will be correctly typed as FetchedEventData
  return (data as FetchedEventData[]).map((event) => ({
    id: event.id,
    name: event.name,
    // Ensure tickets_sold and total_tickets are treated as numbers
    ticketSalesPercentage: event.total_tickets > 0 
      ? (Number(event.tickets_sold) / Number(event.total_tickets)) * 100 
      : 0,
    startDate: event.start_date,
  }))
}

// It's good practice to also define the main Event type if it doesn't exist.
// For now, this is a placeholder. Create this file if it's not already there.
// file: app/types/events.types.ts
// export interface Event {
//   id: string;
//   name: string;
//   description?: string;
//   start_date: string; // ISO string
//   end_date?: string;  // ISO string
//   total_tickets: number;
//   tickets_sold: number;
//   // ... other event fields
// } 