"use client"

import * as React from "react"
import { EventList } from "./event-list"
import { AdminEventWizardDialog } from "./admin-event-wizard"
import { AdminEvent } from "./event-card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { EventDetailsDialog } from "./event-details-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// TODO: Replace with real data fetching from Supabase/GraphQL
const mockEvents: AdminEvent[] = [
  {
    id: "1",
    name: "Summer Music Festival 2023",
    date: new Date().toISOString(),
    status: "active",
    location: "Central Park",
    venue: "Main Stage",
    capacity: 4500,
    tickets_sold: 3450,
    revenue: 84500,
    cover_image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    description: "A three-day music festival featuring top artists from around the world.",
    tasks: [
      { id: "1", name: "Book venue", status: "completed", dueDate: "2025-05-01" },
      { id: "2", name: "Send invites", status: "in-progress", dueDate: "2025-05-15" },
      { id: "3", name: "Confirm catering", status: "not-started", dueDate: "2025-06-01" }
    ],
    schedule: [
      { date: "2025-06-07", time: "18:00", activity: "Doors Open" },
      { date: "2025-06-07", time: "19:00", activity: "Opening Remarks" },
      { date: "2025-06-07", time: "20:00", activity: "Main Act" }
    ]
  },
  {
    id: "2",
    name: "Winter Gala",
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    status: "draft",
    location: "City Hall",
    venue: "Ballroom",
    capacity: 800,
    tickets_sold: 0,
    revenue: 0,
    cover_image_url: "",
    description: "A formal winter gala event for the community.",
    tasks: [
      { id: "1", name: "Book ballroom", status: "completed", dueDate: "2025-05-01" },
      { id: "2", name: "Arrange catering", status: "not-started", dueDate: "2025-06-01" }
    ],
    schedule: [
      { date: "2025-06-07", time: "18:00", activity: "Doors Open" },
      { date: "2025-06-07", time: "19:00", activity: "Dinner" },
      { date: "2025-06-07", time: "21:00", activity: "Dancing" }
    ]
  }
]

const TABS = [
  { key: "upcoming", label: "Upcoming Events" },
  { key: "past", label: "Past Events" },
  { key: "draft", label: "Draft Events" },
]

function filterEvents(events: AdminEvent[], tab: string) {
  const now = new Date()
  if (tab === "upcoming")
    return events.filter(e => e.status !== "draft" && new Date(e.date) >= now)
  if (tab === "past")
    return events.filter(e => e.status !== "draft" && new Date(e.date) < now)
  if (tab === "draft")
    return events.filter(e => e.status === "draft")
  return events
}

export default function EventsPage() {
  const [events, setEvents] = React.useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isWizardOpen, setIsWizardOpen] = React.useState(false)
  const [editingEvent, setEditingEvent] = React.useState<AdminEvent | null>(null)
  const { toast } = useToast()
  const [selectedEvent, setSelectedEvent] = React.useState<AdminEvent | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [tab, setTab] = React.useState("upcoming")

  React.useEffect(() => {
    setTimeout(() => {
      setEvents(mockEvents)
      setIsLoading(false)
    }, 500)
  }, [])

  function handleCreate() {
    setEditingEvent(null)
    setIsWizardOpen(true)
  }

  async function handleSubmitEvent(data: any) {
    if (editingEvent) {
      setEvents(events => events.map(ev => ev.id === editingEvent.id ? { ...editingEvent, ...data } : ev))
      toast({ title: "Event updated", description: `${data.name} updated successfully.` })
    } else {
      const newEvent: AdminEvent = {
        ...data,
        id: (Math.random() * 100000).toFixed(0),
        tickets_sold: 0,
        revenue: 0,
        cover_image_url: data.cover_image_url || "",
      }
      setEvents(events => [newEvent, ...events])
      toast({ title: "Event created", description: `${data.name} created successfully.` })
    }
    setIsWizardOpen(false)
    setEditingEvent(null)
  }

  function handleEdit(event: AdminEvent) {
    setEditingEvent(event)
    setIsWizardOpen(true)
  }

  function handleDelete(event: AdminEvent) {
    setEvents(events => events.filter(ev => ev.id !== event.id))
    toast({ title: "Event deleted", description: `${event.name} deleted.` })
  }

  function handleView(event: AdminEvent) {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }

  // Custom event card grid for new design
  function EventCardGrid({ events }: { events: AdminEvent[] }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {events.map(event => (
          <EventCardModern key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
        ))}
      </div>
    )
  }

  // Modern event card UI
  function EventCardModern({ event, onEdit, onDelete, onView }: { event: AdminEvent, onEdit: any, onDelete: any, onView: any }) {
    const now = new Date()
    const eventDate = new Date(event.date)
    const daysLeft = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const progress = event.capacity > 0 ? Math.round((event.tickets_sold / event.capacity) * 100) : 0
  return (
      <div className="rounded-xl overflow-hidden bg-slate-900/70 border border-slate-800 shadow-lg flex flex-col">
        <div className="relative h-28 bg-gradient-to-r from-purple-800 to-indigo-800 flex items-center justify-center">
          <CalendarIcon className="h-12 w-12 text-white/20" />
          {daysLeft > 0 && (
            <span className="absolute top-3 right-3 bg-purple-900/80 text-purple-300 text-xs px-3 py-1 rounded-full font-medium">
              {daysLeft} days left
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-white leading-tight">{event.name}</span>
            {event.type && (
              <span className="ml-auto bg-slate-800/70 text-slate-300 text-xs px-2 py-1 rounded-full font-medium">
                {event.type}
              </span>
        )}
      </div>
          <div className="flex items-center text-sm text-purple-400 mb-1">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {eventDate.toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-purple-400 mb-1">
            <span className="mr-2">📍</span>{event.venue || event.location}
          </div>
          <div className="flex items-center text-sm text-purple-400 mb-2">
            <span className="mr-2">👥</span>{event.tickets_sold} / {event.capacity} attendees
          </div>
          <div className="text-xs text-slate-400 mb-1">Planning Progress</div>
          <div className="w-full h-2 bg-slate-800 rounded mb-2">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <span className="text-green-400 font-semibold text-sm">${event.revenue.toLocaleString()}</span>
        </div>
        </div>
        <div className="flex gap-2 border-t border-slate-800 bg-slate-900/80 p-4">
          <Button variant="outline" className="flex-1" onClick={() => onView(event)}>
            View Details
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onEdit(event)}>
            Edit
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => onDelete(event)}>
            Delete
          </Button>
        </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="h-7 w-7 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Events Management</h1>
          </div>
          <div className="text-slate-400 text-base">Create, manage, and track all your events in one place</div>
        </div>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2 text-base font-semibold shadow-lg" onClick={handleCreate}>
          + Create New Event
          </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-slate-800/70 rounded-full p-1 flex gap-2 mb-8 w-fit">
          {TABS.map(t => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-5 py-2 rounded-full text-base font-medium text-slate-300"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(t => (
          <TabsContent key={t.key} value={t.key} className="w-full">
            <EventCardGrid events={filterEvents(events, t.key)} />
          </TabsContent>
        ))}
      </Tabs>
      <AdminEventWizardDialog
        open={isWizardOpen}
        onOpenChange={open => {
          setIsWizardOpen(open)
          if (!open) setEditingEvent(null)
        }}
        onSubmit={handleSubmitEvent}
        initialData={editingEvent || undefined}
      />
      <EventDetailsDialog
        open={isDetailsOpen}
        onOpenChange={open => setIsDetailsOpen(open)}
        event={selectedEvent}
      />
    </div>
  )
}
