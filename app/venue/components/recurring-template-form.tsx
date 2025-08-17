"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import venueService from "@/lib/services/venue.service"

interface Props {
  venueId: string
  onCreated?: () => void
}

export function RecurringTemplateForm({ venueId, onCreated }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [genre, setGenre] = useState<string | undefined>(undefined)
  const [weekday, setWeekday] = useState<number>(5)
  const [startTime, setStartTime] = useState("20:00")
  const [duration, setDuration] = useState(240)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState<string>("")

  async function submit() {
    try {
      await venueService.createRecurringTemplate({
        venueId,
        title,
        genre,
        weekday,
        startTime,
        durationMinutes: duration,
        startDate,
        endDate: endDate || undefined
      })
      toast({ title: "Recurring template created", description: `${title} saved` })
      onCreated?.()
    } catch (e: any) {
      toast({ title: "Failed to create template", description: e.message, variant: "destructive" })
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Create Recurring Event Template</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="EDM Night" />
        </div>
        <div className="space-y-2">
          <Label>Genre</Label>
          <Select value={genre} onValueChange={v => setGenre(v)}>
            <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="edm">EDM</SelectItem>
              <SelectItem value="reggae">Reggae</SelectItem>
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="hiphop">Hip-Hop</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Weekday</Label>
          <Select value={String(weekday)} onValueChange={v => setWeekday(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                <SelectItem key={i} value={String(i)}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Date (optional)</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Button onClick={submit} disabled={!title}>Save Template</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecurringTemplateForm


