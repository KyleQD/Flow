import type { User, Conversation, Message, Notification, Post, Event } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    username: "johndoe",
    fullName: "John Doe",
    avatar: "/avatars/john.jpg",
    bio: "Music producer and DJ",
    location: "Los Angeles, CA",
    isOnline: true,
    lastSeen: new Date().toISOString(),
  },
  {
    id: "2",
    username: "janedoe",
    fullName: "Jane Doe",
    avatar: "/avatars/jane.jpg",
    bio: "Singer and songwriter",
    location: "New York, NY",
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
  },
]

export const mockConversations: Conversation[] = [
  {
    id: "1",
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: "1",
      conversationId: "1",
      senderId: "2",
      content: "Hey, how's the new track coming along?",
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: new Date().toISOString(),
  },
]

export const mockMessages: Message[] = [
  {
    id: "1",
    conversationId: "1",
    senderId: "2",
    content: "Hey, how's the new track coming along?",
    timestamp: new Date().toISOString(),
    isRead: false,
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    type: "message",
    title: "New Message",
    message: "Jane Doe sent you a message",
    isRead: false,
    timestamp: new Date().toISOString(),
  },
]

export const mockPosts: Post[] = [
  {
    id: "1",
    authorId: "1",
    content: "Just finished recording my new track! Can't wait to share it with you all.",
    images: ["/images/track-1.jpg"],
    likes: 15,
    comments: 3,
    shares: 2,
    timestamp: new Date().toISOString(),
    isLiked: false,
  },
]

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival",
    description: "Join us for an amazing summer music festival featuring top artists!",
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 172800000).toISOString(),
    location: "Central Park, New York",
    organizerId: "1",
    attendees: ["1", "2"],
    maxAttendees: 1000,
    isPublic: true,
  },
]
