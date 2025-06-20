export interface ChatMessage {
  id: string
  eventId: string
  userId: string
  content: string
  type: 'text' | 'file'
  fileUrl?: string
  fileName?: string
  fileType?: string
  createdAt: string
  user: {
    id: string
    fullName: string
    avatar?: string
  }
}

export interface ChatAttachment {
  id: string
  messageId: string
  url: string
  name: string
  type: string
  size: number
  createdAt: string
} 