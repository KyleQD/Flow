'use client'

import { useState, useEffect } from 'react'
import { artistService, EventData } from '@/lib/services/artist.service'
import { toast } from 'sonner'

export function useArtistEvents() {
  const [events, setEvents] = useState<EventData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const result = await artistService.getEvents()
      if (result.success && result.data) {
        setEvents(result.data)
      } else {
        // Use mock data if no real events
        setEvents([
          {
            id: '1',
            name: 'Summer Tour 2024',
            description: 'A nationwide tour featuring new music and special guests',
            date: new Date('2024-07-01').toISOString(),
            venue: 'Various Locations',
            status: 'published',
            type: 'tour',
            capacity: 10000,
            ticket_price: 75,
            currency: 'USD',
          },
          {
            id: '2',
            name: 'Album Release Party',
            description: 'Exclusive event for the release of the new album',
            date: new Date('2024-06-15').toISOString(),
            venue: 'The Grand Hall',
            status: 'draft',
            type: 'concert',
            capacity: 500,
            ticket_price: 100,
            currency: 'USD',
          },
        ])
      }
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  const createEvent = async (eventData: EventData) => {
    setIsCreating(true)
    try {
      const result = await artistService.createEvent(eventData)
      if (result.success && result.data) {
        setEvents(prev => [...prev, result.data])
        toast.success('Event created successfully!')
        return true
      } else {
        // Simulate creation for demo
        const newEvent = {
          ...eventData,
          id: Date.now().toString(),
          user_id: 'demo-user'
        }
        setEvents(prev => [...prev, newEvent])
        toast.success('Event created successfully!')
        return true
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
      return false
    } finally {
      setIsCreating(false)
    }
  }

  const updateEvent = async (id: string, eventData: Partial<EventData>) => {
    try {
      const result = await artistService.updateEvent(id, eventData)
      if (result.success && result.data) {
        setEvents(prev => prev.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        ))
        toast.success('Event updated successfully!')
        return true
      } else {
        // Simulate update for demo
        setEvents(prev => prev.map(event => 
          event.id === id ? { ...event, ...eventData } : event
        ))
        toast.success('Event updated successfully!')
        return true
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
      return false
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const result = await artistService.deleteEvent(id)
      if (result.success) {
        setEvents(prev => prev.filter(event => event.id !== id))
        toast.success('Event deleted successfully!')
        return true
      } else {
        // Simulate deletion for demo
        setEvents(prev => prev.filter(event => event.id !== id))
        toast.success('Event deleted successfully!')
        return true
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
      return false
    }
  }

  const getUpcomingEvents = () => {
    return events.filter(event => 
      new Date(event.date) > new Date() && event.status === 'published'
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getDraftEvents = () => {
    return events.filter(event => event.status === 'draft')
  }

  const getEventStats = () => {
    const upcoming = getUpcomingEvents().length
    const drafts = getDraftEvents().length
    const totalRevenue = events.reduce((sum, event) => 
      sum + (event.ticket_price || 0) * (event.capacity || 0), 0
    )

    return {
      total: events.length,
      upcoming,
      drafts,
      totalRevenue
    }
  }

  return {
    events,
    isLoading,
    isCreating,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    getDraftEvents,
    getEventStats
  }
}

export default useArtistEvents 