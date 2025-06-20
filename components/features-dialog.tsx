"use client"

import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FeaturesPanel } from "@/components/features-panel"

interface FeatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeaturesDialog({ open, onOpenChange }: FeatureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 bg-[#13151c]">
        <FeaturesPanel />
      </DialogContent>
    </Dialog>
  )
} 