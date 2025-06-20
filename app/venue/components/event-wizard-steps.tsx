"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import {
  Plus,
  X,
  Trash2,
  Edit3,
  DollarSign,
  Users,
  Camera,
  Upload,
  Share2,
  Copy,
  Mail,
  MessageSquare,
  Star,
  Crown,
  Gift,
  Zap,
  CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Target,
  Ticket,
  Music,
  Volume2,
  Lightbulb,
  Shield,
  Utensils,
  Car,
  Wifi,
  Coffee,
  Mic,
  ExternalLink,
  Bell,
  Info,
  Eye,
  Download,
  Send,
} from "lucide-react"

// Types (shared with main component)
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

// Mock data
const mockStaff = [
  { id: "staff-1", name: "Alex Thompson", role: "Event Manager", department: "Operations", hourlyRate: 25, avatar: "/placeholder.svg" },
  { id: "staff-2", name: "Maria Rodriguez", role: "Sound Engineer", department: "Technical", hourlyRate: 30, avatar: "/placeholder.svg" },
  { id: "staff-3", name: "James Wilson", role: "Security Lead", department: "Security", hourlyRate: 22, avatar: "/placeholder.svg" },
  { id: "staff-4", name: "Sarah Johnson", role: "Bartender", department: "Bar", hourlyRate: 18, avatar: "/placeholder.svg" },
  { id: "staff-5", name: "Mike Chen", role: "Lighting Tech", department: "Technical", hourlyRate: 28, avatar: "/placeholder.svg" },
]

const equipmentOptions = [
  "Full PA System", "Stage Lighting", "Microphones", "DJ Equipment", "Piano", "Drum Kit",
  "Video Screens", "Cameras", "Recording Equipment", "Wireless Mics", "Monitor Speakers",
  "Fog Machine", "Spotlight", "Projector", "Sound Board", "Cable Management", "Uplighting",
  "Truss System", "Backdrop", "Stage Risers", "Barricades", "Power Distribution"
]

const promotionChannels = [
  "Social Media", "Email Marketing", "Website", "Press Release", "Radio", "Print Media",
  "Influencers", "Partnerships", "Street Team", "Digital Ads", "Event Platforms"
]

const expenseCategories = [
  "Artist/Performer Fees", "Equipment Rental", "Staff Costs", "Marketing/Promotion",
  "Venue Costs", "Catering", "Security", "Insurance", "Transportation", "Miscellaneous"
]

// Ticketing Step Component
interface TicketingStepProps {
  formData: any
  updateFormData: (field: string, value: any) => void
}

