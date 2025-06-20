import type { Conversation, MessageType, Message, Participant } from "./types"

// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    type: "team",
    participants: [
      {
        id: "101",
        name: "Alex Johnson",
        role: "Sound Engineer",
        avatar: "/audio-mixing-console.png",
        email: "alex@tourify.com",
        phone: "+1 (555) 123-4567",
      },
    ],
    lastMessage: {
      content: "Can we discuss the equipment setup for this weekend's event?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      senderId: "101",
    },
    unread: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "2",
    type: "events",
    participants: [
      {
        id: "102",
        name: "Emma Rodriguez",
        role: "Event Organizer",
        avatar: "/placeholder.svg?height=40&width=40&query=event%20organizer",
        email: "emma@techconf.com",
        phone: "+1 (555) 987-6543",
      },
    ],
    eventName: "Tech Conference 2023",
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    lastMessage: {
      content: "We'd like to add a special request for the catering. Can we discuss options?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      senderId: "102",
    },
    unread: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "3",
    type: "inquiries",
    participants: [
      {
        id: "103",
        name: "David Wilson",
        avatar: "/placeholder.svg?height=40&width=40&query=business%20person",
        email: "david@example.com",
        phone: "+1 (555) 456-7890",
      },
    ],
    lastMessage: {
      content: "Hi there! I'm interested in booking your venue for an upcoming event.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      senderId: "103",
    },
    unread: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "4",
    type: "team",
    participants: [
      {
        id: "104",
        name: "Sarah Williams",
        role: "Marketing Director",
        avatar: "/strategic-marketing-meeting.png",
        email: "sarah@tourify.com",
        phone: "+1 (555) 234-5678",
      },
    ],
    lastMessage: {
      content: "I've updated the promotional materials for the upcoming events. Please review when you get a chance.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      senderId: "104",
    },
    unread: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "5",
    type: "events",
    participants: [
      {
        id: "105",
        name: "James Lee",
        role: "Band Manager",
        avatar: "/placeholder.svg?height=40&width=40&query=band%20manager",
        email: "james@jazzquartet.com",
        phone: "+1 (555) 345-6789",
      },
    ],
    eventName: "Jazz Night Series",
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastMessage: {
      content: "The band would like to do a sound check at 4pm. Is that possible?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      senderId: "105",
    },
    unread: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "6",
    type: "inquiries",
    participants: [
      {
        id: "106",
        name: "Olivia Martinez",
        avatar: "/placeholder.svg?height=40&width=40&query=wedding%20planner",
        email: "olivia@weddingplanner.com",
        phone: "+1 (555) 567-8901",
      },
    ],
    lastMessage: {
      content: "Do you have availability for a wedding reception on June 15th next year?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      senderId: "106",
    },
    unread: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
  },
]

// Store messages per conversation
const messagesByConversation: Record<string, Message[]> = {}

// Initialize with some mock messages for each conversation
mockConversations.forEach((conv) => {
  messagesByConversation[conv.id] = [
    {
      id: "1",
      senderId: conv.participants[0].id,
      content: conv.lastMessage.content,
      timestamp: conv.lastMessage.timestamp,
      attachments: [],
    },
  ]
})

// Function to get all conversations
export function getMockConversations(): Conversation[] {
  return mockConversations
}

// Function to get a conversation by ID
export function getConversationById(id: string): Conversation | null {
  return mockConversations.find((conv) => conv.id === id) || null
}

// Function to get conversations by type
export function getConversationsByType(type: MessageType): Conversation[] {
  if (type === "all") {
    return mockConversations
  }
  return mockConversations.filter((conv) => conv.type === type)
}

export function getMessagesForConversation(conversationId: string): Message[] {
  return messagesByConversation[conversationId] || []
}

export function sendMessage(conversationId: string, message: Omit<Message, "id" | "timestamp">): Message {
  const msg: Message = {
    ...message,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  }
  if (!messagesByConversation[conversationId]) messagesByConversation[conversationId] = []
  messagesByConversation[conversationId].push(msg)
  // Update lastMessage and unread count
  const conv = mockConversations.find((c) => c.id === conversationId)
  if (conv) {
    conv.lastMessage = {
      content: msg.content,
      timestamp: msg.timestamp,
      senderId: msg.senderId,
    }
    // Increment unread for all except sender
    if (msg.senderId !== "current-user") conv.unread += 1
    else conv.unread = 0
  }
  return msg
}

export function resetUnread(conversationId: string) {
  const conv = mockConversations.find((c) => c.id === conversationId)
  if (conv) conv.unread = 0
}

export function createGroupConversation({
  name,
  participantIds,
  participants,
  initialMessage,
}: {
  name: string
  participantIds: string[]
  participants: Participant[]
  initialMessage: string
}): Conversation {
  const id = `${Date.now()}-group-${Math.random().toString(36).slice(2, 8)}`
  const conv: Conversation = {
    id,
    type: "team",
    participants,
    lastMessage: {
      content: initialMessage,
      timestamp: new Date().toISOString(),
      senderId: "current-user",
    },
    unread: 0,
    createdAt: new Date().toISOString(),
    eventName: name,
  }
  mockConversations.unshift(conv)
  messagesByConversation[id] = [
    {
      id: `${Date.now()}-init`,
      senderId: "current-user",
      content: initialMessage,
      timestamp: new Date().toISOString(),
      attachments: [],
    },
  ]
  return conv
}
