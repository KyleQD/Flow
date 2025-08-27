"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useMultiAccount } from "@/hooks/use-multi-account"
import { UnifiedOnboardingService, OnboardingTemplate } from "@/lib/services/unified-onboarding.service"
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
  Award,
  Plus
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

interface ArtistVenueOnboardingProps {
  accountType: 'artist' | 'venue'
}

const steps = [
  { id: 1, title: 'Welcome', description: 'Create your profile' },
  { id: 2, title: 'Profile Setup', description: 'Complete your profile' },
  { id: 3, title: 'Success', description: 'Profile created!' }
]

export default function ArtistVenueOnboarding({ accountType }: ArtistVenueOnboardingProps) {
  const { user } = useAuth()
  const { createArtistAccount, createVenueAccount } = useMultiAccount()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

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
    if (!user) {
      router.push('/login')
      return
    }

    // Set the account type from props
    setOnboardingData({ accountType })

    // Load template for the account type
    loadTemplate(accountType)
  }, [user, accountType, router])

  const loadTemplate = async (accountType: string) => {
    try {
      const template = await UnifiedOnboardingService.getTemplateByFlowType(accountType)
      if (template) {
        setTemplate(template)
        
        // Initialize form data based on template
        const initialFormData: Record<string, any> = {}
        template.fields.forEach(field => {
          if (field.type === "multiselect") {
            initialFormData[field.id] = []
          } else if (field.type === "checkbox") {
            initialFormData[field.id] = false
          } else {
            initialFormData[field.id] = ""
          }
        })
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!onboardingData || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Create or get onboarding flow
      const flow = await UnifiedOnboardingService.getOrCreateOnboardingFlow(
        user.id,
        onboardingData.accountType,
        template?.id
      )

      if (!flow) {
        throw new Error('Failed to create onboarding flow')
      }

      // Update flow status to in progress
      await UnifiedOnboardingService.updateOnboardingFlow({
        id: flow.id,
        status: 'in_progress',
        responses: formData
      })

      // Create account based on type
      if (onboardingData.accountType === 'artist') {
        await createArtistAccount(artistData)
      } else if (onboardingData.accountType === 'venue') {
        await createVenueAccount(venueData)
      }

      // Complete the onboarding flow
      await UnifiedOnboardingService.completeOnboardingFlow(flow.id, formData)

      // Move to success step
      setCurrentStep(3)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = () => {
    router.push('/dashboard?profile_created=true')
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
                    {accountType === 'artist' ? (
                      <Music className="h-6 w-6 text-white" />
                    ) : (
                      <Building className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Create {accountType === 'artist' ? 'Artist' : 'Venue'} Profile
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
                        {accountType === 'artist' ? (
                          <Music className="h-12 w-12 text-white" />
                        ) : (
                          <Building className="h-12 w-12 text-white" />
                        )}
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-4xl text-white mb-4">
                    Create Your {accountType === 'artist' ? 'Artist' : 'Venue'} Profile! 🎉
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300 leading-relaxed">
                    {accountType === 'artist' 
                      ? 'Showcase your music and connect with fans, venues, and industry professionals.'
                      : 'List your venue and connect with artists, promoters, and event organizers.'
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Create Profile</h3>
                      <p className="text-sm text-gray-400">
                        {accountType === 'artist' 
                          ? 'Build your artist profile with music, bio, and social links'
                          : 'Set up your venue profile with details and amenities'
                        }
                      </p>
                    </div>
                    
                    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Connect</h3>
                      <p className="text-sm text-gray-400">
                        {accountType === 'artist' 
                          ? 'Connect with venues, promoters, and other artists'
                          : 'Connect with artists, promoters, and event organizers'
                        }
                      </p>
                    </div>
                    
                    <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">Grow</h3>
                      <p className="text-sm text-gray-400">
                        {accountType === 'artist' 
                          ? 'Book gigs, grow your audience, and advance your career'
                          : 'Host events, attract talent, and grow your business'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button 
                      onClick={handleNext}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Profile Setup */}
            {currentStep === 2 && onboardingData && template && (
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                        {accountType === 'artist' ? (
                          <Music className="h-8 w-8 text-white" />
                        ) : (
                          <Building className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-3xl text-white mb-2">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form className="space-y-6">
                    {template.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-white font-medium">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </Label>
                        
                        {field.type === 'text' && (
                          <Input
                            id={field.id}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                        
                        {field.type === 'textarea' && (
                          <Textarea
                            id={field.id}
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 min-h-[100px]"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                        
                        {field.type === 'number' && (
                          <Input
                            id={field.id}
                            type="number"
                            value={formData[field.id] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: parseInt(e.target.value) || 0 }))}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                        
                        {field.type === 'multiselect' && field.options && (
                          <div className="grid grid-cols-2 gap-2">
                            {field.options.map((option) => (
                              <label key={option} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={(formData[field.id] || []).includes(option)}
                                  onChange={(e) => {
                                    const currentValues = formData[field.id] || []
                                    const newValues = e.target.checked
                                      ? [...currentValues, option]
                                      : currentValues.filter((v: string) => v !== option)
                                    setFormData(prev => ({ ...prev, [field.id]: newValues }))
                                  }}
                                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                                />
                                <span className="text-white text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {field.description && (
                          <p className="text-gray-400 text-sm">{field.description}</p>
                        )}
                      </div>
                    ))}

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
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                        onClick={handleSubmit}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creating Profile...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Create Profile
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
                    Profile Created! 🚀
                  </CardTitle>
                  <CardDescription className="text-xl text-gray-300 leading-relaxed max-w-md mx-auto">
                    Your {accountType} profile has been created successfully! You can now start connecting with the community.
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
                          Connect with other users
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          Start building your network
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
