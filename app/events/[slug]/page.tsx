import { EnhancedEventPage } from "@/components/events/enhanced-event-page"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Find event by slug
  const { data: event, error } = await supabase
    .from('artist_events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !event) {
    notFound()
  }

  return <EnhancedEventPage eventId={event.id} event={event} />
}
