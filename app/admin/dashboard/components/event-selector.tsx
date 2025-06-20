"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EventSelector() {
  const [selectedEvent, setSelectedEvent] = useState("summer-festival")

  // Calculate days until event
  const daysUntilEvent = () => {
    const eventDate = new Date("2023-08-15")
    const today = new Date()
    const diffTime = Math.abs(eventDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="flex items-center space-x-4">
      <Select defaultValue={selectedEvent} onValueChange={setSelectedEvent}>
        <SelectTrigger className="w-[240px] bg-slate-800/70 border-slate-700">
          <SelectValue placeholder="Select Event" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="summer-festival">Summer Music Festival 2023</SelectItem>
          <SelectItem value="concert-series">Downtown Concert Series</SelectItem>
          <SelectItem value="corporate-event">TechCorp Annual Conference</SelectItem>
          <SelectItem value="charity-gala">Charity Fundraiser Gala</SelectItem>
        </SelectContent>
      </Select>
      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
        {daysUntilEvent()} days until event
      </Badge>
      <Button className="bg-purple-600 hover:bg-purple-700">
        <Plus className="h-4 w-4 mr-2" /> New Event
      </Button>
    </div>
  )
}
