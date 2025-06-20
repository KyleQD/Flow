"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Phone,
  Mail,
  Calendar,
  Star,
  DollarSign,
  Briefcase,
  Award,
  Download,
  Eye,
  Building2,
  Zap,
  UserPlus,
  FileText,
  Target,
  BookOpen,
  UserCheck,
  MessageSquare,
  Bell,
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Send,
  Mic,
  Video,
  Shield,
  Settings,
  BarChart3,
  Wifi,
  WifiOff,
  BrainCircuit,
  Sparkles,
  RadioTower,
  Headphones,
  MonitorSpeaker
} from "lucide-react"

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  avatar?: string
  status: 'online' | 'busy' | 'away' | 'offline'
  lastActive: string
  performance: number
  hourlyRate: number
  eventsCompleted: number
  hoursWorked: number
  reliability: number
  skills: string[]
  nextShift?: string
  isAvailable: boolean
  employmentType: string
  phone: string
  email: string
}

export default function FuturisticStaffManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)

  // Enhanced mock data with more realistic staff
  const staffMembers: StaffMember[] = [
    {
      id: "staff-1",
      name: "Alex Chen",
      role: "Venue Manager",
      department: "Operations",
      avatar: "/placeholder.svg",
      status: "online",
      lastActive: "Active now",
      performance: 98,
      hourlyRate: 35,
      eventsCompleted: 124,
      hoursWorked: 2240,
      reliability: 99,
      skills: ["Team Leadership", "Event Planning", "Crisis Management", "Budget Management"],
      nextShift: "Tomorrow 2:00 PM",
      isAvailable: true,
      employmentType: "Full-time",
      phone: "(555) 123-4567",
      email: "alex.chen@venue.com"
    },
    {
      id: "staff-2",
      name: "Maya Rodriguez",
      role: "Sound Engineer",
      department: "Technical",
      avatar: "/placeholder.svg",
      status: "busy",
      lastActive: "2 min ago",
      performance: 95,
      hourlyRate: 42,
      eventsCompleted: 89,
      hoursWorked: 1680,
      reliability: 97,
      skills: ["Live Sound", "Pro Tools", "System Design", "Mixing"],
      nextShift: "Today 6:00 PM",
      isAvailable: false,
      employmentType: "Full-time",
      phone: "(555) 234-5678",
      email: "maya.rodriguez@venue.com"
    },
    {
      id: "staff-3",
      name: "Jordan Kim",
      role: "Bar Manager",
      department: "Service",
      avatar: "/placeholder.svg",
      status: "online",
      lastActive: "5 min ago",
      performance: 92,
      hourlyRate: 28,
      eventsCompleted: 156,
      hoursWorked: 1920,
      reliability: 94,
      skills: ["Mixology", "Inventory Management", "Staff Training", "POS Systems"],
      nextShift: "Tomorrow 5:00 PM",
      isAvailable: true,
      employmentType: "Full-time",
      phone: "(555) 345-6789",
      email: "jordan.kim@venue.com"
    },
    {
      id: "staff-4",
      name: "Sam Taylor",
      role: "Security Lead",
      department: "Security",
      avatar: "/placeholder.svg",
      status: "away",
      lastActive: "15 min ago",
      performance: 96,
      hourlyRate: 32,
      eventsCompleted: 78,
      hoursWorked: 1560,
      reliability: 98,
      skills: ["Crowd Control", "De-escalation", "Emergency Response", "Team Coordination"],
      nextShift: "Today 8:00 PM",
      isAvailable: true,
      employmentType: "Full-time",
      phone: "(555) 456-7890",
      email: "sam.taylor@venue.com"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-400'
    if (performance >= 85) return 'text-blue-400'
    return 'text-yellow-400'
  }

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return
    
    toast({
      title: isEmergencyMode ? "🚨 Emergency Alert Sent" : "📢 Broadcast Sent",
      description: `Message sent to all ${staffMembers.length} staff members`,
    })
    
    setBroadcastMessage("")
    setIsEmergencyMode(false)
  }

  const stats = {
    totalStaff: staffMembers.length,
    onlineStaff: staffMembers.filter(s => s.status === 'online').length,
    avgPerformance: Math.round(staffMembers.reduce((acc, s) => acc + s.performance, 0) / staffMembers.length),
    totalHours: staffMembers.reduce((acc, s) => acc + s.hoursWorked, 0),
    upcomingShifts: staffMembers.filter(s => s.nextShift).length,
    totalEvents: staffMembers.reduce((acc, s) => acc + s.eventsCompleted, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      {/* Futuristic Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Neural Staff Command
              </h1>
              <p className="text-slate-400">Advanced workforce intelligence & communication hub</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400">Add New Staff Member</DialogTitle>
                </DialogHeader>
                {/* Add staff form would go here */}
                <div className="p-4">
                  <p className="text-slate-400">Staff onboarding form coming soon...</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Real-time Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total Staff", value: stats.totalStaff, icon: Users, color: "from-blue-500 to-cyan-500" },
            { label: "Online Now", value: stats.onlineStaff, icon: Wifi, color: "from-green-500 to-emerald-500" },
            { label: "Avg Performance", value: `${stats.avgPerformance}%`, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
            { label: "Total Hours", value: stats.totalHours.toLocaleString(), icon: Clock, color: "from-orange-500 to-red-500" },
            { label: "Upcoming Shifts", value: stats.upcomingShifts, icon: Calendar, color: "from-teal-500 to-cyan-500" },
            { label: "Events Complete", value: stats.totalEvents, icon: CheckCircle, color: "from-indigo-500 to-purple-500" }
          ].map((stat, i) => (
            <Card key={i} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
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

        {/* Emergency Broadcast System */}
        <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioTower className="h-5 w-5 text-red-400" />
                <span className="text-red-400 font-semibold">Broadcast System</span>
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <Input 
                  placeholder="Send message to all staff..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                  className={`${isEmergencyMode ? 'bg-red-600 border-red-500 text-white' : 'border-slate-600'}`}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Emergency
                </Button>
                <Button 
                  onClick={handleBroadcast}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <Activity className="h-4 w-4 mr-2" />
            Neural Overview
          </TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <Users className="h-4 w-4 mr-2" />
            Active Staff
          </TabsTrigger>
          <TabsTrigger value="communications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <Calendar className="h-4 w-4 mr-2" />
            Smart Scheduler
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Activity Feed */}
            <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-400">Live Activity Feed</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {[
                      { user: "Maya Rodriguez", action: "Started sound check for tonight's event", time: "2 min ago", type: "work" },
                      { user: "Alex Chen", action: "Approved overtime request for weekend event", time: "5 min ago", type: "admin" },
                      { user: "Jordan Kim", action: "Updated bar inventory levels", time: "8 min ago", type: "update" },
                      { user: "Sam Taylor", action: "Completed security briefing", time: "12 min ago", type: "complete" },
                      { user: "System", action: "Automated staff performance review initiated", time: "15 min ago", type: "system" }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'work' ? 'bg-green-400' :
                          activity.type === 'admin' ? 'bg-blue-400' :
                          activity.type === 'update' ? 'bg-yellow-400' :
                          activity.type === 'complete' ? 'bg-purple-400' :
                          'bg-cyan-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.user}</p>
                          <p className="text-slate-400 text-xs">{activity.action}</p>
                          <p className="text-slate-500 text-xs">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:from-blue-600/30 hover:to-cyan-600/30">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Broadcast
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:from-green-600/30 hover:to-emerald-600/30">
                  <Video className="h-4 w-4 mr-2" />
                  Video Conference
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30">
                  <Calendar className="h-4 w-4 mr-2" />
                  Emergency Schedule
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 hover:from-orange-600/30 hover:to-red-600/30">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Alert
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          {/* Advanced Search and Filters */}
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-slate-600 bg-slate-700/50 hover:bg-slate-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {staffMembers.map((staff) => (
              <Card key={staff.id} className="group bg-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-6">
                  {/* Staff Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-slate-600">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(staff.status)} rounded-full border-2 border-slate-800`}></div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{staff.name}</h3>
                        <p className="text-slate-400 text-sm">{staff.role}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-slate-700/50 border-slate-600">
                            {staff.department}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-slate-700/50 border-slate-600">
                            {staff.employmentType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(staff.performance)}`}>
                        {staff.performance}%
                      </div>
                      <div className="text-xs text-slate-400">Performance</div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-white font-semibold">{staff.eventsCompleted}</div>
                      <div className="text-xs text-slate-400">Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">{staff.hoursWorked.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">{staff.reliability}%</div>
                      <div className="text-xs text-slate-400">Reliable</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="text-xs text-slate-400 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {staff.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30 text-cyan-400">
                          {skill}
                        </Badge>
                      ))}
                      {staff.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-slate-700/50 border-slate-600 text-slate-400">
                          +{staff.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Next Shift */}
                  {staff.nextShift && (
                    <div className="mb-4 p-2 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-cyan-400" />
                        <span className="text-xs text-slate-400">Next Shift:</span>
                        <span className="text-xs text-white">{staff.nextShift}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-700/50">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-700/50">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-700/50">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message Center */}
            <Card className="lg:col-span-2 bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-400">Neural Message Center</span>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {[
                      { sender: "Maya Rodriguez", message: "Sound system check complete. All levels optimal.", time: "2 min ago", avatar: "/placeholder.svg" },
                      { sender: "You", message: "Great work! How's the new mixing board?", time: "1 min ago", isMe: true },
                      { sender: "Jordan Kim", message: "Bar inventory restocked. Ready for tonight's rush.", time: "5 min ago", avatar: "/placeholder.svg" },
                      { sender: "Sam Taylor", message: "Security briefing complete. Team is positioned.", time: "8 min ago", avatar: "/placeholder.svg" }
                    ].map((msg, i) => (
                      <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-2 max-w-xs ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!msg.isMe && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={msg.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs">
                                {msg.sender.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div className={`p-3 rounded-lg ${
                              msg.isMe 
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                                : 'bg-slate-700/50 text-white'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center space-x-2 mt-4">
                  <Input 
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communication Tools */}
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Communication Hub</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 hover:from-green-600/30 hover:to-emerald-600/30">
                  <MonitorSpeaker className="h-4 w-4 mr-2" />
                  All-Call System
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:from-blue-600/30 hover:to-cyan-600/30">
                  <Headphones className="h-4 w-4 mr-2" />
                  Team Channels
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30">
                  <Bell className="h-4 w-4 mr-2" />
                  Priority Alerts
                </Button>
                <Button className="w-full justify-start bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 hover:from-yellow-600/30 hover:to-orange-600/30">
                  <FileText className="h-4 w-4 mr-2" />
                  Task Assignments
                </Button>
                
                {/* Online Staff */}
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400 mb-3">Online Staff ({stats.onlineStaff})</div>
                  <div className="space-y-2">
                    {staffMembers.filter(s => s.status === 'online').map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={staff.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs">
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-800"></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm">{staff.name}</div>
                          <div className="text-slate-400 text-xs">{staff.role}</div>
                        </div>
                        <MessageSquare className="h-4 w-4 text-slate-400 hover:text-cyan-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {[
              { title: "Performance Trend", value: "+12%", subtitle: "vs last month", color: "from-green-500 to-emerald-500" },
              { title: "Efficiency Score", value: "94.2%", subtitle: "across all teams", color: "from-blue-500 to-cyan-500" },
              { title: "Response Time", value: "1.2min", subtitle: "avg communication", color: "from-purple-500 to-pink-500" },
              { title: "Cost Savings", value: "$4.2K", subtitle: "optimized scheduling", color: "from-orange-500 to-red-500" }
            ].map((metric, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{metric.title}</p>
                      <p className="text-3xl font-bold text-white">{metric.value}</p>
                      <p className="text-slate-500 text-xs">{metric.subtitle}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart Placeholder */}
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400">Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-cyan-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">Advanced analytics visualization</p>
                    <p className="text-sm text-slate-500">Chart integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffMembers
                    .sort((a, b) => b.performance - a.performance)
                    .slice(0, 4)
                    .map((staff, i) => (
                    <div key={staff.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        i === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        i === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                        'bg-gradient-to-r from-slate-500 to-slate-600'
                      }`}>
                        {i + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={staff.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-white font-medium">{staff.name}</div>
                        <div className="text-slate-400 text-sm">{staff.role}</div>
                      </div>
                      <div className={`text-lg font-bold ${getPerformanceColor(staff.performance)}`}>
                        {staff.performance}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Smart Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-6">
          <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-cyan-400" />
                <span className="text-cyan-400">AI-Powered Smart Scheduler</span>
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">BETA</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Intelligent Scheduling Engine</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Advanced AI algorithms optimize staff scheduling based on performance metrics, 
                  availability, event requirements, and predictive analytics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <BrainCircuit className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Predictive Analytics</h4>
                    <p className="text-slate-400 text-sm">Forecast staffing needs</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Performance Matching</h4>
                    <p className="text-slate-400 text-sm">Optimal staff-event pairing</p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <h4 className="text-white font-semibold mb-1">Auto-Optimization</h4>
                    <p className="text-slate-400 text-sm">Real-time adjustments</p>
                  </div>
                </div>
                <Button className="mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure AI Scheduler
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 