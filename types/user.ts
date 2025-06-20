export interface User {
  id: string
  fullName: string
  username: string
  avatar?: string
  title?: string
  location?: string
  status?: "online" | "offline" | "away"
  email?: string
  connections?: string[]
  bio?: string
  website?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
    linkedin?: string
  }
  preferences?: {
    emailNotifications: boolean
    pushNotifications: boolean
    theme: "light" | "dark" | "system"
    language: string
  }
  stats?: {
    followers: number
    following: number
    posts: number
    likes: number
  }
  role?: "user" | "admin" | "moderator"
  lastActive?: string
  createdAt: string
  updatedAt: string
} 