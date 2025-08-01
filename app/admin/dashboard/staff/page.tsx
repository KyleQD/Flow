"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { NeuralStaffCommand } from "@/components/admin/neural-staff-command"
import EnhancedOnboardingSystem from "@/components/admin/enhanced-onboarding-system"
import { EnhancedAddStaffDialog } from "./enhanced-add-staff-dialog"
import { useCurrentVenue } from "@/hooks/use-venue"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Star,
  Award,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  UserPlus,
  Settings,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Shield,
  Crown,
  Zap,
  BrainCircuit,
  BarChart3,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Send,
  Bell,
  RadioTower,
  Wifi,
  Mic,
  Video,
  PhoneCall,
  X,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Building,
  Globe,
  ExternalLink,
  Copy,
  Share2,
  Link,
  Lock,
  Unlock,
  EyeOff,
  AlertCircle,
  Info,
  HelpCircle,
  File,
  Folder,
  Image,
  Music,
  Headphones,
  Camera,
  Volume1,
  Maximize,
  Minimize,
  Move,
  RefreshCw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Crop,
  Scissors,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Table,
  Grid,
  Columns,
  Rows,
  Layout,
  Sidebar,
  SidebarClose,
  SidebarOpen,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  PanelBottomClose,
  PanelLeftOpen,
  PanelRightOpen,
  PanelTopOpen,
  PanelBottomOpen,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitCompare,
  GitFork,
  Database,
  Server,
  HardDrive,
  Cloud,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudSun,
  CloudMoon,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Thermometer,
  Droplets,
  Umbrella,
  Wind,
  Snowflake
} from "lucide-react"

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'on_tour'
  hire_date: string
  skills: string[]
  rating: number
  tours_completed: number
  current_assignment?: string
  salary: number
  avatar?: string
  location: string
  certifications: string[]
  availability: 'available' | 'busy' | 'vacation'
}

interface StaffStats {
  totalStaff: number
  activeStaff: number
  onTour: number
  available: number
  totalDepartments: number
  averageRating: number
  completedTours: number
  pendingApplications: number
}

