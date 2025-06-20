import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Conversation, Message } from "./types"

interface MessageThreadProps {
  conversation: Conversation
  messages: Message[]
}

export default function MessageThread({ conversation, messages }: MessageThreadProps) {
  const getParticipantById = (id: string) => {
    if (id === "current-user") {
      return {
        id: "current-user",
        name: "You",
        avatar: "/event-coordinator-planning.png",
      }
    }
    return (
      conversation.participants.find((p) => p.id === id) || {
        id: "unknown",
        name: "Unknown User",
        avatar: "",
      }
    )
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => {
        const sender = getParticipantById(message.senderId)
        const isCurrentUser = message.senderId === "current-user"

        return (
          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-3 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={sender.avatar || "/placeholder.svg"} alt={sender.name} />
                <AvatarFallback>
                  {sender.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${isCurrentUser ? "text-right" : ""}`}>{sender.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.timestamp), "MMM d, h:mm a")}
                  </span>
                </div>

                <div className={`p-3 rounded-lg ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{message.content}</p>
                </div>

                {message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 p-2 rounded bg-background border text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <a href={attachment.url} className="hover:underline flex-1 truncate">
                          {attachment.name}
                        </a>
                        <span className="text-xs text-muted-foreground">{attachment.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
