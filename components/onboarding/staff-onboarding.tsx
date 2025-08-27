"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Briefcase,
  FileText,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react"

interface OnboardingField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  description?: string
  options?: string[]
}

interface OnboardingData {
  candidate_id: string
  template: {
    id: string
    name: string
    fields: OnboardingField[]
  }
}

export default function StaffOnboarding() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      fetchOnboardingData()
    } else {
      toast({
        title: "Error",
        description: "Invalid onboarding link",
        variant: "destructive"
      })
      router.push("/")
    }
  }, [token])

  async function fetchOnboardingData() {
    try {
      const response = await fetch(`/api/onboarding/${token}`)
      if (response.ok) {
        const data = await response.json()
        setOnboardingData(data.data)
        
        // Initialize form data with empty values
        const initialFormData: Record<string, any> = {}
        data.data.template.fields.forEach((field: OnboardingField) => {
          if (field.type === "multiselect") {
            initialFormData[field.id] = []
          } else if (field.type === "checkbox") {
            initialFormData[field.id] = false
          } else {
            initialFormData[field.id] = ""
          }
        })
        setFormData(initialFormData)
      } else {
        toast({
          title: "Error",
          description: "Invalid or expired onboarding link",
          variant: "destructive"
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load onboarding information",
        variant: "destructive"
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}
    
    onboardingData?.template.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label} is required`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/onboarding/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: formData })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Onboarding completed successfully! You'll be contacted by the admin soon."
        })
        router.push("/dashboard")
      } else {
        throw new Error("Failed to submit onboarding")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit onboarding information",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  function updateFormData(fieldId: string, value: any) {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when field is updated
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  function renderField(field: OnboardingField) {
    const value = formData[field.id]
    const error = errors[field.id]

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-white font-medium">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Input
              id={field.id}
              value={value}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
              placeholder={field.placeholder}
              required={field.required}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {field.description && <p className="text-gray-400 text-sm">{field.description}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-white font-medium">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 min-h-[100px]"
              placeholder={field.placeholder}
              required={field.required}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {field.description && <p className="text-gray-400 text-sm">{field.description}</p>}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-white font-medium">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <select
              id={field.id}
              value={value}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
              required={field.required}
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option} className="bg-slate-800">
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {field.description && <p className="text-gray-400 text-sm">{field.description}</p>}
          </div>
        )

      case "multiselect":
        return (
          <div className="space-y-2">
            <Label className="text-white font-medium">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...value, option]
                        : value.filter((v: string) => v !== option)
                      updateFormData(field.id, newValue)
                    }}
                    className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                  />
                  <span className="text-white text-sm">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {field.description && <p className="text-gray-400 text-sm">{field.description}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Professional Details", icon: Briefcase },
    { id: 3, title: "Documents & Skills", icon: FileText },
    { id: 4, title: "Review & Submit", icon: CheckCircle }
  ]

  const totalSteps = steps.length
  const progressPercentage = (currentStep / totalSteps) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">Loading onboarding information...</p>
        </div>
      </div>
    )
  }

  if (!onboardingData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                  Staff Onboarding
                </h1>
                <p className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-4">
              <div className="w-48">
                <Progress 
                  value={progressPercentage} 
                  className="h-2 bg-white/10"
                />
              </div>
              <span className="text-sm text-gray-400 font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl text-white mb-2">
                {onboardingData.template.name}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Please complete the following information to complete your onboarding
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form className="space-y-6">
                {onboardingData.template.fields.map((field) => (
                  <div key={field.id}>
                    {renderField(field)}
                  </div>
                ))}

                <Separator className="bg-white/10" />

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                    onClick={() => router.push('/dashboard')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  
                  <Button
                    type="button"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Complete Onboarding
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
