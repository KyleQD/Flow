'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { voteAction } from '@/app/forums/_actions/thread-actions'
import { toast } from 'sonner'

interface VoteButtonProps {
  targetKind: 'thread' | 'post'
  targetId: string
  score: number
  userVote?: 'up' | 'down' | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
}

export function VoteButton({ 
  targetKind, 
  targetId, 
  score: initialScore, 
  userVote: initialUserVote,
  className,
  size = 'md',
  variant = 'default'
}: VoteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticScore, setOptimisticScore] = useState(initialScore)
  const [optimisticUserVote, setOptimisticUserVote] = useState<'up' | 'down' | null>(initialUserVote || null)

  function handleVote(kind: 'up' | 'down') {
    if (isPending) return

    startTransition(async () => {
      // Optimistic update
      let scoreDelta = 0
      let newUserVote: 'up' | 'down' | null = null

      if (optimisticUserVote === kind) {
        // Remove vote
        scoreDelta = kind === 'up' ? -1 : 1
        newUserVote = null
      } else if (optimisticUserVote) {
        // Change vote
        scoreDelta = kind === 'up' ? 2 : -2
        newUserVote = kind
      } else {
        // Add new vote
        scoreDelta = kind === 'up' ? 1 : -1
        newUserVote = kind
      }

      setOptimisticScore(optimisticScore + scoreDelta)
      setOptimisticUserVote(newUserVote)

      // Execute server action
      const result = await voteAction({
        targetKind,
        targetId,
        kind
      })

      if (!result.data?.ok) {
        // Revert optimistic update on error
        setOptimisticScore(optimisticScore)
        setOptimisticUserVote(optimisticUserVote)
        
        const errorMessage = result.data?.error === 'not_authenticated' 
          ? 'Please sign in to vote'
          : 'Failed to vote. Please try again.'
        
        toast.error(errorMessage)
      }
    })
  }

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('up')}
          disabled={isPending}
          className={cn(
            'h-6 w-6 p-0 hover:bg-slate-800',
            optimisticUserVote === 'up' && 'text-green-400 bg-green-400/10'
          )}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        
        <span className={cn(
          'text-xs font-medium min-w-[20px] text-center',
          optimisticUserVote === 'up' && 'text-green-400',
          optimisticUserVote === 'down' && 'text-red-400'
        )}>
          {optimisticScore}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote('down')}
          disabled={isPending}
          className={cn(
            'h-6 w-6 p-0 hover:bg-slate-800',
            optimisticUserVote === 'down' && 'text-red-400 bg-red-400/10'
          )}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isPending}
        className={cn(
          sizeClasses[size],
          'p-0 hover:bg-slate-800 transition-colors',
          optimisticUserVote === 'up' && 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
        )}
      >
        <ChevronUp className={iconSizes[size]} />
      </Button>
      
      <span className={cn(
        'text-sm font-medium min-w-[30px] text-center transition-colors',
        optimisticUserVote === 'up' && 'text-green-400',
        optimisticUserVote === 'down' && 'text-red-400',
        size === 'sm' && 'text-xs',
        size === 'lg' && 'text-base'
      )}>
        {optimisticScore}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isPending}
        className={cn(
          sizeClasses[size],
          'p-0 hover:bg-slate-800 transition-colors',
          optimisticUserVote === 'down' && 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
        )}
      >
        <ChevronDown className={iconSizes[size]} />
      </Button>
    </div>
  )
}
