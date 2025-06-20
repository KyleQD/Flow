"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessagesViewProps {
  darkMode: boolean
}

export function MessagesView({ darkMode }: MessagesViewProps) {
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [messageText, setMessageText] = useState("")
  const { toast } = useToast()

  // Mock conversations
  const conversations = [
    {
      id: 1,
      user: {
        name: "Sarah Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
      },
      lastMessage: "Hey, are you available for a quick call about the upcoming tour?",
      time: "10:30 AM",
      unread: 2,
    },
    {
      id: 2,
      user: {
        name: "Mike Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        online: false,
      },
      lastMessage: "I've sent you the equipment list for the festival.",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: 3,
      user: {
        name: "Taylor Reed",
        avatar: "/placeholder.svg?height=40&width=40",
        online: true,
      },
      lastMessage: "Looking forward to working with you on the Summer Sounds Festival!",
      time: "Monday",
      unread: 0,
    },
  ]

  // Mock messages for the active chat
  const messages = [
    {
      id: 1,
      sender: "them",
      content: "Hey, are you available for a quick call about the upcoming tour?",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      content: "Sure, I'm free in about an hour. What specifically do you want to discuss?",
      time: "10:35 AM",
    },
    {
      id: 3,
      sender: "them",
      content:
        "I wanted to go over the technical requirements for the venues. Some of them have updated their equipment since our last visit.",
      time: "10:37 AM",
    },
    {
      id: 4,
      sender: "them",
      content: "Also, there's a new venue added to the tour that we need to prepare for.",
      time: "10:38 AM",
    },
  ]

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    })

    setMessageText("")
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r border-gray-700">
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search messages..."
                    className={`pl-9 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-700">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer hover:bg-gray-700 ${
                      activeChat === conversation.id ? "bg-gray-700" : ""
                    }`}
                    onClick={() => setActiveChat(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                          <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {conversation.user.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-800"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="font-medium truncate">{conversation.user.name}</p>
                          <p className="text-xs text-gray-500">{conversation.time}</p>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                      </div>
                      {conversation.unread > 0 && <Badge className="ml-2 bg-purple-600">{conversation.unread}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex flex-col flex-1">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={conversations.find((c) => c.id === activeChat)?.user.avatar}
                          alt={conversations.find((c) => c.id === activeChat)?.user.name}
                        />
                        <AvatarFallback>
                          {conversations.find((c) => c.id === activeChat)?.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{conversations.find((c) => c.id === activeChat)?.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {conversations.find((c) => c.id === activeChat)?.user.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === "me"
                              ? "bg-purple-600 text-white rounded-br-none"
                              : "bg-gray-700 rounded-bl-none"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs text-right mt-1 opacity-70">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        className={darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                    <p className="text-gray-500 max-w-md">
                      Select a conversation from the list to view messages, or start a new conversation with someone in
                      your network.
                    </p>
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Start New Conversation</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
