"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  UserPlus,
  Send,
  Users,
  Search,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Star,
  Award,
  Globe
} from "lucide-react"

interface CrossAccountInvite {
  id: string
  email: string
  name: string
  currentAccount?: string
  accountType: 'artist' | 'venue' | 'general'
  role: string
  department: string
  status: 'pending' | 'accepted' | 'declined'
  sentDate: string
  message?: string
  invitedBy: string
}

export default function CrossAccountOnboarding() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("invite")
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const [crossAccountInvites] = useState<CrossAccountInvite[]>([
    {
      id: "cross-1",
      email: "sarah.musician@email.com",
      name: "Sarah Johnson",
      currentAccount: "Indie Artist Sarah",
      accountType: "artist",
      role: "Sound Consultant",
      department: "Technical",
      status: "pending",
      sentDate: "2024-02-12",
      message: "We'd love your expertise for our upcoming concert series",
      invitedBy: "Alex Chen"
    },
    {
      id: "cross-2", 
      email: "mike.venue@email.com",
      name: "Mike Rodriguez", 
      currentAccount: "City Concert Hall",
      accountType: "venue",
      role: "Security Advisor",
      department: "Security",
      status: "accepted",
      sentDate: "2024-02-08",
      invitedBy: "Maya Rodriguez"
    }
  ])

  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "",
    department: "",
    message: ""
  })

  const handleSendInvite = () => {
    toast({
      title: "Cross-Account Invitation Sent",
      description: `Invitation sent to ${newInvite.email}`,
    })
    setShowInviteDialog(false)
    setNewInvite({ email: "", role: "", department: "", message: "" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'accepted': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'declined': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'artist': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'venue': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'general': return 'text-green-400 bg-green-500/10 border-green-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cross-Account Onboarding
          </h1>
          <p className="text-slate-400 mt-1">Invite and onboard team members from other accounts</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="bg-gradient-to-r from-purple-500 to-pink-600">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite External User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Cross-Account Invites", value: crossAccountInvites.length, icon: Globe, color: "from-purple-500 to-pink-500" },
          { label: "Pending", value: crossAccountInvites.filter(i => i.status === 'pending').length, icon: Clock, color: "from-yellow-500 to-orange-500" },
          { label: "Accepted", value: crossAccountInvites.filter(i => i.status === 'accepted').length, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
          { label: "Active Collaborations", value: "12", icon: Users, color: "from-blue-500 to-cyan-500" }
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 grid w-full grid-cols-3">
          <TabsTrigger value="invite">Invite Process</TabsTrigger>
          <TabsTrigger value="active">Active Invitations</TabsTrigger>
          <TabsTrigger value="onboarded">Onboarded Members</TabsTrigger>
        </TabsList>

        {/* Invite Process Tab */}
        <TabsContent value="invite" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-purple-400">How Cross-Account Onboarding Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Discover Users</h3>
                  <p className="text-slate-400 text-sm">
                    Search for existing artists, venue operators, and general users across the platform
                  </p>
                </div>
                
                <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Send Invitations</h3>
                  <p className="text-slate-400 text-sm">
                    Invite users to collaborate with your venue team with specific roles and permissions
                  </p>
                </div>
                
                <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Team Integration</h3>
                  <p className="text-slate-400 text-sm">
                    Accepted members are seamlessly integrated into your venue team with appropriate access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Invite Section */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-green-400">Quick Invite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Enter email address..."
                  className="bg-slate-700/50 border-slate-600"
                />
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Invitations Tab */}
        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {crossAccountInvites.map((invite) => (
              <Card key={invite.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                          {invite.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold">{invite.name}</h3>
                        <p className="text-slate-400 text-sm">{invite.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getAccountTypeColor(invite.accountType)}>
                            {invite.accountType}
                          </Badge>
                          {invite.currentAccount && (
                            <span className="text-slate-500 text-xs">@ {invite.currentAccount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(invite.status)}>
                        {invite.status}
                      </Badge>
                      <p className="text-slate-400 text-sm mt-1">Sent {invite.sentDate}</p>
                      <p className="text-slate-500 text-xs">by {invite.invitedBy}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Invited Role</div>
                      <div className="text-slate-300">{invite.role} • {invite.department}</div>
                    </div>
                    {invite.message && (
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Message</div>
                        <div className="text-slate-300 text-sm line-clamp-2">{invite.message}</div>
                      </div>
                    )}
                  </div>

                  {invite.status === 'pending' && (
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600">
                        Resend
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-600 text-red-400">
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onboarded Members Tab */}
        <TabsContent value="onboarded" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-blue-400">Successfully Onboarded External Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {crossAccountInvites.filter(i => i.status === 'accepted').map((member) => (
                  <div key={member.id} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-white font-medium">{member.name}</h4>
                          <p className="text-slate-400 text-sm">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getAccountTypeColor(member.accountType)}>
                        {member.accountType}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">Department</div>
                        <div className="text-slate-300">{member.department}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Joined</div>
                        <div className="text-slate-300">{member.sentDate}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-purple-400">Invite External User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="user@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invite-role">Role</Label>
                <Select value={newInvite.role} onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                    <SelectItem value="advisor">Advisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invite-department">Department</Label>
                <Select value={newInvite.department} onValueChange={(value) => setNewInvite({ ...newInvite, department: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="invite-message">Invitation Message</Label>
              <Textarea
                id="invite-message"
                value={newInvite.message}
                onChange={(e) => setNewInvite({ ...newInvite, message: e.target.value })}
                className="bg-slate-800 border-slate-600"
                placeholder="Add a personal message to your invitation..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite} className="bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 