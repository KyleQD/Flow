import { notFound } from "next/navigation"
import EventHeader from "../components/event-details/event-header"
import EventTabs from "../components/event-details/event-tabs"
import { useVenueEvents } from "../../lib/hooks/use-venue-events"

interface EventDetailsPageProps {
  params: {
    id: string
  }
}

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { events, isLoading } = useVenueEvents()

  if (!events) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <EventHeader event={events} />
      <EventTabs event={events} />
    </div>
  )
}
