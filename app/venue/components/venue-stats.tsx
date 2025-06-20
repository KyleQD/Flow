import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Star, Ticket, Users } from "lucide-react"

interface VenueStatsProps {
  venue: any
  stats?: any // Optional separate stats object
}

export function VenueStats({ venue, stats }: VenueStatsProps) {
  // Use separate stats if provided, otherwise fall back to venue.stats for compatibility
  const actualStats = stats || venue?.stats || {}
  
  // Safely extract stats with defaults
  const events = actualStats.totalBookings || actualStats.events || 0
  const rating = actualStats.averageRating || actualStats.rating || 0
  const bookingRequests = actualStats.pendingRequests || actualStats.bookingRequests || 0
  const teamMembers = actualStats.teamMembers || actualStats.teamMembers || 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-white">{events.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-900/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
            +12% this month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Venue Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-white">{rating.toFixed(1)}</p>
                <Star className="h-5 w-5 text-yellow-500 ml-1 fill-current" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-900/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
            +0.2 this month
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Booking Requests</p>
              <p className="text-2xl font-bold text-white">{bookingRequests}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-900/20 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <Badge variant="outline" className="mt-2 bg-green-900/20 text-green-400 border-green-800">
            +3 new requests
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-white">{teamMembers}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <Badge variant="outline" className="mt-2 bg-blue-900/20 text-blue-400 border-blue-800">
            2 pending invites
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
