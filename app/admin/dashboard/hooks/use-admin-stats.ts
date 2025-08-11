import { useState, useEffect } from 'react'

interface AdminStats {
  totalTours: number
  activeTours: number
  totalEvents: number
  upcomingEvents: number
  totalArtists: number
  totalVenues: number
  totalRevenue: number
  monthlyRevenue: number
  ticketsSold: number
  totalCapacity: number
  staffMembers: number
  completedTasks: number
  pendingTasks: number
  averageRating: number
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Use a default venue ID for the sidebar stats
        const venueId = 'mock-venue-id'
        
        const response = await fetch(`/api/admin/dashboard/stats?venue_id=${venueId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
        } else {
          throw new Error(data.error || 'Failed to fetch stats')
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Set fallback stats
        setStats({
          totalTours: 0,
          activeTours: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          totalArtists: 0,
          totalVenues: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          ticketsSold: 0,
          totalCapacity: 0,
          staffMembers: 0,
          completedTasks: 0,
          pendingTasks: 0,
          averageRating: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
} 