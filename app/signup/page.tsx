"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Mail, ArrowRight, CheckCircle, Music, User, Building, Briefcase, Users, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { FlowLogo } from '@/components/tourify-logo'
import { AuthDiagnostic } from '@/components/auth/auth-diagnostic'

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  username: string
}

interface AccountTypeData {
  type: 'general' | 'artist' | 'venue' | 'industry'
  artist_name?: string
  venue_name?: string
  company_name?: string
  bio?: string
  genres?: string[]
  venue_types?: string[]
  industry_role?: string
  address?: string
  capacity?: number
  social_links?: Record<string, string>
}

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  })
  const [accountTypeData, setAccountTypeData] = useState<AccountTypeData>({
    type: 'general'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<any>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  const [loadingInvitation, setLoadingInvitation] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const inviteType = searchParams.get('type')
  const supabase = createClientComponentClient()

  const totalSteps = 3
  const progressPercentage = (step / totalSteps) * 100

  useEffect(() => {
    if (token) {
      if (inviteType === 'artist') {
        fetchBookingData()
      } else {
        fetchInvitationData()
      }
    }
  }, [token, inviteType])

  const fetchInvitationData = async () => {
    setLoadingInvitation(true)
    try {
      const response = await fetch(`/api/invitations?token=${token}`)
      if (response.ok) {
        const data = await response.json()
        setInvitationData(data.data)
        if (data.data.email) {
          setFormData(prev => ({ ...prev, email: data.data.email }))
        }
      } else {
        setError('Invalid or expired invitation link')
      }
    } catch (error) {
      setError('Failed to load invitation information')
    } finally {
      setLoadingInvitation(false)
    }
  }

  const fetchBookingData = async () => {
    setLoadingInvitation(true)
    try {
      const response = await fetch(`/api/booking-requests?token=${token}`)
      if (response.ok) {
        const data = await response.json()
        setBookingData(data.data)
        if (data.data.email) {
          setFormData(prev => ({ ...prev, email: data.data.email }))
        }
      } else {
        setError('Invalid or expired booking invitation link')
      }
    } catch (error) {
      setError('Failed to load booking invitation information')
    } finally {
      setLoadingInvitation(false)
    }
  }

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setStep(2)
  }

  const handleAccountTypeSubmit = async (accountType: AccountTypeData['type']) => {
    setAccountTypeData({ ...accountTypeData, type: accountType })
    setStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Create user account with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            account_type: accountTypeData.type,
            onboarding_completed: false
          },
        },
      })

      if (error) throw error

      // Store additional data in localStorage for onboarding
      if (data.user) {
        localStorage.setItem('onboarding_data', JSON.stringify({
          user_id: data.user.id,
          account_type_data: accountTypeData,
          invitation_token: token,
          invite_type: inviteType
        }))
      }

      // Handle invitations if present
      if (token && data.user) {
        try {
          if (inviteType === 'artist') {
            await fetch(`/api/booking-requests`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                status: 'pending',
                userId: data.user.id
              })
            })
          } else if (inviteType === 'staff') {
            // Handle staff onboarding invitation
            await fetch(`/api/invitations`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                status: 'accepted',
                userId: data.user.id
              })
            })
            
            // Redirect to onboarding completion page
            router.push(`/onboarding/complete?token=${token}`)
            return
          } else {
            await fetch(`/api/invitations`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                status: 'accepted',
                userId: data.user.id
              })
            })
          }
        } catch (inviteError) {
          console.error('Error handling invitation:', inviteError)
        }
      }

      // Redirect to login page after successful signup
      router.push(`/login?message=account_created&email=${encodeURIComponent(formData.email)}`)
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAccountDataChange = (field: string, value: any) => {
    setAccountTypeData(prev => ({ ...prev, [field]: value }))
  }

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#10111A]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    )
  }

  const isArtistInvite = inviteType === 'artist' && bookingData
  const isStaffInvite = !inviteType && invitationData

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#10111A] bg-[url('/starfield-bg.jpg')] bg-cover bg-center relative">
      <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-10 z-10">
                        <FlowLogo variant="light" size="lg" className="h-10 w-auto" />
        
        {/* Progress indicator */}
        <div className="flex flex-col items-center mt-6 mb-4 w-full max-w-md px-8">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step >= stepNum ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <Progress value={progressPercentage} className="w-full h-2 bg-gray-800" />
          <p className="text-sm text-gray-400 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-center w-full z-20 pt-32">
        <Card className="w-full max-w-lg p-8 rounded-2xl bg-[#181A20] border-none shadow-xl">
          {/* Configuration Error Alert */}
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL || 
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('your_anon_key')) && (
            <Alert className="mb-6 bg-red-900/20 border-red-700">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                <strong>Configuration Issue:</strong> Authentication service is not properly configured.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-red-300 underline"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                >
                  {showDiagnostics ? 'Hide' : 'Show'} diagnostics
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Diagnostic Section */}
          {showDiagnostics && (
            <div className="mb-6">
              <AuthDiagnostic />
            </div>
          )}

          {/* Invitation Headers */}
          {isArtistInvite && (
            <Alert className="mb-6 bg-red-900/20 border-red-700">
              <Music className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                You've been invited for a <strong>{bookingData.booking_details.performanceType}</strong> performance at{' '}
                <strong>{bookingData.booking_details.venue}</strong>!
                Complete your signup to view the full details and respond.
              </AlertDescription>
            </Alert>
          )}
          
          {isStaffInvite && (
            <Alert className="mb-6 bg-green-900/20 border-green-700">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                You've been invited to join as <strong>{invitationData.position_details.title}</strong>!
                Complete your signup to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-center mb-2 text-white">
                {isArtistInvite ? 'Join as Artist' : isStaffInvite ? 'Complete Your Signup' : 'Create Your Account'}
              </h2>
              <p className="text-gray-400 text-center mb-8">
                {isArtistInvite 
                  ? 'Create your account to manage performance bookings' 
                  : isStaffInvite
                  ? 'Join the team and start your journey with us' 
                  : 'Let\'s start with some basic information'
                }
              </p>

              {!isArtistInvite && !isStaffInvite && (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full bg-[#23263A] border-gray-800 text-white hover:bg-[#23263A]/80 transition-all duration-300 hover:border-purple-600 group"
                      >
                        <Facebook className="h-5 w-5 text-blue-500 mr-2 group-hover:text-blue-400 transition-colors" />
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-[#23263A] border-gray-800 text-white hover:bg-[#23263A]/80 transition-all duration-300 hover:border-purple-600 group"
                      >
                        <Mail className="h-5 w-5 text-purple-500 mr-2 group-hover:text-purple-400 transition-colors" />
                        Google
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="bg-gray-800" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#181A20] px-2 text-gray-400">Or sign up with email</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300 text-sm">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300 text-sm">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                    disabled={!!(isArtistInvite && bookingData?.email) || !!(isStaffInvite && invitationData?.email)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                    required
                  />
                  <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                    required
                  />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button
                  type="submit"
                  className="w-full h-11 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-lg flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </>
          )}

          {/* Step 2: Account Type Selection */}
          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Account Type</h2>
              <p className="text-gray-400 text-center mb-8">
                Select the type of account that best describes you. You can always add more account types later.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => handleAccountTypeSubmit('general')}
                  className="w-full h-16 bg-[#23263A] border border-gray-700 hover:border-purple-600 hover:bg-[#2a2d3a] text-white text-left flex items-center p-4 rounded-lg transition-all"
                  variant="outline"
                >
                  <User className="h-8 w-8 text-purple-400 mr-4" />
                  <div>
                    <h3 className="font-semibold">General User</h3>
                    <p className="text-sm text-gray-400">Connect with the music community</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleAccountTypeSubmit('artist')}
                  className="w-full h-16 bg-[#23263A] border border-gray-700 hover:border-purple-600 hover:bg-[#2a2d3a] text-white text-left flex items-center p-4 rounded-lg transition-all"
                  variant="outline"
                >
                  <Music className="h-8 w-8 text-red-400 mr-4" />
                  <div>
                    <h3 className="font-semibold">Artist/Performer</h3>
                    <p className="text-sm text-gray-400">Showcase your music and get booked</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleAccountTypeSubmit('venue')}
                  className="w-full h-16 bg-[#23263A] border border-gray-700 hover:border-purple-600 hover:bg-[#2a2d3a] text-white text-left flex items-center p-4 rounded-lg transition-all"
                  variant="outline"
                >
                  <Building className="h-8 w-8 text-blue-400 mr-4" />
                  <div>
                    <h3 className="font-semibold">Venue/Event Space</h3>
                    <p className="text-sm text-gray-400">Host events and book artists</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleAccountTypeSubmit('industry')}
                  className="w-full h-16 bg-[#23263A] border border-gray-700 hover:border-purple-600 hover:bg-[#2a2d3a] text-white text-left flex items-center p-4 rounded-lg transition-all"
                  variant="outline"
                >
                  <Briefcase className="h-8 w-8 text-green-400 mr-4" />
                  <div>
                    <h3 className="font-semibold">Music Industry Professional</h3>
                    <p className="text-sm text-gray-400">Agent, manager, label, or other professional</p>
                  </div>
                </Button>
              </div>

              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full mt-6 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Back
              </Button>
            </>
          )}

          {/* Step 3: Additional Information */}
          {step === 3 && (
            <>
              <h2 className="text-3xl font-bold text-center mb-2 text-white">
                Complete Your {accountTypeData.type === 'general' ? 'Profile' : 
                  accountTypeData.type === 'artist' ? 'Artist Profile' :
                  accountTypeData.type === 'venue' ? 'Venue Profile' : 'Professional Profile'}
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Tell us a bit more about yourself to personalize your experience.
              </p>

              <form onSubmit={handleFinalSubmit} className="space-y-4">
                {accountTypeData.type === 'artist' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="artist_name" className="text-gray-300 text-sm">Artist/Band Name</Label>
                      <Input
                        id="artist_name"
                        placeholder="Your stage name or band name"
                        value={accountTypeData.artist_name || ''}
                        onChange={(e) => handleAccountDataChange('artist_name', e.target.value)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-300 text-sm">Bio (Optional)</Label>
                      <Input
                        id="bio"
                        placeholder="Tell us about your music..."
                        value={accountTypeData.bio || ''}
                        onChange={(e) => handleAccountDataChange('bio', e.target.value)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                      />
                    </div>
                  </>
                )}

                {accountTypeData.type === 'venue' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="venue_name" className="text-gray-300 text-sm">Venue Name</Label>
                      <Input
                        id="venue_name"
                        placeholder="Your venue name"
                        value={accountTypeData.venue_name || ''}
                        onChange={(e) => handleAccountDataChange('venue_name', e.target.value)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-300 text-sm">Address (Optional)</Label>
                      <Input
                        id="address"
                        placeholder="Venue address"
                        value={accountTypeData.address || ''}
                        onChange={(e) => handleAccountDataChange('address', e.target.value)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-gray-300 text-sm">Capacity (Optional)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Maximum capacity"
                        value={accountTypeData.capacity || ''}
                        onChange={(e) => handleAccountDataChange('capacity', parseInt(e.target.value) || undefined)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                      />
                    </div>
                  </>
                )}

                {accountTypeData.type === 'industry' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-gray-300 text-sm">Company Name</Label>
                      <Input
                        id="company_name"
                        placeholder="Your company or organization"
                        value={accountTypeData.company_name || ''}
                        onChange={(e) => handleAccountDataChange('company_name', e.target.value)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry_role" className="text-gray-300 text-sm">Role</Label>
                      <Input
                        id="industry_role"
                        placeholder="e.g., Manager, Agent, A&R, etc."
                        value={accountTypeData.industry_role || ''}
                        onChange={(e) => handleAccountDataChange('industry_role', e.target.value)}
                        className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                        required
                      />
                    </div>
                  </>
                )}

                {accountTypeData.type === 'general' && (
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-300 text-sm">Bio (Optional)</Label>
                    <Input
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={accountTypeData.bio || ''}
                      onChange={(e) => handleAccountDataChange('bio', e.target.value)}
                      className="bg-[#23263A] border-gray-800 text-white focus:border-purple-600 focus:ring-purple-600 h-11 rounded-md"
                    />
                  </div>
                )}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
                          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
      <footer className="w-full text-center text-gray-500 text-xs py-6 z-30 relative">
        Tourify is live event culture — organized.
      </footer>
    </div>
  )
}

