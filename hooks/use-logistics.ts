import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import type { Transportation, Equipment, EquipmentAssignment } from '@/types/admin'

interface LogisticsData {
  transportation: Transportation[]
  equipment: Equipment[]
  assignments: EquipmentAssignment[]
  analytics: {
    transportCostsByType: Record<string, number>
    equipmentByCategory: Record<string, { total: number; available: number; value: number }>
    equipmentCondition: Record<string, number>
    totalTransportCost: number
    totalEquipmentValue: number
    recentAssignments: number
  }
}

interface UseLogisticsOptions {
  eventId?: string
  tourId?: string
  type?: 'transportation' | 'equipment' | 'assignments' | 'analytics'
  status?: string
  category?: string
  availability?: 'available' | 'assigned'
  limit?: number
  offset?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseLogisticsReturn {
  data: LogisticsData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTransportation: (data: Partial<Transportation>) => Promise<void>
  updateTransportation: (id: string, data: Partial<Transportation>) => Promise<void>
  createEquipment: (data: Partial<Equipment>) => Promise<void>
  updateEquipment: (id: string, data: Partial<Equipment>) => Promise<void>
  assignEquipment: (data: Partial<EquipmentAssignment>) => Promise<void>
  updateAssignment: (id: string, data: Partial<EquipmentAssignment>) => Promise<void>
}

export function useLogistics(options: UseLogisticsOptions = {}): UseLogisticsReturn {
  const { user } = useAuth()
  const [data, setData] = useState<LogisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    eventId,
    tourId,
    type = 'transportation',
    status,
    category,
    availability,
    limit = 50,
    offset = 0,
    autoRefresh = true,
    refreshInterval = 30000
  } = options

