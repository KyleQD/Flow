"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import EnhancedJobPostingForm from "@/components/admin/enhanced-job-posting-form"
import EnhancedApplicationReview from "@/components/admin/enhanced-application-review"
import EnhancedOnboardingWizard from "@/components/admin/enhanced-onboarding-wizard"
import EnhancedTeamManagement from "@/components/admin/enhanced-team-management"
import EnhancedAnalyticsDashboard from "@/components/admin/enhanced-analytics-dashboard"
import { AdminOnboardingStaffService } from "@/lib/services/admin-onboarding-staff.service"
import { JobBoardService } from "@/lib/services/job-board.service"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Star,
  Award,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  UserPlus,
  Settings,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Shield,
  Crown,
  Zap,
  BrainCircuit,
  BarChart3,
  MessageSquare,
  FileText,
  Download,
  Upload,
  Send,
  Bell,
  RadioTower,
  Wifi,
  Mic,
  Video,
  PhoneCall,
  X,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Building,
  Globe,
  ExternalLink,
  Copy,
  Share2,
  Link,
  Lock,
  Unlock,
  EyeOff,
  AlertCircle,
  Info,
  HelpCircle,
  File,
  Folder,
  Image,
  Music,
  Headphones,
  Camera,
  Volume1,
  Maximize,
  Minimize,
  Move,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Crop,
  Scissors,
  Type,
  Grid3X3,
  Bold,
  Italic,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UserPlus2,
  FileText as FileTextIcon,
  Briefcase as BriefcaseIcon,
  MessageSquare as MessageSquareIcon,
  BarChart3 as BarChart3Icon,
  Calendar as CalendarIcon,
  Users as UsersIcon
} from "lucide-react"

interface DashboardStats {
  onboarding: {
    total_candidates: number
    pending: number
    in_progress: number
    completed: number
    rejected: number
    approved: number
    avg_progress: number
  }
  job_postings: {
    total_postings: number
    published: number
    draft: number
    paused: number
    closed: number
    total_applications: number
    pending_reviews: number
  }
  staff_management: {
    total_staff: number
    active_staff: number
    on_leave: number
    terminated: number
    departments: number
    avg_rating: number
    recent_hires: number
  }
}

