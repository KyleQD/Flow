"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { CanvasPosition, CanvasBounds, CanvasTransform, DragState, SelectionState, CanvasTool, ToolState } from "@/types/site-map"
import { SiteMap, SiteMapZone, GlampingTent, SiteMapElement, EquipmentCatalog, EquipmentInstance, PowerDistribution } from "@/types/site-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Move, 
  Square, 
  Home, 
  Zap, 
  Type, 
  Ruler, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Grid3X3,
  Layers,
  Settings,
  Save,
  Download,
  Upload,
  Users,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SiteMapCanvasProps {
  siteMap: SiteMap
  onUpdate: (updates: Partial<SiteMap>) => void
  onZoneCreate: (zone: Partial<SiteMapZone>) => void
  onZoneUpdate: (zoneId: string, updates: Partial<SiteMapZone>) => void
  onZoneDelete: (zoneId: string) => void
  onTentCreate: (tent: Partial<GlampingTent>) => void
  onTentUpdate: (tentId: string, updates: Partial<GlampingTent>) => void
  onTentDelete: (tentId: string) => void
  onElementCreate: (element: Partial<SiteMapElement>) => void
  onElementUpdate: (elementId: string, updates: Partial<SiteMapElement>) => void
  onElementDelete: (elementId: string) => void
  isReadOnly?: boolean
  showCollaborators?: boolean
  collaborators?: any[]
}

