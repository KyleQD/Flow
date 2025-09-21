'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, UserPlus, MapPin, Users, Clock, X, Filter, Loader2, User, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FriendSearchResult {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  is_verified: boolean
  followers_count: number
  following_count: number
  created_at: string
  mutual_friends: Array<{
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }>
  mutual_count: number
  outgoing_request?: { id: string; status: string }
  incoming_request?: { id: string; status: string }
  can_send_request: boolean
}

interface EnhancedFriendSearchProps {
  onFriendSelect?: (friend: FriendSearchResult) => void
  onSendRequest?: (friendId: string) => void
  className?: string
  placeholder?: string
}

export function EnhancedFriendSearch({ 
  onFriendSelect,
  onSendRequest,
  className = "",
  placeholder = "Search for friends..."
}: EnhancedFriendSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FriendSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [filters, setFilters] = useState({
    location: '',
    mutualOnly: false
  })
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (searchQuery: string, filterOptions: typeof filters) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          performSearch(searchQuery, filterOptions)
        }, 300)
      }
    })(),
    []
  )

  const performSearch = async (searchQuery: string, filterOptions: typeof filters) => {
    if (!searchQuery.trim() && !filterOptions.location && !filterOptions.mutualOnly) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20'
      })

      if (filterOptions.location) {
        params.append('location', filterOptions.location)
      }
      if (filterOptions.mutualOnly) {
        params.append('mutualOnly', 'true')
      }

      const response = await fetch(`/api/social/friend-search?${params}`)
      const data = await response.json()

      if (response.ok) {
        setResults(data.users || [])
      } else {
        console.error('Search failed:', data.error)
        toast.error('Search failed. Please try again.')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters)
  }, [query, filters, debouncedSearch])

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      const response = await fetch('/api/social/follow-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          targetUserId: friendId
        }),
      })

      if (response.ok) {
        toast.success('Friend request sent!')
        
        // Update the result to show pending status
        setResults(prev => prev.map(result => 
          result.id === friendId 
            ? { ...result, can_send_request: false, outgoing_request: { id: 'temp', status: 'pending' } }
            : result
        ))

        if (onSendRequest) {
          onSendRequest(friendId)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          const selectedResult = results[selectedIndex]
          if (onFriendSelect) {
            onFriendSelect(selectedResult)
          }
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const getRelationshipStatus = (result: FriendSearchResult) => {
    if (result.outgoing_request?.status === 'pending') {
      return { text: 'Request Sent', color: 'bg-blue-500/20 text-blue-400' }
    }
    if (result.incoming_request?.status === 'pending') {
      return { text: 'Wants to Connect', color: 'bg-green-500/20 text-green-400' }
    }
    return null
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full pl-10 pr-12 rounded-xl border-2 transition-all duration-300",
                "hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                "bg-white text-black placeholder:text-gray-500"
              )}
            />
            
            {/* Filter button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
            >
              <Filter className="h-3 w-3" />
            </Button>
            
            {/* Clear button */}
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[480px] p-0 bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl border-purple-200/50" 
          align="start"
          sideOffset={8}
        >
          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State..."
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mutual-only"
                    checked={filters.mutualOnly}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, mutualOnly: checked }))}
                  />
                  <Label htmlFor="mutual-only" className="text-sm">
                    Show mutual friends only
                  </Label>
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="max-h-[450px]">
            <div className="p-2">
              {/* Loading State */}
              {isLoading && (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-500 mb-3" />
                  <p className="text-sm text-muted-foreground">Searching for friends...</p>
                </div>
              )}
              
              {/* Empty State */}
              {!isLoading && results.length === 0 && (query || filters.location || filters.mutualOnly) && (
                <div className="py-8 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No friends found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery('')
                      setFilters({ location: '', mutualOnly: false })
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              )}

              {/* Default State */}
              {!isLoading && results.length === 0 && !query && !filters.location && !filters.mutualOnly && (
                <div className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Find Friends</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Search by name, username, or location to find people you know
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>💡 Try searching for:</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      <span className="px-2 py-1 bg-muted rounded-full">@username</span>
                      <span className="px-2 py-1 bg-muted rounded-full">Full name</span>
                      <span className="px-2 py-1 bg-muted rounded-full">City name</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Results */}
              {results.length > 0 && !isLoading && (
                <div className="space-y-2">
                  <div className="px-2 py-1 border-b border-border/50">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Found {results.length} friend{results.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <AnimatePresence>
                    {results.map((result, index) => {
                      const relationshipStatus = getRelationshipStatus(result)
                      
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                            "hover:bg-muted/50 border border-transparent",
                            selectedIndex === index && "bg-purple-500/10 border-purple-500/20"
                          )}
                          onClick={() => onFriendSelect && onFriendSelect(result)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={result.avatar_url} alt={result.full_name} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {result.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium truncate">{result.full_name}</p>
                              {result.is_verified && (
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-1">@{result.username}</p>
                            
                            {result.bio && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                {result.bio}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2">
                              {result.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{result.location}</span>
                                </div>
                              )}
                              
                              {result.mutual_count > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {result.mutual_count} mutual
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {relationshipStatus ? (
                              <Badge className={relationshipStatus.color}>
                                {relationshipStatus.text}
                              </Badge>
                            ) : result.can_send_request ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSendFriendRequest(result.id)
                                }}
                                className="h-8 px-3 text-xs bg-purple-500 hover:bg-purple-600"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Add Friend
                              </Button>
                            ) : null}
                            
                            {result.mutual_friends.length > 0 && (
                              <div className="flex -space-x-1">
                                {result.mutual_friends.slice(0, 3).map((mutual, idx) => (
                                  <Avatar key={mutual.id} className="h-5 w-5 border-2 border-background">
                                    <AvatarImage src={mutual.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                      {mutual.full_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {result.mutual_count > 3 && (
                                  <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                    <span className="text-xs">+{result.mutual_count - 3}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
