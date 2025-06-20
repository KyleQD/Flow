"use client"

import { Pencil, Trash2 } from "lucide-react"
import type { Product } from "./types"

interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="bg-[#181b23] border border-gray-800 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{product.name}</div>
          <div className="text-gray-400 text-sm truncate">{product.description}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-purple-400 font-bold text-lg">${product.price.toFixed(2)}</span>
          <span className={`text-xs rounded px-2 py-0.5 ${product.status === "active" ? "bg-green-900 text-green-400" : "bg-gray-800 text-gray-400"}`}>{product.status}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={onEdit} className="p-2 rounded-lg bg-[#23232a] hover:bg-purple-600/80 text-purple-400 hover:text-white transition-colors" aria-label="Edit product">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg bg-[#23232a] hover:bg-red-600/80 text-red-400 hover:text-white transition-colors" aria-label="Delete product">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 