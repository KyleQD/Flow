// =============================================================================
// ARTIST JOBS SYSTEM TYPES
// =============================================================================

export interface ArtistJobCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  parent_category_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ArtistJob {
  id: string
  
  // Basic Info
  title: string
  description: string
  category_id: string
  category?: ArtistJobCategory
  
  // Posting User
  posted_by: string
  posted_by_type: 'artist' | 'venue' | 'organizer' | 'manager'
  poster_profile_id: string | null
  
  // Job Details
  job_type: 'one_time' | 'recurring' | 'tour' | 'residency' | 'collaboration'
  payment_type: 'paid' | 'unpaid' | 'revenue_share' | 'exposure'
  payment_amount: number | null
  payment_currency: string
  payment_description: string | null
  
  // Location & Timing
  location: string | null
  location_type: 'in_person' | 'remote' | 'hybrid' | null
  city: string | null
  state: string | null
  country: string | null
  event_date: string | null
  event_time: string | null
  duration_hours: number | null
  deadline: string | null
  
  // Requirements
  required_skills: string[]
  required_equipment: string[]
  required_experience: 'beginner' | 'intermediate' | 'professional' | null
  required_genres: string[]
  age_requirement: string | null
  
  // Additional Info
  benefits: string[]
  special_requirements: string | null
  contact_email: string | null
  contact_phone: string | null
  external_link: string | null
  
  // Status & Metadata
  status: 'draft' | 'open' | 'paused' | 'closed' | 'filled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  featured: boolean
  applications_count: number
  views_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
  expires_at: string | null
  
  // Computed fields
  poster_name?: string
  poster_avatar?: string
  is_saved?: boolean
  user_application?: ArtistJobApplication
  time_since_posted?: string
  location_display?: string
}

export interface ArtistJobApplication {
  id: string
  
  // References
  job_id: string
  applicant_id: string
  artist_profile_id: string | null
  
  // Application Content
  cover_letter: string | null
  portfolio_links: string[]
  experience_description: string | null
  availability_notes: string | null
  
  // Files
  resume_url: string | null
  demo_reel_url: string | null
  additional_files: string[]
  
  // Status & Metadata
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
  rating: number | null
  feedback: string | null
  
  // Communication
  contact_email: string
  contact_phone: string | null
  preferred_contact_method: 'email' | 'phone' | 'platform' | null
  
  // Timestamps
  applied_at: string
  reviewed_at: string | null
  responded_at: string | null
  
  // Computed fields
  applicant_name?: string
  applicant_avatar?: string
  job_title?: string
  time_since_applied?: string
}

export interface ArtistJobView {
  id: string
  job_id: string
  viewer_id: string | null
  viewer_ip: string | null
  viewed_at: string
}

export interface ArtistJobSave {
  id: string
  job_id: string
  user_id: string
  saved_at: string
}

// =============================================================================
// FILTER AND SEARCH TYPES
// =============================================================================

