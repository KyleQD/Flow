"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Star, Trash } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Folder as FolderType } from "./documents-management"

interface DocumentsSidebarProps {
  folders: FolderType[]
  selectedFolder: string | null
  setSelectedFolder: (folderId: string | null) => void
}

export function DocumentsSidebar({ folders, selectedFolder, setSelectedFolder }: DocumentsSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    contracts: true, // Default expanded folders
  })

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const rootFolders = folders.filter((folder) => folder.parent === null)

  const renderFolder = (folder: FolderType) => {
    const isExpanded = expandedFolders[folder.id] || false
    const isSelected = selectedFolder === folder.id
    const childFolders = folders.filter((f) => f.parent === folder.id)
    const hasChildren = childFolders.length > 0

    return (
      <div key={folder.id} className="mb-1">
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-[#1a1d29]",
            isSelected && "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30",
          )}
          onClick={() => setSelectedFolder(folder.id)}
        >
          {hasChildren ? (
            <button
              className="h-4 w-4 flex items-center justify-center text-white/60"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {isSelected ? (
            <FolderOpen className="h-4 w-4 text-purple-400" />
          ) : (
            <Folder className="h-4 w-4 text-white/60" />
          )}

          <span className="text-sm">{folder.name}</span>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-6 mt-1 border-l border-[#2a2f3e] pl-2">{childFolders.map(renderFolder)}</div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-[#1a1d29] bg-[#0f1117] flex flex-col overflow-hidden">
      <div className="p-3 space-y-1">
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-[#1a1d29]",
            selectedFolder === null && "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30",
          )}
          onClick={() => setSelectedFolder(null)}
        >
          <File className="h-4 w-4 text-white/60" />
          <span className="text-sm">All Documents</span>
        </div>

        <div
          className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-[#1a1d29]"
          onClick={() => {
            /* Filter for starred documents */
          }}
        >
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-sm">Starred</span>
        </div>

        <div
          className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-[#1a1d29]"
          onClick={() => {
            /* Show trash */
          }}
        >
          <Trash className="h-4 w-4 text-white/60" />
          <span className="text-sm">Trash</span>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[#1a1d29]">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider px-2 mb-2">Folders</h3>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="pr-2">{rootFolders.map(renderFolder)}</div>
        </ScrollArea>
      </div>
    </div>
  )
}
