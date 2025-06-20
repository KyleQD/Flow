"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Conversation } from "./types"

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId: string
  onSelectConversation: (id: string) => void
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No conversations found</div>
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedConversationId
        const mainParticipant = conversation.participants[0]

        return (
          <div
            key={conversation.id}
            className={`p-3 cursor-pointer hover:bg-accent/50 ${isSelected ? "bg-accent" : ""}`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mainParticipant.avatar || "/placeholder.svg"} alt={mainParticipant.name} />
                <AvatarFallback>
                  {mainParticipant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="font-medium truncate">{mainParticipant.name}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                {conversation.eventName && (
                  <div className="text-xs text-purple-400 truncate mb-1">{conversation.eventName}</div>
                )}

                <div className="text-sm text-muted-foreground truncate">{conversation.lastMessage.content}</div>

                <div className="flex items-center gap-2 mt-1">
                  {conversation.type === "team" && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Team
                    </Badge>
                  )}
                  {conversation.type === "events" && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                      Event
                    </Badge>
                  )}
                  {conversation.type === "inquiries" && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                      Inquiry
                    </Badge>
                  )}

                  {conversation.unread > 0 && (
                    <Badge className="bg-purple-500 hover:bg-purple-500/90">{conversation.unread}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
