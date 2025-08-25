import type { Profile, ArtistProfile, VenueProfile } from "@/types/profile"

export interface User {
  id: string
  username: string
  fullName: string
  avatar?: string
  bio?: string
  location?: string
  isOnline: boolean
  lastSeen?: string
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Notification {
  id: string
  userId: string
  type: 'message' | 'like' | 'comment' | 'follow' | 'event'
  title: string
  message: string
  isRead: boolean
  timestamp: string
  data?: any
}

export interface Post {
  id: string
  authorId: string
  content: string
  images?: string[]
  likes: number
  comments: number
  shares: number
  timestamp: string
  isLiked?: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  organizerId: string
  attendees: string[]
  maxAttendees?: number
  isPublic: boolean
}

export interface SocialContextType {
  users: User[]
  conversations: Conversation[]
  messages: Message[]
  notifications: Notification[]
  posts: Post[]
  events: Event[]
  currentUser: User | null
  sendMessage: (conversationId: string, content: string) => Promise<void>
  markConversationAsRead: (conversationId: string) => void
  markNotificationAsRead: (notificationId: string) => void
  likePost: (postId: string) => void
  unlikePost: (postId: string) => void
  commentOnPost: (postId: string, content: string) => void
  sharePost: (postId: string) => void
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
  joinEvent: (eventId: string) => void
  leaveEvent: (eventId: string) => void
  createPost: (content: string, images?: string[]) => void
  createEvent: (eventData: Omit<Event, 'id'>) => void
}

export interface ProfileData {
  id?: string
  profile: Profile | null
  artistProfile: ArtistProfile | null
  venueProfile: VenueProfile | null
  fullName?: string
  username?: string
  location?: string
  bio?: string
  theme?: string
  avatar?: string
  title?: string
  artistType?: string
  genre?: string
  experience: Array<{
    id: string
    title: string
    company: string
    description: string
    startDate: string
    endDate?: string
    current: boolean
  }>
  certifications: Array<{
    id: string
    title: string
    organization: string
    year: string
    url?: string
  }>
  gallery: Array<{
    id: string
    title: string
    description: string
    imageUrl: string
    order: number
  }>
  skills: string[]
}

export interface ProfileContextType {
  profile: ProfileData | null
  loading: boolean
  isConnected: boolean
  updateProfile: (data: Partial<ProfileData>) => void
  addExperience: (experience: Omit<ProfileData["experience"][0], "id">) => void
  updateExperience: (id: string, experience: Partial<Omit<ProfileData["experience"][0], "id">>) => void
  removeExperience: (id: string) => void
  addCertification: (certification: Omit<ProfileData["certifications"][0], "id">) => void
  updateCertification: (id: string, certification: Partial<Omit<ProfileData["certifications"][0], "id">>) => void
  removeCertification: (id: string) => void
  addGalleryItem: (item: Omit<ProfileData["gallery"][0], "id">) => void
  updateGalleryItem: (id: string, item: Partial<Omit<ProfileData["gallery"][0], "id">>) => void
  removeGalleryItem: (id: string) => void
  reorderGallery: (newOrder: ProfileData["gallery"]) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  toggleTheme: () => void
  searchSkills: (query: string) => string[]
  createEvent: (eventData: any) => Promise<boolean>
  updateEvent: (id: string, eventData: any) => Promise<boolean>
  deleteEvent: (id: string) => Promise<boolean>
  getEventById: (id: string) => any | undefined
  exportProfile: () => string
  importProfile: (data: string) => boolean
  createEPK: () => Promise<string>
  upgradeToPremiumEPK: () => Promise<boolean>
  generateTickets: (eventId: string, quantity: number) => Promise<boolean>
  promotePaidContent: (contentId: string, budget: number) => Promise<boolean>
  postJob: (jobData: any) => Promise<boolean>
  createGroup: (groupData: any) => Promise<boolean>
  toggleConnection: () => void
}
