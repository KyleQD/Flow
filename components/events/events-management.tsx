"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { VenueHeader } from "@/components/venue/venue-header"
import { EventsList } from "@/components/events/events-list"
import { EventDetails } from "@/components/events/event-details"
import { EventsFilters } from "@/components/events/events-filters"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { CreateEventDialog } from "@/components/events/create-event-dialog"
import { getEvents, deleteEvent } from "@/lib/events/actions"
import { useToast } from "@/components/ui/use-toast"
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

export function EventsManagement() {
  const { toast } = useToast()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        const eventsData = await getEvents()
        setEvents(eventsData)
      } catch (error) {
        console.error("Error loading events:", error)
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [toast])

  const handleEventCreated = (newEvent: any) => {
    setEvents((prevEvents) => [...prevEvents, newEvent])
    toast({
      title: "Event Created",
      description: `${newEvent.title} has been created successfully.`,
    })
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      setIsDeleting(true)
      await deleteEvent(eventToDelete)

      // Update local state
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete))

      // If the deleted event was selected, clear selection
      if (selectedEventId === eventToDelete) {
        setSelectedEventId(null)
      }

      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const confirmDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.performer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) : null

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <VenueHeader />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Event Management</h1>
              <p className="text-white/60">Create and manage your venue events</p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              <span className="ml-2 text-white/60">Loading events...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <EventsFilters
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
                <EventsList
                  events={filteredEvents}
                  selectedEventId={selectedEventId}
                  onSelectEvent={setSelectedEventId}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedEvent ? (
                  <EventDetails
                    event={selectedEvent}
                    onDeleteEvent={confirmDeleteEvent}
                    onEventUpdated={(updatedEvent) => {
                      setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
                    }}
                  />
                ) : (
                  <div className="bg-[#1a1d29] rounded-lg border-0 text-white p-8 h-full flex flex-col items-center justify-center">
                    <div className="text-white/20 text-6xl mb-4">🎭</div>
                    <h3 className="text-xl font-medium text-white mb-2">No Event Selected</h3>
                    <p className="text-white/60 text-center max-w-md">
                      Select an event from the list to view details, or create a new event to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreated={handleEventCreated}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1d29] text-white border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the event and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent border-[#2a2f3e] text-white hover:bg-[#2a2f3e] hover:text-white"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={(e) => {
                e.preventDefault()
                handleDeleteEvent()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
