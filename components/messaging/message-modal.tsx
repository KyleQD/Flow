"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, MessageCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: {
    id: string
    username: string
    full_name?: string
    avatar_url?: string
  }
  prefill?: {
    text?: string
    attachment?: any
  }
}

export function MessageModal({ isOpen, onClose, recipient, prefill }: MessageModalProps) {
  const [message, setMessage] = useState(prefill?.text || "")
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const handleSendMessage = async () => {
    if (!user || !isAuthenticated) {
      toast.error('Please sign in to send messages')
      return
    }

    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (message.length > 1000) {
      toast.error('Message is too long. Please keep it under 1000 characters.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: recipient.id,
          content: message.trim(),
          attachment: prefill?.attachment || null
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Message sent successfully! 📩')
        setMessage("")
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const displayName = recipient.full_name || recipient.username
  const characterCount = message.length
  const maxCharacters = 1000

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Send Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipient.avatar_url || ''} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">{displayName}</p>
              <p className="text-sm text-gray-400">@{recipient.username}</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Your Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Send a message to ${displayName}...`}
              className="min-h-[120px] bg-slate-800 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </span>
              <span className={`${characterCount > maxCharacters ? 'text-red-400' : 'text-gray-400'}`}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim() || characterCount > maxCharacters}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 