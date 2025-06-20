"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Paperclip, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import MessageThread from "./message-thread"
import MessageDetails from "./message-details"
import { getConversationById, getMessagesForConversation, sendMessage, resetUnread } from "./mock-data"
import type { Conversation, Message } from "./types"

interface MessagesContentProps {
  conversationId: string
}

export default function MessagesContent({ conversationId }: MessagesContentProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("messages")

  useEffect(() => {
    if (conversationId) {
      const fetchedConversation = getConversationById(conversationId)
      setConversation(fetchedConversation)
      setMessages(getMessagesForConversation(conversationId))
      resetUnread(conversationId)
    } else {
      setConversation(null)
      setMessages([])
    }
  }, [conversationId])

  function handleSend() {
    if (!conversation || !newMessage.trim()) return
    const sent = sendMessage(conversation.id, {
      senderId: "current-user",
      content: newMessage,
      attachments: [],
    })
    setMessages((prev) => [...prev, sent])
    setNewMessage("")
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{conversation.participants.map((p) => p.name).join(", ")}</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {conversation.eventName && <div className="text-sm text-purple-400 mt-1">{conversation.eventName}</div>}
      </div>

      <Tabs value={activeTab} className="flex-1 flex flex-col">
        <TabsContent value="messages" className="flex-1 flex flex-col mt-0 p-0">
          <ScrollArea className="flex-1 p-4">
            <MessageThread conversation={conversation} messages={messages} />
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                className="min-h-[80px]"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <Button size="icon" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="icon" disabled={!newMessage.trim()} onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="flex-1 mt-0 p-4">
          <MessageDetails conversation={conversation} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
