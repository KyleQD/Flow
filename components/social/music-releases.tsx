"use client"

import { useMusicReleases } from "@/hooks/useMusicReleases"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Play, Pause, Share2, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  formatReleaseDate, 
  formatTrackCount, 
  getReleaseBadgeStyles, 
  getReleaseTypeLabel 
} from "@/utils/social"

interface MusicReleasesProps {
  userId?: string
  limit?: number
  onLike?: (releaseId: string) => void
  onShare?: (releaseId: string) => void
}

export function MusicReleases({ 
  userId, 
  limit = 5, 
  onLike,
  onShare
}: MusicReleasesProps) {
  const {
    releases,
    loading,
    playingRelease,
    handlePlay,
    handleLike,
    loadReleases
  } = useMusicReleases({ userId, limit })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Music Releases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (releases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Music Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No releases available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Music Releases</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={loadReleases}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {releases.map((release) => (
          <div key={release.id} className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={release.artwork}
                alt={release.title}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "absolute inset-0 m-auto h-8 w-8 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
                  playingRelease === release.id && "opacity-100"
                )}
                onClick={() => handlePlay(release.id)}
              >
                {playingRelease === release.id ? (
                  <Pause className="h-4 w-4 text-white" />
                ) : (
                  <Play className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium truncate">{release.title}</p>
                <Badge variant="secondary" className={getReleaseBadgeStyles(release.type)}>
                  {getReleaseTypeLabel(release.type)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {release.userId} {/* In a real app, this would show the artist name */}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatReleaseDate(release.releaseDate)} • {formatTrackCount(release.tracks)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  handleLike(release.id)
                  if (onLike) onLike(release.id)
                }}
                className={cn(
                  "h-8 w-8",
                  release.liked && "text-red-500 hover:text-red-600"
                )}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  release.liked && "fill-current"
                )} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onShare?.(release.id)}
                className="h-8 w-8"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 