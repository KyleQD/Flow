"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SelectableVenue {
  id: string
  name: string
  city?: string | null
  state?: string | null
}

interface VenueSelectProps {
  onSelect: (venue?: SelectableVenue) => void
  placeholder?: string
  className?: string
  defaultVenueId?: string
}

export function VenueSelect({ onSelect, placeholder = "Select a venue", className, defaultVenueId }: VenueSelectProps) {
  const [venues, setVenues] = useState<SelectableVenue[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultVenueId)

  useEffect(function loadVenues() {
    let isActive = true
    async function run() {
      setIsLoading(true)
      try {
        const res = await fetch("/api/admin/venues", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch venues")
        const data = await res.json()
        const list: SelectableVenue[] = Array.isArray(data?.venues)
          ? data.venues.map((v: any) => ({
              id: String(v.id),
              name: String(v.name ?? v.venue_name ?? "Untitled Venue"),
              city: v.city ?? null,
              state: v.state ?? null,
            }))
          : []
        if (isActive) setVenues(list)
      } catch {
        if (isActive) setVenues([])
      } finally {
        if (isActive) setIsLoading(false)
      }
    }
    run()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    onSelect(venues.find(v => v.id === selectedId))
  }, [selectedId])

  return (
    <div className={cn("w-full", className)}>
      <Select value={selectedId} onValueChange={value => setSelectedId(value || undefined)} disabled={isLoading || venues.length === 0}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {venues.map(v => (
            <SelectItem key={v.id} value={v.id}>
              {v.name}{v.city ? ` — ${v.city}${v.state ? ", " + v.state : ""}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
