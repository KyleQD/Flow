import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Paperclip, File, Image, X } from "lucide-react"
import { toast } from "sonner"
import { ChatMessage } from '../types/chat'
import { sendMessage, uploadChatFile } from '../actions/chat-actions'
import { formatDistanceToNow } from 'date-fns'

interface ChatTabProps {
  eventId: string
  messages: ChatMessage[]
  currentUser: {
    id: string
    fullName: string
    avatar?: string
  }
}

export function ChatTab({ eventId, messages: initialMessages, currentUser }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendMessage() {
    if (!newMessage.trim() && !selectedFile) return
    setIsSending(true)

    try {
      let fileUrl: string | undefined
      let fileName: string | undefined
      let fileType: string | undefined

      if (selectedFile) {
        const uploadResult = await uploadChatFile(selectedFile)
        if (!uploadResult.success) {
          throw new Error(uploadResult.error)
        }
        fileUrl = uploadResult.url
        fileName = selectedFile.name
        fileType = selectedFile.type
      }

      const result = await sendMessage({
        eventId,
        content: newMessage,
        type: selectedFile ? 'file' : 'text',
        fileUrl,
        fileName,
        fileType,
      })

      if (result.success) {
        setNewMessage('')
        setSelectedFile(null)
        // TODO: Update messages with real-time data
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <Card className="flex-1 bg-gray-900 border-gray-800 overflow-hidden">
        <CardHeader className="border-b border-gray-800">
          <CardTitle>Event Chat</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={message.user.avatar} />
                  <AvatarFallback>
                    {message.user.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{message.user.fullName}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {message.type === 'text' ? (
                    <p className="text-gray-300 mt-1">{message.content}</p>
                  ) : (
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg inline-flex items-center gap-2">
                      {message.fileType?.startsWith('image/') ? (
                        <Image className="h-4 w-4 text-gray-400" />
                      ) : (
                        <File className="h-4 w-4 text-gray-400" />
                      )}
                      <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        {message.fileName}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="mt-4 bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          {selectedFile && (
            <div className="mb-2 p-2 bg-gray-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{selectedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || (!newMessage.trim() && !selectedFile)}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 