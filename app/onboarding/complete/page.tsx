"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from "lucide-react"

interface OnboardingData {
  candidate_id: string
  venue_id: string
  position: string
  department: string
  employment_type: string
  start_date?: string
  template?: {
    name: string
    description?: string
    required_fields: any[]
  }
}

export default function OnboardingCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, any>>({})

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
        
        // Initialize form data
        const initialFormData: Record<string, any> = {}
        if (data.data.template?.required_fields) {
          data.data.template.required_fields.forEach((field: any) => {
            if (field.type === "multiselect") {
              initialFormData[field.id] = []
            } else if (field.type === "checkbox") {
              initialFormData[field.id] = false
            } else {
              initialFormData[field.id] = ""
            }
          })
        }
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

  async function handleSubmit() {
    if (!onboardingData) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: onboardingData.candidate_id,
          responses: formData
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Onboarding completed successfully! Your application is under review."
        })
        router.push("/dashboard")
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit onboarding",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Onboarding</h1>
          <p className="text-slate-400">
            Welcome! Please complete your onboarding for {onboardingData.position} in {onboardingData.department}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm text-white">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {steps[currentStep - 1].icon && React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5 mr-2" })}
                {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Step {currentStep} of {totalSteps}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name" className="text-white">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name || ""}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your full address"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact" className="text-white">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact || ""}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Name and phone number"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience_years" className="text-white">Years of Experience</Label>
                    <Select 
                      value={formData.experience_years?.toString() || ""} 
                      onValueChange={(value) => setFormData({ ...formData, experience_years: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white">
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="0">0-1 years</SelectItem>
                        <SelectItem value="2">2-3 years</SelectItem>
                        <SelectItem value="4">4-5 years</SelectItem>
                        <SelectItem value="6">6-10 years</SelectItem>
                        <SelectItem value="11">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="skills" className="text-white">Skills & Certifications</Label>
                    <Textarea
                      id="skills"
                      value={formData.skills || ""}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="List your relevant skills, certifications, and qualifications"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="previous_employer" className="text-white">Previous Employer</Label>
                    <Input
                      id="previous_employer"
                      value={formData.previous_employer || ""}
                      onChange={(e) => setFormData({ ...formData, previous_employer: e.target.value })}
                      placeholder="Company name and position"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="availability" className="text-white">Availability</Label>
                    <Select 
                      value={formData.availability || ""} 
                      onValueChange={(value) => setFormData({ ...formData, availability: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white">
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="weekends">Weekends Only</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Documents & Skills */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resume" className="text-white">Resume/CV</Label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400 mb-2">Upload your resume or CV</p>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="certifications" className="text-white">Certifications</Label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400 mb-2">Upload relevant certifications</p>
                      <Button variant="outline" size="sm" className="border-slate-600">
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="references" className="text-white">References</Label>
                    <Textarea
                      id="references"
                      value={formData.references || ""}
                      onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                      placeholder="List 2-3 professional references with contact information"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_info" className="text-white">Additional Information</Label>
                    <Textarea
                      id="additional_info"
                      value={formData.additional_info || ""}
                      onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                      placeholder="Any additional information you'd like to share"
                      className="bg-slate-900/50 border-slate-700/50 text-white"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Review Your Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400">Name:</span>
                        <span className="text-white ml-2">{formData.full_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white ml-2">{formData.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white ml-2">{formData.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Experience:</span>
                        <span className="text-white ml-2">{formData.experience_years} years</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Availability:</span>
                        <span className="text-white ml-2">{formData.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">Position Details</h4>
                    <p className="text-white">{onboardingData.position} in {onboardingData.department}</p>
                    <p className="text-slate-400 text-sm">{onboardingData.employment_type.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="border-slate-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Onboarding
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 