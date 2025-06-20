import { ChevronRight, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TourifyLogo } from "@/components/tourify-logo"

export function TeamMembersList() {
  const teamMembers = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Venue Manager",
      avatar: "/confident-venue-manager.png",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Booking Manager",
      avatar: "/confident-booking-manager.png",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Technical Director",
      avatar: "/focused-tech-lead.png",
    },
  ]

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="text-xl font-bold">Team Members</CardTitle>
        <TourifyLogo className="h-5 w-auto text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-md bg-[#0f1117] p-4">
              <Avatar>
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <div className="text-sm text-white/60">{member.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
          <Button
            variant="ghost"
            className="justify-center text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            Manage Team
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
