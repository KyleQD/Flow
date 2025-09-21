"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Ruler, 
  Square, 
  Circle, 
  Triangle,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  Plus,
  Calculator,
  MapPin,
  Shield,
  Accessibility,
  Flame,
  Route,
  Info
} from "lucide-react"
import { MapMeasurement } from "@/types/site-map"
import { useToast } from "@/hooks/use-toast"

interface MeasurementToolsProps {
  siteMapId: string
  measurements: MapMeasurement[]
  onMeasurementCreate: (measurement: Omit<MapMeasurement, 'id' | 'createdAt' | 'updatedAt'>) => void
  onMeasurementUpdate: (id: string, updates: Partial<MapMeasurement>) => void
  onMeasurementDelete: (id: string) => void
}

const MEASUREMENT_TYPES = [
  {
    value: 'distance',
    label: 'Distance',
    icon: Ruler,
    description: 'Measure distance between two points',
    color: '#3b82f6'
  },
  {
    value: 'area',
    label: 'Area',
    icon: Square,
    description: 'Calculate area of a region',
    color: '#10b981'
  },
  {
    value: 'clearance',
    label: 'Clearance',
    icon: Circle,
    description: 'Check clearance for equipment placement',
    color: '#f59e0b'
  },
  {
    value: 'fire_lane',
    label: 'Fire Lane',
    icon: Flame,
    description: 'Verify fire lane requirements',
    color: '#ef4444'
  },
  {
    value: 'ada_access',
    label: 'ADA Access',
    icon: Accessibility,
    description: 'Ensure ADA accessibility compliance',
    color: '#8b5cf6'
  },
  {
    value: 'emergency_route',
    label: 'Emergency Route',
    icon: Route,
    description: 'Mark emergency evacuation routes',
    color: '#f97316'
  }
]

const UNITS = [
  { value: 'meters', label: 'Meters', symbol: 'm' },
  { value: 'feet', label: 'Feet', symbol: 'ft' },
  { value: 'inches', label: 'Inches', symbol: 'in' },
  { value: 'centimeters', label: 'Centimeters', symbol: 'cm' },
  { value: 'yards', label: 'Yards', symbol: 'yd' }
]

const COMPLIANCE_RULES = {
  fire_lane: {
    minWidth: 3.66, // 12 feet in meters
    description: 'Fire lanes must be at least 12 feet wide'
  },
  ada_access: {
    minWidth: 0.91, // 36 inches in meters
    description: 'ADA accessible paths must be at least 36 inches wide'
  },
  clearance: {
    minDistance: 1.22, // 4 feet in meters
    description: 'Minimum clearance of 4 feet around equipment'
  }
}

