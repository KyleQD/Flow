"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"

interface Department {
  id: string
  name: string
  description: string
  memberCount: number
  color: string
}

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

interface TeamDepartmentsProps {
  departments: Department[]
  teamMembers: TeamMember[]
  onSelectMember: (id: string) => void
  selectedMemberId: string | null
}

export function TeamDepartments({ departments, teamMembers, onSelectMember, selectedMemberId }: TeamDepartmentsProps) {
  const getDepartmentColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    }

    return colors[color] || "bg-white/10 text-white border-white/20"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((department) => (
          <Card key={department.id} className="bg-[#1a1d29] border-0 text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className={`${getDepartmentColor(department.color)}`}>{department.name}</Badge>
                <Badge variant="outline" className="bg-[#0f1117] border-[#2a2f3e] text-white">
                  {department.memberCount} members
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{department.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">{department.description}</p>

              <div className="space-y-3">
                {teamMembers
                  .filter((member) => member.department === department.name)
                  .map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${
                        selectedMemberId === member.id
                          ? "bg-purple-600/20 border border-purple-600/50"
                          : "bg-[#0f1117] hover:bg-[#0f1117]/80"
                      }`}
                      onClick={() => onSelectMember(member.id)}
                    >
                      <Avatar className="h-10 w-10 border border-purple-600/30">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{member.name}</h3>
                        <p className="text-white/60 text-sm truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}

                <Button
                  variant="outline"
                  className="w-full border-dashed border-[#2a2f3e] text-white/60 hover:bg-[#2a2f3e] hover:text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to {department.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a1d29] border-0 text-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Department Overview</CardTitle>
            <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
              <Users className="mr-2 h-4 w-4" />
              Manage Departments
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((department) => (
              <div key={department.id} className="flex items-center gap-3 p-3 bg-[#0f1117] rounded-md">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${getDepartmentColor(department.color)}`}
                >
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{department.name}</h3>
                  <p className="text-white/60 text-sm truncate">{department.memberCount} members</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
