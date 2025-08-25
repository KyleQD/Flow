"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { 
  TicketingStep, 
  StaffEquipmentStep, 
  MarketingStep, 
  GuestManagementStep, 
  BudgetFinanceStep, 
  SharingStep, 
  ReviewStep 
} from "./event-wizard-steps"
import {
  CalendarIcon,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Settings,
  Share2,
  Star,
  Plus,
  X,
  Camera,
  Music,
  Mic,
  Volume2,
  Lightbulb,
  Shield,
  Utensils,
  Car,
  Wifi,
  Coffee,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Copy,
  Download,
  Eye,
  Edit3,
  BarChart3,
  Target,
  TrendingUp,
  Bell,
  Mail,
  MessageSquare,
  ExternalLink,
  Ticket,
  Gift,
  Zap,
  Crown,
  Heart,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

export interface EventFormData {
  id?: number
  // Basic Information
  title: string
  description: string
  eventType: string
  category: string
  tags: string[]
  
  // Date & Time
  date: Date
  startTime: string
  endTime: string
  setupTime: string
  soundcheckTime: string
  timezone: string
  
  // Venue & Capacity
  capacity: number
  venueLayout: string
  ageRestriction: string
  dresscode: string
  
  // Ticketing & Pricing
  ticketTypes: TicketType[]
  isFree: boolean
  currency: string
  salesStartDate: Date
  salesEndDate: Date
  
  // Staff & Requirements
  staffAssignments: StaffAssignment[]
  equipmentNeeded: string[]
  setupRequirements: string[]
  securityLevel: string
  
  // Marketing & Promotion
  coverImage: string
  gallery: string[]
  marketingBudget: number
  promotionChannels: string[]
  pressRelease: string
  
  // Guest List & Access
  guestList: Guest[]
  vipList: Guest[]
  guestListLimit: number
  
  // Financial
  budget: number
  expectedRevenue: number
  expenses: ExpenseItem[]
  
  // Sharing & Collaboration
  collaborators: Collaborator[]
  isPublic: boolean
  shareableLink: string
  requiresApproval: boolean
  
  // Status & Meta
  status: string
  createdBy: string
  notes: string
}

interface TicketType {
  id: string
  name: string
  price: number
  quantity: number
  description: string
  perks: string[]
  saleStart: Date
  saleEnd: Date
  isVip: boolean
}

interface StaffAssignment {
  id: string
  staffId: string
  name: string
  role: string
  department: string
  startTime: string
  endTime: string
  hourlyRate: number
  tasks: string[]
}

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  plus: number
  confirmed: boolean
  notes: string
}

