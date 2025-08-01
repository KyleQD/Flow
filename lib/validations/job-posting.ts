import { z } from 'zod'

export const jobPostingSchema = z.object({
  // Basic Information
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .refine(title => title.trim().length > 0, 'Title cannot be empty'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .refine(desc => desc.trim().length > 0, 'Description cannot be empty'),
  
  category_id: z.string()
    .min(1, 'Please select a category'),
  
  // Job Details
  job_type: z.enum(['one_time', 'recurring', 'tour', 'residency', 'collaboration'], {
    required_error: 'Please select a job type'
  }),
  
  payment_type: z.enum(['paid', 'unpaid', 'revenue_share', 'exposure'], {
    required_error: 'Please select a payment type'
  }),
  
  payment_amount: z.number()
    .min(0, 'Payment amount must be positive')
    .optional(),
  
  payment_currency: z.string()
    .length(3, 'Currency must be a 3-letter code')
    .optional(),
  
  payment_description: z.string()
    .max(500, 'Payment description must be less than 500 characters')
    .optional(),
  
  // Location
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  
  location_type: z.enum(['in_person', 'remote', 'hybrid'])
    .optional(),
  
  city: z.string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  
  state: z.string()
    .max(100, 'State must be less than 100 characters')
    .optional(),
  
  country: z.string()
    .max(100, 'Country must be less than 100 characters')
    .optional(),
  
  // Dates and Timing
  event_date: z.string()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format')
    .optional(),
  
  event_time: z.string()
    .refine(time => !time || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), 'Invalid time format')
    .optional(),
  
  duration_hours: z.number()
    .min(0.5, 'Duration must be at least 30 minutes')
    .max(24, 'Duration must be less than 24 hours')
    .optional(),
  
  deadline: z.string()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format')
    .optional(),
  
  // Requirements
  required_skills: z.array(z.string())
    .max(20, 'Too many skills selected')
    .optional(),
  
  required_equipment: z.array(z.string())
    .max(20, 'Too many equipment items selected')
    .optional(),
  
  required_experience: z.enum(['beginner', 'intermediate', 'professional'])
    .optional(),
  
  required_genres: z.array(z.string())
    .max(10, 'Too many genres selected')
    .optional(),
  
  age_requirement: z.string()
    .max(50, 'Age requirement must be less than 50 characters')
    .optional(),
  
  // Additional Information
  benefits: z.array(z.string())
    .max(15, 'Too many benefits selected')
    .optional(),
  
  special_requirements: z.string()
    .max(1000, 'Special requirements must be less than 1000 characters')
    .optional(),
  
  contact_email: z.string()
    .email('Please enter a valid email address')
    .optional(),
  
  contact_phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
  
  external_link: z.string()
    .url('Please enter a valid URL')
    .optional(),
  
  // Status and Priority
  priority: z.enum(['low', 'normal', 'high', 'urgent'])
    .default('normal'),
  
  featured: z.boolean()
    .default(false),
  
  status: z.enum(['draft', 'open'])
    .default('open')
})

// Refined schema with conditional validation
export const jobPostingSchemaRefined = jobPostingSchema.refine(
  (data) => {
    // If payment type is paid, payment amount is required
    if (data.payment_type === 'paid') {
      return data.payment_amount !== undefined && data.payment_amount > 0
    }
    return true
  },
  {
    message: 'Payment amount is required for paid jobs',
    path: ['payment_amount']
  }
).refine(
  (data) => {
    // If event date is provided, it should be in the future
    if (data.event_date) {
      const eventDate = new Date(data.event_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return eventDate >= today
    }
    return true
  },
  {
    message: 'Event date cannot be in the past',
    path: ['event_date']
  }
).refine(
  (data) => {
    // If deadline is provided, it should be before event date
    if (data.deadline && data.event_date) {
      const deadlineDate = new Date(data.deadline)
      const eventDate = new Date(data.event_date)
      return deadlineDate <= eventDate
    }
    return true
  },
  {
    message: 'Application deadline must be before event date',
    path: ['deadline']
  }
).refine(
  (data) => {
    // If location type is in_person, location details should be provided
    if (data.location_type === 'in_person') {
      return data.location || data.city || data.state || data.country
    }
    return true
  },
  {
    message: 'Location details are required for in-person jobs',
    path: ['location']
  }
)

export type JobPostingFormData = z.infer<typeof jobPostingSchemaRefined>

// Validation helper function
export function validateJobPosting(data: unknown) {
  return jobPostingSchemaRefined.safeParse(data)
}

// Field-specific validation functions
export const fieldValidations = {
  title: (value: string) => {
    if (!value || value.trim().length === 0) return 'Title is required'
    if (value.length < 5) return 'Title must be at least 5 characters'
    if (value.length > 100) return 'Title must be less than 100 characters'
    return null
  },
  
  description: (value: string) => {
    if (!value || value.trim().length === 0) return 'Description is required'
    if (value.length < 20) return 'Description must be at least 20 characters'
    if (value.length > 2000) return 'Description must be less than 2000 characters'
    return null
  },
  
  category_id: (value: string) => {
    if (!value) return 'Please select a category'
    return null
  },
  
  payment_amount: (value: number | undefined, paymentType: string) => {
    if (paymentType === 'paid') {
      if (!value || value <= 0) return 'Payment amount is required for paid jobs'
    }
    return null
  },
  
  contact_email: (value: string) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return null
  },
  
  contact_phone: (value: string) => {
    if (!value) return null
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number'
    return null
  },
  
  external_link: (value: string) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },
  
  event_date: (value: string) => {
    if (!value) return null
    const eventDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (eventDate < today) return 'Event date cannot be in the past'
    return null
  },
  
  deadline: (value: string, eventDate?: string) => {
    if (!value) return null
    if (eventDate) {
      const deadlineDate = new Date(value)
      const eventDateTime = new Date(eventDate)
      if (deadlineDate > eventDateTime) return 'Application deadline must be before event date'
    }
    return null
  }
} 