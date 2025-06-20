"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { useSocial } from "@/context/social-context"
import { EmojiPicker } from "./emoji-picker"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Image, Video, Link2, MapPin, Users, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Attachment {
  type: "image" | "video"
  url: string
}

interface PostVisibility {
  type: "public" | "private" | "followers"
}

interface EnhancedPostCreatorProps {
  placeholder?: string
  className?: string
  onPostCreated?: () => void
}

export function EnhancedPostCreator({
  placeholder = "What's on your mind?",
  className = "",
  onPostCreated,
}: EnhancedPostCreatorProps) {
  const { user } = useAuth()
  const { createPost } = useSocial()
  const [content, setContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [location, setLocation] = React.useState<string | null>(null)
  const [visibility, setVisibility] = React.useState<PostVisibility["type"]>("public")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Handle emoji selection
  const handleEmojiSelect = React.useCallback((emoji: { native: string }) => {
    setContent((prev) => prev + emoji.native)
  }, [])

  // Handle file upload
  const handleFileUpload = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // In a real app, you would upload these files to a storage service
    // For now, we'll create object URLs
    Array.from(files).forEach((file) => {
      const type = file.type.startsWith("image/") ? "image" : "video"
      const url = URL.createObjectURL(file)
      setAttachments((prev) => [...prev, { type: type as Attachment["type"], url }])
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  // Handle location selection
  const handleLocationSelect = React.useCallback(() => {
    // In a real app, you would use a location picker
    // For now, we'll just set a mock location
    setLocation("San Francisco, CA")
  }, [])

  // Handle visibility change
  const handleVisibilityChange = React.useCallback((newVisibility: PostVisibility["type"]) => {
    setVisibility(newVisibility)
  }, [])

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return

    setIsSubmitting(true)
    try {
      await createPost({
        content,
        attachments,
        location,
        visibility,
      })

      // Clear form
      setContent("")
      setAttachments([])
      setLocation(null)
      setVisibility("public")

      // Notify parent
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev]
      URL.revokeObjectURL(newAttachments[index].url)
      newAttachments.splice(index, 1)
      return newAttachments
    })
  }

  if (!user) return null

  return (
    <Card className={`bg-gray-900 text-white border-gray-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>
              {user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              className="min-h-[100px] bg-gray-800 border-gray-700 resize-none"
            />

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {attachments.map((attachment, index) => (
                    <div key={index} className="relative group">
                      {attachment.type === "image" ? (
                        <img
                          src={attachment.url}
                          alt="Attachment"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <video src={attachment.url} className="w-full h-32 object-cover rounded-md" />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-800/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-5 w-5 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-800/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="h-5 w-5 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-800/50"
                  onClick={handleLocationSelect}
                >
                  <MapPin className="h-5 w-5 text-gray-400" />
                </Button>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-800/50"
                  onClick={() => handleVisibilityChange("public")}
                >
                  <Users className="h-5 w-5 text-gray-400" />
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && attachments.length === 0) || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : "Post"}
              </Button>
            </div>

            {location && (
              <div className="flex items-center text-xs text-gray-400">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 