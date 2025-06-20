"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Music, Video } from "lucide-react"

interface PostCreatorLayoutProps {
  showSidebar?: boolean
}

export function PostCreatorLayout({ showSidebar = true }: PostCreatorLayoutProps) {
  const [content, setContent] = useState("")

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-gray-800 border-gray-700 min-h-[100px]"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="border-gray-700">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-700">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-700">
                <Music className="h-4 w-4" />
              </Button>
            </div>
            <Button disabled={!content.trim()}>Post</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
