"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, Trash2, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Album {
  id: string
  title: string
  description: string
  event?: string
  isPublic: boolean
  images: string[]
  createdAt: string
  updatedAt: string
}

interface AlbumDetailDialogProps {
  open: boolean
  album: Album | null
  onClose: () => void
}

export default function AlbumDetailDialog({ open, album, onClose }: AlbumDetailDialogProps) {
  const [editMode, setEditMode] = React.useState(false)
  const [images, setImages] = React.useState<string[]>([])
  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const [zoomedImg, setZoomedImg] = React.useState<string | null>(null)
  const [selectedImages, setSelectedImages] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    if (album) {
      setImages(album.images)
      setSelectedIdx(0)
      setSelectedImages(new Set())
    }
    setEditMode(false)
    setZoomedImg(null)
  }, [album])

  const handleImageSelect = (idx: number) => {
    setSelectedImages((prev: Set<number>) => {
      const newSet = new Set(prev)
      if (newSet.has(idx)) {
        newSet.delete(idx)
      } else {
        newSet.add(idx)
      }
      return newSet
    })
  }

  const handleBatchDelete = () => {
    setImages((prev: string[]) => prev.filter((_: string, idx: number) => !selectedImages.has(idx)))
    setSelectedImages(new Set())
    if (selectedImages.has(selectedIdx)) {
      setSelectedIdx(0)
    }
  }

  const handleBatchDownload = async () => {
    try {
      for (const idx of selectedImages) {
        const response = await fetch(images[idx])
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `image-${idx + 1}.jpg`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading images:', error)
    }
  }

  function handleDelete(idx: number) {
    setImages((imgs: string[]) => imgs.filter((_, i) => i !== idx))
    if (selectedIdx >= images.length - 1 && selectedIdx > 0) setSelectedIdx(selectedIdx - 1)
  }

  function handleReorder(from: number, to: number) {
    setImages((imgs: string[]) => {
      const arr = [...imgs]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return arr
    })
    setSelectedIdx(to)
  }

  function handleDragStart(e: React.DragEvent<HTMLImageElement>, idx: number) {
    e.dataTransfer.setData("fromIdx", idx.toString())
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, toIdx: number) {
    const fromIdx = Number(e.dataTransfer.getData("fromIdx"))
    if (!isNaN(fromIdx) && fromIdx !== toIdx) handleReorder(fromIdx, toIdx)
  }

  if (!album) return null
  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onClose() }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center justify-between">
            <span>{album.title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </DialogTitle>
        </DialogHeader>
        <div className="text-gray-400 mb-4">{album.description}</div>
        <div className="flex justify-between mb-2">
          <div />
          <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => setEditMode(e => !e)}>
            {editMode ? "Done" : "Edit"}
          </Button>
        </div>
        {/* Sticky action bar */}
        {editMode && selectedImages.size > 0 && (
          <div className="sticky top-0 z-10 bg-[#13151c] border-b border-gray-800 p-2 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{selectedImages.size} selected</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
        {/* Large selected image */}
        {images.length > 0 && (
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-full flex justify-center">
              <img
                src={images[selectedIdx]}
                alt={album.title}
                className="max-h-[50vh] rounded-lg object-contain cursor-zoom-in bg-black"
                style={{ width: 'auto', maxWidth: '100%' }}
                onClick={() => setZoomedImg(images[selectedIdx])}
              />
              {editMode && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    className="bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition"
                    onClick={e => { e.stopPropagation(); handleDelete(selectedIdx) }}
                    aria-label="Delete image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-4 overflow-x-auto w-full justify-center">
              {images.map((img: string, idx: number) => (
                <div
                  key={img}
                  className={`relative group border-2 rounded cursor-pointer ${idx === selectedIdx ? 'border-purple-500' : 'border-transparent'}`}
                  style={{ width: 64, height: 48 }}
                  draggable={editMode}
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, idx)}
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                  onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, idx)}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <img
                    src={img}
                    alt={album.title}
                    className="object-cover w-full h-full rounded"
                    style={{ opacity: editMode ? 0.7 : 1 }}
                  />
                  {editMode && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Checkbox
                        checked={selectedImages.has(idx)}
                        onCheckedChange={() => handleImageSelect(idx)}
                        className="absolute top-1 left-1 bg-black/60 rounded-full"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {zoomedImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setZoomedImg(null)}>
            <img src={zoomedImg} alt="Zoomed" className="max-h-[80vh] max-w-[90vw] rounded shadow-lg" />
            <button className="absolute top-8 right-8 text-white bg-black/60 rounded-full p-2" onClick={e => { e.stopPropagation(); setZoomedImg(null) }}>
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 