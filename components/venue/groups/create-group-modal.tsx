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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useProfile } from "@/context/venue/profile-context"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"
import type { GroupData } from "@/lib/venue/types"

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { createGroup } = useProfile()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<GroupData>({
    name: "",
    description: "",
    isPublic: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const success = await createGroup(formData)

      if (success) {
        toast({
          title: "Group created",
          description: `Your group "${formData.name}" has been created successfully.`,
        })
        onClose()
        setFormData({
          name: "",
          description: "",
          isPublic: true,
        })
      }
    } catch (error) {
      console.error("Error creating group:", error)
      toast({
        title: "Error creating group",
        description: "There was an error creating your group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a group to build community and facilitate discussions among members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what your group is about"
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Public Group</Label>
              <p className="text-sm text-gray-400">Anyone can find and join this group</p>
            </div>
            <Switch id="isPublic" checked={formData.isPublic} onCheckedChange={handleSwitchChange} />
          </div>

          <div className="border border-dashed border-gray-700 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <Upload className="h-8 w-8 text-gray-500" />
              <p className="text-sm font-medium">Upload Cover Image</p>
              <p className="text-xs text-gray-400">Drag and drop or click to upload</p>
              <Input id="coverImage" name="coverImage" type="file" accept="image/*" className="hidden" />
              <Button type="button" variant="outline" size="sm" className="mt-2 border-gray-700">
                Choose File
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
