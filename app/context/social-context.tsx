"use client"

import * as React from "react"

interface User {
  id: string
  fullName: string
  username: string
  avatar?: string
  title?: string
  location?: string
}

interface Post {
  id: string
  userId: string
  content: string
  timestamp: string
  likes: string[]
  comments: number
  shares: number
  media?: {
    type: "image" | "video"
    url: string
  }[]
  visibility: "public" | "private" | "followers"
  location?: string
}

interface SocialContextType {
  users: User[]
  posts: Post[]
  createPost: (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "shares">) => Promise<void>
  likePost: (postId: string) => Promise<void>
  unlikePost: (postId: string) => Promise<void>
  addComment: (postId: string, content: string) => Promise<void>
  loadMorePosts: () => Promise<Post[]>
  sendConnectionRequest: (userId: string) => Promise<void>
}

const SocialContext = React.createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [users] = React.useState<User[]>([
    {
      id: "1",
      fullName: "Alex Johnson",
      username: "alexj",
      avatar: "/placeholder.svg",
      title: "Music Producer",
      location: "Los Angeles, CA",
    },
    {
      id: "2",
      fullName: "Sarah Williams",
      username: "sarahw",
      avatar: "/placeholder.svg",
      title: "Sound Engineer",
      location: "Nashville, TN",
    },
  ])

  const [posts, setPosts] = React.useState<Post[]>([
    {
      id: "1",
      userId: "2",
      content: "Just wrapped up an amazing tour with @bandname! Three months, 42 cities, and countless memories. The sound team was incredible throughout. #TourLife #SoundEngineer",
      timestamp: new Date().toISOString(),
      likes: [],
      comments: 0,
      shares: 0,
      visibility: "public",
    },
  ])

  const createPost = async (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "shares">) => {
    const newPost: Post = {
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
      likes: [],
      comments: 0,
      shares: 0,
      ...post,
    }
    setPosts((prev) => [newPost, ...prev])
  }

  const likePost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: [...post.likes, "currentUserId"] } : post
      )
    )
  }

  const unlikePost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes.filter((id) => id !== "currentUserId") } : post
      )
    )
  }

  const addComment = async (postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    )
  }

  const loadMorePosts = async () => {
    // In a real app, this would fetch more posts from an API
    return []
  }

  const sendConnectionRequest = async (userId: string) => {
    // In a real app, this would send a connection request
    console.log("Connection request sent to:", userId)
  }

  return (
    <SocialContext.Provider
      value={{
        users,
        posts,
        createPost,
        likePost,
        unlikePost,
        addComment,
        loadMorePosts,
        sendConnectionRequest,
      }}
    >
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = React.useContext(SocialContext)
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider")
  }
  return context
} 