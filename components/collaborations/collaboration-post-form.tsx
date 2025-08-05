'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, X, Plus, Upload, Music, Users, MapPin, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  CreateJobFormData, 
  ArtistJobCategory,
  INSTRUMENT_OPTIONS,
  GENRE_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS
} from '@/types/artist-jobs'
import { ArtistJobsService } from '@/lib/services/artist-jobs.service'

const collaborationFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be under 2000 characters'),
  category_id: z.string().min(1, 'Category is required'),
  
  // Collaboration-specific fields
  genre: z.string().optional(),
  instruments_needed: z.array(z.string()).min(1, 'At least one instrument/role is required'),
  
  // Payment info
  payment_type: z.enum(['paid', 'unpaid', 'revenue_share', 'exposure']),
  payment_amount: z.number().optional(),
  payment_currency: z.string().default('USD'),
  payment_description: z.string().optional(),
  
  // Location and timing
  location_type: z.enum(['in_person', 'remote', 'hybrid']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  deadline: z.date().optional(),
  
  // Requirements
  required_experience: z.enum(['beginner', 'intermediate', 'professional']).optional(),
  required_skills: z.array(z.string()).default([]),
  
  // Additional details
  collaboration_details: z.record(z.any()).default({}),
  special_requirements: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  
  // Metadata
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'open']).default('open')
})

type CollaborationFormData = z.infer<typeof collaborationFormSchema>

