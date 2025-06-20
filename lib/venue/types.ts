export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (
    userData: Omit<User, "id" | "isOnline" | "lastActive" | "joinDate"> & { password: string },
  ) => Promise<boolean>
  logout: () => void
  resetPassword: (email: string) => Promise<boolean>
}

export interface ProfileContextType {
  profile: ProfileData | null
  loading: boolean
  updateProfile: (data: Partial<ProfileData>) => void
  addExperience: (experience: Omit<ProfileData["experience"][0], "id">) => void
  updateExperience: (id: string, experience: Partial<Omit<ProfileData["experience"][0], "id">>) => void
  removeExperience: (id: string) => void
  addCertification: (certification: Omit<ProfileData["certifications"][0], "id">) => void
  updateCertification: (id: string, certification: Partial<Omit<ProfileData["certifications"][0], "id">>) => void
  removeCertification: (id: string) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  addGalleryItem: (item: Omit<ProfileData["gallery"][0], "id">) => void
  removeGalleryItem: (id: string) => void
  reorderGallery: (newOrder: ProfileData["gallery"]) => void
  isConnected: boolean
  toggleConnection: () => void
  toggleTheme: () => void
  exportProfile: () => void
  importProfile: (data: string) => boolean
  searchSkills: (query: string) => string[]
  createGroup: (groupData: GroupData) => Promise<boolean>
  createEPK: () => Promise<string>
  upgradeToPremiumEPK: () => Promise<boolean>
  createEvent: (eventData: EventData) => Promise<boolean>
  generateTickets: (eventId: string, quantity: number) => Promise<boolean>
  promotePaidContent: (contentId: string, budget: number) => Promise<boolean>
  postJob: (jobData: JobPosting) => Promise<boolean>
}

export interface UserProfession {
  professionId: string
  userId: string
  yearsExperience: number
  isPrimary: boolean
  skills: string[]
  portfolioItems: string[]
}

export interface ProfileData {
  id: string
  fullName: string
  username: string
  location: string
  bio: string
  title: string
  avatar: string
  stats: {
    tours: number
    connections: number
    rating: number
  }
  skills: string[]
  experience: {
    id: string
    title: string
    company: string
    period: string
    description: string
  }[]
  certifications: {
    id: string
    title: string
    organization: string
    year: string
  }[]
  gallery: {
    id: string
    url: string
    alt: string
  }[]
  events: {
    id: string
    title: string
    date: string
    venues: number
    rating: number
  }[]
  reviews: {
    id: string
    name: string
    position: string
    date: string
    comment: string
    rating: number
  }[]
  theme: "light" | "dark"
  isPublic: boolean
  connections: string[]
  pendingConnections: string[]
  blockedUsers: string[]
  groups?: Group[]
  epk?: EPK
  jobPostings?: JobPosting[]
  artistType?: "solo" | "band" | "dj" | "other"
  genres?: string[]
  socialLinks?: SocialLink[]
}

