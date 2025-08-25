import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { dataIsolationService } from '@/lib/services/data-isolation.service'
import type {
  Permission,
  Tour,
  TourEvent,
  DataIsolationContext
} from '@/types/rbac'

// Hook for data isolation context
export function useDataIsolation() {
  const { user } = useAuth()
  const [context, setContext] = useState<DataIsolationContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContext = useCallback(async () => {
    if (!user?.id) {
      setContext(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const isolationContext = await dataIsolationService.getIsolationContext(user.id)
      setContext(isolationContext)
    } catch (err) {
      console.error('Error loading data isolation context:', err)
      setError(err instanceof Error ? err.message : 'Failed to load isolation context')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadContext()
  }, [loadContext])

  const canAccessTour = useCallback(
    (tourId: string) => {
      return context?.accessibleTours.includes(tourId) ?? false
    },
    [context]
  )

  const canAccessResource = useCallback(
    async (resourceType: string, resourceId: string, permission: Permission) => {
      if (!user?.id) return false

      try {
        return await dataIsolationService.canAccessResource(
          user.id,
          resourceType,
          resourceId,
          permission
        )
      } catch (error) {
        console.error('Error checking resource access:', error)
        return false
      }
    },
    [user?.id]
  )

  const getAccessSummary = useCallback(async () => {
    if (!user?.id) return null

    try {
      return await dataIsolationService.getAccessSummary(user.id)
    } catch (error) {
      console.error('Error getting access summary:', error)
      return null
    }
  }, [user?.id])

  return {
    context,
    loading,
    error,
    canAccessTour,
    canAccessResource,
    getAccessSummary,
    refreshContext: loadContext
  }
}

// Hook for accessing filtered tours
export function useAccessibleTours() {
  const { user } = useAuth()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTours = useCallback(async () => {
    if (!user?.id) {
      setTours([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const accessibleTours = await dataIsolationService.getAccessibleTours(user.id)
      setTours(accessibleTours)
    } catch (err) {
      console.error('Error loading accessible tours:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tours')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadTours()
  }, [loadTours])

  const getTourById = useCallback(
    (tourId: string) => {
      return tours.find(tour => tour.id === tourId)
    },
    [tours]
  )

  const getActiveTours = useCallback(() => {
    return tours.filter(tour => tour.status === 'active')
  }, [tours])

  const getPlanningTours = useCallback(() => {
    return tours.filter(tour => tour.status === 'planning')
  }, [tours])

  return {
    tours,
    loading,
    error,
    getTourById,
    getActiveTours,
    getPlanningTours,
    refreshTours: loadTours
  }
}

// Hook for accessing filtered events
export function useAccessibleEvents(tourId?: string) {
  const { user } = useAuth()
  const [events, setEvents] = useState<TourEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    if (!user?.id) {
      setEvents([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const accessibleEvents = await dataIsolationService.getAccessibleEvents(user.id, tourId)
      setEvents(accessibleEvents)
    } catch (err) {
      console.error('Error loading accessible events:', err)
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [user?.id, tourId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const getEventById = useCallback(
    (eventId: string) => {
      return events.find(event => event.id === eventId)
    },
    [events]
  )

  const getUpcomingEvents = useCallback(() => {
    const now = new Date()
    return events.filter(event => new Date(event.event_date) >= now)
  }, [events])

  const getPastEvents = useCallback(() => {
    const now = new Date()
    return events.filter(event => new Date(event.event_date) < now)
  }, [events])

  const getEventsByStatus = useCallback(
    (status: TourEvent['status']) => {
      return events.filter(event => event.status === status)
    },
    [events]
  )

  return {
    events,
    loading,
    error,
    getEventById,
    getUpcomingEvents,
    getPastEvents,
    getEventsByStatus,
    refreshEvents: loadEvents
  }
}

// Hook for resource access validation
export function useResourceAccess() {
  const { user } = useAuth()

  const validateAccess = useCallback(
    async (resourceType: string, resourceId: string, permission: Permission) => {
      if (!user?.id) {
        return { allowed: false, reason: 'User not authenticated' }
      }

      try {
        const canAccess = await dataIsolationService.canAccessResource(
          user.id,
          resourceType,
          resourceId,
          permission
        )

        return {
          allowed: canAccess,
          reason: canAccess ? undefined : 'Access denied'
        }
      } catch (error) {
        console.error('Error validating access:', error)
        return {
          allowed: false,
          reason: error instanceof Error ? error.message : 'Validation error'
        }
      }
    },
    [user?.id]
  )

  const validateModification = useCallback(
    async (
      resourceType: string,
      resourceId: string,
      operation: 'create' | 'update' | 'delete'
    ) => {
      if (!user?.id) {
        return { allowed: false, reason: 'User not authenticated' }
      }

      try {
        return await dataIsolationService.validateModification(
          user.id,
          resourceType,
          resourceId,
          operation
        )
      } catch (error) {
        console.error('Error validating modification:', error)
        return {
          allowed: false,
          reason: error instanceof Error ? error.message : 'Validation error'
        }
      }
    },
    [user?.id]
  )

  return {
    validateAccess,
    validateModification
  }
}

// Hook for access summary
export function useAccessSummary() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    if (!user?.id) {
      setSummary(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const accessSummary = await dataIsolationService.getAccessSummary(user.id)
      setSummary(accessSummary)
    } catch (err) {
      console.error('Error loading access summary:', err)
      setError(err instanceof Error ? err.message : 'Failed to load access summary')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const accessPercentage = useMemo(() => {
    if (!summary) return 0
    if (summary.totalTours === 0) return 100
    return Math.round((summary.accessibleTours / summary.totalTours) * 100)
  }, [summary])

  const eventAccessPercentage = useMemo(() => {
    if (!summary) return 0
    if (summary.totalEvents === 0) return 100
    return Math.round((summary.accessibleEvents / summary.totalEvents) * 100)
  }, [summary])

  return {
    summary,
    loading,
    error,
    accessPercentage,
    eventAccessPercentage,
    refreshSummary: loadSummary
  }
}

// Hook for filtered data queries
export function useFilteredData<T>(
  table: string,
  resourceType: string,
  permission: Permission,
  dependencies: any[] = []
) {
  const { user } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const query = dataIsolationService.createFilteredQuery<T>(
        table,
        user.id,
        resourceType,
        permission
      )

      const result = await query.execute()
      setData(result)
    } catch (err) {
      console.error('Error loading filtered data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user?.id, table, resourceType, permission, ...dependencies])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    refresh: loadData
  }
}

// Component wrapper for data isolation
export function withDataIsolation<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[],
  fallbackComponent?: React.ComponentType<any>
): React.ComponentType<P> {
  return function DataIsolatedComponent(props: P) {
    const { context, loading, error } = useDataIsolation()
    const [hasAccess, setHasAccess] = useState(false)

    useEffect(() => {
      if (context) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          context.globalPermissions.includes(permission) ||
          Object.values(context.tourSpecificPermissions).some(permissions =>
            permissions.includes(permission)
          )
        )
        setHasAccess(hasAllPermissions)
      }
    }, [context])

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-red-400 p-4">
          Error loading permissions: {error}
        </div>
      )
    }

    if (!hasAccess) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent {...props} />
      }
      
      return (
        <div className="text-slate-400 p-4 text-center">
          You don't have permission to access this resource.
        </div>
      )
    }

    return <Component {...props} />
  }
}


