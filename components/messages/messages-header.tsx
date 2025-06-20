"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PenSquare, Search } from "lucide-react"
import NewMessageDialog from "./new-message-dialog"
import { useState } from "react"

interface MessagesHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function MessagesHeader({ searchQuery, setSearchQuery }: MessagesHeaderProps) {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsNewMessageOpen(true)}>
          <PenSquare className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>
      <NewMessageDialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen} />
    </div>
  )
}
