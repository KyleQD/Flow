"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Truck, 
  Hotel, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3,
  DollarSign,
  Package,
  CheckCircle
} from "lucide-react"

interface LogisticsStepProps {
  tourData: {
    transportation: {
      type: string
      details: string
      cost: number
    }
    accommodation: {
      type: string
      details: string
      cost: number
    }
    equipment: Array<{
      id: string
      name: string
      quantity: number
      cost: number
    }>
  }
  updateTourData: (updates: any) => void
}

const transportationTypes = [
  "Tour Bus", "Van", "Car Rental", "Flight", "Train", "Private Jet", "Motorcycle"
]

const accommodationTypes = [
  "Hotel", "Motel", "Airbnb", "Tour Bus Bunks", "Camping", "Private Residence", "Backstage"
]

const equipmentCategories = [
  "Sound Equipment", "Lighting", "Instruments", "Stage Equipment", "Backline", "Cables", "Tools"
]

export function LogisticsStep({ tourData, updateTourData }: LogisticsStepProps) {
  const [isAddingEquipment, setIsAddingEquipment] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null)
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    quantity: 1,
    cost: 0
  })

  const handleTransportationChange = (field: string, value: string | number) => {
    updateTourData({
      transportation: { ...tourData.transportation, [field]: value }
    })
  }

  const handleAccommodationChange = (field: string, value: string | number) => {
    updateTourData({
      accommodation: { ...tourData.accommodation, [field]: value }
    })
  }

  const handleAddEquipment = () => {
    if (newEquipment.name) {
      const equipment = {
        id: Date.now().toString(),
        ...newEquipment
      }
      updateTourData({
        equipment: [...tourData.equipment, equipment]
      })
      setNewEquipment({ name: "", quantity: 1, cost: 0 })
      setIsAddingEquipment(false)
    }
  }

  const handleUpdateEquipment = (equipmentId: string, updates: any) => {
    const updatedEquipment = tourData.equipment.map(item =>
      item.id === equipmentId ? { ...item, ...updates } : item
    )
    updateTourData({ equipment: updatedEquipment })
    setEditingEquipment(null)
  }

  const handleRemoveEquipment = (equipmentId: string) => {
    const updatedEquipment = tourData.equipment.filter(item => item.id !== equipmentId)
    updateTourData({ equipment: updatedEquipment })
  }

  const totalLogisticsCost = 
    tourData.transportation.cost + 
    tourData.accommodation.cost + 
    tourData.equipment.reduce((sum, item) => sum + item.cost, 0)

  return (
    <div className="space-y-8">
      {/* Transportation */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Transportation</h3>
        </div>
        
        <Card className="p-6 bg-slate-900/30 border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Transportation Type</Label>
              <select
                value={tourData.transportation.type}
                onChange={(e) => handleTransportationChange("type", e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="">Select type...</option>
                {transportationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Cost ($)</Label>
              <Input
                type="number"
                placeholder="Enter cost..."
                value={tourData.transportation.cost}
                onChange={(e) => handleTransportationChange("cost", parseInt(e.target.value) || 0)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label className="text-white text-sm">Details</Label>
            <Textarea
              placeholder="Enter transportation details, requirements, or special arrangements..."
              value={tourData.transportation.details}
              onChange={(e) => handleTransportationChange("details", e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
            />
          </div>
        </Card>
      </div>

      {/* Accommodation */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Hotel className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Accommodation</h3>
        </div>
        
        <Card className="p-6 bg-slate-900/30 border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Accommodation Type</Label>
              <select
                value={tourData.accommodation.type}
                onChange={(e) => handleAccommodationChange("type", e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-md px-3 py-2"
              >
                <option value="">Select type...</option>
                {accommodationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm">Cost ($)</Label>
              <Input
                type="number"
                placeholder="Enter cost..."
                value={tourData.accommodation.cost}
                onChange={(e) => handleAccommodationChange("cost", parseInt(e.target.value) || 0)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label className="text-white text-sm">Details</Label>
            <Textarea
              placeholder="Enter accommodation details, requirements, or special arrangements..."
              value={tourData.accommodation.details}
              onChange={(e) => handleAccommodationChange("details", e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
            />
          </div>
        </Card>
      </div>

      {/* Equipment */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Equipment & Gear</h3>
          </div>
          <Button
            onClick={() => setIsAddingEquipment(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>

        {/* Add Equipment Form */}
        {isAddingEquipment && (
          <Card className="p-6 bg-slate-900/30 border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white text-sm">Equipment Name *</Label>
                <Input
                  placeholder="Enter equipment name..."
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-sm">Quantity</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={newEquipment.quantity}
                  onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white text-sm">Cost ($)</Label>
                <Input
                  type="number"
                  placeholder="Enter cost..."
                  value={newEquipment.cost}
                  onChange={(e) => setNewEquipment({ ...newEquipment, cost: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handleAddEquipment}
                disabled={!newEquipment.name}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Add Equipment
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingEquipment(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Equipment List */}
        <div className="space-y-3">
          {tourData.equipment.map((item) => (
            <Card key={item.id} className="p-4 bg-slate-900/30 border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      Qty: {item.quantity}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <DollarSign className="w-3 h-3" />
                    <span>${item.cost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEquipment(item.id)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEquipment(item.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Equipment Suggestions */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Common Equipment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipmentCategories.map((category) => (
              <Card
                key={category}
                className="p-3 bg-slate-900/30 border-slate-700 hover:border-purple-500/40 cursor-pointer transition-colors"
                onClick={() => {
                  setNewEquipment({
                    name: category,
                    quantity: 1,
                    cost: 0
                  })
                  setIsAddingEquipment(true)
                }}
              >
                <div className="space-y-1">
                  <div className="font-medium text-white">{category}</div>
                  <div className="text-sm text-slate-400">Click to add</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <Card className="p-6 bg-slate-900/30 border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h4 className="text-lg font-semibold text-white">Logistics Cost Summary</h4>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Transportation:</span>
            <span className="text-white">${tourData.transportation.cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Accommodation:</span>
            <span className="text-white">${tourData.accommodation.cost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Equipment:</span>
            <span className="text-white">${tourData.equipment.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-700 pt-3">
            <div className="flex justify-between font-semibold">
              <span className="text-white">Total Logistics Cost:</span>
              <span className="text-green-400">${totalLogisticsCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {!tourData.transportation.type && !tourData.accommodation.type && tourData.equipment.length === 0 && !isAddingEquipment && (
        <Card className="p-12 bg-slate-900/30 border-slate-700 border-dashed">
          <div className="text-center">
            <Truck className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Logistics Planned</h3>
            <p className="text-slate-400 mb-4">
              Plan transportation, accommodation, and equipment for your tour
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => handleTransportationChange("type", "Tour Bus")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Truck className="w-4 h-4 mr-2" />
                Add Transportation
              </Button>
              <Button
                onClick={() => handleAccommodationChange("type", "Hotel")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Hotel className="w-4 h-4 mr-2" />
                Add Accommodation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Status */}
      <div className="flex items-center space-x-2 text-sm">
        {tourData.transportation.type && tourData.accommodation.type ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Logistics planning completed</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
            <span className="text-slate-400">Complete transportation and accommodation to continue</span>
          </>
        )}
      </div>
    </div>
  )
} 