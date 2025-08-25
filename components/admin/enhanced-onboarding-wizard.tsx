"use client"

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  User, 
  Settings,
  ArrowRight,
  Play,
  BookOpen,
  Users,
  BarChart3,
  Globe,
  Calendar,
  Upload,
  FileText,
  Shield,
  Award,
  AlertTriangle,
  CheckSquare,
  Square,
  Download,
  Eye,
  Send,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Star,
  Plus,
  X,
  Trash2,
  Edit,
  Save,
  Camera,
  File,
  Lock,
  Unlock,
  EyeOff,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Share2,
  Link,
  Building,
  Globe as GlobeIcon,
  ExternalLink as ExternalLinkIcon,
  Copy as CopyIcon,
  Share2 as Share2Icon,
  Link as LinkIcon,
  Building as BuildingIcon
} from 'lucide-react'
import type { 
  OnboardingCandidate, 
  OnboardingWorkflow, 
  OnboardingStep,
  OnboardingActivity 
} from '@/types/admin-onboarding'

interface EnhancedOnboardingWizardProps {
  candidate: OnboardingCandidate
  workflow: OnboardingWorkflow
  onUpdateProgress: (candidateId: string, progress: number, stage?: string) => Promise<void>
  onCompleteStep: (candidateId: string, stepId: string) => Promise<void>
  onUploadDocument: (candidateId: string, documentType: string, file: File) => Promise<string>
  onSendMessage: (candidateId: string, message: string) => Promise<void>
  venueId: string
}

// Enhanced Zod schema for onboarding form
const onboardingFormSchema = z.object({
  personal_info: z.object({
    legal_name: z.string().min(1, 'Legal name is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX'),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zip: z.string().min(5, 'ZIP code is required'),
      country: z.string().min(1, 'Country is required')
    }),
    emergency_contact: z.object({
      name: z.string().min(1, 'Emergency contact name is required'),
      relationship: z.string().min(1, 'Relationship is required'),
      phone: z.string().min(1, 'Phone number is required'),
      email: z.string().email('Valid email is required')
    })
  }),
  employment_info: z.object({
    employment_type: z.enum(['full_time', 'part_time', 'contractor', 'volunteer']),
    start_date: z.string().min(1, 'Start date is required'),
    hourly_rate: z.number().min(0, 'Hourly rate must be positive'),
    tax_form: z.enum(['w2', 'w9', '1099']),
    direct_deposit: z.object({
      bank_name: z.string().min(1, 'Bank name is required'),
      account_number: z.string().min(1, 'Account number is required'),
      routing_number: z.string().min(1, 'Routing number is required'),
      account_type: z.enum(['checking', 'savings'])
    })
  }),
  documents: z.object({
    id_upload: z.string().optional(),
    w9_form: z.string().optional(),
    i9_form: z.string().optional(),
    direct_deposit_form: z.string().optional(),
    emergency_contact_form: z.string().optional(),
    certifications: z.array(z.string()).optional()
  }),
  compliance: z.object({
    background_check_consent: z.boolean(),
    drug_test_consent: z.boolean(),
    confidentiality_agreement: z.boolean(),
    code_of_conduct: z.boolean(),
    safety_training: z.boolean(),
    harassment_training: z.boolean()
  }),
  training: z.object({
    safety_completed: z.boolean(),
    harassment_completed: z.boolean(),
    emergency_procedures: z.boolean(),
    equipment_training: z.boolean(),
    customer_service: z.boolean()
  })
})

type OnboardingFormData = z.infer<typeof onboardingFormSchema>

interface OnboardingStepData {
  step: OnboardingStep
  isCompleted: boolean
  isBlocked: boolean
  progress: number
  documents: string[]
  notes: string
}

