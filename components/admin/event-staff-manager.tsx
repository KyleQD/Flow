"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock4
} from "lucide-react"

interface Staff {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  status: 'confirmed' | 'pending' | 'declined'
  arrival_time?: string
  departure_time?: string
  notes?: string
  hourly_rate?: number
  total_hours?: number
  created_at?: string
  updated_at?: string
}

interface EventStaffManagerProps {
  eventId: string
  staff: Staff[]
  onStaffUpdate: (staff: Staff[]) => void
}

export function EventStaffManager({ eventId, staff, onStaffUpdate }: EventStaffManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'pending' as Staff['status'],
    arrival_time: '',
    departure_time: '',
    notes: '',
    hourly_rate: 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'declined': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'declined': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredStaff = staff.filter(member => {
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    const matchesRole = filterRole === 'all' || member.role.toLowerCase().includes(filterRole.toLowerCase())
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesRole && matchesSearch
  })

  const confirmedStaff = staff.filter(member => member.status === 'confirmed').length
  const pendingStaff = staff.filter(member => member.status === 'pending').length
  const declinedStaff = staff.filter(member => member.status === 'declined').length

  const handleCreateStaff = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      status: 'pending',
      arrival_time: '',
      departure_time: '',
      notes: '',
      hourly_rate: 0
    })
    setIsCreateDialogOpen(true)
  }

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member)
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone || '',
      status: member.status,
      arrival_time: member.arrival_time || '',
      departure_time: member.departure_time || '',
      notes: member.notes || '',
      hourly_rate: member.hourly_rate || 0
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteStaff = (member: Staff) => {
    setSelectedStaff(member)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveStaff = async () => {
    try {
      const staffData = {
        ...formData,
        event_id: eventId
      }

      if (selectedStaff) {
        // Update existing staff member
        const response = await fetch(`/api/events/${eventId}/staff/${selectedStaff.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        })

        if (!response.ok) throw new Error('Failed to update staff member')

        const updatedStaff = await response.json()
        const updatedStaffList = staff.map(member => 
          member.id === selectedStaff.id ? updatedStaff.staff : member
        )
        onStaffUpdate(updatedStaffList)
      } else {
        // Create new staff member
        const response = await fetch(`/api/events/${eventId}/staff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
        })

        if (!response.ok) throw new Error('Failed to create staff member')

        const newStaff = await response.json()
        onStaffUpdate([...staff, newStaff.staff])
      }

      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error('Error saving staff member:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedStaff) return

    try {
      const response = await fetch(`/api/events/${eventId}/staff/${selectedStaff.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete staff member')

      const updatedStaffList = staff.filter(member => member.id !== selectedStaff.id)
      onStaffUpdate(updatedStaffList)
      setIsDeleteDialogOpen(false)
      setSelectedStaff(null)
    } catch (error) {
      console.error('Error deleting staff member:', error)
    }
  }

  const handleStatusChange = async (staffId: string, newStatus: Staff['status']) => {
    try {
      const response = await fetch(`/api/events/${eventId}/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update staff status')

      const updatedStaff = await response.json()
      const updatedStaffList = staff.map(member => 
        member.id === staffId ? updatedStaff.staff : member
      )
      onStaffUpdate(updatedStaffList)
    } catch (error) {
      console.error('Error updating staff status:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Staff</h2>
          <p className="text-slate-400">Manage staff assignments and schedules</p>
        </div>
        <Button onClick={handleCreateStaff}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Staff</p>
                <p className="text-2xl font-bold text-white">{staff.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Confirmed</p>
                <p className="text-2xl font-bold text-green-400">{confirmedStaff}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{pendingStaff}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Declined</p>
                <p className="text-2xl font-bold text-red-400">{declinedStaff}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-slate-400">Search</Label>
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label className="text-slate-400">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-400">Role</Label>
              <Input
                placeholder="Filter by role..."
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterStatus('all')
                  setFilterRole('all')
                  setSearchQuery('')
                }}
                className="w-full bg-slate-800 border-slate-700"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Staff Found</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery || filterStatus !== 'all' || filterRole !== 'all'
                    ? "No staff members match your current filters"
                    : "Get started by adding your first staff member"
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && filterRole === 'all' && (
                  <Button onClick={handleCreateStaff}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Staff Member
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredStaff.map((member) => (
            <Card key={member.id} className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">{member.name}</h3>
                      <Badge className={getStatusColor(member.status)}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1">{member.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-2">{member.role}</p>
                    
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.arrival_time && (
                        <div className="flex items-center">
                          <Clock4 className="h-3 w-3 mr-2" />
                          <span>Arrives: {member.arrival_time}</span>
                        </div>
                      )}
                      {member.hourly_rate && member.hourly_rate > 0 && (
                        <div className="flex items-center">
                          <span className="text-green-400">${member.hourly_rate}/hr</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Select 
                      value={member.status} 
                      onValueChange={(value: Staff['status']) => handleStatusChange(member.id, value)}
                    >
                      <SelectTrigger className="w-24 bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditStaff(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteStaff(member)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Staff Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
              
              <div>
                <Label className="text-slate-400">Role</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Enter role"
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
              
              <div>
                <Label className="text-slate-400">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-400">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: Staff['status']) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="mt-1 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-slate-400">Arrival Time</Label>
                <Input
                  type="time"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
              
              <div>
                <Label className="text-slate-400">Departure Time</Label>
                <Input
                  type="time"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  className="mt-1 bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-400">Hourly Rate ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="mt-1 bg-slate-700 border-slate-600"
              />
            </div>
            
            <div>
              <Label className="text-slate-400">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this staff member"
                className="mt-1 bg-slate-700 border-slate-600"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setSelectedStaff(null)
              }}
              className="bg-slate-700 border-slate-600"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStaff}>
              {selectedStaff ? 'Update Staff Member' : 'Add Staff Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to remove "{selectedStaff?.name}" from the event staff? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Staff Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 