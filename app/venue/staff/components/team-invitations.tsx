"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  UserPlus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Mail,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Calendar,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy
} from "lucide-react"

interface TeamInvitation {
  id: string
  email: string
  name?: string
  role: string
  department: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  sentDate: string
  expiryDate: string
  invitedBy: string
  message?: string
  permissions: string[]
  lastReminder?: string
  responseDate?: string
}

interface ExternalAccount {
  id: string
  email: string
  name: string
  currentVenue?: string
  accountType: 'artist' | 'venue' | 'general'
  verified: boolean
  joinDate: string
  skills: string[]
  experience: string
}

export default function TeamInvitations() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("invitations")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showBulkInvite, setShowBulkInvite] = useState(false)
  const [inviteType, setInviteType] = useState<'single' | 'bulk' | 'existing'>('single')

  // Mock invitations data
  const [invitations] = useState<TeamInvitation[]>([
    {
      id: "inv-1",
      email: "sarah.johnson@email.com",
      name: "Sarah Johnson",
      role: "Sound Engineer",
      department: "Technical",
      status: "pending",
      sentDate: "2024-02-10",
      expiryDate: "2024-02-24",
      invitedBy: "Alex Chen",
      message: "We'd love to have you join our technical team. Your experience with live sound would be invaluable.",
      permissions: ["technical_access", "equipment_management"],
      lastReminder: "2024-02-12"
    },
    {
      id: "inv-2",
      email: "mike.rodriguez@email.com",
      name: "Mike Rodriguez",
      role: "Security Specialist",
      department: "Security",
      status: "accepted",
      sentDate: "2024-02-05",
      expiryDate: "2024-02-19",
      invitedBy: "Maya Rodriguez",
      permissions: ["security_access", "crowd_control"],
      responseDate: "2024-02-07"
    },
    {
      id: "inv-3",
      email: "emma.wilson@email.com",
      role: "Event Coordinator",
      department: "Operations",
      status: "declined",
      sentDate: "2024-02-01",
      expiryDate: "2024-02-15",
      invitedBy: "Jordan Kim",
      message: "Thank you for the offer, but I've accepted another position.",
      permissions: ["event_management", "vendor_coordination"],
      responseDate: "2024-02-03"
    }
  ])

  // Mock external accounts that can be invited
  const [externalAccounts] = useState<ExternalAccount[]>([
    {
      id: "ext-1",
      email: "david.chen@email.com",
      name: "David Chen",
      currentVenue: "Downtown Arena",
      accountType: "venue",
      verified: true,
      joinDate: "2023-05-15",
      skills: ["Live Sound", "System Design", "Pro Tools"],
      experience: "5+ years"
    },
    {
      id: "ext-2",
      email: "lisa.park@email.com", 
      name: "Lisa Park",
      accountType: "artist",
      verified: true,
      joinDate: "2023-08-20",
      skills: ["Event Production", "Artist Relations"],
      experience: "3+ years"
    }
  ])

  const [newInvitation, setNewInvitation] = useState({
    email: "",
    name: "",
    role: "",
    department: "",
    message: "",
    permissions: [] as string[]
  })

  const [bulkEmails, setBulkEmails] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'accepted': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'declined': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'expired': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const handleSendInvitation = () => {
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${newInvitation.email}`,
    })
    setShowInviteDialog(false)
    setNewInvitation({
      email: "",
      name: "",
      role: "",
      department: "",
      message: "",
      permissions: []
    })
  }

  const handleBulkInvite = () => {
    const emails = bulkEmails.split('\n').filter(email => email.trim())
    toast({
      title: "Bulk Invitations Sent",
      description: `Sent ${emails.length} invitations`,
    })
    setShowBulkInvite(false)
    setBulkEmails("")
  }

  const handleReminder = (invitationId: string) => {
    toast({
      title: "Reminder Sent",
      description: "Reminder email has been sent",
    })
  }

  const handleRevokeInvitation = (invitationId: string) => {
    toast({
      title: "Invitation Revoked",
      description: "The invitation has been revoked",
    })
  }

  const stats = {
    totalInvitations: invitations.length,
    pending: invitations.filter(i => i.status === 'pending').length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    declined: invitations.filter(i => i.status === 'declined').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Team Invitations
          </h1>
          <p className="text-slate-400 mt-1">Invite and onboard team members from other accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="bg-slate-800/50 border-slate-600">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowInviteDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Invitations", value: stats.totalInvitations, icon: Send, color: "from-blue-500 to-cyan-500" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
          { label: "Declined", value: stats.declined, icon: XCircle, color: "from-red-500 to-pink-500" }
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
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="discover">Discover Accounts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="space-y-6">
          {/* Filter Bar */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search invitations..." className="pl-9 bg-slate-700/50 border-slate-600" />
                </div>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-slate-600 bg-slate-700/50">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invitations List */}
          <div className="grid grid-cols-1 gap-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {invitation.name ? invitation.name.split(' ').map(n => n[0]).join('') : invitation.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold">{invitation.name || invitation.email}</h3>
                        <p className="text-slate-400 text-sm">{invitation.role} • {invitation.department}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(invitation.status)}>
                            {invitation.status}
                          </Badge>
                          <span className="text-slate-500 text-xs">
                            Sent {invitation.sentDate} by {invitation.invitedBy}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {invitation.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-600"
                            onClick={() => handleReminder(invitation.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Remind
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-600 text-red-400"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>

                  {/* Invitation Details */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Permissions</div>
                      <div className="flex flex-wrap gap-1">
                        {invitation.permissions.map((permission, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-slate-700/50 border-slate-600">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Expires</div>
                      <div className="text-slate-300 text-sm">{invitation.expiryDate}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Contact</div>
                      <div className="text-slate-300 text-sm">{invitation.email}</div>
                    </div>
                  </div>

                  {invitation.message && (
                    <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-slate-400 text-xs mb-1">Message</div>
                      <p className="text-slate-300 text-sm">{invitation.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Discover Accounts Tab */}
        <TabsContent value="discover" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-green-400">Discover Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {externalAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                          {account.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-white font-semibold">{account.name}</h3>
                        <p className="text-slate-400 text-sm">{account.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-slate-700/50 border-slate-600">
                            {account.accountType}
                          </Badge>
                          {account.verified && (
                            <Badge variant="outline" className="text-xs text-green-400 bg-green-500/10 border-green-500/20">
                              Verified
                            </Badge>
                          )}
                          {account.currentVenue && (
                            <span className="text-slate-500 text-xs">@ {account.currentVenue}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex flex-wrap gap-1 mb-2 justify-end">
                        {account.skills.slice(0, 2).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-blue-500/20 border-blue-500/30 text-blue-400">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-slate-400 text-xs mb-2">{account.experience}</div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Invite
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                title: "Sound Engineer Invitation",
                description: "Template for inviting technical sound engineers",
                usage: 12,
                category: "Technical"
              },
              {
                title: "Security Team Invitation",
                description: "Standard invitation for security personnel",
                usage: 8,
                category: "Security"
              }
            ].map((template, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">{template.title}</h3>
                      <p className="text-slate-400 text-sm">{template.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-700/50 border-slate-600">
                      {template.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Used {template.usage} times</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-slate-600">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Copy className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Invite Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={inviteType === 'single' ? 'default' : 'outline'}
                onClick={() => setInviteType('single')}
                className="text-sm"
              >
                Single Invite
              </Button>
              <Button
                variant={inviteType === 'bulk' ? 'default' : 'outline'}
                onClick={() => setInviteType('bulk')}
                className="text-sm"
              >
                Bulk Invite
              </Button>
              <Button
                variant={inviteType === 'existing' ? 'default' : 'outline'}
                onClick={() => setInviteType('existing')}
                className="text-sm"
              >
                From Accounts
              </Button>
            </div>

            {inviteType === 'single' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newInvitation.email}
                      onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name (Optional)</Label>
                    <Input
                      id="name"
                      value={newInvitation.name}
                      onChange={(e) => setNewInvitation({ ...newInvitation, name: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newInvitation.role} onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="sound-engineer">Sound Engineer</SelectItem>
                        <SelectItem value="security-specialist">Security Specialist</SelectItem>
                        <SelectItem value="event-coordinator">Event Coordinator</SelectItem>
                        <SelectItem value="bar-staff">Bar Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={newInvitation.department} onValueChange={(value) => setNewInvitation({ ...newInvitation, department: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={newInvitation.message}
                    onChange={(e) => setNewInvitation({ ...newInvitation, message: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                    placeholder="Add a personal message to your invitation..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {inviteType === 'bulk' && (
              <div>
                <Label htmlFor="bulk-emails">Email Addresses</Label>
                <Textarea
                  id="bulk-emails"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="bg-slate-800 border-slate-600 min-h-32"
                  placeholder="Enter email addresses, one per line..."
                />
                <p className="text-slate-400 text-sm mt-2">
                  Enter one email address per line. All invitees will receive the same role and permissions.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={inviteType === 'bulk' ? handleBulkInvite : handleSendInvitation} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Invitation{inviteType === 'bulk' ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 