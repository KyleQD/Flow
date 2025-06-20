import Link from "next/link"
// import { fetchActiveEvents } from "@/app/services/events.service" // Temporarily commented out
import { StatusItem } from "./StatusItem"
// import { type ActiveEvent } from "@/app/services/events.service" // Temporarily commented out

// Define ActiveEvent type locally for this test
interface ActiveEvent { 
  id: string
  name: string
  ticketSalesPercentage: number
  startDate: string // Or Date, depending on how we want to handle it
}

// Explicitly type the props if any in the future, for now, it takes none.
// interface ActiveEventsListProps {}

// Simulate the ActiveEvent type structure for mock data
const mockEvents: ActiveEvent[] = [
  { id: "1", name: "Mock Summer Festival", ticketSalesPercentage: 75, startDate: "2024-07-01" },
  { id: "2", name: "Mock Concert Series", ticketSalesPercentage: 60, startDate: "2024-08-15" },
  { id: "3", name: "Mock Corporate Event", ticketSalesPercentage: 90, startDate: "2024-09-05" },
]

async function ActiveEventsList(/*props: ActiveEventsListProps*/) {
  // const eventsOrError = await fetchActiveEvents() // Temporarily commented out
  const eventsOrError = mockEvents // Use mock data

  // Error handling for actual fetch can be restored later
  // if ("error" in eventsOrError) { 
  //   console.error("ActiveEventsList Error:", eventsOrError.error)
  //   return <p className="text-xs text-slate-500">Could not load active events.</p>
  // }

  const events: ActiveEvent[] = eventsOrError

  if (events.length === 0) {
    return <p className="text-xs text-slate-500">No active events found.</p>
  }

  const colors = ["purple", "pink", "blue", "green", "yellow"]

  return (
    <div className="space-y-3">
      {events.map((event: ActiveEvent, index: number) => (
        <Link key={event.id} href={`/admin/dashboard/events/${event.id}`} passHref legacyBehavior>
          <a className="block hover:bg-slate-800/60 p-2 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900">
            <StatusItem
              label={event.name}
              value={Math.round(event.ticketSalesPercentage)}
              color={colors[index % colors.length]}
            />
          </a>
        </Link>
      ))}
    </div>
  )
}

export default ActiveEventsList 