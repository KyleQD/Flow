"use client"

import { useState, useEffect } from "react"
import { Plus, X, Upload, Trash2, Link as LinkIcon, Video, Image, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import { MultiSelect } from "@/components/ui/multi-select"
import React from "react"
import { Cache, CACHE_KEYS } from "@/lib/cache"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useInView } from "react-intersection-observer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useCallback, useRef, useMemo } from "react"
import { useMeasure } from "react-use"
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor"

interface PortfolioItem {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  client_name: string
  client_testimonial: string
  video_url: string | null
  external_links: {
    github?: string
    behance?: string
    dribbble?: string
    website?: string
  }
  media: {
    id: string
    type: string
    url: string
    order_index: number
  }[]
}

const CATEGORIES = [
  "Event Production",
  "Stage Management",
  "Lighting Design",
  "Sound Engineering",
  "Video Production",
  "Photography",
  "Graphic Design",
  "Marketing",
  "Logistics",
  "Security"
]

const TAGS = [
  "Live Events",
  "Corporate",
  "Music",
  "Theater",
  "Sports",
  "Exhibitions",
  "Conferences",
  "Festivals",
  "Private Events",
  "Virtual Events"
]

// Add image optimization settings
const IMAGE_OPTIMIZATION_SETTINGS = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: "webp" as const
}

// Add virtual scrolling settings
const VIRTUAL_SCROLL_SETTINGS = {
  itemSize: 400, // Approximate height of each portfolio item
  overscan: 5, // Number of items to render outside the viewport
}

// Add image preloading
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

// Add caching for portfolio items
const portfolioCache = new Map<string, PortfolioItem>()

// Add performance monitoring settings
const PERFORMANCE_THRESHOLDS = {
  renderTime: 16, // ms (60fps)
  loadTime: 1000, // ms
  memoryUsage: 50, // MB
}

// Add progressive loading settings
const PROGRESSIVE_LOADING = {
  initialBatch: 12,
  batchSize: 6,
  delay: 100, // ms
}

// Add error retry settings
const ERROR_RETRY = {
  maxAttempts: 3,
  delay: 1000, // ms
}

