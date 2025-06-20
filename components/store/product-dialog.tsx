"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { Product } from "./types"

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().min(0),
  inventory: z.coerce.number().min(0),
  status: z.enum(["active", "draft"])
})

type ProductForm = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product) => void
}

export default function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const isEdit = !!product
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: product || { name: "", description: "", price: 0, inventory: 0, status: "active" }
  })

  React.useEffect(() => {
    if (product) {
      reset(product)
    } else {
      reset({ name: "", description: "", price: 0, inventory: 0, status: "active" })
    }
  }, [product, reset])

  function onSubmit(data: ProductForm) {
    const now = new Date().toISOString()
    onSave({
      id: product?.id || Math.random().toString(36).slice(2),
      ...data,
      images: product?.images || [],
      createdAt: product?.createdAt || now,
      updatedAt: now
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Name</label>
            <Input {...register("name")} placeholder="Product name" />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name.message}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Description</label>
            <Input {...register("description")} placeholder="Description" />
            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description.message}</div>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white mb-1">Price</label>
              <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} placeholder="0.00" />
              {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price.message}</div>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-white mb-1">Inventory</label>
              <Input type="number" {...register("inventory", { valueAsNumber: true })} placeholder="0" />
              {errors.inventory && <div className="text-red-500 text-xs mt-1">{errors.inventory.message}</div>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Status</label>
            <select {...register("status")} className="w-full bg-[#23232a] text-white rounded p-2">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status.message}</div>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 