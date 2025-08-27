"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Music, 
  Building, 
  Users, 
  ArrowRight, 
  Sparkles,
  Star,
  Zap,
  Heart,
  Target,
  Award,
  Globe,
  Plus,
  CheckCircle
} from "lucide-react"

interface WelcomeOnboardingProps {
  onClose?: () => void
}

export default function WelcomeOnboarding({ onClose }: WelcomeOnboardingProps) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasArtistProfile, setHasArtistProfile] = useState(false)
  const [hasVenueProfile, setHasVenueProfile] = useState(false)

  useEffect(() => {
    // Check if this is a welcome visit
    const welcome = searchParams.get('welcome')
    const profileCreated = searchParams.get('profile_created')
    
    if (welcome === 'true' || profileCreated === 'true') {
      setShowWelcome(true)
    }

    // Check existing profiles (this would be fetched from your API)
    // For now, we'll simulate this
    checkExistingProfiles()
  }, [searchParams])

  const checkExistingProfiles = async () => {
    // This would fetch from your API to check if user has artist/venue profiles
    // For now, we'll simulate this
    setHasArtistProfile(false)
    setHasVenueProfile(false)
  }

  const handleCreateProfile = (type: 'artist' | 'venue') => {
    router.push(`/onboarding?type=${type}`)
  }

  const handleClose = () => {
    setShowWelcome(false)
    if (onClose) onClose()
    
    // Remove URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('welcome')
    url.searchParams.delete('profile_created')
    window.history.replaceState({}, '', url)
  }

  if (!showWelcome) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Star className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur opacity-30 animate-pulse"></div>
            </div>
          </div>
          
          <CardTitle className="text-4xl text-gray-900 mb-4">
            Welcome to Tourify! 🎉
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            You're all set up! Now let's get you connected with the music community. 
            Create your profiles to start networking and growing your career.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Profile Creation Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Artist Profile */}
            <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              hasArtistProfile ? 'bg-green-50 border-green-200' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
            }`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    hasArtistProfile 
                      ? 'bg-green-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <Music className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  Artist Profile
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Showcase your music and connect with venues, promoters, and fans
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Upload your music and bio</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Connect with venues and promoters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Grow your fan base</span>
                  </div>
                </div>

                {hasArtistProfile ? (
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Profile Created
                    </Badge>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleCreateProfile('artist')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Artist Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Venue Profile */}
            <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              hasVenueProfile ? 'bg-green-50 border-green-200' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
            }`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    hasVenueProfile 
                      ? 'bg-green-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    <Building className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  Venue Profile
                </CardTitle>
                <CardDescription className="text-gray-600">
                  List your venue and connect with artists and event organizers
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Showcase your venue details</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Attract artists and promoters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Host successful events</span>
                  </div>
                </div>

                {hasVenueProfile ? (
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Profile Created
                    </Badge>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleCreateProfile('venue')}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Venue Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Connect</h3>
              <p className="text-sm text-gray-600">Find and connect with other creators</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Discover</h3>
              <p className="text-sm text-gray-600">Explore events and opportunities</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Grow</h3>
              <p className="text-sm text-gray-600">Track your progress and achievements</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Skip for Now
            </Button>
            
            <Button
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
