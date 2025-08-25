"use client"

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, Upload, FileText, User, Shield, Calendar } from 'lucide-react'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'
import type { OnboardingCandidate } from '@/types/admin-onboarding'

// Zod schema for onboarding form
const onboardingSchema = z.object({
  personal_info: z.object({
    full_name: z.string().min(1, 'Full name is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    ssn: z.string().min(9, 'SSN must be at least 9 characters'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip_code: z.string().min(5, 'ZIP code is required'),
    phone: z.string().min(10, 'Phone number is required'),
    emergency_contact: z.object({
      name: z.string().min(1, 'Emergency contact name is required'),
      relationship: z.string().min(1, 'Relationship is required'),
      phone: z.string().min(10, 'Emergency contact phone is required')
    })
  }),
  employment_info: z.object({
    start_date: z.string().min(1, 'Start date is required'),
    employment_type: z.enum(['full_time', 'part_time', 'contractor', 'volunteer']),
    salary_expectation: z.number().min(0, 'Salary expectation must be positive'),
    availability: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean()
    })
  }),
  documents: z.object({
    w9_form: z.boolean(),
    i9_form: z.boolean(),
    direct_deposit: z.boolean(),
    emergency_contact_form: z.boolean()
  }),
  certifications: z.array(z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuing_organization: z.string().min(1, 'Issuing organization is required'),
    issue_date: z.string().min(1, 'Issue date is required'),
    expiry_date: z.string().optional(),
    certification_number: z.string().optional()
  })),
  acknowledgments: z.object({
    background_check_consent: z.boolean(),
    drug_test_consent: z.boolean(),
    handbook_acknowledgment: z.boolean(),
    confidentiality_agreement: z.boolean()
  })
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

interface OnboardingWizardProps {
  candidateId: string
  token: string
  onComplete: () => void
}

const steps = [
  { id: 'personal_info', title: 'Personal Information', icon: User },
  { id: 'employment_info', title: 'Employment Details', icon: Calendar },
  { id: 'documents', title: 'Required Documents', icon: FileText },
  { id: 'certifications', title: 'Certifications', icon: Shield },
  { id: 'acknowledgments', title: 'Acknowledgments', icon: CheckCircle }
]

