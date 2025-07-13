import { Check, X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidationFeedbackProps {
  available: boolean
  message: string
  loading: boolean
  error: string | null
  checked: boolean
  className?: string
}

export function ValidationFeedback({
  available,
  message,
  loading,
  error,
  checked,
  className
}: ValidationFeedbackProps) {
  if (!checked && !loading && !error) {
    return null
  }

  const getIcon = () => {
    if (loading) return <Loader2 className="h-4 w-4 animate-spin" />
    if (error) return <AlertCircle className="h-4 w-4" />
    if (available) return <Check className="h-4 w-4" />
    return <X className="h-4 w-4" />
  }

  const getColor = () => {
    if (loading) return 'text-muted-foreground'
    if (error) return 'text-orange-500'
    if (available) return 'text-green-500'
    return 'text-red-500'
  }

  const displayMessage = error || message

  return (
    <div className={cn('flex items-center gap-2 text-sm', getColor(), className)}>
      {getIcon()}
      <span>{displayMessage}</span>
    </div>
  )
} 