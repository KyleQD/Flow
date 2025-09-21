"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit3,
  Palette,
  Move,
  Settings,
  Building,
  Zap,
  Droplets,
  Wifi,
  Users,
  UserCheck,
  Shield,
  Star,
  AlertTriangle
} from "lucide-react"
import { MapLayer, DEFAULT_LAYERS } from "@/types/site-map"
import { useToast } from "@/hooks/use-toast"

interface LayerManagerProps {
  siteMapId: string
  layers: MapLayer[]
  onLayerCreate: (layer: Omit<MapLayer, 'id' | 'createdAt' | 'updatedAt'>) => void
  onLayerUpdate: (id: string, updates: Partial<MapLayer>) => void
  onLayerDelete: (id: string) => void
  onLayerReorder: (layers: MapLayer[]) => void
}

const LAYER_TYPES = [
  { value: 'infrastructure', label: 'Infrastructure', icon: Building, color: '#3b82f6' },
  { value: 'power', label: 'Power & Utilities', icon: Zap, color: '#f59e0b' },
  { value: 'water', label: 'Water', icon: Droplets, color: '#0ea5e9' },
  { value: 'wifi', label: 'WiFi', icon: Wifi, color: '#10b981' },
  { value: 'crew_zones', label: 'Crew Zones', icon: Users, color: '#10b981' },
  { value: 'guest_areas', label: 'Guest Areas', icon: UserCheck, color: '#8b5cf6' },
  { value: 'safety_zones', label: 'Safety Zones', icon: Shield, color: '#ef4444' },
  { value: 'vip_areas', label: 'VIP Areas', icon: Star, color: '#fbbf24' },
  { value: 'backstage', label: 'Backstage', icon: Building, color: '#6b7280' },
  { value: 'restricted', label: 'Restricted', icon: AlertTriangle, color: '#dc2626' },
  { value: 'custom', label: 'Custom', icon: Layers, color: '#6b7280' }
]

const PRESET_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#fbbf24',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6',
  '#0ea5e9', '#22c55e', '#eab308', '#f43f5e', '#a855f7', '#64748b'
]

