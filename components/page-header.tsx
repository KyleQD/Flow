import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  icon: LucideIcon
  description?: string
}

export function PageHeader({ title, icon: Icon, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 text-purple-500" />
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      {description && <p className="text-slate-400 mt-1">{description}</p>}
    </div>
  )
}

