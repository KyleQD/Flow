import type React from "react"
import { VenueSidebar } from "./venue-sidebar"
import { EventsProvider } from "@/context/venue/events-context"

interface VenueLayoutProps {
  children: React.ReactNode
}

export const VenueLayout = ({ children }: VenueLayoutProps) => {
  return (
    <EventsProvider>
      <div className="flex min-h-screen">
        <VenueSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </EventsProvider>
  )
}

export default VenueLayout
