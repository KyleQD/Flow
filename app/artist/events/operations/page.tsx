"use client"

import React, { useState, useEffect } from "react"
import { EventOperations } from "../components/event-operations"
import { StaffModal } from "../components/staff-modal"
import { TaskModal } from "../components/task-modal"
import { EquipmentModal } from "../components/equipment-modal"
import { useToast } from "@/components/ui/use-toast"
import { getEventStaff, addStaffMember, updateStaffMember, deleteStaffMember } from "../actions/manage-staff"
import { getEventTasks, addTask, updateTask, deleteTask } from "../actions/manage-tasks"
import { getEventEquipment, addEquipment, updateEquipment, deleteEquipment } from "../actions/manage-equipment"
import { StaffMember, Task, Equipment } from "../components/event-operations"

interface EventOperationsPageProps {
  eventId: string
}

export default function EventOperationsPage({ eventId }: EventOperationsPageProps) {
  const { toast } = useToast()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | undefined>()
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>()

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [staffData, tasksData, equipmentData] = await Promise.all([
        getEventStaff(eventId),
        getEventTasks(eventId),
        getEventEquipment(eventId)
      ])
      setStaff(staffData)
      setTasks(tasksData)
      setEquipment(equipmentData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load event operations data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async (data: Omit<StaffMember, "id" | "event_id">) => {
    try {
      const newStaff = await addStaffMember({ ...data, event_id: eventId })
      setStaff([...staff, newStaff])
      toast({
        title: "Success",
        description: "Staff member added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStaff = async (data: Omit<StaffMember, "id" | "event_id">) => {
    if (!selectedStaff) return
    try {
      const updatedStaff = await updateStaffMember(selectedStaff.id, data)
      setStaff(staff.map(s => s.id === updatedStaff.id ? updatedStaff : s))
      toast({
        title: "Success",
        description: "Staff member updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteStaffMember(id)
      setStaff(staff.filter(s => s.id !== id))
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      })
    }
  }

  const handleAddTask = async (data: Omit<Task, "id" | "event_id">) => {
    try {
      const newTask = await addTask({ ...data, event_id: eventId })
      setTasks([...tasks, newTask])
      toast({
        title: "Success",
        description: "Task added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (data: Omit<Task, "id" | "event_id">) => {
    if (!selectedTask) return
    try {
      const updatedTask = await updateTask(selectedTask.id, data)
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleAddEquipment = async (data: Omit<Equipment, "id" | "event_id">) => {
    try {
      const newEquipment = await addEquipment({ ...data, event_id: eventId })
      setEquipment([...equipment, newEquipment])
      toast({
        title: "Success",
        description: "Equipment added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add equipment",
        variant: "destructive",
      })
    }
  }

  const handleUpdateEquipment = async (data: Omit<Equipment, "id" | "event_id">) => {
    if (!selectedEquipment) return
    try {
      const updatedEquipment = await updateEquipment(selectedEquipment.id, data)
      setEquipment(equipment.map(e => e.id === updatedEquipment.id ? updatedEquipment : e))
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEquipment = async (id: string) => {
    try {
      await deleteEquipment(id)
      setEquipment(equipment.filter(e => e.id !== id))
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <EventOperations
        staff={staff}
        tasks={tasks}
        equipment={equipment}
        onAddStaff={() => {
          setSelectedStaff(undefined)
          setIsStaffModalOpen(true)
        }}
        onAddTask={() => {
          setSelectedTask(undefined)
          setIsTaskModalOpen(true)
        }}
        onAddEquipment={() => {
          setSelectedEquipment(undefined)
          setIsEquipmentModalOpen(true)
        }}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={selectedStaff ? handleUpdateStaff : handleAddStaff}
        initialData={selectedStaff}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={selectedTask ? handleUpdateTask : handleAddTask}
        initialData={selectedTask}
        staffMembers={staff.map(s => ({ id: s.id, name: s.name }))}
      />

      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSubmit={selectedEquipment ? handleUpdateEquipment : handleAddEquipment}
        initialData={selectedEquipment}
      />
    </div>
  )
} 