interface ExpenseItem {
  id: string
  category: string
  description: string
  estimatedCost: number
  actualCost?: number
  vendor: string
  status: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

interface CreateEventWizardProps {
  isOpen: boolean
  onClose: () => void
  onSaveEvent: (data: EventFormData) => void
  initialData?: Partial<EventFormData>
  editMode?: boolean
}

const eventTypes = [
  { value: "concert", label: "Concert", icon: Music },
  { value: "festival", label: "Festival", icon: Star },
  { value: "corporate", label: "Corporate Event", icon: Users },
  { value: "wedding", label: "Wedding", icon: Heart },
  { value: "private", label: "Private Party", icon: Gift },
  { value: "conference", label: "Conference", icon: Mic },
  { value: "exhibition", label: "Exhibition", icon: Eye },
  { value: "workshop", label: "Workshop", icon: Edit3 },
]

const venueLayouts = [
  { value: "standing", label: "Standing Only" },
  { value: "seated", label: "Seated Only" },
  { value: "mixed", label: "Mixed (Standing + Seated)" },
  { value: "theater", label: "Theater Style" },
  { value: "cabaret", label: "Cabaret Style" },
  { value: "cocktail", label: "Cocktail Reception" },
]

const securityLevels = [
  { value: "low", label: "Low (Standard Security)", color: "text-green-500" },
  { value: "medium", label: "Medium (Enhanced Security)", color: "text-yellow-500" },
  { value: "high", label: "High (Maximum Security)", color: "text-red-500" },
]

const mockStaff = [
  { id: "staff-1", name: "Alex Thompson", role: "Event Manager", department: "Operations", hourlyRate: 25 },
  { id: "staff-2", name: "Maria Rodriguez", role: "Sound Engineer", department: "Technical", hourlyRate: 30 },
  { id: "staff-3", name: "James Wilson", role: "Security Lead", department: "Security", hourlyRate: 22 },
  { id: "staff-4", name: "Sarah Johnson", role: "Bartender", department: "Bar", hourlyRate: 18 },
]

const equipmentOptions = [
  "Full PA System", "Stage Lighting", "Microphones", "DJ Equipment", "Piano", "Drum Kit",
  "Video Screens", "Cameras", "Recording Equipment", "Wireless Mics", "Monitor Speakers",
  "Fog Machine", "Spotlight", "Projector", "Sound Board", "Cable Management"
]

export function CreateEventWizard({
  isOpen,
  onClose,
  onSaveEvent,
  initialData,
  editMode = false
}: CreateEventWizardProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "",
    category: "",
    tags: [],
    date: new Date(),
    startTime: "19:00",
    endTime: "22:00",
    setupTime: "16:00",
    soundcheckTime: "18:00",
    timezone: "America/Los_Angeles",
    capacity: 100,
    venueLayout: "standing",
    ageRestriction: "all-ages",
    dresscode: "casual",
    ticketTypes: [],
    isFree: false,
    currency: "USD",
    salesStartDate: new Date(),
    salesEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    staffAssignments: [],
    equipmentNeeded: [],
    setupRequirements: [],
    securityLevel: "medium",
    coverImage: "",
    gallery: [],
    marketingBudget: 0,
    promotionChannels: [],
    pressRelease: "",
    guestList: [],
    vipList: [],
    guestListLimit: 50,
    budget: 0,
    expectedRevenue: 0,
    expenses: [],
    collaborators: [],
    isPublic: true,
    shareableLink: "",
    requiresApproval: false,
    status: "draft",
    createdBy: "current-user",
    notes: "",
    ...initialData
  })

  const steps = [
    { id: "basics", title: "Event Basics", icon: Edit3, description: "Title, type, and description" },
    { id: "datetime", title: "Date & Time", icon: CalendarIcon, description: "Schedule and timing" },
    { id: "venue", title: "Venue Setup", icon: MapPin, description: "Layout and capacity" },
    { id: "tickets", title: "Ticketing", icon: Ticket, description: "Pricing and ticket types" },
    { id: "staff", title: "Staff & Equipment", icon: Users, description: "Team and technical needs" },
    { id: "marketing", title: "Marketing", icon: BarChart3, description: "Promotion and branding" },
    { id: "guests", title: "Guest Management", icon: Users, description: "Guest list and VIP access" },
    { id: "finance", title: "Budget & Finance", icon: DollarSign, description: "Costs and revenue" },
    { id: "sharing", title: "Sharing & Access", icon: Share2, description: "Collaboration and permissions" },
    { id: "review", title: "Review & Create", icon: CheckCircle, description: "Final review and publish" },
  ]

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value } as EventFormData))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    onSaveEvent(formData)
    toast({
      title: editMode ? "Event Updated" : "Event Created",
      description: editMode ? "Your event has been updated successfully" : "Your event has been created successfully"
    })
    onClose()
  }

  const generateShareableLink = () => {
    const linkId = Math.random().toString(36).substring(2, 15)
    const link = `https://tourify.com/events/share/${linkId}`
    updateFormData("shareableLink", link)
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard"
    })
  }

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`,
      name: "General Admission",
      price: 25,
      quantity: 100,
      description: "",
      perks: [],
      saleStart: new Date(),
      saleEnd: formData.salesEndDate,
      isVip: false
    }
    updateFormData("ticketTypes", [...formData.ticketTypes, newTicket])
  }

  const removeTicketType = (ticketId: string) => {
    updateFormData("ticketTypes", formData.ticketTypes.filter(t => t.id !== ticketId))
  }

  const addStaffAssignment = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff) return

    const assignment: StaffAssignment = {
      id: `assignment-${Date.now()}`,
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      department: staff.department,
      startTime: formData.setupTime,
      endTime: formData.endTime,
      hourlyRate: staff.hourlyRate,
      tasks: []
    }
    updateFormData("staffAssignments", [...formData.staffAssignments, assignment])
  }

  const removeStaffAssignment = (assignmentId: string) => {
    updateFormData("staffAssignments", formData.staffAssignments.filter(a => a.id !== assignmentId))
  }

  const calculateProjectedRevenue = () => {
    return formData.ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * ticket.quantity)
    }, 0)
  }

  const calculateStaffCosts = () => {
    return formData.staffAssignments.reduce((total, assignment) => {
      const startTime = new Date(`2000-01-01T${assignment.startTime}:00`)
      const endTime = new Date(`2000-01-01T${assignment.endTime}:00`)
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      return total + (hours * assignment.hourlyRate)
    }, 0)
  }

  const renderBasicsStep = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-lg font-semibold">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          placeholder="Enter your event title"
          className="mt-2 text-lg"
        />
      </div>

      <div>
        <Label className="text-lg font-semibold">Event Type *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {eventTypes.map(type => {
            const Icon = type.icon
            return (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  formData.eventType === type.value 
                    ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                    : ""
                }`}
                onClick={() => updateFormData("eventType", type.value)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{type.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Describe your event, what makes it special, and what attendees can expect..."
          rows={4}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-lg font-semibold">Tags</Label>
        <p className="text-sm text-muted-foreground mb-2">Help people discover your event</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {tag}
              <X 
                className="h-3 w-3 ml-2 cursor-pointer" 
                onClick={() => updateFormData("tags", formData.tags.filter((_, i) => i !== index))}
              />
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Add tags (press Enter to add)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              e.preventDefault()
              const newTag = e.currentTarget.value.trim()
              if (!formData.tags.includes(newTag)) {
                updateFormData("tags", [...formData.tags, newTag])
              }
              e.currentTarget.value = ""
            }
          }}
        />
      </div>
    </div>
  )

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-semibold">Event Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal mt-2">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && updateFormData("date", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="timezone" className="text-lg font-semibold">Timezone</Label>
          <Select value={formData.timezone} onValueChange={(value) => updateFormData("timezone", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="setupTime" className="font-semibold">Setup Time</Label>
          <Input
            id="setupTime"
            type="time"
            value={formData.setupTime}
            onChange={(e) => updateFormData("setupTime", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="soundcheckTime" className="font-semibold">Soundcheck</Label>
          <Input
            id="soundcheckTime"
            type="time"
            value={formData.soundcheckTime}
            onChange={(e) => updateFormData("soundcheckTime", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="startTime" className="font-semibold">Event Start *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => updateFormData("startTime", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="endTime" className="font-semibold">Event End *</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => updateFormData("endTime", e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Timeline Planning</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Setup time includes equipment installation, sound checks, and final preparations. 
                Allow adequate time between setup and event start for proper preparation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderVenueStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="capacity" className="text-lg font-semibold">Event Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => updateFormData("capacity", Number(e.target.value))}
            placeholder="Maximum attendees"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-lg font-semibold">Venue Layout</Label>
          <Select value={formData.venueLayout} onValueChange={(value) => updateFormData("venueLayout", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {venueLayouts.map(layout => (
                <SelectItem key={layout.value} value={layout.value}>
                  {layout.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-semibold">Age Restriction</Label>
          <Select value={formData.ageRestriction} onValueChange={(value) => updateFormData("ageRestriction", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-ages">All Ages</SelectItem>
              <SelectItem value="18+">18+ Only</SelectItem>
              <SelectItem value="21+">21+ Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-lg font-semibold">Dress Code</Label>
          <Select value={formData.dresscode} onValueChange={(value) => updateFormData("dresscode", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="smart-casual">Smart Casual</SelectItem>
              <SelectItem value="business">Business Attire</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="black-tie">Black Tie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold">Security Level</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {securityLevels.map(level => (
            <Card
              key={level.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.securityLevel === level.value 
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                  : ""
              }`}
              onClick={() => updateFormData("securityLevel", level.value)}
            >
              <CardContent className="p-4 text-center">
                <Shield className={`h-6 w-6 mx-auto mb-2 ${level.color}`} />
                <p className="text-sm font-medium">{level.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Review Your Event</h3>
        <p className="text-muted-foreground">Please review all details before creating your event</p>
      </div>

      {/* Event Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Event Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Event Title</Label>
              <p>{formData.title || "Not specified"}</p>
            </div>
            <div>
              <Label className="font-semibold">Event Type</Label>
              <p className="capitalize">{formData.eventType || "Not specified"}</p>
            </div>
            <div>
              <Label className="font-semibold">Date & Time</Label>
              <p>{formData.date ? format(formData.date, "PPP") : "Not specified"} • {formData.startTime} - {formData.endTime}</p>
            </div>
            <div>
              <Label className="font-semibold">Capacity</Label>
              <p>{formData.capacity} attendees</p>
            </div>
          </div>
          {formData.description && (
            <div>
              <Label className="font-semibold">Description</Label>
              <p className="text-sm text-muted-foreground">{formData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="font-semibold">Projected Revenue</Label>
              <p className="text-2xl font-bold text-green-600">
                ${calculateProjectedRevenue().toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Staff Costs</Label>
              <p className="text-2xl font-bold text-red-600">
                ${calculateStaffCosts().toLocaleString()}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Estimated Profit</Label>
              <p className={`text-2xl font-bold ${
                calculateProjectedRevenue() - calculateStaffCosts() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${(calculateProjectedRevenue() - calculateStaffCosts()).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff & Equipment */}
      {formData.staffAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Assignments ({formData.staffAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.staffAssignments.slice(0, 3).map((assignment: StaffAssignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="font-medium">{assignment.name}</span>
                  <span className="text-sm text-muted-foreground">{assignment.role}</span>
                </div>
              ))}
              {formData.staffAssignments.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{formData.staffAssignments.length - 3} more staff members
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Sharing & Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-semibold">Public Event</Label>
              <p className="text-sm text-muted-foreground">
                {formData.isPublic ? "Visible to public and searchable" : "Private event, invite only"}
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => updateFormData("isPublic", checked)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={formData.shareableLink || "Link will be generated after creation"}
              readOnly
              className="bg-gray-50 dark:bg-gray-800"
            />
            <Button variant="outline" size="sm" onClick={generateShareableLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Final Actions */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Button variant="outline" onClick={() => setCurrentStep(0)}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700" size="lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          {editMode ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editMode ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="text-sm font-medium">
                  {steps[currentStep].title}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-1">
            {currentStep === 0 && renderBasicsStep()}
            {currentStep === 1 && renderDateTimeStep()}
            {currentStep === 2 && renderVenueStep()}
            {currentStep === 3 && <TicketingStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 4 && <StaffEquipmentStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 5 && <MarketingStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 6 && <GuestManagementStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 7 && <BudgetFinanceStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 8 && <SharingStep formData={formData} updateFormData={updateFormData} />}
            {currentStep === 9 && <ReviewStep formData={formData} />}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {editMode ? "Update Event" : "Create Event"}
                </Button>
              ) : (
                <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 