"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  Music, 
  User, 
  Building, 
  Briefcase, 
  Users,
  Crown,
  Shield,
  Star,
  Truck,
  Calendar,
  DollarSign,
  MessageSquare,
  BarChart3,
  Globe,
  Lock,
  Smartphone,
  CheckCircle2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { rbacService } from '@/lib/services/rbac.service'
import type { SystemRole, SYSTEM_ROLES } from '@/types/rbac'

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  username: string
  accountMode: 'creator' | 'professional'
  accountType: 'general' | 'artist' | 'venue' | 'industry' | 'tour_manager'
  organization?: string
  role?: string
  acceptTerms: boolean
  acceptMarketing: boolean
  enableMFA: boolean
}

interface SignupStep {
  id: number
  title: string
  description: string
  completed: boolean
}

export default function EnhancedSignupForm() {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    accountMode: 'creator',
    accountType: 'general',
    acceptTerms: false,
    acceptMarketing: false,
    enableMFA: false
  })

  const steps: SignupStep[] = [
    {
      id: 1,
      title: 'Account Mode',
      description: 'Choose your experience level',
      completed: currentStep > 1
    },
    {
      id: 2,
      title: 'Account Details',
      description: 'Basic account information',
      completed: currentStep > 2
    },
    {
      id: 3,
      title: 'Account Type',
      description: 'Select your account type',
      completed: currentStep > 3
    },
    {
      id: 4,
      title: 'Security & Preferences',
      description: 'Security settings and preferences',
      completed: currentStep > 4
    },
    {
      id: 5,
      title: 'Verification',
      description: 'Verify your account',
      completed: false
    }
  ]

  const progressPercentage = (currentStep / steps.length) * 100

  // Account mode options
  const accountModes = [
    {
      id: 'creator',
      title: 'Creator Mode',
      description: 'Perfect for artists, musicians, and content creators',
      icon: Music,
      features: [
        'Simplified interface',
        'Focus on creative tools',
        'Easy content sharing',
        'Basic analytics'
      ],
      badge: 'Recommended'
    },
    {
      id: 'professional',
      title: 'Professional Mode',
      description: 'Advanced features for industry professionals',
      icon: Briefcase,
      features: [
        'Advanced tour management',
        'Team collaboration',
        'Financial tracking',
        'Detailed analytics',
        'Multi-role support'
      ],
      badge: 'Advanced'
    }
  ]

  // Account type options based on mode
  const getAccountTypes = () => {
    if (formData.accountMode === 'creator') {
      return [
        {
          id: 'general',
          title: 'General User',
          description: 'Connect with the music community',
          icon: User,
          roles: [] as SystemRole[]
        },
        {
          id: 'artist',
          title: 'Artist/Performer',
          description: 'Showcase your music and get booked',
          icon: Music,
          roles: [SYSTEM_ROLES.ARTIST] as SystemRole[]
        }
      ]
    } else {
      return [
        {
          id: 'tour_manager',
          title: 'Tour Manager',
          description: 'Manage tours and events professionally',
          icon: Calendar,
          roles: [SYSTEM_ROLES.TOUR_MANAGER] as SystemRole[]
        },
        {
          id: 'venue',
          title: 'Venue Manager',
          description: 'Manage venue operations and bookings',
          icon: Building,
          roles: [SYSTEM_ROLES.VENUE_COORDINATOR] as SystemRole[]
        },
        {
          id: 'industry',
          title: 'Industry Professional',
          description: 'Agent, manager, label, or other professional',
          icon: Briefcase,
          roles: [SYSTEM_ROLES.FINANCIAL_MANAGER] as SystemRole[]
        }
      ]
    }
  }

  const handleInputChange = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.accountMode
      case 2:
        return !!(
          formData.email && 
          formData.password && 
          formData.confirmPassword && 
          formData.fullName && 
          formData.username &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 8
        )
      case 3:
        return !!formData.accountType
      case 4:
        return formData.acceptTerms
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    } else {
      setError('Please complete all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create user account with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            account_mode: formData.accountMode,
            account_type: formData.accountType,
            organization: formData.organization,
            role: formData.role,
            enable_mfa: formData.enableMFA,
            onboarding_completed: false
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Assign appropriate roles based on account type
        const accountType = getAccountTypes().find(type => type.id === formData.accountType)
        if (accountType?.roles.length) {
          try {
            for (const role of accountType.roles) {
              await rbacService.assignRole({
                userId: data.user.id,
                roleName: role,
                assignedBy: data.user.id // Self-assignment during signup
              })
            }
          } catch (roleError) {
            console.error('Error assigning roles:', roleError)
            // Don't fail the signup if role assignment fails
          }
        }

        // Store additional data for onboarding
        localStorage.setItem('onboarding_data', JSON.stringify({
          user_id: data.user.id,
          account_mode: formData.accountMode,
          account_type: formData.accountType,
          enable_mfa: formData.enableMFA
        }))

        // Move to verification step
        setCurrentStep(5)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#10111A] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-[#181A20] border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Join the future of tour and event management
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 ${
                    step.completed ? 'bg-green-600 text-white' :
                    currentStep === step.id ? 'bg-purple-600 text-white' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {step.completed ? <CheckCircle2 className="h-3 w-3" /> : step.id}
                  </div>
                  <div className="text-xs">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-600/20 bg-red-600/10">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Account Mode Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Choose Your Experience
                </h3>
                <p className="text-gray-400">
                  Select the mode that best fits your needs
                </p>
              </div>

              <RadioGroup
                value={formData.accountMode}
                onValueChange={(value) => handleInputChange('accountMode', value)}
                className="space-y-4"
              >
                {accountModes.map((mode) => {
                  const IconComponent = mode.icon
                  return (
                    <div key={mode.id} className="relative">
                      <RadioGroupItem
                        value={mode.id}
                        id={mode.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={mode.id}
                        className="flex flex-col p-6 rounded-lg border-2 border-gray-700 cursor-pointer transition-all hover:border-purple-600 peer-checked:border-purple-600 peer-checked:bg-purple-600/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-purple-600/20">
                              <IconComponent className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-white">
                                {mode.title}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {mode.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {mode.badge}
                          </Badge>
                        </div>
                        <ul className="space-y-1">
                          {mode.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-300">
                              <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Account Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Account Information
                </h3>
                <p className="text-gray-400">
                  Provide your basic account details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-[#23263A] border-gray-700 text-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="bg-[#23263A] border-gray-700 text-white"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-[#23263A] border-gray-700 text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-[#23263A] border-gray-700 text-white pr-10"
                      placeholder="Create a password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-[#23263A] border-gray-700 text-white pr-10"
                      placeholder="Confirm your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Account Type Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Account Type
                </h3>
                <p className="text-gray-400">
                  Choose the type that best describes your role
                </p>
              </div>

              <RadioGroup
                value={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
                className="space-y-3"
              >
                {getAccountTypes().map((type) => {
                  const IconComponent = type.icon
                  return (
                    <div key={type.id} className="relative">
                      <RadioGroupItem
                        value={type.id}
                        id={type.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={type.id}
                        className="flex items-center p-4 rounded-lg border-2 border-gray-700 cursor-pointer transition-all hover:border-purple-600 peer-checked:border-purple-600 peer-checked:bg-purple-600/10"
                      >
                        <div className="p-2 rounded-lg bg-purple-600/20 mr-4">
                          <IconComponent className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white">
                            {type.title}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {type.description}
                          </p>
                          {type.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {type.roles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>

              {formData.accountMode === 'professional' && (
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div>
                    <Label htmlFor="organization" className="text-gray-300">
                      Organization (Optional)
                    </Label>
                    <Input
                      id="organization"
                      value={formData.organization || ''}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className="bg-[#23263A] border-gray-700 text-white"
                      placeholder="Your company or organization"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-gray-300">
                      Your Role (Optional)
                    </Label>
                    <Input
                      id="role"
                      value={formData.role || ''}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="bg-[#23263A] border-gray-700 text-white"
                      placeholder="e.g., Tour Manager, Booking Agent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Security & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Security & Preferences
                </h3>
                <p className="text-gray-400">
                  Configure your security settings and preferences
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableMFA"
                    checked={formData.enableMFA}
                    onCheckedChange={(checked) => handleInputChange('enableMFA', checked)}
                  />
                  <Label htmlFor="enableMFA" className="text-gray-300 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-400" />
                    Enable Multi-Factor Authentication (Recommended)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptMarketing"
                    checked={formData.acceptMarketing}
                    onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked)}
                  />
                  <Label htmlFor="acceptMarketing" className="text-gray-300">
                    I'd like to receive updates about new features and industry news
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                    required
                  />
                  <Label htmlFor="acceptTerms" className="text-gray-300">
                    I agree to the{' '}
                    <a href="/terms" className="text-purple-400 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-purple-400 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Verification */}
          {currentStep === 5 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-600/20">
                  <Mail className="h-12 w-12 text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Verify Your Email
                </h3>
                <p className="text-gray-400">
                  We've sent a verification email to{' '}
                  <span className="text-white font-medium">{formData.email}</span>
                </p>
                <p className="text-gray-400 mt-2">
                  Please check your inbox and click the verification link to complete your account setup.
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Continue to Login
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-gray-700 text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!validateStep(currentStep)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 