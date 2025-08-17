'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VoteButton } from './vote-button'
import { 
  MessageCircle, 
  ExternalLink, 
  Pin, 
  Lock, 
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ThreadTag {
  id: string
  slug: string
  label: string
  color?: string
}

interface ThreadAuthor {
  id: string
  username: string
  avatar_url?: string
  is_verified?: boolean
}

interface ThreadForum {
  id: string
  slug: string
  title: string
}

interface ContentRef {
  id: string
  kind: string
  title?: string
  thumbnail_url?: string
  target_url?: string
}

interface ThreadCardProps {
  id: string
  forum: ThreadForum
  title: string
  kind: 'text' | 'link' | 'media' | 'crosspost'
  contentMd?: string
  linkUrl?: string
  contentRef?: ContentRef
  author: ThreadAuthor
  tags?: ThreadTag[]
  score: number
  userVote?: 'up' | 'down' | null
  commentsCount: number
  viewsCount?: number
  createdAt: string
  isPinned?: boolean
  isLocked?: boolean
  isOwnPost?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void
  className?: string
  compact?: boolean
}

export function ThreadCardV2({
  id,
  forum,
  title,
  kind,
  contentMd,
  linkUrl,
  contentRef,
  author,
  tags = [],
  score,
  userVote,
  commentsCount,
  viewsCount = 0,
  createdAt,
  isPinned = false,
  isLocked = false,
  isOwnPost = false,
  onEdit,
  onDelete,
  onReport,
  className,
  compact = false
}: ThreadCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  const threadUrl = `/forums/${forum.slug}/t/${id}`
  
  // Truncate content for preview
  const contentPreview = contentMd && contentMd.length > 300 
    ? contentMd.slice(0, 300) + '...'
    : contentMd
  
  const shouldShowExpand = contentMd && contentMd.length > 300

  function getKindIcon() {
    switch (kind) {
      case 'link':
        return <ExternalLink className="h-3 w-3" />
      case 'media':
        return <ExternalLink className="h-3 w-3" />
      case 'crosspost':
        return <ExternalLink className="h-3 w-3" />
      default:
        return null
    }
  }

  function getKindColor() {
    switch (kind) {
      case 'link':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'media':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'crosspost':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <Card className={cn(
      'bg-slate-900/50 border-slate-800/60 transition-all duration-200 hover:bg-slate-900/70 hover:border-slate-700/60',
      className
    )}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex gap-3">
          {/* Vote buttons */}
          <div className="flex-shrink-0">
            <VoteButton
              targetKind="thread"
              targetId={id}
              score={score}
              userVote={userVote}
              size={compact ? 'sm' : 'md'}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                {/* Forum and post kind */}
                <div className="flex items-center gap-2 mb-1">
                  <Link 
                    href={`/forums/${forum.slug}`}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    r/{forum.slug}
                  </Link>
                  
                  {kind !== 'text' && (
                    <Badge variant="outline" className={cn('text-xs', getKindColor())}>
                      {getKindIcon()}
                      <span className="ml-1 capitalize">{kind}</span>
                    </Badge>
                  )}

                  {isPinned && (
                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}

                  {isLocked && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <Link href={threadUrl}>
                  <h3 className={cn(
                    'font-medium text-white hover:text-slate-200 transition-colors line-clamp-2',
                    compact ? 'text-sm' : 'text-base'
                  )}>
                    {title}
                  </h3>
                </Link>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                          borderColor: tag.color ? `${tag.color}50` : undefined,
                          color: tag.color || undefined
                        }}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnPost && onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isOwnPost && onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-400">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwnPost && onReport && (
                    <>
                      {isOwnPost && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={onReport}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="mb-3">
              {/* Text content */}
              {kind === 'text' && contentMd && (
                <div className={cn('text-slate-300 text-sm', compact && 'text-xs')}>
                  <div className="whitespace-pre-wrap">
                    {showFullContent ? contentMd : contentPreview}
                  </div>
                  {shouldShowExpand && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="h-auto p-0 text-xs text-slate-400 hover:text-white"
                    >
                      {showFullContent ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                </div>
              )}

              {/* Link content */}
              {(kind === 'link' || kind === 'media') && linkUrl && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {linkUrl}
                  </a>
                  {contentMd && (
                    <div className="mt-2 text-sm text-slate-300">
                      {contentMd}
                    </div>
                  )}
                </div>
              )}

              {/* Crosspost content */}
              {kind === 'crosspost' && contentRef && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    {contentRef.thumbnail_url && (
                      <Image
                        src={contentRef.thumbnail_url}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        {contentRef.title}
                      </div>
                      <div className="text-xs text-slate-400 capitalize">
                        {contentRef.kind} content
                      </div>
                    </div>
                  </div>
                  {contentMd && (
                    <div className="mt-2 text-sm text-slate-300">
                      {contentMd}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {/* Author */}
                <div className="flex items-center gap-1">
                  {author.avatar_url && (
                    <Image
                      src={author.avatar_url}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  <span>u/{author.username}</span>
                  {author.is_verified && (
                    <span className="text-blue-400">✓</span>
                  )}
                </div>

                <span>•</span>
                <span>{timeAgo}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                {/* Comments */}
                <Link 
                  href={threadUrl}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>{commentsCount}</span>
                </Link>

                {/* Views */}
                {viewsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{viewsCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
