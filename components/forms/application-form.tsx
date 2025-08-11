"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Upload, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import type { JobPostingTemplate, ApplicationFormField } from '@/types/admin-onboarding'

interface ApplicationFormProps {
  jobPosting: JobPostingTemplate
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

// Default form fields if no custom template is provided
const defaultFormFields: ApplicationFormField[] = [
  {
    id: 'full_name',
    name: 'full_name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    order: 0
  },
  {
    id: 'email',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email address',
    order: 1
  },
  {
    id: 'phone',
    name: 'phone',
    label: 'Phone Number',
    type: 'phone',
    required: true,
    placeholder: 'Enter your phone number',
    order: 2
  },
  {
    id: 'cover_letter',
    name: 'cover_letter',
    label: 'Cover Letter',
    type: 'textarea',
    required: true,
    placeholder: 'Tell us why you\'re interested in this position and what makes you a great fit...',
    order: 3
  },
  {
    id: 'experience_years',
    name: 'experience_years',
    label: 'Years of Experience',
    type: 'number',
    required: true,
    placeholder: 'Enter years of relevant experience',
    order: 4
  },
  {
    id: 'availability',
    name: 'availability',
    label: 'Availability',
    type: 'select',
    required: true,
    options: ['Immediately', '2 weeks notice', '1 month notice', 'Flexible'],
    order: 5
  },
  {
    id: 'resume',
    name: 'resume',
    label: 'Resume/CV',
    type: 'file',
    required: true,
    order: 6
  }
]

export function ApplicationForm({ jobPosting, onSubmit, onCancel, isLoading }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})
  const { toast } = useToast()

  // Use custom form fields if available, otherwise use defaults
  const formFields = jobPosting.application_form_template?.fields || defaultFormFields
  const sortedFields = formFields.sort((a, b) => a.order - b.order)

  // Create dynamic Zod schema based on form fields
  function createDynamicSchema() {
    const schemaObject: Record<string, any> = {}

    sortedFields.forEach(field => {
      let fieldSchema: any

      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
          fieldSchema = z.string().min(1, `${field.label} is required`)
          if (field.type === 'email') {
            fieldSchema = fieldSchema.email('Please enter a valid email address')
          }
          break
        case 'textarea':
          fieldSchema = z.string().min(10, `${field.label} must be at least 10 characters`)
          break
        case 'number':
          fieldSchema = z.number().min(0, `${field.label} must be a positive number`)
          break
        case 'select':
          fieldSchema = z.string().min(1, `Please select a ${field.label.toLowerCase()}`)
          break
        case 'multiselect':
          fieldSchema = z.array(z.string()).min(1, `Please select at least one ${field.label.toLowerCase()}`)
          break
        case 'checkbox':
          fieldSchema = z.boolean()
          break
        case 'file':
          fieldSchema = z.any() // File validation handled separately
          break
        default:
          fieldSchema = z.string()
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional()
      }

      schemaObject[field.name] = fieldSchema
    })

    return z.object(schemaObject)
  }

  const schema = createDynamicSchema()
  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  })

  const watchedFields = watch()

  async function handleFormSubmit(data: FormData) {
    try {
      // Combine form data with uploaded files
      const submissionData = {
        ...data,
        files: uploadedFiles
      }

      await onSubmit(submissionData)
    } catch (error) {
      console.error('Error submitting application:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive'
      })
    }
  }

  function handleFileUpload(fieldName: string, file: File) {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: file
    }))
  }

  function renderField(field: ApplicationFormField) {
    const fieldError = errors[field.name as keyof FormData]
    const fieldValue = watchedFields[field.name as keyof FormData]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              {...register(field.name as keyof FormData)}
              placeholder={field.placeholder}
              className="bg-slate-700 border-slate-600 text-white"
            />
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              {...register(field.name as keyof FormData)}
              placeholder={field.placeholder}
              className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
            />
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              {...register(field.name as keyof FormData, { valueAsNumber: true })}
              placeholder={field.placeholder}
              className="bg-slate-700 border-slate-600 text-white"
            />
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select onValueChange={(value) => setValue(field.name as keyof FormData, value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option} className="text-white">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    checked={fieldValue && Array.isArray(fieldValue) && fieldValue.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = fieldValue as string[] || []
                      if (checked) {
                        setValue(field.name as keyof FormData, [...currentValues, option] as any)
                      } else {
                        setValue(field.name as keyof FormData, currentValues.filter(v => v !== option) as any)
                      }
                    }}
                  />
                  <Label htmlFor={`${field.name}-${option}`} className="text-white text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={fieldValue as boolean}
              onCheckedChange={(checked) => setValue(field.name as keyof FormData, checked as any)}
            />
            <Label htmlFor={field.name} className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-white">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-400 mb-2">Click to upload or drag and drop</p>
              <p className="text-slate-500 text-sm">PDF, DOC, DOCX up to 10MB</p>
              <Input
                id={field.name}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(field.name, file)
                  }
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(field.name)?.click()}
                className="mt-2"
              >
                Choose File
              </Button>
              {uploadedFiles[field.name] && (
                <div className="mt-2 flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{uploadedFiles[field.name].name}</span>
                </div>
              )}
            </div>
            {fieldError && (
              <p className="text-red-400 text-sm">{fieldError.message}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const totalSteps = Math.ceil(sortedFields.length / 3) // Show 3 fields per step
  const currentFields = sortedFields.slice(currentStep * 3, (currentStep + 1) * 3)

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
        </div>
        <Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2" />
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Form Fields */}
        <div className="space-y-4">
          {currentFields.map(renderField)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!isValid}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Cancel Button */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 