export default function EnhancedOnboardingWizard({
  candidate,
  workflow,
  onUpdateProgress,
  onCompleteStep,
  onUploadDocument,
  onSendMessage,
  venueId
}: EnhancedOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [stepData, setStepData] = useState<OnboardingStepData[]>([])
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('')
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [overallProgress, setOverallProgress] = useState(candidate.onboarding_progress || 0)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      personal_info: {
        legal_name: candidate.name,
        date_of_birth: '',
        ssn: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'USA'
        },
        emergency_contact: {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        }
      },
      employment_info: {
        employment_type: candidate.employment_type,
        start_date: '',
        hourly_rate: 0,
        tax_form: 'w2',
        direct_deposit: {
          bank_name: '',
          account_number: '',
          routing_number: '',
          account_type: 'checking'
        }
      },
      documents: {
        id_upload: '',
        w9_form: '',
        i9_form: '',
        direct_deposit_form: '',
        emergency_contact_form: '',
        certifications: []
      },
      compliance: {
        background_check_consent: false,
        drug_test_consent: false,
        confidentiality_agreement: false,
        code_of_conduct: false,
        safety_training: false,
        harassment_training: false
      },
      training: {
        safety_completed: false,
        harassment_completed: false,
        emergency_procedures: false,
        equipment_training: false,
        customer_service: false
      }
    }
  })

  // Initialize step data
  useEffect(() => {
    const steps = workflow.steps || []
    const initialStepData = steps.map((step, index) => ({
      step,
      isCompleted: false,
      isBlocked: false,
      progress: 0,
      documents: [],
      notes: ''
    }))
    setStepData(initialStepData)
  }, [workflow])

  // Calculate overall progress
  useEffect(() => {
    if (stepData.length > 0) {
      const completedSteps = stepData.filter(step => step.isCompleted).length
      const progress = Math.round((completedSteps / stepData.length) * 100)
      setOverallProgress(progress)
    }
  }, [stepData])

  const handleDocumentUpload = async (file: File) => {
    if (!selectedDocumentType) return

    try {
      setUploadingDocument(true)
      const documentUrl = await onUploadDocument(candidate.id, selectedDocumentType, file)
      
      // Update form data with document URL
      setValue(`documents.${selectedDocumentType}` as any, documentUrl)
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully.",
      })
      
      setShowDocumentUpload(false)
      setSelectedDocumentType('')
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleCompleteStep = async (stepIndex: number) => {
    try {
      const step = stepData[stepIndex]
      await onCompleteStep(candidate.id, step.step.id)
      
      // Update step data
      const updatedStepData = [...stepData]
      updatedStepData[stepIndex] = {
        ...step,
        isCompleted: true,
        progress: 100
      }
      setStepData(updatedStepData)
      
      // Update overall progress
      await onUpdateProgress(candidate.id, overallProgress + (100 / stepData.length))
      
      toast({
        title: "Step Completed",
        description: "Step has been marked as completed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    try {
      await onSendMessage(candidate.id, messageText)
      setShowMessageDialog(false)
      setMessageText('')
      toast({
        title: "Message Sent",
        description: "Message has been sent to the candidate.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'document':
        return <FileText className="h-5 w-5" />
      case 'training':
        return <BookOpen className="h-5 w-5" />
      case 'meeting':
        return <Users className="h-5 w-5" />
      case 'setup':
        return <Settings className="h-5 w-5" />
      case 'review':
        return <Eye className="h-5 w-5" />
      case 'task':
        return <CheckSquare className="h-5 w-5" />
      case 'approval':
        return <Award className="h-5 w-5" />
      default:
        return <Square className="h-5 w-5" />
    }
  }

  const getStepStatus = (step: OnboardingStepData) => {
    if (step.isCompleted) return 'completed'
    if (step.isBlocked) return 'blocked'
    if (step.progress > 0) return 'in_progress'
    return 'pending'
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'blocked':
        return 'text-red-500'
      case 'in_progress':
        return 'text-yellow-500'
      default:
        return 'text-slate-400'
    }
  }

  const renderStepContent = (stepIndex: number) => {
    const step = stepData[stepIndex]
    if (!step) return null

    switch (step.step.step_type) {
      case 'document':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{step.step.title}</h3>
              <p className="text-slate-400">{step.step.description}</p>
              
              {step.step.instructions && (
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Instructions:</h4>
                  <p className="text-slate-300 text-sm">{step.step.instructions}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Required Documents</Label>
                  <Button
                    onClick={() => {
                      setSelectedDocumentType(step.step.title.toLowerCase().replace(/\s+/g, '_'))
                      setShowDocumentUpload(true)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
                
                {step.documents.length > 0 && (
                  <div className="space-y-2">
                    {step.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-white text-sm">Document {index + 1}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'training':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{step.step.title}</h3>
              <p className="text-slate-400">{step.step.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="h-4 w-4 text-blue-500" />
                      <h4 className="font-medium text-white">Training Video</h4>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">Watch the required training video</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-2" />
                      Start Training
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-white">Quiz</h4>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">Complete the training quiz</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Take Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'meeting':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{step.step.title}</h3>
              <p className="text-slate-400">{step.step.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">Schedule Meeting</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Meeting Type</Label>
                      <Select>
                        <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                          <SelectValue placeholder="Select meeting type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orientation">Orientation</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="review">Performance Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white text-sm">Date & Time</Label>
                      <Input
                        type="datetime-local"
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                    
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">Meeting Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Add meeting notes..."
                      className="bg-slate-600 border-slate-500 text-white min-h-[120px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">{step.step.title}</h3>
              <p className="text-slate-400">{step.step.description}</p>
              
              {step.step.instructions && (
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Instructions:</h4>
                  <p className="text-slate-300 text-sm">{step.step.instructions}</p>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-white">Onboarding Wizard</CardTitle>
              <p className="text-slate-400">
                Complete your onboarding process for {candidate.position}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMessageDialog(true)}
                variant="outline"
                className="bg-slate-700 border-slate-600"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
              <span className="text-slate-400">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Steps Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Steps List */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">Onboarding Steps</h3>
              <div className="space-y-2">
                {stepData.map((step, index) => {
                  const status = getStepStatus(step)
                  const isActive = index === currentStep - 1
                  
                  return (
                    <div
                      key={step.step.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-purple-600 border-purple-500' 
                          : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                      } border`}
                      onClick={() => setCurrentStep(index + 1)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${getStepStatusColor(status)}`}>
                          {getStepIcon(step.step.step_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{step.step.title}</h4>
                          <p className="text-slate-400 text-sm">{step.step.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-slate-400 text-sm">
                            {step.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="lg:col-span-2">
              <div className="bg-slate-700 rounded-lg p-6">
                {stepData.length > 0 && renderStepContent(currentStep - 1)}
                
                {/* Step Actions */}
                <div className="flex justify-between pt-6 border-t border-slate-600 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCompleteStep(currentStep - 1)}
                      disabled={stepData[currentStep - 1]?.isCompleted}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Step
                    </Button>
                    
                    {currentStep < stepData.length ? (
                      <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          // Handle onboarding completion
                          onUpdateProgress(candidate.id, 100, 'completed')
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Complete Onboarding
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Document Type</Label>
              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id_upload">Government ID</SelectItem>
                  <SelectItem value="w9_form">W9 Form</SelectItem>
                  <SelectItem value="i9_form">I9 Form</SelectItem>
                  <SelectItem value="direct_deposit_form">Direct Deposit Form</SelectItem>
                  <SelectItem value="emergency_contact_form">Emergency Contact Form</SelectItem>
                  <SelectItem value="certifications">Certifications</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">File</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleDocumentUpload(file)
                  }
                }}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowDocumentUpload(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Send Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Message</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button
                onClick={() => setShowMessageDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 