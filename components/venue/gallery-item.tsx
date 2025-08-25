"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Move, ZoomIn } from "lucide-react"
import { OptimizedImage } from "./optimized-image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface GalleryItemProps {
  id: string
  url: string
  alt: string
  onRemove: (id: string) => void
  isDragging: boolean
  dragHandleProps: any
}

export const GalleryItem = React.memo(function GalleryItem({
  id,
  url,
  alt,
  onRemove,
  isDragging,
  dragHandleProps,
}: GalleryItemProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <motion.div
        className={`aspect-square bg-gradient-to-br from-purple-800 to-black rounded-md flex items-center justify-center overflow-hidden relative group cursor-move ${
          isDragging ? "opacity-50 border-2 border-purple-500 z-10" : ""
        }`}
        whileHover={{ scale: 1.02 }}
        {...dragHandleProps}
      >
        <OptimizedImage src={url || "/placeholder.svg"} alt={alt} className="w-full h-full" objectFit="cover" />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex flex-col items-center space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-red-500 p-1 h-auto"
              onClick={() => onRemove(id)}
              aria-label="Remove image"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-blue-500 p-1 h-auto"
              onClick={() => setShowPreview(true)}
              aria-label="Preview image"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <span className="text-xs text-white opacity-80 flex items-center">
              <Move className="h-3 w-3 mr-1" /> Drag to reorder
            </span>
          </div>
        </div>
      </motion.div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl bg-black border-gray-800">
          <div className="w-full h-full flex items-center justify-center">
            <OptimizedImage src={url} alt={alt} className="max-h-[80vh] max-w-full" objectFit="contain" priority />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})
