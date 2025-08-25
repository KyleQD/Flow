"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Music, Users, Film, Tag, Wrench, Edit, MoreHorizontal } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns"
import { EventsProvider, useEvents } from "@/context/venue/events-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Types
interface VenueCalendarProps {
  venue?: any
  className?: string
}

interface EventFormData {
  id?: number
  title: string
  description: string
  date: Date
  startTime: string
  endTime: string
  type: string
  status: string
  capacity: number
  ticketPrice: number
  isPublic: boolean
  attendance?: number
}

// Export as both named and default export
export const VenueCalendar = ({ venue, className }: VenueCalendarProps) => {
  return (
    <EventsProvider>
      <CalendarContent venue={venue} className={className} />
    </EventsProvider>
  )
}

// The actual calendar content
const CalendarContent = ({ venue, className }: VenueCalendarProps) => {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<"month" | "week">("month")
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all")
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventFormData | null>(null)

  // Use the events context
  const { events: contextEvents, createEvent, updateEvent } = useEvents()

  // Convert context events to the format expected by the calendar
  const mockEvents = useMemo(() => {
    return contextEvents.map((event) => ({
      id: event.id,
      date: new Date(),
      title: event.title,
      type: event.type,
      typeIcon: getIconForType(event.type),
      color: getColorForType(event.type),
      time: `${(event as any).startTime || "19:00"} - ${(event as any).endTime || "22:00"}`,
      status: (event as any).status || "pending",
      attendance: (event as any).attendance || 0,
      capacity: (event as any).capacity || 100,
      description: (event as any).description || "",
      startTime: (event as any).startTime || "19:00",
      endTime: (event as any).endTime || "22:00",
      ticketPrice: (event as any).ticketPrice || 0,
      isPublic: (event as any).isPublic !== undefined ? (event as any).isPublic : true,
    }))
  }, [contextEvents])

  // Get current week dates
  const weekDates = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 })
    const end = endOfWeek(date, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [date])

  // Filter events based on selected type
  const filteredEvents = useMemo(() => {
    return eventTypeFilter === "all" ? mockEvents : mockEvents.filter((event) => event.type === eventTypeFilter)
  }, [eventTypeFilter, mockEvents])

  // Get events for the selected date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return filteredEvents.filter((event) => isSameDay(event.date, date))
  }

  // Get events for a specific date (used in day rendering)
  const getEventsForSpecificDate = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.date, day))
  }

  // Get badge color based on event type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "concert":
        return "bg-purple-900/20 text-purple-400 border-purple-800"
      case "request":
        return "bg-blue-900/20 text-blue-400 border-blue-800"
      case "maintenance":
        return "bg-orange-900/20 text-orange-400 border-orange-800"
      case "internal":
        return "bg-gray-700 text-gray-300 border-gray-600"
      case "entertainment":
        return "bg-green-900/20 text-green-400 border-green-800"
      case "private":
        return "bg-pink-900/20 text-pink-400 border-pink-800"
      default:
        return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  // Get icon for event type
  const getEventIcon = (event: any) => {
    const IconComponent = event.typeIcon || Music
    return <IconComponent className="h-4 w-4" />
  }

  // Navigate to previous/next week or month
  const navigatePrevious = () => {
    if (view === "week") {
      setDate(addDays(date, -7))
    } else {
      const newDate = new Date(date)
      newDate.setMonth(date.getMonth() - 1)
      setDate(newDate)
    }
  }

  const navigateNext = () => {
    if (view === "week") {
      setDate(addDays(date, 7))
    } else {
      const newDate = new Date(date)
      newDate.setMonth(date.getMonth() + 1)
      setDate(newDate)
    }
  }

  // Handle opening the create event modal
  const handleOpenCreateModal = () => {
    setIsEditMode(false)
    setSelectedEvent(null)
    setIsEventModalOpen(true)
  }

  // Handle opening the edit event modal
  const handleOpenEditModal = (event: any) => {
    // Convert the event to the format expected by the form
    const formData: EventFormData = {
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: new Date(event.date),
      startTime: event.startTime || event.time.split(" - ")[0],
      endTime: event.endTime || event.time.split(" - ")[1],
      type: event.type,
      status: event.status,
      capacity: event.capacity,
      ticketPrice: event.ticketPrice || 0,
      isPublic: event.isPublic !== undefined ? event.isPublic : true,
    }

    setSelectedEvent(formData)
    setIsEditMode(true)
    setIsEventModalOpen(true)
  }

  // Handle saving an event (create or update)
  const handleSaveEvent = async (eventData: EventFormData) => {
    try {
      if (isEditMode && eventData.id) {
        // Update existing event
        await updateEvent(eventData.id.toString(), eventData as any)
      } else {
        // Create new event
        await createEvent(eventData as any)
      }
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  // Helper function to get icon for event type
  function getIconForType(type: string) {
    switch (type) {
      case "concert":
        return Music
      case "entertainment":
        return Film
      case "private":
        return Tag
      case "maintenance":
        return Wrench
      case "internal":
        return Users
      default:
        return Music
    }
  }

  // Helper function to get color for event type
  function getColorForType(type: string) {
    switch (type) {
      case "concert":
        return "purple"
      case "entertainment":
        return "green"
      case "private":
        return "pink"
      case "maintenance":
        return "orange"
      case "internal":
        return "gray"
      default:
        return "purple"
    }
  }

  // Render the week view
  const renderWeekView = () => {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDates.map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-gray-300">
              <div>{format(day, "EEE")}</div>
              <div
                className={`mt-1 inline-block rounded-full w-8 h-8 flex items-center justify-center
              ${isSameDay(day, new Date()) ? "bg-purple-600 text-white" : ""}`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const eventsOnDay = getEventsForSpecificDate(day)

            return (
              <div
                key={i}
                className={`
                min-h-[180px] border border-gray-800 rounded-md p-2 cursor-pointer
                ${isSelected ? "bg-gray-700 border-gray-600" : "bg-gray-800"}
                ${isToday ? "ring-1 ring-purple-500" : ""}
              `}
                onClick={() => setSelectedDate(day)}
              >
                <div className="space-y-2 overflow-y-auto max-h-[170px]">
                  {eventsOnDay.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">No events</span>
                    </div>
                  ) : (
                    eventsOnDay.map((event, idx) => (
                      <div
                        key={idx}
                        className={`
                        p-2 rounded text-xs cursor-pointer
                        ${(event.type as any) === "concert" ? "bg-purple-900/30 text-purple-300 border-l-2 border-purple-500" : ""}
                        ${(event.type as any) === "request" ? "bg-blue-900/30 text-blue-300 border-l-2 border-blue-500" : ""}
                        ${(event.type as any) === "maintenance" ? "bg-orange-900/30 text-orange-300 border-l-2 border-orange-500" : ""}
                        ${(event.type as any) === "internal" ? "bg-gray-700 text-gray-300 border-l-2 border-gray-500" : ""}
                        ${(event.type as any) === "entertainment" ? "bg-green-900/30 text-green-300 border-l-2 border-green-500" : ""}
                        ${(event.type as any) === "private" ? "bg-pink-900/30 text-pink-300 border-l-2 border-pink-500" : ""}
                      `}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditModal(event)
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{event.title}</span>
                          {getEventIcon(event)}
                        </div>
                        <div className="mt-1 text-[10px] opacity-80">{event.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render the month view
  const renderMonthView = () => {
    // Get all days in the current month
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    // Create array for all days to display (including padding from previous/next months)
    const daysArray = []

    // Add days from previous month for padding
    const prevMonthDays = new Date(date.getFullYear(), date.getMonth(), 0).getDate()
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, prevMonthDays - i)
      daysArray.push(prevDate)
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), i)
      daysArray.push(currentDate)
    }

    // Add days from next month if needed (to fill a 6-row grid)
    const totalCells = 42 // 6 rows of 7 days
    const remainingCells = totalCells - daysArray.length
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, i)
      daysArray.push(nextDate)
    }

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {daysArray.map((day, i) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, date)
            const eventsOnDay = getEventsForSpecificDate(day)

            return (
              <div
                key={i}
                className={`
                min-h-[100px] border border-gray-800 rounded-md p-2 cursor-pointer
                ${isSelected ? "bg-gray-700 border-gray-600" : "bg-gray-800"}
                ${isToday ? "ring-1 ring-purple-500" : ""}
                ${!isCurrentMonth ? "opacity-50" : ""}
              `}
                onClick={() => setSelectedDate(day)}
                onDoubleClick={() => {
                  setSelectedDate(day)
                  setIsEventModalOpen(true)
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${isToday ? "bg-purple-600 text-white px-1.5 py-0.5 rounded-full" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {eventsOnDay.length > 0 && (
                    <span className="flex items-center justify-center bg-gray-700 text-white text-[10px] w-4 h-4 rounded-full">
                      {eventsOnDay.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[70px] text-[10px]">
                  {eventsOnDay.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={`
                      px-1 py-0.5 rounded truncate
                      ${(event.type as any) === "concert" ? "bg-purple-900/30 text-purple-300" : ""}
                      ${(event.type as any) === "request" ? "bg-blue-900/30 text-blue-300" : ""}
                      ${(event.type as any) === "maintenance" ? "bg-orange-900/30 text-orange-300" : ""}
                      ${(event.type as any) === "internal" ? "bg-gray-700 text-gray-300" : ""}
                      ${(event.type as any) === "entertainment" ? "bg-green-900/30 text-green-300" : ""}
                      ${(event.type as any) === "private" ? "bg-pink-900/30 text-pink-300" : ""}
                    `}
                    >
                      {event.title}
                    </div>
                  ))}
                  {eventsOnDay.length > 3 && (
                    <div className="text-center text-gray-400">+{eventsOnDay.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className={`bg-gray-900 border-gray-800 ${className || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Calendar</CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week")} className="mr-2">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="min-w-[120px] text-center font-medium">
                {view === "week" ? (
                  <span>
                    {format(weekDates[0], "MMM d")} - {format(weekDates[6], "MMM d, yyyy")}
                  </span>
                ) : (
                  <span>{format(date, "MMMM yyyy")}</span>
                )}
              </div>

              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="concert">Concerts</SelectItem>
                <SelectItem value="request">Requests</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default" size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          <div className="md:col-span-5">{view === "month" ? renderMonthView() : renderWeekView()}</div>

          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
              </h3>

              {selectedDate && (
                <>
                  <div className="space-y-3 mt-4">
                    {getEventsForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-400 mb-3">No events scheduled</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEventModalOpen(true)}
                          className="mx-auto"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Event
                        </Button>
                      </div>
                    ) : (
                      getEventsForDate(selectedDate).map((event, index) => (
                        <div key={index} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={getBadgeColor(event.type)}>
                              <span className="flex items-center gap-1">
                                {getEventIcon(event)}
                                <span>{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>
                              </span>
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEditModal(event)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h4 className="font-medium text-white mt-2">{event.title}</h4>

                          <span className="text-xs text-gray-400">{event.time}</span>

                          {event.status === "confirmed" && event.capacity > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>Attendance</span>
                                <span>
                                  {event.attendance}/{event.capacity}
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-600 rounded-full mt-1">
                                <div
                                  className="h-full bg-purple-500 rounded-full"
                                  style={{ width: `${(event.attendance / event.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {getEventsForDate(selectedDate).length > 0 && (
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View All Events
                    </Button>
                  )}
                </>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-gray-300">Concerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-300">Booking Requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-gray-300">Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span className="text-xs text-gray-300">Internal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-300">Entertainment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                    <span className="text-xs text-gray-300">Private Events</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export as default as well
export default VenueCalendar
