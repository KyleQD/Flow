import { User } from "./user"

export interface MusicRelease {
  id: string
  userId: string
  title: string
  type: "album" | "single" | "ep" | "remix"
  artwork: string
  releaseDate: string
  streamingLinks: {
    spotify?: string
    appleMusic?: string
    soundcloud?: string
    bandcamp?: string
  }
  tracks: number
  featured?: string[]
  liked?: boolean
}

export interface Post {
  id: string
  userId: string
  content: string
  media?: {
    type: "image" | "video" | "audio"
    url: string
    thumbnail?: string
  }[]
  likes: number
  comments: number
  shares: number
  createdAt: string
  updatedAt: string
  user?: User
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  likes: number
  createdAt: string
  updatedAt: string
  user?: User
}

export interface ConnectionRequest {
  id: string
  senderId: string
  receiverId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Notification {
  id: string
  userId: string
  type: "connection" | "like" | "comment" | "mention" | "release"
  content: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
} 