"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Globe, 
  Music, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  Zap
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, addDays, startOfWeek, endOfWeek } from "date-fns"

interface CalendarItem {
  id: string
  title: string
  type: 'tour' | 'event' | 'task' | 'deadline' | 'meeting' | 'reminder'
  date: Date
  startTime?: string
  endTime?: string
  location?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'overdue'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  attendees?: number
  revenue?: number
  color?: string
  description?: string
  tags?: string[]
}

interface DashboardCalendarProps {
  tours?: any[]
  events?: any[]
  tasks?: any[]
  onItemClick?: (item: CalendarItem) => void
  onAddItem?: (type: string) => void
  className?: string
}

export default function DashboardCalendar({ 
  tours = [], 
  events = [], 
  tasks = [],
  onItemClick, 
  onAddItem,
  className = "" 
}: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)

  // Transform data into calendar items
  const calendarItems = useMemo(() => {
    const items: CalendarItem[] = []

    // Add tours
    tours.forEach(tour => {
      if (tour.startDate) {
        items.push({
          id: `tour-${tour.id}`,
          title: tour.name,
          type: 'tour',
          date: new Date(tour.startDate),
          startTime: tour.startTime,
          endTime: tour.endTime,
          location: tour.venues?.[0]?.name || 'TBD',
          status: tour.status,
          attendees: tour.totalCapacity,
          revenue: tour.totalRevenue,
          color: 'bg-purple-500',
          description: tour.description,
          tags: ['Tour', tour.status]
        })
      }
    })

    // Add events
    events.forEach(event => {
      if (event.date) {
        items.push({
          id: `event-${event.id}`,
          title: event.name,
          type: 'event',
          date: new Date(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.venueName || 'TBD',
          status: event.status,
          attendees: event.capacity,
          revenue: event.expectedRevenue,
          color: 'bg-blue-500',
          description: event.description,
          tags: ['Event', event.status]
        })
      }
    })

    // Add sample tasks (you can replace with real task data)
    const sampleTasks = [
      {
        id: 'task-1',
        title: 'Review tour contracts',
        type: 'task' as const,
        date: new Date(),
        status: 'pending' as const,
        priority: 'high' as const,
        color: 'bg-orange-500',
        tags: ['Task', 'High Priority']
      },
      {
        id: 'task-2',
        title: 'Update event marketing materials',
        type: 'task' as const,
        date: addDays(new Date(), 2),
        status: 'pending' as const,
        priority: 'medium' as const,
        color: 'bg-yellow-500',
        tags: ['Task', 'Marketing']
      },
      {
        id: 'task-3',
        title: 'Finalize venue bookings',
        type: 'task' as const,
        date: addDays(new Date(), 5),
        status: 'pending' as const,
        priority: 'urgent' as const,
        color: 'bg-red-500',
        tags: ['Task', 'Urgent']
      },
      {
        id: 'task-4',
        title: 'Band rehearsal',
        type: 'meeting' as const,
        date: addDays(new Date(), 1),
        status: 'confirmed' as const,
        priority: 'high' as const,
        color: 'bg-green-500',
        tags: ['Meeting', 'Band']
      },
      {
        id: 'task-5',
        title: 'Sound check',
        type: 'reminder' as const,
        date: addDays(new Date(), 3),
        status: 'scheduled' as const,
        priority: 'medium' as const,
        color: 'bg-blue-500',
        tags: ['Reminder', 'Technical']
      },
      {
        id: 'task-6',
        title: 'Merchandise inventory',
        type: 'task' as const,
        date: addDays(new Date(), 7),
        status: 'pending' as const,
        priority: 'low' as const,
        color: 'bg-purple-500',
        tags: ['Task', 'Inventory']
      }
    ]

    // Add sample events if no real events
    if (events.length === 0) {
      const sampleEvents = [
        {
          id: 'sample-event-1',
          title: 'Summer Music Festival',
          type: 'event' as const,
          date: addDays(new Date(), 10),
          startTime: '18:00',
          endTime: '23:00',
          location: 'Central Park',
          status: 'confirmed' as const,
          attendees: 5000,
          revenue: 75000,
          color: 'bg-blue-500',
          description: 'Annual summer music festival featuring local and national artists',
          tags: ['Event', 'Festival']
        },
        {
          id: 'sample-event-2',
          title: 'Jazz Night',
          type: 'event' as const,
          date: addDays(new Date(), 15),
          startTime: '20:00',
          endTime: '22:30',
          location: 'Blue Note Club',
          status: 'scheduled' as const,
          attendees: 200,
          revenue: 8000,
          color: 'bg-blue-500',
          description: 'Intimate jazz performance with local artists',
          tags: ['Event', 'Jazz']
        }
      ]
      items.push(...sampleEvents)
    }

    // Add sample tours if no real tours
    if (tours.length === 0) {
      const sampleTours = [
        {
          id: 'sample-tour-1',
          title: 'West Coast Tour',
          type: 'tour' as const,
          date: addDays(new Date(), 20),
          startTime: '19:30',
          endTime: '22:00',
          location: 'Multiple Cities',
          status: 'scheduled' as const,
          attendees: 1500,
          revenue: 45000,
          color: 'bg-purple-500',
          description: 'Multi-city tour across the west coast',
          tags: ['Tour', 'Multi-City']
        },
        {
          id: 'sample-tour-2',
          title: 'European Summer Tour',
          type: 'tour' as const,
          date: addDays(new Date(), 45),
          startTime: '20:00',
          endTime: '23:00',
          location: 'Europe',
          status: 'confirmed' as const,
          attendees: 3000,
          revenue: 120000,
          color: 'bg-purple-500',
          description: 'Summer tour across major European cities',
          tags: ['Tour', 'International']
        }
      ]
      items.push(...sampleTours)
    }

    return items.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [tours, events, tasks])

  // Get items for a specific date
  const getItemsForDate = useCallback((date: Date) => {
    return calendarItems.filter(item => isSameDay(item.date, date))
  }, [calendarItems])

  // Get month data
  const monthData = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    return days.map(day => ({
      date: day,
      items: getItemsForDate(day),
      isCurrentMonth: isSameMonth(day, currentDate),
      isToday: isToday(day)
    }))
  }, [currentDate, getItemsForDate])

  // Get week data
  const weekData = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start, end })

    return days.map(day => ({
      date: day,
      items: getItemsForDate(day),
      isCurrentWeek: true,
      isToday: isToday(day)
    }))
  }, [currentDate, getItemsForDate])

  // Navigation
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const goToToday = () => setCurrentDate(new Date())

  // Event handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedItem(null)
  }

  const handleItemClick = (item: CalendarItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedItem(item)
    onItemClick?.(item)
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'tour': return <Globe className="h-3 w-3" />
      case 'event': return <Music className="h-3 w-3" />
      case 'task': return <Target className="h-3 w-3" />
      case 'deadline': return <Clock className="h-3 w-3" />
      case 'meeting': return <Users className="h-3 w-3" />
      case 'reminder': return <AlertCircle className="h-3 w-3" />
      default: return <CalendarIcon className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'completed': return 'bg-green-600'
      case 'scheduled': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'overdue': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-slate-500'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500'
      case 'high': return 'border-orange-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-green-500'
      default: return 'border-slate-500'
    }
  }

  const renderMonthView = () => (
    <div className="space-y-4">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-slate-400 py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {monthData.map((dayData, index) => (
          <motion.div
            key={index}
            className={`
              min-h-[140px] p-2 border border-slate-700/50 rounded-lg cursor-pointer
              ${dayData.isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-900/30'}
              ${dayData.isToday ? 'ring-2 ring-blue-500' : ''}
              ${selectedDate && isSameDay(dayData.date, selectedDate) ? 'ring-2 ring-purple-500' : ''}
              hover:bg-slate-700/50 transition-colors
            `}
            onClick={() => handleDateClick(dayData.date)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Date Number */}
            <div className={`
              text-sm font-medium mb-2
              ${dayData.isCurrentMonth ? 'text-white' : 'text-slate-600'}
              ${dayData.isToday ? 'text-blue-400' : ''}
            `}>
              {format(dayData.date, 'd')}
            </div>

            {/* Items */}
            <div className="space-y-1">
              <AnimatePresence>
                {dayData.items.slice(0, 4).map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`
                      ${item.color} text-white text-xs p-1 rounded cursor-pointer
                      hover:opacity-80 transition-opacity border-l-2 ${getPriorityColor(item.priority)}
                    `}
                    onClick={(e) => handleItemClick(item, e)}
                  >
                    <div className="flex items-center space-x-1">
                      {getItemIcon(item.type)}
                      <span className="truncate">{item.title}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {dayData.items.length > 4 && (
                <div className="text-xs text-slate-400 text-center">
                  +{dayData.items.length - 4} more
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div className="space-y-4">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekData.map((dayData, index) => (
          <div key={index} className="text-center text-sm font-medium text-slate-400 py-3">
            <div>{format(dayData.date, 'EEE')}</div>
            <div className={`text-lg ${dayData.isToday ? 'text-blue-400' : 'text-white'}`}>
              {format(dayData.date, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1">
        {weekData.map((dayData, index) => (
          <motion.div
            key={index}
            className={`
              min-h-[200px] p-2 border border-slate-700/50 rounded-lg cursor-pointer
              ${dayData.isCurrentWeek ? 'bg-slate-800/50' : 'bg-slate-900/30'}
              ${dayData.isToday ? 'ring-2 ring-blue-500' : ''}
              ${selectedDate && isSameDay(dayData.date, selectedDate) ? 'ring-2 ring-purple-500' : ''}
              hover:bg-slate-700/50 transition-colors
            `}
            onClick={() => handleDateClick(dayData.date)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Items */}
            <div className="space-y-1">
              <AnimatePresence>
                {dayData.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`
                      ${item.color} text-white text-xs p-1 rounded cursor-pointer
                      hover:opacity-80 transition-opacity border-l-2 ${getPriorityColor(item.priority)}
                    `}
                    onClick={(e) => handleItemClick(item, e)}
                  >
                    <div className="flex items-center space-x-1">
                      {getItemIcon(item.type)}
                      <span className="truncate">{item.title}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Calendar</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-lg font-medium text-white">
            {format(currentDate, 'MMMM yyyy')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('month')}
            className={viewMode === 'month' ? 'bg-blue-600 text-white' : ''}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-blue-600 text-white' : ''}
          >
            Week
          </Button>
          <Button
            onClick={() => onAddItem?.('event')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="p-6">
          {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </CardContent>
      </Card>

      {/* Selected Date Items */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getItemsForDate(selectedDate).length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No items scheduled for this date</p>
                ) : (
                  <div className="space-y-3">
                    {getItemsForDate(selectedDate).map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-700/50"
                        onClick={() => handleItemClick(item, {} as React.MouseEvent)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${item.color}`}>
                            {getItemIcon(item.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{item.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              {item.startTime && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{item.startTime}</span>
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{item.location}</span>
                                </span>
                              )}
                              {item.attendees && (
                                <span className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{item.attendees}</span>
                                </span>
                              )}
                              {item.revenue && (
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>${item.revenue.toLocaleString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {item.status}
                          </Badge>
                          {item.priority && (
                            <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleItemClick(item, e)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Item Details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{selectedItem.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </Badge>
                    {selectedItem.priority && (
                      <Badge className={`text-xs ${getPriorityColor(selectedItem.priority)}`}>
                        {selectedItem.priority} priority
                      </Badge>
                    )}
                  </div>
                  
                  {selectedItem.description && (
                    <p className="text-slate-300">{selectedItem.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Date:</span>
                      <p className="text-white">{format(selectedItem.date, 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    {selectedItem.startTime && (
                      <div>
                        <span className="text-slate-400">Time:</span>
                        <p className="text-white">{selectedItem.startTime}</p>
                      </div>
                    )}
                    {selectedItem.location && (
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <p className="text-white">{selectedItem.location}</p>
                      </div>
                    )}
                    {selectedItem.attendees && (
                      <div>
                        <span className="text-slate-400">Attendees:</span>
                        <p className="text-white">{selectedItem.attendees}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => onAddItem?.(selectedItem.type)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 