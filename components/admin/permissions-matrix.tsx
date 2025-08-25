"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useRolesAndPermissions, useRolePermissions, usePermissionGuard } from '@/hooks/use-rbac'
import {
  Shield,
  Edit,
  Save,
  X,
  Check,
  Search,
  Filter,
  Eye,
  EyeOff,
  RotateCcw,
  AlertTriangle,
  Info,
  Crown,
  Users,
  Calendar,
  DollarSign,
  Truck,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react'
import type { 
  TourManagementRole, 
  TourManagementPermission,
  PERMISSION_CATEGORIES
} from '@/types/rbac'
import { PERMISSIONS } from '@/types/rbac'

interface PermissionMatrixProps {
  onPermissionChange?: (roleId: string, permissionId: string, granted: boolean) => void
}

export default function PermissionsMatrix({ onPermissionChange }: PermissionMatrixProps) {
  const { toast } = useToast()
  const { roles, permissions, loading, error, refreshData } = useRolesAndPermissions()
  const { isAllowed } = usePermissionGuard([PERMISSIONS.ADMIN_ROLES])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [tempPermissions, setTempPermissions] = useState<Record<string, boolean>>({})
  const [showSystemRoles, setShowSystemRoles] = useState(true)
  const [compactView, setCompactView] = useState(false)

  // Permission categories with icons
  const categoryIcons = {
    tour_management: Calendar,
    event_management: Calendar,
    staff_management: Users,
    financial_management: DollarSign,
    logistics_management: Truck,
    communications: MessageSquare,
    analytics: BarChart3,
    administration: Shield
  }

  // Filter permissions based on search and category
  const filteredPermissions = useMemo(() => {
    let filtered = permissions

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    return filtered
  }, [permissions, searchTerm, selectedCategory])

  // Filter roles
  const filteredRoles = useMemo(() => {
    let filtered = roles

    if (!showSystemRoles) {
      filtered = filtered.filter(r => !r.is_system_role)
    }

    return filtered
  }, [roles, showSystemRoles])

  // Group permissions by category for better organization
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, TourManagementPermission[]>)
  }, [filteredPermissions])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(permissions.map(p => p.category)))
    return [{ value: 'all', label: 'All Categories' }, ...cats.map(cat => ({
      value: cat,
      label: cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }))]
  }, [permissions])

  // Mock function to check if role has permission (would come from database)
  const roleHasPermission = (roleId: string, permissionId: string): boolean => {
    // In a real implementation, this would check the database
    // For now, using mock data based on role names
    const role = roles.find(r => r.id === roleId)
    if (!role) return false

    // Mock permission assignment logic
    if (role.name === 'super_admin') return true
    if (role.name === 'tour_manager') {
      return !permissions.find(p => p.id === permissionId)?.name.startsWith('admin.')
    }
    // Add more role-specific logic here
    return Math.random() > 0.5 // Mock random assignment
  }

  // Handle permission toggle
  const handlePermissionToggle = (roleId: string, permissionId: string, granted: boolean) => {
    if (editingRole !== roleId) return

    setTempPermissions(prev => ({
      ...prev,
      [`${roleId}:${permissionId}`]: granted
    }))

    onPermissionChange?.(roleId, permissionId, granted)
  }

  // Start editing role permissions
  const startEditing = (roleId: string) => {
    setEditingRole(roleId)
    // Initialize temp permissions with current state
    const currentPermissions: Record<string, boolean> = {}
    permissions.forEach(permission => {
      currentPermissions[`${roleId}:${permission.id}`] = roleHasPermission(roleId, permission.id)
    })
    setTempPermissions(currentPermissions)
  }

  // Save permission changes
  const savePermissions = async (roleId: string) => {
    try {
      // In a real implementation, save to database here
      toast({
        title: "Permissions Updated",
        description: "Role permissions have been updated successfully.",
      })
      setEditingRole(null)
      setTempPermissions({})
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingRole(null)
    setTempPermissions({})
  }

  // Get effective permission state
  const getPermissionState = (roleId: string, permissionId: string): boolean => {
    const tempKey = `${roleId}:${permissionId}`
    return editingRole === roleId 
      ? tempPermissions[tempKey] ?? roleHasPermission(roleId, permissionId)
      : roleHasPermission(roleId, permissionId)
  }

  // Get permission summary for a role
  const getPermissionSummary = (roleId: string) => {
    const total = permissions.length
    const granted = permissions.filter(p => getPermissionState(roleId, p.id)).length
    return { granted, total, percentage: Math.round((granted / total) * 100) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-600/20 bg-red-600/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-400">
          Failed to load permissions data: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!isAllowed) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to view the permissions matrix.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Permissions Matrix</h2>
          <p className="text-slate-400">Manage role permissions across the platform</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white rounded-md px-3 py-2 text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showSystemRoles}
              onCheckedChange={setShowSystemRoles}
            />
            <span className="text-sm text-slate-400">System Roles</span>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={compactView}
              onCheckedChange={setCompactView}
            />
            <span className="text-sm text-slate-400">Compact</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="border-slate-600"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
          <TabsTrigger value="grouped">Grouped View</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Matrix View */}
        <TabsContent value="matrix">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Permission Matrix</CardTitle>
              <CardDescription>
                Comprehensive view of all role permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header Row */}
                  <div className="grid grid-cols-[300px_repeat(auto-fit,minmax(120px,1fr))] gap-2 pb-2 border-b border-slate-700">
                    <div className="font-semibold text-slate-300 p-2">
                      Permission
                    </div>
                    {filteredRoles.map(role => (
                      <div key={role.id} className="text-center">
                        <div className="p-2">
                          <div className="font-medium text-white text-sm">
                            {role.display_name}
                          </div>
                          {!compactView && (
                            <div className="text-xs text-slate-400">
                              {getPermissionSummary(role.id).percentage}%
                            </div>
                          )}
                          {editingRole === role.id ? (
                            <div className="flex justify-center space-x-1 mt-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => savePermissions(role.id)}
                                className="h-6 w-6 p-0 text-green-400 hover:text-green-300"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(role.id)}
                              className="h-6 w-6 p-0 mt-1 text-slate-400 hover:text-white"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Permission Rows */}
                  <div className="space-y-1">
                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                      <div key={category}>
                        {!compactView && (
                          <div className="grid grid-cols-[300px_repeat(auto-fit,minmax(120px,1fr))] gap-2 py-2 bg-slate-900/30">
                            <div className="p-2">
                              <div className="flex items-center">
                                {React.createElement(categoryIcons[category as keyof typeof categoryIcons] || Shield, {
                                  className: "h-4 w-4 mr-2 text-purple-400"
                                })}
                                <span className="font-medium text-purple-400 text-sm">
                                  {category.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </span>
                              </div>
                            </div>
                            {filteredRoles.map(role => (
                              <div key={role.id} className="p-2"></div>
                            ))}
                          </div>
                        )}
                        
                        {categoryPermissions.map(permission => (
                          <div
                            key={permission.id}
                            className="grid grid-cols-[300px_repeat(auto-fit,minmax(120px,1fr))] gap-2 py-1 hover:bg-slate-800/30 transition-colors"
                          >
                            <div className="p-2">
                              <div className="font-medium text-white text-sm">
                                {permission.display_name}
                              </div>
                              {!compactView && (
                                <div className="text-xs text-slate-400 mt-1">
                                  {permission.description}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs mt-1">
                                {permission.name}
                              </Badge>
                            </div>
                            
                            {filteredRoles.map(role => {
                              const hasPermission = getPermissionState(role.id, permission.id)
                              const isEditing = editingRole === role.id
                              
                              return (
                                <div key={role.id} className="flex justify-center items-center p-2">
                                  {isEditing ? (
                                    <Switch
                                      checked={hasPermission}
                                      onCheckedChange={(checked) => 
                                        handlePermissionToggle(role.id, permission.id, checked)
                                      }

                                    />
                                  ) : (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      hasPermission 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-slate-700 text-slate-400'
                                    }`}>
                                      {hasPermission ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <X className="h-3 w-3" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grouped View */}
        <TabsContent value="grouped">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRoles.map(role => {
              const summary = getPermissionSummary(role.id)
              
              return (
                <Card key={role.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center">
                          <Crown className="h-5 w-5 mr-2 text-purple-400" />
                          {role.display_name}
                        </CardTitle>
                        <CardDescription>
                          {role.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-400">
                          {summary.percentage}%
                        </div>
                        <div className="text-xs text-slate-400">
                          {summary.granted}/{summary.total} permissions
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                        const categoryGranted = categoryPermissions.filter(p => 
                          getPermissionState(role.id, p.id)
                        ).length
                        
                        if (categoryGranted === 0) return null
                        
                        const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Shield
                        
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <IconComponent className="h-4 w-4 mr-2 text-purple-400" />
                                <span className="font-medium text-white text-sm">
                                  {category.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {categoryGranted}/{categoryPermissions.length}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {categoryPermissions
                                .filter(p => getPermissionState(role.id, p.id))
                                .map(permission => (
                                <div key={permission.id} className="flex items-center text-sm text-slate-300">
                                  <Check className="h-3 w-3 text-green-400 mr-2" />
                                  {permission.display_name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Summary View */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(1).map(category => {
              const categoryPermissions = permissions.filter(p => p.category === category.value)
              const IconComponent = categoryIcons[category.value as keyof typeof categoryIcons] || Shield
              
              return (
                <Card key={category.value} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center text-lg">
                      <IconComponent className="h-5 w-5 mr-2 text-purple-400" />
                      {category.label}
                    </CardTitle>
                    <CardDescription>
                      {categoryPermissions.length} permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredRoles.map(role => {
                        const grantedCount = categoryPermissions.filter(p => 
                          getPermissionState(role.id, p.id)
                        ).length
                        const percentage = Math.round((grantedCount / categoryPermissions.length) * 100)
                        
                        return (
                          <div key={role.id} className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">{role.display_name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// React import for JSX
import React from 'react' 