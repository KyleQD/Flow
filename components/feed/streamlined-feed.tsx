'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CompactPostCreator } from './compact-post-creator'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Heart, MessageCircle, Share2, Clock, MapPin, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

interface Post {
  id: string
  user_id: string
  content: string
  type: string
  visibility: string
  location: string | null
  hashtags: string[] | null
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  profiles?: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
    is_verified: boolean
  } | null
  // Flag for demo posts
  isDemoPost?: boolean
}

export function StreamlinedFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [databaseConnected, setDatabaseConnected] = useState(false)
  
  const supabase = createClientComponentClient<Database>()

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading posts:', error)
        setDatabaseConnected(false)
        
        // Load demo posts if database isn't available
        if (posts.length === 0) {
          const demoPost: Post = {
            id: 'demo-1',
            user_id: 'demo-user',
            content: '🎵 Welcome to your feed! This is a demo post. Try creating your own post above! #music #tourify',
            type: 'text',
            visibility: 'public',
            location: 'Demo Location',
            hashtags: ['music', 'tourify'],
            likes_count: 5,
            comments_count: 2,
            shares_count: 1,
            created_at: new Date().toISOString(),
            profiles: {
              username: 'demo_user',
              full_name: 'Demo User',
              avatar_url: null,
              is_verified: false
            },
            isDemoPost: true
          }
          setPosts([demoPost])
        }
      } else {
        console.log('Database connected, loaded posts:', data)
        setDatabaseConnected(true)
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error in loadPosts:', error)
      setDatabaseConnected(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handlePostCreated = (newPost: Post) => {
    console.log('New post created:', newPost)
    
    // Add the new post to the beginning of the feed
    setPosts(prev => [newPost, ...prev])
    
    // Remove demo posts if we're now getting real posts
    if (!newPost.isDemoPost) {
      setPosts(prev => prev.filter(post => !post.isDemoPost))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPosts()
  }

  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: post.likes_count + 1 }
        : post
    ))

    // Try to update in database if connected
    if (databaseConnected && user) {
      try {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        if (error) {
          console.error('Error liking post:', error)
          // Revert on error
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { ...post, likes_count: post.likes_count - 1 }
              : post
          ))
        }
      } catch (error) {
        console.error('Error liking post:', error)
      }
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }
    getUser()
    loadPosts()
  }, [])

  // Subscribe to real-time updates if database is connected
  useEffect(() => {
    if (!databaseConnected) return

    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('Real-time post received:', payload.new)
        setPosts(prev => {
          const exists = prev.find(post => post.id === payload.new.id)
          if (!exists && payload.new.visibility === 'public') {
            return [payload.new as Post, ...prev]
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [databaseConnected])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading feed...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Compact Post Creator */}
      <CompactPostCreator onPostCreated={handlePostCreated} />

      {/* Database Status */}
      {!databaseConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
          <div className="text-amber-400 text-sm">
            <strong>Demo Mode:</strong> Database tables not found. Posts will be simulated until database is set up.
          </div>
        </div>
      )}

      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Posts */}
      <AnimatePresence mode="popLayout">
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
              <div className="text-slate-400 space-y-2">
                <p className="text-lg font-medium">No posts yet</p>
                <p className="text-sm">Share your first post above to get started!</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.profiles?.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {post.profiles?.full_name?.[0] || post.profiles?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
                          </h4>
                          {post.profiles?.username && (
                            <span className="text-slate-400 text-sm">@{post.profiles.username}</span>
                          )}
                          {post.isDemoPost && (
                            <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                              Demo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
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
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* Content */}
                    <p className="text-slate-200 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.hashtags.map((hashtag) => (
                          <Badge
                            key={hashtag}
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer text-xs"
                          >
                            #{hashtag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Engagement Stats & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        {post.likes_count > 0 && (
                          <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
                        )}
                        {post.comments_count > 0 && (
                          <span>{post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}</span>
                        )}
                        {post.shares_count > 0 && (
                          <span>{post.shares_count} {post.shares_count === 1 ? 'share' : 'shares'}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-7 px-2"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 h-7 px-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-green-400 hover:bg-green-500/10 h-7 px-2"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 