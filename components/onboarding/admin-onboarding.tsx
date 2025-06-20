"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Crown, 
  Shield, 
  Users, 
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Building,
  Award,
  Clock
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMultiAccount } from "@/hooks/use-multi-account"

interface AdminOnboardingProps {
  onComplete: () => void
  onCancel: () => void
}

interface AdminFormData {
  reason: string
  experience: string
  references: string
  organization: string
  role: string
  previous_roles: string[]
  certifications: string
  availability: string
}

const ADMIN_ROLES = [
  'Community Moderator',
  'Content Moderator',
  'Event Coordinator',
  'Platform Administrator',
  'Technical Support',
  'Partnership Manager',
  'Quality Assurance',
  'Data Analyst'
]

const PREVIOUS_ROLES = [
  'Community Management',
  'Event Management',
  'Music Industry',
  'Tech Support',
  'Content Creation',
  'Social Media',
  'Marketing',
  'Business Development',
  'Project Management',
  'Customer Service'
]

export default function AdminOnboarding({ onComplete, onCancel }: AdminOnboardingProps) {
  const router = useRouter()
  const { requestAdminAccess, isLoading } = useMultiAccount()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<AdminFormData>({
    reason: '',
    experience: '',
    references: '',
    organization: '',
    role: '',
    previous_roles: [],
    certifications: '',
    availability: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (field: keyof AdminFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addPreviousRole = (role: string) => {
    if (!formData.previous_roles.includes(role)) {
      updateFormData('previous_roles', [...formData.previous_roles, role])
    }
  }

  const removePreviousRole = (role: string) => {
    updateFormData('previous_roles', formData.previous_roles.filter(r => r !== role))
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (stepNumber) {
      case 1:
        if (!formData.reason.trim()) {
          newErrors.reason = 'Please explain why you want admin access'
        } else if (formData.reason.length < 50) {
          newErrors.reason = 'Please provide a more detailed explanation (minimum 50 characters)'
        }
        if (!formData.role) {
          newErrors.role = 'Please select a role'
        }
        break
      case 2:
        if (!formData.experience.trim()) {
          newErrors.experience = 'Please describe your relevant experience'
        } else if (formData.experience.length < 50) {
          newErrors.experience = 'Please provide more detailed experience (minimum 50 characters)'
        }
        if (!formData.organization.trim()) {
          newErrors.organization = 'Please specify your organization or enter "Independent"'
        }
        break
      case 3:
        if (!formData.references.trim()) {
          newErrors.references = 'Please provide references'
        }
        if (!formData.availability.trim()) {
          newErrors.availability = 'Please specify your availability'
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
      await requestAdminAccess(formData)
      onComplete()
    } catch (error) {
      console.error('Error requesting admin access:', error)
      setErrors({ submit: 'Failed to submit admin request. Please try again.' })
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
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
          <Crown className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Request Admin Access</h2>
          <p className="text-slate-300">Help us build a better platform</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-amber-200 font-medium">Admin Access Review Process</p>
            <p className="text-amber-300/80 mt-1">
              All admin requests are carefully reviewed by our team. We'll contact you within 5-7 business days with a decision.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-white">Desired Admin Role *</Label>
          <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
            <SelectTrigger className={`bg-slate-800/50 border-slate-600 text-white ${
              errors.role ? 'border-red-500' : ''
            }`}>
              <SelectValue placeholder="Select an admin role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {ADMIN_ROLES.map((role) => (
                <SelectItem key={role} value={role} className="text-white hover:bg-slate-700">
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-red-400 text-sm">{errors.role}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-white">Why do you want admin access? *</Label>
          <Textarea
            id="reason"
            placeholder="Explain your motivation for becoming an admin, what you hope to contribute, and how you plan to help the platform grow..."
            value={formData.reason}
            onChange={(e) => updateFormData('reason', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 min-h-[120px] ${
              errors.reason ? 'border-red-500' : ''
            }`}
          />
          <p className="text-xs text-slate-400">{formData.reason.length}/500 characters</p>
          {errors.reason && (
            <p className="text-red-400 text-sm">{errors.reason}</p>
          )}
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
        <h2 className="text-2xl font-bold text-white">Your Experience</h2>
        <p className="text-slate-300">Tell us about your background</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-white">Relevant Experience *</Label>
          <Textarea
            id="experience"
            placeholder="Describe your relevant experience in community management, content moderation, event coordination, or related fields..."
            value={formData.experience}
            onChange={(e) => updateFormData('experience', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 min-h-[120px] ${
              errors.experience ? 'border-red-500' : ''
            }`}
          />
          <p className="text-xs text-slate-400">{formData.experience.length}/500 characters</p>
          {errors.experience && (
            <p className="text-red-400 text-sm">{errors.experience}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization" className="text-white">Current Organization *</Label>
          <Input
            id="organization"
            placeholder="Company, venue, label, or 'Independent'"
            value={formData.organization}
            onChange={(e) => updateFormData('organization', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
              errors.organization ? 'border-red-500' : ''
            }`}
          />
          {errors.organization && (
            <p className="text-red-400 text-sm">{errors.organization}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-white">Previous Roles & Experience Areas</Label>
          
          {formData.previous_roles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.previous_roles.map((role) => (
                <Badge
                  key={role}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 cursor-pointer hover:opacity-80"
                  onClick={() => removePreviousRole(role)}
                >
                  {role}
                  <Settings className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {PREVIOUS_ROLES.filter(role => !formData.previous_roles.includes(role)).map((role) => (
              <Button
                key={role}
                variant="outline"
                size="sm"
                onClick={() => addPreviousRole(role)}
                className="border-slate-600 text-slate-300 hover:bg-yellow-500/20 hover:border-yellow-400/50 justify-start"
              >
                <Award className="h-3 w-3 mr-1" />
                {role}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="certifications" className="text-white">Certifications & Qualifications</Label>
          <Textarea
            id="certifications"
            placeholder="List any relevant certifications, training, or qualifications (optional)"
            value={formData.certifications}
            onChange={(e) => updateFormData('certifications', e.target.value)}
            className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
          />
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
        <h2 className="text-2xl font-bold text-white">Final Details</h2>
        <p className="text-slate-300">References and availability</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="references" className="text-white">Professional References *</Label>
          <Textarea
            id="references"
            placeholder="Provide contact information for 2-3 professional references who can vouch for your work..."
            value={formData.references}
            onChange={(e) => updateFormData('references', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 min-h-[120px] ${
              errors.references ? 'border-red-500' : ''
            }`}
          />
          {errors.references && (
            <p className="text-red-400 text-sm">{errors.references}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability" className="text-white">Availability *</Label>
          <Textarea
            id="availability"
            placeholder="What's your availability? How many hours per week can you commit? What timezone are you in?"
            value={formData.availability}
            onChange={(e) => updateFormData('availability', e.target.value)}
            className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
              errors.availability ? 'border-red-500' : ''
            }`}
          />
          {errors.availability && (
            <p className="text-red-400 text-sm">{errors.availability}</p>
          )}
        </div>

        {/* Application Summary */}
        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <h3 className="font-semibold text-white mb-3">Application Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Role:</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                {formData.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Organization:</span>
              <span className="text-white">{formData.organization}</span>
            </div>
            {formData.previous_roles.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Experience:</span>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {formData.previous_roles.slice(0, 3).map((role) => (
                    <Badge key={role} variant="outline" className="border-slate-500 text-slate-300 text-xs">
                      {role}
                    </Badge>
                  ))}
                  {formData.previous_roles.length > 3 && (
                    <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                      +{formData.previous_roles.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-200 font-medium">What happens next?</p>
              <ul className="text-blue-300/80 mt-1 space-y-1">
                <li>• Your application will be reviewed by our admin team</li>
                <li>• We may contact you for a brief interview</li>
                <li>• You'll receive a decision within 5-7 business days</li>
                <li>• If approved, you'll receive training materials and access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
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
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
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
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : step === 3 ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Submitting...' : step === 3 ? 'Submit Application' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 