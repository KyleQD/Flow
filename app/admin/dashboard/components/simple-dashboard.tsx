"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SimpleDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [tours, setTours] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats
        const statsResponse = await fetch('/api/admin/dashboard/stats', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
          console.log('Stats loaded:', statsData.stats)
        } else {
          console.error('Stats API failed:', statsResponse.status)
        }

        // Fetch tours
        const toursResponse = await fetch('/api/admin/tours', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (toursResponse.ok) {
          const toursData = await toursResponse.json()
          setTours(toursData.tours || [])
          console.log('Tours loaded:', toursData.tours?.length || 0)
        } else {
          console.error('Tours API failed:', toursResponse.status)
        }

        // Fetch events
        const eventsResponse = await fetch('/api/admin/events', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData.events || [])
          console.log('Events loaded:', eventsData.events?.length || 0)
        } else {
          console.error('Events API failed:', eventsResponse.status)
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-900/50 border-red-700/50">
          <CardContent className="p-4">
            <p className="text-red-400">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Simple Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">{stats.totalTours || 0}</div>
              <p className="text-slate-400">Total Tours</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">{stats.totalEvents || 0}</div>
              <p className="text-slate-400">Total Events</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">${stats.totalRevenue || 0}</div>
              <p className="text-slate-400">Total Revenue</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">{stats.ticketsSold || 0}</div>
              <p className="text-slate-400">Tickets Sold</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tours */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Tours ({tours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <p className="text-slate-400">No tours found</p>
          ) : (
            <div className="space-y-2">
              {tours.slice(0, 5).map((tour) => (
                <div key={tour.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{tour.name}</p>
                    <p className="text-sm text-slate-400">
                      {tour.artists && tour.artists.length > 0 ? tour.artists[0].name : 'Unknown Artist'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{tour.status}</p>
                    <p className="text-xs text-slate-500">${tour.totalRevenue || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-slate-400">No events found</p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{event.name}</p>
                    <p className="text-sm text-slate-400">
                      {event.venueName || 'Unknown Venue'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{event.status}</p>
                    <p className="text-xs text-slate-500">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 