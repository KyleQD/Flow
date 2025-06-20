import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditEventModalProps {
  event: {
    id?: string | number
    title: string
    description: string
    date: Date
    startTime: string
    endTime: string
    status: string
    type?: string
    capacity?: number
    attendance?: number
  } | null
  onSave: (event: any) => void
  onClose: () => void
}

export function EditEventModal({ event, onSave, onClose }: EditEventModalProps) {
  const [form, setForm] = useState(() => event ? { ...event } : null)
  if (!form) return null

  function handleChange(field: string, value: any) {
    setForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Event Title"
          />
          <Input
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Description"
          />
          <Input
            type="date"
            value={form.date instanceof Date ? form.date.toISOString().slice(0, 10) : ''}
            onChange={e => handleChange('date', new Date(e.target.value))}
          />
          <Input
            type="time"
            value={form.startTime}
            onChange={e => handleChange('startTime', e.target.value)}
          />
          <Input
            type="time"
            value={form.endTime}
            onChange={e => handleChange('endTime', e.target.value)}
          />
          <Select value={form.status} onValueChange={status => handleChange('status', status)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 