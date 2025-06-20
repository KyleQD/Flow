"use client"

import { FolderPlus, Menu, PanelLeft, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DocumentsHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  setIsUploadDialogOpen: (open: boolean) => void
  setIsCreateFolderDialogOpen: (open: boolean) => void
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
}

export function DocumentsHeader({
  searchQuery,
  setSearchQuery,
  setIsUploadDialogOpen,
  setIsCreateFolderDialogOpen,
  showSidebar,
  setShowSidebar,
}: DocumentsHeaderProps) {
  return (
    <div className="border-b border-[#1a1d29] bg-[#0f1117] p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-white"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-9 w-9 text-white"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Document Management</h1>
            <p className="text-white/60 text-sm">Store and organize your venue documents</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1a1d29] border-0 text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]"
              onClick={() => setIsCreateFolderDialogOpen(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
