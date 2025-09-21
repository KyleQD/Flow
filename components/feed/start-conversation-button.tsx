'use client'

import { useRouter } from 'next/navigation'
import { Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

interface StartConversationButtonProps {
  onConversationCreated?: () => void
  className?: string
}

export function StartConversationButton({ 
  onConversationCreated,
  className = '' 
}: StartConversationButtonProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleClick = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Navigate to the new thread creation page
    router.push('/forums/new')
  }

  return (
    <Button 
      onClick={handleClick}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl px-6 py-3 font-medium shadow-lg shadow-purple-500/25 transition-all duration-300 ${className}`}
    >
      <Plus className="h-5 w-5 mr-2" />
      Start a Conversation
    </Button>
  )
}
