import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for jobs (will persist until server restart)
// This is a temporary solution until database migration is implemented
let storedJobs: any[] = [
  {
    id: 'job_1',
    title: 'Lead Guitarist for Rock Band',
    description: 'We are looking for an experienced lead guitarist to join our established rock band. Must have own equipment and be available for weekend gigs.',
    category_id: '1',
    category: {
      id: '1',
      name: 'Opening Slots',
      icon: 'Music',
      color: '#8B5CF6'
    },
    posted_by: 'rockband_demo',
    posted_by_type: 'artist',
    poster_profile_id: null,
    job_type: 'recurring',
    payment_type: 'paid',
    payment_amount: 200,
    payment_currency: 'USD',
    payment_description: null,
    location: 'The Fillmore',
    location_type: 'in_person',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    event_date: '2024-02-15',
    event_time: '20:00',
    duration_hours: 3,
    deadline: '2024-02-10',
    required_skills: ['Live Performance', 'Guitar', 'Rock'],
    required_equipment: ['Electric Guitar', 'Amplifier', 'Effects Pedals'],
    required_experience: 'intermediate',
    required_genres: ['Rock', 'Alternative'],
    age_requirement: '18+',
    benefits: ['Performance Experience', 'Networking'],
    special_requirements: 'Must have own transportation',
    contact_email: 'band@rockdemo.com',
    contact_phone: '(555) 123-4567',
    external_link: null,
    status: 'open',
    priority: 'normal',
    featured: false,
    applications_count: 3,
    views_count: 45,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    expires_at: null,
    poster_name: 'Rock Demo Band',
    poster_avatar: null,
    is_saved: false,
    time_since_posted: '2 days ago',
    location_display: 'San Francisco, CA, USA'
  },
  {
    id: 'job_2',
    title: 'Studio Session Vocalist Needed',
    description: 'Seeking a versatile vocalist for studio recording sessions. Various genres including pop, R&B, and indie. Must have professional vocal training.',
    category_id: '4',
    category: {
      id: '4',
      name: 'Session Work',
      icon: 'Mic',
      color: '#EF4444'
    },
    posted_by: 'studio_demo',
    posted_by_type: 'venue',
    poster_profile_id: null,
    job_type: 'one_time',
    payment_type: 'paid',
    payment_amount: 500,
    payment_currency: 'USD',
    payment_description: null,
    location: 'Abbey Road Studios',
    location_type: 'in_person',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    event_date: '2024-02-20',
    event_time: '14:00',
    duration_hours: 6,
    deadline: '2024-02-18',
    required_skills: ['Vocals', 'Studio Recording', 'Harmony'],
    required_equipment: [],
    required_experience: 'professional',
    required_genres: ['Pop', 'R&B', 'Indie'],
    age_requirement: '21+',
    benefits: ['Studio Access', 'Professional Development'],
    special_requirements: 'Must sign NDA',
    contact_email: 'bookings@studiodemo.com',
    contact_phone: '(555) 987-6543',
    external_link: null,
    status: 'open',
    priority: 'high',
    featured: true,
    applications_count: 8,
    views_count: 92,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z',
    expires_at: null,
    poster_name: 'Demo Recording Studio',
    poster_avatar: null,
    is_saved: false,
    time_since_posted: '1 week ago',
    location_display: 'Los Angeles, CA, USA'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featuredOnly = searchParams.get('featured_only') === 'true'
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Filter jobs based on parameters
    let filteredJobs = [...storedJobs]
    
    if (featuredOnly) {
      filteredJobs = filteredJobs.filter(job => job.featured)
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)
    
    // Simulate API response structure
    const response = {
      success: true,
      data: featuredOnly ? {
        jobs: paginatedJobs
      } : {
        jobs: paginatedJobs,
        total_count: filteredJobs.length,
        page: page,
        per_page: perPage,
        total_pages: Math.ceil(filteredJobs.length / perPage),
        has_next: endIndex < filteredJobs.length,
        has_previous: page > 1
      }
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/artist-jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()
    
    // Basic validation
    if (!jobData.title || !jobData.description || !jobData.category_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, description, category_id'
      }, { status: 400 })
    }
    
    // Validate paid jobs have payment amount
    if (jobData.payment_type === 'paid' && (!jobData.payment_amount || jobData.payment_amount <= 0)) {
      return NextResponse.json({
        success: false,
        error: 'Payment amount is required for paid jobs'
      }, { status: 400 })
    }
    
    // Create a new job with unique ID
    const newJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: jobData.title,
      description: jobData.description,
      category_id: jobData.category_id,
      category: {
        id: jobData.category_id,
        name: getCategoryName(jobData.category_id),
        icon: getCategoryIcon(jobData.category_id),
        color: getCategoryColor(jobData.category_id)
      },
      posted_by: 'current_user',
      posted_by_type: 'artist',
      poster_profile_id: null,
      job_type: jobData.job_type,
      payment_type: jobData.payment_type,
      payment_amount: jobData.payment_amount,
      payment_currency: jobData.payment_currency || 'USD',
      payment_description: jobData.payment_description,
      location: jobData.location,
      location_type: jobData.location_type,
      city: jobData.city,
      state: jobData.state,
      country: jobData.country,
      event_date: jobData.event_date,
      event_time: jobData.event_time,
      duration_hours: jobData.duration_hours,
      deadline: jobData.deadline,
      required_skills: jobData.required_skills || [],
      required_equipment: jobData.required_equipment || [],
      required_experience: jobData.required_experience,
      required_genres: jobData.required_genres || [],
      age_requirement: jobData.age_requirement,
      benefits: jobData.benefits || [],
      special_requirements: jobData.special_requirements,
      contact_email: jobData.contact_email,
      contact_phone: jobData.contact_phone,
      external_link: jobData.external_link,
      status: 'open',
      priority: jobData.priority || 'normal',
      featured: jobData.featured || false,
      applications_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: null,
      poster_name: 'Current User',
      poster_avatar: null,
      is_saved: false,
      time_since_posted: 'just now',
      location_display: getLocationDisplay(jobData)
    }

    // Store the job in memory (add to the beginning of the array for newest first)
    storedJobs.unshift(newJob)
    
    console.log(`Job created and stored: ${newJob.id}`)
    console.log(`Total jobs in storage: ${storedJobs.length}`)

    return NextResponse.json({
      success: true,
      data: newJob,
      message: 'Job created successfully and stored in memory'
    })
  } catch (error) {
    console.error('Error in POST /api/artist-jobs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create job'
      },
      { status: 500 }
    )
  }
}

