"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar, MapPin, Users, DollarSign, Tag } from "lucide-react"
import { useFieldArray } from "react-hook-form"

const schema = z.object({
  title: z.string().min(2, "Event title is required").max(100, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  location: z.string().min(2, "Location required"),
  venue: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity required").max(100000, "Capacity too high"),
  price: z.coerce.number().min(0, "Price required").max(10000, "Price too high"),
  category: z.string().optional(),
  isPublic: z.boolean().default(true),
  coverImage: z.any().optional(),
  ticketTypes: z.array(z.object({
    name: z.string().min(1, "Ticket type name required"),
    price: z.coerce.number().min(0, "Price required"),
    quantity: z.coerce.number().min(1, "Quantity required"),
    description: z.string().optional()
  })).optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal(""))
  }).optional()
})

export interface EventWizardMainData {
  title: string
  description?: string
  startDate: string
  endDate: string
  location: string
  venue?: string
  capacity: number
  price: number
  category?: string
  isPublic: boolean
  coverImage?: File | null
  ticketTypes?: {
    name: string
    price: number
    quantity: number
    description?: string
  }[]
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    website?: string
  }
}

interface EventWizardMainProps {
  onNext: (data: EventWizardMainData) => void
  defaultValues?: Partial<EventWizardMainData>
}

function TicketTypesSection({ register, control, errors }: { register: any; control: any; errors: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "ticketTypes" })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">Ticket Types</h3>
        <Button type="button" variant="secondary" onClick={() => append({ name: "", price: 0, quantity: 0 })}>
          Add Ticket Type
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-lg">
          <div>
            <label className="block text-white mb-1">Name</label>
            <Input {...register(`ticketTypes.${index}.name`)} placeholder="e.g. General Admission" />
          </div>
          <div>
            <label className="block text-white mb-1">Price</label>
            <Input type="number" step="0.01" {...register(`ticketTypes.${index}.price`)} />
          </div>
          <div>
            <label className="block text-white mb-1">Quantity</label>
            <Input type="number" {...register(`ticketTypes.${index}.quantity`)} />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function SocialLinksSection({ register, errors }: { register: any; errors: any }) {
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Social Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-1">Facebook</label>
          <Input {...register("socialLinks.facebook")} placeholder="https://facebook.com/event" />
        </div>
        <div>
          <label className="block text-white mb-1">Twitter</label>
          <Input {...register("socialLinks.twitter")} placeholder="https://twitter.com/event" />
        </div>
        <div>
          <label className="block text-white mb-1">Instagram</label>
          <Input {...register("socialLinks.instagram")} placeholder="https://instagram.com/event" />
        </div>
        <div>
          <label className="block text-white mb-1">Website</label>
          <Input {...register("socialLinks.website")} placeholder="https://event-website.com" />
        </div>
      </div>
    </div>
  )
}

export function EventWizardMain({ onNext, defaultValues }: EventWizardMainProps) {
  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<EventWizardMainData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      isPublic: true, 
      ticketTypes: [{ name: "General Admission", price: 0, quantity: 0 }],
      socialLinks: {},
      ...defaultValues 
    }
  })
  const coverImage = watch("coverImage")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        alert("File must be an image")
        return
      }
      setValue("coverImage", file)
    }
  }

  function onSubmit(data: EventWizardMainData) {
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-white mb-1">Event Title *</label>
        <Input {...register("title")} placeholder="Enter event title" />
        {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title.message}</div>}
      </div>
      <div>
        <label className="block text-white mb-1">Description</label>
        <Textarea {...register("description")} placeholder="Describe your event" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-1">Start Date & Time *</label>
          <Input type="datetime-local" {...register("startDate")} />
          {errors.startDate && <div className="text-red-500 text-xs mt-1">{errors.startDate.message}</div>}
        </div>
        <div>
          <label className="block text-white mb-1">End Date & Time *</label>
          <Input type="datetime-local" {...register("endDate")} />
          {errors.endDate && <div className="text-red-500 text-xs mt-1">{errors.endDate.message}</div>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-1">Location *</label>
          <div className="relative">
            <Input {...register("location")} placeholder="City, State" className="pl-10" />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          {errors.location && <div className="text-red-500 text-xs mt-1">{errors.location.message}</div>}
        </div>
        <div>
          <label className="block text-white mb-1">Venue</label>
          <div className="relative">
            <Input {...register("venue")} placeholder="Venue name" className="pl-10" />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-white mb-1">Capacity</label>
          <div className="relative">
            <Input type="number" {...register("capacity")} placeholder="Max attendees" className="pl-10" />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        <div>
          <label className="block text-white mb-1">Ticket Price</label>
          <div className="relative">
            <Input type="number" step="0.01" {...register("price")} placeholder="0.00" className="pl-10" />
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        <div>
          <label className="block text-white mb-1">Category</label>
          <div className="relative">
            <Input {...register("category")} placeholder="e.g. Concert, World" className="pl-10" />
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-white mb-1">Public Event</label>
        <div className="flex items-center gap-2">
          <Switch {...register("isPublic")} checked={watch("isPublic")} onCheckedChange={(v: boolean) => setValue("isPublic", v)} />
          <span className="text-gray-400">Event will be visible to everyone</span>
        </div>
      </div>
      <div>
        <label className="block text-white mb-1">Upload Event Cover Image</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center bg-[#181b23]">
          <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="coverImageInput" />
          <label htmlFor="coverImageInput" className="cursor-pointer flex flex-col items-center">
            <span className="text-gray-400 mb-2">Drag and drop or click to upload</span>
            <Button type="button" variant="secondary">Choose File</Button>
          </label>
          {coverImage && (
            <img src={URL.createObjectURL(coverImage)} alt="Cover Preview" className="mt-4 w-32 h-32 object-cover rounded" />
          )}
        </div>
      </div>
      <TicketTypesSection register={register} control={control} errors={errors} />
      <SocialLinksSection register={register} errors={errors} />
      <Button type="submit" disabled={isSubmitting} className="w-full mt-2">Next</Button>
    </form>
  )
} 