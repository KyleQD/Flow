"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Users, Clock } from "lucide-react"
import { toast } from "sonner"

interface FollowRequest {
  id: string
  requester_id: string
  created_at: string
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    is_verified?: boolean
  }
}

interface FollowRequestsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FollowRequestsModal({ isOpen, onClose }: FollowRequestsModalProps) {
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchFollowRequests()
    }
  }, [isOpen])

  const fetchFollowRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/social/follow-request?action=pending', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      } else {
        console.error('Failed to fetch follow requests')
      }
    } catch (error) {
      console.error('Error fetching follow requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowRequest = async (requesterId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('/api/social/follow-request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: requesterId,
          action
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(action === 'accept' ? 'Follow request accepted!' : 'Follow request rejected')
        
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.requester_id !== requesterId))
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${action} follow request`)
      }
    } catch (error) {
      console.error(`Error ${action}ing follow request:`, error)
      toast.error(`Failed to ${action} follow request`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Follow Requests
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending follow requests</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.profiles.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {request.profiles.full_name?.charAt(0) || request.profiles.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {request.profiles.full_name || request.profiles.username}
                        </p>
                        {request.profiles.is_verified && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        @{request.profiles.username} • {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFollowRequest(request.requester_id, 'accept')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFollowRequest(request.requester_id, 'reject')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
