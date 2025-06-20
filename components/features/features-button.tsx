"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { FeaturesPanel } from "./features-panel"
import { Menu } from "lucide-react"

export function FeaturesButton() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <React.Fragment>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-400 hover:text-slate-100"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <FeaturesPanel open={isOpen} onOpenChange={setIsOpen} />
    </React.Fragment>
  )
} 