"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Equipment } from "./event-operations"

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  status: z.enum(["available", "in_use", "maintenance"]),
  notes: z.string().optional(),
})

interface EquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Equipment, "id" | "event_id">) => void
  initialData?: Equipment
}

export function EquipmentModal({ isOpen, onClose, onSubmit, initialData }: EquipmentModalProps) {
  const form = useForm<z.infer<typeof equipmentSchema>>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      quantity: 1,
      status: "available",
      notes: "",
    },
  })

  const handleSubmit = (data: z.infer<typeof equipmentSchema>) => {
    onSubmit(data)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {initialData ? "Edit Equipment" : "Add Equipment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              className="bg-slate-800 border-slate-700 text-white"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-slate-300">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...form.register("quantity", { valueAsNumber: true })}
              className="bg-slate-800 border-slate-700 text-white"
            />
            {form.formState.errors.quantity && (
              <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-300">Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as any)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="available" className="text-white">Available</SelectItem>
                <SelectItem value="in_use" className="text-white">In Use</SelectItem>
                <SelectItem value="maintenance" className="text-white">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Any additional information about the equipment..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700">
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {initialData ? "Save Changes" : "Add Equipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 