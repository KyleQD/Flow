export interface VenueProfile {
  id: string
  name: string
  username: string
  type: string
  description?: string
  location: string
  address?: string
  avatar?: string
  coverImage?: string
  avatarUrl?: string
  coverImageUrl?: string
  website?: string
  contactEmail?: string
  phone?: string
  capacity: number
  stats: VenueStats
  amenities: VenueAmenity[]
  specs: VenueSpecs
  bookingContact: BookingContact
  isOwner?: boolean
  createdAt: string
  updatedAt: string
}

export interface VenueStats {
  events: number
  rating: number
  capacity: number
  bookingRequests?: number
  pendingReviews?: number
  teamMembers?: number
  monthlyViews?: number
  monthlyBookings?: number
}

export interface VenueAmenity {
  name: string
  icon: string
  available: boolean
}

export interface VenueSpecs {
  soundSystem: string
  lighting: string
  stage: string
  greenRoom: boolean
  parking: string
  accessibility: string
  bar: string
  foodService: string
}

export interface BookingContact {
  name: string
  email: string
  phone: string
}

export interface VenueUpdateData extends Partial<Omit<VenueProfile, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'amenities' | 'specs' | 'bookingContact'>> {} 