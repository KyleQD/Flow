"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getVenueProfile } from "@/services/supabase"

interface DashboardVenueProps {
  userId: string
}

export function DashboardVenue({ userId }: DashboardVenueProps) {
  const [venue, setVenue] = useState<any>(null)
  const [setupProgress, setSetupProgress] = useState(45)

  useEffect(() => {
    async function loadVenue() {
      try {
        const data = await getVenueProfile(userId)
        setVenue(data)
      } catch (error) {
        console.error('Error loading venue:', error)
      }
    }

    loadVenue()
  }, [userId])

  if (!venue) return null

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center text-base">
          <MapPin className="mr-2 h-5 w-5 text-pink-500" />
          Venue Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg overflow-hidden h-32 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-medium text-white">{venue.venue_name}</div>
              <div className="text-xs text-slate-300 flex items-center">
                <MapPin className="h-3 w-3 mr-1" /> 
                {venue.address.street}, {venue.address.city}, {venue.address.state}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1">Capacity</div>
              <div className="text-sm font-medium text-slate-200">{venue.capacity} people</div>
            </div>
            <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1">Contact</div>
              <div className="text-sm font-medium text-slate-200">{venue.contact_email}</div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Venue Setup Progress</div>
              <div className="text-sm text-purple-400">{setupProgress}%</div>
            </div>
            <Progress value={setupProgress} className="h-2 bg-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${setupProgress}%` }}
              />
            </Progress>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 