interface CollaborationPostFormProps {
  onSubmit: (data: CreateJobFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<CreateJobFormData>
  isLoading?: boolean
}

export default function CollaborationPostForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}: CollaborationPostFormProps) {
  const [categories, setCategories] = useState<ArtistJobCategory[]>([])
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(initialData?.instruments_needed || [])
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.required_skills || [])
  const [attachments, setAttachments] = useState<Record<string, any>>(initialData?.attachments || {})
  const [currentSkill, setCurrentSkill] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CollaborationFormData>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category_id: initialData?.category_id || '',
      genre: initialData?.genre || '',
      instruments_needed: initialData?.instruments_needed || [],
      payment_type: initialData?.payment_type || 'revenue_share',
      payment_amount: initialData?.payment_amount || undefined,
      payment_currency: initialData?.payment_currency || 'USD',
      payment_description: initialData?.payment_description || '',
      location_type: initialData?.location_type || 'remote',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
      required_experience: initialData?.required_experience || undefined,
      required_skills: initialData?.required_skills || [],
      collaboration_details: initialData?.collaboration_details || {},
      special_requirements: initialData?.special_requirements || '',
      contact_email: initialData?.contact_email || '',
      contact_phone: initialData?.contact_phone || '',
      featured: initialData?.featured || false,
      status: initialData?.status || 'open'
    }
  })

  const watchPaymentType = watch('payment_type')
  const watchLocationTime = watch('location_type')
  const watchDeadline = watch('deadline')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    setValue('instruments_needed', selectedInstruments)
  }, [selectedInstruments, setValue])

  useEffect(() => {
    setValue('required_skills', selectedSkills)
  }, [selectedSkills, setValue])

  const loadCategories = async () => {
    try {
      const data = await ArtistJobsService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleFormSubmit = async (data: CollaborationFormData) => {
    const formData: CreateJobFormData = {
      ...data,
      job_type: 'collaboration',
      instruments_needed: selectedInstruments,
      required_skills: selectedSkills,
      attachments: attachments,
      deadline: data.deadline?.toISOString()
    }

    await onSubmit(formData)
  }

  const addInstrument = (instrument: string) => {
    if (!selectedInstruments.includes(instrument)) {
      setSelectedInstruments([...selectedInstruments, instrument])
    }
  }

  const removeInstrument = (instrument: string) => {
    setSelectedInstruments(selectedInstruments.filter(i => i !== instrument))
  }

  const addSkill = () => {
    if (currentSkill.trim() && !selectedSkills.includes(currentSkill.trim())) {
      setSelectedSkills([...selectedSkills, currentSkill.trim()])
      setCurrentSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real implementation, you would upload these files to storage
      // and store the URLs in the attachments object
      console.log('Files to upload:', files)
    }
  }

  const instrumentsByCategory = INSTRUMENT_OPTIONS.reduce((acc, instrument) => {
    if (!acc[instrument.category]) {
      acc[instrument.category] = []
    }
    acc[instrument.category].push(instrument)
    return acc
  }, {} as Record<string, typeof INSTRUMENT_OPTIONS>)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Collaboration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Collaboration Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Looking for a guitarist for indie rock EP"
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your collaboration project, what you're looking for, and what you bring to the table..."
              className="mt-1 min-h-32"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category and Genre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Category *</Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="genre">Primary Genre</Label>
              <Select onValueChange={(value) => setValue('genre', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRE_OPTIONS.map((genre) => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruments/Roles Needed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-purple-500" />
            Instruments & Roles Needed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Instruments */}
          {selectedInstruments.length > 0 && (
            <div>
              <Label>Selected Instruments/Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedInstruments.map((instrument) => (
                  <Badge key={instrument} variant="secondary" className="flex items-center gap-1">
                    {INSTRUMENT_OPTIONS.find(i => i.value === instrument)?.label || instrument}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeInstrument(instrument)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Instrument Selection */}
          <div>
            <Label>Add Instruments/Roles</Label>
            <div className="mt-2 space-y-4">
              {Object.entries(instrumentsByCategory).map(([category, instruments]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map((instrument) => (
                      <Button
                        key={instrument.value}
                        type="button"
                        variant={selectedInstruments.includes(instrument.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => addInstrument(instrument.value)}
                        disabled={selectedInstruments.includes(instrument.value)}
                      >
                        {instrument.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {errors.instruments_needed && (
            <p className="text-sm text-red-500">{errors.instruments_needed.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Payment & Compensation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_type">Payment Type *</Label>
              <Select onValueChange={(value) => setValue('payment_type', value as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {watchPaymentType === 'paid' && (
              <div>
                <Label htmlFor="payment_amount">Payment Amount</Label>
                <div className="flex mt-1">
                  <Input
                    type="number"
                    {...register('payment_amount', { valueAsNumber: true })}
                    placeholder="0"
                    className="rounded-r-none"
                  />
                  <Select onValueChange={(value) => setValue('payment_currency', value)}>
                    <SelectTrigger className="w-20 rounded-l-none">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="payment_description">Payment Details</Label>
            <Textarea
              {...register('payment_description')}
              placeholder="Describe payment terms, revenue sharing details, or other compensation..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            Location & Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Collaboration Type</Label>
            <Select onValueChange={(value) => setValue('location_type', value as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select collaboration type" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value || ''}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {watchLocationTime === 'in_person' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input {...register('city')} placeholder="e.g., Los Angeles" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input {...register('state')} placeholder="e.g., California" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input {...register('country')} placeholder="e.g., United States" className="mt-1" />
              </div>
            </div>
          )}

          <div>
            <Label>Application Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full mt-1 justify-start text-left font-normal",
                    !watchDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchDeadline ? format(watchDeadline, "PPP") : "Select deadline (optional)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watchDeadline}
                  onSelect={(date) => setValue('deadline', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Experience Level</Label>
            <Select onValueChange={(value) => setValue('required_experience', value as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value || 'none'} value={option.value || 'none'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Skills/Requirements</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="e.g., music production, songwriting"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button type="button" onClick={addSkill} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              {...register('special_requirements')}
              placeholder="Any additional requirements or preferences..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact & Files */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                type="email"
                {...register('contact_email')}
                placeholder="your.email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                {...register('contact_phone')}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="attachments">Demo Files (Optional)</Label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload demos, references, or other files
              </p>
              <Input
                type="file"
                multiple
                accept="audio/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Featured Collaboration</Label>
              <p className="text-sm text-gray-600">Highlight this collaboration for better visibility</p>
            </div>
            <Switch
              id="featured"
              checked={watch('featured')}
              onCheckedChange={(checked) => setValue('featured', checked)}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select onValueChange={(value) => setValue('status', value as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="open">Publish Now</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Publishing...' : 'Publish Collaboration'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}