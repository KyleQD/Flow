"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Shield, Edit, Trash2, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for roles
const mockRoles = {
  "team-1": [
    {
      id: 1,
      name: "Admin",
      description: "Full access to all team features and settings",
      color: "bg-red-500",
      memberCount: 1,
      permissions: {
        manageMembers: true,
        manageRoles: true,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: true,
        deleteTeam: true,
        viewAnalytics: true,
      },
    },
    {
      id: 2,
      name: "Manager",
      description: "Can manage team operations but not settings",
      color: "bg-blue-500",
      memberCount: 2,
      permissions: {
        manageMembers: true,
        manageRoles: false,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
    {
      id: 3,
      name: "Member",
      description: "Standard team member with basic permissions",
      color: "bg-green-500",
      memberCount: 9,
      permissions: {
        manageMembers: false,
        manageRoles: false,
        createAnnouncements: false,
        assignTasks: false,
        scheduleShifts: false,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: false,
      },
    },
  ],
  "team-2": [
    {
      id: 1,
      name: "Lead Technician",
      description: "Oversees all technical operations",
      color: "bg-purple-500",
      memberCount: 1,
      permissions: {
        manageMembers: true,
        manageRoles: true,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: true,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
    {
      id: 2,
      name: "Technician",
      description: "Handles technical setup and operations",
      color: "bg-indigo-500",
      memberCount: 7,
      permissions: {
        manageMembers: false,
        manageRoles: false,
        createAnnouncements: false,
        assignTasks: false,
        scheduleShifts: false,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: false,
      },
    },
  ],
  "team-3": [
    {
      id: 1,
      name: "Event Director",
      description: "Leads event planning and execution",
      color: "bg-amber-500",
      memberCount: 1,
      permissions: {
        manageMembers: true,
        manageRoles: true,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: true,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
    {
      id: 2,
      name: "Event Coordinator",
      description: "Assists with event planning and coordination",
      color: "bg-green-500",
      memberCount: 5,
      permissions: {
        manageMembers: false,
        manageRoles: false,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
  ],
  "team-4": [
    {
      id: 1,
      name: "Marketing Lead",
      description: "Oversees all marketing efforts",
      color: "bg-pink-500",
      memberCount: 1,
      permissions: {
        manageMembers: true,
        manageRoles: true,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: true,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
    {
      id: 2,
      name: "Marketing Specialist",
      description: "Handles specific marketing channels",
      color: "bg-orange-500",
      memberCount: 4,
      permissions: {
        manageMembers: false,
        manageRoles: false,
        createAnnouncements: true,
        assignTasks: false,
        scheduleShifts: false,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
  ],
  "team-5": [
    {
      id: 1,
      name: "Tour Manager",
      description: "Oversees all tour operations",
      color: "bg-red-500",
      memberCount: 1,
      permissions: {
        manageMembers: true,
        manageRoles: true,
        createAnnouncements: true,
        assignTasks: true,
        scheduleShifts: true,
        editTeamDetails: true,
        deleteTeam: false,
        viewAnalytics: true,
      },
    },
    {
      id: 2,
      name: "Tour Staff",
      description: "Assists with tour logistics and operations",
      color: "bg-yellow-500",
      memberCount: 6,
      permissions: {
        manageMembers: false,
        manageRoles: false,
        createAnnouncements: false,
        assignTasks: false,
        scheduleShifts: false,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: false,
      },
    },
  ],
}

// Mock data for members with roles
const mockMembersWithRoles = {
  "team-1": [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "/abstract-aj.png",
      role: "Admin",
      email: "alex@example.com",
    },
    {
      id: 2,
      name: "Sam Rivera",
      avatar: "/abstract-geometric-sr.png",
      role: "Manager",
      email: "sam@example.com",
    },
    {
      id: 3,
      name: "Jamie Lee",
      avatar: "/intertwined-letters.png",
      role: "Manager",
      email: "jamie@example.com",
    },
    {
      id: 4,
      name: "Taylor Kim",
      avatar: "/stylized-initials.png",
      role: "Member",
      email: "taylor@example.com",
    },
    {
      id: 5,
      name: "Morgan Smith",
      avatar: "/placeholder.svg?height=40&width=40&query=MS",
      role: "Member",
      email: "morgan@example.com",
    },
  ],
  "team-2": [
    {
      id: 6,
      name: "Jordan Patel",
      avatar: "/placeholder.svg?height=40&width=40&query=JP",
      role: "Lead Technician",
      email: "jordan@example.com",
    },
    {
      id: 7,
      name: "Casey Wong",
      avatar: "/placeholder.svg?height=40&width=40&query=CW",
      role: "Technician",
      email: "casey@example.com",
    },
    {
      id: 8,
      name: "Riley Garcia",
      avatar: "/placeholder.svg?height=40&width=40&query=RG",
      role: "Technician",
      email: "riley@example.com",
    },
  ],
  "team-3": [
    {
      id: 9,
      name: "Quinn Murphy",
      avatar: "/placeholder.svg?height=40&width=40&query=QM",
      role: "Event Director",
      email: "quinn@example.com",
    },
    {
      id: 10,
      name: "Avery Wilson",
      avatar: "/placeholder.svg?height=40&width=40&query=AW",
      role: "Event Coordinator",
      email: "avery@example.com",
    },
  ],
  "team-4": [
    {
      id: 11,
      name: "Dakota Lee",
      avatar: "/placeholder.svg?height=40&width=40&query=DL",
      role: "Marketing Lead",
      email: "dakota@example.com",
    },
    {
      id: 12,
      name: "Skyler Chen",
      avatar: "/placeholder.svg?height=40&width=40&query=SC",
      role: "Marketing Specialist",
      email: "skyler@example.com",
    },
  ],
  "team-5": [
    {
      id: 13,
      name: "Reese Johnson",
      avatar: "/placeholder.svg?height=40&width=40&query=RJ",
      role: "Tour Manager",
      email: "reese@example.com",
    },
    {
      id: 14,
      name: "Parker Davis",
      avatar: "/placeholder.svg?height=40&width=40&query=PD",
      role: "Tour Staff",
      email: "parker@example.com",
    },
  ],
}

interface TeamRolesPermissionsProps {
  teamId: string
}

export function TeamRolesPermissions({ teamId }: TeamRolesPermissionsProps) {
  const [roles, setRoles] = useState(mockRoles[teamId as keyof typeof mockRoles] || [])
  const [members, setMembers] = useState(mockMembersWithRoles[teamId as keyof typeof mockMembersWithRoles] || [])
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    permissions: {
      manageMembers: false,
      manageRoles: false,
      createAnnouncements: false,
      assignTasks: false,
      scheduleShifts: false,
      editTeamDetails: false,
      deleteTeam: false,
      viewAnalytics: false,
    },
  })

  const { toast } = useToast()

  const handleAddRole = () => {
    const roleObj = {
      id: roles.length + 1,
      name: newRole.name,
      description: newRole.description,
      color: newRole.color,
      memberCount: 0,
      permissions: { ...newRole.permissions },
    }

    setRoles([...roles, roleObj])
    setIsAddRoleOpen(false)
    setNewRole({
      name: "",
      description: "",
      color: "bg-blue-500",
      permissions: {
        manageMembers: false,
        manageRoles: false,
        createAnnouncements: false,
        assignTasks: false,
        scheduleShifts: false,
        editTeamDetails: false,
        deleteTeam: false,
        viewAnalytics: false,
      },
    })

    toast({
      title: "Role created",
      description: `The role "${roleObj.name}" has been created successfully.`,
    })
  }

  const handleEditRole = () => {
    if (!selectedRole) return

    const updatedRoles = roles.map((role) => (role.id === selectedRole.id ? selectedRole : role))
    setRoles(updatedRoles)
    setIsEditRoleOpen(false)
    setSelectedRole(null)

    toast({
      title: "Role updated",
      description: `The role "${selectedRole.name}" has been updated successfully.`,
    })
  }

  const handleDeleteRole = (roleId: number) => {
    // Check if role has members
    const roleToDelete = roles.find((role) => role.id === roleId)
    if (roleToDelete && roleToDelete.memberCount > 0) {
      toast({
        title: "Cannot delete role",
        description: `The role "${roleToDelete.name}" has ${roleToDelete.memberCount} members assigned to it.`,
        variant: "destructive",
      })
      return
    }

    setRoles(roles.filter((role) => role.id !== roleId))
    toast({
      title: "Role deleted",
      description: "The role has been deleted successfully.",
    })
  }

  const handleUpdateMemberRole = (memberId: number, newRoleName: string) => {
    const updatedMembers = members.map((member) => (member.id === memberId ? { ...member, role: newRoleName } : member))
    setMembers(updatedMembers)

    // Update role member counts
    const updatedRoles = [...roles]
    const roleCountMap = updatedMembers.reduce((acc: Record<string, number>, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {})

    updatedRoles.forEach((role) => {
      role.memberCount = roleCountMap[role.name] || 0
    })

    setRoles(updatedRoles)

    toast({
      title: "Role updated",
      description: "The member's role has been updated successfully.",
    })
  }

  const getRoleColor = (roleName: string) => {
    const role = roles.find((r) => r.name === roleName)
    return role ? role.color : "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Roles & Permissions</h3>
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role and set its permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roleName" className="text-right">
                  Role Name
                </Label>
                <Input
                  id="roleName"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roleDescription" className="text-right">
                  Description
                </Label>
                <Input
                  id="roleDescription"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roleColor" className="text-right">
                  Color
                </Label>
                <div className="col-span-3 flex gap-2">
                  {["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500", "bg-pink-500"].map(
                    (color) => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full ${color} ${
                          newRole.color === color ? "ring-2 ring-offset-2" : ""
                        }`}
                        onClick={() => setNewRole({ ...newRole, color })}
                        type="button"
                      />
                    ),
                  )}
                </div>
              </div>
              <Separator className="my-2" />
              <h4 className="font-medium">Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="manageMembers">Manage Members</Label>
                  <Switch
                    id="manageMembers"
                    checked={newRole.permissions.manageMembers}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, manageMembers: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="manageRoles">Manage Roles</Label>
                  <Switch
                    id="manageRoles"
                    checked={newRole.permissions.manageRoles}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, manageRoles: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="createAnnouncements">Create Announcements</Label>
                  <Switch
                    id="createAnnouncements"
                    checked={newRole.permissions.createAnnouncements}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, createAnnouncements: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="assignTasks">Assign Tasks</Label>
                  <Switch
                    id="assignTasks"
                    checked={newRole.permissions.assignTasks}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, assignTasks: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="scheduleShifts">Schedule Shifts</Label>
                  <Switch
                    id="scheduleShifts"
                    checked={newRole.permissions.scheduleShifts}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, scheduleShifts: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="editTeamDetails">Edit Team Details</Label>
                  <Switch
                    id="editTeamDetails"
                    checked={newRole.permissions.editTeamDetails}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, editTeamDetails: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="viewAnalytics">View Analytics</Label>
                  <Switch
                    id="viewAnalytics"
                    checked={newRole.permissions.viewAnalytics}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, viewAnalytics: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="deleteTeam">Delete Team</Label>
                  <Switch
                    id="deleteTeam"
                    checked={newRole.permissions.deleteTeam}
                    onCheckedChange={(checked) =>
                      setNewRole({
                        ...newRole,
                        permissions: { ...newRole.permissions, deleteTeam: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Roles</CardTitle>
            <CardDescription>Manage roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roles.length === 0 ? (
              <div className="text-center py-6">
                <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No roles defined</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsAddRoleOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Role
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center">
                      <div className={`h-8 w-1 rounded-full ${role.color} mr-3`} />
                      <div>
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{role.memberCount} members</Badge>
                      <Dialog
                        open={isEditRoleOpen && selectedRole?.id === role.id}
                        onOpenChange={(open) => {
                          setIsEditRoleOpen(open)
                          if (open) {
                            setSelectedRole(role)
                          } else {
                            setSelectedRole(null)
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                            <DialogDescription>Modify role details and permissions.</DialogDescription>
                          </DialogHeader>
                          {selectedRole && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editRoleName" className="text-right">
                                  Role Name
                                </Label>
                                <Input
                                  id="editRoleName"
                                  value={selectedRole.name}
                                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editRoleDescription" className="text-right">
                                  Description
                                </Label>
                                <Input
                                  id="editRoleDescription"
                                  value={selectedRole.description}
                                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editRoleColor" className="text-right">
                                  Color
                                </Label>
                                <div className="col-span-3 flex gap-2">
                                  {[
                                    "bg-red-500",
                                    "bg-blue-500",
                                    "bg-green-500",
                                    "bg-purple-500",
                                    "bg-amber-500",
                                    "bg-pink-500",
                                  ].map((color) => (
                                    <button
                                      key={color}
                                      className={`h-8 w-8 rounded-full ${color} ${
                                        selectedRole.color === color ? "ring-2 ring-offset-2" : ""
                                      }`}
                                      onClick={() => setSelectedRole({ ...selectedRole, color })}
                                      type="button"
                                    />
                                  ))}
                                </div>
                              </div>
                              <Separator className="my-2" />
                              <h4 className="font-medium">Permissions</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editManageMembers">Manage Members</Label>
                                  <Switch
                                    id="editManageMembers"
                                    checked={selectedRole.permissions.manageMembers}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, manageMembers: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editManageRoles">Manage Roles</Label>
                                  <Switch
                                    id="editManageRoles"
                                    checked={selectedRole.permissions.manageRoles}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, manageRoles: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editCreateAnnouncements">Create Announcements</Label>
                                  <Switch
                                    id="editCreateAnnouncements"
                                    checked={selectedRole.permissions.createAnnouncements}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, createAnnouncements: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editAssignTasks">Assign Tasks</Label>
                                  <Switch
                                    id="editAssignTasks"
                                    checked={selectedRole.permissions.assignTasks}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, assignTasks: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editScheduleShifts">Schedule Shifts</Label>
                                  <Switch
                                    id="editScheduleShifts"
                                    checked={selectedRole.permissions.scheduleShifts}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, scheduleShifts: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editTeamDetails">Edit Team Details</Label>
                                  <Switch
                                    id="editTeamDetails"
                                    checked={selectedRole.permissions.editTeamDetails}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, editTeamDetails: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editViewAnalytics">View Analytics</Label>
                                  <Switch
                                    id="editViewAnalytics"
                                    checked={selectedRole.permissions.viewAnalytics}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, viewAnalytics: checked },
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="editDeleteTeam">Delete Team</Label>
                                  <Switch
                                    id="editDeleteTeam"
                                    checked={selectedRole.permissions.deleteTeam}
                                    onCheckedChange={(checked) =>
                                      setSelectedRole({
                                        ...selectedRole,
                                        permissions: { ...selectedRole.permissions, deleteTeam: checked },
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleEditRole}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.memberCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Roles</CardTitle>
            <CardDescription>Assign roles to team members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleColor(member.role)} text-white`}>{member.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Change Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Member Role</DialogTitle>
                            <DialogDescription>Assign a different role to this team member.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="flex items-center mb-4">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {roles.map((role) => (
                                <div
                                  key={role.id}
                                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                                    member.role === role.name ? "bg-muted" : "hover:bg-muted/50"
                                  }`}
                                  onClick={() => handleUpdateMemberRole(member.id, role.name)}
                                >
                                  <div className="flex items-center">
                                    <div className={`h-8 w-1 rounded-full ${role.color} mr-3`} />
                                    <div>
                                      <h4 className="font-medium">{role.name}</h4>
                                      <p className="text-xs text-muted-foreground">{role.description}</p>
                                    </div>
                                  </div>
                                  {member.role === role.name && <Check className="h-4 w-4 text-primary" />}
                                </div>
                              ))}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Overview of permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id}>
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full ${role.color} mr-2`} />
                        {role.name}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Manage Members</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.manageMembers ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Manage Roles</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.manageRoles ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Create Announcements</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.createAnnouncements ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Assign Tasks</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.assignTasks ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Schedule Shifts</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.scheduleShifts ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Edit Team Details</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.editTeamDetails ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">View Analytics</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.viewAnalytics ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Delete Team</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id}>
                      {role.permissions.deleteTeam ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
