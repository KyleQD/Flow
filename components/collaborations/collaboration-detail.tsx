'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Music, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Star,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Download,
  Play,
  User,
  Send,
  FileText,
  CheckCircle,
  X
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  ArtistJob, 
  CollaborationApplication,
  CreateCollaborationApplicationFormData,
  GENRE_OPTIONS,
  INSTRUMENT_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS
} from '@/types/artist-jobs'
import { ArtistJobsService } from '@/lib/services/artist-jobs.service'

interface CollaborationDetailProps {
  collaboration: ArtistJob
  userId?: string
  onApply?: (applicationData: CreateCollaborationApplicationFormData) => Promise<void>
  onSave?: (collaborationId: string) => void
  onUnsave?: (collaborationId: string) => void
  onEdit?: (collaboration: ArtistJob) => void
  onDelete?: (collaborationId: string) => void
  className?: string
}

export default function CollaborationDetail({
  collaboration,
  userId,
  onApply,
  onSave,
  onUnsave,
  onEdit,
  onDelete,
  className
}: CollaborationDetailProps) {
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [applications, setApplications] = useState<CollaborationApplication[]>([])
  const [isLoadingApplications, setIsLoadingApplications] = useState(false)
  const [applicationForm, setApplicationForm] = useState<CreateCollaborationApplicationFormData>({
    job_id: collaboration.id,
    contact_email: '',
    message: '',
    available_instruments: [],
    collaboration_interest: '',
    previous_collaborations: '',
    preferred_contact_method: 'email'
  })

  const isOwner = userId === collaboration.posted_by
  const hasApplied = !!collaboration.user_application
  const timeAgo = formatDistanceToNow(new Date(collaboration.created_at), { addSuffix: true })
  const hasDeadline = collaboration.deadline
  const isExpiringSoon = hasDeadline && new Date(collaboration.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  useEffect(() => {
    if (isOwner && userId) {
      loadApplications()
    }
  }, [isOwner, userId])

  const loadApplications = async () => {
    if (!userId) return
    
    setIsLoadingApplications(true)
    try {
      const apps = await ArtistJobsService.getCollaborationApplications(collaboration.id, userId)
      setApplications(apps)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoadingApplications(false)
    }
  }

  const handleApplicationSubmit = async () => {
    if (!onApply) return
    
    try {
      await onApply(applicationForm)
      setShowApplicationDialog(false)
    } catch (error) {
      console.error('Error submitting application:', error)
    }
  }

  const handleInstrumentToggle = (instrument: string) => {
    const currentInstruments = applicationForm.available_instruments || []
    const newInstruments = currentInstruments.includes(instrument)
      ? currentInstruments.filter(i => i !== instrument)
      : [...currentInstruments, instrument]
    
    setApplicationForm({
      ...applicationForm,
      available_instruments: newInstruments
    })
  }

  const getPaymentDisplay = () => {
    const paymentType = PAYMENT_TYPE_OPTIONS.find(p => p.value === collaboration.payment_type)
    
    if (collaboration.payment_type === 'paid' && collaboration.payment_amount) {
      return `${paymentType?.label} - $${collaboration.payment_amount} ${collaboration.payment_currency}`
    }
    
    return paymentType?.label || collaboration.payment_type
  }

  const getLocationDisplay = () => {
    if (collaboration.location_type === 'remote') return 'Remote'
    if (collaboration.location_type === 'hybrid') return 'Hybrid'
    if (collaboration.city && collaboration.state) {
      return `${collaboration.city}, ${collaboration.state}${collaboration.country ? `, ${collaboration.country}` : ''}`
    }
    return 'In-person'
  }

  const ApplicationDialog = () => (
    <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Collaboration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              value={applicationForm.contact_email}
              onChange={(e) => setApplicationForm({
                ...applicationForm,
                contact_email: e.target.value
              })}
              placeholder="your.email@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message to Collaborator</Label>
            <Textarea
              id="message"
              value={applicationForm.message || ''}
              onChange={(e) => setApplicationForm({
                ...applicationForm,
                message: e.target.value
              })}
              placeholder="Introduce yourself and explain why you'd be a great fit for this collaboration..."
              className="mt-1 min-h-32"
            />
          </div>

          <div>
            <Label>Your Available Instruments/Skills</Label>
            <div className="mt-2 space-y-3">
              {Object.entries(
                INSTRUMENT_OPTIONS.reduce((acc, instrument) => {
                  if (!acc[instrument.category]) acc[instrument.category] = []
                  acc[instrument.category].push(instrument)
                  return acc
                }, {} as Record<string, typeof INSTRUMENT_OPTIONS>)
              ).map(([category, instruments]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map((instrument) => (
                      <Button
                        key={instrument.value}
                        type="button"
                        variant={applicationForm.available_instruments?.includes(instrument.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInstrumentToggle(instrument.value)}
                      >
                        {instrument.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="collaboration_interest">What You Bring to This Collaboration</Label>
            <Textarea
              id="collaboration_interest"
              value={applicationForm.collaboration_interest || ''}
              onChange={(e) => setApplicationForm({
                ...applicationForm,
                collaboration_interest: e.target.value
              })}
              placeholder="Describe your experience, skills, and what you can contribute..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="previous_collaborations">Previous Collaborations</Label>
            <Textarea
              id="previous_collaborations"
              value={applicationForm.previous_collaborations || ''}
              onChange={(e) => setApplicationForm({
                ...applicationForm,
                previous_collaborations: e.target.value
              })}
              placeholder="Briefly describe any previous collaborative work or projects..."
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplicationSubmit}>
              Submit Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const ApplicationsList = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Applications ({applications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingApplications ? (
          <div className="text-center py-8">Loading applications...</div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {application.applicant_name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{application.applicant_name || 'Anonymous'}</h4>
                        <p className="text-sm text-gray-600">{application.contact_email}</p>
                      </div>
                    </div>
                    <Badge variant={
                      application.status === 'accepted' ? 'default' :
                      application.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {application.status}
                    </Badge>
                  </div>

                  {application.message && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{application.message}</p>
                    </div>
                  )}

                  {application.available_instruments.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Available instruments:</p>
                      <div className="flex flex-wrap gap-1">
                        {application.available_instruments.map((instrument) => (
                          <Badge key={instrument} variant="outline" className="text-xs">
                            {INSTRUMENT_OPTIONS.find(i => i.value === instrument)?.label || instrument}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}</span>
                    <div className="flex gap-2">
                      {application.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No applications yet
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {collaboration.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline">
                  {collaboration.category?.name}
                </Badge>
                {collaboration.genre && (
                  <Badge variant="secondary">
                    {GENRE_OPTIONS.find(g => g.value === collaboration.genre)?.label || collaboration.genre}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl font-bold mb-3">{collaboration.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collaboration.poster_avatar} />
                    <AvatarFallback className="text-xs">
                      {collaboration.poster_name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{collaboration.poster_name || 'Anonymous Artist'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Posted {timeAgo}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{collaboration.views_count} views</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{collaboration.applications_count} applications</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {userId && !isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (collaboration.is_saved) {
                        onUnsave?.(collaboration.id)
                      } else {
                        onSave?.(collaboration.id)
                      }
                    }}
                  >
                    {collaboration.is_saved ? (
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    {collaboration.is_saved ? 'Saved' : 'Save'}
                  </Button>
                )}
                
                {isOwner ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onEdit?.(collaboration)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete?.(collaboration.id)}>
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowApplicationDialog(true)}
                    disabled={hasApplied}
                  >
                    {hasApplied ? 'Already Applied' : 'Apply Now'}
                  </Button>
                )}
              </div>
              
              {/* Deadline Warning */}
              {hasDeadline && (
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  isExpiringSoon ? "text-red-600" : "text-gray-600"
                )}>
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {format(new Date(collaboration.deadline), 'PPP')}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {collaboration.description}
              </p>
            </CardContent>
          </Card>

          {/* Instruments Needed */}
          {collaboration.instruments_needed && collaboration.instruments_needed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Looking For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {collaboration.instruments_needed.map((instrument) => (
                    <Badge key={instrument} variant="secondary" className="flex items-center gap-1">
                      <Music className="h-3 w-3" />
                      {INSTRUMENT_OPTIONS.find(i => i.value === instrument)?.label || instrument}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {(collaboration.required_experience || collaboration.required_skills?.length > 0 || collaboration.special_requirements) && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {collaboration.required_experience && (
                  <div>
                    <Label className="text-sm font-medium">Experience Level</Label>
                    <Badge variant="outline" className="ml-2">
                      {EXPERIENCE_LEVEL_OPTIONS.find(e => e.value === collaboration.required_experience)?.label}
                    </Badge>
                  </div>
                )}
                
                {collaboration.required_skills && collaboration.required_skills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium block mb-2">Additional Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {collaboration.required_skills.map((skill) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {collaboration.special_requirements && (
                  <div>
                    <Label className="text-sm font-medium block mb-2">Special Requirements</Label>
                    <p className="text-gray-700">{collaboration.special_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Owner's Applications */}
          {isOwner && <ApplicationsList />}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{getPaymentDisplay()}</p>
                  {collaboration.payment_description && (
                    <p className="text-sm text-gray-600">{collaboration.payment_description}</p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{getLocationDisplay()}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {collaboration.location_type?.replace('_', ' ')} collaboration
                  </p>
                </div>
              </div>
              
              {hasDeadline && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Application Deadline</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(collaboration.deadline), 'PPP')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          {(collaboration.contact_email || collaboration.contact_phone || collaboration.external_link) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaboration.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`mailto:${collaboration.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {collaboration.contact_email}
                    </a>
                  </div>
                )}
                
                {collaboration.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <a 
                      href={`tel:${collaboration.contact_phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {collaboration.contact_phone}
                    </a>
                  </div>
                )}
                
                {collaboration.external_link && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <a 
                      href={collaboration.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View External Link
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          {collaboration.attachments && Object.keys(collaboration.attachments).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(collaboration.attachments).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{key}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Application Dialog */}
      <ApplicationDialog />
    </div>
  )
}