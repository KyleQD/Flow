"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TimePickerProps {
  time?: string
  onTimeChange?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  time,
  onTimeChange,
  placeholder = "Select time",
  className,
  disabled = false
}: TimePickerProps) {
  const [hours, setHours] = React.useState(time?.split(':')[0] || '12')
  const [minutes, setMinutes] = React.useState(time?.split(':')[1] || '00')
  const [period, setPeriod] = React.useState('AM')

  React.useEffect(() => {
    if (time) {
      const [h, m] = time.split(':')
      const hour24 = parseInt(h)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      setHours(hour12.toString().padStart(2, '0'))
      setMinutes(m)
      setPeriod(hour24 >= 12 ? 'PM' : 'AM')
    }
  }, [time])

  const handleTimeChange = () => {
    let hour24 = parseInt(hours)
    if (period === 'PM' && hour24 !== 12) hour24 += 12
    if (period === 'AM' && hour24 === 12) hour24 = 0
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minutes}`
    onTimeChange?.(timeString)
  }

  const formatDisplayTime = () => {
    if (!time) return placeholder
    const [h, m] = time.split(':')
    const hour24 = parseInt(h)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const period = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${m} ${period}`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
            !time && "text-slate-400",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {/* Hours */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Hour</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={hours}
                onChange={(e) => setHours(e.target.value.padStart(2, '0'))}
                className="bg-slate-700 border-slate-600 text-white text-center"
              />
            </div>
            
            {/* Minutes */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Min</label>
              <Input
                type="number"
                min="0"
                max="59"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value.padStart(2, '0'))}
                className="bg-slate-700 border-slate-600 text-white text-center"
              />
            </div>
            
            {/* AM/PM */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Period</label>
              <div className="flex rounded border border-slate-600 bg-slate-700">
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={cn(
                    "flex-1 px-2 py-1 text-xs rounded-l",
                    period === 'AM' ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-600"
                  )}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={cn(
                    "flex-1 px-2 py-1 text-xs rounded-r",
                    period === 'PM' ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-600"
                  )}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleTimeChange}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            Set Time
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 