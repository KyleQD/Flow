"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, PaperclipIcon, ImageIcon } from "lucide-react"
import { MessageList } from "@/components/message-list"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSocial } from "@/context/social-context"
import { useAuth } from "@/context/auth-context"
import { useSocket } from "@/lib/socket"
import type { Message } from "@/lib/types"
import { motion } from "framer-motion"

interface RealTimeChatProps {
  conversationId: string
  otherUserId: string
}

export function RealTimeChat({ conversationId, otherUserId }: RealTimeChatProps) {
  const { getMessages, users, sendMessage: sendSocialMessage } = useSocial()
  const { user: currentUser } = useAuth()
  const { isConnected, sendMessage, sendTypingIndicator, isUserTyping } = useSocket()

  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const otherUser = users.find((user) => user.id === otherUserId)
  const isOtherUserTyping = isUserTyping(otherUserId)

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      if (conversationId) {
        setLoading(true)
        try {
          const fetchedMessages = await getMessages(conversationId)
          setMessages(fetchedMessages)
        } finally {
          setLoading(false)
        }
      }
    }

    loadMessages()
  }, [conversationId, getMessages])

  // Handle real-time messages
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message])
      }
    }

    // Add event listener for new messages
    if (isConnected) {
      // In a real implementation, we would subscribe to messages for this conversation
      // For now, we'll handle this in the sendMessage function
    }

    return () => {
      // Clean up event listeners
    }
  }, [isConnected, conversationId])

  // Handle typing indicator
  useEffect(() => {
    if (messageText && conversationId) {
      sendTypingIndicator(conversationId, true)

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(conversationId, false)
      }, 2000)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [messageText, conversationId, sendTypingIndicator])

  const handleSendMessage = async () => {
    if (!currentUser || !otherUserId || !messageText.trim()) return

    // Create a new message
    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: otherUserId,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    // Optimistically add to UI
    setMessages((prev) => [...prev, newMessage])
    setMessageText("")

    // Send via WebSocket
    if (isConnected) {
      sendMessage({
        conversationId,
        message: newMessage,
      })
    } else {
      // Fallback to REST API
      const success = await sendSocialMessage(otherUserId, messageText)

      if (success) {
        // Refresh messages
        const updatedMessages = await getMessages(conversationId)
        setMessages(updatedMessages)
      }
    }
  }

  return (
    <Card className="bg-gray-900 text-white border-gray-800 overflow-hidden flex flex-col h-full">
      {otherUser ? (
        <>
          <CardHeader className="p-4 border-b border-gray-800 flex flex-row items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatar} alt={otherUser.fullName} />
                <AvatarFallback>
                  {otherUser.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {otherUser.isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{otherUser.fullName}</h2>
              <p className="text-xs text-gray-500">
                {isConnected ? (
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                    {otherUser.isOnline ? "Online" : "Offline"}
                  </span>
                ) : otherUser.isOnline ? (
                  "Online"
                ) : (
                  "Offline"
                )}
              </p>
            </div>
            {isConnected && <span className="ml-auto text-xs bg-green-600 px-2 py-1 rounded-full">Real-time</span>}
          </CardHeader>

          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <MessageList messages={messages} otherUser={otherUser} />

              {isOtherUserTyping && (
                <div className="px-4 py-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center text-gray-500 text-sm"
                  >
                    <div className="flex space-x-1 mr-2">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-gray-500"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-gray-500"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                      />
                      <motion.div
                        className="h-2 w-2 rounded-full bg-gray-500"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                      />
                    </div>
                    {otherUser.fullName} is typing...
                  </motion.div>
                </div>
              )}
            </div>
          )}

          <div className="p-3 border-t border-gray-800">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!messageText.trim()}
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-gray-500 p-8">
          <div className="bg-gray-800 rounded-full p-6 mb-4">
            <Send className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium">No conversation selected</h3>
          <p className="text-sm mt-2 text-center max-w-md">
            Select a conversation from the list or start a new one by connecting with other users.
          </p>
        </div>
      )}
    </Card>
  )
}
