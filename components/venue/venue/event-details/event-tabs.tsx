"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import type { VenueEvent } from "@/lib/hooks/use-venue-events"
import DetailsTab from "./details-tab"
import AttendeesTab from "./attendees-tab"
import EquipmentTab from "./equipment-tab"
import FinancialsTab from "./financials-tab"

interface EventTabsProps {
  event: VenueEvent
}

export default function EventTabs({ event }: EventTabsProps) {
  const router = useRouter()

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <Button onClick={() => router.push(`/events/${event.id}/attendance`)}>
          <Users className="h-4 w-4 mr-2" />
          Attendance Manager
        </Button>
      </div>

      <TabsContent value="details">
        <DetailsTab event={event} />
      </TabsContent>

      <TabsContent value="attendees">
        <AttendeesTab event={event} />
      </TabsContent>

      <TabsContent value="equipment">
        <EquipmentTab event={event} />
      </TabsContent>

      <TabsContent value="financials">
        <FinancialsTab event={event} />
      </TabsContent>
    </Tabs>
  )
}
