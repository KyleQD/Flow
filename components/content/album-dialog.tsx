"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

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

const albumSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  isPublic: z.boolean(),
  images: z.array(z.any()).min(1, "At least one photo required")
})

type AlbumForm = z.infer<typeof albumSchema>

interface AlbumDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  album: Album | null
  onSave: (album: Album) => void
}

export default function AlbumDialog({ open, onOpenChange, album, onSave }: AlbumDialogProps) {
  const isEdit = !!album
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }, reset } = useForm<AlbumForm>({
    resolver: zodResolver(albumSchema),
    defaultValues: album ? { ...album, images: album.images } : { title: "", description: "", isPublic: true, images: [] }
  })
  const images = watch("images") || []

  React.useEffect(() => {
    if (album) {
      reset({ ...album, images: album.images })
    } else {
      reset({ title: "", description: "", isPublic: true, images: [] })
    }
  }, [album, reset])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setValue("images", Array.from(e.target.files))
    }
  }

  function onSubmit(data: AlbumForm) {
    const now = new Date().toISOString()
    onSave({
      id: album?.id || Math.random().toString(36).slice(2),
      ...data,
      images: data.images.map((file: File) => URL.createObjectURL(file)),
      createdAt: album?.createdAt || now,
      updatedAt: now
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Album" : "Add Album"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Title</label>
            <Input {...register("title")} placeholder="Album title" />
            {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title.message}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Description</label>
            <Input {...register("description")} placeholder="Description" />
            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description.message}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Photos</label>
            <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {images.map((file: File, idx: number) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="w-16 h-16 object-cover rounded" />
                ))}
              </div>
            )}
            {errors.images && <div className="text-red-500 text-xs mt-1">{errors.images.message as string}</div>}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <input type="checkbox" {...register("isPublic")} className="accent-purple-500" />
              Public album
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Save Changes" : "Add Album"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 