import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Save, 
  Eye, 
  GripVertical,
  Plus,
  Settings,
  Palette,
  Layout,
  Calendar,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Copy,
  RotateCcw
} from "lucide-react"

interface TourCustomizerProps {
  tour: any
  onClose: () => void
  onTourUpdate: (updatedTour: any) => void
}

interface DraggableComponent {
  id: string
  type: 'info-card' | 'stats-card' | 'timeline' | 'location-list' | 'team-list' | 'custom-widget'
  title: string
  content: any
  position: { x: number; y: number }
  size: { width: number; height: number }
  style: {
    backgroundColor: string
    textColor: string
    borderColor: string
    borderRadius: number
  }
}

export function TourCustomizer({ tour, onClose, onTourUpdate }: TourCustomizerProps) {
  const [selectedTab, setSelectedTab] = React.useState<'layout' | 'components' | 'styling' | 'preview'>('layout')
  const [components, setComponents] = React.useState<DraggableComponent[]>([
    {
      id: 'tour-info',
      type: 'info-card',
      title: 'Tour Information',
      content: { name: tour.name, description: tour.description, dates: `${tour.startDate} - ${tour.endDate}` },
      position: { x: 20, y: 20 },
      size: { width: 300, height: 200 },
      style: {
        backgroundColor: 'slate-900/50',
        textColor: 'white',
        borderColor: 'purple-500/20',
        borderRadius: 12
      }
    },
    {
      id: 'tour-stats',
      type: 'stats-card',
      title: 'Tour Statistics',
      content: { 
        locations: tour.locations?.length || 0,
        events: tour.events?.length || 0,
        attendees: tour.numAttendees || 0,
        budget: tour.budget || 0
      },
      position: { x: 340, y: 20 },
      size: { width: 280, height: 180 },
      style: {
        backgroundColor: 'slate-900/50',
        textColor: 'white',
        borderColor: 'purple-500/20',
        borderRadius: 12
      }
    },
    {
      id: 'locations-list',
      type: 'location-list',
      title: 'Locations',
      content: tour.locations || [],
      position: { x: 20, y: 240 },
      size: { width: 300, height: 250 },
      style: {
        backgroundColor: 'slate-900/50',
        textColor: 'white',
        borderColor: 'purple-500/20',
        borderRadius: 12
      }
    }
  ])
  const [selectedComponent, setSelectedComponent] = React.useState<string | null>(null)
  const [draggedComponent, setDraggedComponent] = React.useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)

  const handleComponentDrag = (id: string, newPosition: { x: number; y: number }) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, position: newPosition } : comp
    ))
  }

  const handleComponentResize = (id: string, newSize: { width: number; height: number }) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, size: newSize } : comp
    ))
  }

  const handleComponentUpdate = (id: string, updates: Partial<DraggableComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ))
  }

  const addNewComponent = (type: DraggableComponent['type']) => {
    const newComponent: DraggableComponent = {
      id: `component-${Date.now()}`,
      type,
      title: `New ${type.replace('-', ' ')}`,
      content: {},
      position: { x: 100, y: 100 },
      size: { width: 280, height: 200 },
      style: {
        backgroundColor: 'slate-900/50',
        textColor: 'white',
        borderColor: 'purple-500/20',
        borderRadius: 12
      }
    }
    setComponents(prev => [...prev, newComponent])
  }

  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id))
    setSelectedComponent(null)
  }

  const duplicateComponent = (id: string) => {
    const component = components.find(c => c.id === id)
    if (component) {
      const duplicate = {
        ...component,
        id: `${component.id}-copy-${Date.now()}`,
        position: { x: component.position.x + 20, y: component.position.y + 20 }
      }
      setComponents(prev => [...prev, duplicate])
    }
  }

  const saveTourLayout = () => {
    const updatedTour = {
      ...tour,
      customLayout: {
        components,
        lastModified: new Date().toISOString()
      }
    }
    onTourUpdate(updatedTour)
    // Show success message
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
      
      <Card className="relative overflow-hidden rounded-3xl shadow-2xl bg-slate-950/98 backdrop-blur-xl border border-purple-500/20 w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-purple-500/20 bg-gradient-to-r from-slate-950/90 to-purple-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Layout className="h-8 w-8 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Tour Customizer</h2>
                <p className="text-slate-400">Customize {tour.name} dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="border-slate-600 text-slate-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? 'Exit Preview' : 'Preview'}
              </Button>
              <Button
                onClick={saveTourLayout}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
              <Button variant="ghost" onClick={onClose} className="text-slate-400">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          {!isPreviewMode && (
            <div className="flex items-center gap-2 mt-6">
              {[
                { id: 'layout', label: 'Layout', icon: Layout },
                { id: 'components', label: 'Components', icon: Plus },
                { id: 'styling', label: 'Styling', icon: Palette },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={selectedTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`
                      ${selectedTab === tab.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {!isPreviewMode && (
            <div className="w-80 border-r border-purple-500/20 bg-slate-900/30 p-6 overflow-y-auto">
              {selectedTab === 'layout' && <LayoutPanel />}
              {selectedTab === 'components' && (
                <ComponentsPanel 
                  onAddComponent={addNewComponent}
                  components={components}
                  selectedComponent={selectedComponent}
                  onSelectComponent={setSelectedComponent}
                  onUpdateComponent={handleComponentUpdate}
                  onDeleteComponent={deleteComponent}
                  onDuplicateComponent={duplicateComponent}
                />
              )}
              {selectedTab === 'styling' && (
                <StylingPanel 
                  selectedComponent={selectedComponent}
                  components={components}
                  onUpdateComponent={handleComponentUpdate}
                />
              )}
            </div>
          )}

          {/* Main Canvas */}
          <div className="flex-1 relative bg-slate-900/20 overflow-hidden">
            <DragCanvas 
              components={components}
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
              onDragComponent={handleComponentDrag}
              onResizeComponent={handleComponentResize}
              isPreviewMode={isPreviewMode}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

// Layout Panel Component
function LayoutPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Layout Tools</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
            <Layout className="h-4 w-4 mr-2" />
            Reset Layout
          </Button>
          <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
            <Copy className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
          <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300">
            <RotateCcw className="h-4 w-4 mr-2" />
            Undo Changes
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Grid Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Grid Size</label>
            <Select defaultValue="medium">
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (10px)</SelectItem>
                <SelectItem value="medium">Medium (20px)</SelectItem>
                <SelectItem value="large">Large (40px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

// Components Panel
function ComponentsPanel({ 
  onAddComponent, 
  components, 
  selectedComponent, 
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent 
}: {
  onAddComponent: (type: DraggableComponent['type']) => void
  components: DraggableComponent[]
  selectedComponent: string | null
  onSelectComponent: (id: string | null) => void
  onUpdateComponent: (id: string, updates: Partial<DraggableComponent>) => void
  onDeleteComponent: (id: string) => void
  onDuplicateComponent: (id: string) => void
}) {
  const componentTypes: { type: DraggableComponent['type']; label: string; icon: any }[] = [
    { type: 'info-card', label: 'Info Card', icon: Calendar },
    { type: 'stats-card', label: 'Stats Card', icon: Settings },
    { type: 'timeline', label: 'Timeline', icon: Calendar },
    { type: 'location-list', label: 'Location List', icon: MapPin },
    { type: 'team-list', label: 'Team List', icon: Users },
    { type: 'custom-widget', label: 'Custom Widget', icon: Plus },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Add Components</h3>
        <div className="grid grid-cols-2 gap-2">
          {componentTypes.map((type) => {
            const Icon = type.icon
            return (
              <Button
                key={type.type}
                variant="outline"
                onClick={() => onAddComponent(type.type)}
                className="h-20 flex-col border-slate-600 text-slate-300 hover:border-purple-500"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{type.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Components</h3>
        <div className="space-y-2">
          {components.map((component) => (
            <div
              key={component.id}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all
                ${selectedComponent === component.id 
                  ? 'border-purple-500 bg-purple-950/30' 
                  : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                }
              `}
              onClick={() => onSelectComponent(component.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-white">{component.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicateComponent(component.id)
                    }}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteComponent(component.id)
                    }}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {component.type.replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Styling Panel
function StylingPanel({
  selectedComponent,
  components,
  onUpdateComponent
}: {
  selectedComponent: string | null
  components: DraggableComponent[]
  onUpdateComponent: (id: string, updates: Partial<DraggableComponent>) => void
}) {
  const component = components.find(c => c.id === selectedComponent)

  if (!component) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400">
        <p>Select a component to edit its style</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Component Styling</h3>
        <p className="text-sm text-slate-400 mb-4">Editing: {component.title}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Title</label>
          <Input
            value={component.title}
            onChange={(e) => onUpdateComponent(component.id, { title: e.target.value })}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Background</label>
          <Select
            value={component.style.backgroundColor}
            onValueChange={(value) => 
              onUpdateComponent(component.id, { 
                style: { ...component.style, backgroundColor: value }
              })
            }
          >
            <SelectTrigger className="bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slate-900/50">Dark</SelectItem>
              <SelectItem value="purple-900/30">Purple</SelectItem>
              <SelectItem value="blue-900/30">Blue</SelectItem>
              <SelectItem value="green-900/30">Green</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Border Radius</label>
          <Input
            type="range"
            min="0"
            max="24"
            value={component.style.borderRadius}
            onChange={(e) => 
              onUpdateComponent(component.id, {
                style: { ...component.style, borderRadius: parseInt(e.target.value) }
              })
            }
            className="bg-slate-800 border-slate-600"
          />
          <div className="text-xs text-slate-400 mt-1">{component.style.borderRadius}px</div>
        </div>
      </div>
    </div>
  )
}

// Drag Canvas Component
function DragCanvas({
  components,
  selectedComponent,
  onSelectComponent,
  onDragComponent,
  onResizeComponent,
  isPreviewMode
}: {
  components: DraggableComponent[]
  selectedComponent: string | null
  onSelectComponent: (id: string | null) => void
  onDragComponent: (id: string, position: { x: number; y: number }) => void
  onResizeComponent: (id: string, size: { width: number; height: number }) => void
  isPreviewMode: boolean
}) {
  return (
    <div className="w-full h-full relative p-4">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Components */}
      <AnimatePresence>
        {components.map((component) => (
          <DraggableComponentCard
            key={component.id}
            component={component}
            isSelected={selectedComponent === component.id}
            isPreviewMode={isPreviewMode}
            onSelect={() => onSelectComponent(component.id)}
            onDrag={(position) => onDragComponent(component.id, position)}
            onResize={(size) => onResizeComponent(component.id, size)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Draggable Component Card
function DraggableComponentCard({
  component,
  isSelected,
  isPreviewMode,
  onSelect,
  onDrag,
  onResize
}: {
  component: DraggableComponent
  isSelected: boolean
  isPreviewMode: boolean
  onSelect: () => void
  onDrag: (position: { x: number; y: number }) => void
  onResize: (size: { width: number; height: number }) => void
}) {
  const [isDragging, setIsDragging] = React.useState(false)

  return (
    <motion.div
      className={`
        absolute cursor-pointer transition-all duration-200
        ${isSelected && !isPreviewMode ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}
        ${isDragging ? 'z-50' : 'z-10'}
      `}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
      }}
      drag={!isPreviewMode}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false)
        onDrag({
          x: component.position.x + info.offset.x,
          y: component.position.y + info.offset.y
        })
      }}
      onClick={onSelect}
      whileHover={!isPreviewMode ? { scale: 1.02 } : {}}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
    >
      <Card className={`
        w-full h-full overflow-hidden bg-${component.style.backgroundColor} 
        border border-${component.style.borderColor}
        ${!isPreviewMode ? 'hover:shadow-lg hover:shadow-purple-500/20' : ''}
      `}
      style={{ borderRadius: component.style.borderRadius }}
      >
        {!isPreviewMode && isSelected && (
          <div className="absolute top-2 right-2 z-20">
            <GripVertical className="h-4 w-4 text-purple-400" />
          </div>
        )}
        
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">{component.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="text-xs">
          <ComponentContent component={component} />
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Component Content Renderer
function ComponentContent({ component }: { component: DraggableComponent }) {
  switch (component.type) {
    case 'info-card':
      return (
        <div className="space-y-2 text-slate-300">
          <div>
            <div className="font-medium text-white">{component.content.name}</div>
            <div className="text-xs">{component.content.description}</div>
          </div>
          <div className="text-xs">{component.content.dates}</div>
        </div>
      )
    
    case 'stats-card':
      return (
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{component.content.locations}</div>
            <div className="text-xs">Locations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{component.content.events}</div>
            <div className="text-xs">Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{component.content.attendees?.toLocaleString()}</div>
            <div className="text-xs">Attendees</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">${component.content.budget?.toLocaleString()}</div>
            <div className="text-xs">Budget</div>
          </div>
        </div>
      )
    
    case 'location-list':
      return (
        <div className="space-y-1 text-slate-300">
          {component.content.slice(0, 3).map((location: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs">{location.name}</span>
              <Badge variant="secondary" className="text-xs bg-slate-700">
                {location.type}
              </Badge>
            </div>
          ))}
          {component.content.length > 3 && (
            <div className="text-xs text-slate-400">+{component.content.length - 3} more</div>
          )}
        </div>
      )
    
    default:
      return (
        <div className="text-slate-400 text-xs">
          {component.type.replace('-', ' ')} content
        </div>
      )
  }
} 