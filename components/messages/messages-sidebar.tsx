"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import ConversationList from "./conversation-list"
import type { MessageType, Conversation } from "./types"
import { getMockConversations, resetUnread } from "./mock-data"

interface MessagesSidebarProps {
  activeType: MessageType
  setActiveType: (type: MessageType) => void
  selectedConversationId: string
  setSelectedConversationId: (id: string) => void
  searchQuery: string
}

export default function MessagesSidebar({
  activeType,
  setActiveType,
  selectedConversationId,
  setSelectedConversationId,
  searchQuery,
}: MessagesSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])

  useEffect(() => {
    // In a real app, this would be an API call
    const allConversations = getMockConversations()
    setConversations(allConversations)
  }, [])

  useEffect(() => {
    let filtered = conversations

    // Filter by type
    if (activeType !== "all") {
      filtered = filtered.filter((conv) => conv.type === activeType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((conv) => {
        const participantMatch = conv.participants.some(
          (p) => p.name.toLowerCase().includes(query) || (p.email && p.email.toLowerCase().includes(query)),
        )
        const contentMatch = conv.lastMessage.content.toLowerCase().includes(query)
        const eventMatch = conv.eventName && conv.eventName.toLowerCase().includes(query)

        return participantMatch || contentMatch || eventMatch
      })
    }

    setFilteredConversations(filtered)

    // If there are results and no conversation is selected, select the first one
    if (filtered.length > 0 && !selectedConversationId) {
      setSelectedConversationId(filtered[0].id)
    }
  }, [conversations, activeType, searchQuery, selectedConversationId, setSelectedConversationId])

  function handleSelectConversation(id: string) {
    resetUnread(id)
    setSelectedConversationId(id)
  }

  return (
    <div className="w-80 border-r flex flex-col h-full">
      <div className="p-3">
        <Tabs value={activeType} onValueChange={(value) => setActiveType(value as MessageType)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="team" className="flex-1">
              Team
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1">
              Events
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex-1">
              Inquiries
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1">
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </ScrollArea>
    </div>
  )
}
