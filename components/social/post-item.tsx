"use client"

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { HeartIcon, MessageCircleIcon, ShareIcon, MoreHorizontalIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { PostItemProps } from "./types"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function PostItem({
  post,
  user,
  onLike,
  onUnlike,
  onComment,
  onShare,
  isLiked,
  className
}: PostItemProps) {
  const handleLikeClick = () => {
    if (isLiked) onUnlike(post.id)
    else onLike(post.id)
  }

  const handleCommentClick = () => {
    onComment(post.id, "")
  }

  const handleShareClick = () => {
    onShare(post.id)
  }

  const renderMedia = () => {
    if (!post.media?.length) return null

    return (
      <div className="mt-4">
        {post.media.length === 1 ? (
          <AspectRatio ratio={post.media[0].aspectRatio || 16 / 9}>
            {post.media[0].type === "image" ? (
              <img
                src={post.media[0].url}
                alt={post.media[0].alt || "Post media"}
                className="rounded-lg object-cover w-full h-full"
              />
            ) : (
              <video
                src={post.media[0].url}
                controls
                className="rounded-lg object-cover w-full h-full"
              />
            )}
          </AspectRatio>
        ) : (
          <Carousel>
            {post.media.map((media, index) => (
              <AspectRatio key={index} ratio={media.aspectRatio || 16 / 9}>
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt={media.alt || `Media ${index + 1}`}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="rounded-lg object-cover w-full h-full"
                  />
                )}
              </AspectRatio>
            ))}
          </Carousel>
        )}
      </div>
    )
  }

  const renderLinkPreview = () => {
    if (!post.linkPreview) return null

    return (
      <a
        href={post.linkPreview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block"
      >
        <Card className="overflow-hidden hover:bg-accent transition-colors">
          <div className="aspect-video relative">
            <img
              src={post.linkPreview.image}
              alt={post.linkPreview.title}
              className="object-cover w-full h-full"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold line-clamp-1">{post.linkPreview.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.linkPreview.description}
            </p>
          </CardContent>
        </Card>
      </a>
    )
  }

  const renderEventDetails = () => {
    if (!post.eventDetails) return null

    return (
      <div className="mt-4">
        <Card className="bg-accent">
          <CardContent className="p-4">
            <Badge variant="secondary" className="mb-2">Event</Badge>
            <h3 className="font-semibold">{post.eventDetails.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(post.eventDetails.date).toLocaleDateString()} at {post.eventDetails.location}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPoll = () => {
    if (!post.poll) return null

    const totalVotes = post.poll.options.reduce((sum, option) => sum + option.votes, 0)

    return (
      <div className="mt-4">
        <Card className="bg-accent">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{post.poll.question}</h3>
            <div className="space-y-2">
              {post.poll.options.map(option => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
                return (
                  <div key={option.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{option.text}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {totalVotes} votes · Ends {formatDistanceToNow(new Date(post.poll.endsAt))}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card className={cn("bg-gray-900 text-white border-gray-800", className)}>
      <CardHeader className="flex-row items-center space-y-0 gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} alt={user.fullName} />
          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{user.fullName}</span>
          <span className="text-sm text-muted-foreground">
            @{user.username} · {formatDistanceToNow(new Date(post.timestamp))} ago
            {post.location && ` · ${post.location}`}
          </span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto">
              <MoreHorizontalIcon className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            {/* Add post options here */}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
        {renderMedia()}
        {renderLinkPreview()}
        {renderEventDetails()}
        {renderPoll()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2", isLiked && "text-red-500")}
          onClick={handleLikeClick}
        >
          <HeartIcon className="h-4 w-4" />
          {post.likes.length}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleCommentClick}
        >
          <MessageCircleIcon className="h-4 w-4" />
          {post.comments}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleShareClick}
        >
          <ShareIcon className="h-4 w-4" />
          {post.shares}
        </Button>
      </CardFooter>
    </Card>
  )
} 