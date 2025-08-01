"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, CheckCircle, Clock, XCircle, Music, MapPin, Calendar, DollarSign, Users, Eye } from "lucide-react"
import { toast } from "sonner"

interface Event {
  id: string
  name: string
  description?: string
  tour_id: string
  venue_name: string
  venue_address?: string
  event_date: string
  event_time?: string
  doors_open?: string
  duration_minutes?: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  capacity: number
  tickets_sold: number
  ticket_price?: number
  vip_price?: number
  expected_revenue: number
  actual_revenue: number
  expenses: number
  venue_contact_name?: string
  venue_contact_email?: string
  venue_contact_phone?: string
  sound_requirements?: string
  lighting_requirements?: string
  stage_requirements?: string
  special_requirements?: string
  load_in_time?: string
  sound_check_time?: string
}

interface TourEventManagerProps {
  tourId: string
  events: Event[]
  onEventsUpdate: (events: Event[]) => void
}

export function TourEventManager({ tourId, events, onEventsUpdate }: TourEventManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue_name: '',
    venue_address: '',
    event_date: '',
    event_time: '',
    doors_open: '',
    duration_minutes: 0,
    status: 'scheduled' as const,
    capacity: 0,
    ticket_price: 0,
    vip_price: 0,
    expected_revenue: 0,
    venue_contact_name: '',
    venue_contact_email: '',
    venue_contact_phone: '',
    sound_requirements: '',
    lighting_requirements: '',
    stage_requirements: '',
    special_requirements: '',
    load_in_time: '',
    sound_check_time: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      venue_name: '',
      venue_address: '',
      event_date: '',
      event_time: '',
      doors_open: '',
      duration_minutes: 0,
      status: 'scheduled',
      capacity: 0,
      ticket_price: 0,
      vip_price: 0,
      expected_revenue: 0,
      venue_contact_name: '',
      venue_contact_email: '',
      venue_contact_phone: '',
      sound_requirements: '',
      lighting_requirements: '',
      stage_requirements: '',
      special_requirements: '',
      load_in_time: '',
      sound_check_time: ''
    })
  }

  const handleAddEvent = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      name: event.name,
      description: event.description || '',
      venue_name: event.venue_name,
      venue_address: event.venue_address || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      doors_open: event.doors_open || '',
      duration_minutes: event.duration_minutes || 0,
      status: event.status,
      capacity: event.capacity,
      ticket_price: event.ticket_price || 0,
      vip_price: event.vip_price || 0,
      expected_revenue: event.expected_revenue,
      venue_contact_name: event.venue_contact_name || '',
      venue_contact_email: event.venue_contact_email || '',
      venue_contact_phone: event.venue_contact_phone || '',
      sound_requirements: event.sound_requirements || '',
      lighting_requirements: event.lighting_requirements || '',
      stage_requirements: event.stage_requirements || '',
      special_requirements: event.special_requirements || '',
      load_in_time: event.load_in_time || '',
      sound_check_time: event.sound_check_time || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (isEdit: boolean = false) => {
    setIsSubmitting(true)
    try {
      const url = isEdit 
        ? `/api/tours/${tourId}/events/${selectedEvent?.id}`
        : `/api/tours/${tourId}/events`
      
      const method = isEdit ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save event')
      }

      const result = await response.json()
      
      if (isEdit) {
        const updatedEvents = events.map(event => 
          event.id === selectedEvent?.id ? result.event : event
        )
        onEventsUpdate(updatedEvents)
        toast.success('Event updated successfully')
      } else {
        const newEvents = [...events, result.event]
        onEventsUpdate(newEvents)
        toast.success('Event added successfully')
      }

      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tours/${tourId}/events/${selectedEvent.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      const updatedEvents = events.filter(event => event.id !== selectedEvent.id)
      onEventsUpdate(updatedEvents)
      toast.success('Event deleted successfully')
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'confirmed': return 'bg-blue-500/20 text-blue-400'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400'
      case 'scheduled': return 'bg-purple-500/20 text-purple-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      case 'postponed': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'postponed': return <Clock className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tour Events</h2>
          <p className="text-slate-400">Manage events for this tour</p>
        </div>
        <Button onClick={handleAddEvent} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{event.name}</h4>
                    <p className="text-sm text-slate-400">{event.venue_name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">
                          {event.tickets_sold}/{event.capacity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">
                          ${event.actual_revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusIcon(event.status)}
                    <span className="ml-1 capitalize">{event.status.replace('_', ' ')}</span>
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditEvent(event)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="p-12 text-center">
            <Music className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'No events match your current filters'
                : 'Get started by adding your first event to this tour'
              }
            </p>
            <Button onClick={handleAddEvent} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add First Event
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Event to Tour</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Event Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Venue Name</Label>
                <Input
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Event Date</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Event Time</Label>
                <Input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Doors Open</Label>
                <Input
                  type="time"
                  value={formData.doors_open}
                  onChange={(e) => setFormData({ ...formData, doors_open: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Ticket Price</Label>
                <Input
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">VIP Price</Label>
                <Input
                  type="number"
                  value={formData.vip_price}
                  onChange={(e) => setFormData({ ...formData, vip_price: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Adding...' : 'Add Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Event Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Venue Name</Label>
                <Input
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Event Date</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Event Time</Label>
                <Input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Doors Open</Label>
                <Input
                  type="time"
                  value={formData.doors_open}
                  onChange={(e) => setFormData({ ...formData, doors_open: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Ticket Price</Label>
                <Input
                  type="number"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">VIP Price</Label>
                <Input
                  type="number"
                  value={formData.vip_price}
                  onChange={(e) => setFormData({ ...formData, vip_price: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 