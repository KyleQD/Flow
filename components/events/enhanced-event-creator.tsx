"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Image, 
  Link, 
  Globe,
  Music,
  Video,
  Mic,
  Users2,
  Sparkles,
  Save,
  X
} from "lucide-react"
import { useEvents } from "@/context/venue/events-context"
import { useAuth } from "@/contexts/auth-context"
import type { VenueEvent } from "@/app/venue/lib/hooks/use-venue-events"

interface EnhancedEventCreatorProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (event: VenueEvent) => void
}

export function EnhancedEventCreator({ isOpen, onClose, onEventCreated }: EnhancedEventCreatorProps) {
  const { createEvent } = useEvents()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    venue: "",
    isPublic: true,
    capacity: 100,
    type: "performance" as VenueEvent['type'],
    tags: [] as string[],
    image: "",
    flyer: "",
    ticketUrl: "",
    socialMedia: [] as string[],
    website: ""
  })
  
  const [newTag, setNewTag] = useState("")
  const [newSocialMedia, setNewSocialMedia] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const addSocialMedia = () => {
    if (newSocialMedia.trim() && !formData.socialMedia.includes(newSocialMedia.trim())) {
      setFormData(prev => ({ ...prev, socialMedia: [...prev.socialMedia, newSocialMedia.trim()] }))
      setNewSocialMedia("")
    }
  }

  const removeSocialMedia = (urlToRemove: string) => {
    setFormData(prev => ({ ...prev, socialMedia: prev.socialMedia.filter(url => url !== urlToRemove) }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to create an event")
      return
    }

    if (!formData.title || !formData.startDate || !formData.location) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        location: formData.location,
        venue: formData.venue,
        isPublic: formData.isPublic,
        capacity: formData.capacity,
        type: formData.type,
        slug: generateSlug(formData.title),
        organizerId: user.id,
        organizerName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Artist',
        organizerAvatar: user.user_metadata?.avatar_url,
        tags: formData.tags,
        image: formData.image,
        flyer: formData.flyer,
        links: {
          ticketUrl: formData.ticketUrl,
          socialMedia: formData.socialMedia,
          website: formData.website
        }
      }

      await createEvent(eventData)
      
      toast.success("Event created successfully!")
      onEventCreated?.(eventData as VenueEvent)
      onClose()
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        venue: "",
        isPublic: true,
        capacity: 100,
        type: "performance",
        tags: [],
        image: "",
        flyer: "",
        ticketUrl: "",
        socialMedia: [],
        website: ""
      })
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                <Sparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Event</h2>
                <p className="text-sm text-gray-400">Set up your event with all the details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="h-5 w-5 text-purple-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter event title"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-white">Event Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className="bg-slate-700 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="recording">Recording</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your event..."
                  className="bg-slate-700 border-white/20 text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-white">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-white">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Venue */}
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                Location & Venue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-white">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, State"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="venue" className="text-white">Venue Name</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    placeholder="Venue name"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity" className="text-white">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", parseInt(e.target.value))}
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                  />
                  <Label htmlFor="isPublic" className="text-white">Public Event</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-emerald-400" />
                Tags & Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="bg-slate-700 border-white/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-200 border-purple-500/30"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Media & Links */}
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="h-5 w-5 text-pink-400" />
                Media & Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image" className="text-white">Event Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="flyer" className="text-white">Event Flyer URL</Label>
                  <Input
                    id="flyer"
                    value={formData.flyer}
                    onChange={(e) => handleInputChange("flyer", e.target.value)}
                    placeholder="https://example.com/flyer.jpg"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ticketUrl" className="text-white">Ticket URL</Label>
                <Input
                  id="ticketUrl"
                  value={formData.ticketUrl}
                  onChange={(e) => handleInputChange("ticketUrl", e.target.value)}
                  placeholder="https://tickets.example.com"
                  className="bg-slate-700 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="website" className="text-white">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="bg-slate-700 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Social Media Links</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSocialMedia}
                    onChange={(e) => setNewSocialMedia(e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="bg-slate-700 border-white/20 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addSocialMedia()}
                  />
                  <Button onClick={addSocialMedia} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.socialMedia.map((url) => (
                    <Badge
                      key={url}
                      variant="secondary"
                      className="bg-blue-500/20 text-blue-200 border-blue-500/30"
                    >
                      {url}
                      <button
                        onClick={() => removeSocialMedia(url)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
