"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useMultiAccount } from "@/hooks/use-multi-account"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Music, 
  Building, 
  User, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Star,
  Zap,
  Globe,
  Users,
  Heart,
  MapPin,
  Calendar,
  Target,
  Award
} from "lucide-react"

interface OnboardingData {
  accountType: string
  artistData?: {
    artist_name: string
    bio: string
    genres: string[]
    social_links: {
      instagram: string
      spotify: string
      youtube: string
      soundcloud: string
    }
  }
  venueData?: {
    venue_name: string
    description: string
    address: string
    capacity: number
    venue_types: string[]
    contact_info: {
      phone: string
      email: string
      website: string
    }
    social_links: {
      instagram: string
      facebook: string
      website: string
    }
  }
}

const steps = [
  { id: 1, title: 'Welcome', description: 'Get started with Tourify' },
  { id: 2, title: 'Account Setup', description: 'Complete your profile' },
  { id: 3, title: 'Success', description: 'You\'re all set!' }
]

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const { createArtistAccount, createVenueAccount } = useMultiAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)

  // Form states
  const [artistData, setArtistData] = useState({
    artist_name: '',
    bio: '',
    genres: [] as string[],
    social_links: {
      instagram: '',
      spotify: '',
      youtube: '',
      soundcloud: ''
    }
  })
  
  const [venueData, setVenueData] = useState({
    venue_name: '',
    description: '',
    address: '',
    capacity: 0,
    venue_types: [] as string[],
    contact_info: {
      phone: '',
      email: '',
      website: ''
    },
    social_links: {
      instagram: '',
      facebook: '',
      website: ''
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    // Load onboarding data from localStorage or URL params
    const step = searchParams.get('step')
    if (step) setCurrentStep(parseInt(step))

    const accountType = searchParams.get('type')
    const storedData = localStorage.getItem('onboardingData')
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setOnboardingData(data)
        
        if (data.artistData) {
          setArtistData(data.artistData)
        }
        if (data.venueData) {
          setVenueData(data.venueData)
        }
      } catch (e) {
        console.error('Error parsing onboarding data:', e)
      }
    } else if (accountType) {
      setOnboardingData({ accountType })
    }
  }, [user, loading, router, searchParams])

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set('step', (currentStep + 1).toString())
      window.history.replaceState({}, '', url)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      
      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set('step', (currentStep - 1).toString())
      window.history.replaceState({}, '', url)
    }
  }

  const handleSubmit = async () => {
    if (!onboardingData) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (onboardingData.accountType === 'artist') {
        await createArtistAccount(artistData)
      } else if (onboardingData.accountType === 'venue') {
        await createVenueAccount(venueData)
      }

      // Clear localStorage
      localStorage.removeItem('onboardingData')
      
      // Move to success step
      setCurrentStep(3)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = () => {
    router.push('/dashboard?welcome=true')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-20 animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading Onboarding</h2>
          <p className="text-gray-400">Preparing your journey...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const progressValue = (currentStep / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center bg-repeat opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Onboarding
                  </h1>
                  <p className="text-sm text-gray-400">Step {currentStep} of {steps.length}</p>
                </div>
              </div>
              
              {/* Progress */}
              <div className="flex items-center space-x-4">
                <div className="w-48">
                  <Progress 
                    value={progressValue} 
                    className="h-2 bg-white/10"
                  />
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  {Math.round(progressValue)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            
            {/* Error Alert */}
            {error && (
              <Alert className="mb-8 bg-red-500/20 border-red-500/50 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Star className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-4xl text-white mb-4">
                    Welcome to Tourify! 🎉
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300 leading-relaxed">
                    You're about to join the future of music networking. Let's get your account set up 
                    so you can start connecting with the creative community.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Connect</h3>
                      <p className="text-sm text-gray-400">Build meaningful relationships with artists, venues, and industry professionals</p>
                    </div>
                    
                    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Create</h3>
                      <p className="text-sm text-gray-400">Showcase your work with professional tools and reach new audiences</p>
                    </div>
                    
                    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Grow</h3>
                      <p className="text-sm text-gray-400">Track your progress and discover new opportunities for your career</p>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button 
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg"
                    >
                      Let's Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Account Setup */}
            {currentStep === 2 && onboardingData && (
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        {onboardingData.accountType === 'artist' ? (
                          <Music className="h-8 w-8 text-white" />
                        ) : (
                          <Building className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-3xl text-white mb-2">
                    Complete Your {onboardingData.accountType === 'artist' ? 'Artist' : 'Venue'} Profile
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Add some details to help others discover and connect with you
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form className="space-y-6">
                    {onboardingData.accountType === 'artist' ? (
                      /* Artist Form */
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="artist_name" className="text-white font-medium">
                            Artist Name *
                          </Label>
                          <Input
                            id="artist_name"
                            value={artistData.artist_name}
                            onChange={(e) => setArtistData({ ...artistData, artist_name: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                            placeholder="Your artist or stage name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-white font-medium">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            value={artistData.bio}
                            onChange={(e) => setArtistData({ ...artistData, bio: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 min-h-[100px]"
                            placeholder="Tell the world about your music and artistic journey..."
                          />
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-400" />
                            Social Links
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instagram" className="text-white font-medium">Instagram</Label>
                              <Input
                                id="instagram"
                                value={artistData.social_links.instagram}
                                onChange={(e) => setArtistData({
                                  ...artistData,
                                  social_links: { ...artistData.social_links, instagram: e.target.value }
                                })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                                placeholder="@your_handle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="spotify" className="text-white font-medium">Spotify</Label>
                              <Input
                                id="spotify"
                                value={artistData.social_links.spotify}
                                onChange={(e) => setArtistData({
                                  ...artistData,
                                  social_links: { ...artistData.social_links, spotify: e.target.value }
                                })}
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                                placeholder="Spotify artist URL"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Venue Form */
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="venue_name" className="text-white font-medium">
                            Venue Name *
                          </Label>
                          <Input
                            id="venue_name"
                            value={venueData.venue_name}
                            onChange={(e) => setVenueData({ ...venueData, venue_name: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                            placeholder="Name of your venue or event space"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-white font-medium">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={venueData.description}
                            onChange={(e) => setVenueData({ ...venueData, description: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 min-h-[100px]"
                            placeholder="Describe your venue, its atmosphere, and what makes it special..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address" className="text-white font-medium">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              Address
                            </Label>
                            <Input
                              id="address"
                              value={venueData.address}
                              onChange={(e) => setVenueData({ ...venueData, address: e.target.value })}
                              className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                              placeholder="123 Music St, City, State"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="capacity" className="text-white font-medium">
                              <Users className="h-4 w-4 inline mr-1" />
                              Capacity
                            </Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={venueData.capacity || ''}
                              onChange={(e) => setVenueData({ ...venueData, capacity: parseInt(e.target.value) || 0 })}
                              className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                              placeholder="Maximum capacity"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      
                      <Button
                        type="button"
                        disabled={isSubmitting || !artistData.artist_name && !venueData.venue_name}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creating Account...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Complete Setup
                            <Sparkles className="ml-2 h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <CheckCircle className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-4xl text-white mb-4">
                    You're All Set! 🚀
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300 leading-relaxed max-w-md mx-auto">
                    Welcome to the Tourify community! Your account has been created successfully 
                    and you're ready to start your creative journey.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-white">Next Steps</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          Explore your dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          Connect with other creators
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Share your first post
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-white">Pro Tips</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          Complete your profile for better visibility
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          Join communities that match your interests
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          Use analytics to track your growth
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button 
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 text-lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
} 