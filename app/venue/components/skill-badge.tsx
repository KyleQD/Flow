"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { motion } from "framer-motion"

interface SkillBadgeProps {
  skill: string
  onRemove?: (skill: string) => void
  isEditable?: boolean
}

export function SkillBadge({ skill, onRemove, isEditable = false }: SkillBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {isEditable ? (
        <Badge variant="secondary" className="flex items-center gap-1 pl-3">
          {skill}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-1 text-gray-400 hover:text-red-500 p-0"
            onClick={() => onRemove && onRemove(skill)}
            aria-label={`Remove ${skill} skill`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Badge>
      ) : (
        <Badge variant="secondary">{skill}</Badge>
      )}
    </motion.div>
  )
}
