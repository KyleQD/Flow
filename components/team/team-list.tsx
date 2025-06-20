"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  avatar: string
  bio: string
  startDate: string
  status: string
  permissions: string[]
  recentEvents: string[]
  notes: string
}

interface TeamListProps {
  teamMembers: TeamMember[]
  selectedMemberId: string | null
  onSelectMember: (id: string) => void
}

export function TeamList({ teamMembers, selectedMemberId, onSelectMember }: TeamListProps) {
  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Management: "bg-purple-500/20 text-purple-400",
      Production: "bg-blue-500/20 text-blue-400",
      Events: "bg-green-500/20 text-green-400",
      Marketing: "bg-yellow-500/20 text-yellow-500",
      "Food & Beverage": "bg-orange-500/20 text-orange-400",
      Administration: "bg-red-500/20 text-red-400",
      Security: "bg-gray-500/20 text-gray-400",
      Facilities: "bg-teal-500/20 text-teal-400",
      "Customer Service": "bg-pink-500/20 text-pink-400",
    }

    return colors[department] || "bg-white/10 text-white"
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <div className="bg-[#0f1117] rounded-md p-4 text-center text-white/60">
            No team members match your filters
          </div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-md cursor-pointer transition-colors ${
                selectedMemberId === member.id
                  ? "bg-purple-600/20 border border-purple-600/50"
                  : "bg-[#0f1117] hover:bg-[#0f1117]/80"
              }`}
              onClick={() => onSelectMember(member.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-purple-600/30">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{member.name}</h3>
                  <p className="text-white/60 text-sm truncate">{member.role}</p>
                </div>
                <Badge className={`${getDepartmentColor(member.department)} border-0`}>{member.department}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
