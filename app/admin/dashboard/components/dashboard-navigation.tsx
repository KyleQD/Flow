"use client"

import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Plus, Globe, Calendar } from "lucide-react"

interface DashboardNavigationProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'lg'
  showText?: boolean
  className?: string
}

export function CreateTourButton({ variant = 'primary', size = 'lg', showText = true, className = '' }: DashboardNavigationProps) {
  const router = useRouter()
  
  const handleCreateTour = () => {
    router.push('/admin/dashboard/tours')
  }

  return (
    <Button
      onClick={handleCreateTour}
      size={size}
      className={`${variant === 'primary' ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0' : 
                 variant === 'outline' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 
                 'bg-purple-600 hover:bg-purple-700 text-white'} ${className}`}
      variant={variant === 'outline' ? 'outline' : 'default'}
    >
      {variant === 'primary' && <Plus className="h-5 w-5 mr-2" />}
      {variant === 'outline' && <Globe className="h-5 w-5 mr-2" />}
      {showText && 'Create Tour'}
    </Button>
  )
}

export function CreateEventButton({ variant = 'secondary', size = 'lg', showText = true, className = '' }: DashboardNavigationProps) {
  const router = useRouter()
  
  const handleCreateEvent = () => {
    router.push('/admin/dashboard/events/create')
  }

  return (
    <Button
      onClick={handleCreateEvent}
      size={size}
      className={`${variant === 'outline' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 
                 'bg-purple-600 hover:bg-purple-700 text-white'} ${className}`}
      variant={variant === 'outline' ? 'outline' : 'default'}
    >
      {variant === 'outline' && <Calendar className="h-5 w-5 mr-2" />}
      {showText && 'Create Event'}
    </Button>
  )
} 