export function TicketingStep({ formData, updateFormData }: TicketingStepProps) {
  const { toast } = useToast()

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

  const updateTicketType = (ticketId: string, field: keyof TicketType, value: any) => {
    const updatedTickets = formData.ticketTypes.map((ticket: TicketType) =>
      ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
    )
    updateFormData("ticketTypes", updatedTickets)
  }

  const removeTicketType = (ticketId: string) => {
    updateFormData("ticketTypes", formData.ticketTypes.filter((t: TicketType) => t.id !== ticketId))
  }

  const addPerkToTicket = (ticketId: string, perk: string) => {
    if (!perk.trim()) return
    const updatedTickets = formData.ticketTypes.map((ticket: TicketType) =>
      ticket.id === ticketId ? { ...ticket, perks: [...ticket.perks, perk] } : ticket
    )
    updateFormData("ticketTypes", updatedTickets)
  }

  const removePerkFromTicket = (ticketId: string, perkIndex: number) => {
    const updatedTickets = formData.ticketTypes.map((ticket: TicketType) =>
      ticket.id === ticketId ? { 
        ...ticket, 
        perks: ticket.perks.filter((_, index) => index !== perkIndex) 
      } : ticket
    )
    updateFormData("ticketTypes", updatedTickets)
  }

  const totalRevenue = formData.ticketTypes.reduce((sum: number, ticket: TicketType) => 
    sum + (ticket.price * ticket.quantity), 0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ticket Types & Pricing</h3>
          <p className="text-sm text-muted-foreground">Configure different ticket options for your event</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isFree"
              checked={formData.isFree}
              onCheckedChange={(checked) => updateFormData("isFree", checked)}
            />
            <Label htmlFor="isFree">Free Event</Label>
          </div>
          {!formData.isFree && (
            <Button onClick={addTicketType}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          )}
        </div>
      </div>

      {!formData.isFree && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => updateFormData("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sales Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.salesStartDate ? format(formData.salesStartDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.salesStartDate}
                    onSelect={(date) => date && updateFormData("salesStartDate", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Sales End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.salesEndDate ? format(formData.salesEndDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.salesEndDate}
                    onSelect={(date) => date && updateFormData("salesEndDate", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.ticketTypes.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No ticket types created yet</h3>
                <p className="text-muted-foreground mb-4">Create different ticket types with various pricing and perks</p>
                <Button onClick={addTicketType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket Type
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {formData.ticketTypes.map((ticket: TicketType) => (
                <Card key={ticket.id} className={ticket.isVip ? "border-amber-300 bg-amber-50 dark:bg-amber-900/10" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Input
                          value={ticket.name}
                          onChange={(e) => updateTicketType(ticket.id, "name", e.target.value)}
                          className="text-lg font-semibold border-none bg-transparent p-0 h-auto"
                          placeholder="Ticket name"
                        />
                        {ticket.isVip && <Crown className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={ticket.isVip}
                            onCheckedChange={(checked) => updateTicketType(ticket.id, "isVip", checked)}
                          />
                          <Label className="text-sm">VIP</Label>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeTicketType(ticket.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Price ({formData.currency})</Label>
                        <Input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => updateTicketType(ticket.id, "price", Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Quantity Available</Label>
                        <Input
                          type="number"
                          value={ticket.quantity}
                          onChange={(e) => updateTicketType(ticket.id, "quantity", Number(e.target.value))}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label>Revenue Potential</Label>
                        <div className="text-lg font-semibold text-green-600 mt-2">
                          {formData.currency} {(ticket.price * ticket.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={ticket.description}
                        onChange={(e) => updateTicketType(ticket.id, "description", e.target.value)}
                        placeholder="Describe what's included with this ticket type"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Perks & Benefits</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {ticket.perks.map((perk, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">
                            {perk}
                            <X 
                              className="h-3 w-3 ml-2 cursor-pointer" 
                              onClick={() => removePerkFromTicket(ticket.id, index)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add perk (press Enter to add)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            e.preventDefault()
                            addPerkToTicket(ticket.id, e.currentTarget.value.trim())
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {formData.ticketTypes.length > 0 && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Revenue Projection</h4>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      Total potential revenue if all tickets are sold
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formData.currency} {totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      {formData.ticketTypes.reduce((sum: number, t: TicketType) => sum + t.quantity, 0)} total tickets
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// Staff & Equipment Step Component
export function StaffEquipmentStep({ formData, updateFormData }: TicketingStepProps) {
  const [newTaskText, setNewTaskText] = useState("")

  const addStaffAssignment = (staff: any) => {
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
    updateFormData("staffAssignments", formData.staffAssignments.filter((a: StaffAssignment) => a.id !== assignmentId))
  }

  const updateStaffAssignment = (assignmentId: string, field: keyof StaffAssignment, value: any) => {
    const updatedAssignments = formData.staffAssignments.map((assignment: StaffAssignment) =>
      assignment.id === assignmentId ? { ...assignment, [field]: value } : assignment
    )
    updateFormData("staffAssignments", updatedAssignments)
  }

  const addTaskToStaff = (assignmentId: string, task: string) => {
    if (!task.trim()) return
    const updatedAssignments = formData.staffAssignments.map((assignment: StaffAssignment) =>
      assignment.id === assignmentId ? { ...assignment, tasks: [...assignment.tasks, task] } : assignment
    )
    updateFormData("staffAssignments", updatedAssignments)
  }

  const removeTaskFromStaff = (assignmentId: string, taskIndex: number) => {
    const updatedAssignments = formData.staffAssignments.map((assignment: StaffAssignment) =>
      assignment.id === assignmentId ? { 
        ...assignment, 
        tasks: assignment.tasks.filter((_, index) => index !== taskIndex) 
      } : assignment
    )
    updateFormData("staffAssignments", updatedAssignments)
  }

  const toggleEquipment = (equipment: string) => {
    const current = formData.equipmentNeeded || []
    const updated = current.includes(equipment)
      ? current.filter((item: string) => item !== equipment)
      : [...current, equipment]
    updateFormData("equipmentNeeded", updated)
  }

  const calculateStaffCosts = () => {
    return formData.staffAssignments.reduce((total: number, assignment: StaffAssignment) => {
      const startTime = new Date(`2000-01-01T${assignment.startTime}:00`)
      const endTime = new Date(`2000-01-01T${assignment.endTime}:00`)
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      return total + (hours * assignment.hourlyRate)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Staff Assignments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Staff Assignments</h3>
            <p className="text-sm text-muted-foreground">Assign team members to work your event</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated Staff Cost: <span className="font-semibold text-foreground">${calculateStaffCosts().toFixed(2)}</span>
          </div>
        </div>

        {formData.staffAssignments.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">No staff assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {formData.staffAssignments.map((assignment: StaffAssignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{assignment.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{assignment.name}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.role} • {assignment.department}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeStaffAssignment(assignment.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        type="time"
                        value={assignment.startTime}
                        onChange={(e) => updateStaffAssignment(assignment.id, "startTime", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Time</Label>
                      <Input
                        type="time"
                        value={assignment.endTime}
                        onChange={(e) => updateStaffAssignment(assignment.id, "endTime", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Rate/Hour</Label>
                      <Input
                        type="number"
                        value={assignment.hourlyRate}
                        onChange={(e) => updateStaffAssignment(assignment.id, "hourlyRate", Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total Cost</Label>
                      <div className="text-sm font-semibold mt-1">
                        ${(() => {
                          const start = new Date(`2000-01-01T${assignment.startTime}:00`)
                          const end = new Date(`2000-01-01T${assignment.endTime}:00`)
                          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                          return (hours * assignment.hourlyRate).toFixed(2)
                        })()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Tasks & Responsibilities</Label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {assignment.tasks.map((task, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {task}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => removeTaskFromStaff(assignment.id, index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add task (press Enter)"
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          e.preventDefault()
                          addTaskToStaff(assignment.id, e.currentTarget.value.trim())
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockStaff
            .filter(staff => !formData.staffAssignments.some((a: StaffAssignment) => a.staffId === staff.id))
            .map(staff => (
              <Card key={staff.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3" onClick={() => addStaffAssignment(staff)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={staff.avatar} />
                      <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Equipment & Technical */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Equipment & Technical Requirements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {equipmentOptions.map(equipment => (
            <div key={equipment} className="flex items-center space-x-2">
              <Checkbox
                id={equipment}
                checked={formData.equipmentNeeded?.includes(equipment) || false}
                onCheckedChange={() => toggleEquipment(equipment)}
              />
              <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Requirements */}
      <div>
        <Label htmlFor="setupRequirements" className="text-lg font-semibold">Special Setup Requirements</Label>
        <Textarea
          id="setupRequirements"
          value={formData.notes}
          onChange={(e) => updateFormData("notes", e.target.value)}
          placeholder="Describe any special setup needs, stage configurations, or technical requirements..."
          rows={3}
          className="mt-2"
        />
      </div>
    </div>
  )
}

// Marketing Step Component
export function MarketingStep({ formData, updateFormData }: TicketingStepProps) {
  const addPromotionChannel = (channel: string) => {
    if (!formData.promotionChannels.includes(channel)) {
      updateFormData("promotionChannels", [...formData.promotionChannels, channel])
    }
  }

  const removePromotionChannel = (channel: string) => {
    updateFormData("promotionChannels", formData.promotionChannels.filter((c: string) => c !== channel))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Marketing & Promotion</h3>
        <p className="text-sm text-muted-foreground mb-6">Configure how you'll promote your event</p>
      </div>

      <div>
        <Label htmlFor="coverImage" className="text-base font-medium">Event Cover Image</Label>
        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground mb-2">Upload your event cover image</p>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="marketingBudget" className="text-base font-medium">Marketing Budget</Label>
        <Input
          id="marketingBudget"
          type="number"
          value={formData.marketingBudget}
          onChange={(e) => updateFormData("marketingBudget", Number(e.target.value))}
          placeholder="0"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base font-medium">Promotion Channels</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {promotionChannels.map(channel => (
            <div key={channel} className="flex items-center space-x-2">
              <Checkbox
                id={channel}
                checked={formData.promotionChannels.includes(channel)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addPromotionChannel(channel)
                  } else {
                    removePromotionChannel(channel)
                  }
                }}
              />
              <Label htmlFor={channel} className="text-sm">{channel}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="pressRelease" className="text-base font-medium">Press Release</Label>
        <Textarea
          id="pressRelease"
          value={formData.pressRelease}
          onChange={(e) => updateFormData("pressRelease", e.target.value)}
          placeholder="Write a press release for your event..."
          rows={5}
          className="mt-2"
        />
      </div>
    </div>
  )
}

// Guest Management Step Component
export function GuestManagementStep({ formData, updateFormData }: TicketingStepProps) {
  const addGuest = (guestData: Omit<Guest, "id">) => {
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}`
    }
    updateFormData("guestList", [...formData.guestList, newGuest])
  }

  const removeGuest = (guestId: string) => {
    updateFormData("guestList", formData.guestList.filter((g: Guest) => g.id !== guestId))
  }

  const addToVipList = (guest: Guest) => {
    if (!formData.vipList.some((v: Guest) => v.id === guest.id)) {
      updateFormData("vipList", [...formData.vipList, guest])
    }
  }

  const removeFromVipList = (guestId: string) => {
    updateFormData("vipList", formData.vipList.filter((v: Guest) => v.id !== guestId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Guest List Management</h3>
        <p className="text-sm text-muted-foreground mb-6">Manage your event guest list and VIP access</p>
      </div>

      <div>
        <Label htmlFor="guestListLimit" className="text-base font-medium">Guest List Limit</Label>
        <Input
          id="guestListLimit"
          type="number"
          value={formData.guestListLimit}
          onChange={(e) => updateFormData("guestListLimit", Number(e.target.value))}
          placeholder="50"
          className="mt-2"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium">Guest List ({formData.guestList.length})</h4>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </div>
        
        {formData.guestList.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">No guests added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {formData.guestList.map((guest: Guest) => (
              <Card key={guest.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">{guest.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={guest.confirmed ? "default" : "secondary"}>
                        {guest.confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => addToVipList(guest)}>
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeGuest(guest.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-base font-medium mb-4">VIP List ({formData.vipList.length})</h4>
        {formData.vipList.length === 0 ? (
          <Card className="border-dashed border-2 border-amber-300">
            <CardContent className="p-6 text-center">
              <Crown className="h-10 w-10 mx-auto text-amber-400 mb-3" />
              <p className="text-muted-foreground">No VIP guests yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {formData.vipList.map((vip: Guest) => (
              <Card key={vip.id} className="border-amber-300 bg-amber-50 dark:bg-amber-900/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="font-medium">{vip.name}</p>
                        <p className="text-sm text-muted-foreground">{vip.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFromVipList(vip.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Budget & Finance Step Component
export function BudgetFinanceStep({ formData, updateFormData }: TicketingStepProps) {
  const { toast } = useToast()

  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: `expense-${Date.now()}`,
      category: "Miscellaneous",
      description: "",
      estimatedCost: 0,
      vendor: "",
      status: "pending"
    }
    updateFormData("expenses", [...formData.expenses, newExpense])
  }

  const updateExpense = (expenseId: string, field: keyof ExpenseItem, value: any) => {
    const updatedExpenses = formData.expenses.map((expense: ExpenseItem) =>
      expense.id === expenseId ? { ...expense, [field]: value } : expense
    )
    updateFormData("expenses", updatedExpenses)
  }

  const removeExpense = (expenseId: string) => {
    updateFormData("expenses", formData.expenses.filter((e: ExpenseItem) => e.id !== expenseId))
  }

  const totalExpenses = formData.expenses.reduce((sum: number, expense: ExpenseItem) => 
    sum + expense.estimatedCost, 0
  )

  const projectedRevenue = formData.ticketTypes.reduce((sum: number, ticket: any) => 
    sum + (ticket.price * ticket.quantity), 0
  )

  const projectedProfit = projectedRevenue - totalExpenses

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Budget & Finance Planning</h3>
        <p className="text-sm text-muted-foreground mb-6">Plan your event budget and track expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Projected Revenue</h4>
            <p className="text-2xl font-bold text-blue-600">${projectedRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <h4 className="font-semibold text-red-900 dark:text-red-100">Total Expenses</h4>
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className={`${projectedProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className={`font-semibold ${projectedProfit >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
              Projected Profit
            </h4>
            <p className={`text-2xl font-bold ${projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${projectedProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium">Event Expenses</h4>
          <Button onClick={addExpense} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {formData.expenses.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">No expenses added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {formData.expenses.map((expense: ExpenseItem) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={expense.category} onValueChange={(value) => updateExpense(expense.id, "category", value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={expense.description}
                        onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                        placeholder="Description"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Estimated Cost</Label>
                      <Input
                        type="number"
                        value={expense.estimatedCost}
                        onChange={(e) => updateExpense(expense.id, "estimatedCost", Number(e.target.value))}
                        placeholder="0"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vendor</Label>
                      <Input
                        value={expense.vendor}
                        onChange={(e) => updateExpense(expense.id, "vendor", e.target.value)}
                        placeholder="Vendor name"
                        className="h-8"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => removeExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Sharing & Collaboration Step Component
export function SharingStep({ formData, updateFormData }: TicketingStepProps) {
  const { toast } = useToast()

  const generateShareableLink = () => {
    const linkId = Math.random().toString(36).substring(2, 15)
    const link = `https://tourify.com/events/share/${linkId}`
    updateFormData("shareableLink", link)
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Generated",
      description: "Shareable link has been copied to clipboard"
    })
  }

  const addCollaborator = () => {
    const newCollaborator: Collaborator = {
      id: `collab-${Date.now()}`,
      name: "",
      email: "",
      role: "viewer",
      permissions: ["view"]
    }
    updateFormData("collaborators", [...formData.collaborators, newCollaborator])
  }

  const updateCollaborator = (collabId: string, field: keyof Collaborator, value: any) => {
    const updatedCollabs = formData.collaborators.map((collab: Collaborator) =>
      collab.id === collabId ? { ...collab, [field]: value } : collab
    )
    updateFormData("collaborators", updatedCollabs)
  }

  const removeCollaborator = (collabId: string) => {
    updateFormData("collaborators", formData.collaborators.filter((c: Collaborator) => c.id !== collabId))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sharing & Collaboration</h3>
        <p className="text-sm text-muted-foreground mb-6">Configure access and sharing settings for your event</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => updateFormData("isPublic", checked)}
          />
          <Label htmlFor="isPublic">Make event public</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="requiresApproval"
            checked={formData.requiresApproval}
            onCheckedChange={(checked) => updateFormData("requiresApproval", checked)}
          />
          <Label htmlFor="requiresApproval">Require approval for registrations</Label>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Shareable Link</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={formData.shareableLink || ""}
            readOnly
            placeholder="Generate a shareable link"
            className="flex-1"
          />
          <Button onClick={generateShareableLink} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Generate
          </Button>
          {formData.shareableLink && (
            <Button 
              variant="outline" 
              onClick={() => {
                navigator.clipboard.writeText(formData.shareableLink)
                toast({ title: "Copied!", description: "Link copied to clipboard" })
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium">Collaborators</h4>
          <Button onClick={addCollaborator} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Collaborator
          </Button>
        </div>

        {formData.collaborators.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-muted-foreground">No collaborators added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {formData.collaborators.map((collaborator: Collaborator) => (
              <Card key={collaborator.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={collaborator.name}
                        onChange={(e) => updateCollaborator(collaborator.id, "name", e.target.value)}
                        placeholder="Full name"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        value={collaborator.email}
                        onChange={(e) => updateCollaborator(collaborator.id, "email", e.target.value)}
                        placeholder="email@example.com"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Role</Label>
                      <Select value={collaborator.role} onValueChange={(value) => updateCollaborator(collaborator.id, "role", value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => removeCollaborator(collaborator.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Review & Create Step Component
export function ReviewStep({ formData }: { formData: any }) {
  const projectedRevenue = formData.ticketTypes.reduce((sum: number, ticket: any) => 
    sum + (ticket.price * ticket.quantity), 0
  )

  const totalExpenses = formData.expenses.reduce((sum: number, expense: any) => 
    sum + expense.estimatedCost, 0
  )

  const staffCosts = formData.staffAssignments.reduce((total: number, assignment: any) => {
    const startTime = new Date(`2000-01-01T${assignment.startTime}:00`)
    const endTime = new Date(`2000-01-01T${assignment.endTime}:00`)
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    return total + (hours * assignment.hourlyRate)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Your Event</h3>
        <p className="text-sm text-muted-foreground mb-6">Review all details before creating your event</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Title</Label>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Type</Label>
              <p className="capitalize">{formData.eventType}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Date & Time</Label>
              <p>{format(formData.date, "PPP")} • {formData.startTime} - {formData.endTime}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Capacity</Label>
              <p>{formData.capacity} people</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Projected Revenue</span>
              <span className="font-medium text-green-600">${projectedRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Staff Costs</span>
              <span className="font-medium text-red-600">${staffCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Other Expenses</span>
              <span className="font-medium text-red-600">${totalExpenses.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium">Projected Profit</span>
              <span className={`font-bold ${(projectedRevenue - staffCosts - totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(projectedRevenue - staffCosts - totalExpenses).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticketing</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.isFree ? (
              <p className="text-sm text-muted-foreground">Free Event</p>
            ) : (
              <div className="space-y-2">
                {formData.ticketTypes.map((ticket: any) => (
                  <div key={ticket.id} className="flex justify-between text-sm">
                    <span>{ticket.name}</span>
                    <span>{ticket.quantity} × ${ticket.price}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team & Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Staff Assigned</Label>
                <p className="text-sm">{formData.staffAssignments.length} team members</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Equipment</Label>
                <p className="text-sm">{formData.equipmentNeeded.length} items selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-semibold">Ready to Create Event</h4>
              <p className="text-sm text-muted-foreground">
                All required information has been provided. Click "Create Event" to finalize.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 