export default function OnboardingWizard({ candidateId, token, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [candidate, setCandidate] = useState<OnboardingCandidate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      personal_info: {
        emergency_contact: {
          name: '',
          relationship: '',
          phone: ''
        }
      },
      employment_info: {
        availability: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        }
      },
      documents: {
        w9_form: false,
        i9_form: false,
        direct_deposit: false,
        emergency_contact_form: false
      },
      certifications: [],
      acknowledgments: {
        background_check_consent: false,
        drug_test_consent: false,
        handbook_acknowledgment: false,
        confidentiality_agreement: false
      }
    }
  })

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control,
    name: 'certifications'
  })

  useEffect(() => {
    loadCandidate()
  }, [])

  async function loadCandidate() {
    try {
      setIsLoading(true)
      setError(null)

      const candidateData = await AdminOnboardingStaffService.getCandidateByToken(token)
      if (!candidateData) {
        setError('Invalid or expired invitation link')
        return
      }

      setCandidate(candidateData)
    } catch (err) {
      console.error('❌ [Onboarding Wizard] Error loading candidate:', err)
      setError('Failed to load candidate information')
      toast({
        title: 'Error',
        description: 'Failed to load candidate information. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFormSubmit(data: OnboardingFormData) {
    try {
      setIsSubmitting(true)

      await AdminOnboardingStaffService.submitOnboardingResponses(candidateId, data)

      toast({
        title: 'Success',
        description: 'Onboarding completed successfully!',
      })

      onComplete()
    } catch (err) {
      console.error('❌ [Onboarding Wizard] Error submitting form:', err)
      toast({
        title: 'Error',
        description: 'Failed to submit onboarding information. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function addCertification() {
    appendCertification({
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiry_date: '',
      certification_number: ''
    })
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Onboarding</h2>
          <p className="text-slate-400">Setting up your onboarding process...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-red-700 text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Onboarding</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={loadCandidate} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Your Onboarding</h1>
          <p className="text-slate-400">
            Please complete the following steps to finalize your onboarding process
          </p>
          {candidate && (
            <p className="text-slate-300 mt-2">
              Position: {candidate.position} • Department: {candidate.department}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm">Progress</span>
            <span className="text-slate-300 text-sm">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center ${
                      isActive ? 'text-purple-400' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {React.createElement(steps[currentStep].icon, { className: 'h-5 w-5' })}
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-slate-300">Full Name *</Label>
                      <Input
                        id="full_name"
                        {...register('personal_info.full_name')}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      {errors.personal_info?.full_name && (
                        <p className="text-red-400 text-sm">{errors.personal_info.full_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth" className="text-slate-300">Date of Birth *</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...register('personal_info.date_of_birth')}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      {errors.personal_info?.date_of_birth && (
                        <p className="text-red-400 text-sm">{errors.personal_info.date_of_birth.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ssn" className="text-slate-300">SSN *</Label>
                      <Input
                        id="ssn"
                        {...register('personal_info.ssn')}
                        placeholder="XXX-XX-XXXX"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      {errors.personal_info?.ssn && (
                        <p className="text-red-400 text-sm">{errors.personal_info.ssn.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-300">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register('personal_info.phone')}
                        placeholder="(555) 123-4567"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      {errors.personal_info?.phone && (
                        <p className="text-red-400 text-sm">{errors.personal_info.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-300">Address</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        {...register('personal_info.address')}
                        placeholder="Street Address"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        {...register('personal_info.city')}
                        placeholder="City"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        {...register('personal_info.state')}
                        placeholder="State"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Input
                      {...register('personal_info.zip_code')}
                      placeholder="ZIP Code"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-300">Emergency Contact</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        {...register('personal_info.emergency_contact.name')}
                        placeholder="Emergency Contact Name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        {...register('personal_info.emergency_contact.relationship')}
                        placeholder="Relationship"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        {...register('personal_info.emergency_contact.phone')}
                        placeholder="Emergency Contact Phone"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-slate-300">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        {...register('employment_info.start_date')}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      {errors.employment_info?.start_date && (
                        <p className="text-red-400 text-sm">{errors.employment_info.start_date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment_type" className="text-slate-300">Employment Type *</Label>
                      <Select onValueChange={(value) => setValue('employment_info.employment_type', value as any)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary_expectation" className="text-slate-300">Salary Expectation *</Label>
                      <Input
                        id="salary_expectation"
                        type="number"
                        {...register('employment_info.salary_expectation', { valueAsNumber: true })}
                        placeholder="Annual salary expectation"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      {errors.employment_info?.salary_expectation && (
                        <p className="text-red-400 text-sm">{errors.employment_info.salary_expectation.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-300">Availability</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            {...register(`employment_info.availability.${day}` as any)}
                          />
                          <Label htmlFor={day} className="text-slate-300 capitalize">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-slate-300">Required Documents</Label>
                    <div className="space-y-4">
                      {[
                        { key: 'w9_form', label: 'W-9 Form' },
                        { key: 'i9_form', label: 'I-9 Form' },
                        { key: 'direct_deposit', label: 'Direct Deposit Form' },
                        { key: 'emergency_contact_form', label: 'Emergency Contact Form' }
                      ].map((doc) => (
                        <div key={doc.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={doc.key}
                            {...register(`documents.${doc.key}` as any)}
                          />
                          <Label htmlFor={doc.key} className="text-slate-300">
                            {doc.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-300">Certifications</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCertification}
                      >
                        Add Certification
                      </Button>
                    </div>

                    {certificationFields.map((field, index) => (
                      <div key={field.id} className="border border-slate-600 rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-slate-300 font-medium">Certification {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Certification Name *</Label>
                            <Input
                              {...register(`certifications.${index}.name`)}
                              placeholder="e.g., First Aid Certification"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">Issuing Organization *</Label>
                            <Input
                              {...register(`certifications.${index}.issuing_organization`)}
                              placeholder="e.g., American Red Cross"
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">Issue Date *</Label>
                            <Input
                              type="date"
                              {...register(`certifications.${index}.issue_date`)}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-300">Expiry Date</Label>
                            <Input
                              type="date"
                              {...register(`certifications.${index}.expiry_date`)}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-slate-300">Acknowledgments</Label>
                    <div className="space-y-4">
                      {[
                        { key: 'background_check_consent', label: 'I consent to a background check' },
                        { key: 'drug_test_consent', label: 'I consent to drug testing' },
                        { key: 'handbook_acknowledgment', label: 'I have read and agree to the employee handbook' },
                        { key: 'confidentiality_agreement', label: 'I agree to maintain confidentiality' }
                      ].map((ack) => (
                        <div key={ack.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={ack.key}
                            {...register(`acknowledgments.${ack.key}` as any)}
                          />
                          <Label htmlFor={ack.key} className="text-slate-300">
                            {ack.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 