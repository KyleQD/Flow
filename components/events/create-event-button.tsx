"use client"

import { Button } from "@/components/ui/button"
import { CreateEventDialog } from "./create-event-dialog"
import { Plus } from "lucide-react"

interface CreateEventButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  icon?: boolean
  text?: string
  onEventCreated?: () => void
}

export function CreateEventButton({
  variant = "default",
  size = "default",
  className,
  icon = false,
  text = "Create Event",
  onEventCreated,
}: CreateEventButtonProps) {
  return (
    <CreateEventDialog
      trigger={
        <Button variant={variant} size={size} className={className}>
          {icon ? <Plus className="h-4 w-4" /> : text}
        </Button>
      }
      onEventCreated={onEventCreated}
    />
  )
} 