export function LayerManager({ 
  siteMapId,
  layers, 
  onLayerCreate, 
  onLayerUpdate, 
  onLayerDelete, 
  onLayerReorder 
}: LayerManagerProps) {
  const { toast } = useToast()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingLayer, setEditingLayer] = useState<MapLayer | null>(null)
  const [newLayer, setNewLayer] = useState({
    name: '',
    description: '',
    layerType: 'custom' as const,
    color: '#3b82f6',
    opacity: 80,
    isVisible: true,
    isLocked: false,
    zIndex: 0
  })

  const handleCreateLayer = () => {
    if (!newLayer.name.trim()) {
      toast({
        title: "Error",
        description: "Layer name is required",
        variant: "destructive"
      })
      return
    }

    // Find the highest z-index and add 1
    const maxZIndex = Math.max(...layers.map(l => l.zIndex), 0)
    
    onLayerCreate({
      ...newLayer,
      siteMapId,
      opacity: newLayer.opacity / 100,
      zIndex: maxZIndex + 1
    })

    setNewLayer({
      name: '',
      description: '',
      layerType: 'custom',
      color: '#3b82f6',
      opacity: 80,
      isVisible: true,
      isLocked: false,
      zIndex: 0
    })
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "Layer created successfully"
    })
  }

  const handleUpdateLayer = (id: string, updates: Partial<MapLayer>) => {
    onLayerUpdate(id, updates)
    toast({
      title: "Success",
      description: "Layer updated successfully"
    })
  }

  const handleDeleteLayer = (id: string) => {
    onLayerDelete(id)
    toast({
      title: "Success",
      description: "Layer deleted successfully"
    })
  }

  const handleToggleVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id)
    if (layer) {
      handleUpdateLayer(id, { isVisible: !layer.isVisible })
    }
  }

  const handleToggleLock = (id: string) => {
    const layer = layers.find(l => l.id === id)
    if (layer) {
      handleUpdateLayer(id, { isLocked: !layer.isLocked })
    }
  }

  const handleOpacityChange = (id: string, opacity: number[]) => {
    handleUpdateLayer(id, { opacity: opacity[0] / 100 })
  }

  const handleZIndexChange = (id: string, direction: 'up' | 'down') => {
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex)
    const layerIndex = sortedLayers.findIndex(l => l.id === id)
    
    if (
      (direction === 'up' && layerIndex < sortedLayers.length - 1) ||
      (direction === 'down' && layerIndex > 0)
    ) {
      const targetIndex = direction === 'up' ? layerIndex + 1 : layerIndex - 1
      const targetLayer = sortedLayers[targetIndex]
      const currentLayer = sortedLayers[layerIndex]
      
      // Swap z-index values
      handleUpdateLayer(currentLayer.id, { zIndex: targetLayer.zIndex })
      handleUpdateLayer(targetLayer.id, { zIndex: currentLayer.zIndex })
    }
  }

  const handleApplyDefaults = () => {
    DEFAULT_LAYERS.forEach((defaultLayer, index) => {
      const existingLayer = layers.find(l => l.layerType === defaultLayer.layerType)
      if (!existingLayer) {
        onLayerCreate({
          ...defaultLayer,
          siteMapId,
          zIndex: layers.length + index + 1
        })
      }
    })

    toast({
      title: "Success",
      description: "Default layers applied successfully"
    })
  }

  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Layer Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleApplyDefaults}>
              Apply Defaults
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Layer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Layer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="layer-name">Name</Label>
                    <Input
                      id="layer-name"
                      value={newLayer.name}
                      onChange={(e) => setNewLayer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter layer name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="layer-description">Description</Label>
                    <Textarea
                      id="layer-description"
                      value={newLayer.description}
                      onChange={(e) => setNewLayer(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter layer description (optional)"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="layer-type">Type</Label>
                    <Select
                      value={newLayer.layerType}
                      onValueChange={(value) => {
                        const layerType = LAYER_TYPES.find(t => t.value === value)
                        setNewLayer(prev => ({
                          ...prev,
                          layerType: value as any,
                          color: layerType?.color || prev.color
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LAYER_TYPES.map((type) => {
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
                  </div>
                  
                  <div>
                    <Label>Color</Label>
                    <div className="grid grid-cols-8 gap-2 mt-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-md border-2 ${
                            newLayer.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewLayer(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Opacity: {newLayer.opacity}%</Label>
                    <Slider
                      value={[newLayer.opacity]}
                      onValueChange={(value) => setNewLayer(prev => ({ ...prev, opacity: value[0] }))}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="layer-visible"
                        checked={newLayer.isVisible}
                        onChange={(e) => setNewLayer(prev => ({ ...prev, isVisible: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="layer-visible">Visible</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="layer-locked"
                        checked={newLayer.isLocked}
                        onChange={(e) => setNewLayer(prev => ({ ...prev, isLocked: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="layer-locked">Locked</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateLayer}>
                      Create Layer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {sortedLayers.map((layer) => {
            const layerType = LAYER_TYPES.find(t => t.value === layer.layerType)
            const IconComponent = layerType?.icon || Layers
            
            return (
              <div key={layer.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent 
                      className="h-5 w-5" 
                      style={{ color: layer.color }} 
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{layer.name}</h4>
                      {layer.description && (
                        <p className="text-sm text-gray-500">{layer.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(layer.id)}
                      title={layer.isVisible ? "Hide layer" : "Show layer"}
                    >
                      {layer.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleLock(layer.id)}
                      title={layer.isLocked ? "Unlock layer" : "Lock layer"}
                    >
                      {layer.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLayer(layer)}
                      title="Edit layer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLayer(layer.id)}
                      title="Delete layer"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Opacity</span>
                    <span className="text-sm text-gray-900">{Math.round(layer.opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[layer.opacity * 100]}
                    onValueChange={(value) => handleOpacityChange(layer.id, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {layer.layerType}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ backgroundColor: layer.color, color: 'white' }}
                      >
                        Layer {layer.zIndex}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZIndexChange(layer.id, 'up')}
                        title="Move up"
                        disabled={layer.zIndex === Math.max(...layers.map(l => l.zIndex))}
                      >
                        <Move className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZIndexChange(layer.id, 'down')}
                        title="Move down"
                        disabled={layer.zIndex === Math.min(...layers.map(l => l.zIndex))}
                      >
                        <Move className="h-4 w-4 -rotate-90" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {layers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No layers created</h3>
              <p className="text-sm mb-4">
                Create your first layer to start organizing your site map elements
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Layer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
