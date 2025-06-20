"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminEventWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
  initialData?: any
}

const eventTypes = ["Concert", "Festival", "Conference", "Meetup", "Other"]
const timezones = ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"]

export function AdminEventWizardDialog({ open, onOpenChange, onSubmit, initialData }: AdminEventWizardDialogProps) {
  const [step, setStep] = React.useState(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    type: "Concert",
    status: "draft",
    description: "",
    date: new Date(),
    start_time: "",
    end_time: "",
    timezone: "UTC",
    location: "",
    venue: "",
    venue_capacity: 100,
    venue_contact: "",
    cover_image_url: "",
    logo_url: "",
    website: "",
    social_links: "",
    ticket_types: [{ name: "General", price: 0, capacity: 100 }],
    staff: [],
    ...initialData
  })

  function updateField(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  function updateTicketType(index: number, key: string, value: any) {
    setFormData((prev: any) => ({
      ...prev,
      ticket_types: prev.ticket_types.map((t: any, i: number) => i === index ? { ...t, [key]: value } : t)
    }))
  }

  function addTicketType() {
    setFormData((prev: any) => ({ ...prev, ticket_types: [...prev.ticket_types, { name: "", price: 0, capacity: 0 }] }))
  }

  function removeTicketType(index: number) {
    setFormData((prev: any) => ({ ...prev, ticket_types: prev.ticket_types.filter((_: any, i: number) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setStep(1)
      setFormData({
        name: "",
        type: "Concert",
        status: "draft",
        description: "",
        date: new Date(),
        start_time: "",
        end_time: "",
        timezone: "UTC",
        location: "",
        venue: "",
        venue_capacity: 100,
        venue_contact: "",
        cover_image_url: "",
        logo_url: "",
        website: "",
        social_links: "",
        ticket_types: [{ name: "General", price: 0, capacity: 100 }],
        staff: [],
      })
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stepper indicator */}
          <div className="flex justify-between mb-4 text-xs text-slate-400">
            {["Basic Info", "Date & Time", "Location", "Media", "Ticketing", "Staff", "Review"].map((label, i) => (
              <div key={label} className={cn("flex-1 text-center", step === i + 1 && "text-purple-400 font-bold")}>{label}</div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={v => updateField("type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={v => updateField("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => updateField("description", e.target.value)} rows={3} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}> <CalendarIcon className="mr-2 h-4 w-4" /> {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>} </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={formData.date} onSelect={date => date && updateField("date", date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input id="start_time" type="time" value={formData.start_time} onChange={e => updateField("start_time", e.target.value)} required />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input id="end_time" type="time" value={formData.end_time} onChange={e => updateField("end_time", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={v => updateField("timezone", v)}>
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (City, Address)</Label>
                <Input id="location" value={formData.location} onChange={e => updateField("location", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue Name</Label>
                <Input id="venue" value={formData.venue} onChange={e => updateField("venue", e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="venue_capacity">Venue Capacity</Label>
                  <Input id="venue_capacity" type="number" min="1" value={formData.venue_capacity} onChange={e => updateField("venue_capacity", parseInt(e.target.value))} required />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="venue_contact">Venue Contact (optional)</Label>
                  <Input id="venue_contact" value={formData.venue_contact} onChange={e => updateField("venue_contact", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input id="cover_image_url" value={formData.cover_image_url} onChange={e => updateField("cover_image_url", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input id="logo_url" value={formData.logo_url} onChange={e => updateField("logo_url", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Event Website (optional)</Label>
                <Input id="website" value={formData.website} onChange={e => updateField("website", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_links">Social Links (comma separated)</Label>
                <Input id="social_links" value={formData.social_links} onChange={e => updateField("social_links", e.target.value)} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="font-medium text-slate-200">Ticket Types</div>
              {formData.ticket_types.map((ticket: any, i: number) => (
                <div key={i} className="flex gap-2 items-end mb-2">
                  <div className="flex-1">
                    <Label>Name</Label>
                    <Input value={ticket.name} onChange={e => updateTicketType(i, "name", e.target.value)} required />
                  </div>
                  <div className="flex-1">
                    <Label>Price</Label>
                    <Input type="number" min="0" value={ticket.price} onChange={e => updateTicketType(i, "price", parseFloat(e.target.value))} required />
                  </div>
                  <div className="flex-1">
                    <Label>Capacity</Label>
                    <Input type="number" min="1" value={ticket.capacity} onChange={e => updateTicketType(i, "capacity", parseInt(e.target.value))} required />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeTicketType(i)}>Remove</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTicketType}>Add Ticket Type</Button>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Staff (comma separated emails or names)</Label>
                <Textarea value={formData.staff.join ? formData.staff.join(", ") : formData.staff} onChange={e => updateField("staff", e.target.value.split(",").map((s: string) => s.trim()))} rows={3} />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="font-medium text-slate-200">Review & Confirm</div>
              <pre className="bg-slate-900/50 rounded p-4 text-xs text-slate-300 overflow-x-auto">{JSON.stringify(formData, null, 2)}</pre>
            </div>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
            )}
            {step < 7 ? (
              <Button type="button" onClick={nextStep}>Next</Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : initialData ? "Update Event" : "Create Event"}</Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 