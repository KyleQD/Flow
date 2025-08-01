"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Briefcase, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Star,
  Music,
  Mic,
  Guitar,
  Drum,
  Keyboard,
  Speaker,
  Lightbulb,
  Camera,
  Video,
  Truck,
  Shield,
  Utensils,
  Wifi,
  Zap
} from "lucide-react"
import { toast } from "sonner"

interface EventJobPostingProps {
  eventId: string
  eventName: string
  eventDate: string
  eventLocation: string
  onJobPosted?: (job: any) => void
}

interface JobFormData {
  title: string
  description: string
  category_id: string
  job_type: 'one_time' | 'recurring' | 'tour' | 'residency' | 'collaboration'
  payment_type: 'paid' | 'unpaid' | 'revenue_share' | 'exposure'
  payment_amount?: number
  payment_currency: string
  payment_description?: string
  location: string
  location_type: 'in_person' | 'remote' | 'hybrid'
  city?: string
  state?: string
  country?: string
  event_date: string
  event_time?: string
  duration_hours?: number
  deadline?: string
  required_skills: string[]
  required_equipment: string[]
  required_experience: 'beginner' | 'intermediate' | 'professional'
  required_genres: string[]
  age_requirement?: string
  benefits: string[]
  special_requirements?: string
  contact_email?: string
  contact_phone?: string
  external_link?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  featured: boolean
  status: 'draft' | 'open'
}

const jobCategories = [
  { id: '1', name: 'Opening Slots', icon: Music, color: '#8B5CF6' },
  { id: '2', name: 'Band Members', icon: Users, color: '#3B82F6' },
  { id: '3', name: 'Technical Crew', icon: Zap, color: '#F59E0B' },
  { id: '4', name: 'Session Work', icon: Mic, color: '#EF4444' },
  { id: '5', name: 'Sound Engineers', icon: Speaker, color: '#10B981' },
  { id: '6', name: 'Lighting Techs', icon: Lightbulb, color: '#F97316' },
  { id: '7', name: 'Photographers', icon: Camera, color: '#8B5CF6' },
  { id: '8', name: 'Videographers', icon: Video, color: '#EC4899' },
  { id: '9', name: 'Security', icon: Shield, color: '#6B7280' },
  { id: '10', name: 'Catering', icon: Utensils, color: '#84CC16' },
  { id: '11', name: 'Transportation', icon: Truck, color: '#6366F1' },
  { id: '12', name: 'Other', icon: Briefcase, color: '#9CA3AF' }
]

const commonSkills = [
  'Live Performance', 'Studio Recording', 'Sound Engineering', 'Lighting Design',
  'Stage Management', 'Event Planning', 'Customer Service', 'Technical Support',
  'Photography', 'Videography', 'Security', 'Catering', 'Transportation',
  'Marketing', 'Social Media', 'Merchandise Sales', 'Ticketing'
]

const commonEquipment = [
  'PA System', 'Microphones', 'Instruments', 'Lighting Rig', 'Camera Equipment',
  'Video Equipment', 'Transportation', 'Security Equipment', 'Catering Equipment'
]

const commonGenres = [
  'Rock', 'Pop', 'Hip Hop', 'Country', 'Jazz', 'Blues', 'Electronic', 'Folk',
  'R&B', 'Reggae', 'Metal', 'Punk', 'Indie', 'Classical', 'World Music'
]

const commonBenefits = [
  'Performance Experience', 'Networking Opportunities', 'Professional Development',
  'Free Entry', 'Meals Provided', 'Transportation Provided', 'Equipment Provided',
  'Exposure', 'Portfolio Building', 'Industry Connections'
]

