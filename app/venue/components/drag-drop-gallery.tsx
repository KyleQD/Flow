"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Move } from "lucide-react"
import { ConfirmDialog } from "./confirm-dialog"

interface GalleryItem {
  id: string
  url: string
  alt: string
}

interface DragDropGalleryProps {
  items: GalleryItem[]
  onRemove: (id: string) => void
  onReorder: (newOrder: GalleryItem[]) => void
}

export function DragDropGallery({ items, onRemove, onReorder }: DragDropGalleryProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<string | null>(null)
  const { toast } = useToast()
  const dragCounter = useRef(0)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = "move"
    // Create a ghost image
    const img = new Image()
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault()
    if (draggedItem === id) return

    const draggedIndex = items.findIndex((item) => item.id === draggedItem)
    const hoverIndex = items.findIndex((item) => item.id === id)

    if (draggedIndex === -1 || hoverIndex === -1) return

    // Reorder the items
    const newItems = [...items]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(hoverIndex, 0, removed)

    onReorder(newItems)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    toast({
      title: "Gallery updated",
      description: "Your gallery items have been reordered.",
    })
  }

  const handleRemoveClick = (id: string) => {
    setItemToRemove(id)
    setShowConfirm(true)
  }

  const confirmRemove = () => {
    if (itemToRemove) {
      onRemove(itemToRemove)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current++
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDraggingOver(false)
    }
  }

  return (
    <>
      <div
        className={`grid grid-cols-3 gap-2 ${isDraggingOver ? "bg-gray-800/50 rounded-md" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragEnd={handleDragEnd}
            className={`aspect-square bg-gradient-to-br from-purple-800 to-black rounded-md flex items-center justify-center overflow-hidden relative group cursor-move ${
              draggedItem === item.id ? "opacity-50 border-2 border-purple-500" : ""
            }`}
          >
            <img src={item.url || "/placeholder.svg"} alt={item.alt} className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-red-500 p-1 h-auto"
                  onClick={() => handleRemoveClick(item.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <span className="text-xs text-white opacity-80 flex items-center">
                  <Move className="h-3 w-3 mr-1" /> Drag to reorder
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmRemove}
        title="Remove Media"
        description="Are you sure you want to remove this media from your gallery? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}
