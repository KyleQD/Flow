'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Music, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Filter,
  Search,
  Calendar,
  Star,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { 
  ArtistJob, 
  CollaborationFilters,
  GENRE_OPTIONS,
  INSTRUMENT_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  CreateCollaborationApplicationFormData
} from '@/types/artist-jobs'
import { ArtistJobsService } from '@/lib/services/artist-jobs.service'

interface CollaborationFeedProps {
  onCollaborationClick?: (collaboration: ArtistJob) => void
  onApply?: (application: CreateCollaborationApplicationFormData | string) => void
  onSave?: (collaborationId: string) => void
  onUnsave?: (collaborationId: string) => void
  userId?: string
  className?: string
}

export default function CollaborationFeed({
  onCollaborationClick,
  onApply,
  onSave,
  onUnsave,
  userId,
  className
}: CollaborationFeedProps) {
  const [collaborations, setCollaborations] = useState<ArtistJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<CollaborationFilters>({
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 20
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadCollaborations()
  }, [filters])

  const loadCollaborations = async () => {
    setIsLoading(true)
    try {
      const searchFilters = {
        ...filters,
        query: searchQuery || undefined
      }
      
      const results = await ArtistJobsService.searchCollaborations(searchFilters)
      setCollaborations(results.jobs)
      setTotalCount(results.total_count)
    } catch (error) {
      console.error('Error loading collaborations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 })
    loadCollaborations()
  }

  const handleFilterChange = (key: keyof CollaborationFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const getPaymentTypeColor = (paymentType: string) => {
    switch (paymentType) {
      case 'paid': return 'bg-green-500'
      case 'revenue_share': return 'bg-blue-500'
      case 'exposure': return 'bg-yellow-500'
      case 'unpaid': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'professional': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const CollaborationCard = ({ collaboration }: { collaboration: ArtistJob }) => {
    const timeAgo = formatDistanceToNow(new Date(collaboration.created_at), { addSuffix: true })
    const hasDeadline = collaboration.deadline
    const isExpiringSoon = hasDeadline && collaboration.deadline && new Date(collaboration.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return (
      <Card 
        className={cn(
          "hover:shadow-lg transition-all cursor-pointer border-l-4",
          collaboration.featured ? "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white" : "border-l-blue-500"
        )}
        onClick={() => onCollaborationClick?.(collaboration)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {collaboration.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {collaboration.category?.name}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors">
                {collaboration.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={collaboration.poster_avatar} />
                    <AvatarFallback className="text-xs">
                      {collaboration.poster_name?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{collaboration.poster_name || 'Anonymous'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{timeAgo}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{collaboration.views_count}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{collaboration.applications_count}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "text-white",
                    getPaymentTypeColor(collaboration.payment_type)
                  )}
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  {PAYMENT_TYPE_OPTIONS.find(p => p.value === collaboration.payment_type)?.label}
                </Badge>
                
                {collaboration.required_experience && (
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-white border-0",
                      getExperienceColor(collaboration.required_experience)
                    )}
                  >
                    {EXPERIENCE_LEVEL_OPTIONS.find(e => e.value === collaboration.required_experience)?.label}
                  </Badge>
                )}
              </div>
              
              {hasDeadline && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isExpiringSoon ? "text-red-600" : "text-gray-600"
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>Due {collaboration.deadline ? format(new Date(collaboration.deadline), 'MMM d') : 'No deadline'}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {collaboration.description}
          </p>
          
          {/* Instruments Needed */}
          {collaboration.instruments_needed && collaboration.instruments_needed.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                <Music className="h-3 w-3" />
                <span>Looking for:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {collaboration.instruments_needed.slice(0, 4).map((instrument) => (
                  <Badge key={instrument} variant="secondary" className="text-xs">
                    {INSTRUMENT_OPTIONS.find(i => i.value === instrument)?.label || instrument}
                  </Badge>
                ))}
                {collaboration.instruments_needed.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{collaboration.instruments_needed.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Genre */}
          {collaboration.genre && (
            <div className="mb-4">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {GENRE_OPTIONS.find(g => g.value === collaboration.genre)?.label || collaboration.genre}
                </Badge>
              </div>
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {collaboration.location_type === 'remote' ? 'Remote' :
                   collaboration.location_type === 'hybrid' ? 'Hybrid' :
                   collaboration.city ? `${collaboration.city}, ${collaboration.state}` : 'In-person'
                  }
                </span>
              </div>
              
              {collaboration.payment_amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${collaboration.payment_amount}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {userId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (collaboration.is_saved) {
                      onUnsave?.(collaboration.id)
                    } else {
                      onSave?.(collaboration.id)
                    }
                  }}
                >
                  {collaboration.is_saved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onApply?.(collaboration.id)
                }}
                disabled={!!collaboration.user_application}
              >
                {collaboration.user_application ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search collaborations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <Select onValueChange={(value) => handleFilterChange('genre', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any genre</SelectItem>
                      {GENRE_OPTIONS.map((genre) => (
                        <SelectItem key={genre.value} value={genre.value}>
                          {genre.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Type</label>
                  <Select onValueChange={(value) => handleFilterChange('payment_type', [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any payment</SelectItem>
                      {PAYMENT_TYPE_OPTIONS.map((payment) => (
                        <SelectItem key={payment.value} value={payment.value}>
                          {payment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Select onValueChange={(value) => handleFilterChange('location_type', [value])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any location</SelectItem>
                      {LOCATION_TYPE_OPTIONS.map((location) => (
                        <SelectItem key={location.value || 'any'} value={location.value || ''}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select onValueChange={(value) => handleFilterChange('sort_by', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Most recent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Most recent</SelectItem>
                      <SelectItem value="applications_count">Most applications</SelectItem>
                      <SelectItem value="views_count">Most viewed</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">
            Collaboration Opportunities
          </h2>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>
      </div>
      
      {/* Collaborations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : collaborations.length > 0 ? (
        <div className="space-y-4">
          {collaborations.map((collaboration) => (
            <CollaborationCard key={collaboration.id} collaboration={collaboration} />
          ))}
          
          {/* Load More */}
          {collaborations.length < totalCount && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                disabled={isLoading}
              >
                Load More Collaborations
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No collaborations found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('')
              setFilters({
                sort_by: 'created_at',
                sort_order: 'desc',
                page: 1,
                per_page: 20
              })
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}