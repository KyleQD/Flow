"use client"

import { useState } from "react"
import {
  Calendar,
  Edit,
  ExternalLink,
  Key,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  Ticket,
  Trash2,
  User,
} from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

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

interface TeamMemberDetailsProps {
  member: TeamMember
}

export function TeamMemberDetails({ member }: TeamMemberDetailsProps) {
  const [activeTab, setActiveTab] = useState("profile")

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

  const getPermissionBadge = (permission: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      admin: { label: "Admin", color: "bg-red-500/20 text-red-400" },
      booking: { label: "Booking", color: "bg-blue-500/20 text-blue-400" },
      events: { label: "Events", color: "bg-green-500/20 text-green-400" },
      finance: { label: "Finance", color: "bg-yellow-500/20 text-yellow-500" },
      staff: { label: "Staff", color: "bg-purple-500/20 text-purple-400" },
      production: { label: "Production", color: "bg-teal-500/20 text-teal-400" },
      equipment: { label: "Equipment", color: "bg-orange-500/20 text-orange-400" },
      marketing: { label: "Marketing", color: "bg-pink-500/20 text-pink-400" },
      social: { label: "Social Media", color: "bg-indigo-500/20 text-indigo-400" },
      website: { label: "Website", color: "bg-cyan-500/20 text-cyan-400" },
      artists: { label: "Artists", color: "bg-violet-500/20 text-violet-400" },
      maintenance: { label: "Maintenance", color: "bg-gray-500/20 text-gray-400" },
      bar: { label: "Bar", color: "bg-amber-500/20 text-amber-400" },
      inventory: { label: "Inventory", color: "bg-lime-500/20 text-lime-400" },
      reports: { label: "Reports", color: "bg-emerald-500/20 text-emerald-400" },
      security: { label: "Security", color: "bg-rose-500/20 text-rose-400" },
      emergency: { label: "Emergency", color: "bg-red-500/20 text-red-400" },
      facilities: { label: "Facilities", color: "bg-slate-500/20 text-slate-400" },
      customer: { label: "Customer", color: "bg-fuchsia-500/20 text-fuchsia-400" },
      vip: { label: "VIP", color: "bg-amber-500/20 text-amber-400" },
      feedback: { label: "Feedback", color: "bg-sky-500/20 text-sky-400" },
      vendors: { label: "Vendors", color: "bg-emerald-500/20 text-emerald-400" },
    }

    const badge = badges[permission] || { label: permission, color: "bg-white/10 text-white" }
    return <Badge className={`${badge.color} border-0`}>{badge.label}</Badge>
  }

  return (
    <Card className="bg-[#1a1d29] border-0 text-white">
      <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <Avatar className="h-24 w-24 border-2 border-purple-600">
          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
          <AvatarFallback className="text-2xl">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-white">{member.name}</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1">
                <p className="text-white/80">{member.role}</p>
                <Badge className={`${getDepartmentColor(member.department)} border-0 md:ml-2`}>
                  {member.department}
                </Badge>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 capitalize">
              {member.status}
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" />
              <span className="text-white/80">{member.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-400" />
              <span className="text-white/80">{member.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="px-6 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Permissions
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Events
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-2">Bio</h3>
              <p className="text-white/80">{member.bio}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <Calendar className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Start Date</div>
                  <div className="font-medium">{member.startDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0f1117] p-3 rounded-md">
                <User className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-sm text-white/60">Department</div>
                  <div className="font-medium">{member.department}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-white/60">Email</div>
                    <div className="font-medium">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-sm text-white/60">Phone</div>
                    <div className="font-medium">{member.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Access Permissions</h3>
                <Button variant="outline" size="sm" className="h-8 border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  <Shield className="mr-2 h-4 w-4" />
                  Edit Permissions
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.permissions.map((permission, index) => (
                  <div key={index}>{getPermissionBadge(permission)}</div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">System Access</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Key className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Venue Management System</div>
                      <div className="text-sm text-white/60">Full access to venue dashboard</div>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500 border-0">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Ticketing System</div>
                      <div className="text-sm text-white/60">Access to ticket sales and management</div>
                    </div>
                  </div>
                  <Badge
                    className={
                      member.permissions.includes("booking")
                        ? "bg-green-500/20 text-green-500 border-0"
                        : "bg-red-500/20 text-red-500 border-0"
                    }
                  >
                    {member.permissions.includes("booking") ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Admin Portal</div>
                      <div className="text-sm text-white/60">Administrative access</div>
                    </div>
                  </div>
                  <Badge
                    className={
                      member.permissions.includes("admin")
                        ? "bg-green-500/20 text-green-500 border-0"
                        : "bg-red-500/20 text-red-500 border-0"
                    }
                  >
                    {member.permissions.includes("admin") ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <h3 className="font-medium mb-3">Recent Events</h3>
              {member.recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {member.recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                          <Ticket className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{event}</div>
                          <div className="text-sm text-white/60">Worked as {member.role}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-white/60 hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-white/60">No recent events</div>
              )}
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Event Availability</h3>
                <Button variant="outline" size="sm" className="h-8 border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Upcoming Assigned Events</span>
                  <span className="text-white/60">3 events</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <span>Available for Booking</span>
                  <Badge className="bg-green-500/20 text-green-500 border-0">Yes</Badge>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <span>Preferred Working Days</span>
                  <span className="text-white/60">Mon, Tue, Wed, Thu, Fri</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Notes</h3>
                <Button variant="outline" size="sm" className="h-8 border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Notes
                </Button>
              </div>
              <p className="text-white/80">{member.notes}</p>
            </div>

            <div className="bg-[#0f1117] p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Communication History</h3>
                <Button variant="outline" size="sm" className="h-8 border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Schedule Update</div>
                    <div className="text-xs text-white/60">2 days ago</div>
                  </div>
                  <p className="text-sm text-white/80">Confirmed availability for the upcoming Summer Jam Festival.</p>
                </div>
                <div className="p-3 bg-[#1a1d29] rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Performance Review</div>
                    <div className="text-xs text-white/60">2 weeks ago</div>
                  </div>
                  <p className="text-sm text-white/80">
                    Completed quarterly performance review with positive feedback.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400">
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
          <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  )
}
