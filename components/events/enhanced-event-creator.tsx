"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Tag, 
  Image as ImageIcon,
  Link as LinkIcon,
  Share2,
  Globe,
  Music,
  Camera,
  X,
  Plus,
  Upload,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"

// Enhanced event schema with comprehensive validation
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  type: z.enum(["concert", "festival", "tour", "recording", "interview", "other"]),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  doors_open: z.string().optional(),
  venue_name: z.string().min(2, "Venue name is required"),
  venue_address: z.string().optional(),
  venue_city: z.string().min(2, "City is required"),
  venue_state: z.string().optional(),
  venue_country: z.string().default("USA"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").optional(),
  ticket_price_min: z.coerce.number().min(0, "Price cannot be negative").optional(),
  ticket_price_max: z.coerce.number().min(0, "Price cannot be negative").optional(),
  ticket_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_public: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  social_links: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal(""))
  }).optional(),
  poster_url: z.string().optional(),
  setlist: z.array(z.string()).default([]),
  notes: z.string().optional()
})

type EventFormData = z.infer<typeof eventSchema>

interface EnhancedEventCreatorProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (event: any) => void
  editingEvent?: any
}

export function EnhancedEventCreator({ 
  isOpen, 
  onClose, 
  onEventCreated, 
  editingEvent 
}: EnhancedEventCreatorProps) {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newSetlistItem, setNewSetlistItem] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "concert",
      event_date: new Date().toISOString().split('T')[0],
      start_time: "19:00",
      end_time: "22:00",
      doors_open: "18:30",
      venue_name: "",
      venue_address: "",
      venue_city: "",
      venue_state: "",
      venue_country: "USA",
      capacity: 100,
      ticket_price_min: 0,
      ticket_price_max: 0,
      ticket_url: "",
      is_public: true,
      tags: [],
      social_links: {
        facebook: "",
        twitter: "",
        instagram: "",
        website: ""
      },
      poster_url: "",
      setlist: [],
      notes: ""
    }
  })

  const watchedValues = watch()

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60)
  }

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!user) return

    try {
      setUploadingImage(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `event-posters/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('event-media')
        .getPublicUrl(filePath)

      setValue('poster_url', publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !watchedValues.tags?.includes(newTag.trim())) {
      setValue('tags', [...(watchedValues.tags || []), newTag.trim()])
      setNewTag("")
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedValues.tags?.filter(tag => tag !== tagToRemove) || [])
  }

  // Add setlist item
  const addSetlistItem = () => {
    if (newSetlistItem.trim()) {
      setValue('setlist', [...(watchedValues.setlist || []), newSetlistItem.trim()])
      setNewSetlistItem("")
    }
  }

  // Remove setlist item
  const removeSetlistItem = (index: number) => {
    setValue('setlist', watchedValues.setlist?.filter((_, i) => i !== index) || [])
  }

  // Handle form submission
  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error("Please sign in to create an event")
      return
    }

    try {
      setIsSubmitting(true)

      // Generate slug
      const slug = generateSlug(data.title)

      // Create event data
      const eventData = {
        ...data,
        user_id: user.id,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert event
      const { data: newEvent, error } = await supabase
        .from('artist_events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error

      // Create automatic social post
      await createEventPost(newEvent)

      toast.success("Event created successfully!")
      onEventCreated?.(newEvent)
      onClose()
      reset()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create automatic social post for the event
  const createEventPost = async (event: any) => {
    if (!user) return

    try {
      const postContent = `🎵 New Event: ${event.title}\n\n📅 ${new Date(event.event_date).toLocaleDateString()}\n📍 ${event.venue_name}, ${event.venue_city}\n\n${event.description || ''}\n\n#${event.type} #live #music`

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postContent,
          type: 'event',
          visibility: 'public',
          media_urls: event.poster_url ? [event.poster_url] : [],
          hashtags: [...(event.tags || []), event.type, 'live', 'music'],
          metadata: {
            event_id: event.id,
            event_title: event.title,
            event_date: event.event_date,
            event_venue: event.venue_name
          }
        })

      if (postError) {
        console.error('Error creating event post:', postError)
      }
    } catch (error) {
      console.error('Error creating event post:', error)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="venue">Venue & Time</TabsTrigger>
              <TabsTrigger value="tickets">Tickets & Pricing</TabsTrigger>
              <TabsTrigger value="social">Social & Media</TabsTrigger>
            </TabsList>

            {/* Event Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter event title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Select
                    value={watchedValues.type}
                    onValueChange={(value) => setValue('type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                      <SelectItem value="recording">Recording Session</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your event..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedValues.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Setlist</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSetlistItem}
                    onChange={(e) => setNewSetlistItem(e.target.value)}
                    placeholder="Add a song"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSetlistItem())}
                  />
                  <Button type="button" onClick={addSetlistItem} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1 mt-2">
                  {watchedValues.setlist?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        {item}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSetlistItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Venue & Time Tab */}
            <TabsContent value="venue" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    {...register('event_date')}
                    className={errors.event_date ? 'border-red-500' : ''}
                  />
                  {errors.event_date && (
                    <p className="text-sm text-red-500">{errors.event_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...register('capacity')}
                    placeholder="Venue capacity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doors_open">Doors Open</Label>
                  <Input
                    id="doors_open"
                    type="time"
                    {...register('doors_open')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...register('start_time')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...register('end_time')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name *</Label>
                <Input
                  id="venue_name"
                  {...register('venue_name')}
                  placeholder="Enter venue name"
                  className={errors.venue_name ? 'border-red-500' : ''}
                />
                {errors.venue_name && (
                  <p className="text-sm text-red-500">{errors.venue_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_address">Venue Address</Label>
                <Input
                  id="venue_address"
                  {...register('venue_address')}
                  placeholder="Enter venue address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue_city">City *</Label>
                  <Input
                    id="venue_city"
                    {...register('venue_city')}
                    placeholder="City"
                    className={errors.venue_city ? 'border-red-500' : ''}
                  />
                  {errors.venue_city && (
                    <p className="text-sm text-red-500">{errors.venue_city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_state">State</Label>
                  <Input
                    id="venue_state"
                    {...register('venue_state')}
                    placeholder="State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue_country">Country</Label>
                  <Select
                    value={watchedValues.venue_country}
                    onValueChange={(value) => setValue('venue_country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tickets & Pricing Tab */}
            <TabsContent value="tickets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket_price_min">Minimum Ticket Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ticket_price_min"
                      type="number"
                      step="0.01"
                      {...register('ticket_price_min')}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket_price_max">Maximum Ticket Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ticket_price_max"
                      type="number"
                      step="0.01"
                      {...register('ticket_price_max')}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket_url">Ticket URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ticket_url"
                    {...register('ticket_url')}
                    placeholder="https://tickets.example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={watchedValues.is_public}
                  onCheckedChange={(checked) => setValue('is_public', checked)}
                />
                <Label htmlFor="is_public">Public Event</Label>
              </div>
            </TabsContent>

            {/* Social & Media Tab */}
            <TabsContent value="social" className="space-y-4">
              <div className="space-y-2">
                <Label>Event Poster</Label>
                <div className="flex items-center gap-4">
                  {watchedValues.poster_url && (
                    <div className="relative w-32 h-32">
                      <Image
                        src={watchedValues.poster_url}
                        alt="Event poster"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Poster
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      {...register('social_links.facebook')}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      {...register('social_links.twitter')}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      {...register('social_links.instagram')}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      {...register('social_links.website')}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
