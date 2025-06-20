"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { User, Conversation, Message, Notification, Post, Event, SocialContextType } from "@/lib/types"
import { mockUsers, mockConversations, mockMessages, mockNotifications, mockPosts, mockEvents } from "@/lib/mock-users"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
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
    (query: string, filters = {}): User[] => {
      if (!query.trim() && Object.keys(filters).length === 0) {
        return users
      }

      return searchUsersService(query, filters)
    },
    [users],
  )

  // Update user status
  const updateUserStatus = useCallback((userId: string, isOnline: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, isOnline, lastActive: isOnline ? new Date().toISOString() : user.lastActive }
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
          const userConversations = mockConversations.filter((conv) => conv.participants.includes(currentUser.id))
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

  // Fetch more posts (for pagination)
  const fetchMorePosts = useCallback(async (): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would fetch more posts from the API
      // For now, we'll just return success
      return true
    } catch (error) {
      console.error("Error fetching more posts:", error)
      return false
    }
  }, [])

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
          type: "connection_request",
          content: `${currentUser.fullName} sent you a connection request`,
          relatedUserId: currentUser.id,
          timestamp: new Date().toISOString(),
          isRead: false,
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
          prev.filter((notif) => !(notif.type === "connection_request" && notif.relatedUserId === userId)),
        )

        // Create a new notification for the accepted request
        const newNotification: Notification = {
          id: uuidv4(),
          userId,
          type: "system",
          content: `${currentUser.fullName} accepted your connection request`,
          relatedUserId: currentUser.id,
          timestamp: new Date().toISOString(),
          isRead: false,
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
          prev.filter((notif) => !(notif.type === "connection_request" && notif.relatedUserId === userId)),
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
    async (receiverId: string, content: string, attachments?: any[]): Promise<boolean> => {
      if (!currentUser) return false

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // In a real app, this would be a server call

        // Check if conversation exists
        let conversation = conversations.find(
          (conv) => conv.participants.includes(currentUser.id) && conv.participants.includes(receiverId),
        )

        const newMessageId = uuidv4()
        const timestamp = new Date().toISOString()

        // Create new message
        const newMessage: Message = {
          id: newMessageId,
          senderId: currentUser.id,
          receiverId,
          content,
          timestamp,
          isRead: false,
          attachments: attachments?.map((att) => ({
            id: uuidv4(),
            ...att,
          })),
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
          const newConversation: Conversation = {
            id: uuidv4(),
            participants: [currentUser.id, receiverId],
            lastMessage: newMessage,
            unreadCount: 0,
          }

          setConversations((prev) => [...prev, newConversation])
          conversation = newConversation
        }

        // Create notification for receiver
        const newNotification: Notification = {
          id: uuidv4(),
          userId: receiverId,
          type: "message",
          content: `New message from ${currentUser.fullName}`,
          relatedUserId: currentUser.id,
          relatedItemId: conversation.id,
          timestamp,
          isRead: false,
        }

        setNotifications((prev) => [...prev, newNotification])

        return true
      } catch (error) {
        console.error("Error sending message:", error)

        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })

        return false
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
        (conv) => conv.participants.includes(currentUser.id) && conv.participants.includes(userId),
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
      return mockMessages[conversationId] || []
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
          userId: currentUser.id,
          content,
          media: media?.map((m) => ({
            id: uuidv4(),
            ...m,
          })),
          timestamp: new Date().toISOString(),
          likes: [],
          comments: [],
          isPublic,
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
          prev.map((post) => (post.id === postId ? { ...post, likes: [...post.likes, currentUser.id] } : post)),
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
            post.id === postId ? { ...post, likes: post.likes.filter((id) => id !== currentUser.id) } : post,
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
          user: currentUser,
        }

        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post)),
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
          creatorId: currentUser.id,
          ...eventData,
          attendees: [currentUser.id],
          interestedUsers: [],
          invitedUsers: [],
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

        // Update event invitees
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  invitedUsers: [...new Set([...event.invitedUsers, ...userIds])],
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
            type: "event_invite",
            content: `${currentUser.fullName} invited you to ${event.title}`,
            relatedUserId: currentUser.id,
            relatedItemId: eventId,
            timestamp: new Date().toISOString(),
            isRead: false,
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
              updatedEvent.attendees = [...new Set([...event.attendees, currentUser.id])]
              updatedEvent.interestedUsers = event.interestedUsers.filter((id) => id !== currentUser.id)
            } else if (response === "interested") {
              updatedEvent.interestedUsers = [...new Set([...event.interestedUsers, currentUser.id])]
              updatedEvent.attendees = event.attendees.filter((id) => id !== currentUser.id)
            } else {
              updatedEvent.attendees = event.attendees.filter((id) => id !== currentUser.id)
              updatedEvent.interestedUsers = event.interestedUsers.filter((id) => id !== currentUser.id)
            }

            return updatedEvent
          }),
        )

        // Create notification for event creator
        const event = events.find((e) => e.id === eventId)

        if (event && event.creatorId !== currentUser.id) {
          const responseText =
            response === "attending" ? "is attending" : response === "interested" ? "is interested in" : "declined"

          const newNotification: Notification = {
            id: uuidv4(),
            userId: event.creatorId,
            type: "system",
            content: `${currentUser.fullName} ${responseText} your event: ${event.title}`,
            relatedUserId: currentUser.id,
            relatedItemId: eventId,
            timestamp: new Date().toISOString(),
            isRead: false,
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

  const value = {
    users,
    conversations,
    notifications,
    posts,
    events,
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
    deletePost,
    createEvent,
    inviteToEvent,
    respondToEvent,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchMorePosts,
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
