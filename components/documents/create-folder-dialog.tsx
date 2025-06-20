"use client"

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

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: Folder[]
}

export function CreateFolderDialog({ open, onOpenChange, folders }: CreateFolderDialogProps) {
  const handleCreateFolder = () => {
    // Handle folder creation logic here
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1d29] text-white border-0">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription className="text-white/60">
            Create a new folder to organize your documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              placeholder="Enter folder name"
              className="bg-[#0f1117] border-[#2a2f3e] text-white placeholder:text-white/40 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentFolder">Parent Folder (Optional)</Label>
            <Select>
              <SelectTrigger className="bg-[#0f1117] border-[#2a2f3e] text-white focus:ring-purple-500">
                <SelectValue placeholder="Root folder" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d29] border-[#2a2f3e] text-white">
                <SelectItem value="root">Root folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateFolder}>
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
