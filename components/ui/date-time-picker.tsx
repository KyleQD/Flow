"use client"

import * as React from "react"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
}

export function DateTimePicker({ date, onDateChange }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>("12:00")

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeValue.split(":").map(Number)
      date.setHours(hours)
      date.setMinutes(minutes)
      setSelectedDate(date)
      onDateChange?.(date)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      setSelectedDate(newDate)
      onDateChange?.(newDate)
    }
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Select value={timeValue} onValueChange={handleTimeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, hour) => {
            return ["00", "30"].map((minute) => {
              const timeString = `${hour.toString().padStart(2, "0")}:${minute}`
              return (
                <SelectItem key={timeString} value={timeString}>
                  {timeString}
                </SelectItem>
              )
            })
          })}
        </SelectContent>
      </Select>
    </div>
  )
} 