function getCategoryName(categoryId: string): string {
  const categories = {
    '1': 'Opening Slots',
    '2': 'Venue Bookings',
    '3': 'Collaborations',
    '4': 'Session Work',
    '5': 'Production'
  }
  return categories[categoryId as keyof typeof categories] || 'Other'
}

function getCategoryIcon(categoryId: string): string {
  const icons = {
    '1': 'Music',
    '2': 'MapPin',
    '3': 'Users',
    '4': 'Mic',
    '5': 'Settings'
  }
  return icons[categoryId as keyof typeof icons] || 'Music'
}

function getCategoryColor(categoryId: string): string {
  const colors = {
    '1': '#8B5CF6',
    '2': '#10B981',
    '3': '#F59E0B',
    '4': '#EF4444',
    '5': '#6366F1'
  }
  return colors[categoryId as keyof typeof colors] || '#8B5CF6'
}

function getLocationDisplay(jobData: any): string {
  if (jobData.location_type === 'remote') return 'Remote'
  if (jobData.location_type === 'hybrid') return 'Hybrid'
  
  const parts = []
  if (jobData.city) parts.push(jobData.city)
  if (jobData.state) parts.push(jobData.state)
  if (jobData.country) parts.push(jobData.country)
  
  return parts.join(', ') || 'Location TBD'
} 