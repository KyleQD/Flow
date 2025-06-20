import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, UserPlus } from "lucide-react"

interface VenueTeamProps {
  venue: any
}

export function VenueTeam({ venue }: VenueTeamProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Team Members</CardTitle>
          <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {venue.team.slice(0, 3).map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{member.name}</h3>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1 text-purple-400 border-purple-800/50 hover:bg-purple-900/20">
            <UserPlus className="h-4 w-4 mr-2" /> Add Member
          </Button>
          <Button variant="outline" className="flex-1 text-purple-400 border-purple-800/50 hover:bg-purple-900/20">
            Manage Team <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
