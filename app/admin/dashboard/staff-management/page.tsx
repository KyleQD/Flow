"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Users, Briefcase, FileText, CheckCircle, Clock, AlertTriangle, Plus, Search, Filter } from 'lucide-react'
import { AdminOnboardingStaffService } from '@/lib/services/admin-onboarding-staff.service'
import type {
  JobPostingTemplate,
  JobApplication,
  OnboardingCandidate,
  StaffMember,
  OnboardingStats,
  JobPostingStats,
  StaffManagementStats
} from '@/types/admin-onboarding'

interface DashboardStats {
  onboarding: OnboardingStats
  job_postings: JobPostingStats
  staff_management: StaffManagementStats
}

export default function StaffManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [jobPostings, setJobPostings] = useState<JobPostingTemplate[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  // Mock venue ID for now - in real app, get from context
  const venueId = 'mock-venue-id'

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setIsLoading(true)
      setError(null)

      // Load all data in parallel
      const [statsData, jobPostingsData, applicationsData, candidatesData, staffData] = await Promise.all([
        AdminOnboardingStaffService.getDashboardStats(venueId),
        AdminOnboardingStaffService.getJobPostings(venueId),
        AdminOnboardingStaffService.getJobApplications(venueId),
        AdminOnboardingStaffService.getOnboardingCandidates(venueId),
        AdminOnboardingStaffService.getStaffMembers(venueId)
      ])

      setStats(statsData)
      setJobPostings(jobPostingsData)
      setApplications(applicationsData)
      setCandidates(candidatesData)
      setStaffMembers(staffData)
    } catch (err) {
      console.error('❌ [Staff Management] Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      in_progress: { label: 'In Progress', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'default' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      draft: { label: 'Draft', variant: 'outline' as const },
      published: { label: 'Published', variant: 'default' as const },
      paused: { label: 'Paused', variant: 'secondary' as const },
      closed: { label: 'Closed', variant: 'destructive' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  function getProgressColor(progress: number) {
    if (progress >= 80) return 'text-green-500'
    if (progress >= 60) return 'text-yellow-500'
    if (progress >= 40) return 'text-orange-500'
    return 'text-red-500'
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
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Staff & Crew Management</h1>
          <p className="text-slate-400">
            Manage your team, schedules, and performance across all tours and events
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="job-postings" className="data-[state=active]:bg-purple-600">
              Job Postings
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-purple-600">
              Applications
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="data-[state=active]:bg-purple-600">
              Onboarding
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-purple-600">
              Staff
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-purple-600">
              Communications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Onboarding Stats */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Onboarding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Total Candidates</span>
                        <span className="text-white font-semibold">{stats.onboarding.total_candidates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">In Progress</span>
                        <span className="text-yellow-500 font-semibold">{stats.onboarding.in_progress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Completed</span>
                        <span className="text-green-500 font-semibold">{stats.onboarding.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Avg Progress</span>
                        <span className="text-white font-semibold">{stats.onboarding.avg_progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Postings Stats */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job Postings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Total Postings</span>
                        <span className="text-white font-semibold">{stats.job_postings.total_postings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Published</span>
                        <span className="text-green-500 font-semibold">{stats.job_postings.published}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Applications</span>
                        <span className="text-blue-500 font-semibold">{stats.job_postings.total_applications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Pending Reviews</span>
                        <span className="text-yellow-500 font-semibold">{stats.job_postings.pending_reviews}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Management Stats */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Total Staff</span>
                        <span className="text-white font-semibold">{stats.staff_management.total_staff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Active</span>
                        <span className="text-green-500 font-semibold">{stats.staff_management.active_staff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Departments</span>
                        <span className="text-blue-500 font-semibold">{stats.staff_management.departments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Recent Hires</span>
                        <span className="text-purple-500 font-semibold">{stats.staff_management.recent_hires}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Job Posting
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <Users className="h-4 w-4 mr-2" />
                        Add Candidate
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Applications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Postings Tab */}
          <TabsContent value="job-postings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Job Postings</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Job Posting
              </Button>
            </div>

            <div className="grid gap-4">
              {jobPostings.map((job) => (
                <Card key={job.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <p className="text-slate-400 text-sm">{job.department} • {job.position}</p>
                        <p className="text-slate-400 text-sm">{job.location}</p>
                        <div className="flex gap-2">
                          {getStatusBadge(job.status)}
                          {job.urgent && <Badge variant="destructive">Urgent</Badge>}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-slate-400 text-sm">{job.applications_count} applications</p>
                        <p className="text-slate-400 text-sm">{job.views_count} views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Applications</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{application.applicant_name}</h3>
                        <p className="text-slate-400 text-sm">{application.applicant_email}</p>
                        <p className="text-slate-400 text-sm">
                          Applied for: {application.job_posting?.title || 'Unknown Position'}
                        </p>
                        <div className="flex gap-2">
                          {getStatusBadge(application.status)}
                          {application.rating && (
                            <Badge variant="outline">{application.rating}/5</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-slate-400 text-sm">
                          {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Onboarding</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>

            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                        <p className="text-slate-400 text-sm">{candidate.email}</p>
                        <p className="text-slate-400 text-sm">
                          {candidate.department} • {candidate.position}
                        </p>
                        <div className="flex gap-2">
                          {getStatusBadge(candidate.status)}
                          <Badge variant="outline">{candidate.stage}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(candidate.onboarding_progress)}`}
                              style={{ width: `${candidate.onboarding_progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-400">{candidate.onboarding_progress}%</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-slate-400 text-sm">
                          {new Date(candidate.application_date).toLocaleDateString()}
                        </p>
                        <Button size="sm" variant="outline">
                          View Progress
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Staff Members</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            <div className="grid gap-4">
              {staffMembers.map((staff) => (
                <Card key={staff.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                        <p className="text-slate-400 text-sm">{staff.email}</p>
                        <p className="text-slate-400 text-sm">
                          {staff.department} • {staff.role}
                        </p>
                        <div className="flex gap-2">
                          {getStatusBadge(staff.status)}
                          <Badge variant="outline">{staff.employment_type}</Badge>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-slate-400 text-sm">
                          Hired: {staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : 'N/A'}
                        </p>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Team Communications</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="text-center py-8 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send your first team communication to get started</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 