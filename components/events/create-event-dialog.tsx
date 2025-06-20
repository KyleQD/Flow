"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  capacity: number
  ticketPrice: number
  category: string
  coverImage: string
  isPublic: boolean
  status: "upcoming" | "past" | "draft"
  views: number
  ticketsSold: number
  revenue: number
}

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated: (event: Event) => void
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const [date, setDate] = React.useState<Date>()
  const [time, setTime] = React.useState("")
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    location: "",
    venue: "",
    capacity: "",
    ticketPrice: "",
    category: "",
    coverImage: "",
    isPublic: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to create the event
    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      date: date?.toISOString().split("T")[0] || "",
      time,
      location: formData.location,
      venue: formData.venue,
      capacity: parseInt(formData.capacity),
      ticketPrice: parseFloat(formData.ticketPrice),
      category: formData.category,
      coverImage: formData.coverImage,
      isPublic: formData.isPublic,
      status: "upcoming",
      views: 0,
      ticketsSold: 0,
      revenue: 0
    }
    onEventCreated(newEvent)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#13151c] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-400">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#1a1c23] border-gray-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-400">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[#1a1c23] border-gray-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-[#1a1c23] border-gray-800",
                      !date && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1a1c23] border-gray-800">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-400">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
                  className="pl-10 bg-[#1a1c23] border-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-400">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                className="bg-[#1a1c23] border-gray-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue" className="text-gray-400">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, venue: e.target.value })}
                className="bg-[#1a1c23] border-gray-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-gray-400">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, capacity: e.target.value })}
                className="bg-[#1a1c23] border-gray-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticketPrice" className="text-gray-400">Ticket Price ($)</Label>
              <Input
                id="ticketPrice"
                type="number"
                step="0.01"
                value={formData.ticketPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ticketPrice: e.target.value })}
                className="bg-[#1a1c23] border-gray-800"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-400">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: string) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="bg-[#1a1c23] border-gray-800">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1c23] border-gray-800">
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="theater">Theater</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-gray-400">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, coverImage: e.target.value })}
              className="bg-[#1a1c23] border-gray-800"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic" className="text-gray-400">Public Event</Label>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