export interface JobSearchFilters {
  query?: string
  category_id?: string
  payment_type?: ('paid' | 'unpaid' | 'revenue_share' | 'exposure')[]
  job_type?: ('one_time' | 'recurring' | 'tour' | 'residency' | 'collaboration')[]
  location_type?: ('in_person' | 'remote' | 'hybrid')[]
  city?: string
  state?: string
  country?: string
  required_experience?: ('beginner' | 'intermediate' | 'professional')[]
  required_genres?: string[]
  required_skills?: string[]
  min_payment?: number
  max_payment?: number
  date_from?: string
  date_to?: string
  deadline_from?: string
  deadline_to?: string
  featured_only?: boolean
  sort_by?: 'created_at' | 'event_date' | 'payment_amount' | 'views_count' | 'applications_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface JobSearchResults {
  jobs: ArtistJob[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface CreateJobFormData {
  title: string
  description: string
  category_id: string
  job_type: 'one_time' | 'recurring' | 'tour' | 'residency' | 'collaboration'
  payment_type: 'paid' | 'unpaid' | 'revenue_share' | 'exposure'
  payment_amount?: number
  payment_currency?: string
  payment_description?: string
  location?: string
  location_type?: 'in_person' | 'remote' | 'hybrid'
  city?: string
  state?: string
  country?: string
  event_date?: string
  event_time?: string
  duration_hours?: number
  deadline?: string
  required_skills?: string[]
  required_equipment?: string[]
  required_experience?: 'beginner' | 'intermediate' | 'professional'
  required_genres?: string[]
  age_requirement?: string
  benefits?: string[]
  special_requirements?: string
  contact_email?: string
  contact_phone?: string
  external_link?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  featured?: boolean
  status?: 'draft' | 'open'
}

export interface CreateApplicationFormData {
  job_id: string
  cover_letter?: string
  portfolio_links?: string[]
  experience_description?: string
  availability_notes?: string
  resume_url?: string
  demo_reel_url?: string
  additional_files?: string[]
  contact_email: string
  contact_phone?: string
  preferred_contact_method?: 'email' | 'phone' | 'platform'
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  message?: string
}

export interface JobsApiResponse extends ApiResponse<JobSearchResults> {}
export interface JobApiResponse extends ApiResponse<ArtistJob> {}
export interface ApplicationApiResponse extends ApiResponse<ArtistJobApplication> {}
export interface ApplicationsApiResponse extends ApiResponse<ArtistJobApplication[]> {}
export interface CategoriesApiResponse extends ApiResponse<ArtistJobCategory[]> {}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface JobCardProps {
  job: ArtistJob
  onSave?: (jobId: string) => void
  onUnsave?: (jobId: string) => void
  onApply?: (jobId: string) => void
  showApplicationStatus?: boolean
  compact?: boolean
}

export interface JobFiltersProps {
  filters: JobSearchFilters
  onFiltersChange: (filters: JobSearchFilters) => void
  categories: ArtistJobCategory[]
  isLoading?: boolean
}

export interface ApplicationCardProps {
  application: ArtistJobApplication
  onStatusChange?: (applicationId: string, status: ArtistJobApplication['status']) => void
  onRating?: (applicationId: string, rating: number) => void
  showJobDetails?: boolean
  compact?: boolean
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type JobSortOption = {
  value: JobSearchFilters['sort_by']
  label: string
}

export type PaymentTypeOption = {
  value: ArtistJob['payment_type']
  label: string
  color: string
}

export type JobTypeOption = {
  value: ArtistJob['job_type']
  label: string
  description: string
}

export type LocationTypeOption = {
  value: ArtistJob['location_type']
  label: string
  icon: string
}

export type ExperienceLevelOption = {
  value: ArtistJob['required_experience']
  label: string
  description: string
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const JOB_SORT_OPTIONS: JobSortOption[] = [
  { value: 'created_at', label: 'Most Recent' },
  { value: 'event_date', label: 'Event Date' },
  { value: 'payment_amount', label: 'Payment Amount' },
  { value: 'views_count', label: 'Most Viewed' },
  { value: 'applications_count', label: 'Most Applications' }
]

export const PAYMENT_TYPE_OPTIONS: PaymentTypeOption[] = [
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'revenue_share', label: 'Revenue Share', color: 'blue' },
  { value: 'exposure', label: 'For Exposure', color: 'yellow' },
  { value: 'unpaid', label: 'Unpaid', color: 'gray' }
]

export const JOB_TYPE_OPTIONS: JobTypeOption[] = [
  { value: 'one_time', label: 'One-Time Gig', description: 'Single performance or session' },
  { value: 'recurring', label: 'Recurring', description: 'Regular ongoing opportunity' },
  { value: 'tour', label: 'Tour', description: 'Multi-date tour opportunity' },
  { value: 'residency', label: 'Residency', description: 'Extended engagement at venue' },
  { value: 'collaboration', label: 'Collaboration', description: 'Creative partnership project' }
]

export const LOCATION_TYPE_OPTIONS: LocationTypeOption[] = [
  { value: 'in_person', label: 'In-Person', icon: 'MapPin' },
  { value: 'remote', label: 'Remote', icon: 'Monitor' },
  { value: 'hybrid', label: 'Hybrid', icon: 'Zap' }
]

export const EXPERIENCE_LEVEL_OPTIONS: ExperienceLevelOption[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to performing/music industry' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience and skills' },
  { value: 'professional', label: 'Professional', description: 'Experienced professional' }
] 