"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Filter,
  X,
  Calendar as CalendarIcon,
  Music,
  Target,
  Users,
  AlertCircle,
  Ticket,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  Play,
  Star,
  Zap
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarFiltersProps {
  filters: {
    eventType: string
    status: string
    priority: string
    dateRange: { from: Date | null; to: Date | null }
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  eventSummary: {
    events: number
    tours: number
    tasks: number
    meetings: number
    deadlines: number
    bookings: number
    payments: number
    logistics: number
  }
}

const eventTypeOptions = [
  { value: 'all', label: 'All Types', icon: CalendarIcon },
  { value: 'event', label: 'Events', icon: CalendarIcon },
  { value: 'tour', label: 'Tours', icon: Music },
  { value: 'task', label: 'Tasks', icon: Target },
  { value: 'meeting', label: 'Meetings', icon: Users },
  { value: 'deadline', label: 'Deadlines', icon: AlertCircle },
  { value: 'booking', label: 'Bookings', icon: Ticket },
  { value: 'payment', label: 'Payments', icon: DollarSign },
  { value: 'logistics', label: 'Logistics', icon: Truck }
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

export function CalendarFilters({ filters, onFiltersChange, onClearFilters, eventSummary }: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const hasActiveFilters = filters.eventType !== 'all' || 
                          filters.status !== 'all' || 
                          filters.priority !== 'all' ||
                          filters.dateRange.from ||
                          filters.dateRange.to

  const getEventTypeIcon = (type: string) => {
    const option = eventTypeOptions.find(opt => opt.value === type)
    return option?.icon || CalendarIcon
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'ongoing': return <Play className="h-4 w-4" />
      case 'upcoming': return <Clock className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="h-4 w-4" />
      case 'high': return <Star className="h-4 w-4" />
      case 'medium': return <Target className="h-4 w-4" />
      case 'low': return <Clock className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Filter className="h-5 w-5 mr-2 text-purple-400" />
            Calendar Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-sm font-medium text-white">{eventSummary.events}</div>
            <div className="text-xs text-slate-400">Events</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-sm font-medium text-white">{eventSummary.tours}</div>
            <div className="text-xs text-slate-400">Tours</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-sm font-medium text-white">{eventSummary.tasks}</div>
            <div className="text-xs text-slate-400">Tasks</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-sm font-medium text-white">{eventSummary.deadlines}</div>
            <div className="text-xs text-slate-400">Deadlines</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Event Type Filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Event Type</label>
            <Select value={filters.eventType} onValueChange={(value) => handleFilterChange('eventType', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {eventTypeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {option.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    <div className="flex items-center">
                      {getStatusIcon(option.value)}
                      <span className="ml-2">{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Priority</label>
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    <div className="flex items-center">
                      {getPriorityIcon(option.value)}
                      <span className="ml-2">{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-slate-800 border-slate-600 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from || undefined}
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined,
                  }}
                  onSelect={(range) => handleFilterChange('dateRange', {
                    from: range?.from || null,
                    to: range?.to || null
                  })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
            <span className="text-sm text-slate-400">Active filters:</span>
            
            {filters.eventType !== 'all' && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Music className="h-3 w-3 mr-1" />
                {eventTypeOptions.find(opt => opt.value === filters.eventType)?.label}
              </Badge>
            )}
            
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {getStatusIcon(filters.status)}
                <span className="ml-1">{statusOptions.find(opt => opt.value === filters.status)?.label}</span>
              </Badge>
            )}
            
            {filters.priority !== 'all' && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                {getPriorityIcon(filters.priority)}
                <span className="ml-1">{priorityOptions.find(opt => opt.value === filters.priority)?.label}</span>
              </Badge>
            )}
            
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {filters.dateRange.from && format(filters.dateRange.from, "MMM dd")}
                {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 