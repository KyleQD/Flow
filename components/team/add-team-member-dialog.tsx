"use client"

import { useState } from "react"
import { Calendar, Mail, Phone, Shield, Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Department {
  id: string
  name: string
  description: string
  memberCount: number
  color: string
}

interface AddTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departments: Department[]
}

export function AddTeamMemberDialog({ open, onOpenChange, departments }: AddTeamMemberDialogProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const permissions = [
    "admin",
    "booking",
    "events",
    "finance",
    "staff",
    "production",
    "equipment",
    "marketing",
    "social",
    "website",
    "artists",
    "maintenance",
    "bar",
    "inventory",
    "security",
    "emergency",
    "facilities",
    "customer",
    "vip",
    "feedback",
    "vendors",
  ]

  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permission))
    } else {
      setSelectedPermissions([...selectedPermissions, permission])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1d29] text-white border-0 max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Team Member</DialogTitle>
          <DialogDescription className="text-white/60">
            Fill in the details to add a new team member to your venue.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-[#0f1117] p-1">
            <TabsTrigger value="basic" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Permissions
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <Input
                id="role"
                placeholder="Enter role or position"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger className="bg-[#0f1117] border-0 text-white focus:ring-purple-500">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2f3e] text-white">
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.name}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="startDate"
                  type="date"
                  className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="border-2 border-dashed border-white/20 rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-white/40 mb-2" />
                <p className="text-white/60 text-center mb-2">Drag and drop an image, or click to browse</p>
                <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                  Upload Photo
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Emergency Contact</Label>
              <Input
                id="emergency-contact"
                placeholder="Name and phone number"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter address"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Access Permissions</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-[#0f1117] rounded-md">
                {permissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant={selectedPermissions.includes(permission) ? "default" : "outline"}
                    className={
                      selectedPermissions.includes(permission)
                        ? "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                        : "border-[#2a2f3e] text-white hover:bg-[#2a2f3e] cursor-pointer"
                    }
                    onClick={() => togglePermission(permission)}
                  >
                    {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    {selectedPermissions.includes(permission) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-level">Access Level</Label>
              <Select>
                <SelectTrigger className="bg-[#0f1117] border-0 text-white focus:ring-purple-500">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1d29] border-[#2a2f3e] text-white">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-[#0f1117] rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">System Access</h3>
                <Shield className="h-5 w-5 text-purple-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="access-venue"
                    className="mr-3 h-4 w-4 rounded border-white/20 bg-[#1a1d29] text-purple-600 focus:ring-purple-600"
                  />
                  <Label htmlFor="access-venue" className="cursor-pointer">
                    Venue Management System
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="access-ticketing"
                    className="mr-3 h-4 w-4 rounded border-white/20 bg-[#1a1d29] text-purple-600 focus:ring-purple-600"
                  />
                  <Label htmlFor="access-ticketing" className="cursor-pointer">
                    Ticketing System
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="access-admin"
                    className="mr-3 h-4 w-4 rounded border-white/20 bg-[#1a1d29] text-purple-600 focus:ring-purple-600"
                  />
                  <Label htmlFor="access-admin" className="cursor-pointer">
                    Admin Portal
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Enter team member bio"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Expertise</Label>
              <Textarea
                id="skills"
                placeholder="List skills and expertise"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about the team member"
                className="bg-[#0f1117] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500 min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          <Button
            variant="outline"
            className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">Add Team Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
