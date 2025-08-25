"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, DollarSign, MapPin, Upload, Users } from "lucide-react"
import type { EventData } from "@/lib/services/artist.service"
import { artistService } from "@/lib/services/artist.service"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<EventData>({
    name: "",
    description: "",
    date: "",
    location: "",
    venue: "",
    capacity: 0,
    status: "draft",
    type: "concert",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.date || !formData.venue) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await artistService.createEvent(formData)
      const success = result.success

      if (success) {
        toast({
          title: "Event created",
          description: `Your event "${formData.name}" has been created successfully.`,
        })
        onClose()
        setFormData({
          name: "",
          description: "",
          date: "",
          location: "",
          venue: "",
          capacity: 0,
          status: "draft",
          type: "concert",
        })
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error creating event",
        description: "There was an error creating your event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Create a New Event</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create an event that can be found on the heatmap and generate tickets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name*</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter event title"
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event"
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date & Time*</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue*</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Venue name"
                  className="bg-gray-800 border-gray-700 pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  className="bg-gray-800 border-gray-700 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="0"
                  value={formData.capacity || ""}
                  onChange={handleNumberChange}
                  placeholder="Maximum attendees"
                  className="bg-gray-800 border-gray-700 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket_price">Ticket Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="ticket_price"
                  name="ticket_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ticket_price || ""}
                  onChange={handleNumberChange}
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-700 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="border border-dashed border-gray-700 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <Upload className="h-8 w-8 text-gray-500" />
              <p className="text-sm font-medium">Upload Event Cover Image</p>
              <p className="text-xs text-gray-400">Drag and drop or click to upload</p>
              <Input id="coverImage" name="coverImage" type="file" accept="image/*" className="hidden" />
              <Button type="button" variant="outline" size="sm" className="mt-2 border-gray-700">
                Choose File
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