export interface SocialContextType {
  users: User[]
  conversations: Conversation[]
  notifications: Notification[]
  posts: Post[]
  events: Event[]
  loadingUsers: boolean
  loadingConversations: boolean
  loadingNotifications: boolean
  loadingPosts: boolean
  loadingEvents: boolean
  fetchUsers: () => Promise<void>
  fetchUserById: (userId: string) => Promise<User | null>
  searchUsers: (query: string) => User[]
  updateUserStatus: (userId: string, isOnline: boolean) => void
  sendConnectionRequest: (userId: string) => Promise<boolean>
  acceptConnectionRequest: (userId: string) => Promise<boolean>
  rejectConnectionRequest: (userId: string) => Promise<boolean>
  removeConnection: (userId: string) => Promise<boolean>
  blockUser: (userId: string) => Promise<boolean>
  unblockUser: (userId: string) => Promise<boolean>
  sendMessage: (receiverId: string, content: string, attachments?: any[]) => Promise<boolean>
  markMessageAsRead: (messageId: string) => Promise<boolean>
  getConversation: (userId: string) => Conversation | null
  getMessages: (conversationId: string) => Promise<Message[]>
  createPost: (content: string, media?: any[], isPublic?: boolean) => Promise<boolean>
  likePost: (postId: string) => Promise<boolean>
  unlikePost: (postId: string) => Promise<boolean>
  commentOnPost: (postId: string, content: string) => Promise<boolean>
  deletePost: (postId: string) => Promise<boolean>
  createEvent: (eventData: any) => Promise<boolean>
  inviteToEvent: (eventId: string, userIds: string[]) => Promise<boolean>
  respondToEvent: (eventId: string, response: string) => Promise<boolean>
  markNotificationAsRead: (notificationId: string) => Promise<boolean>
  markAllNotificationsAsRead: () => Promise<boolean>
}

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar: string
  title: string
  location: string
  bio: string
  isOnline: boolean
  lastActive: string
  joinDate: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Notification {
  id: string
  userId: string
  type: string
  content: string
  relatedUserId?: string
  relatedItemId?: string
  timestamp: string
  isRead: boolean
}

export interface Post {
  id: string
  userId: string
  content: string
  media?: {
    id: string
    type: string
    url: string
    alt?: string
  }[]
  timestamp: string
  likes: string[]
  comments: {
    id: string
    userId: string
    content: string
    timestamp: string
  }[]
  isPublic: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
}

export interface Event {
  id: string
  creatorId: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  coverImage?: string
  attendees: string[]
  interestedUsers: string[]
  invitedUsers: string[]
  isPublic: boolean
}

// New interfaces for artist profile features

export interface Group {
  id: string
  name: string
  description: string
  creatorId: string
  members: string[]
  admins: string[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
  coverImage?: string
  posts?: Post[]
}

export interface GroupData {
  name: string
  description: string
  isPublic: boolean
  coverImage?: string
}

export interface EPK {
  id: string
  userId: string
  bio: string
  photos: {
    id: string
    url: string
    alt: string
  }[]
  videos: {
    id: string
    url: string
    title: string
    thumbnail?: string
  }[]
  music: {
    id: string
    url: string
    title: string
    duration: string
  }[]
  pressReleases: {
    id: string
    title: string
    date: string
    content: string
    source?: string
  }[]
  contactInfo: {
    email: string
    phone?: string
    website?: string
    socialLinks: SocialLink[]
  }
  isPremium: boolean
  customDomain?: string
  createdAt: string
  updatedAt: string
}

export interface SocialLink {
  platform: string
  url: string
  username?: string
}

export interface EventData {
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  venue: string
  ticketPrice?: number
  ticketUrl?: string
  coverImage?: string
  isPublic: boolean
  capacity: number
  genre?: string[]
  ageRestriction?: string
}

export interface JobPosting {
  id: string
  userId: string
  title: string
  description: string
  location: string
  type: "full-time" | "part-time" | "contract" | "one-time"
  category: "musician" | "dancer" | "security" | "av-tech" | "crew" | "other"
  compensation: {
    amount?: number
    type: "hourly" | "fixed" | "negotiable"
    details?: string
  }
  requirements?: string[]
  contactEmail: string
  contactPhone?: string
  isActive: boolean
  createdAt: string
  expiresAt?: string
}

export interface TicketType {
  id: string
  eventId: string
  name: string
  price: number
  quantity: number
  sold: number
  description?: string
  startSaleDate?: string
  endSaleDate?: string
}

export interface Promotion {
  id: string
  userId: string
  contentId: string
  contentType: "event" | "post" | "profile" | "job"
  budget: number
  startDate: string
  endDate: string
  status: "pending" | "active" | "completed" | "cancelled"
  metrics: {
    impressions: number
    clicks: number
    conversions: number
  }
  targetAudience?: {
    locations?: string[]
    ageRange?: {
      min?: number
      max?: number
    }
    interests?: string[]
  }
}
