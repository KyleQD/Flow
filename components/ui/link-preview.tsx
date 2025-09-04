"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, LinkIcon, Globe, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkPreviewData {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
}

interface LinkPreviewProps {
  url: string
  className?: string
  onPreviewGenerated?: (data: LinkPreviewData) => void
}

export function LinkPreview({ url, className, onPreviewGenerated }: LinkPreviewProps) {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return

    const generatePreview = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Call our link preview API
        const response = await fetch('/api/link-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch link preview')
        }

        const data = await response.json()
        setPreviewData(data)
        onPreviewGenerated?.(data)
      } catch (err) {
        setError("Failed to generate preview")
        console.error("Link preview error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    generatePreview()
  }, [url, onPreviewGenerated])

  if (isLoading) {
    return (
      <div className={cn("mt-3 animate-pulse", className)}>
        <Card className="bg-gray-800/50 border border-gray-700/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-1/3 h-32 bg-gray-700/50" />
            <div className="sm:w-2/3 p-3">
              <div className="h-4 bg-gray-700/50 rounded mb-2" />
              <div className="h-3 bg-gray-700/50 rounded mb-1" />
              <div className="h-3 bg-gray-700/50 rounded w-2/3" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error || !previewData) {
    return null
  }

  return (
    <div className={cn("mt-3", className)}>
      <Card className="bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-colors overflow-hidden group">
        <a
          href={previewData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="flex flex-col sm:flex-row">
            {previewData.image && (
              <div className="sm:w-1/3">
                <div className="relative w-full h-32 sm:h-full">
                  <img
                    src={previewData.image}
                    alt={previewData.title || "Link preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            )}
            <div className={cn("p-3", previewData.image ? "sm:w-2/3" : "w-full")}>
              <div className="flex items-center gap-2 mb-2">
                {previewData.favicon && (
                  <img
                    src={previewData.favicon}
                    alt=""
                    className="w-4 h-4 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}
                <span className="text-xs text-gray-400 flex items-center">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  {previewData.siteName || new URL(previewData.url).hostname}
                </span>
              </div>
              
              {previewData.title && (
                <h4 className="font-medium text-sm text-white mb-1 line-clamp-2 group-hover:text-purple-300 transition-colors">
                  {previewData.title}
                </h4>
              )}
              
              {previewData.description && (
                <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                  {previewData.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                  {previewData.url}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(previewData.url, "_blank")
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit
                </Button>
              </div>
            </div>
          </div>
        </a>
      </Card>
    </div>
  )
}

// Utility function to extract URLs from text content
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

// Utility function to check if content contains URLs
export function hasUrls(text: string): boolean {
  return extractUrls(text).length > 0
}
