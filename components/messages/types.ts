export type MessageType = "all" | "team" | "events" | "inquiries"

export interface Participant {
  id: string
  name: string
  avatar: string
  role?: string
  email?: string
  phone?: string
}

export interface MessageAttachment {
  id: string
  name: string
  size: string
  type: string
  url: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  attachments: MessageAttachment[]
}

export interface Conversation {
  id: string
  type: "team" | "events" | "inquiries"
  participants: Participant[]
  lastMessage: {
    content: string
    timestamp: string
    senderId: string
  }
  unread: number
  createdAt: string
  eventName?: string
  eventDate?: string
  groupName?: string
}

export type Attachment = MessageAttachment
