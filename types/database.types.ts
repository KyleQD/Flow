export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  role: string | null;
  experience_level: string | null;
  company_name: string | null;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  primary_genres: string[];
  venue_types: string[];
  created_at: string;
  updated_at: string;
};

export type OnboardingStatus = {
  id: string;
  user_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

// =============================================================================
// VENUE MANAGEMENT TYPES
// =============================================================================

export type VenueProfile = {
  id: string;
  user_id: string;
  main_profile_id: string | null;
  venue_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  capacity: number | null;
  venue_types: string[];
  avatar_url: string | null;
  cover_image_url: string | null;
  contact_info: {
    phone?: string;
    email?: string;
    booking_email?: string;
    manager_name?: string;
  };
  social_links: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  account_tier: 'basic' | 'pro' | 'premium';
  settings: {
    public_profile: boolean;
    allow_bookings: boolean;
    show_contact_info: boolean;
    require_approval: boolean;
  };
  created_at: string;
  updated_at: string;
};

export type VenueBookingRequest = {
  id: string;
  venue_id: string;
  requester_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  event_duration: number;
  expected_attendance: number | null;
  budget_range: string | null;
  description: string | null;
  special_requirements: string | null;
  contact_email: string;
  contact_phone: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  response_message: string | null;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueDocument = {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  document_type: 'contract' | 'rider' | 'insurance' | 'license' | 'safety' | 'marketing' | 'other';
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueTeamMember = {
  id: string;
  venue_id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: string;
  permissions: {
    manage_bookings: boolean;
    manage_events: boolean;
    view_analytics: boolean;
    manage_team: boolean;
    manage_documents: boolean;
  };
  phone: string | null;
  hire_date: string | null;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'volunteer' | null;
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
  updated_at: string;
};

export type VenueEquipment = {
  id: string;
  venue_id: string;
  name: string;
  category: 'sound' | 'lighting' | 'stage' | 'seating' | 'catering' | 'security' | 'other';
  description: string | null;
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair' | 'out_of_service' | null;
  purchase_date: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  is_available_for_rent: boolean;
  rental_price: number | null;
  created_at: string;
  updated_at: string;
};

export type VenueReview = {
  id: string;
  venue_id: string;
  reviewer_id: string;
  event_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  photos: string[];
  is_verified: boolean;
  response_from_venue: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueAnalytics = {
  id: string;
  venue_id: string;
  date: string;
  page_views: number;
  unique_visitors: number;
  booking_requests: number;
  bookings_confirmed: number;
  revenue: number;
  events_hosted: number;
  average_rating: number | null;
  created_at: string;
};

export type VenueAvailability = {
  id: string;
  venue_id: string;
  date: string;
  is_available: boolean;
  booking_id: string | null;
  event_id: string | null;
  blocked_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VenuePricing = {
  id: string;
  venue_id: string;
  package_name: string;
  description: string | null;
  base_price: number;
  price_per_hour: number | null;
  price_per_person: number | null;
  minimum_hours: number | null;
  maximum_capacity: number | null;
  included_services: string[];
  additional_fees: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VenueSocialIntegration = {
  id: string;
  venue_id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'youtube';
  account_handle: string;
  access_token: string | null;
  refresh_token: string | null;
  is_connected: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
};

// =============================================================================
// EXTENDED EXISTING TYPES
// =============================================================================

// Project related types
export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  project_type: ProjectType;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  venue_type: string | null;
  genre: string | null;
  capacity: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  permissions: ProjectPermissions;
  created_at: string;
  updated_at: string;
};

export type ProjectPermissions = {
  can_edit: boolean;
  can_delete: boolean;
  can_invite: boolean;
};

// =============================================================================
// ENUMS FOR STANDARDIZED VALUES
// =============================================================================

export enum UserRole {
  ARTIST = 'artist',
  VENUE_OWNER = 'venue_owner',
  PROMOTER = 'promoter',
  MANAGER = 'manager',
  OTHER = 'other'
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional'
}

export enum ProjectStatus {
  DRAFT = 'draft',
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectType {
  TOUR = 'tour',
  FESTIVAL = 'festival',
  SINGLE_EVENT = 'single_event',
  RESIDENCY = 'residency',
  CORPORATE = 'corporate',
  OTHER = 'other'
}

export enum ProjectMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum VenueBookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum DocumentType {
  CONTRACT = 'contract',
  RIDER = 'rider',
  INSURANCE = 'insurance',
  LICENSE = 'license',
  SAFETY = 'safety',
  MARKETING = 'marketing',
  OTHER = 'other'
}

export enum EquipmentCategory {
  SOUND = 'sound',
  LIGHTING = 'lighting',
  STAGE = 'stage',
  SEATING = 'seating',
  CATERING = 'catering',
  SECURITY = 'security',
  OTHER = 'other'
}

export enum EquipmentCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  NEEDS_REPAIR = 'needs_repair',
  OUT_OF_SERVICE = 'out_of_service'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACTOR = 'contractor',
  VOLUNTEER = 'volunteer'
}

export enum TeamMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated'
}

// =============================================================================
// HELPER TYPES FOR FORMS AND API
// =============================================================================

export type OnboardingFormData = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  role: UserRole;
  experience_level: ExperienceLevel;
};

export type VenueBookingRequestCreateData = Omit<VenueBookingRequest, 
  'id' | 'status' | 'response_message' | 'requested_at' | 'responded_at' | 'created_at' | 'updated_at'
>;

export type VenueDocumentCreateData = Omit<VenueDocument, 
  'id' | 'uploaded_by' | 'created_at' | 'updated_at'
>;

export type VenueTeamMemberCreateData = Omit<VenueTeamMember, 
  'id' | 'created_at' | 'updated_at'
>;

export type VenueEquipmentCreateData = Omit<VenueEquipment, 
  'id' | 'created_at' | 'updated_at'
>;

export type VenueReviewCreateData = Omit<VenueReview, 
  'id' | 'is_verified' | 'response_from_venue' | 'responded_at' | 'created_at' | 'updated_at'
>;

export type VenuePricingCreateData = Omit<VenuePricing, 
  'id' | 'created_at' | 'updated_at'
>;

// Dashboard stats type
export type VenueDashboardStats = {
  totalBookings: number;
  pendingRequests: number;
  thisMonthRevenue: number;
  averageRating: number;
  totalReviews: number;
  teamMembers: number;
  upcomingEvents: number;
}; 