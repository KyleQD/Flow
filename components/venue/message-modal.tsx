"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessageModalProps {
  recipientName: string
  onClose: () => void
}

export function MessageModal({ recipientName, onClose }: MessageModalProps) {
  const [message, setMessage] = useState("")
  const { toast } = useToast()

  const handleSend = () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending.",
        variant: "destructive",
      })
      return
    }

    // Simulate sending a message
    toast({
      title: "Message sent",
      description: `Your message to ${recipientName} has been sent.`,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-4 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Message to {recipientName}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[150px] bg-gray-800 border-gray-700 text-white mb-4"
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSend}>
            Send Message
          </Button>
        </div>
      </div>
    </div>
  )
}
