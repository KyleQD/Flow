"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TimelineEvent {
  id: string
  title: string
  date: Date
  type: 'milestone' | 'task' | 'event'
  description?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  startDate: Date
  endDate: Date
  onAddEvent?: (event: Omit<TimelineEvent, 'id'>) => void
}

export function Timeline({ events, startDate, endDate, onAddEvent }: TimelineProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState<{
    title: string
    type: 'milestone' | 'task' | 'event'
    description: string
  }>({
    title: '',
    type: 'event',
    description: ''
  })

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title && onAddEvent) {
      onAddEvent({
        title: newEvent.title,
        date: selectedDate,
        type: newEvent.type,
        description: newEvent.description
      })
      setShowAddEvent(false)
      setNewEvent({ title: '', type: 'event', description: '' })
      setSelectedDate(undefined)
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-purple-500'
      case 'task':
        return 'bg-blue-500'
      case 'event':
        return 'bg-green-500'
      default:
        return 'bg-slate-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
              Milestone
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
              Task
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1" />
              Event
            </div>
          </div>
        </div>
        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Create a new event, task, or milestone for your project timeline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200"
                  placeholder="Enter event title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as TimelineEvent['type'] })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200"
                >
                  <option value="event">Event</option>
                  <option value="task">Task</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300",
                        !selectedDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < startDate || date > endDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 min-h-[100px]"
                  placeholder="Enter event description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddEvent(false)}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEvent}
                disabled={!selectedDate || !newEvent.title}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />
        <div className="space-y-8 relative">
          {events.sort((a, b) => a.date.getTime() - b.date.getTime()).map((event) => (
            <div key={event.id} className="relative pl-10">
              <div className={`absolute left-3 w-3 h-3 rounded-full ${getEventColor(event.type)} transform -translate-x-1/2`} />
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-200">{event.title}</h3>
                  <span className="text-sm text-slate-400">{format(event.date, "PPP")}</span>
                </div>
                {event.description && (
                  <p className="text-sm text-slate-400">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 