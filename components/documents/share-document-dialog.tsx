"use client"

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
import type { Document } from "./documents-management"
import { Copy, Globe, Lock, Mail, Users } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

interface ShareDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: Document
}

export function ShareDocumentDialog({ open, onOpenChange, document }: ShareDocumentDialogProps) {
  const [shareType, setShareType] = useState<"public" | "restricted" | "private">("restricted")
  const [email, setEmail] = useState("")
  const [allowDownload, setAllowDownload] = useState(true)
  const [allowEdit, setAllowEdit] = useState(false)

  const handleShare = () => {
    // Handle share logic here
    console.log("Sharing document:", document.name)
    console.log("Share type:", shareType)
    console.log("Email:", email)
    console.log("Allow download:", allowDownload)
    console.log("Allow edit:", allowEdit)

    onOpenChange(false)
  }

  const shareLink = `https://tourify.com/documents/share/${document.id}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1d29] text-white border-0">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription className="text-white/60">Share "{document.name}" with others.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Access Type</Label>
            <RadioGroup value={shareType} onValueChange={(value) => setShareType(value as any)}>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a2f3e]">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center cursor-pointer">
                  <Globe className="mr-2 h-4 w-4 text-green-400" />
                  <div>
                    <div>Public</div>
                    <div className="text-xs text-white/60">Anyone with the link can view</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a2f3e]">
                <RadioGroupItem value="restricted" id="restricted" />
                <Label htmlFor="restricted" className="flex items-center cursor-pointer">
                  <Users className="mr-2 h-4 w-4 text-blue-400" />
                  <div>
                    <div>Restricted</div>
                    <div className="text-xs text-white/60">Only specific people can access</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a2f3e]">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center cursor-pointer">
                  <Lock className="mr-2 h-4 w-4 text-red-400" />
                  <div>
                    <div>Private</div>
                    <div className="text-xs text-white/60">Only you can access</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {shareType === "restricted" && (
            <div className="space-y-2">
              <Label htmlFor="email">Share with Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="bg-[#0f1117] border-[#2a2f3e] text-white placeholder:text-white/40 focus-visible:ring-purple-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Mail className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </div>
            </div>
          )}

          {shareType !== "private" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareLink}
                    className="bg-[#0f1117] border-[#2a2f3e] text-white focus-visible:ring-purple-500"
                  />
                  <Button variant="outline" className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-3 bg-[#0f1117] p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="download" className="cursor-pointer">
                      Allow download
                    </Label>
                    <Switch id="download" checked={allowDownload} onCheckedChange={setAllowDownload} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit" className="cursor-pointer">
                      Allow edit
                    </Label>
                    <Switch id="edit" checked={allowEdit} onCheckedChange={setAllowEdit} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-[#2a2f3e] text-white hover:bg-[#2a2f3e]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleShare}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
