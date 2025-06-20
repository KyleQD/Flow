"use client"

import * as React from "react"

interface User {
  id: string
  fullName: string
  username: string
  avatar?: string
  title?: string
  location?: string
  status?: "online" | "offline" | "away"
  email?: string
  connections?: string[]
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
  loadingUsers: boolean
  loadingPosts: boolean
  createPost: (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "shares">) => Promise<void>
  likePost: (postId: string) => Promise<void>
  unlikePost: (postId: string) => Promise<void>
  addComment: (postId: string, content: string) => Promise<void>
  loadMorePosts: () => Promise<Post[]>
  sendConnectionRequest: (userId: string) => Promise<void>
  updateUserStatus: (userId: string, status: "online" | "offline" | "away") => Promise<void>
  fetchUserById: (userId: string) => Promise<User | undefined>
  removeConnection: (userId: string) => Promise<void>
}

const SocialContext = React.createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = React.useState<User[]>([
    {
      id: "1",
      fullName: "Alex Johnson",
      username: "alexj",
      avatar: "/placeholder.svg",
      title: "Music Producer",
      location: "Los Angeles, CA",
      status: "offline",
      email: "alex@example.com",
      connections: ["2"]
    },
    {
      id: "2",
      fullName: "Sarah Williams",
      username: "sarahw",
      avatar: "/placeholder.svg",
      title: "Event Manager",
      location: "New York, NY",
      status: "offline",
      email: "sarah@example.com",
      connections: ["1"]
    }
  ])
  const [loadingUsers, setLoadingUsers] = React.useState(false)
  const [loadingPosts, setLoadingPosts] = React.useState(false)

  const [posts, setPosts] = React.useState<Post[]>([
    {
      id: "1",
      userId: "1",
      content: "Just finished recording my new single! Can't wait to share it with you all! 🎵",
      timestamp: new Date().toISOString(),
      likes: ["2"],
      comments: 3,
      shares: 1,
      media: [
        {
          type: "image",
          url: "/placeholder.svg"
        }
      ],
      visibility: "public",
      location: "Los Angeles, CA"
    }
  ])

  const createPost = async (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "shares">) => {
    const newPost: Post = {
      ...post,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      likes: [],
      comments: 0,
      shares: 0
    }
    setPosts(prev => [newPost, ...prev])
  }

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: [...post.likes, "1"] // Assuming current user ID is "1"
        }
      }
      return post
    }))
  }

  const unlikePost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes.filter(id => id !== "1") // Assuming current user ID is "1"
        }
      }
      return post
    }))
  }

  const addComment = async (postId: string, content: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        }
      }
      return post
    }))
  }

  const loadMorePosts = async () => {
    // Simulate loading more posts
    return []
  }

  const sendConnectionRequest = async (userId: string) => {
    // Simulate sending connection request
    console.log(`Connection request sent to user ${userId}`)
  }

  const updateUserStatus = async (userId: string, status: "online" | "offline" | "away") => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status
        }
      }
      return user
    }))
  }

  const fetchUserById = async (userId: string) => {
    setLoadingUsers(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return users.find(user => user.id === userId)
    } finally {
      setLoadingUsers(false)
    }
  }

  const removeConnection = async (userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.connections?.includes(userId)) {
        return {
          ...user,
          connections: user.connections.filter(id => id !== userId)
        }
      }
      return user
    }))
  }

  const value = {
    users,
    posts,
    loadingUsers,
    loadingPosts,
    createPost,
    likePost,
    unlikePost,
    addComment,
    loadMorePosts,
    sendConnectionRequest,
    updateUserStatus,
    fetchUserById,
    removeConnection
  }

  return (
    <SocialContext.Provider value={value}>
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