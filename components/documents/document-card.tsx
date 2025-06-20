"use client"

import { getFileIcon } from "@/components/documents/file-icons"
import type { Document } from "./documents-management"
import { MoreHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentCardProps {
  document: Document
  isSelected: boolean
  onClick: () => void
  formatFileSize: (bytes: number) => string
  formatDate: (dateString: string) => string
}

export function DocumentCard({ document, isSelected, onClick, formatFileSize, formatDate }: DocumentCardProps) {
  const FileTypeIcon = getFileIcon(document.type)

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-[#1a1d29] bg-[#1a1d29] p-3 transition-all hover:border-purple-600/50 hover:shadow-md",
        isSelected && "border-purple-600 bg-purple-600/10",
      )}
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {document.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            // Handle more options
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center text-center mb-3">
        {document.thumbnailUrl ? (
          <div className="h-24 w-24 rounded-md overflow-hidden mb-2">
            <img
              src={document.thumbnailUrl || "/placeholder.svg"}
              alt={document.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 w-24 flex items-center justify-center mb-2">
            <FileTypeIcon className="h-16 w-16" />
          </div>
        )}
        <h3 className="font-medium text-sm line-clamp-2">{document.name}</h3>
      </div>

      <div className="text-xs text-white/60 space-y-1">
        <div className="flex justify-between">
          <span>Size:</span>
          <span>{formatFileSize(document.size)}</span>
        </div>
        <div className="flex justify-between">
          <span>Modified:</span>
          <span>{formatDate(document.lastModified)}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="uppercase">{document.type}</span>
        </div>
      </div>

      {document.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {document.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-block px-1.5 py-0.5 bg-purple-600/20 text-purple-400 rounded text-xs">
              {tag}
            </span>
          ))}
          {document.tags.length > 2 && (
            <span className="inline-block px-1.5 py-0.5 bg-[#2a2f3e] text-white/60 rounded text-xs">
              +{document.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
