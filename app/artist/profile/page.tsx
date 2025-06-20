"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  User, 
  Camera, 
  Save, 
  Globe, 
  MapPin, 
  Music, 
  Instagram, 
  Twitter, 
  Youtube, 
  Music2,
  Link as LinkIcon,
  Mail,
  Phone,
  Calendar,
  Award,
  Star,
  Settings,
  Shield,
  Bell,
  Palette,
  Loader2,
  Check,
  AlertCircle,
  Briefcase,
  DollarSign
} from "lucide-react"
import { useArtist } from "@/contexts/artist-context"
import { toast } from "sonner"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const musicGenres = [
  "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical", "R&B", "Country", 
  "Folk", "Blues", "Reggae", "Punk", "Metal", "Indie", "Alternative", "Funk",
  "Soul", "Gospel", "World", "Ambient", "House", "Techno", "Dubstep", "Other"
]

export default function ArtistProfilePage() {
  const { user, profile, updateProfile, displayName, avatarInitial, syncArtistName, updateDetailedProfile, isLoading } = useArtist()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState<string>('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    stage_name: "",
    bio: "",
    genre: "",
    location: "",
    website: "",
    instagram: "",
    twitter: "",
    youtube: "",
    spotify: "",
    contact_email: "",
    phone: "",
    booking_rate: "",
    availability: "",
    equipment: "",
    music_style: "",
    experience_years: "",
    notable_performances: "",
    record_label: "",
    awards: "",
    upcoming_releases: "",
    collaboration_interest: false,
    available_for_hire: false,
    newsletter_signup: false,
    privacy_settings: "public",
    preferred_contact: "email"
  })

  useEffect(() => {
    if (profile) {
      const settings = profile.settings || {}
      const professional = settings.professional || {}
      const preferences = settings.preferences || {}
      
      setFormData({
        stage_name: profile.artist_name || "",
        bio: profile.bio || "",
        genre: profile.genres?.[0] || "",
        location: professional.location || "",
        website: profile.social_links?.website || "",
        instagram: profile.social_links?.instagram || "",
        twitter: profile.social_links?.twitter || "",
        youtube: profile.social_links?.youtube || "",
        spotify: profile.social_links?.spotify || "",
        contact_email: professional.contact_email || "",
        phone: professional.phone || "",
        booking_rate: professional.booking_rate || "",
        availability: professional.availability || "",
        equipment: professional.equipment || "",
        music_style: professional.music_style || "",
        experience_years: professional.experience_years || "",
        notable_performances: professional.notable_performances || "",
        record_label: professional.record_label || "",
        awards: professional.awards || "",
        upcoming_releases: professional.upcoming_releases || "",
        collaboration_interest: preferences.collaboration_interest || false,
        available_for_hire: preferences.available_for_hire || false,
        newsletter_signup: preferences.newsletter_signup || false,
        privacy_settings: preferences.privacy_settings || "public",
        preferred_contact: preferences.preferred_contact || "email"
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleSave = async () => {
    console.log('Save initiated - checking conditions...')
    console.log('User:', user?.email)
    console.log('Profile exists:', !!profile)
    console.log('Profile ID:', profile?.id)
    
    if (!user) {
      console.error('No user found')
      toast.error("Authentication required", {
        description: "Please log in to save your profile."
      })
      return
    }

    if (!profile) {
      console.error('No profile found')
      toast.error("Profile not found", {
        description: "Your artist profile needs to be created first."
      })
      return
    }

    console.log('Starting save process...')
    setIsSaving(true)
    setValidationErrors([])
    setSaveProgress('Validating data...')

    try {
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500))

      setSaveProgress('Saving profile...')
      console.log('Calling updateDetailedProfile with data:', formData)
      
      const result = await updateDetailedProfile(formData)
      console.log('Save result:', result)
      
      if (result.success) {
        setSaveProgress('Profile saved successfully!')
        toast.success("Profile updated successfully!", {
          description: "All your changes have been saved.",
          duration: 4000
        })
        setIsEditing(false)
        setHasUnsavedChanges(false)
        
        // Clear progress after a delay
        setTimeout(() => setSaveProgress(''), 2000)
      } else {
        console.error('Save failed with errors:', result.errors)
        setValidationErrors(result.errors || ['Unknown error occurred'])
        toast.error("Failed to save profile", {
          description: result.errors ? result.errors[0] : "Please check the form and try again."
        })
        setSaveProgress('')
      }
    } catch (error) {
      console.error('Save exception:', error)
      toast.error("Failed to save profile", {
        description: "An unexpected error occurred. Please try again."
      })
      setSaveProgress('')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
      if (!confirmCancel) return
    }
    
    setIsEditing(false)
    setHasUnsavedChanges(false)
    setValidationErrors([])
    setSaveProgress('')
    
    // Reset form data to profile values
    if (profile) {
      const settings = profile.settings || {}
      const professional = settings.professional || {}
      const preferences = settings.preferences || {}
      
      setFormData({
        stage_name: profile.artist_name || "",
        bio: profile.bio || "",
        genre: profile.genres?.[0] || "",
        location: professional.location || "",
        website: profile.social_links?.website || "",
        instagram: profile.social_links?.instagram || "",
        twitter: profile.social_links?.twitter || "",
        youtube: profile.social_links?.youtube || "",
        spotify: profile.social_links?.spotify || "",
        contact_email: professional.contact_email || "",
        phone: professional.phone || "",
        booking_rate: professional.booking_rate || "",
        availability: professional.availability || "",
        equipment: professional.equipment || "",
        music_style: professional.music_style || "",
        experience_years: professional.experience_years || "",
        notable_performances: professional.notable_performances || "",
        record_label: professional.record_label || "",
        awards: professional.awards || "",
        upcoming_releases: professional.upcoming_releases || "",
        collaboration_interest: preferences.collaboration_interest || false,
        available_for_hire: preferences.available_for_hire || false,
        newsletter_signup: preferences.newsletter_signup || false,
        privacy_settings: preferences.privacy_settings || "public",
        preferred_contact: preferences.preferred_contact || "email"
      })
    }
  }

  const handleSyncArtistName = async () => {
    const success = await syncArtistName()
    if (success) {
      toast.success("Artist name synced successfully!")
      setHasUnsavedChanges(true)
    } else {
      toast.info("No changes needed or sync failed")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-xl">Loading your profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Artist Profile
              </h1>
              <p className="text-sm text-slate-400">Manage your artist profile and public information</p>
              {saveProgress && (
                <p className="text-sm text-green-400 flex items-center gap-2">
                  {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                  {saveProgress}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {!profile?.artist_name && (
                <Button
                  onClick={handleSyncArtistName}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sync Name
                </Button>
              )}
              
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className={`${
                      hasUnsavedChanges 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } transition-colors duration-200`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {hasUnsavedChanges ? 'Save Changes' : 'Save Profile'}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsEditing(true)
                  }}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-6 pb-0">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-medium">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-300 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-slate-200">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {displayName}
                  </h3>
                  <p className="text-slate-400">{formData.genre || 'Your Genre'}</p>
                  {profile?.verification_status === 'verified' && (
                    <Badge className="bg-blue-600 rounded-xl">
                      <Star className="h-3 w-3 mr-1" />
                      Verified Artist
                    </Badge>
                  )}
                  
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 rounded-xl p-1">
                <TabsTrigger value="basic" className="rounded-lg">Basic Info</TabsTrigger>
                <TabsTrigger value="social" className="rounded-lg">Social Links</TabsTrigger>
                <TabsTrigger value="professional" className="rounded-lg">Professional</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Basic Information</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your core artist information that will be displayed publicly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="stage_name" className="text-slate-300">Artist/Stage Name</Label>
                        <Input
                          id="stage_name"
                          value={formData.stage_name}
                          onChange={(e) => handleInputChange('stage_name', e.target.value)}
                          placeholder="Your stage name"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="genre" className="text-slate-300">Genre</Label>
                        <Select
                          value={formData.genre}
                          onValueChange={(value) => handleInputChange('genre', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg">
                            <SelectValue placeholder="Select your genre" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {musicGenres.map((genre) => (
                              <SelectItem key={genre} value={genre} className="text-white hover:bg-slate-700">
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-300">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell your story, describe your music style, achievements..."
                        disabled={!isEditing}
                        rows={4}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg resize-none"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-slate-300">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="City, Country"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-slate-300">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-purple-400" />
                      Social Media Links
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Connect your social media profiles to help fans find you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="instagram" className="text-slate-300 flex items-center">
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          placeholder="@yourusername"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twitter" className="text-slate-300 flex items-center">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter/X
                        </Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          placeholder="@yourusername"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="youtube" className="text-slate-300 flex items-center">
                          <Youtube className="h-4 w-4 mr-2" />
                          YouTube
                        </Label>
                        <Input
                          id="youtube"
                          value={formData.youtube}
                          onChange={(e) => handleInputChange('youtube', e.target.value)}
                          placeholder="Channel URL"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spotify" className="text-slate-300 flex items-center">
                          <Music2 className="h-4 w-4 mr-2" />
                          Spotify
                        </Label>
                        <Input
                          id="spotify"
                          value={formData.spotify}
                          onChange={(e) => handleInputChange('spotify', e.target.value)}
                          placeholder="Artist URL"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                      Professional Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Business details for bookings and collaborations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="text-slate-300 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Email
                        </Label>
                        <Input
                          id="contact_email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          placeholder="booking@yourname.com"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="booking_rate" className="text-slate-300 flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Booking Rate
                        </Label>
                        <Input
                          id="booking_rate"
                          value={formData.booking_rate}
                          onChange={(e) => handleInputChange('booking_rate', e.target.value)}
                          placeholder="$500/hour or $2000/event"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience_years" className="text-slate-300 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Years of Experience
                        </Label>
                        <Input
                          id="experience_years"
                          value={formData.experience_years}
                          onChange={(e) => handleInputChange('experience_years', e.target.value)}
                          placeholder="5 years"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipment" className="text-slate-300">Equipment & Setup</Label>
                      <Textarea
                        id="equipment"
                        value={formData.equipment}
                        onChange={(e) => handleInputChange('equipment', e.target.value)}
                        placeholder="List your equipment, instruments, technical requirements..."
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notable_performances" className="text-slate-300">Notable Performances</Label>
                      <Textarea
                        id="notable_performances"
                        value={formData.notable_performances}
                        onChange={(e) => handleInputChange('notable_performances', e.target.value)}
                        placeholder="Mention key venues, festivals, or events you've performed at..."
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg resize-none"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="record_label" className="text-slate-300">Record Label</Label>
                        <Input
                          id="record_label"
                          value={formData.record_label}
                          onChange={(e) => handleInputChange('record_label', e.target.value)}
                          placeholder="Independent or label name"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="awards" className="text-slate-300">Awards & Recognition</Label>
                        <Input
                          id="awards"
                          value={formData.awards}
                          onChange={(e) => handleInputChange('awards', e.target.value)}
                          placeholder="Awards, certifications, achievements"
                          disabled={!isEditing}
                          className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upcoming_releases" className="text-slate-300">Upcoming Releases</Label>
                      <Textarea
                        id="upcoming_releases"
                        value={formData.upcoming_releases}
                        onChange={(e) => handleInputChange('upcoming_releases', e.target.value)}
                        placeholder="Tell fans about your upcoming music, albums, or projects..."
                        disabled={!isEditing}
                        rows={3}
                        className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Available for Collaborations</Label>
                          <p className="text-sm text-slate-400">Let other artists know you're open to collaborating</p>
                        </div>
                        <Switch
                          checked={formData.collaboration_interest}
                          onCheckedChange={(checked) => handleInputChange('collaboration_interest', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Available for Hire</Label>
                          <p className="text-sm text-slate-400">Show that you're accepting booking requests</p>
                        </div>
                        <Switch
                          checked={formData.available_for_hire}
                          onCheckedChange={(checked) => handleInputChange('available_for_hire', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-400" />
                      Privacy & Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Control how your profile is displayed and who can contact you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Profile Visibility</Label>
                        <Select
                          value={formData.privacy_settings}
                          onValueChange={(value) => handleInputChange('privacy_settings', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="public" className="text-white hover:bg-slate-700">Public - Anyone can view</SelectItem>
                            <SelectItem value="verified" className="text-white hover:bg-slate-700">Verified Users Only</SelectItem>
                            <SelectItem value="private" className="text-white hover:bg-slate-700">Private - Invitation Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Preferred Contact Method</Label>
                        <Select
                          value={formData.preferred_contact}
                          onValueChange={(value) => handleInputChange('preferred_contact', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="email" className="text-white hover:bg-slate-700">Email</SelectItem>
                            <SelectItem value="phone" className="text-white hover:bg-slate-700">Phone</SelectItem>
                            <SelectItem value="platform" className="text-white hover:bg-slate-700">Through Platform</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-slate-300">Newsletter Subscription</Label>
                          <p className="text-sm text-slate-400">Receive updates about new features and opportunities</p>
                        </div>
                        <Switch
                          checked={formData.newsletter_signup}
                          onCheckedChange={(checked) => handleInputChange('newsletter_signup', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 