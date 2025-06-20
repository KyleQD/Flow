import { Filter, Plus, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function VenueTeam({ venueId }: { venueId: string }) {
  // This would be fetched from an API in a real application
  const teamMembers = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Venue Manager",
      email: "alex@echolounge.com",
      phone: "(404) 555-1001",
      avatar: "/confident-venue-manager.png",
    },
    {
      id: "2",
      name: "Sarah Williams",
      role: "Booking Manager",
      email: "sarah@echolounge.com",
      phone: "(404) 555-1002",
      avatar: "/confident-booking-manager.png",
    },
    {
      id: "3",
      name: "Michael Chen",
      role: "Technical Director",
      email: "michael@echolounge.com",
      phone: "(404) 555-1003",
      avatar: "/focused-tech-lead.png",
    },
    {
      id: "4",
      name: "Jessica Rodriguez",
      role: "Marketing Manager",
      email: "jessica@echolounge.com",
      phone: "(404) 555-1004",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20marketing%20manager",
    },
    {
      id: "5",
      name: "David Kim",
      role: "Sound Engineer",
      email: "david@echolounge.com",
      phone: "(404) 555-1005",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20sound%20engineer",
    },
    {
      id: "6",
      name: "Emily Taylor",
      role: "Event Coordinator",
      email: "emily@echolounge.com",
      phone: "(404) 555-1006",
      avatar: "/placeholder.svg?height=80&width=80&query=portrait%20of%20event%20coordinator",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search team members..."
              className="pl-9 bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
          </div>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <Filter className="mr-2 h-4 w-4" />
            Filter by Role
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col rounded-md bg-[#0f1117] overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-purple-600">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{member.name}</h3>
                    <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-0">{member.role}</Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-white/80">
                  <p>Email: {member.email}</p>
                  <p>Phone: {member.phone}</p>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 p-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  Message
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
