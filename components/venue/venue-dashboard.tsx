"use client"

import { useState } from "react"
import { Bell, Clock, Plus, Star, Ticket, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { VenueHeader } from "@/components/venue/venue-header"
import { BookingRequestsList } from "@/components/venue/booking-requests-list"
import { UpcomingEventsList } from "@/components/venue/upcoming-events-list"
import { DocumentsList } from "@/components/venue/documents-list"
import { TeamMembersList } from "@/components/venue/team-members-list"
import { AnalyticsOverview } from "@/components/venue/analytics-overview"
import { CreateEventDialog } from "@/components/events/create-event-dialog"
import { useRouter } from "next/navigation"

export function VenueDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const router = useRouter()

  const handleCreateEventSuccess = () => {
    setIsCreateEventOpen(false)
    // Force a refresh to show the new event
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <VenueHeader />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6 bg-[#4b2a82] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back to your venue dashboard!</h2>
            <p className="text-white/80 mb-4">You have 8 new booking requests and 3 pending reviews.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="text-white bg-white/10 hover:bg-white/20">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button className="bg-white text-[#4b2a82] hover:bg-white/90" onClick={() => setIsCreateEventOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#1a1d29] border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">125</div>
                    <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-500 border-0">
                      +12% this month
                    </Badge>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d29] border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Venue Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">4.8</div>
                    <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-500 border-0">
                      +0.2 this month
                    </Badge>
                  </div>
                  <Star className="h-8 w-8 text-purple-400 fill-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d29] border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Booking Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">8</div>
                    <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-500 border-0">
                      +3 new requests
                    </Badge>
                  </div>
                  <Ticket className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1d29] border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">12</div>
                    <Badge variant="outline" className="mt-1 bg-blue-500/10 text-blue-500 border-0">
                      2 pending invites
                    </Badge>
                  </div>
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BookingRequestsList />
            <UpcomingEventsList />
          </div>

          <div className="mb-6">
            <AnalyticsOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DocumentsList />
            <TeamMembersList />
          </div>
        </main>
      </div>

      <CreateEventDialog
        open={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onEventCreated={handleCreateEventSuccess}
      />
    </div>
  )
}
