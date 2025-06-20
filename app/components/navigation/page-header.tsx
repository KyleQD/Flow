"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  actions?: React.ReactNode
}

export function PageHeader({ title, description, showBackButton = false, actions }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {actions}
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
} 