export function MeasurementTools({ 
  siteMapId,
  measurements, 
  onMeasurementCreate, 
  onMeasurementUpdate, 
  onMeasurementDelete 
}: MeasurementToolsProps) {
  const { toast } = useToast()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<MapMeasurement | null>(null)
  const [newMeasurement, setNewMeasurement] = useState({
    measurementType: 'distance' as const,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    width: 0,
    height: 0,
    value: 0,
    unit: 'meters',
    label: '',
    color: '#3b82f6',
    isCompliant: true,
    complianceNotes: ''
  })

  const handleCreateMeasurement = () => {
    if (!newMeasurement.label.trim()) {
      toast({
        title: "Error",
        description: "Measurement label is required",
        variant: "destructive"
      })
      return
    }

    onMeasurementCreate({
      ...newMeasurement,
      siteMapId
    })

    setNewMeasurement({
      measurementType: 'distance',
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      width: 0,
      height: 0,
      value: 0,
      unit: 'meters',
      label: '',
      color: '#3b82f6',
      isCompliant: true,
      complianceNotes: ''
    })
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "Measurement created successfully"
    })
  }

  const handleUpdateMeasurement = (id: string, updates: Partial<MapMeasurement>) => {
    onMeasurementUpdate(id, updates)
    toast({
      title: "Success",
      description: "Measurement updated successfully"
    })
  }

  const handleDeleteMeasurement = (id: string) => {
    onMeasurementDelete(id)
    toast({
      title: "Success",
      description: "Measurement deleted successfully"
    })
  }

  const calculateCompliance = (measurement: MapMeasurement) => {
    const rule = COMPLIANCE_RULES[measurement.measurementType as keyof typeof COMPLIANCE_RULES]
    if (!rule) return { isCompliant: true, message: '' }

    let isCompliant = true
    let message = ''

    switch (measurement.measurementType) {
      case 'fire_lane':
        isCompliant = (measurement.value || 0) >= (rule as any).minWidth
        message = isCompliant 
          ? `Compliant: ${(measurement.value || 0).toFixed(2)}m >= ${(rule as any).minWidth}m`
          : `Non-compliant: ${(measurement.value || 0).toFixed(2)}m < ${(rule as any).minWidth}m`
        break
      case 'ada_access':
        isCompliant = (measurement.value || 0) >= (rule as any).minWidth
        message = isCompliant 
          ? `Compliant: ${(measurement.value || 0).toFixed(2)}m >= ${(rule as any).minWidth}m`
          : `Non-compliant: ${(measurement.value || 0).toFixed(2)}m < ${(rule as any).minWidth}m`
        break
      case 'clearance':
        isCompliant = (measurement.value || 0) >= (rule as any).minDistance
        message = isCompliant 
          ? `Compliant: ${(measurement.value || 0).toFixed(2)}m >= ${(rule as any).minDistance}m`
          : `Non-compliant: ${(measurement.value || 0).toFixed(2)}m < ${(rule as any).minDistance}m`
        break
    }

    return { isCompliant, message }
  }

  const getMeasurementTypeInfo = (type: string) => {
    return MEASUREMENT_TYPES.find(t => t.value === type) || MEASUREMENT_TYPES[0]
  }

  const getComplianceSummary = () => {
    const total = measurements.length
    const compliant = measurements.filter(m => m.isCompliant).length
    const nonCompliant = total - compliant
    
    return { total, compliant, nonCompliant }
  }

  const complianceSummary = getComplianceSummary()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Measurement Tools
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Measurement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="measurement-type">Measurement Type</Label>
                  <Select
                    value={newMeasurement.measurementType}
                    onValueChange={(value) => {
                      const typeInfo = MEASUREMENT_TYPES.find(t => t.value === value)
                      setNewMeasurement(prev => ({
                        ...prev,
                        measurementType: value as any,
                        color: typeInfo?.color || prev.color
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_TYPES.map((type) => {
                        const IconComponent = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" style={{ color: type.color }} />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getMeasurementTypeInfo(newMeasurement.measurementType).description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-x">Start X</Label>
                    <Input
                      id="start-x"
                      type="number"
                      value={newMeasurement.startX}
                      onChange={(e) => setNewMeasurement(prev => ({ 
                        ...prev, 
                        startX: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-y">Start Y</Label>
                    <Input
                      id="start-y"
                      type="number"
                      value={newMeasurement.startY}
                      onChange={(e) => setNewMeasurement(prev => ({ 
                        ...prev, 
                        startY: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="end-x">End X</Label>
                    <Input
                      id="end-x"
                      type="number"
                      value={newMeasurement.endX}
                      onChange={(e) => setNewMeasurement(prev => ({ 
                        ...prev, 
                        endX: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-y">End Y</Label>
                    <Input
                      id="end-y"
                      type="number"
                      value={newMeasurement.endY}
                      onChange={(e) => setNewMeasurement(prev => ({ 
                        ...prev, 
                        endY: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="measurement-value">Value</Label>
                    <Input
                      id="measurement-value"
                      type="number"
                      step="0.01"
                      value={newMeasurement.value}
                      onChange={(e) => setNewMeasurement(prev => ({ 
                        ...prev, 
                        value: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="measurement-unit">Unit</Label>
                    <Select
                      value={newMeasurement.unit}
                      onValueChange={(value) => setNewMeasurement(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label} ({unit.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="measurement-label">Label</Label>
                  <Input
                    id="measurement-label"
                    value={newMeasurement.label}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Enter measurement label"
                  />
                </div>
                
                <div>
                  <Label htmlFor="compliance-notes">Compliance Notes</Label>
                  <Textarea
                    id="compliance-notes"
                    value={newMeasurement.complianceNotes}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, complianceNotes: e.target.value }))}
                    placeholder="Enter compliance notes (optional)"
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-compliant"
                    checked={newMeasurement.isCompliant}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, isCompliant: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is-compliant">Mark as compliant</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMeasurement}>
                    Create Measurement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Compliance Summary */}
        {measurements.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{complianceSummary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{complianceSummary.compliant}</div>
              <div className="text-sm text-green-600">Compliant</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{complianceSummary.nonCompliant}</div>
              <div className="text-sm text-red-600">Non-compliant</div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {measurements.map((measurement) => {
            const typeInfo = getMeasurementTypeInfo(measurement.measurementType)
            const IconComponent = typeInfo.icon
            const compliance = calculateCompliance(measurement)
            
            return (
              <div key={measurement.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent 
                      className="h-5 w-5" 
                      style={{ color: typeInfo.color }} 
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{measurement.label}</h4>
                      <p className="text-sm text-gray-500">{typeInfo.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={measurement.isCompliant ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {measurement.isCompliant ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {measurement.isCompliant ? 'Compliant' : 'Non-compliant'}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMeasurement(measurement)}
                      title="Edit measurement"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMeasurement(measurement.id)}
                      title="Delete measurement"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium">
                      {measurement.value?.toFixed(2) || 'N/A'} {measurement.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-mono text-xs">
                      ({measurement.startX}, {measurement.startY}) → ({measurement.endX}, {measurement.endY})
                    </span>
                  </div>
                  
                  {compliance.message && (
                    <div className={`text-sm p-2 rounded ${
                      compliance.isCompliant 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {compliance.message}
                    </div>
                  )}
                  
                  {measurement.complianceNotes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {measurement.complianceNotes}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {measurements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Ruler className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No measurements created</h3>
              <p className="text-sm mb-4">
                Add measurements to verify spacing, compliance, and accessibility requirements
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Measurement
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
