"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"

interface BookingCalendarProps {
  venueId: string
  onDateSelect: (date: Date) => void
  isOwner: boolean
}

export function BookingCalendar({ venueId, onDateSelect, isOwner }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Mock data for available/unavailable dates
  const bookedDates = [5, 12, 18, 25]
  const pendingDates = [8, 15, 22]

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(date)
    onDateSelect(date)
  }

  const renderCalendarDays = () => {
    const days = []
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Render day names
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="text-center text-xs font-medium text-gray-400 py-2">
          {dayNames[i]}
        </div>,
      )
    }

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isBooked = bookedDates.includes(day)
      const isPending = pendingDates.includes(day)
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear()

      days.push(
        <div
          key={`day-${day}`}
          className={`p-2 text-center relative ${
            isBooked ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-800"
          } ${isSelected ? "bg-purple-900/30 rounded-md" : ""}`}
          onClick={() => !isBooked && handleDateClick(day)}
        >
          <span
            className={`inline-block w-8 h-8 leading-8 rounded-full ${
              isBooked ? "bg-red-900/20 text-red-400" : isPending ? "bg-yellow-900/20 text-yellow-400" : ""
            }`}
          >
            {day}
          </span>
          {isBooked && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>
          )}
          {isPending && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"></span>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" /> Booking Calendar
          </CardTitle>
          <img src="/images/tourify-logo-white.png" alt="Tourify" className="h-6" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            Previous
          </Button>
          <h3 className="font-medium">
            {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Next
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-red-900/20 border border-red-400 rounded-full"></span>
              <span className="text-xs text-gray-400">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-yellow-900/20 border border-yellow-400 rounded-full"></span>
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-gray-800 border border-gray-600 rounded-full"></span>
              <span className="text-xs text-gray-400">Available</span>
            </div>
          </div>

          {selectedDate && (
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => onDateSelect(selectedDate)}>
              <Clock className="h-4 w-4 mr-2" /> Request This Date
            </Button>
          )}
        </div>

        {isOwner && (
          <div className="mt-6 border-t border-gray-800 pt-4">
            <h3 className="font-medium mb-2">Venue Owner Controls</h3>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Block Dates
              </Button>
              <Button variant="outline" className="flex-1">
                Set Availability
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
