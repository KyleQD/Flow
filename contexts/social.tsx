"use client"

import * as React from "react"
import { User } from "@/types/user"
import { Post } from "@/components/social/types"
import { useToast } from "@/components/ui/use-toast"

interface SocialContextType {
  users: User[]
  posts: Post[]
  loadingUsers: boolean
  loadingPosts: boolean
  error: Error | null
  createPost: (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "shares">) => Promise<void>
  likePost: (postId: string) => Promise<void>
  unlikePost: (postId: string) => Promise<void>
  addComment: (postId: string, content: string) => Promise<void>
  loadMorePosts: () => Promise<Post[]>
  sendConnectionRequest: (userId: string) => Promise<void>
  updateUserStatus: (userId: string, status: User["status"]) => Promise<void>
  fetchUserById: (userId: string) => Promise<User | undefined>
  removeConnection: (userId: string) => Promise<void>
  clearError: () => void
}

const SocialContext = React.createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [users, setUsers] = React.useState<User[]>([])
  const [posts, setPosts] = React.useState<Post[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(false)
  const [loadingPosts, setLoadingPosts] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  // Load initial data
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingUsers(true)
        setLoadingPosts(true)
        // TODO: Replace with actual API calls
        const mockUsers: User[] = [
          {
            id: "1",
            fullName: "Alex Johnson",
            username: "alexj",
            avatar: "/placeholder.svg",
            title: "Music Producer",
            location: "Los Angeles, CA",
            status: "offline",
            email: "alex@example.com",
            connections: ["2"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
            connections: ["1"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        const mockPosts: Post[] = [
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
                url: "/placeholder.svg",
                alt: "Recording studio setup"
              }
            ],
            visibility: "public",
            location: "Los Angeles, CA"
          }
        ]

        setUsers(mockUsers)
        setPosts(mockPosts)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load initial data"))
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoadingUsers(false)
        setLoadingPosts(false)
      }
    }

    loadInitialData()
  }, [toast])

  const createPost = async (post: Omit<Post, "id" | "timestamp" | "likes" | "comments" | "shares">) => {
    try {
      const newPost: Post = {
        ...post,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        likes: [],
        comments: 0,
        shares: 0
      }
      setPosts(prev => [newPost, ...prev])
      toast({
        title: "Success",
        description: "Post created successfully!"
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create post"))
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const likePost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: [...post.likes, "1"] // Assuming current user ID is "1"
          }
        }
        return post
      }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to like post"))
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const unlikePost = async (postId: string) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes.filter(id => id !== "1") // Assuming current user ID is "1"
          }
        }
        return post
      }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to unlike post"))
      toast({
        title: "Error",
        description: "Failed to unlike post. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const addComment = async (postId: string, content: string) => {
    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1
          }
        }
        return post
      }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add comment"))
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const loadMorePosts = async () => {
    try {
      setLoadingPosts(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more posts"))
      toast({
        title: "Error",
        description: "Failed to load more posts. Please try again.",
        variant: "destructive"
      })
      throw err
    } finally {
      setLoadingPosts(false)
    }
  }

  const sendConnectionRequest = async (userId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast({
        title: "Success",
        description: "Connection request sent!"
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send connection request"))
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const updateUserStatus = async (userId: string, status: User["status"]) => {
    try {
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status
          }
        }
        return user
      }))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update user status"))
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const fetchUserById = async (userId: string) => {
    try {
      setLoadingUsers(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return users.find(user => user.id === userId)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user"))
      toast({
        title: "Error",
        description: "Failed to fetch user. Please try again.",
        variant: "destructive"
      })
      throw err
    } finally {
      setLoadingUsers(false)
    }
  }

  const removeConnection = async (userId: string) => {
    try {
      setUsers(prev => prev.map(user => {
        if (user.connections?.includes(userId)) {
          return {
            ...user,
            connections: user.connections.filter(id => id !== userId)
          }
        }
        return user
      }))
      toast({
        title: "Success",
        description: "Connection removed successfully!"
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to remove connection"))
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }

  const clearError = () => setError(null)

  const value = {
    users,
    posts,
    loadingUsers,
    loadingPosts,
    error,
    createPost,
    likePost,
    unlikePost,
    addComment,
    loadMorePosts,
    sendConnectionRequest,
    updateUserStatus,
    fetchUserById,
    removeConnection,
    clearError
  }

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const context = React.useContext(SocialContext)
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider")
  }
  return context
} 