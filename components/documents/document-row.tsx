"use client"

import { getFileIcon } from "@/components/documents/file-icons"
import type { Document } from "./documents-management"
import { MoreHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentRowProps {
  document: Document
  isSelected: boolean
  onClick: () => void
  formatFileSize: (bytes: number) => string
  formatDate: (dateString: string) => string
}

export function DocumentRow({ document, isSelected, onClick, formatFileSize, formatDate }: DocumentRowProps) {
  const FileTypeIcon = getFileIcon(document.type)

  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#1a1d29] hover:bg-[#1a1d29] cursor-pointer",
        isSelected && "bg-purple-600/10 hover:bg-purple-600/20",
      )}
      onClick={onClick}
    >
      <div className="col-span-5 flex items-center gap-3">
        <div className="flex-shrink-0">
          <FileTypeIcon className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-sm truncate">{document.name}</h3>
            {document.starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />}
          </div>
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
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
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-sm uppercase">{document.type}</span>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-sm">{formatFileSize(document.size)}</span>
      </div>
      <div className="col-span-2 flex items-center">
        <span className="text-sm">{formatDate(document.lastModified)}</span>
      </div>
      <div className="col-span-1 flex items-center justify-end">
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
    </div>
  )
}
