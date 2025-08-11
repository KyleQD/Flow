"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  CheckCircle, 
  X, 
  Clock,
  Star,
  FileText,
  Download,
  Send,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  X as XIcon,
  UserPlus,
  UserCheck,
  UserX,
  FileDown,
  ExternalLink
} from 'lucide-react'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'
import { useCurrentVenue } from '@/hooks/use-venue'
import type { JobApplication, JobPostingTemplate } from '@/types/admin-onboarding'

interface ApplicationWithJob extends JobApplication {
  job_posting: JobPostingTemplate
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobFilter, setJobFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithJob | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({
    status: 'approved' as JobApplication['status'],
    feedback: '',
    rating: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { currentVenue } = useCurrentVenue()

  const venueId = currentVenue?.id || 'mock-venue-id'

  useEffect(() => {
    loadApplications()
  }, [venueId])

  useEffect(() => {
    filterApplications()
  }, [applications, searchQuery, statusFilter, jobFilter])

  async function loadApplications() {
    try {
      setIsLoading(true)
      setError(null)

      const data = await AdminOnboardingStaffService.getJobApplications(venueId)
      setApplications(data as ApplicationWithJob[])
    } catch (err) {
      console.error('Error loading applications:', err)
      setError('Failed to load applications')
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  function filterApplications() {
    let filtered = applications

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicant_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_posting?.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Filter by job posting
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.job_posting_id === jobFilter)
    }

    setFilteredApplications(filtered)
  }

  async function handleReviewApplication() {
    if (!selectedApplication) return

    try {
      setIsSubmitting(true)

      await AdminOnboardingStaffService.updateApplicationStatus(selectedApplication.id, {
        status: reviewData.status,
        feedback: reviewData.feedback,
        rating: reviewData.rating
      })

      toast({
        title: 'Application Updated',
        description: `Application has been ${reviewData.status}.`,
      })

      setShowReviewModal(false)
      setSelectedApplication(null)
      setReviewData({ status: 'approved', feedback: '', rating: 0 })
      loadApplications() // Refresh data
    } catch (error) {
      console.error('Error updating application:', error)
      toast({
        title: 'Error',
        description: 'Failed to update application. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { label: 'Pending Review', variant: 'secondary' as const, color: 'bg-yellow-500' },
      reviewed: { label: 'Reviewed', variant: 'default' as const, color: 'bg-blue-500' },
      approved: { label: 'Approved', variant: 'default' as const, color: 'bg-green-500' },
      rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-500' },
      shortlisted: { label: 'Shortlisted', variant: 'default' as const, color: 'bg-purple-500' },
      withdrawn: { label: 'Withdrawn', variant: 'outline' as const, color: 'bg-gray-500' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  function getPriorityColor(application: ApplicationWithJob) {
    const daysSinceApplied = Math.floor((Date.now() - new Date(application.applied_at).getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceApplied > 7) return 'border-red-500'
    if (daysSinceApplied > 3) return 'border-yellow-500'
    return 'border-green-500'
  }

  const uniqueJobs = Array.from(new Set(applications.map(app => app.job_posting_id)))
  const statusOptions = ['all', 'pending', 'reviewed', 'approved', 'rejected', 'shortlisted', 'withdrawn']

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Applications</h2>
          <p className="text-slate-400">Please wait...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-red-700 text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Applications</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={loadApplications} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Applications</h1>
            <p className="text-slate-400">
              Review and manage job applications from candidates
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Send Bulk Message
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status} className="text-white">
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white">All Jobs</SelectItem>
              {uniqueJobs.map((jobId) => {
                const job = applications.find(app => app.job_posting_id === jobId)?.job_posting
                return (
                  <SelectItem key={jobId} value={jobId} className="text-white">
                    {job?.title || 'Unknown Job'}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-6">
        <div className="grid gap-4">
          {filteredApplications.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <h3 className="text-lg font-semibold text-white mb-2">No Applications Found</h3>
                <p className="text-slate-400">
                  {applications.length === 0 
                    ? 'No applications have been submitted yet.'
                    : 'No applications match your current filters.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card 
                key={application.id} 
                className={`bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer ${getPriorityColor(application)}`}
                onClick={() => {
                  setSelectedApplication(application)
                  setShowApplicationModal(true)
                }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={application.avatar_url} />
                        <AvatarFallback className="bg-slate-700 text-white">
                          {application.applicant_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{application.applicant_name}</h3>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-slate-400 text-sm">{application.applicant_email}</p>
                        <p className="text-slate-400 text-sm">
                          Applied for: <span className="text-white">{application.job_posting?.title}</span>
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                          </div>
                          {application.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{application.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApplication(application)
                          setShowApplicationModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {application.status === 'pending' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedApplication(application)
                            setReviewData({ status: 'approved', feedback: '', rating: 0 })
                            setShowReviewModal(true)
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {application.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedApplication(application)
                            setReviewData({ status: 'rejected', feedback: '', rating: 0 })
                            setShowReviewModal(true)
                          }}
                        >
                          <XIcon className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Applicant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedApplication.avatar_url} />
                      <AvatarFallback className="bg-slate-600 text-white">
                        {selectedApplication.applicant_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{selectedApplication.applicant_name}</h3>
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{selectedApplication.applicant_email}</span>
                        </div>
                        {selectedApplication.applicant_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{selectedApplication.applicant_phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedApplication.status)}
                        <span className="text-slate-400 text-sm">
                          Applied {new Date(selectedApplication.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">{selectedApplication.job_posting?.title}</h4>
                    <p className="text-slate-400">{selectedApplication.job_posting?.department} • {selectedApplication.job_posting?.position}</p>
                    <p className="text-slate-400">{selectedApplication.job_posting?.location}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Form Responses */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Application Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedApplication.form_responses || {}).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-white font-medium">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Label>
                        <div className="bg-slate-600 rounded-lg p-3">
                          <p className="text-slate-300">{String(value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Review Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationModal(false)}
                >
                  Close
                </Button>
                <div className="flex gap-2">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setReviewData({ status: 'approved', feedback: '', rating: 0 })
                          setShowReviewModal(true)
                          setShowApplicationModal(false)
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setReviewData({ status: 'rejected', feedback: '', rating: 0 })
                          setShowReviewModal(true)
                          setShowApplicationModal(false)
                        }}
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {reviewData.status === 'approved' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Rating (Optional)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                    className={reviewData.rating >= star ? 'text-yellow-500' : 'text-slate-400'}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Feedback (Optional)</Label>
              <Textarea
                value={reviewData.feedback}
                onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Add feedback for the applicant..."
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewApplication}
                disabled={isSubmitting}
                className={reviewData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {reviewData.status === 'approved' ? <Check className="h-4 w-4 mr-2" /> : <XIcon className="h-4 w-4 mr-2" />}
                    {reviewData.status === 'approved' ? 'Approve' : 'Reject'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 