// Enhance image optimization
const optimizeImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > IMAGE_OPTIMIZATION_SETTINGS.maxWidth) {
          height = (height * IMAGE_OPTIMIZATION_SETTINGS.maxWidth) / width
          width = IMAGE_OPTIMIZATION_SETTINGS.maxWidth
        }
        
        if (height > IMAGE_OPTIMIZATION_SETTINGS.maxHeight) {
          width = (width * IMAGE_OPTIMIZATION_SETTINGS.maxHeight) / height
          height = IMAGE_OPTIMIZATION_SETTINGS.maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = file.name.replace(/\.[^/.]+$/, "")
              resolve(
                new File([blob], `${fileName}.${IMAGE_OPTIMIZATION_SETTINGS.format}`, {
                  type: `image/${IMAGE_OPTIMIZATION_SETTINGS.format}`
                })
              )
            } else {
              resolve(file)
            }
          },
          `image/${IMAGE_OPTIMIZATION_SETTINGS.format}`,
          IMAGE_OPTIMIZATION_SETTINGS.quality
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Enhance PortfolioItem with progressive loading
const PortfolioItem = React.memo(({ item, index }: { item: PortfolioItem; index: number }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isPreloaded, setIsPreloaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px"
  })

  // Add progressive loading delay based on index
  const loadDelay = useMemo(() => {
    return Math.min(index * PROGRESSIVE_LOADING.delay, 1000)
  }, [index])

  useEffect(() => {
    if (inView && item.media.length > 0 && !isPreloaded) {
      const timer = setTimeout(() => {
        preloadImage(item.media[0].url)
          .then(() => setIsPreloaded(true))
          .catch(() => {
            if (retryCount < ERROR_RETRY.maxAttempts) {
              setRetryCount(prev => prev + 1)
              setIsPreloaded(false)
            } else {
              setError(true)
            }
          })
      }, loadDelay)

      return () => clearTimeout(timer)
    }
  }, [inView, item.media, isPreloaded, loadDelay, retryCount])

  return (
    <Card key={item.id} className="relative" ref={ref}>
      <CardContent className="p-4">
        {item.media.length > 0 && (
          <div className="relative aspect-video mb-4">
            {isLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
            {inView && (
              item.media[0].type === "image" ? (
                <img
                  src={item.media[0].url}
                  alt={item.title}
                  className="rounded-lg object-cover w-full h-full"
                  loading="lazy"
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false)
                    setError(true)
                  }}
                />
              ) : (
                <video
                  src={item.media[0].url}
                  className="rounded-lg object-cover w-full h-full"
                  controls
                  onLoadedData={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false)
                    setError(true)
                  }}
                />
              )
            )}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          {item.client_name && (
            <div className="mt-2">
              <p className="text-sm font-medium">Client: {item.client_name}</p>
              {item.client_testimonial && (
                <p className="text-sm text-muted-foreground mt-1">
                  "{item.client_testimonial}"
                </p>
              )}
            </div>
          )}
          {item.external_links && (
            <div className="flex gap-2 mt-2">
              {item.external_links.github && (
                <a
                  href={item.external_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  GitHub
                </a>
              )}
              {item.external_links.behance && (
                <a
                  href={item.external_links.behance}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  Behance
                </a>
              )}
              {item.external_links.dribbble && (
                <a
                  href={item.external_links.dribbble}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  Dribbble
                </a>
              )}
              {item.external_links.website && (
                <a
                  href={item.external_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-4 w-4 inline mr-1" />
                  Website
                </a>
              )}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => deletePortfolioItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
})

export default function EnhancedPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    title: "",
    description: "",
    category: "",
    tags: [],
    client_name: "",
    client_testimonial: "",
    video_url: "",
    external_links: {},
    media: []
  })
  const [uploading, setUploading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<number>(PROGRESSIVE_LOADING.initialBatch)
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const parentRef = useRef<HTMLDivElement>(null)
  const [isOnline] = useOnlineStatus()
  const [offlineChanges, setOfflineChanges] = useState<{
    items: PortfolioItem[]
    media: { itemId: string; file: File }[]
  }>({
    items: [],
    media: []
  })

  // Add virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: portfolioItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => VIRTUAL_SCROLL_SETTINGS.itemSize,
    overscan: VIRTUAL_SCROLL_SETTINGS.overscan,
  })

  // Add performance monitoring
  const { performanceMetrics, startMonitoring, stopMonitoring } = usePerformanceMonitor({
    thresholds: PERFORMANCE_THRESHOLDS,
    onThresholdExceeded: (metric) => {
      console.warn(`Performance threshold exceeded: ${metric}`)
      // Implement performance degradation strategies
      if (metric === 'renderTime') {
        // Reduce overscan or batch size
        VIRTUAL_SCROLL_SETTINGS.overscan = Math.max(1, VIRTUAL_SCROLL_SETTINGS.overscan - 1)
        PROGRESSIVE_LOADING.batchSize = Math.max(3, PROGRESSIVE_LOADING.batchSize - 1)
      }
    }
  })

  // Optimize grid columns based on container width
  const gridColumns = useMemo(() => {
    if (width >= 1200) return 3
    if (width >= 768) return 2
    return 1
  }, [width])

  // Add progressive loading
  const loadMoreItems = useCallback(() => {
    setVisibleItems(prev => Math.min(prev + PROGRESSIVE_LOADING.batchSize, portfolioItems.length))
  }, [portfolioItems.length])

  // Add intersection observer for infinite scroll
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView && visibleItems < portfolioItems.length) {
        loadMoreItems()
      }
    }
  })

  // Start performance monitoring
  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [startMonitoring, stopMonitoring])

  // Optimize fetchPortfolioItems with retry logic
  const fetchPortfolioItems = useCallback(async (attempt = 1) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const cache = Cache.getInstance()
      const cacheKey = CACHE_KEYS.PORTFOLIO_ITEMS(session.user.id)
      const cachedData = cache.get<PortfolioItem[]>(cacheKey)

      if (cachedData) {
        setPortfolioItems(cachedData)
        setIsLoading(false)
        return
      }

      const { data: items, error: itemsError } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (itemsError) throw itemsError

      const itemsWithMedia = await Promise.all(
        items.map(async (item) => {
          const cachedItem = portfolioCache.get(item.id)
          if (cachedItem) return cachedItem

          const { data: media, error: mediaError } = await supabase
            .from("portfolio_media")
            .select("*")
            .eq("portfolio_item_id", item.id)
            .order("order_index")

          if (mediaError) {
            console.error("Failed to fetch media for item:", item.id)
            return { ...item, media: [] }
          }

          const portfolioItem = { ...item, media: media || [] }
          portfolioCache.set(item.id, portfolioItem)
          return portfolioItem
        })
      )

      setPortfolioItems(itemsWithMedia)
      cache.set(cacheKey, itemsWithMedia)
    } catch (error) {
      if (attempt < ERROR_RETRY.maxAttempts) {
        setTimeout(() => fetchPortfolioItems(attempt + 1), ERROR_RETRY.delay)
      } else {
        console.error("Error fetching portfolio items:", error)
        setError("Failed to fetch portfolio items")
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolioItems()
  }, [fetchPortfolioItems])

  const uploadMedia = async (files: File[], portfolioItemId: string) => {
    setUploading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const optimizedFiles = await Promise.all(
        files.map(file => 
          file.type.startsWith("image/") ? optimizeImage(file) : file
        )
      )

      if (!isOnline) {
        setOfflineChanges(prev => ({
          ...prev,
          media: [...prev.media, ...optimizedFiles.map(file => ({
            itemId: portfolioItemId,
            file
          }))]
        }))
        toast.success("Media queued for upload (offline)")
        return
      }

      const uploadPromises = optimizedFiles.map(async (file, index) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${session.user.id}/${portfolioItemId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("portfolio-media")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-media")
          .getPublicUrl(filePath)

        const { error: mediaError } = await supabase
          .from("portfolio_media")
          .insert([{
            portfolio_item_id: portfolioItemId,
            type: file.type.startsWith("image/") ? "image" : "video",
            url: publicUrl,
            order_index: index
          }])

        if (mediaError) throw mediaError
      })

      await Promise.all(uploadPromises)
      toast.success("Media uploaded successfully")
    } catch (error) {
      console.error("Error uploading media:", error)
      toast.error("Failed to upload media")
    } finally {
      setUploading(false)
      fetchPortfolioItems()
    }
  }

  const addPortfolioItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.category) {
      toast.error("Please fill in all required fields")
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from("portfolio_items")
      .insert([{
        user_id: session.user.id,
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        tags: newItem.tags,
        client_name: newItem.client_name,
        client_testimonial: newItem.client_testimonial,
        video_url: newItem.video_url,
        external_links: newItem.external_links
      }])
      .select()
      .single()

    if (error) {
      toast.error("Failed to add portfolio item")
      return
    }

    if (selectedMedia.length > 0) {
      await uploadMedia(selectedMedia, data.id)
    }

    setNewItem({
      title: "",
      description: "",
      category: "",
      tags: [],
      client_name: "",
      client_testimonial: "",
      video_url: "",
      external_links: {},
      media: []
    })
    setSelectedMedia([])
    fetchPortfolioItems()
  }

  const deletePortfolioItem = async (itemId: string) => {
    const { error } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", itemId)

    if (error) {
      toast.error("Failed to delete portfolio item")
      return
    }

    fetchPortfolioItems()
  }

  const deleteMedia = async (mediaId: string) => {
    const { error } = await supabase
      .from("portfolio_media")
      .delete()
      .eq("id", mediaId)

    if (error) {
      toast.error("Failed to delete media")
      return
    }

    fetchPortfolioItems()
  }

  // Add sync function for offline changes
  const syncOfflineChanges = async () => {
    if (!isOnline) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      // Sync portfolio items
      for (const item of offlineChanges.items) {
        const { error } = await supabase
          .from("portfolio_items")
          .upsert(item)
        
        if (error) throw error
      }

      // Sync media
      for (const { itemId, file } of offlineChanges.media) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${session.user.id}/${itemId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("portfolio-media")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("portfolio-media")
          .getPublicUrl(filePath)

        const { error: mediaError } = await supabase
          .from("portfolio_media")
          .insert([{
            portfolio_item_id: itemId,
            type: file.type.startsWith("image/") ? "image" : "video",
            url: publicUrl,
            order_index: 0
          }])

        if (mediaError) throw mediaError
      }

      // Clear offline changes
      setOfflineChanges({
        items: [],
        media: []
      })

      // Refresh data
      await fetchPortfolioItems()
      toast.success("Offline changes synced successfully")
    } catch (error) {
      console.error("Error syncing offline changes:", error)
      toast.error("Failed to sync offline changes")
    }
  }

  // Add error boundary
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" ref={ref}>
      {!isOnline && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently offline. Changes will be synced when you're back online.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="view" className="space-y-6">
        <TabsList>
          <TabsTrigger value="view">View Portfolio</TabsTrigger>
          <TabsTrigger value="add">Add New Item</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <div
            ref={parentRef}
            className="h-[800px] overflow-auto relative"
            style={{
              contain: "strict",
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = portfolioItems[virtualRow.index]
                return (
                  <div
                    key={item.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <PortfolioItem item={item} index={virtualRow.index} />
                  </div>
                )
              })}
            </div>
            {visibleItems < portfolioItems.length && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Portfolio Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Project description"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags</Label>
                  <MultiSelect
                    options={TAGS}
                    selected={newItem.tags || []}
                    onChange={(tags) => setNewItem({ ...newItem, tags })}
                    placeholder="Select tags"
                  />
                </div>
                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={newItem.client_name}
                    onChange={(e) => setNewItem({ ...newItem, client_name: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label>Client Testimonial</Label>
                  <Textarea
                    value={newItem.client_testimonial}
                    onChange={(e) => setNewItem({ ...newItem, client_testimonial: e.target.value })}
                    placeholder="Client testimonial"
                  />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={newItem.video_url || ""}
                    onChange={(e) => setNewItem({ ...newItem, video_url: e.target.value })}
                    placeholder="Video URL (optional)"
                  />
                </div>
                <div>
                  <Label>External Links</Label>
                  <div className="space-y-2">
                    <Input
                      value={newItem.external_links?.github || ""}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        external_links: { ...newItem.external_links, github: e.target.value }
                      })}
                      placeholder="GitHub URL"
                    />
                    <Input
                      value={newItem.external_links?.behance || ""}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        external_links: { ...newItem.external_links, behance: e.target.value }
                      })}
                      placeholder="Behance URL"
                    />
                    <Input
                      value={newItem.external_links?.dribbble || ""}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        external_links: { ...newItem.external_links, dribbble: e.target.value }
                      })}
                      placeholder="Dribbble URL"
                    />
                    <Input
                      value={newItem.external_links?.website || ""}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        external_links: { ...newItem.external_links, website: e.target.value }
                      })}
                      placeholder="Website URL"
                    />
                  </div>
                </div>
                <div>
                  <Label>Media</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setSelectedMedia(files)
                      }}
                      className="flex-1"
                      disabled={uploading}
                    />
                    <Button onClick={addPortfolioItem} disabled={uploading}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 