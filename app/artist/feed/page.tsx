'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Music, 
  Image, 
  Video, 
  FileText,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Star,
  Award,
  Target,
  Lightbulb,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { CleanPostCreator } from '@/components/feed/clean-post-creator'
import { MediaDisplay } from '@/components/feed/media-display'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'
import { useAuth } from '@/contexts/auth-context'
import { useArtist } from '@/contexts/artist-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  content: string
  type: string
  visibility: string
  location?: string
  hashtags: string[]
  media_items?: any[]
  created_at: string
  user: {
    id: string
    username: string
    avatar_url?: string
  }
  likes_count: number
  comments_count: number
  shares_count: number
  is_liked: boolean
}

export default function ArtistFeedPage() {
  const { user } = useAuth()
  const { profile: artistProfile, displayName, avatarInitial } = useArtist()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('live')
  const supabase = createClientComponentClient<Database>()

  // Fetch posts from the main feed API
  const fetchPosts = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Use the main feed API which has comprehensive post handling
      const response = await fetch('/api/feed/posts?type=all&limit=50', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const result = await response.json()
      const feedPosts = result.data || []

      // Fetch liked posts for current user
      const postIds = feedPosts.map((post: any) => post.id)
      let likedPosts: string[] = []
      if (postIds.length > 0 && user?.id) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id)
        likedPosts = likesData?.map(like => like.post_id) || []
      }

      // Transform posts to match our Post interface
      const transformedPosts: Post[] = feedPosts.map((post: any) => {
        const userData = post.profiles || post.user || {
          id: post.user_id,
          username: post.account_username || 'Unknown',
          avatar_url: post.account_avatar_url
        }

        return {
          id: post.id,
          content: post.content,
          type: post.type || 'text',
          visibility: post.visibility || 'public',
          location: post.location,
          hashtags: post.hashtags || [],
          media_items: (post.media_urls || []).map((url: string, index: number) => ({
            id: `${post.id}-media-${index}`,
            type: 'image', // Default to image, could be enhanced to detect type from URL
            url: url,
            altText: `Media ${index + 1}`,
            title: `Media ${index + 1}`
          })),
          created_at: post.created_at,
          user: {
            id: userData.id,
            username: userData.username || userData.full_name || 'Unknown',
            avatar_url: userData.avatar_url
          },
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          is_liked: likedPosts.includes(post.id)
        }
      })

      console.log('Fetched posts from main feed API:', transformedPosts)
      setPosts(transformedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  const handlePostCreated = (newPost: any) => {
    // Transform the API response to match our Post interface
    const transformedPost: Post = {
      id: newPost.id,
      content: newPost.content,
      type: newPost.type || 'text',
      visibility: newPost.visibility || 'public',
      location: newPost.location,
      hashtags: newPost.hashtags || [],
      media_items: (newPost.media_urls || newPost.media_items || []).map((url: string, index: number) => ({
        id: `${newPost.id}-media-${index}`,
        type: 'image', // Default to image, could be enhanced to detect type from URL
        url: url,
        altText: `Media ${index + 1}`,
        title: `Media ${index + 1}`
      })),
      created_at: newPost.created_at,
      user: {
        id: newPost.user_id,
        username: newPost.account_username || newPost.profiles?.username || 'Unknown',
        avatar_url: newPost.account_avatar_url || newPost.profiles?.avatar_url
      },
      likes_count: newPost.likes_count || 0,
      comments_count: newPost.comments_count || 0,
      shares_count: newPost.shares_count || 0,
      is_liked: false
    }
    
    setPosts(prev => [transformedPost, ...prev])
    toast.success('Post created successfully!')
  }

  const handleLike = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert({
          post_id: postId,
          user_id: user?.id
        })

      if (error) throw error

      // Optimistically update the UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ))

      toast.success('Post liked!')
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }

  const handleComment = async (postId: string) => {
    // TODO: Implement comment functionality
    toast.info('Comment functionality coming soon!')
  }

  const handleShare = async (postId: string) => {
    // TODO: Implement share functionality
    toast.info('Share functionality coming soon!')
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Users className="h-4 w-4" />
      case 'followers': return <Users className="h-4 w-4" />
      case 'private': return <Users className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Artist Feed
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Share your music, connect with fans, and grow your audience
          </motion.p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
            <TabsTrigger 
              value="live" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4 mr-2" />
              Live Feed
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Live Feed Tab */}
          <TabsContent value="live" className="space-y-6">
            {/* Feed Header with Refresh */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Your Feed</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPosts}
                disabled={isLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {/* Post Creator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CleanPostCreator
                onPostCreated={handlePostCreated}
                placeholder="Share your latest track, behind-the-scenes moments, or connect with your fans..."
                maxMediaItems={10}
                defaultVisibility="public"
                showAdvancedOptions={true}
                user={{
                  id: user?.id || '',
                  username: displayName,
                  avatar_url: artistProfile?.avatar_url
                }}
              />
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : posts.length === 0 ? (
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                    <p className="text-gray-400 mb-6">
                      Be the first to share something amazing with your community!
                    </p>
                    <Button 
                      onClick={() => setActiveTab('live')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Create Your First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-200">
                                <AvatarImage src={post.user.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                                  {post.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white hover:text-purple-300 transition-colors cursor-pointer">
                                  {post.user.username}
                                  </span>
                                  {post.type !== 'text' && (
                                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                        {getPostTypeIcon(post.type)}
                                      <span className="ml-1 capitalize">{post.type}</span>
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    {getVisibilityIcon(post.visibility)}
                                    <span>{formatTimeAgo(post.created_at)}</span>
                                  </span>
                                  {post.location && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{post.location}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 pb-4">
                          {/* Post content */}
                          {post.content && (
                            <div className="text-white leading-relaxed text-base mb-4">
                              {post.content}
                            </div>
                          )}

                          {/* Media display - simplified for social media style */}
                          {post.media_items && post.media_items.length > 0 && (
                            <div className="mt-3">
                              {post.media_items.length === 1 ? (
                                // Single image/video - full width
                                <div className="relative rounded-xl overflow-hidden">
                                  {post.media_items[0].type === 'image' ? (
                                    <img
                                      src={post.media_items[0].url}
                                      alt="Post media"
                                      className="w-full h-auto max-h-96 object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <video
                                      src={post.media_items[0].url}
                                      controls
                                      className="w-full h-auto max-h-96 object-cover"
                                      poster={post.media_items[0].thumbnail_url}
                                    />
                                  )}
                                </div>
                              ) : post.media_items.length === 2 ? (
                                // Two images/videos - side by side
                                <div className="grid grid-cols-2 gap-2">
                                  {post.media_items.slice(0, 2).map((item, index) => (
                                    <div key={index} className="relative rounded-xl overflow-hidden">
                                      {item.type === 'image' ? (
                                        <img
                                          src={item.url}
                                          alt="Post media"
                                          className="w-full h-48 object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <video
                                          src={item.url}
                                          controls
                                          className="w-full h-48 object-cover"
                                          poster={item.thumbnail_url}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : post.media_items.length === 3 ? (
                                // Three images/videos - 2 on top, 1 on bottom
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="row-span-2">
                                    {post.media_items[0].type === 'image' ? (
                                      <img
                                        src={post.media_items[0].url}
                                        alt="Post media"
                                        className="w-full h-full object-cover rounded-xl"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <video
                                        src={post.media_items[0].url}
                                        controls
                                        className="w-full h-full object-cover rounded-xl"
                                        poster={post.media_items[0].thumbnail_url}
                                      />
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    {post.media_items.slice(1, 3).map((item, index) => (
                                      <div key={index} className="relative rounded-xl overflow-hidden">
                                        {item.type === 'image' ? (
                                          <img
                                            src={item.url}
                                            alt="Post media"
                                            className="w-full h-24 object-cover"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <video
                                            src={item.url}
                                            controls
                                            className="w-full h-24 object-cover"
                                            poster={item.thumbnail_url}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                // Four or more images/videos - 2x2 grid with overlay
                                <div className="grid grid-cols-2 gap-2">
                                  {post.media_items.slice(0, 4).map((item, index) => (
                                    <div key={index} className="relative rounded-xl overflow-hidden">
                                      {item.type === 'image' ? (
                                        <img
                                          src={item.url}
                                          alt="Post media"
                                          className="w-full h-48 object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <video
                                          src={item.url}
                                          controls
                                          className="w-full h-48 object-cover"
                                          poster={item.thumbnail_url}
                                        />
                                      )}
                                      {index === 3 && post.media_items.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                          <span className="text-white text-xl font-bold">
                                            +{post.media_items.length - 4}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {post.hashtags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200 cursor-pointer transition-all duration-200 border-purple-500/30 text-xs font-medium"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Post actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                            <div className="flex items-center gap-8">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(post.id)}
                                className={cn(
                                  "flex items-center gap-2 transition-all duration-200 hover:bg-slate-800/50 rounded-lg px-3 py-2",
                                  post.is_liked 
                                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                                    : "text-gray-400 hover:text-white"
                                )}
                              >
                                <Heart className={cn("h-5 w-5 transition-transform", post.is_liked && "fill-current scale-110")} />
                                <span className="font-medium">{post.likes_count}</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleComment(post.id)}
                                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 rounded-lg px-3 py-2"
                              >
                                <MessageCircle className="h-5 w-5" />
                                <span className="font-medium">{post.comments_count}</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(post.id)}
                                className="flex items-center gap-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 rounded-lg px-3 py-2"
                              >
                                <Share2 className="h-5 w-5" />
                                <span className="font-medium">{post.shares_count}</span>
                              </Button>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              {getVisibilityIcon(post.visibility)}
                              <span className="capitalize">{post.visibility}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Posts</p>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Likes</p>
                      <p className="text-2xl font-bold text-white">1,234</p>
                    </div>
                    <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Engagement Rate</p>
                      <p className="text-2xl font-bold text-white">8.5%</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="h-8 w-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New like on your latest post</p>
                      <p className="text-gray-400 text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New comment from @fan123</p>
                      <p className="text-gray-400 text-xs">15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">New follower: @musiclover</p>
                      <p className="text-gray-400 text-xs">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Top Performing Posts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Image className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm">Behind the scenes studio session</p>
                            <p className="text-gray-400 text-xs">Posted 2 days ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">156 likes</p>
                          <p className="text-green-400 text-xs">+23% engagement</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Music className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm">New track preview</p>
                            <p className="text-gray-400 text-xs">Posted 5 days ago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">89 likes</p>
                          <p className="text-green-400 text-xs">+15% engagement</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-700" />
                  
                  <div>
                    <h4 className="text-white font-medium mb-3">Audience Growth</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800/30 rounded-lg">
                        <p className="text-gray-400 text-sm">This Week</p>
                        <p className="text-2xl font-bold text-white">+12</p>
                        <p className="text-green-400 text-xs">+8% from last week</p>
                      </div>
                      <div className="p-4 bg-slate-800/30 rounded-lg">
                        <p className="text-gray-400 text-sm">This Month</p>
                        <p className="text-2xl font-bold text-white">+47</p>
                        <p className="text-green-400 text-xs">+12% from last month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 