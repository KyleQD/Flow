"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { User, Conversation, Message, Notification, Post, Event, SocialContextType } from "@/lib/types"
import { mockUsers, mockConversations, mockMessages, mockNotifications, mockPosts, mockEvents } from "@/lib/mock-users"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { v4 as uuidv4 } from "uuid"
import { searchUsers as searchUsersService } from "@/lib/search-service"

const SocialContext = createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])

  const [loadingUsers, setLoadingUsers] = useState<boolean>(true)
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true)
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true)
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true)
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true)

  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // In a real app, this would be a server call
      setUsers(mockUsers)
    } catch (error) {
      console.error("Error fetching users:", error)

      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }, [toast])

  // Fetch user by ID
  const fetchUserById = useCallback(async (userId: string): Promise<User | null> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // In a real app, this would be a server call
      const user = mockUsers.find((u) => u.id === userId)
      return user || null
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }, [])

  // Search users with enhanced functionality
  const searchUsers = useCallback(
    async (query: string, filters = {}): Promise<User[]> => {
      if (!query.trim() && Object.keys(filters).length === 0) {
        return users
      }

      return await searchUsersService(query)
    },
    [users],
  )

  // Update user status
  const updateUserStatus = useCallback((userId: string, isOnline: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, isOnline, lastSeen: isOnline ? new Date().toISOString() : user.lastSeen }
          : user,
      ),
    )
  }, [])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchUsers()

      // Simulate API calls for other data
      setLoadingConversations(true)
      setLoadingNotifications(true)
      setLoadingPosts(true)
      setLoadingEvents(true)

      try {
        // In a real app, these would be server calls
        await new Promise((resolve) => setTimeout(resolve, 700))

        if (currentUser) {
          // Filter conversations for current user
          const userConversations = mockConversations.filter((conv) => conv.participants.some(p => p.id === currentUser.id))
          setConversations(userConversations)

          // Filter notifications for current user
          const userNotifications = mockNotifications.filter((notif) => notif.userId === currentUser.id)
          setNotifications(userNotifications)
        } else {
          setConversations([])
          setNotifications([])
        }

        setPosts(mockPosts)
        setEvents(mockEvents)
      } catch (error) {
        console.error("Error loading initial data:", error)

        toast({
          title: "Error",
          description: "Failed to load some data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoadingConversations(false)
        setLoadingNotifications(false)
        setLoadingPosts(false)
        setLoadingEvents(false)
      }
    }

    loadInitialData()
  }, [fetchUsers, currentUser, toast])

  // Connection management
  const sendConnectionRequest = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        // Create a new notification for the connection request
        const newNotification: Notification = {
          id: uuidv4(),
          userId,
          type: "message",
          title: "Connection Request",
          message: `${currentUser?.email || 'Someone'} sent you a connection request`,
          timestamp: new Date().toISOString(),
          isRead: false,
          data: { relatedUserId: currentUser.id }
        }

        setNotifications((prev) => [...prev, newNotification])

        toast({
          title: "Connection request sent",
          description: "Your connection request has been sent.",
        })

        return true
      } catch (error) {
        console.error("Error sending connection request:", error)

        toast({
          title: "Error",
          description: "Failed to send connection request. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const acceptConnectionRequest = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        // Remove the connection request notification
        setNotifications((prev) =>
          prev.filter((notif) => !(notif.type === "message" && notif.data?.relatedUserId === userId)),
        )

        // Create a new notification for the accepted request
        const newNotification: Notification = {
          id: uuidv4(),
          userId,
          type: "message",
          title: "Connection Accepted",
          message: `${currentUser?.email || 'Someone'} accepted your connection request`,
          timestamp: new Date().toISOString(),
          isRead: false,
          data: { relatedUserId: currentUser?.id }
        }

        setNotifications((prev) => [...prev, newNotification])

        toast({
          title: "Connection accepted",
          description: "You are now connected.",
        })

        return true
      } catch (error) {
        console.error("Error accepting connection request:", error)

        toast({
          title: "Error",
          description: "Failed to accept connection request. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const rejectConnectionRequest = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        // Remove the connection request notification
        setNotifications((prev) =>
          prev.filter((notif) => !(notif.type === "message" && notif.data?.relatedUserId === userId)),
        )

        toast({
          title: "Connection rejected",
          description: "The connection request has been rejected.",
        })

        return true
      } catch (error) {
        console.error("Error rejecting connection request:", error)

        toast({
          title: "Error",
          description: "Failed to reject connection request. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const removeConnection = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        toast({
          title: "Connection removed",
          description: "The connection has been removed.",
        })

        return true
      } catch (error) {
        console.error("Error removing connection:", error)

        toast({
          title: "Error",
          description: "Failed to remove connection. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const blockUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        toast({
          title: "User blocked",
          description: "You have blocked this user.",
        })

        return true
      } catch (error) {
        console.error("Error blocking user:", error)

        toast({
          title: "Error",
          description: "Failed to block user. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const unblockUser = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        toast({
          title: "User unblocked",
          description: "You have unblocked this user.",
        })

        return true
      } catch (error) {
        console.error("Error unblocking user:", error)

        toast({
          title: "Error",
          description: "Failed to unblock user. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  // Messaging
  const sendMessage = useCallback(
    async (receiverId: string, content: string, attachments?: any[]): Promise<void> => {
      if (!currentUser) return

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // In a real app, this would be a server call

        // Check if conversation exists
        let conversation = conversations.find(
          (conv) => conv.participants.some(p => p.id === currentUser?.id) && conv.participants.some(p => p.id === receiverId),
        )

        const newMessageId = uuidv4()
        const timestamp = new Date().toISOString()

        // Create new message
        const newMessage: Message = {
          id: newMessageId,
          conversationId: conversation?.id || "",
          senderId: currentUser?.id || "",
          content,
          timestamp,
          isRead: false,
        }

        if (conversation) {
          // Update existing conversation
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversation!.id
                ? {
                    ...conv,
                    lastMessage: newMessage,
                    unreadCount: 0,
                  }
                : conv,
            ),
          )
        } else {
          // Create new conversation
          const receiverUser = users.find(u => u.id === receiverId)
          const newConversation: Conversation = {
            id: uuidv4(),
            participants: [currentUser, receiverUser].filter(Boolean) as User[],
            lastMessage: newMessage,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          }

          setConversations((prev) => [...prev, newConversation])
          conversation = newConversation
        }

        // Create notification for receiver
        const newNotification: Notification = {
          id: uuidv4(),
          userId: receiverId,
          type: "message",
          title: "New Message",
          message: `New message from ${currentUser?.email || 'Someone'}`,
          timestamp,
          isRead: false,
          data: { relatedUserId: currentUser?.id, conversationId: conversation.id }
        }

        setNotifications((prev) => [...prev, newNotification])

        return
      } catch (error) {
        console.error("Error sending message:", error)

        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })

        return
      }
    },
    [currentUser, conversations, toast],
  )

  const markMessageAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 200))

      // In a real app, this would be a server call

      return true
    } catch (error) {
      console.error("Error marking message as read:", error)
      return false
    }
  }, [])

  const getConversation = useCallback(
    (userId: string): Conversation | null => {
      if (!currentUser) return null

      const conversation = conversations.find(
        (conv) => conv.participants.some(p => p.id === currentUser.id) && conv.participants.some(p => p.id === userId),
      )

      return conversation || null
    },
    [currentUser, conversations],
  )

  const getMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // In a real app, this would be a server call
      return mockMessages.filter(msg => msg.conversationId === conversationId)
    } catch (error) {
      console.error("Error fetching messages:", error)
      return []
    }
  }, [])

  // Posts
  const createPost = useCallback(
    async (content: string, media?: any[], isPublic = true): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        const newPost: Post = {
          id: uuidv4(),
          authorId: currentUser?.id || "",
          content,
          images: media?.map((m) => m.url),
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
        }

        setPosts((prev) => [newPost, ...prev])

        toast({
          title: "Post created",
          description: "Your post has been published.",
        })

        return true
      } catch (error) {
        console.error("Error creating post:", error)

        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const likePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // In a real app, this would be a server call

        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)),
        )

        return true
      } catch (error) {
        console.error("Error liking post:", error)

        toast({
          title: "Error",
          description: "Failed to like post. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const unlikePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // In a real app, this would be a server call

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post,
          ),
        )

        return true
      } catch (error) {
        console.error("Error unliking post:", error)

        toast({
          title: "Error",
          description: "Failed to unlike post. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const commentOnPost = useCallback(
    async (postId: string, content: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // In a real app, this would be a server call

        const newComment = {
          id: uuidv4(),
          userId: currentUser.id,
          content,
          timestamp: new Date().toISOString(),
        }

        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, comments: post.comments + 1 } : post)),
        )

        return true
      } catch (error) {
        console.error("Error commenting on post:", error)

        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        setPosts((prev) => prev.filter((post) => post.id !== postId))

        toast({
          title: "Post deleted",
          description: "Your post has been deleted.",
        })

        return true
      } catch (error) {
        console.error("Error deleting post:", error)

        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  // Events
  const createEvent = useCallback(
    async (
      eventData: Omit<Event, "id" | "creatorId" | "attendees" | "interestedUsers" | "invitedUsers">,
    ): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        const newEvent: Event = {
          id: uuidv4(),
          ...eventData,
          organizerId: currentUser?.id || "",
          attendees: [currentUser?.id || ""],
        }

        setEvents((prev) => [...prev, newEvent])

        toast({
          title: "Event created",
          description: "Your event has been created.",
        })

        return true
      } catch (error) {
        console.error("Error creating event:", error)

        toast({
          title: "Error",
          description: "Failed to create event. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, toast],
  )

  const inviteToEvent = useCallback(
    async (eventId: string, userIds: string[]): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // In a real app, this would be a server call

        // Update event attendees
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: [...new Set([...event.attendees, ...userIds])],
                }
              : event,
          ),
        )

        // Create notifications for invited users
        const event = events.find((e) => e.id === eventId)

        if (event) {
          const newNotifications: Notification[] = userIds.map((userId) => ({
            id: uuidv4(),
            userId,
            type: "event",
            title: "Event Invitation",
            message: `${currentUser?.email || 'Someone'} invited you to ${event.title}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            data: { relatedUserId: currentUser?.id, eventId }
          }))

          setNotifications((prev) => [...prev, ...newNotifications])
        }

        toast({
          title: "Invitations sent",
          description: `Invited ${userIds.length} people to the event.`,
        })

        return true
      } catch (error) {
        console.error("Error inviting to event:", error)

        toast({
          title: "Error",
          description: "Failed to send invitations. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, events, toast],
  )

  const respondToEvent = useCallback(
    async (eventId: string, response: "attending" | "interested" | "declined"): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // In a real app, this would be a server call

        setEvents((prev) =>
          prev.map((event) => {
            if (event.id !== eventId) return event

            const updatedEvent = { ...event }

            if (response === "attending") {
              updatedEvent.attendees = [...new Set([...event.attendees, currentUser?.id || ""])]
            } else if (response === "interested") {
              // For interested, we'll just add to attendees for now since Event interface doesn't have interestedUsers
              updatedEvent.attendees = [...new Set([...event.attendees, currentUser?.id || ""])]
            } else {
              updatedEvent.attendees = event.attendees.filter((id) => id !== currentUser?.id)
            }

            return updatedEvent
          }),
        )

        // Create notification for event creator
        const event = events.find((e) => e.id === eventId)

        if (event && event.organizerId !== currentUser?.id) {
          const responseText =
            response === "attending" ? "is attending" : response === "interested" ? "is interested in" : "declined"

          const newNotification: Notification = {
            id: uuidv4(),
            userId: event.organizerId,
            type: "event",
            title: "Event Response",
            message: `${currentUser?.email || 'Someone'} ${responseText} your event: ${event.title}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            data: { relatedUserId: currentUser?.id, eventId }
          }

          setNotifications((prev) => [...prev, newNotification])
        }

        toast({
          title: "Response sent",
          description: `You are now ${response === "attending" ? "attending" : response === "interested" ? "interested in" : "not attending"} this event.`,
        })

        return true
      } catch (error) {
        console.error("Error responding to event:", error)

        toast({
          title: "Error",
          description: "Failed to update response. Please try again.",
          variant: "destructive",
        })

        return false
      }
    },
    [currentUser, events, toast],
  )

  // Notifications
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 200))

      // In a real app, this would be a server call

      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)),
      )

      return true
    } catch (error) {
      console.error("Error marking notification as read:", error)
      return false
    }
  }, [])

  const markAllNotificationsAsRead = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // In a real app, this would be a server call

      setNotifications((prev) =>
        prev.map((notif) => (notif.userId === currentUser.id ? { ...notif, isRead: true } : notif)),
      )

      return true
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      return false
    }
  }, [currentUser])

  // Convert Supabase user to our custom User type
  const currentUserCustom = currentUser ? {
    id: currentUser.id,
    username: currentUser.email?.split('@')[0] || currentUser.id,
    fullName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
    avatar: currentUser.user_metadata?.avatar_url,
    bio: currentUser.user_metadata?.bio,
    location: currentUser.user_metadata?.location,
    isOnline: true,
    lastSeen: new Date().toISOString(),
  } : null

  const value = {
    users,
    conversations,
    messages: mockMessages,
    notifications,
    posts,
    events,
    currentUser: currentUserCustom,
    loadingUsers,
    loadingConversations,
    loadingNotifications,
    loadingPosts,
    loadingEvents,
    fetchUsers,
    fetchUserById,
    searchUsers,
    updateUserStatus,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    blockUser,
    unblockUser,
    sendMessage,
    markMessageAsRead,
    getConversation,
    getMessages,
    createPost,
    likePost,
    unlikePost,
    commentOnPost,
    sharePost: () => Promise.resolve(),
    followUser: () => Promise.resolve(),
    unfollowUser: () => Promise.resolve(),
    joinEvent: () => Promise.resolve(),
    leaveEvent: () => Promise.resolve(),
    deletePost,
    createEvent,
    inviteToEvent,
    respondToEvent,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    markConversationAsRead: () => {},
  }

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial() {
  const context = useContext(SocialContext)

  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider")
  }

  return context
}
