'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, UserPlus, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

interface SuggestedUser {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  is_verified: boolean
  followers_count: number
  following_count: number
  created_at: string
}

interface SimpleSuggestedConnectionsProps {
  limit?: number
  excludeUserIds?: string[]
  onConnect?: (userId: string) => void
}

export function SimpleSuggestedConnections({ 
  limit = 5, 
  excludeUserIds = [], 
  onConnect 
}: SimpleSuggestedConnectionsProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    loadSuggestedUsers()
  }, [limit, excludeUserIds])

  const loadSuggestedUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/social/suggested?limit=${limit}`)
      const data = await response.json()
      
      if (response.ok) {
        // Filter out excluded users
        const filteredUsers = data.users?.filter((user: SuggestedUser) => 
          !excludeUserIds.includes(user.id)
        ) || []
        setSuggestedUsers(filteredUsers)
      } else {
        console.error('Failed to load suggested users:', data.error)
        toast.error('Failed to load suggestions')
      }
    } catch (error) {
      console.error('Error loading suggested users:', error)
      toast.error('Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (userId: string) => {
    try {
      setConnecting(userId)
      
      const response = await fetch('/api/social/follow-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          targetUserId: userId
        }),
      })

      if (response.ok) {
        toast.success('Friend request sent!')
        
        // Remove the connected user from suggestions
        setSuggestedUsers(prev => prev.filter(user => user.id !== userId))
        
        if (onConnect) {
          onConnect(userId)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Failed to send connection request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request')
    } finally {
      setConnecting(null)
    }
  }

  const renderAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="text-center py-6">
        <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-3">No suggestions available</p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSuggestedUsers}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {suggestedUsers.map((user) => (
        <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
              {renderAvatarFallback(user.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              {user.is_verified && (
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <UserCheck className="h-2 w-2 text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            <p className="text-xs text-muted-foreground">
              {user.followers_count} followers
            </p>
          </div>
          
          <Button
            size="sm"
            onClick={() => handleConnect(user.id)}
            disabled={connecting === user.id}
            className="h-8 px-3 text-xs bg-purple-500 hover:bg-purple-600"
          >
            {connecting === user.id ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Connect
              </>
            )}
          </Button>
        </div>
      ))}
      
      <div className="pt-2 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSuggestedUsers}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh Suggestions
        </Button>
      </div>
    </div>
  )
}
