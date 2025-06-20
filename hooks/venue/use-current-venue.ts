import { useState, useEffect } from 'react'

interface Venue {
  id: string
  venue_name: string
  description?: string
  user_id: string
}

export function useCurrentVenue() {
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // For now, return a placeholder venue
    // In a real implementation, this would fetch from Supabase
    setCurrentVenue({
      id: 'venue-1',
      venue_name: 'Sample Venue',
      description: 'A sample venue for testing',
      user_id: 'user-1'
    })
    setIsLoading(false)
  }, [])

  return {
    currentVenue,
    isLoading
  }
} 