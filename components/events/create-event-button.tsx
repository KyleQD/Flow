"use client"

import * as React from "react"
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
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => setOpen(true)}
      >
        {icon ? <Plus className="h-4 w-4" /> : text}
      </Button>
      <CreateEventDialog
        open={open}
        onOpenChange={setOpen}
        onEventCreated={onEventCreated || (() => {})}
      />
    </>
  )
} 