export default function StaffPage() {
  const { venue, loading: venueLoading } = useCurrentVenue()
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("neural")
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    onTour: 0,
    available: 0,
    totalDepartments: 0,
    averageRating: 0,
    completedTours: 0,
    pendingApplications: 0
  })

  // Onboarding state
  const [onboardingCandidates, setOnboardingCandidates] = useState([
    {
      id: "1",
      name: "Alex Johnson",
      position: "Sound Engineer",
      department: "Technical",
      stage: "background_check",
      progress: 65,
      startDate: "2024-01-15",
      estimatedCompletion: "2024-02-01",
      documents: ["Resume", "ID Verification", "Background Check"],
      completedDocuments: ["Resume", "ID Verification"],
      nextStep: "Complete background check"
    },
    {
      id: "2",
      name: "Sarah Chen",
      position: "Event Coordinator",
      department: "Operations",
      stage: "training",
      progress: 85,
      startDate: "2024-01-10",
      estimatedCompletion: "2024-01-25",
      documents: ["Resume", "References", "Training Certificates"],
      completedDocuments: ["Resume", "References", "Training Certificates"],
      nextStep: "Complete final orientation"
    }
  ])

  // Job board state
  const [jobPostings, setJobPostings] = useState([
    {
      id: "1",
      title: "Senior Sound Engineer",
      department: "Technical",
      location: "Los Angeles, CA",
      type: "Full-time",
      salary: "$75,000 - $95,000",
      applications: 12,
      status: "active",
      postedDate: "2024-01-10",
      deadline: "2024-02-10"
    },
    {
      id: "2",
      title: "Security Coordinator",
      department: "Security",
      location: "New York, NY",
      type: "Full-time",
      salary: "$65,000 - $80,000",
      applications: 8,
      status: "active",
      postedDate: "2024-01-12",
      deadline: "2024-02-12"
    },
    {
      id: "3",
      title: "Lighting Technician",
      department: "Technical",
      location: "Chicago, IL",
      type: "Part-time",
      salary: "$25 - $35/hour",
      applications: 15,
      status: "active",
      postedDate: "2024-01-08",
      deadline: "2024-02-08"
    }
  ])

  // Communications state
  const [messages, setMessages] = useState([
    {
      id: "1",
      subject: "Team Meeting Tomorrow",
      content: "Mandatory team meeting at 3 PM in the main conference room.",
      sender: "Admin",
      recipients: "All Staff",
      priority: "high",
      type: "announcement",
      sentAt: "2024-01-15T10:30:00Z",
      readBy: 12
    },
    {
      id: "2",
      subject: "Weekend Event Schedule",
      content: "Updated schedule for this weekend's events. Please review and confirm availability.",
      sender: "Operations Manager",
      recipients: "Event Staff",
      priority: "medium",
      type: "schedule",
      sentAt: "2024-01-14T14:20:00Z",
      readBy: 8
    }
  ])

  // Scheduler state
  const [schedules, setSchedules] = useState([
    {
      id: "1",
      event: "Summer Music Festival",
      date: "2024-07-15",
      staff: [
        { name: "Sarah Johnson", role: "Stage Manager", shift: "09:00-17:00" },
        { name: "Mike Chen", role: "Security", shift: "08:00-16:00" },
        { name: "Emma Rodriguez", role: "Coordinator", shift: "10:00-18:00" }
      ],
      status: "confirmed"
    },
    {
      id: "2",
      event: "Electronic Music Night",
      date: "2024-01-20",
      staff: [
        { name: "David Park", role: "Sound Engineer", shift: "18:00-02:00" },
        { name: "Lisa Wang", role: "Lighting Tech", shift: "17:00-01:00" }
      ],
      status: "pending"
    }
  ])

  // Sample data
  useEffect(() => {
    const timer = setTimeout(() => {
      const sampleStaff: StaffMember[] = [
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@tourify.com",
          phone: "+1 (555) 123-4567",
          role: "Stage Manager",
          department: "Production",
          status: "on_tour",
          hire_date: "2023-01-15",
          skills: ["Stage Setup", "Audio Engineering", "Team Leadership"],
          rating: 4.8,
          tours_completed: 12,
          current_assignment: "West Coast Summer Tour",
          salary: 75000,
          location: "Los Angeles, CA",
          certifications: ["OSHA Safety", "Audio Engineering"],
          availability: "busy"
        },
        {
          id: "2",
          name: "Mike Chen",
          email: "mike@tourify.com",
          phone: "+1 (555) 234-5678",
          role: "Security Coordinator",
          department: "Security",
          status: "active",
          hire_date: "2022-08-20",
          skills: ["Crowd Control", "Emergency Response", "VIP Protection"],
          rating: 4.9,
          tours_completed: 18,
          salary: 68000,
          location: "New York, NY",
          certifications: ["Security License", "First Aid", "CPR"],
          availability: "available"
        },
        {
          id: "3",
          name: "Emma Rodriguez",
          email: "emma@tourify.com",
          phone: "+1 (555) 345-6789",
          role: "Tour Coordinator",
          department: "Operations",
          status: "active",
          hire_date: "2023-03-10",
          skills: ["Logistics", "Vendor Management", "Scheduling"],
          rating: 4.7,
          tours_completed: 8,
          salary: 72000,
          location: "Chicago, IL",
          certifications: ["Project Management", "Travel Coordination"],
          availability: "available"
        },
        {
          id: "4",
          name: "David Park",
          email: "david@tourify.com",
          phone: "+1 (555) 456-7890",
          role: "Sound Engineer",
          department: "Audio",
          status: "on_tour",
          hire_date: "2021-11-05",
          skills: ["Mixing", "Audio Setup", "Equipment Maintenance"],
          rating: 4.9,
          tours_completed: 25,
          current_assignment: "Electronic Music Festival Circuit",
          salary: 78000,
          location: "Nashville, TN",
          certifications: ["Pro Tools", "Live Sound", "Digital Audio"],
          availability: "busy"
        },
        {
          id: "5",
          name: "Lisa Wang",
          email: "lisa@tourify.com",
          phone: "+1 (555) 567-8901",
          role: "Lighting Technician",
          department: "Lighting",
          status: "active",
          hire_date: "2023-06-12",
          skills: ["LED Systems", "Programming", "Rigging"],
          rating: 4.6,
          tours_completed: 5,
          salary: 65000,
          location: "Las Vegas, NV",
          certifications: ["Rigging Safety", "LED Programming"],
          availability: "vacation"
        }
      ]

      setStaffMembers(sampleStaff)
      setFilteredStaff(sampleStaff)
      
      // Calculate stats
      const activeCount = sampleStaff.filter(s => s.status === 'active').length
      const onTourCount = sampleStaff.filter(s => s.status === 'on_tour').length
      const availableCount = sampleStaff.filter(s => s.availability === 'available').length
      const departments = new Set(sampleStaff.map(s => s.department)).size
      const avgRating = sampleStaff.reduce((sum, s) => sum + s.rating, 0) / sampleStaff.length
      const totalToursCompleted = sampleStaff.reduce((sum, s) => sum + s.tours_completed, 0)

      setStats({
        totalStaff: sampleStaff.length,
        activeStaff: activeCount,
        onTour: onTourCount,
        available: availableCount,
        totalDepartments: departments,
        averageRating: avgRating,
        completedTours: totalToursCompleted,
        pendingApplications: 3
      })

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter staff based on search and filters
  useEffect(() => {
    let filtered = staffMembers

    if (searchTerm) {
      filtered = filtered.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(staff => staff.department === selectedDepartment)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(staff => staff.status === selectedStatus)
    }

    setFilteredStaff(filtered)
  }, [searchTerm, selectedDepartment, selectedStatus, staffMembers])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>
      case 'on_tour':
        return <Badge className="bg-blue-500/20 text-blue-400">On Tour</Badge>
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status}</Badge>
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-500/20 text-green-400">Available</Badge>
      case 'busy':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Busy</Badge>
      case 'vacation':
        return <Badge className="bg-purple-500/20 text-purple-400">Vacation</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{availability}</Badge>
    }
  }

  const departments = Array.from(new Set(staffMembers.map(s => s.department)))

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-xl font-bold text-white">Loading Staff Management</h2>
            <p className="text-slate-400">Setting up team dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Staff & Crew Management
          </h1>
          <p className="text-slate-400 mt-2">
            Manage your team, schedules, and performance across all tours and events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                <UserPlus className="h-4 w-4 mr-2" />
                Enhanced Team Onboarding
              </Button>
            </DialogTrigger>
            <EnhancedAddStaffDialog
              open={false}
              onOpenChange={() => {}}
              onAdd={(staff: any) => {
                // Handle staff addition
                console.log('Staff added:', staff)
                // Refresh the page or update the staff list
              }}
              existingProfiles={[
                { id: '1', name: 'John Doe', email: 'john@example.com', skills: ['Audio Engineering', 'Lighting'] },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', skills: ['Security', 'Management'] },
                { id: '3', name: 'Mike Johnson', email: 'mike@example.com', skills: ['Technical', 'Rigging'] }
              ]}
              venueId="venue-uuid-here"
            />
          </Dialog>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 grid w-full grid-cols-7">
          <TabsTrigger value="neural" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Neural Command
          </TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <Users className="h-4 w-4 mr-2" />
            Active Staff
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-600">
            <Briefcase className="h-4 w-4 mr-2" />
            Job Board
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
            Scheduler
          </TabsTrigger>
        </TabsList>

        {/* Neural Command Tab */}
        <TabsContent value="neural" className="space-y-6">
          <NeuralStaffCommand 
            staffCount={stats.totalStaff}
            activeStaff={stats.activeStaff}
            onTour={stats.onTour}
            available={stats.available}
            averageRating={stats.averageRating}
            completedTours={stats.completedTours}
          />
        </TabsContent>

        {/* Staff List Tab */}
        <TabsContent value="staff" className="space-y-6">
          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Staff</p>
                    <p className="text-2xl font-bold text-white">{stats.totalStaff}</p>
                    <p className="text-xs text-slate-500">{stats.totalDepartments} departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                    <UserCheck className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Available</p>
                    <p className="text-2xl font-bold text-white">{stats.available}</p>
                    <p className="text-xs text-slate-500">{stats.onTour} on tour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Avg Rating</p>
                    <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">Team performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                    <Award className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Tours Completed</p>
                    <p className="text-2xl font-bold text-white">{stats.completedTours}</p>
                    <p className="text-xs text-slate-500">Collective experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-700/50 text-white w-64"
                />
              </div>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48 bg-slate-900/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700/50 text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_tour">On Tour</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </motion.div>

          {/* Staff List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Team Members ({filteredStaff.length})
              </h2>
            </div>

            <div className="grid gap-4">
              <AnimatePresence>
                {filteredStaff.map((staff, index) => (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={staff.avatar} />
                              <AvatarFallback className="bg-purple-600 text-white text-lg">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                                {getStatusBadge(staff.status)}
                                {getAvailabilityBadge(staff.availability)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-400">Role & Department</p>
                                  <p className="text-white font-medium">{staff.role}</p>
                                  <p className="text-slate-400">{staff.department}</p>
                                </div>
                                
                                <div>
                                  <p className="text-slate-400">Contact</p>
                                  <p className="text-white">{staff.email}</p>
                                  <p className="text-slate-400">{staff.phone}</p>
                                </div>
                                
                                <div>
                                  <p className="text-slate-400">Performance</p>
                                  <div className="flex items-center space-x-2">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="text-white font-medium">{staff.rating}</span>
                                    <span className="text-slate-400">({staff.tours_completed} tours)</span>
                                  </div>
                                </div>
                              </div>

                              {staff.current_assignment && (
                                <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                  <p className="text-blue-400 text-sm font-medium">Current Assignment</p>
                                  <p className="text-white text-sm">{staff.current_assignment}</p>
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap gap-2">
                                {staff.skills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} className="bg-slate-700/50 text-slate-300 text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {staff.skills.length > 3 && (
                                  <Badge className="bg-slate-700/50 text-slate-300 text-xs">
                                    +{staff.skills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-white">{staff.name} - Profile Details</DialogTitle>
                                </DialogHeader>
                                {/* Detailed profile view would go here */}
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-6">
          {venueLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-slate-400">Loading venue data...</span>
            </div>
          ) : venue?.id ? (
            <EnhancedOnboardingSystem venueId={venue.id} />
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Venue Found</h3>
                <p className="text-slate-400">Please create or select a venue to manage onboarding.</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Job Board Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Job Board</h2>
              <p className="text-slate-400">Manage job postings and applications</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>

          <div className="grid gap-4">
            {jobPostings.map((job) => (
              <Card key={job.id} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <Badge className="bg-green-500/20 text-green-400">{job.status}</Badge>
                        <Badge variant="outline" className="border-slate-600">{job.type}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Department</p>
                          <p className="text-white">{job.department}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Location</p>
                          <p className="text-white">{job.location}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Salary</p>
                          <p className="text-white">{job.salary}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Applications</p>
                          <p className="text-white">{job.applications}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Posted: {job.postedDate}</span>
                    <span>Deadline: {job.deadline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Communications Hub</h2>
              <p className="text-slate-400">Manage team communications and announcements</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>

          <div className="grid gap-4">
            {messages.map((message) => (
              <Card key={message.id} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                        <Badge className={`${
                          message.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          message.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {message.priority}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600">{message.type}</Badge>
                      </div>
                      <p className="text-slate-400 mb-2">{message.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>From: {message.sender}</span>
                        <span>To: {message.recipients}</span>
                        <span>Read by: {message.readBy}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">
                    Sent: {new Date(message.sentAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Staff Scheduler</h2>
              <p className="text-slate-400">Manage staff schedules and assignments</p>
            </div>
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <Calendar className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>

          <div className="grid gap-6">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{schedule.event}</h3>
                      <p className="text-slate-400">{schedule.date}</p>
                    </div>
                    <Badge className={`${
                      schedule.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {schedule.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-slate-400">Assigned Staff:</p>
                    {schedule.staff.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-slate-400 text-sm">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm">{member.shift}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="border-slate-600">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                <span className="text-cyan-400">Staff Analytics</span>
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">BETA</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Advanced Analytics Dashboard</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Comprehensive staff performance analytics, trend analysis, and predictive insights for optimal team management.
                </p>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
