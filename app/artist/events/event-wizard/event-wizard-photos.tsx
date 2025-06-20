"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  photos: z.array(z.any()).min(1, "At least one photo required")
})

export interface EventWizardPhotosData {
  photos: File[]
}

interface EventWizardPhotosProps {
  onNext: (data: EventWizardPhotosData) => void
  defaultValues?: Partial<EventWizardPhotosData>
}

export function EventWizardPhotos({ onNext, defaultValues }: EventWizardPhotosProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<EventWizardPhotosData>({
    resolver: zodResolver(schema),
    defaultValues
  })
  const photos = watch("photos") || []

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setValue("photos", Array.from(e.target.files))
    }
  }

  function onSubmit(data: EventWizardPhotosData) {
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((file, idx) => (
            <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="w-24 h-24 object-cover rounded" />
          ))}
        </div>
      )}
      {errors.photos && <div className="text-red-500 text-xs mt-1">{errors.photos.message as string}</div>}
      <Button type="submit" disabled={isSubmitting} className="w-full mt-2">Next</Button>
    </form>
  )
} 