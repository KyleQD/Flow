"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  Zap,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  QrCode,
  Camera,
  FileText,
  Users,
  Activity
} from "lucide-react"
import { EquipmentCatalog, EquipmentInstance, PowerDistribution } from "@/types/site-map"
import { useToast } from "@/hooks/use-toast"

interface EquipmentInventoryManagerProps {
  vendorId: string
  onEquipmentSelect?: (equipment: EquipmentInstance) => void
}

interface InventoryStats {
  totalEquipment: number
  availableEquipment: number
  inUseEquipment: number
  maintenanceEquipment: number
  totalValue: number
  utilizationRate: number
}

interface EquipmentLocation {
  id: string
  name: string
  type: 'warehouse' | 'field' | 'service_center' | 'transport'
  address: string
  capacity: number
  currentCount: number
}

export function EquipmentInventoryManager({ vendorId, onEquipmentSelect }: EquipmentInventoryManagerProps) {
  const { toast } = useToast()
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    maintenanceEquipment: 0,
    totalValue: 0,
    utilizationRate: 0
  })
  const [equipmentInstances, setEquipmentInstances] = useState<EquipmentInstance[]>([])
  const [equipmentLocations, setEquipmentLocations] = useState<EquipmentLocation[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentInstance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Create form state
  const [createForm, setCreateForm] = useState({
    catalogId: '',
    serialNumber: '',
    assetTag: '',
    instanceName: '',
    location: '',
    status: 'available',
    assignedTo: '',
    rentalRate: 0,
    maintenanceNotes: ''
  })

  useEffect(() => {
    loadInventoryData()
  }, [vendorId])

  const loadInventoryData = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockStats: InventoryStats = {
        totalEquipment: 247,
        availableEquipment: 156,
        inUseEquipment: 78,
        maintenanceEquipment: 13,
        totalValue: 1250000,
        utilizationRate: 87.5
      }

      const mockEquipment: EquipmentInstance[] = [
        {
          id: '1',
          siteMapId: 'site-1',
          catalogId: 'cat-1',
          serialNumber: 'SPK-001-2024',
          assetTag: 'AT-001',
          instanceName: 'Main Stage Speaker Left',
          x: 100,
          y: 200,
          width: 40,
          height: 40,
          rotation: 0,
          status: 'in_use',
          assignedToUserId: 'user-1',
          assignedAt: new Date().toISOString(),
          connectedToNetwork: true,
          rentalStartDate: '2024-01-15',
          rentalEndDate: '2024-01-20',
          rentalRate: 150,
          customerName: 'Coachella Festival',
          customerContact: 'events@coachella.com',
          lastInspectionDate: '2024-01-10',
          nextInspectionDate: '2024-02-10',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          catalog: {
            id: 'cat-1',
            name: 'Professional Speaker System',
            category: 'sound',
            symbolType: 'rectangle',
            symbolColor: '#3b82f6',
            symbolSize: 40,
            iconName: 'volume-2',
            isPortable: true,
            requiresSetup: true,
            setupTimeMinutes: 30,
            requiresPower: true,
            requiresWater: false,
            requiresInternet: false,
            weatherResistant: true,
            availabilityStatus: 'available',
            dailyRate: 150,
            weeklyRate: 800,
            securityDeposit: 500,
            description: 'Professional grade speaker system for large events',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        {
          id: '2',
          siteMapId: 'site-2',
          catalogId: 'cat-2',
          serialNumber: 'LED-002-2024',
          assetTag: 'AT-002',
          instanceName: 'LED Stage Lighting Set',
          x: 150,
          y: 250,
          width: 50,
          height: 50,
          rotation: 0,
          status: 'available',
          connectedToNetwork: false,
          lastInspectionDate: '2024-01-08',
          nextInspectionDate: '2024-02-08',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          catalog: {
            id: 'cat-2',
            name: 'LED Stage Lighting',
            category: 'lighting',
            symbolType: 'circle',
            symbolColor: '#fbbf24',
            symbolSize: 30,
            iconName: 'sun',
            isPortable: true,
            requiresSetup: true,
            setupTimeMinutes: 45,
            requiresPower: true,
            requiresWater: false,
            requiresInternet: false,
            weatherResistant: false,
            availabilityStatus: 'available',
            dailyRate: 200,
            weeklyRate: 1200,
            securityDeposit: 800,
            description: 'High-quality LED stage lighting system',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ]

      const mockLocations: EquipmentLocation[] = [
        {
          id: 'loc-1',
          name: 'Main Warehouse',
          type: 'warehouse',
          address: '123 Equipment Drive, Los Angeles, CA',
          capacity: 500,
          currentCount: 156
        },
        {
          id: 'loc-2',
          name: 'Coachella Field Site',
          type: 'field',
          address: 'Empire Polo Club, Indio, CA',
          capacity: 200,
          currentCount: 78
        },
        {
          id: 'loc-3',
          name: 'Service Center',
          type: 'service_center',
          address: '456 Service Road, Burbank, CA',
          capacity: 50,
          currentCount: 13
        }
      ]

      setInventoryStats(mockStats)
      setEquipmentInstances(mockEquipment)
      setEquipmentLocations(mockLocations)
    } catch (error) {
      console.error('Error loading inventory data:', error)
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'in_use': return 'bg-blue-100 text-blue-800'
      case 'setup': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      case 'packed': return 'bg-gray-100 text-gray-800'
      case 'damaged': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />
      case 'in_use': return <Users className="h-4 w-4" />
      case 'setup': return <Settings className="h-4 w-4" />
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />
      case 'packed': return <Package className="h-4 w-4" />
      case 'damaged': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sound': return <Package className="h-4 w-4" />
      case 'lighting': return <Zap className="h-4 w-4" />
      case 'power': return <Zap className="h-4 w-4" />
      case 'tent': return <Package className="h-4 w-4" />
      case 'furniture': return <Package className="h-4 w-4" />
      case 'catering': return <Package className="h-4 w-4" />
      case 'security': return <Package className="h-4 w-4" />
      case 'transportation': return <Truck className="h-4 w-4" />
      case 'decor': return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const filteredEquipment = equipmentInstances.filter(equipment => {
    const matchesSearch = searchQuery === '' || 
      equipment.instanceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.assetTag?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || equipment.catalog?.category === categoryFilter
    const matchesLocation = locationFilter === 'all' // Add location matching logic
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation
  })

  const handleCreateEquipment = async () => {
    if (!createForm.catalogId.trim()) {
      toast({
        title: "Error",
        description: "Please select equipment catalog item",
        variant: "destructive"
      })
      return
    }

    try {
      // Create equipment instance logic here
      toast({
        title: "Success",
        description: "Equipment instance created successfully"
      })
      setShowCreateDialog(false)
      setCreateForm({
        catalogId: '',
        serialNumber: '',
        assetTag: '',
        instanceName: '',
        location: '',
        status: 'available',
        assignedTo: '',
        rentalRate: 0,
        maintenanceNotes: ''
      })
      loadInventoryData()
    } catch (error) {
      console.error('Error creating equipment:', error)
      toast({
        title: "Error",
        description: "Failed to create equipment instance",
        variant: "destructive"
      })
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select equipment items first",
        variant: "destructive"
      })
      return
    }

    try {
      // Handle bulk actions (update status, assign location, etc.)
      toast({
        title: "Success",
        description: `${action} applied to ${selectedItems.length} items`
      })
      setSelectedItems([])
      setShowBulkActions(false)
      loadInventoryData()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive"
      })
    }
  }

  const handleExportInventory = async () => {
    try {
      // Export logic here
      toast({
        title: "Success",
        description: "Inventory exported successfully"
      })
    } catch (error) {
      console.error('Error exporting inventory:', error)
      toast({
        title: "Error",
        description: "Failed to export inventory",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipment Inventory</h3>
          <p className="text-sm text-gray-600">
            Manage your equipment assets and track utilization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportInventory}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Equipment Instance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="catalogId">Equipment Type</Label>
                    <Select value={createForm.catalogId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, catalogId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cat-1">Professional Speaker System</SelectItem>
                        <SelectItem value="cat-2">LED Stage Lighting</SelectItem>
                        <SelectItem value="cat-3">Generator 500kW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={createForm.status} onValueChange={(value) => setCreateForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in_use">In Use</SelectItem>
                        <SelectItem value="setup">Setup</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={createForm.serialNumber}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assetTag">Asset Tag</Label>
                    <Input
                      id="assetTag"
                      value={createForm.assetTag}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, assetTag: e.target.value }))}
                      placeholder="Enter asset tag"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="instanceName">Instance Name</Label>
                  <Input
                    id="instanceName"
                    value={createForm.instanceName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, instanceName: e.target.value }))}
                    placeholder="Enter instance name"
                  />
                </div>
                <div>
                  <Label htmlFor="maintenanceNotes">Maintenance Notes</Label>
                  <Textarea
                    id="maintenanceNotes"
                    value={createForm.maintenanceNotes}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, maintenanceNotes: e.target.value }))}
                    placeholder="Enter maintenance notes"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEquipment}>
                    Add Equipment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold">{inventoryStats.totalEquipment}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{inventoryStats.availableEquipment}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Use</p>
                <p className="text-2xl font-bold text-blue-600">{inventoryStats.inUseEquipment}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryStats.maintenanceEquipment}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sound">Sound</SelectItem>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="tent">Tent</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Equipment Instances ({filteredEquipment.length})
            </CardTitle>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <Button variant="outline" size="sm" onClick={() => setShowBulkActions(true)}>
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEquipment.map((equipment) => (
              <div key={equipment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedItems.includes(equipment.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(prev => [...prev, equipment.id])
                      } else {
                        setSelectedItems(prev => prev.filter(id => id !== equipment.id))
                      }
                    }}
                  />
                  
                  <div className="flex items-center gap-3">
                    {equipment.catalog?.iconName && getCategoryIcon(equipment.catalog.category)}
                    <div>
                      <h4 className="font-medium">{equipment.instanceName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{equipment.catalog?.name}</span>
                        {equipment.serialNumber && (
                          <>
                            <span>•</span>
                            <span>SN: {equipment.serialNumber}</span>
                          </>
                        )}
                        {equipment.assetTag && (
                          <>
                            <span>•</span>
                            <span>Tag: {equipment.assetTag}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(equipment.status)}>
                    {equipment.status.replace('_', ' ')}
                  </Badge>
                  
                  {equipment.rentalRate && (
                    <div className="text-right">
                      <p className="text-sm font-medium">${equipment.rentalRate}/day</p>
                      {equipment.customerName && (
                        <p className="text-xs text-gray-600">{equipment.customerName}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEquipment(equipment)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Details Dialog */}
      {selectedEquipment && (
        <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedEquipment.catalog?.iconName && getCategoryIcon(selectedEquipment.catalog.category)}
                {selectedEquipment.instanceName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedEquipment.status)}>
                    {selectedEquipment.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium">Serial Number</Label>
                  <p className="text-sm">{selectedEquipment.serialNumber || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Asset Tag</Label>
                  <p className="text-sm">{selectedEquipment.assetTag || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-medium">Category</Label>
                  <p className="text-sm capitalize">{selectedEquipment.catalog?.category}</p>
                </div>
              </div>
              
              {selectedEquipment.customerName && (
                <div>
                  <Label className="font-medium">Current Rental</Label>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{selectedEquipment.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedEquipment.customerContact}</p>
                    <p className="text-sm text-gray-600">
                      {selectedEquipment.rentalStartDate} - {selectedEquipment.rentalEndDate}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="font-medium">Maintenance Schedule</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Last Inspection</p>
                    <p className="font-medium">{selectedEquipment.lastInspectionDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Inspection</p>
                    <p className="font-medium">{selectedEquipment.nextInspectionDate || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {selectedEquipment.maintenanceNotes && (
                <div>
                  <Label className="font-medium">Maintenance Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                    {selectedEquipment.maintenanceNotes}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
