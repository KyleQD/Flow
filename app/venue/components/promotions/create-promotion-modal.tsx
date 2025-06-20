"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CreatePromotionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePromotionModal({ isOpen, onClose }: CreatePromotionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Promotion (Placeholder)</DialogTitle>
        </DialogHeader>
        <div className="text-gray-400">Promotion creation coming soon.</div>
      </DialogContent>
    </Dialog>
  )
}