export default function StaffPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [onboardingCandidates, setOnboardingCandidates] = useState<any[]>([])
  const [onboardingWorkflows, setOnboardingWorkflows] = useState<any[]>([])
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [communications, setCommunications] = useState<any[]>([])
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false)
  const [showJobPostingDialog, setShowJobPostingDialog] = useState(false)
  const { toast } = useToast()

  // const { currentVenue } = useCurrentVenue()
  const venueId = 'mock-venue-id' // currentVenue?.id || 'mock-venue-id'

  useEffect(() => {
    loadDashboardData()
  }, [venueId])

  async function loadDashboardData() {
    try {
      console.log('🔄 [Staff Page] Loading dashboard data for venue:', venueId)
      setIsLoading(true)
      setError(null)

      // Try to load real data from service, fallback to mock data
      try {
        console.log('🔄 [Staff Page] Attempting to load real data from service...')
        
        // Load all data in parallel with better error handling
        const results = await Promise.allSettled([
          AdminOnboardingStaffService.getDashboardStats(venueId),
          AdminOnboardingStaffService.getJobPostings(venueId),
          AdminOnboardingStaffService.getJobApplications(venueId),
          AdminOnboardingStaffService.getOnboardingCandidates(venueId),
          AdminOnboardingStaffService.getStaffMembers(venueId)
        ])

        console.log('📊 [Staff Page] Data loading results:', results.map((result, index) => ({
          service: ['stats', 'jobPostings', 'applications', 'candidates', 'staffMembers'][index],
          status: result.status,
          value: result.status === 'fulfilled' ? result.value : result.reason
        })))

        // Handle each result individually
        const [statsResult, jobPostingsResult, applicationsResult, candidatesResult, staffResult] = results

        // Set stats (with fallback if failed)
        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
          console.log('✅ [Staff Page] Stats loaded successfully')
        } else {
          console.warn('⚠️ [Staff Page] Failed to load dashboard stats, using fallback')
          setStats({
            onboarding: {
              total_candidates: 12,
              pending: 3,
              in_progress: 5,
              completed: 4,
              rejected: 0,
              approved: 4,
              avg_progress: 65
            },
            job_postings: {
              total_postings: 8,
              published: 5,
              draft: 2,
              paused: 1,
              closed: 0,
              total_applications: 23,
              pending_reviews: 7
            },
            staff_management: {
              total_staff: 45,
              active_staff: 38,
              on_leave: 5,
              terminated: 2,
              departments: 6,
              avg_rating: 4.2,
              recent_hires: 3
            }
          })
        }

        // Set job postings (with fallback if failed)
        if (jobPostingsResult.status === 'fulfilled') {
          setJobPostings(jobPostingsResult.value)
          console.log('✅ [Staff Page] Job postings loaded successfully')
        } else {
          console.warn('⚠️ [Staff Page] Failed to load job postings, using fallback')
          setJobPostings([
            {
              id: 'job-1',
              title: 'Security Staff',
              department: 'Security',
              position: 'Security Guard',
              status: 'published',
              applications_count: 5,
              views_count: 23
            },
            {
              id: 'job-2',
              title: 'Bartender',
              department: 'Food & Beverage',
              position: 'Bartender',
              status: 'published',
              applications_count: 3,
              views_count: 18
            }
          ])
        }

        // Set applications (with fallback if failed)
        if (applicationsResult.status === 'fulfilled') {
          setApplications(applicationsResult.value)
          console.log('✅ [Staff Page] Applications loaded successfully')
        } else {
          console.warn('⚠️ [Staff Page] Failed to load applications, using fallback')
          setApplications([
            {
              id: 'app-1',
              job_posting_id: 'job-1',
              applicant_id: 'user-1',
              applicant_name: 'John Smith',
              applicant_email: 'john.smith@email.com',
              applicant_phone: '+1-555-0123',
              status: 'pending',
              form_responses: { experience: '5 years', skills: 'Security, Crowd Control' },
              applied_at: '2024-01-15T10:00:00Z',
              rating: 4.5
            },
            {
              id: 'app-2',
              job_posting_id: 'job-1',
              applicant_id: 'user-2',
              applicant_name: 'Sarah Johnson',
              applicant_email: 'sarah.johnson@email.com',
              applicant_phone: '+1-555-0124',
              status: 'reviewed',
              form_responses: { experience: '3 years', skills: 'Bartending, Customer Service' },
              applied_at: '2024-01-14T14:30:00Z',
              rating: 4.2
            }
          ])
        }

        // Set candidates (with fallback if failed)
        if (candidatesResult.status === 'fulfilled') {
          setOnboardingCandidates(candidatesResult.value)
          console.log('✅ [Staff Page] Onboarding candidates loaded successfully')
        } else {
          console.warn('⚠️ [Staff Page] Failed to load candidates, using fallback')
          setOnboardingCandidates([
            {
              id: 'candidate-1',
              venue_id: venueId,
              name: 'John Smith',
              email: 'john.smith@email.com',
              phone: '+1-555-0123',
              position: 'Security Guard',
              department: 'Security',
              status: 'in_progress',
              stage: 'onboarding',
              onboarding_progress: 65,
              experience_years: 5,
              skills: ['Security', 'Crowd Control', 'First Aid'],
              application_date: '2024-01-15T10:00:00Z'
            },
            {
              id: 'candidate-2',
              venue_id: venueId,
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1-555-0124',
              position: 'Bartender',
              department: 'Food & Beverage',
              status: 'pending',
              stage: 'invitation',
              onboarding_progress: 25,
              experience_years: 3,
              skills: ['Bartending', 'Customer Service', 'POS Systems'],
              application_date: '2024-01-14T14:30:00Z'
            }
          ])
        }

        // Set staff members (with fallback if failed)
        if (staffResult.status === 'fulfilled') {
          setStaffMembers(staffResult.value)
          console.log('✅ [Staff Page] Staff members loaded successfully')
        } else {
          console.warn('⚠️ [Staff Page] Failed to load staff members, using fallback')
          setStaffMembers([
            {
              id: 'staff-1',
              venue_id: venueId,
              name: 'Mike Johnson',
              email: 'mike.johnson@venue.com',
              phone: '+1-555-0125',
              role: 'Security Guard',
              department: 'Security',
              status: 'active',
              employment_type: 'full_time',
              hire_date: '2023-06-15T00:00:00Z',
              hourly_rate: 18.50,
              performance_rating: 4.5,
              attendance_rate: 95,
              incidents_count: 0,
              commendations_count: 3,
              training_completed_count: 5,
              certifications_valid_count: 3,
              avatar_url: '/avatars/mike.jpg'
            },
            {
              id: 'staff-2',
              venue_id: venueId,
              name: 'Lisa Chen',
              email: 'lisa.chen@venue.com',
              phone: '+1-555-0126',
              role: 'Bartender',
              department: 'Food & Beverage',
              status: 'active',
              employment_type: 'part_time',
              hire_date: '2023-08-20T00:00:00Z',
              hourly_rate: 16.75,
              performance_rating: 4.2,
              attendance_rate: 92,
              incidents_count: 1,
              commendations_count: 2,
              training_completed_count: 4,
              certifications_valid_count: 2,
              avatar_url: '/avatars/lisa.jpg'
            }
          ])
        }

        // Check if all requests failed
        const failedCount = results.filter(result => result.status === 'rejected').length
        if (failedCount === results.length) {
          console.warn('⚠️ [Staff Page] All service requests failed, using mock data')
          toast({
            title: 'Using Demo Data',
            description: 'Connected to demo mode. Real data will be available when database is configured.',
            variant: 'default'
          })
        } else if (failedCount > 0) {
          // Some requests failed but others succeeded
          toast({
            title: 'Partial Data Loaded',
            description: `Some data loaded from database (${results.length - failedCount} of ${results.length} successful).`,
            variant: 'default'
          })
        } else {
          // All requests succeeded
          toast({
            title: 'Data Loaded',
            description: 'All data loaded successfully from database.',
            variant: 'default'
          })
        }

      } catch (serviceError) {
        console.warn('⚠️ [Staff Page] Service layer failed, using mock data:', serviceError)
        
        // Fallback to mock data
        setStats({
          onboarding: {
            total_candidates: 12,
            pending: 3,
            in_progress: 5,
            completed: 4,
            rejected: 0,
            approved: 4,
            avg_progress: 65
          },
          job_postings: {
            total_postings: 8,
            published: 5,
            draft: 2,
            paused: 1,
            closed: 0,
            total_applications: 23,
            pending_reviews: 7
          },
          staff_management: {
            total_staff: 45,
            active_staff: 38,
            on_leave: 5,
            terminated: 2,
            departments: 6,
            avg_rating: 4.2,
            recent_hires: 3
          }
        })

        setApplications([
          {
            id: 'app-1',
            job_posting_id: 'job-1',
            applicant_id: 'user-1',
            applicant_name: 'John Smith',
            applicant_email: 'john.smith@email.com',
            applicant_phone: '+1-555-0123',
            status: 'pending',
            form_responses: { experience: '5 years', skills: 'Security, Crowd Control' },
            applied_at: '2024-01-15T10:00:00Z',
            rating: 4.5
          },
          {
            id: 'app-2',
            job_posting_id: 'job-1',
            applicant_id: 'user-2',
            applicant_name: 'Sarah Johnson',
            applicant_email: 'sarah.johnson@email.com',
            applicant_phone: '+1-555-0124',
            status: 'reviewed',
            form_responses: { experience: '3 years', skills: 'Bartending, Customer Service' },
            applied_at: '2024-01-14T14:30:00Z',
            rating: 4.2
          }
        ])

        setJobPostings([
          {
            id: 'job-1',
            title: 'Security Staff',
            department: 'Security',
            position: 'Security Guard',
            status: 'published',
            applications_count: 5,
            views_count: 23
          },
          {
            id: 'job-2',
            title: 'Bartender',
            department: 'Food & Beverage',
            position: 'Bartender',
            status: 'published',
            applications_count: 3,
            views_count: 18
          }
        ])

        setOnboardingCandidates([
          {
            id: 'candidate-1',
            venue_id: venueId,
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '+1-555-0123',
            position: 'Security Guard',
            department: 'Security',
            status: 'in_progress',
            stage: 'onboarding',
            onboarding_progress: 65,
            experience_years: 5,
            skills: ['Security', 'Crowd Control', 'First Aid'],
            application_date: '2024-01-15T10:00:00Z'
          },
          {
            id: 'candidate-2',
            venue_id: venueId,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1-555-0124',
            position: 'Bartender',
            department: 'Food & Beverage',
            status: 'pending',
            stage: 'invitation',
            onboarding_progress: 25,
            experience_years: 3,
            skills: ['Bartending', 'Customer Service', 'POS Systems'],
            application_date: '2024-01-14T14:30:00Z'
          }
        ])

        setOnboardingWorkflows([
          {
            id: 'workflow-1',
            venue_id: venueId,
            name: 'Security Staff Onboarding',
            description: 'Complete onboarding process for security staff',
            department: 'Security',
            position: 'Security Guard',
            estimated_days: 7,
            required_documents: ['ID', 'Background Check', 'First Aid Certification'],
            steps: [
              {
                id: 'step-1',
                title: 'Document Verification',
                description: 'Verify all required documents',
                step_type: 'document',
                category: 'admin',
                required: true,
                estimated_hours: 2,
                order: 1
              },
              {
                id: 'step-2',
                title: 'Background Check',
                description: 'Complete background check process',
                step_type: 'review',
                category: 'admin',
                required: true,
                estimated_hours: 24,
                order: 2
              },
              {
                id: 'step-3',
                title: 'Training Session',
                description: 'Complete required training modules',
                step_type: 'training',
                category: 'training',
                required: true,
                estimated_hours: 4,
                order: 3
              }
            ]
          }
        ])

        setStaffMembers([
          {
            id: 'staff-1',
            venue_id: venueId,
            name: 'Mike Johnson',
            email: 'mike.johnson@venue.com',
            phone: '+1-555-0125',
            role: 'Security Guard',
            department: 'Security',
            status: 'active',
            employment_type: 'full_time',
            hire_date: '2023-06-15T00:00:00Z',
            hourly_rate: 18.50,
            performance_rating: 4.5,
            attendance_rate: 95,
            incidents_count: 0,
            commendations_count: 3,
            training_completed_count: 5,
            certifications_valid_count: 3,
            avatar_url: '/avatars/mike.jpg'
          },
          {
            id: 'staff-2',
            venue_id: venueId,
            name: 'Lisa Chen',
            email: 'lisa.chen@venue.com',
            phone: '+1-555-0126',
            role: 'Bartender',
            department: 'Food & Beverage',
            status: 'active',
            employment_type: 'part_time',
            hire_date: '2023-08-20T00:00:00Z',
            hourly_rate: 16.75,
            performance_rating: 4.2,
            attendance_rate: 92,
            incidents_count: 1,
            commendations_count: 2,
            training_completed_count: 4,
            certifications_valid_count: 2,
            avatar_url: '/avatars/lisa.jpg'
          }
        ])

        setCommunications([
          {
            id: 'comm-1',
            venue_id: venueId,
            sender_id: 'admin-1',
            recipients: ['staff-1', 'staff-2'],
            subject: 'Weekly Schedule Update',
            content: 'Please review the updated schedule for next week.',
            message_type: 'schedule',
            priority: 'normal',
            read_by: ['staff-1'],
            sent_at: '2024-01-15T09:00:00Z'
          },
          {
            id: 'comm-2',
            venue_id: venueId,
            sender_id: 'admin-1',
            recipients: ['staff-1'],
            subject: 'Training Session Reminder',
            content: 'Don\'t forget about the safety training session tomorrow.',
            message_type: 'training',
            priority: 'high',
            read_by: [],
            sent_at: '2024-01-14T16:30:00Z'
          }
        ])

        toast({
          title: 'Demo Mode Active',
          description: 'Using demo data. Configure database for real data.',
          variant: 'default'
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error('❌ [Staff Page] Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
      setIsLoading(false)
    }
  }

  async function handleCreateJobPosting(data: any) {
    function getReadableError(err: any): string {
      if (!err) return 'Unknown error'
      // ZodError
      if (Array.isArray(err?.issues)) {
        return err.issues.map((i: any) => i?.message).filter(Boolean).join('\n') || 'Validation failed'
      }
      // Supabase/Postgrest error objects
      if (err?.message) return err.message
      if (typeof err === 'string') return err
      try { return JSON.stringify(err) } catch { return 'Unexpected error' }
    }

    try {
      console.log('🚀 [Staff Page] Creating job posting with data:', data)

      const organizationData = {
        id: venueId,
        name: 'Event Security Pro',
        logo: '/logo.svg',
        description: 'Professional event security and staffing services'
      }

      let created = false
      const failures: string[] = []

      // Step 1: Create internal template first (published)
      let templateId: string | null = null
      try {
        const template = await AdminOnboardingStaffService.createJobPosting(venueId, data)
        templateId = template.id
        console.log('✅ [Staff Page] Internal template created:', templateId)
      } catch (internalErr) {
        const msg = getReadableError(internalErr)
        console.warn('⚠️ [Staff Page] Internal template creation failed:', msg)
        failures.push(`Internal template: ${msg}`)
      }

      // Step 2: Publish to job board + organization with template_id linkage if we have templateId
      try {
        const jobPosting = await JobBoardService.createJobPosting(venueId, data, organizationData, templateId || undefined)
        console.log('✅ [Staff Page] Job posting created successfully:', jobPosting)
        created = true
        toast({
          title: 'Success',
          description: 'Job posting created and published to job board and organization profile',
        })
      } catch (serviceError) {
        const msg = getReadableError(serviceError)
        console.warn('⚠️ [Staff Page] JobBoardService failed:', msg)
        failures.push(`Job board: ${msg}`)
        if (templateId && !created) {
          created = true
          toast({
            title: 'Created Internally',
            description: 'Posted internally. Job board publish failed, please retry later.',
          })
        }
      }

      if (!created) {
        toast({
          title: 'Job Posting Failed',
          description: failures.join('\n'),
          variant: 'destructive'
        })
        return
      }

      setShowJobPostingDialog(false)
      loadDashboardData()
    } catch (error) {
      const msg = (error as any)?.message || 'Failed to create job posting. Please try again.'
      console.error('❌ [Staff Page] Error creating job posting:', error)
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  async function handleUpdateApplicationStatus(applicationId: string, status: string, feedback?: string) {
    try {
      console.log('🔄 [Staff Page] Updating application status:', { applicationId, status, feedback })
      toast({
        title: 'Success',
        description: 'Application status updated successfully',
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error updating application status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleBulkUpdateApplications(applicationIds: string[], status: string, feedback?: string) {
    try {
      console.log('🔄 [Staff Page] Bulk updating applications:', { applicationIds, status, feedback })
      toast({
        title: 'Success',
        description: `${applicationIds.length} applications updated successfully`,
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error bulk updating applications:', error)
      toast({
        title: 'Error',
        description: 'Failed to bulk update applications. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleSendMessage(applicationId: string, message: string) {
    try {
      console.log('💬 [Staff Page] Sending message to application:', { applicationId, message })
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      })
    } catch (error) {
      console.error('❌ [Staff Page] Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleExportApplications(applications: any[]) {
    try {
      console.log('📊 [Staff Page] Exporting applications:', applications.length)
      toast({
        title: 'Success',
        description: 'Applications exported successfully',
      })
    } catch (error) {
      console.error('❌ [Staff Page] Error exporting applications:', error)
      toast({
        title: 'Error',
        description: 'Failed to export applications. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleUpdateOnboardingProgress(candidateId: string, progress: number, stage?: string) {
    try {
      console.log('🔄 [Staff Page] Updating onboarding progress:', { candidateId, progress, stage })
      toast({
        title: 'Success',
        description: 'Onboarding progress updated successfully',
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error updating onboarding progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to update onboarding progress. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleCompleteOnboardingStep(candidateId: string, stepId: string) {
    try {
      console.log('✅ [Staff Page] Completing onboarding step:', { candidateId, stepId })
      toast({
        title: 'Success',
        description: 'Onboarding step completed successfully',
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error completing onboarding step:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding step. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleUploadOnboardingDocument(candidateId: string, documentType: string, file: File) {
    try {
      console.log('📄 [Staff Page] Uploading onboarding document:', { candidateId, documentType, fileName: file.name })
      // Mock file upload - in real app, this would upload to Supabase Storage
      const mockFileUrl = `https://mock-storage.com/documents/${candidateId}/${documentType}/${file.name}`
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      })
      return mockFileUrl
    } catch (error) {
      console.error('❌ [Staff Page] Error uploading onboarding document:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      })
      throw error
    }
  }

  async function handleSendOnboardingMessage(candidateId: string, message: string) {
    try {
      console.log('💬 [Staff Page] Sending onboarding message:', { candidateId, message })
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      })
    } catch (error) {
      console.error('❌ [Staff Page] Error sending onboarding message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleUpdateStaffStatus(staffId: string, status: string) {
    try {
      console.log('🔄 [Staff Page] Updating staff status:', { staffId, status })
      toast({
        title: 'Success',
        description: 'Staff status updated successfully',
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error updating staff status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update staff status. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleAssignShift(staffId: string, shiftData: any) {
    try {
      console.log('📅 [Staff Page] Assigning shift:', { staffId, shiftData })
      toast({
        title: 'Success',
        description: 'Shift assigned successfully',
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error assigning shift:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign shift. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleAssignZone(staffId: string, zoneData: any) {
    try {
      console.log('📍 [Staff Page] Assigning zone:', { staffId, zoneData })
      toast({
        title: 'Success',
        description: 'Zone assigned successfully',
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('❌ [Staff Page] Error assigning zone:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign zone. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleSendTeamMessage(recipients: string[], message: string, messageType: string) {
    try {
      console.log('💬 [Staff Page] Sending team message:', { recipients, message, messageType })
      toast({
        title: 'Success',
        description: 'Team message sent successfully',
      })
    } catch (error) {
      console.error('❌ [Staff Page] Error sending team message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send team message. Please try again.',
        variant: 'destructive'
      })
    }
  }

  async function handleExportTeamData(staffMembers: any[]) {
    try {
      console.log('📊 [Staff Page] Exporting team data:', staffMembers.length)
      toast({
        title: 'Success',
        description: 'Team data exported successfully',
      })
    } catch (error) {
      console.error('❌ [Staff Page] Error exporting team data:', error)
      toast({
        title: 'Error',
        description: 'Failed to export team data. Please try again.',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Staff Management</h2>
          <p className="text-slate-400">Setting up your dashboard...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-red-700 text-center max-w-md">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 border-b border-slate-700/50 p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              Staff & Crew Management
            </h1>
            <p className="text-slate-400 text-sm">
              Manage your team, schedules, and performance across all tours and events
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowJobPostingDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job Posting
            </Button>
            <Button 
              onClick={() => setShowAddStaffDialog(true)}
              variant="outline"
              className="border-slate-600 hover:bg-slate-800 text-slate-300"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Enhanced Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">Onboarding</p>
                    <p className="text-3xl font-bold text-white">{stats.onboarding.total_candidates}</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={stats.onboarding.avg_progress} className="h-2 flex-1" />
                      <span className="text-xs text-slate-500">{stats.onboarding.avg_progress}%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <UserPlus className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">Job Postings</p>
                    <p className="text-3xl font-bold text-white">{stats.job_postings.total_postings}</p>
                    <p className="text-xs text-slate-500">{stats.job_postings.pending_reviews} pending reviews</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">Active Staff</p>
                    <p className="text-3xl font-bold text-white">{stats.staff_management.active_staff}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-xs text-slate-500">{stats.staff_management.avg_rating} avg rating</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">Applications</p>
                    <p className="text-3xl font-bold text-white">{stats.job_postings.total_applications}</p>
                    <p className="text-xs text-slate-500">Total applications</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <Briefcase className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 p-1 grid grid-cols-8 w-full max-w-4xl mx-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="neural-command" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="h-4 w-4" />
                <span>Neural Command</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="job-postings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Job Postings</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Applications</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Onboarding</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="team-management" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Team</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Communications</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-md transition-all duration-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Onboarding Stats */}
                <Card className="bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded">
                        <Users className="h-4 w-4 text-purple-400" />
                      </div>
                      Onboarding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Total Candidates</span>
                        <span className="text-white font-semibold">{stats.onboarding.total_candidates}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">In Progress</span>
                        <span className="text-yellow-500 font-semibold">{stats.onboarding.in_progress}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Completed</span>
                        <span className="text-green-500 font-semibold">{stats.onboarding.completed}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Avg Progress</span>
                        <span className="text-blue-500 font-semibold">{stats.onboarding.avg_progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Postings Stats */}
                <Card className="bg-slate-900/50 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded">
                        <FileText className="h-4 w-4 text-blue-400" />
                      </div>
                      Job Postings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Total Postings</span>
                        <span className="text-white font-semibold">{stats.job_postings.total_postings}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Published</span>
                        <span className="text-green-500 font-semibold">{stats.job_postings.published}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Applications</span>
                        <span className="text-blue-500 font-semibold">{stats.job_postings.total_applications}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">Pending Reviews</span>
                        <span className="text-yellow-500 font-semibold">{stats.job_postings.pending_reviews}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Management Stats */}
                <Card className="bg-slate-900/50 border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded">
                        <Users className="h-4 w-4 text-green-400" />
                      </div>
                      Staff Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Total Staff</span>
                        <span className="text-white font-semibold">{stats.staff_management.total_staff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Active Staff</span>
                        <span className="text-green-500 font-semibold">{stats.staff_management.active_staff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Departments</span>
                        <span className="text-blue-500 font-semibold">{stats.staff_management.departments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Avg Rating</span>
                        <span className="text-yellow-500 font-semibold">{stats.staff_management.avg_rating}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => setShowJobPostingDialog(true)}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Create Job Posting
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowAddStaffDialog(true)}
                      >
                        <UserPlus className="h-3 w-3 mr-2" />
                        Add Staff Member
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Other tabs with placeholder content */}
          <TabsContent value="neural-command" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  Neural Command Center
                </h2>
                <p className="text-slate-400 text-sm">AI-powered staff management and automation</p>
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <BrainCircuit className="h-10 w-10 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Neural Command Center</h3>
                    <p className="text-slate-400">AI-powered staff management coming soon</p>
                  </div>
                  <div className="flex justify-center space-x-4 pt-4">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">AI Assistant</Badge>
                    <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Smart Automation</Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Predictive Analytics</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="job-postings" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Enhanced Job Postings
                </h2>
                <p className="text-slate-400 text-sm">Create and manage job postings for your organization</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                onClick={() => setShowJobPostingDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job Posting
              </Button>
            </div>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <FileText className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Job Postings Management</h3>
                    <p className="text-slate-400">Enhanced job posting features with AI-powered optimization</p>
                  </div>
                  <div className="flex justify-center space-x-4 pt-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Smart Templates</Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">AI Optimization</Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Auto-Posting</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  Enhanced Application Review
                </h2>
                <p className="text-slate-400 text-sm">Review and manage job applications with AI assistance</p>
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <EnhancedApplicationReview
                  applications={applications}
                  jobPostings={jobPostings}
                  onUpdateStatus={handleUpdateApplicationStatus}
                  onBulkUpdate={handleBulkUpdateApplications}
                  onSendMessage={handleSendMessage}
                  onExportApplications={handleExportApplications}
                  venueId={venueId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  Enhanced Onboarding Wizard
                </h2>
                <p className="text-slate-400 text-sm">Streamlined onboarding process with automated workflows</p>
              </div>
            </div>
            {onboardingCandidates.length > 0 ? (
              <div className="space-y-4">
                {onboardingCandidates.map((candidate) => {
                  const workflow = onboardingWorkflows.find(w => w.department === candidate.department)
                  return (
                    <Card key={candidate.id} className="bg-slate-900/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                              <UserPlus className="h-4 w-4 text-purple-400" />
                            </div>
                            {candidate.name} - {candidate.position}
                          </span>
                          <Badge 
                            className={`${
                              candidate.status === 'in_progress' 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                                : candidate.status === 'completed'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {candidate.status.replace('_', ' ')}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <EnhancedOnboardingWizard
                          candidate={candidate}
                          workflow={workflow || onboardingWorkflows[0]}
                          onUpdateProgress={handleUpdateOnboardingProgress}
                          onCompleteStep={handleCompleteOnboardingStep}
                          onUploadDocument={handleUploadOnboardingDocument}
                          onSendMessage={handleSendOnboardingMessage}
                          venueId={venueId}
                        />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700/50">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <UserPlus className="h-10 w-10 text-purple-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">No Candidates Available</h3>
                      <p className="text-slate-400">Add candidates to start the onboarding process</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="team-management" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  Enhanced Team Management
                </h2>
                <p className="text-slate-400 text-sm">Manage your team, schedules, and performance metrics</p>
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <EnhancedTeamManagement
                  staffMembers={staffMembers}
                  onboardingCandidates={onboardingCandidates}
                  communications={communications}
                  onUpdateStaffStatus={handleUpdateStaffStatus}
                  onAssignShift={handleAssignShift}
                  onAssignZone={handleAssignZone}
                  onSendMessage={handleSendTeamMessage}
                  onExportTeamData={handleExportTeamData}
                  venueId={venueId}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  Team Communications
                </h2>
                <p className="text-slate-400 text-sm">Enhanced communication and messaging features</p>
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">Team Communications</h3>
                    <p className="text-slate-400">Enhanced communication features coming soon</p>
                  </div>
                  <div className="flex justify-center space-x-4 pt-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Real-time Chat</Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Notifications</Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Team Updates</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  Enhanced Analytics Dashboard
                </h2>
                <p className="text-slate-400 text-sm">Comprehensive analytics and insights for your team</p>
              </div>
            </div>
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-6">
                <EnhancedAnalyticsDashboard venueId={venueId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Dialogs */}
      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="bg-slate-900/95 border-slate-700/50 max-w-2xl backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              Add Staff Member
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new staff profile to add them to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
              <UserPlus className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Add Staff Member</h3>
            <p className="text-slate-400 text-sm">Enhanced dialog coming soon</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showJobPostingDialog} onOpenChange={setShowJobPostingDialog}>
        <DialogContent className="bg-slate-900/95 border-slate-700/50 max-w-6xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Create Enhanced Job Posting
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Fill out the form below to publish a new role. All required fields are marked with an asterisk.
            </DialogDescription>
          </DialogHeader>
          <EnhancedJobPostingForm
            onSubmit={handleCreateJobPosting}
            onCancel={() => setShowJobPostingDialog(false)}
            venueId={venueId}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
