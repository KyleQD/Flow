"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Tour {
  id: string
  name: string
  status: string
  start_date: string
  end_date: string
  total_shows: number
  completed_shows: number
  revenue: number
}

interface Event {
  id: string
  name: string
  event_date: string
  status: string
  venue: {
    name: string
    address?: string
  }
  capacity: number
  tickets_sold: number
  revenue: number
}

interface TourEventContextType {
  tours: Tour[]
  events: Event[]
  loading: boolean
  error: string | null
  isFirstTimeUser: boolean
  hasData: boolean
  refetch: () => void
}

const TourEventContext = createContext<TourEventContextType | undefined>(undefined)

export function TourEventProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<Tour[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[TourEventProvider] Fetching tours and events...')

      // Fetch tours and events in parallel
      const [toursResponse, eventsResponse] = await Promise.all([
        fetch('/api/tours').catch(err => {
          console.log('[TourEventProvider] Tours fetch failed:', err)
          return { ok: false, json: async () => ({ tours: [] }) }
        }),
        fetch('/api/events').catch(err => {
          console.log('[TourEventProvider] Events fetch failed:', err)
          return { ok: false, json: async () => ({ events: [] }) }
        })
      ])

      // Handle tours response
      let toursData: Tour[] = []
      if (toursResponse.ok) {
        const toursResult = await toursResponse.json()
        toursData = toursResult.tours || []
        console.log('[TourEventProvider] Tours loaded:', toursData.length)
      } else {
        console.log('[TourEventProvider] Tours API failed, using empty array')
      }

      // Handle events response
      let eventsData: Event[] = []
      if (eventsResponse.ok) {
        const eventsResult = await eventsResponse.json()
        eventsData = eventsResult.events || []
        console.log('[TourEventProvider] Events loaded:', eventsData.length)
      } else {
        console.log('[TourEventProvider] Events API failed, using empty array')
      }

      setTours(toursData)
      setEvents(eventsData)
      
      // No error state - we always succeed with empty arrays if needed
      setError(null)

    } catch (err) {
      console.error('[TourEventProvider] Error fetching data:', err)
      // Even on error, don't show error state - just use empty data
      setTours([])
      setEvents([])
      setError(null) // Don't show errors, just empty states
    } finally {
      setLoading(false)
      setInitialLoadComplete(true)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Determine user state based on data
  const hasData = tours.length > 0 || events.length > 0
  const isFirstTimeUser = initialLoadComplete && !hasData

  const value: TourEventContextType = {
    tours,
    events,
    loading,
    error,
    isFirstTimeUser,
    hasData,
    refetch: fetchData
  }

  console.log('[TourEventProvider] State:', {
    tours: tours.length,
    events: events.length,
    loading,
    hasData,
    isFirstTimeUser,
    initialLoadComplete
  })

  return (
    <TourEventContext.Provider value={value}>
      {children}
    </TourEventContext.Provider>
  )
}

export function useTourEventContext() {
  const context = useContext(TourEventContext)
  if (context === undefined) {
    throw new Error('useTourEventContext must be used within a TourEventProvider')
  }
  return context
} 