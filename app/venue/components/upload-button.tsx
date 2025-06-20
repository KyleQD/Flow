"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadButtonProps {
  onUpload: (url: string, alt: string) => void
  children?: React.ReactNode
}

export function UploadButton({ onUpload, children }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulate file upload with a placeholder
    setTimeout(() => {
      // In a real app, you would upload to a server and get a URL back
      // For now, we'll create a placeholder URL
      const index = Math.floor(Math.random() * 100)
      const url = `/placeholder.svg?height=300&width=300&text=Upload+${index}`

      onUpload(url, file.name)

      setIsUploading(false)
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      })
    }, 1500)
  }

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
      />
      <label htmlFor="file-upload">
        <Button variant="outline" className="w-full text-purple-400 border-purple-600" disabled={isUploading} asChild>
          <span>
            <ImageIcon className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : children || "Upload Media"}
          </span>
        </Button>
      </label>
    </div>
  )
}
