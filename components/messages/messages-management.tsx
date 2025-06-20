"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import MessagesSidebar from "./messages-sidebar"
import MessagesContent from "./messages-content"
import NewMessageDialog from "./new-message-dialog"
import type { MessageType } from "./types"

export default function MessagesManagement() {
  const [activeType, setActiveType] = useState<MessageType>("all")
  const [selectedConversationId, setSelectedConversationId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

  function handleGroupCreated(conversationId: string) {
    setSelectedConversationId(conversationId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsNewMessageOpen(true)}>New Message</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <MessagesSidebar
          activeType={activeType}
          setActiveType={setActiveType}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
          searchQuery={searchQuery}
        />

        <MessagesContent conversationId={selectedConversationId} />
      </div>

      <NewMessageDialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen} onGroupCreated={handleGroupCreated} />
    </div>
  )
}