export function EventJobPosting({ eventId, eventName, eventDate, eventLocation, onJobPosted }: EventJobPostingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [skillInput, setSkillInput] = useState('')
  const [equipmentInput, setEquipmentInput] = useState('')
  const [genreInput, setGenreInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category_id: '',
    job_type: 'one_time',
    payment_type: 'paid',
    payment_amount: undefined,
    payment_currency: 'USD',
    payment_description: '',
    location: eventLocation,
    location_type: 'in_person',
    city: '',
    state: '',
    country: '',
    event_date: eventDate,
    event_time: '',
    duration_hours: undefined,
    deadline: '',
    required_skills: [],
    required_equipment: [],
    required_experience: 'intermediate',
    required_genres: [],
    age_requirement: '',
    benefits: [],
    special_requirements: '',
    contact_email: '',
    contact_phone: '',
    external_link: '',
    priority: 'normal',
    featured: false,
    status: 'open'
  })

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      handleInputChange('required_skills', [...formData.required_skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    handleInputChange('required_skills', formData.required_skills.filter(s => s !== skill))
  }

  const addEquipment = () => {
    if (equipmentInput.trim() && !formData.required_equipment.includes(equipmentInput.trim())) {
      handleInputChange('required_equipment', [...formData.required_equipment, equipmentInput.trim()])
      setEquipmentInput('')
    }
  }

  const removeEquipment = (equipment: string) => {
    handleInputChange('required_equipment', formData.required_equipment.filter(e => e !== equipment))
  }

  const addGenre = () => {
    if (genreInput.trim() && !formData.required_genres.includes(genreInput.trim())) {
      handleInputChange('required_genres', [...formData.required_genres, genreInput.trim()])
      setGenreInput('')
    }
  }

  const removeGenre = (genre: string) => {
    handleInputChange('required_genres', formData.required_genres.filter(g => g !== genre))
  }

  const addBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      handleInputChange('benefits', [...formData.benefits, benefitInput.trim()])
      setBenefitInput('')
    }
  }

  const removeBenefit = (benefit: string) => {
    handleInputChange('benefits', formData.benefits.filter(b => b !== benefit))
  }

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category_id
      case 2:
        return formData.job_type && formData.payment_type
      case 3:
        return true // Optional fields
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!canProceed(currentStep)) {
      toast.error("Please fill in all required fields")
      return
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/events/${eventId}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post job')
      }

      const result = await response.json()
      
      if (result.success) {
        toast.success("Job posted successfully!")
        onJobPosted?.(result.data)
        setIsOpen(false)
        resetForm()
      } else {
        throw new Error(result.error || 'Failed to post job')
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category_id: '',
      job_type: 'one_time',
      payment_type: 'paid',
      payment_amount: undefined,
      payment_currency: 'USD',
      payment_description: '',
      location: eventLocation,
      location_type: 'in_person',
      city: '',
      state: '',
      country: '',
      event_date: eventDate,
      event_time: '',
      duration_hours: undefined,
      deadline: '',
      required_skills: [],
      required_equipment: [],
      required_experience: 'intermediate',
      required_genres: [],
      age_requirement: '',
      benefits: [],
      special_requirements: '',
      contact_email: '',
      contact_phone: '',
      external_link: '',
      priority: 'normal',
      featured: false,
      status: 'open'
    })
    setCurrentStep(1)
    setSkillInput('')
    setEquipmentInput('')
    setGenreInput('')
    setBenefitInput('')
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = jobCategories.find(cat => cat.id === categoryId)
    return category ? category.icon : Briefcase
  }

  const getCategoryColor = (categoryId: string) => {
    const category = jobCategories.find(cat => cat.id === categoryId)
    return category ? category.color : '#9CA3AF'
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-purple-600 hover:bg-purple-700">
        <Plus className="mr-2 h-4 w-4" />
        Post Job for Event
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Post Job for {eventName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-purple-600' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Sound Engineer for Las Vegas Show"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={4}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-slate-300">Job Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {jobCategories.map((category) => {
                        const IconComponent = category.icon
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4" style={{ color: category.color }} />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_type" className="text-slate-300">Job Type *</Label>
                    <Select value={formData.job_type} onValueChange={(value: any) => handleInputChange('job_type', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="one_time">One Time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                        <SelectItem value="tour">Tour</SelectItem>
                        <SelectItem value="residency">Residency</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment_type" className="text-slate-300">Payment Type *</Label>
                    <Select value={formData.payment_type} onValueChange={(value: any) => handleInputChange('payment_type', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="revenue_share">Revenue Share</SelectItem>
                        <SelectItem value="exposure">Exposure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.payment_type === 'paid' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment_amount" className="text-slate-300">Payment Amount</Label>
                      <Input
                        id="payment_amount"
                        type="number"
                        value={formData.payment_amount || ''}
                        onChange={(e) => handleInputChange('payment_amount', parseFloat(e.target.value) || undefined)}
                        placeholder="0.00"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_currency" className="text-slate-300">Currency</Label>
                      <Select value={formData.payment_currency} onValueChange={(value) => handleInputChange('payment_currency', value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_time" className="text-slate-300">Event Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => handleInputChange('event_time', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_hours" className="text-slate-300">Duration (hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      value={formData.duration_hours || ''}
                      onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value) || undefined)}
                      placeholder="3"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deadline" className="text-slate-300">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Requirements & Benefits */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-slate-300">Required Skills</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                      className="bg-slate-700 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button onClick={addSkill} variant="outline" className="border-slate-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.required_skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-slate-700">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 text-slate-400 hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Common skills: {commonSkills.slice(0, 5).join(', ')}...
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Required Equipment</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      placeholder="Add equipment"
                      className="bg-slate-700 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                    />
                    <Button onClick={addEquipment} variant="outline" className="border-slate-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.required_equipment.map((equipment) => (
                      <Badge key={equipment} variant="secondary" className="bg-slate-700">
                        {equipment}
                        <button
                          onClick={() => removeEquipment(equipment)}
                          className="ml-1 text-slate-400 hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience" className="text-slate-300">Experience Level</Label>
                    <Select value={formData.required_experience} onValueChange={(value: any) => handleInputChange('required_experience', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="special_requirements" className="text-slate-300">Special Requirements</Label>
                  <Textarea
                    id="special_requirements"
                    value={formData.special_requirements}
                    onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Benefits</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Add a benefit"
                      className="bg-slate-700 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <Button onClick={addBenefit} variant="outline" className="border-slate-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.benefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="bg-slate-700">
                        {benefit}
                        <button
                          onClick={() => removeBenefit(benefit)}
                          className="ml-1 text-slate-400 hover:text-white"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <Label htmlFor="featured" className="text-slate-300">Feature this job posting</Label>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">Job Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{formData.title}</h3>
                      <p className="text-slate-300">{formData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400">Category</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          {formData.category_id && (
                            <>
                              {(() => {
                                const IconComponent = getCategoryIcon(formData.category_id)
                                return <IconComponent className="h-4 w-4" style={{ color: getCategoryColor(formData.category_id) }} />
                              })()}
                              <span className="text-white">
                                {jobCategories.find(cat => cat.id === formData.category_id)?.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400">Job Type</Label>
                        <p className="text-white capitalize">{formData.job_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Payment</Label>
                        <p className="text-white capitalize">
                          {formData.payment_type}
                          {formData.payment_amount && ` - ${formData.payment_currency} ${formData.payment_amount}`}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Priority</Label>
                        <Badge className={`${
                          formData.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          formData.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          formData.priority === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {formData.priority}
                        </Badge>
                      </div>
                    </div>

                    {formData.required_skills.length > 0 && (
                      <div>
                        <Label className="text-slate-400">Required Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.required_skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-slate-600">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.benefits.length > 0 && (
                      <div>
                        <Label className="text-slate-400">Benefits</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.benefits.map((benefit) => (
                            <Badge key={benefit} variant="secondary" className="bg-green-500/20 text-green-400">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setIsOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!canProceed(currentStep) || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Posting...' : currentStep === 4 ? 'Post Job' : 'Next'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 