export function SiteMapCanvas({
  siteMap,
  onUpdate,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  onTentCreate,
  onTentUpdate,
  onTentDelete,
  onElementCreate,
  onElementUpdate,
  onElementDelete,
  isReadOnly = false,
  showCollaborators = false,
  collaborators = []
}: SiteMapCanvasProps) {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0
  })
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 }
  })
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedItems: [],
    selectionBox: undefined,
    isSelecting: false
  })
  const [toolState, setToolState] = useState<ToolState>({
    activeTool: 'select',
    toolOptions: {}
  })
  const [showGrid, setShowGrid] = useState(true)
  const [showLayers, setShowLayers] = useState(true)
  const [isPanning, setIsPanning] = useState(false)

  // Canvas dimensions
  const canvasWidth = siteMap.width
  const canvasHeight = siteMap.height

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - transform.translateX) / transform.scale
    const y = (e.clientY - rect.top - transform.translateY) / transform.scale

    if (toolState.activeTool === 'pan' || e.button === 1 || e.ctrlKey) {
      setIsPanning(true)
      setDragState({
        isDragging: true,
        startPosition: { x: e.clientX, y: e.clientY },
        currentPosition: { x: e.clientX, y: e.clientY },
        dragOffset: { x: transform.translateX, y: transform.translateY }
      })
      return
    }

    if (toolState.activeTool === 'select') {
      setSelectionState({
        selectedItems: [],
        selectionBox: { x, y, width: 0, height: 0 },
        isSelecting: true
      })
    }
  }, [transform, toolState.activeTool, isReadOnly])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    if (isPanning && dragState.isDragging) {
      const deltaX = e.clientX - dragState.startPosition.x
      const deltaY = e.clientY - dragState.startPosition.y
      
      setTransform(prev => ({
        ...prev,
        translateX: dragState.dragOffset.x + deltaX,
        translateY: dragState.dragOffset.y + deltaY
      }))
      return
    }

    if (selectionState.isSelecting && selectionState.selectionBox) {
      const x = (e.clientX - rect.left - transform.translateX) / transform.scale
      const y = (e.clientY - rect.top - transform.translateY) / transform.scale
      
      setSelectionState(prev => ({
        ...prev,
        selectionBox: {
          ...prev.selectionBox!,
          width: x - prev.selectionBox!.x,
          height: y - prev.selectionBox!.y
        }
      }))
    }
  }, [isPanning, dragState, selectionState, transform, isReadOnly])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return

    if (isPanning) {
      setIsPanning(false)
      setDragState(prev => ({ ...prev, isDragging: false }))
      return
    }

    if (selectionState.isSelecting && selectionState.selectionBox) {
      // Find items within selection box
      const selectedItems: string[] = []
      
      // Check zones
      siteMap.zones?.forEach(zone => {
        if (isItemInSelectionBox(zone, selectionState.selectionBox!)) {
          selectedItems.push(`zone-${zone.id}`)
        }
      })
      
      // Check tents
      siteMap.tents?.forEach(tent => {
        if (isItemInSelectionBox(tent, selectionState.selectionBox!)) {
          selectedItems.push(`tent-${tent.id}`)
        }
      })
      
      setSelectionState({
        selectedItems,
        selectionBox: undefined,
        isSelecting: false
      })
    }
  }, [isPanning, selectionState, siteMap.zones, siteMap.tents, isReadOnly])

  const isItemInSelectionBox = (item: any, box: CanvasBounds): boolean => {
    return !(item.x + item.width < box.x || 
             item.x > box.x + Math.abs(box.width) || 
             item.y + item.height < box.y || 
             item.y > box.y + Math.abs(box.height))
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, transform.scale * delta))
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const scaleChange = newScale / transform.scale
    
    setTransform(prev => ({
      scale: newScale,
      translateX: mouseX - (mouseX - prev.translateX) * scaleChange,
      translateY: mouseY - (mouseY - prev.translateY) * scaleChange
    }))
  }, [transform])

  const handleZoneClick = useCallback((zone: SiteMapZone, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isReadOnly) return

    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      setSelectionState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(`zone-${zone.id}`)
          ? prev.selectedItems.filter(id => id !== `zone-${zone.id}`)
          : [...prev.selectedItems, `zone-${zone.id}`]
      }))
    } else {
      // Single select
      setSelectionState({
        selectedItems: [`zone-${zone.id}`],
        selectionBox: undefined,
        isSelecting: false
      })
    }
  }, [isReadOnly])

  const handleTentClick = useCallback((tent: GlampingTent, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isReadOnly) return

    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      setSelectionState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(`tent-${tent.id}`)
          ? prev.selectedItems.filter(id => id !== `tent-${tent.id}`)
          : [...prev.selectedItems, `tent-${tent.id}`]
      }))
    } else {
      // Single select
      setSelectionState({
        selectedItems: [`tent-${tent.id}`],
        selectionBox: undefined,
        isSelecting: false
      })
    }
  }, [isReadOnly])

  const resetView = useCallback(() => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0
    })
  }, [])

  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(5, prev.scale * 1.2)
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, prev.scale * 0.8)
    }))
  }, [])

  const fitToView = useCallback(() => {
    if (!canvasRef.current) return

    const container = canvasRef.current.parentElement
    if (!container) return

    const containerWidth = container.clientWidth - 100
    const containerHeight = container.clientHeight - 100
    
    const scaleX = containerWidth / canvasWidth
    const scaleY = containerHeight / canvasHeight
    const newScale = Math.min(scaleX, scaleY, 1)
    
    const centerX = (containerWidth - canvasWidth * newScale) / 2
    const centerY = (containerHeight - canvasHeight * newScale) / 2
    
    setTransform({
      scale: newScale,
      translateX: centerX,
      translateY: centerY
    })
  }, [canvasWidth, canvasHeight])

  const renderGrid = () => {
    if (!showGrid || !siteMap.gridEnabled) return null

    const gridSize = siteMap.gridSize * transform.scale
    const offsetX = transform.translateX % gridSize
    const offsetY = transform.translateY % gridSize

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`
        }}
      />
    )
  }

  const renderZone = (zone: SiteMapZone) => {
    const isSelected = selectionState.selectedItems.includes(`zone-${zone.id}`)
    
    return (
      <div
        key={zone.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          left: zone.x * transform.scale + transform.translateX,
          top: zone.y * transform.scale + transform.translateY,
          width: zone.width * transform.scale,
          height: zone.height * transform.scale,
          backgroundColor: zone.color,
          borderColor: zone.borderColor,
          borderWidth: zone.borderWidth,
          opacity: zone.opacity,
          transform: `rotate(${zone.rotation}deg)`,
          transformOrigin: 'center'
        }}
        onClick={(e) => handleZoneClick(zone, e)}
        title={`${zone.name} (${zone.zoneType})`}
      >
        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white text-center p-1">
          <div>
            <div className="font-bold">{zone.name}</div>
            {zone.capacity && (
              <div className="text-xs opacity-75">
                {zone.currentOccupancy}/{zone.capacity}
              </div>
            )}
          </div>
        </div>
        
        {/* Zone amenities indicators */}
        <div className="absolute top-1 right-1 flex gap-1">
          {zone.powerAvailable && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Power Available" />
          )}
          {zone.waterAvailable && (
            <div className="w-2 h-2 bg-blue-400 rounded-full" title="Water Available" />
          )}
          {zone.internetAvailable && (
            <div className="w-2 h-2 bg-green-400 rounded-full" title="Internet Available" />
          )}
        </div>
      </div>
    )
  }

  const renderTent = (tent: GlampingTent) => {
    const isSelected = selectionState.selectedItems.includes(`tent-${tent.id}`)
    
    return (
      <div
        key={tent.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-green-500' : ''
        }`}
        style={{
          left: tent.x * transform.scale + transform.translateX,
          top: tent.y * transform.scale + transform.translateY,
          width: tent.width * transform.scale,
          height: tent.height * transform.scale,
          transform: `rotate(${tent.rotation}deg)`,
          transformOrigin: 'center'
        }}
        onClick={(e) => handleTentClick(tent, e)}
        title={`Tent ${tent.tentNumber} (${tent.tentType}) - ${tent.status}`}
      >
        <div 
          className="w-full h-full border-2 rounded-lg flex items-center justify-center text-xs font-medium text-center p-1"
          style={{
            backgroundColor: getTentColor(tent.status),
            borderColor: getTentBorderColor(tent.status)
          }}
        >
          <div>
            <div className="font-bold">{tent.tentNumber}</div>
            <div className="text-xs opacity-75">{tent.capacity}P</div>
            {tent.guestName && (
              <div className="text-xs opacity-75 truncate">{tent.guestName}</div>
            )}
          </div>
        </div>
        
        {/* Tent amenities indicators */}
        <div className="absolute top-1 right-1 flex gap-1">
          {tent.hasPower && (
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Power" />
          )}
          {tent.hasWifi && (
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" title="WiFi" />
          )}
          {tent.hasPrivateBathroom && (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" title="Private Bathroom" />
          )}
        </div>
      </div>
    )
  }

  const getTentColor = (status: string): string => {
    switch (status) {
      case 'available': return '#10b981'
      case 'occupied': return '#ef4444'
      case 'reserved': return '#f59e0b'
      case 'maintenance': return '#6b7280'
      default: return '#e5e7eb'
    }
  }

  const getTentBorderColor = (status: string): string => {
    switch (status) {
      case 'available': return '#059669'
      case 'occupied': return '#dc2626'
      case 'reserved': return '#d97706'
      case 'maintenance': return '#4b5563'
      default: return '#9ca3af'
    }
  }

  const renderSelectionBox = () => {
    if (!selectionState.selectionBox || !selectionState.isSelecting) return null

    const { x, y, width, height } = selectionState.selectionBox

    return (
      <div
        className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none"
        style={{
          left: x * transform.scale + transform.translateX,
          top: y * transform.scale + transform.translateY,
          width: Math.abs(width) * transform.scale,
          height: Math.abs(height) * transform.scale
        }}
      />
    )
  }

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-16 bg-gray-100 border-r flex flex-col items-center p-2 gap-2">
        <Button
          variant={toolState.activeTool === 'select' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setToolState({ ...toolState, activeTool: 'select' })}
          title="Select Tool"
        >
          <Move className="h-4 w-4" />
        </Button>
        
        <Button
          variant={toolState.activeTool === 'pan' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setToolState({ ...toolState, activeTool: 'pan' })}
          title="Pan Tool"
        >
          <Move className="h-4 w-4" />
        </Button>
        
        <Button
          variant={toolState.activeTool === 'zone' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setToolState({ ...toolState, activeTool: 'zone' })}
          title="Zone Tool"
          disabled={isReadOnly}
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <Button
          variant={toolState.activeTool === 'tent' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setToolState({ ...toolState, activeTool: 'tent' })}
          title="Tent Tool"
          disabled={isReadOnly}
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <div className="w-full h-px bg-gray-300 my-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={fitToView}
          title="Fit to View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <div className="w-full h-px bg-gray-300 my-2" />
        
        <Button
          variant={showGrid ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        
        <Button
          variant={showLayers ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
          title="Toggle Layers"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="h-12 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">{siteMap.name}</h3>
            <Badge variant="outline">{siteMap.status}</Badge>
            <span className="text-sm text-gray-500">
              {Math.round(transform.scale * 100)}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {showCollaborators && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            <Button variant="outline" size="sm" onClick={() => onUpdate({})}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-crosshair"
            style={{
              background: siteMap.backgroundColor,
              backgroundImage: siteMap.backgroundImageUrl ? `url(${siteMap.backgroundImageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          >
            {renderGrid()}
            
            {/* Zones */}
            {siteMap.zones?.map(renderZone)}
            
            {/* Tents */}
            {siteMap.tents?.map(renderTent)}
            
            {/* Selection Box */}
            {renderSelectionBox()}
            
            {/* Canvas Boundary */}
            <div
              className="absolute border-2 border-dashed border-gray-400 pointer-events-none"
              style={{
                left: transform.translateX,
                top: transform.translateY,
                width: canvasWidth * transform.scale,
                height: canvasHeight * transform.scale
              }}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-gray-100 border-t flex items-center justify-between px-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Zones: {siteMap.zones?.length || 0}</span>
            <span>Tents: {siteMap.tents?.length || 0}</span>
            <span>Selected: {selectionState.selectedItems.length}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>{canvasWidth} × {canvasHeight}px</span>
            <span>Scale: {siteMap.scale}m/px</span>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {showLayers && (
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h4 className="font-semibold">Layers & Properties</h4>
          </div>
          
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Selected Items */}
            {selectionState.selectedItems.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Selected Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectionState.selectedItems.map(itemId => {
                    const [type, id] = itemId.split('-')
                    const item = type === 'zone' 
                      ? siteMap.zones?.find(z => z.id === id)
                      : siteMap.tents?.find(t => t.id === id)
                    
                    if (!item) return null
                    
                    return (
                      <div key={itemId} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="font-medium">{type === 'zone' ? 'Zone' : 'Tent'}</div>
                        <div className="text-gray-600">
                          {type === 'zone' ? (item as SiteMapZone).name : `Tent ${(item as GlampingTent).tentNumber}`}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
            
            {/* Map Properties */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Map Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Dimensions</div>
                  <div className="text-gray-600">{canvasWidth} × {canvasHeight}px</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Scale</div>
                  <div className="text-gray-600">{siteMap.scale}m per pixel</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Status</div>
                  <Badge variant="outline" className="text-xs">{siteMap.status}</Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Total Zones</div>
                  <div className="text-gray-600">{siteMap.zones?.length || 0}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Total Tents</div>
                  <div className="text-gray-600">{siteMap.tents?.length || 0}</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Available Tents</div>
                  <div className="text-gray-600">
                    {siteMap.tents?.filter(t => t.status === 'available').length || 0}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Occupied Tents</div>
                  <div className="text-gray-600">
                    {siteMap.tents?.filter(t => t.status === 'occupied').length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
