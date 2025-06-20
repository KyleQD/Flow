"use client"

import React from "react"
import ProductCard from "./product-card"
import ProductDialog from "./product-dialog"

import type { Product } from "./types"

const initialProducts: Product[] = []

export default function ProductGrid() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  function handleAdd() {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  function handleDelete(id: string) {
    setProducts(products => products.filter(p => p.id !== id))
  }

  function handleSave(product: Product) {
    setProducts(products => {
      const exists = products.some(p => p.id === product.id)
      if (exists) {
        return products.map(p => (p.id === product.id ? product : p))
      }
      return [...products, product]
    })
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => handleEdit(product)}
            onDelete={() => handleDelete(product.id)}
          />
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">No products yet. Click 'Add Product' to get started.</div>
        )}
      </div>
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleSave}
      />
    </div>
  )
} 