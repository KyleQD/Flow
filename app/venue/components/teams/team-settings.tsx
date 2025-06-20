"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  Download,
  Trash2,
  Upload,
  Users,
  Shield,
  Bell,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  MessageSquare,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeamSettingsProps {
  teamId: string
  team: {
    id: string
    name: string
    description: string
    memberCount: number
    type: string
    color: string
    avatar: string
  }
}

export function TeamSettings({ teamId, team }: TeamSettingsProps) {
  const [teamDetails, setTeamDetails] = useState({
    name: team.name,
    description: team.description,
    type: team.type,
    color: team.color.replace("bg-", ""),
    visibility: "private",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    announcements: true,
    messages: true,
    taskAssignments: true,
    shiftChanges: true,
    memberJoins: false,
    emailDigest: "daily",
  })

  const [permissionSettings, setPermissionSettings] = useState({
    canInviteMembers: "admins", // admins, managers, all
    canCreateAnnouncements: "admins", // admins, managers, all
    canAssignTasks: "managers", // admins, managers, all
    canScheduleShifts: "managers", // admins, managers, all
    canEditTeamDetails: "admins", // admins only
  })

  const { toast } = useToast()

  const handleSaveTeamDetails = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Team details updated",
      description: "Your changes have been saved successfully.",
    })
  }

  const handleSaveNotifications = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    })
  }

  const handleSavePermissions = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Permission settings updated",
      description: "Team permission settings have been saved.",
    })
  }

  const handleDeleteTeam = () => {
    // In a real app, this would delete the team after confirmation
    toast({
      title: "Team deleted",
      description: "The team has been permanently deleted.",
      variant: "destructive",
    })
  }

  const handleExportTeamData = () => {
    // In a real app, this would trigger a data export
    toast({
      title: "Export started",
      description: "Your team data export is being prepared. You'll receive a download link shortly.",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
              <CardDescription>Update your team's basic information and appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={team.avatar || "/placeholder.svg"} alt={team.name} />
                  <AvatarFallback className={team.color}>{team.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">Recommended: Square image, at least 300x300px</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamName" className="text-right">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    value={teamDetails.name}
                    onChange={(e) => setTeamDetails({ ...teamDetails, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamDescription" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="teamDescription"
                    value={teamDetails.description}
                    onChange={(e) => setTeamDetails({ ...teamDetails, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamType" className="text-right">
                    Team Type
                  </Label>
                  <Select
                    value={teamDetails.type}
                    onValueChange={(value) => setTeamDetails({ ...teamDetails, type: value })}
                  >
                    <SelectTrigger id="teamType" className="col-span-3">
                      <SelectValue placeholder="Select team type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venue">Venue</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Tour">Tour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamColor" className="text-right">
                    Team Color
                  </Label>
                  <Select
                    value={teamDetails.color}
                    onValueChange={(value) => setTeamDetails({ ...teamDetails, color: value })}
                  >
                    <SelectTrigger id="teamColor" className="col-span-3">
                      <SelectValue placeholder="Select team color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue-500">Blue</SelectItem>
                      <SelectItem value="green-500">Green</SelectItem>
                      <SelectItem value="red-500">Red</SelectItem>
                      <SelectItem value="purple-500">Purple</SelectItem>
                      <SelectItem value="amber-500">Amber</SelectItem>
                      <SelectItem value="pink-500">Pink</SelectItem>
                      <SelectItem value="indigo-500">Indigo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="teamVisibility" className="text-right">
                    Visibility
                  </Label>
                  <Select
                    value={teamDetails.visibility}
                    onValueChange={(value) => setTeamDetails({ ...teamDetails, visibility: value })}
                  >
                    <SelectTrigger id="teamVisibility" className="col-span-3">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          <div>
                            <span>Public</span>
                            <p className="text-xs text-muted-foreground">Visible to everyone in your organization</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <EyeOff className="h-4 w-4 mr-2" />
                          <div>
                            <span>Private</span>
                            <p className="text-xs text-muted-foreground">Only visible to team members</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveTeamDetails}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team membership and roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Current Members</h4>
                  <p className="text-sm text-muted-foreground">{team.memberCount} members</p>
                </div>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Team Roles</h4>
                  <Badge variant="outline">3 roles</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-red-500" />
                      <span className="font-medium">Admin</span>
                    </div>
                    <Badge>1 member</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">Manager</span>
                    </div>
                    <Badge>2 members</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">Member</span>
                    </div>
                    <Badge>{team.memberCount - 3} members</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications from this team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">In-App Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="announcements">Announcements</Label>
                    </div>
                    <Switch
                      id="announcements"
                      checked={notificationSettings.announcements}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, announcements: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label htmlFor="messages">Team Messages</Label>
                    </div>
                    <Switch
                      id="messages"
                      checked={notificationSettings.messages}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, messages: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4" />
                      <Label htmlFor="taskAssignments">Task Assignments</Label>
                    </div>
                    <Switch
                      id="taskAssignments"
                      checked={notificationSettings.taskAssignments}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, taskAssignments: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <Label htmlFor="shiftChanges">Shift Changes</Label>
                    </div>
                    <Switch
                      id="shiftChanges"
                      checked={notificationSettings.shiftChanges}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, shiftChanges: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <Label htmlFor="memberJoins">New Member Joins</Label>
                    </div>
                    <Switch
                      id="memberJoins"
                      checked={notificationSettings.memberJoins}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, memberJoins: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Email Notifications</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="emailDigest" className="text-right">
                      Email Digest
                    </Label>
                    <Select
                      value={notificationSettings.emailDigest}
                      onValueChange={(value) =>
                        setNotificationSettings({ ...notificationSettings, emailDigest: value })
                      }
                    >
                      <SelectTrigger id="emailDigest" className="col-span-3">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                        <SelectItem value="none">Don't send emails</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Email notifications will be sent to your account email address
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Permissions</CardTitle>
              <CardDescription>Configure who can perform different actions within the team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inviteMembers" className="text-right">
                    Invite Members
                  </Label>
                  <Select
                    value={permissionSettings.canInviteMembers}
                    onValueChange={(value) => setPermissionSettings({ ...permissionSettings, canInviteMembers: value })}
                  >
                    <SelectTrigger id="inviteMembers" className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="managers">Admins & Managers</SelectItem>
                      <SelectItem value="all">All Team Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="createAnnouncements" className="text-right">
                    Create Announcements
                  </Label>
                  <Select
                    value={permissionSettings.canCreateAnnouncements}
                    onValueChange={(value) =>
                      setPermissionSettings({ ...permissionSettings, canCreateAnnouncements: value })
                    }
                  >
                    <SelectTrigger id="createAnnouncements" className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="managers">Admins & Managers</SelectItem>
                      <SelectItem value="all">All Team Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignTasks" className="text-right">
                    Assign Tasks
                  </Label>
                  <Select
                    value={permissionSettings.canAssignTasks}
                    onValueChange={(value) => setPermissionSettings({ ...permissionSettings, canAssignTasks: value })}
                  >
                    <SelectTrigger id="assignTasks" className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="managers">Admins & Managers</SelectItem>
                      <SelectItem value="all">All Team Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scheduleShifts" className="text-right">
                    Schedule Shifts
                  </Label>
                  <Select
                    value={permissionSettings.canScheduleShifts}
                    onValueChange={(value) =>
                      setPermissionSettings({ ...permissionSettings, canScheduleShifts: value })
                    }
                  >
                    <SelectTrigger id="scheduleShifts" className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="managers">Admins & Managers</SelectItem>
                      <SelectItem value="all">All Team Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editTeamDetails" className="text-right">
                    Edit Team Details
                  </Label>
                  <Select
                    value={permissionSettings.canEditTeamDetails}
                    onValueChange={(value) =>
                      setPermissionSettings({ ...permissionSettings, canEditTeamDetails: value })
                    }
                  >
                    <SelectTrigger id="editTeamDetails" className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePermissions}>Save Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Manage team data and danger zone settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Team Data</h4>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="space-y-1">
                    <h5 className="font-medium">Export Team Data</h5>
                    <p className="text-sm text-muted-foreground">
                      Download all team data including members, tasks, shifts, and messages.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportTeamData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-red-500">Danger Zone</h4>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-950/20">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <h5 className="font-medium text-red-500">Delete Team</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this team and all its data. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteTeam}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Import the missing components
import { CheckSquare, Calendar } from "lucide-react"
