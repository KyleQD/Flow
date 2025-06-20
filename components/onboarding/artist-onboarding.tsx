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
  Music, 
  User, 
  Camera, 
  Globe, 
  Instagram, 
  Twitter, 
  Youtube,
  Music2,
  Headphones,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMultiAccount } from "@/hooks/use-multi-account"

interface ArtistOnboardingProps {
  onComplete: (artistId: string) => void
  onCancel: () => void
}

interface ArtistFormData {
  artist_name: string
  bio: string
  genres: string[]
  social_links: {
    instagram?: string
    twitter?: string
    youtube?: string
    spotify?: string
    soundcloud?: string
    website?: string
  }
  profile_image?: string
  banner_image?: string
}

const GENRE_OPTIONS = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country',
  'Folk', 'Reggae', 'Blues', 'Punk', 'Metal', 'Indie', 'Alternative', 'Funk',
  'House', 'Techno', 'Dubstep', 'Ambient', 'Experimental', 'World', 'Latin', 'Gospel'
]

const SOCIAL_PLATFORMS = [
  { key: 'instagram', icon: Instagram, label: 'Instagram', placeholder: '@yourhandle' },
  { key: 'twitter', icon: Twitter, label: 'Twitter', placeholder: '@yourhandle' },
  { key: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'Channel URL' },
  { key: 'spotify', icon: Music2, label: 'Spotify', placeholder: 'Artist Profile URL' },
  { key: 'soundcloud', icon: Headphones, label: 'SoundCloud', placeholder: 'Profile URL' },
  { key: 'website', icon: Globe, label: 'Website', placeholder: 'https://yourwebsite.com' }
]

export default function ArtistOnboarding({ onComplete, onCancel }: ArtistOnboardingProps) {
  const router = useRouter()
  const { createArtistAccount, isLoading } = useMultiAccount()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ArtistFormData>({
    artist_name: '',
    bio: '',
    genres: [],
    social_links: {}
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof ArtistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  const addGenre = (genre: string) => {
    if (!formData.genres.includes(genre) && formData.genres.length < 5) {
      updateFormData('genres', [...formData.genres, genre])
    }
  }

  const removeGenre = (genre: string) => {
    updateFormData('genres', formData.genres.filter(g => g !== genre))
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (stepNumber) {
      case 1:
        if (!formData.artist_name.trim()) {
          newErrors.artist_name = 'Artist name is required'
        } else if (formData.artist_name.length < 2) {
          newErrors.artist_name = 'Artist name must be at least 2 characters'
        }
        break
      case 2:
        if (!formData.bio.trim()) {
          newErrors.bio = 'Bio is required'
        } else if (formData.bio.length < 10) {
          newErrors.bio = 'Bio must be at least 10 characters'
        }
        if (formData.genres.length === 0) {
          newErrors.genres = 'Please select at least one genre'
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
      const artistId = await createArtistAccount(formData)
      onComplete(artistId)
    } catch (error) {
      console.error('Error creating artist account:', error)
      setErrors({ submit: 'Failed to create artist account. Please try again.' })
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
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Music className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Your Artist Profile</h2>
          <p className="text-slate-300">Let's start with the basics</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="artist_name" className="text-white">Artist/Band Name *</Label>
          <Input
            id="artist_name"
            placeholder="Enter your artist or band name"
            value={formData.artist_name}
            onChange={(e) => updateFormData('artist_name', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
              errors.artist_name ? 'border-red-500' : ''
            }`}
          />
          {errors.artist_name && (
            <p className="text-red-400 text-sm">{errors.artist_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white">Profile Picture</Label>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-purple-400/50">
              <AvatarImage src={formData.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                {formData.artist_name ? formData.artist_name[0].toUpperCase() : <Camera className="h-6 w-6" />}
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
        <h2 className="text-2xl font-bold text-white">Tell Your Story</h2>
        <p className="text-slate-300">Help fans discover your music</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white">Artist Bio *</Label>
          <Textarea
            id="bio"
            placeholder="Tell your story... What makes your music unique? What's your journey?"
            value={formData.bio}
            onChange={(e) => updateFormData('bio', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 min-h-[120px] ${
              errors.bio ? 'border-red-500' : ''
            }`}
          />
          <p className="text-xs text-slate-400">{formData.bio.length}/500 characters</p>
          {errors.bio && (
            <p className="text-red-400 text-sm">{errors.bio}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-white">Music Genres * (Select up to 5)</Label>
          
          {formData.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.genres.map((genre) => (
                <Badge
                  key={genre}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 cursor-pointer hover:opacity-80"
                  onClick={() => removeGenre(genre)}
                >
                  {genre}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {GENRE_OPTIONS.filter(genre => !formData.genres.includes(genre)).map((genre) => (
              <Button
                key={genre}
                variant="outline"
                size="sm"
                onClick={() => addGenre(genre)}
                disabled={formData.genres.length >= 5}
                className="border-slate-600 text-slate-300 hover:bg-purple-500/20 hover:border-purple-400/50 justify-start"
              >
                <Plus className="h-3 w-3 mr-1" />
                {genre}
              </Button>
            ))}
          </div>
          
          {errors.genres && (
            <p className="text-red-400 text-sm">{errors.genres}</p>
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
        <h2 className="text-2xl font-bold text-white">Connect Your Platforms</h2>
        <p className="text-slate-300">Link your social media and music platforms (optional)</p>
      </div>

      <div className="space-y-4">
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

      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
        <h3 className="font-semibold text-white mb-2">Profile Preview</h3>
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={formData.profile_image} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
              {formData.artist_name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-white">{formData.artist_name}</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.genres.slice(0, 3).map((genre) => (
                <Badge key={genre} variant="outline" className="border-purple-400/50 text-purple-300 text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {formData.bio && (
          <p className="text-slate-300 text-sm mt-3 line-clamp-2">{formData.bio}</p>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
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
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : step === 3 ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Creating...' : step === 3 ? 'Create Artist Profile' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 