import { Calendar, Filter, Plus, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VenueEvents({ venueId }: { venueId: string }) {
  // This would be fetched from an API in a real application
  const upcomingEvents = [
    {
      id: "1",
      title: "Summer Jam Festival",
      date: "June 15, 2025",
      time: "6:00 PM",
      ticketsSold: 450,
      totalTickets: 850,
      status: "On Sale",
    },
    {
      id: "2",
      title: "Midnight Echo",
      date: "June 22, 2025",
      time: "9:00 PM",
      ticketsSold: 325,
      totalTickets: 850,
      status: "On Sale",
    },
    {
      id: "3",
      title: "Jazz Night",
      date: "June 28, 2025",
      time: "8:00 PM",
      ticketsSold: 275,
      totalTickets: 850,
      status: "On Sale",
    },
  ]

  const pastEvents = [
    {
      id: "4",
      title: "Rock Revival",
      date: "May 20, 2025",
      time: "7:00 PM",
      ticketsSold: 820,
      totalTickets: 850,
      status: "Completed",
    },
    {
      id: "5",
      title: "Electronic Dance Night",
      date: "May 12, 2025",
      time: "10:00 PM",
      ticketsSold: 750,
      totalTickets: 850,
      status: "Completed",
    },
    {
      id: "6",
      title: "Acoustic Sessions",
      date: "May 5, 2025",
      time: "7:30 PM",
      ticketsSold: 600,
      totalTickets: 850,
      status: "Completed",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Events</CardTitle>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
          </div>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Past Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md bg-[#0f1117] p-4"
              >
                <div>
                  <h3 className="font-medium text-lg">{event.title}</h3>
                  <div className="text-sm text-white/60">
                    {event.date} at {event.time}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-white/80">Tickets: </span>
                    <span className="text-green-400">{event.ticketsSold}</span>
                    <span className="text-white/60">/{event.totalTickets} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-white/10 text-white hover:bg-white/20 border-0">{event.status}</Badge>
                  <Button variant="outline" size="sm" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md bg-[#0f1117] p-4"
              >
                <div>
                  <h3 className="font-medium text-lg">{event.title}</h3>
                  <div className="text-sm text-white/60">
                    {event.date} at {event.time}
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="text-white/80">Tickets: </span>
                    <span className="text-green-400">{event.ticketsSold}</span>
                    <span className="text-white/60">/{event.totalTickets} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-transparent text-white/60 border-white/20">
                    {event.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
