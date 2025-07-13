"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  UserPlus,
  Share2,
  MapPin,
  Calendar,
  Music,
  Building,
  Users,
  Heart,
  Play,
  Instagram,
  Twitter,
  Globe,
  Star,
  Headphones,
  Ticket,
  UserCheck,
  Check,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

interface PublicProfileProps {
  profile: {
    id: string
    account_type: 'general' | 'artist' | 'venue'
    profile_data: any
    username: string
    avatar_url?: string
    cover_image?: string
    verified?: boolean
    stats: {
      followers: number
      following: number
      posts: number
      likes: number
      views?: number
      streams?: number
      events?: number
    }
    social_links?: {
      instagram?: string
      twitter?: string
      website?: string
      spotify?: string
    }
    location?: string
    bio?: string
    created_at: string
  }
  isOwnProfile?: boolean
  onFollow?: (userId: string) => void
  onMessage?: (userId: string) => void
  onShare?: (profile: any) => void
}

export function PublicProfileView({ profile, isOwnProfile = false, onFollow, onMessage, onShare }: PublicProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showFullBio, setShowFullBio] = useState(false)
  const [copied, setCopied] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [music, setMusic] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [showComments, setShowComments] = useState<string | null>(null)

  useEffect(() => {
    fetchProfileData()
    checkFollowStatus()
  }, [profile.id])

  const checkFollowStatus = async () => {
    try {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !isOwnProfile) {
        try {
          const { data, error } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
            .single()
          
          if (error && error.code !== 'PGRST116') {
            console.log('Follows table may not exist:', error)
            setIsFollowing(false)
          } else {
            setIsFollowing(!!data)
          }
        } catch (error) {
          console.log('Follow functionality not available:', error)
          setIsFollowing(false)
        }
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      // Import supabase client to fetch real posts from the database
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()
      
      console.log('🔍 Fetching real posts for profile:', profile.id)
      
      // First check what posts table structure exists
      let postsQuery
      
      // Try to fetch posts with a simple query first to see the table structure
      const { data: samplePost, error: sampleError } = await supabase
        .from('posts')
        .select('*')
        .limit(1)
        .single()

      console.log('Sample post structure:', samplePost)
      console.log('Sample post error:', sampleError)

      // Fetch posts with basic fields that should exist in any schema
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          media_urls,
          images,
          video_url,
          type,
          post_type,
          visibility,
          likes_count,
          comments_count,
          shares_count,
          engagement_stats,
          created_at,
          updated_at,
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            is_verified,
            metadata
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching posts:', error)
        console.error('Full error object:', JSON.stringify(error, null, 2))
        
        // Try a simpler query as fallback
        const { data: simplePosts, error: simpleError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50)
          
        if (simpleError) {
          console.error('Simple query also failed:', simpleError)
          setPosts([])
        } else {
          console.log(`✅ Loaded ${simplePosts?.length || 0} posts with simple query`)
          // Transform simple posts
          const transformedPosts = simplePosts?.map((post: any) => ({
            id: post.id,
            content: post.content,
            type: post.type || post.post_type || 'text',
            visibility: post.visibility || 'public',
            media_url: (post.media_urls && post.media_urls.length > 0) ? post.media_urls[0] : 
                      (post.images && post.images.length > 0) ? post.images[0] : 
                      post.video_url || null,
            post_type: post.type || post.post_type || 'text',
            likes_count: post.likes_count || (post.engagement_stats?.likes) || 0,
            comments_count: post.comments_count || (post.engagement_stats?.comments) || 0,
            shares_count: post.shares_count || (post.engagement_stats?.shares) || 0,
            created_at: post.created_at,
            user_id: post.user_id,
            profiles: null // We'll add profile data separately
          })) || []
          
          setPosts(transformedPosts)
        }
      } else {
        console.log(`✅ Loaded ${posts?.length || 0} real posts from database`)
        console.log('Posts data structure:', posts?.[0])
        
        // Transform posts to match expected format
        const transformedPosts = posts?.map((post: any) => ({
          id: post.id,
          content: post.content,
          type: post.type || post.post_type || 'text',
          visibility: post.visibility || 'public',
          media_url: (post.media_urls && post.media_urls.length > 0) ? post.media_urls[0] : 
                    (post.images && post.images.length > 0) ? post.images[0] : 
                    post.video_url || null,
          post_type: post.type || post.post_type || 'text',
          likes_count: post.likes_count || (post.engagement_stats?.likes) || 0,
          comments_count: post.comments_count || (post.engagement_stats?.comments) || 0,
          shares_count: post.shares_count || (post.engagement_stats?.shares) || 0,
          created_at: post.created_at,
          user_id: post.user_id,
          profiles: post.profiles
        })) || []
        
        setPosts(transformedPosts)
        
        // Check which posts are liked by the current user
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser && transformedPosts.length > 0) {
          const likedPostIds = new Set<string>()
          
          try {
            // Try to get liked posts for current user
            const { data: likes, error: likesError } = await supabase
              .from('post_likes')
              .select('post_id')
              .eq('user_id', currentUser.id)
              .in('post_id', transformedPosts.map(p => p.id))
            
            if (likesError) {
              console.log('Post likes table not available:', likesError)
              // Continue without likes data
            } else if (likes) {
              likes.forEach((like: any) => {
                likedPostIds.add(like.post_id)
              })
            }
          } catch (error) {
            console.log('Error fetching likes, continuing without like data:', error)
          }
          
          setLikedPosts(likedPostIds)
        }
      }

      // Note: Events and music features can be implemented later using real database tables
      setEvents([])
      setMusic([])
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to follow profiles')
        return
      }
      
      try {
        if (isFollowing) {
          // Unfollow
          const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
          
          if (error) {
            console.error('Error unfollowing:', error)
            toast.error('Failed to unfollow')
          } else {
            setIsFollowing(false)
            toast.success('Unfollowed successfully')
          }
        } else {
          // Follow
          const { error } = await supabase
            .from('follows')
            .insert({
              follower_id: user.id,
              following_id: profile.id
            })
          
          if (error) {
            console.error('Error following:', error)
            toast.error('Failed to follow')
          } else {
            setIsFollowing(true)
            toast.success('Following successfully')
          }
        }
      } catch (dbError) {
        console.log('Follow functionality not available - follows table may not exist:', dbError)
        toast.error('Follow functionality not available yet')
      }
      
      if (onFollow) onFollow(profile.id)
    } catch (error) {
      console.error('Error following/unfollowing profile:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.profile_data?.name || profile.username}'s Profile`,
          text: profile.bio || "Check out this profile on Tourify!",
          url: window.location.href
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    if (onShare) onShare(profile)
  }

  const handleLikePost = async (postId: string) => {
    try {
      const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createClientComponentClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to like posts')
        return
      }

      const isLiked = likedPosts.has(postId)
      
      // Optimistic update
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.delete(postId)
        } else {
          newSet.add(postId)
        }
        return newSet
      })
      
      // Update post likes count optimistically
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes_count: isLiked 
                ? Math.max(0, post.likes_count - 1)
                : post.likes_count + 1 
            }
          : post
      ))

      try {
        if (isLiked) {
          // Unlike the post
          const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)

          if (error) {
            // Revert optimistic update on error
            setLikedPosts(prev => new Set([...prev, postId]))
            setPosts(prev => prev.map(post => 
              post.id === postId 
                ? { ...post, likes_count: post.likes_count + 1 }
                : post
            ))
            console.error('Error unliking post:', error)
            toast.error('Failed to unlike post')
          }
        } else {
          // Like the post
          const { error } = await supabase
            .from('post_likes')
            .insert({
              post_id: postId,
              user_id: user.id
            })

          if (error) {
            // Revert optimistic update on error
            setLikedPosts(prev => {
              const newSet = new Set(prev)
              newSet.delete(postId)
              return newSet
            })
            setPosts(prev => prev.map(post => 
              post.id === postId 
                ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
                : post
            ))
            console.error('Error liking post:', error)
            toast.error('Failed to like post')
          }
        }
      } catch (dbError) {
        console.log('Like functionality not available - post_likes table may not exist:', dbError)
        toast.error('Like functionality not available yet')
        
        // Revert optimistic update
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          if (isLiked) {
            newSet.add(postId)
          } else {
            newSet.delete(postId)
          }
          return newSet
        })
        
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: isLiked 
                  ? post.likes_count + 1
                  : Math.max(0, post.likes_count - 1)
              }
            : post
        ))
      }
      
    } catch (error) {
      console.error('Error handling like action:', error)
      toast.error('Failed to update like status')
    }
  }

  const handleCommentPost = (postId: string) => {
    setShowComments(showComments === postId ? null : postId)
  }

  const handleSharePost = async (post: any) => {
    try {
      // Use native share API if available
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${profile.profile_data?.name || profile.username}`,
          text: post.content,
          url: window.location.href
        })
        toast.success('Post shared successfully!')
      } else {
        // Fallback to copying link to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing post:', error)
      toast.error('Failed to share post')
    }
  }

  const getDisplayName = () => {
    return profile.profile_data?.name || profile.profile_data?.artist_name || profile.profile_data?.venue_name || profile.username
  }

  const getProfileIcon = () => {
    switch (profile.account_type) {
      case 'artist': return <Music className="h-4 w-4" />
      case 'venue': return <Building className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getProfileColor = () => {
    switch (profile.account_type) {
      case 'artist': return 'from-purple-500 to-pink-500'
      case 'venue': return 'from-green-500 to-emerald-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Cover Image */}
      <div className="relative h-96 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        {profile.cover_image && (
          <img 
            src={profile.cover_image} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Profile Header */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-white/30 shadow-2xl ring-4 ring-white/10">
                  <AvatarImage src={profile.avatar_url} alt={profile.username} />
                  <AvatarFallback className={`bg-gradient-to-br ${getProfileColor()} text-white text-4xl font-bold`}>
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Account Type Badge */}
                <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full p-3 border-2 border-white/30 shadow-lg">
                  <div className={`w-8 h-8 bg-gradient-to-br ${getProfileColor()} rounded-full flex items-center justify-center`}>
                    {getProfileIcon()}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                    {profile.profile_data?.name || profile.profile_data?.artist_name || profile.profile_data?.venue_name || profile.username}
                  </h1>
                  {profile.verified && (
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-white/90 mb-6">
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <span className="capitalize font-medium">{profile.account_type}</span>
                    {profile.account_type === 'artist' && profile.profile_data?.genre && (
                      <>
                        <span className="text-white/60">•</span>
                        <span className="text-white/80">{profile.profile_data.genre}</span>
                      </>
                    )}
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8">
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {profile.stats.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-white/70 font-medium">Followers</div>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {profile.stats.following.toLocaleString()}
                    </div>
                    <div className="text-sm text-white/70 font-medium">Following</div>
                  </div>
                  <div className="text-center group cursor-pointer">
                    <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {profile.stats.posts.toLocaleString()}
                    </div>
                    <div className="text-sm text-white/70 font-medium">Posts</div>
                  </div>
                  {profile.stats.streams && (
                    <div className="text-center group cursor-pointer">
                      <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {profile.stats.streams.toLocaleString()}
                      </div>
                      <div className="text-sm text-white/70 font-medium">Streams</div>
                    </div>
                  )}
                  {profile.stats.events && (
                    <div className="text-center group cursor-pointer">
                      <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {profile.stats.events.toLocaleString()}
                      </div>
                      <div className="text-sm text-white/70 font-medium">Events</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {!isOwnProfile && (
                  <>
                    <Button
                      onClick={handleFollow}
                      className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                        isFollowing
                          ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/25'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-5 w-5 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => onMessage?.(profile.id)}
                      variant="outline"
                      className="px-6 py-4 rounded-2xl border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-lg"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Message
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-2xl border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-lg"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Bio & Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Bio */}
            {profile.bio && (
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 pb-4">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-400" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-gray-300 leading-relaxed">
                    {showFullBio || profile.bio.length <= 200 ? (
                      <p className="text-base">{profile.bio}</p>
                    ) : (
                      <p className="text-base">{profile.bio.substring(0, 200)}...</p>
                    )}
                    {profile.bio.length > 200 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-purple-400 hover:text-purple-300 mt-3 font-medium transition-colors"
                      >
                        {showFullBio ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-500/20 to-blue-500/20 pb-4">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-400" />
                    Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {profile.social_links.website && (
                      <a
                        href={profile.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      >
                        <Globe className="h-5 w-5 text-purple-400" />
                        <span className="text-white font-medium">Website</span>
                      </a>
                    )}
                    {profile.social_links.instagram && (
                      <a
                        href={`https://instagram.com/${profile.social_links.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      >
                        <Instagram className="h-5 w-5 text-pink-400" />
                        <span className="text-white font-medium">Instagram</span>
                      </a>
                    )}
                    {profile.social_links.twitter && (
                      <a
                        href={`https://twitter.com/${profile.social_links.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      >
                        <Twitter className="h-5 w-5 text-blue-400" />
                        <span className="text-white font-medium">Twitter</span>
                      </a>
                    )}
                    {profile.social_links.spotify && (
                      <a
                        href={profile.social_links.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                      >
                        <Headphones className="h-5 w-5 text-green-400" />
                        <span className="text-white font-medium">Spotify</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-500/20 to-red-500/20 pb-4">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                  Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-400" />
                      <span className="text-gray-300 font-medium">Total Likes</span>
                    </div>
                    <span className="text-white font-bold text-lg">{profile.stats.likes.toLocaleString()}</span>
                  </div>
                  {profile.stats.views && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-gray-300 font-medium">Profile Views</span>
                      </div>
                      <span className="text-white font-bold text-lg">{profile.stats.views.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300 font-medium">Member Since</span>
                    </div>
                    <span className="text-white font-bold text-lg">
                      {new Date(profile.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10">
                  Posts
                </TabsTrigger>
                {profile.account_type === 'artist' && (
                  <TabsTrigger value="music" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10">
                    Music
                  </TabsTrigger>
                )}
                {(profile.account_type === 'venue' || profile.account_type === 'artist') && (
                  <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10">
                    Events
                  </TabsTrigger>
                )}
                <TabsTrigger value="gallery" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/10">
                  Gallery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-8">
                <div className="space-y-6">
                  {/* Recent Activity */}
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 pb-4">
                      <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                            <Music className="h-10 w-10 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-lg mb-3">Just finished recording my latest track! 🎵</p>
                            <div className="flex items-center gap-6 text-gray-400">
                              <span className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-400" />
                                <span className="font-medium">142</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-blue-400" />
                                <span className="font-medium">23</span>
                              </span>
                              <span className="text-sm">2 hours ago</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                            <Users className="h-10 w-10 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-lg mb-3">New followers joined the community! 👥</p>
                            <div className="flex items-center gap-6 text-gray-400">
                              <span className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-400" />
                                <span className="font-medium">89</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-blue-400" />
                                <span className="font-medium">12</span>
                              </span>
                              <span className="text-sm">5 hours ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Highlights */}
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 pb-4">
                      <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        Highlights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <Heart className="h-4 w-4 text-purple-400" />
                            </div>
                            <span className="text-white font-medium">Most Liked Post</span>
                          </div>
                          <p className="text-gray-300 text-sm">"{posts.length > 0 ? posts[0]?.content?.substring(0, 50) + '...' : 'No posts yet'}"</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-white font-medium">Growing Community</span>
                          </div>
                          <p className="text-gray-300 text-sm">+{Math.floor(Math.random() * 50) + 10} new followers this week</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="posts" className="mt-8">
                <div className="space-y-6">
                  {loading ? (
                    <div className="space-y-6">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full ring-2 ring-white/20"></div>
                              <div className="flex-1">
                                <div className="h-5 bg-gradient-to-r from-white/20 to-white/10 rounded-lg w-1/3 mb-3"></div>
                                <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded-lg w-1/4"></div>
                              </div>
                            </div>
                            <div className="space-y-3 mb-6">
                              <div className="h-5 bg-gradient-to-r from-white/20 to-white/10 rounded-lg"></div>
                              <div className="h-5 bg-gradient-to-r from-white/15 to-white/5 rounded-lg w-4/5"></div>
                              <div className="h-5 bg-gradient-to-r from-white/10 to-white/5 rounded-lg w-3/5"></div>
                            </div>
                            <div className="h-px bg-white/10 mb-4"></div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gradient-to-br from-red-400/20 to-red-400/10 rounded-full"></div>
                                <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded w-8"></div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gradient-to-br from-blue-400/20 to-blue-400/10 rounded-full"></div>
                                <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded w-8"></div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-full"></div>
                                <div className="h-4 bg-gradient-to-r from-white/15 to-white/5 rounded w-12"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-6">
                      {posts.map((post) => (
                        <Card key={post.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <Avatar className="h-12 w-12 ring-2 ring-white/20">
                                <AvatarImage src={profile.avatar_url} alt={profile.username} />
                                <AvatarFallback className={`bg-gradient-to-br ${getProfileColor()} text-white font-bold`}>
                                  {profile.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-white">
                                    {profile.profile_data?.name || profile.profile_data?.artist_name || profile.profile_data?.venue_name || profile.username}
                                  </h4>
                                  {profile.verified && (
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    {profile.account_type}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  {new Date(post.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mb-6">
                              <p className="text-white leading-relaxed text-lg">{post.content}</p>
                              {post.media_url && (
                                <div className="mt-4">
                                  <img 
                                    src={post.media_url} 
                                    alt="Post media" 
                                    className="w-full max-h-96 object-cover rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-6 text-gray-400">
                                <button 
                                  className={`flex items-center gap-2 hover:text-red-400 transition-all duration-300 hover:scale-110 ${
                                    likedPosts.has(post.id) ? 'text-red-500' : ''
                                  }`}
                                  onClick={() => handleLikePost(post.id)}
                                >
                                  <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                  <span className="font-medium">{post.likes_count?.toLocaleString() || '0'}</span>
                                </button>
                                <button 
                                  className="flex items-center gap-2 hover:text-blue-400 transition-all duration-300 hover:scale-110"
                                  onClick={() => handleCommentPost(post.id)}
                                >
                                  <MessageCircle className="h-5 w-5" />
                                  <span className="font-medium">{post.comments_count?.toLocaleString() || '0'}</span>
                                </button>
                                <button 
                                  className="flex items-center gap-2 hover:text-green-400 transition-all duration-300 hover:scale-110"
                                  onClick={() => handleSharePost(post)}
                                >
                                  <Share2 className="h-5 w-5" />
                                  <span className="font-medium">Share</span>
                                </button>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                {post.post_type && (
                                  <span className="px-2 py-1 bg-white/5 rounded-full">
                                    {post.post_type}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Comments Section */}
                            {showComments === post.id && (
                              <div className="mt-6 pt-4 border-t border-white/10">
                                <div className="space-y-4">
                                  <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                                        You
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            // In a real app, you'd save the comment
                                            e.currentTarget.value = ''
                                            setPosts(prev => prev.map(p => 
                                              p.id === post.id 
                                                ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                                                : p
                                            ))
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Sample Comments */}
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                                          SC
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-white font-medium text-sm">@musiclover_sarah</span>
                                          <span className="text-gray-500 text-xs">2h ago</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Amazing post! 🔥</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
                      <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                          <MessageCircle className="h-10 w-10 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-3">No Posts Yet</h3>
                        <p className="text-gray-400 text-lg">
                          This profile hasn't shared any posts yet.
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Check back later for updates!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {profile.account_type === 'artist' && (
                <TabsContent value="music" className="mt-6">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Card key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl animate-pulse">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-xl"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                                  <div className="h-3 bg-white/20 rounded w-2/3"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : music.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {music.map((release) => (
                          <Card key={release.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-4 mb-4">
                                {release.artwork_url && (
                                  <img 
                                    src={release.artwork_url} 
                                    alt={release.title}
                                    className="w-16 h-16 object-cover rounded-xl"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-bold text-white text-lg">{release.title}</h4>
                                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <span className="capitalize">{release.release_type}</span>
                                    {release.tracks && (
                                      <>
                                        <span>•</span>
                                        <span>{release.tracks} tracks</span>
                                      </>
                                    )}
                                    {release.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{release.duration}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    Released {new Date(release.release_date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-purple-400">
                                  <Play className="h-4 w-4" />
                                  <span className="font-semibold">{release.streams?.toLocaleString()} streams</span>
                                </div>
                                <div className="flex gap-2">
                                  {release.spotify_url && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-white/30 text-white hover:bg-white/10"
                                      onClick={() => window.open(release.spotify_url, '_blank')}
                                    >
                                      <Headphones className="h-4 w-4 mr-1" />
                                      Spotify
                                    </Button>
                                  )}
                                  {release.soundcloud_url && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="border-white/30 text-white hover:bg-white/10"
                                      onClick={() => window.open(release.soundcloud_url, '_blank')}
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      SoundCloud
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
                        <CardContent className="p-12 text-center">
                          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Music Released</h3>
                          <p className="text-gray-400">
                            No music releases available yet. Stay tuned for new tracks!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              )}

              {(profile.account_type === 'venue' || profile.account_type === 'artist') && (
                <TabsContent value="events" className="mt-6">
                  <div className="space-y-4">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <Card key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl animate-pulse">
                            <CardContent className="p-6">
                              <div className="h-32 bg-white/20 rounded-2xl mb-4"></div>
                              <div className="h-4 bg-white/20 rounded mb-2"></div>
                              <div className="h-3 bg-white/20 rounded w-2/3"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : events.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((event) => (
                          <Card key={event.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl hover:bg-white/15 transition-colors">
                            <CardContent className="p-6">
                              {event.image_url && (
                                <div className="mb-4">
                                  <img 
                                    src={event.image_url} 
                                    alt={event.title}
                                    className="w-full h-32 object-cover rounded-2xl"
                                  />
                                </div>
                              )}
                              
                              <div className="mb-4">
                                <h4 className="font-bold text-white text-lg mb-2">{event.title}</h4>
                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {new Date(event.event_date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                      {event.event_time && ` at ${event.event_time}`}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.venue_name}, {event.location}</span>
                                  </div>
                                  
                                  {event.genre && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                      <Music className="h-4 w-4" />
                                      <span>{event.genre}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-purple-400 font-semibold">
                                  {event.ticket_price}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => window.open(event.ticket_link, '_blank')}
                                  >
                                    <Ticket className="h-4 w-4 mr-1" />
                                    Tickets
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
                        <CardContent className="p-12 text-center">
                          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">No Events Scheduled</h3>
                          <p className="text-gray-400">
                            No upcoming events at the moment. Check back later!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="gallery" className="mt-6">
                <div className="text-center py-12 text-gray-400">
                  <p>Gallery will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 