"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export interface ModeratedContent {
  original: string
  moderated: string
  isSafe: boolean
  flags: {
    profanity: boolean
    harassment: boolean
    hate: boolean
    selfHarm: boolean
    sexualContent: boolean
    violence: boolean
  }
  score: number
}

interface ContentModerationProps {
  content: string
  onModerated: (result: ModeratedContent) => void
  autoModerate?: boolean
}

export function ContentModeration({ content, onModerated, autoModerate = false }: ContentModerationProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<ModeratedContent | null>(null)
  const [editedContent, setEditedContent] = useState(content)
  const { toast } = useToast()

  useEffect(() => {
    if (autoModerate && content.trim()) {
      checkContent()
    }
  }, [content, autoModerate])

  const checkContent = async () => {
    if (!content.trim()) return

    setIsChecking(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock moderation logic
    const profanity = content.includes("badword")
    const harassment = content.includes("bully")
    const hate = content.includes("hate")
    const selfHarm = content.includes("suicide")
    const sexualContent = content.includes("porn")
    const violence = content.includes("kill")

    const flags = {
      profanity,
      harassment,
      hate,
      selfHarm,
      sexualContent,
      violence,
    }

    const flagCount = Object.values(flags).filter(Boolean).length
    const score = Math.max(0, 100 - flagCount * 10)
    const isSafe = score > 50

    const moderated = isSafe ? content : "This content has been flagged for review."

    setResult({
      original: content,
      moderated,
      isSafe,
      flags,
      score,
    })

    setIsChecking(false)

    if (!isSafe) {
      toast({
        title: "Content Warning",
        description: "Your content may contain inappropriate material.",
        variant: "destructive",
      })
    }

    onModerated({
      original: content,
      moderated,
      isSafe,
      flags,
      score,
    })
  }

  const handleApprove = () => {
    if (result) {
      onModerated({ ...result, isSafe: true, moderated: editedContent })
      toast({
        title: "Content Approved",
        description: "The content has been approved.",
      })
    }
  }

  const handleReject = () => {
    if (result) {
      onModerated({ ...result, isSafe: false, moderated: "" })
      toast({
        title: "Content Rejected",
        description: "The content has been rejected.",
      })
    }
  }

  return (
    <Card className="bg-gray-900 text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Shield className="h-4 w-4 mr-2 text-purple-400" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isChecking ? (
          <div className="flex flex-col items-center justify-center py-6">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">Checking content...</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`p-1 rounded-full ${result.isSafe ? "bg-green-500/20" : "bg-red-500/20"}`}>
                {result.isSafe ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium">{result.isSafe ? "Content is safe" : "Content may be inappropriate"}</p>
                <p className="text-xs text-gray-400">Safety score: {result.score}/100</p>
              </div>
            </div>

            {!result.isSafe && (
              <div className="bg-gray-800 p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Flagged content:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.flags).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex items-center text-xs">
                          <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Moderated content:</p>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-600 text-red-500 hover:bg-red-950"
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <Button onClick={checkContent}>Check Content</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
