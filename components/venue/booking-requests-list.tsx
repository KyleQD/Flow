import { ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TourifyLogo } from "@/components/tourify-logo"

export function BookingRequestsList() {
  const bookingRequests = [
    {
      id: 1,
      title: "Electronic Music Showcase",
      date: "7/10/2025",
      attendees: 500,
      status: "pending",
    },
    {
      id: 2,
      title: "Album Release Party",
      date: "7/15/2025",
      attendees: 350,
      status: "pending",
    },
    {
      id: 3,
      title: "Corporate Event",
      date: "7/22/2025",
      attendees: 200,
      status: "pending",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl font-bold">Recent Booking Requests</CardTitle>
        <TourifyLogo className="h-5 w-auto text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between rounded-md bg-[#0f1117] p-4">
              <div>
                <h3 className="font-medium">{request.title}</h3>
                <div className="text-sm text-white/60">
                  {request.date} • {request.attendees} attendees
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0">Pending</Badge>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          className="mt-4 w-full justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
        >
          View All Requests
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
