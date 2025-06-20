"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { VenueProfile, VenueUpdateData } from '../types/venue-profile'
import { ImageUpload } from './image-upload'
import { useAuth } from '@/contexts/auth-context'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  venue: VenueProfile | null
  onSave: (data: VenueUpdateData) => Promise<void>
}

// URL validation function
const isValidUrl = (url: string): boolean => {
  if (!url) return true // Empty URLs are allowed
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Email validation function  
const isValidEmail = (email: string): boolean => {
  if (!email) return true // Empty emails are allowed
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function EditProfileModal({ isOpen, onClose, venue, onSave }: EditProfileModalProps) {
  const [form, setForm] = useState<VenueUpdateData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()

  // Initialize form when venue data changes
  useEffect(() => {
    if (venue && isOpen) {
      setForm({
        name: venue.name,
        username: venue.username,
        type: venue.type,
        location: venue.location,
        website: venue.website || '',
        contactEmail: venue.contactEmail || '',
        phone: venue.phone || '',
        avatarUrl: venue.avatar || '',
        coverImageUrl: venue.coverImage || '',
        description: venue.description || '',
      })
      setErrors({})
    }
  }, [venue, isOpen])

  // Real-time validation
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        return !value.trim() ? 'Venue name is required' : ''
      case 'username':
        return !value.trim() ? 'Username is required' : ''
      case 'type':
        return !value.trim() ? 'Venue type is required' : ''
      case 'location':
        return !value.trim() ? 'Location is required' : ''
      case 'website':
        return !isValidUrl(value) ? 'Invalid website URL' : ''
      case 'contactEmail':
        return !isValidEmail(value) ? 'Invalid email address' : ''
      default:
        return ''
    }
  }

  const handleInputChange = (field: keyof VenueUpdateData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Real-time validation
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Required fields
    if (!form.name?.trim()) newErrors.name = 'Venue name is required'
    if (!form.username?.trim()) newErrors.username = 'Username is required'
    if (!form.type?.trim()) newErrors.type = 'Venue type is required'
    if (!form.location?.trim()) newErrors.location = 'Location is required'
    
    // URL validations
    if (form.website && !isValidUrl(form.website)) newErrors.website = 'Invalid website URL'
    
    // Email validation
    if (form.contactEmail && !isValidEmail(form.contactEmail)) newErrors.contactEmail = 'Invalid email address'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving')
      return
    }

    setIsLoading(true)
    try {
      await onSave(form)
      onClose()
      toast.success('Venue profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update venue profile')
      console.error('Error updating venue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!venue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Venue Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Image Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Avatar Image</Label>
              <ImageUpload
                userId={user?.id || ''}
                currentImageUrl={form.avatarUrl}
                imageType="avatar"
                onUploadComplete={(url) => {
                  setForm(prev => ({ ...prev, avatarUrl: url }))
                  toast.success('Avatar updated successfully!')
                }}
                onUploadError={(error) => {
                  toast.error(`Avatar upload failed: ${error}`)
                }}
                onDeleteComplete={() => {
                  setForm(prev => ({ ...prev, avatarUrl: '' }))
                  toast.success('Avatar removed successfully!')
                }}
                uploadButtonText="Upload Avatar"
                dragDropText="Drag & drop your avatar here"
                disabled={!user?.id}
                className="h-40"
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                userId={user?.id || ''}
                currentImageUrl={form.coverImageUrl}
                imageType="cover"
                onUploadComplete={(url) => {
                  setForm(prev => ({ ...prev, coverImageUrl: url }))
                  toast.success('Cover image updated successfully!')
                }}
                onUploadError={(error) => {
                  toast.error(`Cover image upload failed: ${error}`)
                }}
                onDeleteComplete={() => {
                  setForm(prev => ({ ...prev, coverImageUrl: '' }))
                  toast.success('Cover image removed successfully!')
                }}
                uploadButtonText="Upload Cover Image"
                dragDropText="Drag & drop your cover image here"
                disabled={!user?.id}
                className="h-40"
              />
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name *</Label>
              <Input 
                id="name"
                value={form.name || ''} 
                onChange={e => handleInputChange('name', e.target.value)} 
                placeholder="Enter venue name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <div className="text-xs text-red-500">{errors.name}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Venue Type *</Label>
              <Input 
                id="type"
                value={form.type || ''} 
                onChange={e => handleInputChange('type', e.target.value)} 
                placeholder="e.g., Music Venue, Concert Hall"
                className={errors.type ? 'border-red-500' : ''}
              />
              {errors.type && <div className="text-xs text-red-500">{errors.type}</div>}
            </div>
          </div>

          {/* Location and Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input 
                id="location"
                value={form.location || ''} 
                onChange={e => handleInputChange('location', e.target.value)} 
                placeholder="City, State/Country"
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && <div className="text-xs text-red-500">{errors.location}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website"
                value={form.website || ''} 
                onChange={e => handleInputChange('website', e.target.value)} 
                placeholder="https://example.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && <div className="text-xs text-red-500">{errors.website}</div>}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input 
                id="contactEmail"
                value={form.contactEmail || ''} 
                onChange={e => handleInputChange('contactEmail', e.target.value)} 
                placeholder="contact@venue.com"
                type="email"
                className={errors.contactEmail ? 'border-red-500' : ''}
              />
              {errors.contactEmail && <div className="text-xs text-red-500">{errors.contactEmail}</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={form.phone || ''} 
                onChange={e => handleInputChange('phone', e.target.value)} 
                placeholder="+1 (555) 123-4567"
                type="tel"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={form.description || ''} 
              onChange={e => handleInputChange('description', e.target.value)} 
              placeholder="Describe your venue..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
