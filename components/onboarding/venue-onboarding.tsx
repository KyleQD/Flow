"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Building2, 
  MapPin, 
  Camera, 
  Globe, 
  Instagram, 
  Twitter,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  Calendar,
  Music,
  Phone,
  Mail
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMultiAccount } from "@/hooks/use-multi-account"

interface VenueOnboardingProps {
  onComplete: (venueId: string) => void
  onCancel: () => void
}

interface VenueFormData {
  venue_name: string
  description: string
  address: string
  capacity: number
  venue_types: string[]
  contact_info: {
    phone?: string
    email?: string
    website?: string
  }
  social_links: {
    instagram?: string
    twitter?: string
    website?: string
  }
  profile_image?: string
  banner_image?: string
}

const VENUE_TYPES = [
  'Concert Hall', 'Club', 'Bar', 'Theater', 'Arena', 'Stadium', 'Festival Ground',
  'Outdoor Stage', 'Rooftop', 'Warehouse', 'Gallery', 'Restaurant', 'Lounge',
  'Recording Studio', 'Rehearsal Space', 'Cultural Center', 'Community Center'
]

const SOCIAL_PLATFORMS = [
  { key: 'instagram', icon: Instagram, label: 'Instagram', placeholder: '@venuename' },
  { key: 'twitter', icon: Twitter, label: 'Twitter', placeholder: '@venuename' },
  { key: 'website', icon: Globe, label: 'Website', placeholder: 'https://yourwebsite.com' }
]

export default function VenueOnboarding({ onComplete, onCancel }: VenueOnboardingProps) {
  const router = useRouter()
  const { createVenueAccount, isLoading } = useMultiAccount()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<VenueFormData>({
    venue_name: '',
    description: '',
    address: '',
    capacity: 0,
    venue_types: [],
    contact_info: {},
    social_links: {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof VenueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateContactInfo = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }))
  }

  const updateSocialLinks = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const addVenueType = (type: string) => {
    if (!formData.venue_types.includes(type) && formData.venue_types.length < 3) {
      updateFormData('venue_types', [...formData.venue_types, type])
    }
  }

  const removeVenueType = (type: string) => {
    updateFormData('venue_types', formData.venue_types.filter(t => t !== type))
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (stepNumber) {
      case 1:
        if (!formData.venue_name.trim()) {
          newErrors.venue_name = 'Venue name is required'
        } else if (formData.venue_name.length < 2) {
          newErrors.venue_name = 'Venue name must be at least 2 characters'
        }
        if (!formData.address.trim()) {
          newErrors.address = 'Address is required'
        }
        break
      case 2:
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required'
        } else if (formData.description.length < 20) {
          newErrors.description = 'Description must be at least 20 characters'
        }
        if (formData.venue_types.length === 0) {
          newErrors.venue_types = 'Please select at least one venue type'
        }
        if (!formData.capacity || formData.capacity < 1) {
          newErrors.capacity = 'Please enter a valid capacity'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return

    try {
      const venueId = await createVenueAccount(formData)
      onComplete(venueId)
    } catch (error) {
      console.error('Error creating venue account:', error)
      setErrors({ submit: 'Failed to create venue account. Please try again.' })
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Your Venue Profile</h2>
          <p className="text-slate-300">Tell us about your venue</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="venue_name" className="text-white">Venue Name *</Label>
          <Input
            id="venue_name"
            placeholder="Enter your venue name"
            value={formData.venue_name}
            onChange={(e) => updateFormData('venue_name', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
              errors.venue_name ? 'border-red-500' : ''
            }`}
          />
          {errors.venue_name && (
            <p className="text-red-400 text-sm">{errors.venue_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-white">Address *</Label>
          <Input
            id="address"
            placeholder="Enter venue address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
              errors.address ? 'border-red-500' : ''
            }`}
          />
          {errors.address && (
            <p className="text-red-400 text-sm">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white">Venue Photo</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-blue-400/50">
              <AvatarImage src={formData.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-bold">
                {formData.venue_name ? formData.venue_name[0].toUpperCase() : <Camera className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Venue Details</h2>
        <p className="text-slate-300">Help artists and fans discover your venue</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Venue Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your venue... What makes it special? What type of events do you host?"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 min-h-[120px] ${
              errors.description ? 'border-red-500' : ''
            }`}
          />
          <p className="text-xs text-slate-400">{formData.description.length}/500 characters</p>
          {errors.description && (
            <p className="text-red-400 text-sm">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-white">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            placeholder="Maximum capacity"
            value={formData.capacity || ''}
            onChange={(e) => updateFormData('capacity', parseInt(e.target.value) || 0)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
              errors.capacity ? 'border-red-500' : ''
            }`}
          />
          {errors.capacity && (
            <p className="text-red-400 text-sm">{errors.capacity}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-white">Venue Types * (Select up to 3)</Label>
          
          {formData.venue_types.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.venue_types.map((type) => (
                <Badge
                  key={type}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 cursor-pointer hover:opacity-80"
                  onClick={() => removeVenueType(type)}
                >
                  {type}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {VENUE_TYPES.filter(type => !formData.venue_types.includes(type)).map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addVenueType(type)}
                disabled={formData.venue_types.length >= 3}
                className="border-slate-600 text-slate-300 hover:bg-blue-500/20 hover:border-blue-400/50 justify-start"
              >
                <Plus className="h-3 w-3 mr-1" />
                {type}
              </Button>
            ))}
          </div>
          
          {errors.venue_types && (
            <p className="text-red-400 text-sm">{errors.venue_types}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Contact & Social</h2>
        <p className="text-slate-300">How can people reach you?</p>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contact Information</h3>
          
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Phone Number
            </Label>
            <Input
              placeholder="+1 (555) 123-4567"
              value={formData.contact_info.phone || ''}
              onChange={(e) => updateContactInfo('phone', e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="info@yourvenue.com"
              value={formData.contact_info.email || ''}
              onChange={(e) => updateContactInfo('email', e.target.value)}
              className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Social Media (Optional)</h3>
          
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label className="text-white flex items-center">
                <platform.icon className="h-4 w-4 mr-2" />
                {platform.label}
              </Label>
              <Input
                placeholder={platform.placeholder}
                value={formData.social_links[platform.key as keyof typeof formData.social_links] || ''}
                onChange={(e) => updateSocialLinks(platform.key, e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          ))}
        </div>

        {/* Venue Preview */}
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-2">Venue Preview</h3>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={formData.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
                {formData.venue_name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-white">{formData.venue_name}</h4>
              <div className="flex items-center text-slate-400 text-sm mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {formData.address}
              </div>
              <div className="flex items-center space-x-3 text-slate-400 text-sm mt-1">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {formData.capacity} capacity
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.venue_types.slice(0, 2).map((type) => (
                    <Badge key={type} variant="outline" className="border-blue-400/50 text-blue-300 text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {formData.description && (
            <p className="text-slate-300 text-sm mt-3 line-clamp-2">{formData.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-8 px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {step} of 3</span>
            <span className="text-sm text-slate-400">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </AnimatePresence>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={step === 1 ? onCancel : prevStep}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step === 1 ? 'Cancel' : 'Previous'}
              </Button>

              <Button
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : step === 3 ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Creating...' : step === 3 ? 'Create Venue Profile' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 