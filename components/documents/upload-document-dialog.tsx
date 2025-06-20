"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Folder } from "./documents-management"
import { Upload, X } from "lucide-react"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: Folder[]
  currentFolder: Folder | null
}

export function UploadDocumentDialog({ open, onOpenChange, folders, currentFolder }: UploadDocumentDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>(currentFolder?.id || "")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArray])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleUpload = () => {
    // Handle upload logic here
    console.log("Uploading files:", selectedFiles)
    console.log("To folder:", selectedFolder)
    console.log("With tags:", tags)

    // Reset and close
    setSelectedFiles([])
    setTags([])
    setTagInput("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1d29] text-white border-0 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription className="text-white/60">
            Upload documents to your venue's document management system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="files">Select Files</Label>
            <div
              className={`border-2 border-dashed border-[#2a2f3e] rounded-md p-6 flex flex-col items-center justify-center ${
                selectedFiles.length > 0 ? "border-purple-600/50" : "hover:border-purple-600/30"
              }`}
            >
              <Upload className="h-8 w-8 text-white/40 mb-2" />
              <p className="text-white/60 text-center mb-2">Drag and drop files here, or click to browse</p>
              <Input id="files" type="file" multiple className="hidden" onChange={handleFileChange} />
              <Button
                variant="outline"
                className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]"
                onClick={() => document.getElementById("files")?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length})</Label>
              <div className="max-h-40 overflow-y-auto bg-[#0f1117] rounded-md p-2 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#2a2f3e] rounded-md p-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-white/60">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/60 hover:text-white"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="folder">Destination Folder</Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="bg-[#0f1117] border-[#2a2f3e] text-white focus:ring-purple-500">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d29] border-[#2a2f3e] text-white">
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-purple-600/20 text-purple-400 rounded px-2 py-1 text-sm"
                >
                  <span>{tag}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 text-purple-400 hover:text-purple-300 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tags..."
                className="bg-[#0f1117] border-[#2a2f3e] text-white placeholder:text-white/40 focus-visible:ring-purple-500"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
          >
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
