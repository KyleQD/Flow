"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
// Minimal local type to avoid external dependency
interface Certification {
  id: string
  title: string
  organization?: string
  year?: string
}
import { motion } from "framer-motion"

interface CertificationItemProps {
  certification: Certification
  onUpdate: (id: string, certification: Partial<Omit<Certification, "id">>) => void
  onRemove: (id: string) => void
  isEditable?: boolean
}

export function CertificationItem({ certification, onUpdate, onRemove, isEditable = true }: CertificationItemProps) {

  if (!isEditable) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex justify-between">
          <h3 className="font-medium">{certification.title}</h3>
          <span className="text-xs text-gray-500">{certification.year}</span>
        </div>
        <p className="text-xs text-gray-500">{certification.organization}</p>
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
        onClick={() => {
          const confirmed = window.confirm('Remove this certification?')
          if (confirmed) onRemove(certification.id)
        }}
        aria-label="Remove certification"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="space-y-2 pr-6">
        <div className="space-y-1">
          <Label htmlFor={`cert-title-${certification.id}`}>Certification Title</Label>
          <Input
            id={`cert-title-${certification.id}`}
            defaultValue={certification.title}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(certification.id, { title: e.target.value })}
            aria-label="Certification title"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`organization-${certification.id}`}>Issuing Organization</Label>
          <Input
            id={`organization-${certification.id}`}
            defaultValue={certification.organization}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(certification.id, { organization: e.target.value })}
            aria-label="Issuing organization"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`year-${certification.id}`}>Year</Label>
          <Input
            id={`year-${certification.id}`}
            defaultValue={certification.year}
            className="bg-gray-800 border-gray-700 text-white"
            onChange={(e) => onUpdate(certification.id, { year: e.target.value })}
            aria-label="Year received"
          />
        </div>
      </div>


    </motion.div>
  )
}
