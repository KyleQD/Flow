"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import type { ProfileData } from "@/lib/venue/types"
import { motion } from "framer-motion"
import { ConfirmDialog } from "./confirm-dialog"

interface ExperienceItemProps {
  experience: ProfileData["experience"][0]
  onUpdate: (id: string, experience: Partial<Omit<ProfileData["experience"][0], "id">>) => void
  onRemove: (id: string) => void
  isEditable?: boolean
}

export function ExperienceItem({ experience, onUpdate, onRemove, isEditable = true }: ExperienceItemProps) {
  const [showConfirm, setShowConfirm] = React.useState(false)

  if (!isEditable) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex justify-between">
          <h3 className="font-medium">{experience.title}</h3>
          <span className="text-xs text-gray-500">{experience.period}</span>
        </div>
        <p className="text-sm text-gray-600">{experience.company}</p>
        <p className="text-xs text-gray-500 mt-1">{experience.description}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-700 rounded-lg p-3 relative bg-gray-800"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
        onClick={() => setShowConfirm(true)}
        aria-label="Remove experience"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="space-y-2 pr-6">
        <div className="space-y-1">
          <Label htmlFor={`job-title-${experience.id}`}>Job Title</Label>
          <Input
            id={`job-title-${experience.id}`}
            defaultValue={experience.title}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(experience.id, { title: e.target.value })}
            aria-label="Job title"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`company-${experience.id}`}>Company/Organization</Label>
          <Input
            id={`company-${experience.id}`}
            defaultValue={experience.company}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(experience.id, { company: e.target.value })}
            aria-label="Company or organization name"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`period-${experience.id}`}>Time Period</Label>
          <Input
            id={`period-${experience.id}`}
            defaultValue={experience.period}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(experience.id, { period: e.target.value })}
            aria-label="Time period"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`description-${experience.id}`}>Description</Label>
          <Textarea
            id={`description-${experience.id}`}
            defaultValue={experience.description}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(experience.id, { description: e.target.value })}
            aria-label="Job description"
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onRemove(experience.id)}
        title="Remove Experience"
        description="Are you sure you want to remove this experience from your profile? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
    </motion.div>
  )
}
