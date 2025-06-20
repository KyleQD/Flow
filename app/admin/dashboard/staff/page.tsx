"use client"

import { CheckCircle, FileText, Plus, Search, User, Users } from "lucide-react"
import { Header } from "@/components/header"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { AddStaffDialog } from "./add-staff-dialog"
import React from "react"

export default function StaffPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [staff, setStaff] = React.useState([
    { name: "Sarah Johnson", role: "Event Manager", department: "Management", email: "sarah@tourify.com", phone: "(555) 123-4567", status: "available" },
    { name: "Michael Chen", role: "Artist Relations", department: "Management", email: "michael@tourify.com", phone: "(555) 234-5678", status: "on-duty" },
    { name: "Jessica Lee", role: "Transportation Manager", department: "Logistics", email: "jessica@tourify.com", phone: "(555) 345-6789", status: "available" },
    { name: "David Wilson", role: "Technical Director", department: "Production", email: "david@tourify.com", phone: "(555) 456-7890", status: "on-duty" },
    { name: "Amanda Garcia", role: "Catering Manager", department: "Logistics", email: "amanda@tourify.com", phone: "(555) 567-8901", status: "unavailable" },
    { name: "Robert Taylor", role: "Security Lead", department: "Security", email: "robert@tourify.com", phone: "(555) 678-9012", status: "available" },
    { name: "Emily Davis", role: "Marketing Coordinator", department: "Management", email: "emily@tourify.com", phone: "(555) 789-0123", status: "on-duty" },
    { name: "James Wilson", role: "Sound Engineer", department: "Production", email: "james@tourify.com", phone: "(555) 890-1234", status: "available" },
    { name: "Lisa Rodriguez", role: "Lighting Designer", department: "Production", email: "lisa@tourify.com", phone: "(555) 901-2345", status: "on-duty" },
    { name: "John Smith", role: "Security Officer", department: "Security", email: "john@tourify.com", phone: "(555) 012-3456", status: "on-duty" },
    { name: "Maria Gonzalez", role: "Hospitality Manager", department: "Logistics", email: "maria@tourify.com", phone: "(555) 123-4567", status: "unavailable" },
    { name: "Thomas Brown", role: "Stage Manager", department: "Production", email: "thomas@tourify.com", phone: "(555) 234-5678", status: "available" },
  ])
  const existingProfiles = [
    { id: "1", name: "Alex Johnson", email: "alex@tourify.com" },
    { id: "2", name: "Sam Williams", email: "sam@tourify.com" },
    { id: "3", name: "Jamie Lee", email: "jamie@tourify.com" },
  ]

  function handleAddStaff(newStaff: any) {
    setStaff(prev => [
      { ...newStaff, role: newStaff.role || "New Staff", department: newStaff.department || "General", status: "available", phone: newStaff.phone || "", email: newStaff.email || "" },
      ...prev
    ])
  }

  return (
    <div className="container mx-auto p-4">
      <Header />
      <PageHeader
        title="Staff Management"
        icon={Users}
        description="Manage your team, assign roles, and track staff availability"
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search staff..."
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm w-64"
          />
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Staff Member
        </Button>
      </div>
      <AddStaffDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddStaff}
        existingProfiles={existingProfiles}
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-800/50 p-1 mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400">
            All Staff
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Management
          </TabsTrigger>
          <TabsTrigger
            value="production"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Production
          </TabsTrigger>
          <TabsTrigger
            value="logistics"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Logistics
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-purple-400"
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.map((staffMember) => (
            <StaffCard
                key={staffMember.name}
                name={staffMember.name}
                role={staffMember.role}
                department={staffMember.department}
                email={staffMember.email}
                phone={staffMember.phone}
                status={(['available', 'on-duty', 'unavailable'].includes(staffMember.status) ? staffMember.status : 'available') as 'available' | 'on-duty' | 'unavailable'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="management" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.filter(s => s.department === "Management").map((staffMember) => (
            <StaffCard
                key={staffMember.name}
                name={staffMember.name}
                role={staffMember.role}
                department={staffMember.department}
                email={staffMember.email}
                phone={staffMember.phone}
                status={(['available', 'on-duty', 'unavailable'].includes(staffMember.status) ? staffMember.status : 'available') as 'available' | 'on-duty' | 'unavailable'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="production" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.filter(s => s.department === "Production").map((staffMember) => (
            <StaffCard
                key={staffMember.name}
                name={staffMember.name}
                role={staffMember.role}
                department={staffMember.department}
                email={staffMember.email}
                phone={staffMember.phone}
                status={(['available', 'on-duty', 'unavailable'].includes(staffMember.status) ? staffMember.status : 'available') as 'available' | 'on-duty' | 'unavailable'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logistics" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.filter(s => s.department === "Logistics").map((staffMember) => (
            <StaffCard
                key={staffMember.name}
                name={staffMember.name}
                role={staffMember.role}
                department={staffMember.department}
                email={staffMember.email}
                phone={staffMember.phone}
                status={(['available', 'on-duty', 'unavailable'].includes(staffMember.status) ? staffMember.status : 'available') as 'available' | 'on-duty' | 'unavailable'}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.filter(s => s.department === "Security").map((staffMember) => (
            <StaffCard
                key={staffMember.name}
                name={staffMember.name}
                role={staffMember.role}
                department={staffMember.department}
                email={staffMember.email}
                phone={staffMember.phone}
                status={(['available', 'on-duty', 'unavailable'].includes(staffMember.status) ? staffMember.status : 'available') as 'available' | 'on-duty' | 'unavailable'}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <FileText className="mr-2 h-5 w-5 text-purple-500" />
                Staff Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-900/20">
                      <AssignmentRow
                        name="Sarah Johnson"
                        role="Event Manager"
                        assignment="Event Oversight"
                        location="Main Office"
                        time="Aug 15, 08:00 AM - 11:00 PM"
                        status="confirmed"
                      />
                      <AssignmentRow
                        name="Michael Chen"
                        role="Artist Relations"
                        assignment="Artist Liaison"
                        location="Backstage"
                        time="Aug 15, 12:00 PM - 11:00 PM"
                        status="confirmed"
                      />
                      <AssignmentRow
                        name="David Wilson"
                        role="Technical Director"
                        assignment="Sound & Lighting"
                        location="Main Stage"
                        time="Aug 15, 10:00 AM - 11:00 PM"
                        status="confirmed"
                      />
                      <AssignmentRow
                        name="Jessica Lee"
                        role="Transportation Manager"
                        assignment="Artist Transport"
                        location="Various"
                        time="Aug 15, 09:00 AM - 12:00 AM"
                        status="pending"
                      />
                      <AssignmentRow
                        name="Robert Taylor"
                        role="Security Lead"
                        assignment="Security Oversight"
                        location="Venue-wide"
                        time="Aug 15, 08:00 AM - 12:00 AM"
                        status="pending"
                      />
                      <AssignmentRow
                        name="Amanda Garcia"
                        role="Catering Manager"
                        assignment="Food Service"
                        location="Catering Area"
                        time="Aug 15, 07:00 AM - 10:00 PM"
                        status="confirmed"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <User className="mr-2 h-5 w-5 text-purple-500" />
                Staff Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-slate-400">Management</div>
                    <div className="text-xs text-purple-400">100% available</div>
                  </div>
                  <Progress value={100} className="h-1.5 bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-slate-400">Production</div>
                    <div className="text-xs text-purple-400">75% available</div>
                  </div>
                  <Progress value={75} className="h-1.5 bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "75%" }}
                    />
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-slate-400">Logistics</div>
                    <div className="text-xs text-purple-400">66% available</div>
                  </div>
                  <Progress value={66} className="h-1.5 bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "66%" }}
                    />
                  </Progress>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-slate-400">Security</div>
                    <div className="text-xs text-purple-400">100% available</div>
                  </div>
                  <Progress value={100} className="h-1.5 bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </Progress>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center text-base">
                <CheckCircle className="mr-2 h-5 w-5 text-purple-500" />
                Staff Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <CertificationItem name="First Aid & CPR" staffCount={8} expiryDate="Various" required={true} />

                <CertificationItem name="Security License" staffCount={5} expiryDate="Various" required={true} />

                <CertificationItem name="Food Handling" staffCount={3} expiryDate="Various" required={true} />

                <CertificationItem name="Electrical Safety" staffCount={4} expiryDate="Various" required={false} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface StaffCardProps {
  name: string
  role: string
  department: string
  email: string
  phone: string
  status: "available" | "on-duty" | "unavailable"
}

function StaffCard({ name, role, department, email, phone, status }: StaffCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Available</Badge>
      case "on-duty":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">On Duty</Badge>
      case "unavailable":
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Unavailable</Badge>
    }
  }

  const getDepartmentColor = () => {
    switch (department) {
      case "Management":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Production":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30"
      case "Logistics":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Security":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt={name} />
            <AvatarFallback className="bg-slate-700 text-purple-500">{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-medium text-slate-200">{name}</h4>
            <p className="text-xs text-purple-400">{role}</p>
            <Badge className={`mt-1 text-xs ${getDepartmentColor()}`}>{department}</Badge>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-xs">
          <p className="text-slate-400">
            Email: <span className="text-slate-300">{email}</span>
          </p>
          <p className="text-slate-400">
            Phone: <span className="text-slate-300">{phone}</span>
          </p>
        </div>
      </div>

      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
        <div>{getStatusBadge()}</div>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-400 hover:text-slate-300">
          View Details
        </Button>
      </div>
    </div>
  )
}

interface AssignmentRowProps {
  name: string
  role: string
  assignment: string
  location: string
  time: string
  status: string
}

function AssignmentRow({ name, role, assignment, location, time, status }: AssignmentRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>
    }
  }

  return (
    <tr className="hover:bg-slate-800/30">
      <td className="px-4 py-3 text-slate-300">{name}</td>
      <td className="px-4 py-3 text-slate-300">{role}</td>
      <td className="px-4 py-3 text-slate-300">{assignment}</td>
      <td className="px-4 py-3 text-slate-300">{location}</td>
      <td className="px-4 py-3 text-slate-300">{time}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
    </tr>
  )
}

interface CertificationItemProps {
  name: string
  staffCount: number
  expiryDate: string
  required: boolean
}

function CertificationItem({ name, staffCount, expiryDate, required }: CertificationItemProps) {
  return (
    <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-slate-200">{name}</div>
          <div className="text-xs text-slate-400 mt-1">Staff with certification: {staffCount}</div>
          <div className="text-xs text-slate-400">Expiry: {expiryDate}</div>
        </div>
        {required ? (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Required</Badge>
        ) : (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Optional</Badge>
        )}
      </div>
    </div>
  )
}