  const fetchLogisticsData = useCallback(async () => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        offset: offset.toString()
      })

      if (eventId) params.append('event_id', eventId)
      if (tourId) params.append('tour_id', tourId)
      if (status) params.append('status', status)
      if (category) params.append('category', category)
      if (availability) params.append('availability', availability)

      const response = await fetch(`/api/admin/logistics/test?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Transform the data based on type
      let transformedData: LogisticsData

      if (type === 'transportation') {
        transformedData = {
          transportation: result.transportation || [],
          equipment: [],
          assignments: [],
          analytics: {
            transportCostsByType: {},
            equipmentByCategory: {},
            equipmentCondition: {},
            totalTransportCost: 0,
            totalEquipmentValue: 0,
            recentAssignments: 0
          }
        }
      } else if (type === 'equipment') {
        transformedData = {
          transportation: [],
          equipment: result.equipment || [],
          assignments: [],
          analytics: {
            transportCostsByType: {},
            equipmentByCategory: {},
            equipmentCondition: {},
            totalTransportCost: 0,
            totalEquipmentValue: 0,
            recentAssignments: 0
          }
        }
      } else if (type === 'assignments') {
        transformedData = {
          transportation: [],
          equipment: [],
          assignments: result.assignments || [],
          analytics: {
            transportCostsByType: {},
            equipmentByCategory: {},
            equipmentCondition: {},
            totalTransportCost: 0,
            totalEquipmentValue: 0,
            recentAssignments: 0
          }
        }
      } else if (type === 'analytics') {
        transformedData = {
          transportation: [],
          equipment: [],
          assignments: [],
          analytics: result.analytics || {
            transportCostsByType: {},
            equipmentByCategory: {},
            equipmentCondition: {},
            totalTransportCost: 0,
            totalEquipmentValue: 0,
            recentAssignments: 0
          }
        }
      } else {
        // Fetch all data types
        const [transportationRes, equipmentRes, assignmentsRes, analyticsRes] = await Promise.all([
          fetch(`/api/admin/logistics/test?type=transportation&${params.toString()}`, {
            credentials: 'include'
          }),
          fetch(`/api/admin/logistics/test?type=equipment&${params.toString()}`, {
            credentials: 'include'
          }),
          fetch(`/api/admin/logistics/test?type=assignments&${params.toString()}`, {
            credentials: 'include'
          }),
          fetch(`/api/admin/logistics/test?type=analytics&${params.toString()}`, {
            credentials: 'include'
          })
        ])

        const [transportationData, equipmentData, assignmentsData, analyticsData] = await Promise.all([
          transportationRes.json(),
          equipmentRes.json(),
          assignmentsRes.json(),
          analyticsRes.json()
        ])

        transformedData = {
          transportation: transportationData.transportation || [],
          equipment: equipmentData.equipment || [],
          assignments: assignmentsData.assignments || [],
          analytics: analyticsData.analytics || {
            transportCostsByType: {},
            equipmentByCategory: {},
            equipmentCondition: {},
            totalTransportCost: 0,
            totalEquipmentValue: 0,
            recentAssignments: 0
          }
        }
      }

      setData(transformedData)
    } catch (err) {
      console.error('[useLogistics] Error fetching logistics data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch logistics data')
    } finally {
      setLoading(false)
    }
  }, [user, eventId, tourId, type, status, category, availability, limit, offset])

  // Create transportation record
  const createTransportation = useCallback(async (transportationData: Partial<Transportation>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/admin/logistics/test', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_transportation',
          ...transportationData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchLogisticsData() // Refresh data
    } catch (err) {
      console.error('[useLogistics] Error creating transportation:', err)
      throw err
    }
  }, [user, fetchLogisticsData])

  // Update transportation record
  const updateTransportation = useCallback(async (id: string, updateData: Partial<Transportation>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/admin/logistics/test', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          type: 'transportation',
          ...updateData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchLogisticsData() // Refresh data
    } catch (err) {
      console.error('[useLogistics] Error updating transportation:', err)
      throw err
    }
  }, [user, fetchLogisticsData])

  // Create equipment record
  const createEquipment = useCallback(async (equipmentData: Partial<Equipment>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/admin/logistics/test', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_equipment',
          ...equipmentData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchLogisticsData() // Refresh data
    } catch (err) {
      console.error('[useLogistics] Error creating equipment:', err)
      throw err
    }
  }, [user, fetchLogisticsData])

  // Update equipment record
  const updateEquipment = useCallback(async (id: string, updateData: Partial<Equipment>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/admin/logistics/test', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          type: 'equipment',
          ...updateData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchLogisticsData() // Refresh data
    } catch (err) {
      console.error('[useLogistics] Error updating equipment:', err)
      throw err
    }
  }, [user, fetchLogisticsData])

  // Assign equipment
  const assignEquipment = useCallback(async (assignmentData: Partial<EquipmentAssignment>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/admin/logistics/test', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'assign_equipment',
          ...assignmentData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchLogisticsData() // Refresh data
    } catch (err) {
      console.error('[useLogistics] Error assigning equipment:', err)
      throw err
    }
  }, [user, fetchLogisticsData])

  // Update assignment
  const updateAssignment = useCallback(async (id: string, updateData: Partial<EquipmentAssignment>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const response = await fetch('/api/admin/logistics/test', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          type: 'assignment',
          ...updateData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await fetchLogisticsData() // Refresh data
    } catch (err) {
      console.error('[useLogistics] Error updating assignment:', err)
      throw err
    }
  }, [user, fetchLogisticsData])

  // Initial fetch
  useEffect(() => {
    fetchLogisticsData()
  }, [fetchLogisticsData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchLogisticsData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchLogisticsData])

  return {
    data,
    loading,
    error,
    refetch: fetchLogisticsData,
    createTransportation,
    updateTransportation,
    createEquipment,
    updateEquipment,
    assignEquipment,
    updateAssignment
  }
}

// Specialized hooks for specific logistics types
export function useTransportation(options: Omit<UseLogisticsOptions, 'type'> = {}) {
  return useLogistics({ ...options, type: 'transportation' })
}

export function useEquipment(options: Omit<UseLogisticsOptions, 'type'> = {}) {
  return useLogistics({ ...options, type: 'equipment' })
}

export function useEquipmentAssignments(options: Omit<UseLogisticsOptions, 'type'> = {}) {
  return useLogistics({ ...options, type: 'assignments' })
}

export function useLogisticsAnalytics(options: Omit<UseLogisticsOptions, 'type'> = {}) {
  return useLogistics({ ...options, type: 'analytics' })
} 