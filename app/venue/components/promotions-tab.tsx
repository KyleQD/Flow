import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, BarChart2, Calendar, Image, Video, Link, Trash2, Pause, Play, Clock, Megaphone } from "lucide-react"
import { toast } from "sonner"
import { Promotion, PromotionType, PromotionStatus, PromotionChannel } from '../types/promotion'
import { createPromotion, updatePromotion, updatePromotionStatus, deletePromotion, uploadPromotionMedia } from '../actions/promotion-actions'
import { formatDistanceToNow } from 'date-fns'

interface PromotionsTabProps {
  eventId?: string
  promotions: Promotion[]
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <Megaphone className="h-10 w-10 mb-4 text-purple-400" />
      <div className="text-lg font-semibold mb-2">No promotions yet</div>
      <div className="mb-4 text-sm">Start promoting your venue or events to reach a wider audience.</div>
      <Button onClick={onCreate} variant="default">
        <Plus className="h-4 w-4 mr-2" /> Create Promotion
      </Button>
    </div>
  )
}

export function PromotionsTab({ eventId, promotions: initialPromotions }: PromotionsTabProps) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event' as PromotionType,
    channels: [] as PromotionChannel[],
    content: {
      text: '',
      media: [] as { type: 'image' | 'video'; url: string }[],
      callToAction: { text: '', url: '' }
    }
  })

  async function handleCreatePromotion() {
    setIsLoading(true)
    try {
      const result = await createPromotion({
        ...formData,
        eventId,
        targets: [{
          platform: 'instagram',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]
      })
      
      if (result.success) {
        toast.success('Promotion created successfully')
        setIsCreating(false)
        setFormData({
          title: '',
          description: '',
          type: 'event',
          channels: [],
          content: {
            text: '',
            media: [],
            callToAction: { text: '', url: '' }
          }
        })
        // TODO: Refresh promotions list
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create promotion')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateStatus(promotionId: string, status: PromotionStatus) {
    try {
      const result = await updatePromotionStatus(promotionId, status)
      if (result.success) {
        toast.success('Promotion status updated')
        // TODO: Refresh promotions list
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  async function handleDeletePromotion(promotionId: string) {
    try {
      const result = await deletePromotion(promotionId)
      if (result.success) {
        toast.success('Promotion deleted')
        // TODO: Refresh promotions list
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete promotion')
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadPromotionMedia(file)
      if (result.success && typeof result.url === 'string') {
        setFormData(prev => ({
          ...prev,
          content: {
            ...prev.content,
            media: [...prev.content.media, {
              type: file.type.startsWith('image/') ? 'image' : 'video',
              url: result.url as string
            }]
          }
        }))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload media')
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Promotion Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Promotions</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Promotion
        </Button>
      </div>

      {/* Create Promotion Modal */}
      {isCreating && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Create New Promotion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter promotion title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter promotion description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as PromotionType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="special_offer">Special Offer</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Channels</label>
                <div className="flex gap-2 mt-2">
                  {(['social', 'email', 'website', 'paid_ads'] as const).map((channel) => (
                    <Button
                      key={channel}
                      variant={formData.channels.includes(channel) ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        channels: prev.channels.includes(channel)
                          ? prev.channels.filter(c => c !== channel)
                          : [...prev.channels, channel]
                      }))}
                    >
                      {channel}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content.text}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, text: e.target.value }
                  }))}
                  placeholder="Enter promotion content"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Media</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload">
                    <Button variant="outline" asChild>
                      <span>
                        <Image className="h-4 w-4 mr-2" /> Upload Media
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.content.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {formData.content.media.map((media, index) => (
                      <div key={index} className="relative">
                        {media.type === 'image' ? (
                          <img src={media.url} alt="" className="w-full h-32 object-cover rounded" />
                        ) : (
                          <video src={media.url} className="w-full h-32 object-cover rounded" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              media: prev.content.media.filter((_, i) => i !== index)
                            }
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePromotion} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Promotion
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {promotions.filter(p => p.status === 'active').length === 0 ? (
            !isCreating && <EmptyState onCreate={() => setIsCreating(true)} />
          ) : (
            promotions
              .filter(p => p.status === 'active')
              .map((promotion) => (
                <Card key={promotion.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{promotion.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{promotion.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge>{promotion.type}</Badge>
                          {promotion.channels.map((channel) => (
                            <Badge key={channel} variant="secondary">{channel}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(promotion.id, 'paused')}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePromotion(promotion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {promotion.analytics && (
                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
                        <div>
                          <div className="text-sm text-gray-400">Impressions</div>
                          <div className="text-lg font-semibold">{promotion.analytics.impressions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Clicks</div>
                          <div className="text-lg font-semibold">{promotion.analytics.clicks}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Conversions</div>
                          <div className="text-lg font-semibold">{promotion.analytics.conversions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">ROI</div>
                          <div className="text-lg font-semibold">{promotion.analytics.roi}%</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
        <TabsContent value="scheduled" className="space-y-4">
          {promotions.filter(p => p.status === 'scheduled').length === 0 ? (
            !isCreating && <EmptyState onCreate={() => setIsCreating(true)} />
          ) : (
            promotions
              .filter(p => p.status === 'scheduled')
              .map((promotion) => (
                <Card key={promotion.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{promotion.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{promotion.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            Scheduled for {formatDistanceToNow(new Date(promotion.scheduledFor!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(promotion.id, 'active')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePromotion(promotion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {promotions.filter(p => p.status === 'completed').length === 0 ? (
            !isCreating && <EmptyState onCreate={() => setIsCreating(true)} />
          ) : (
            promotions
              .filter(p => p.status === 'completed')
              .map((promotion) => (
                <Card key={promotion.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{promotion.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{promotion.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{promotion.type}</Badge>
                          {promotion.channels.map((channel) => (
                            <Badge key={channel} variant="secondary">{channel}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPromotion(promotion)}
                      >
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {promotion.analytics && (
                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
                        <div>
                          <div className="text-sm text-gray-400">Impressions</div>
                          <div className="text-lg font-semibold">{promotion.analytics.impressions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Clicks</div>
                          <div className="text-lg font-semibold">{promotion.analytics.clicks}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Conversions</div>
                          <div className="text-lg font-semibold">{promotion.analytics.conversions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">ROI</div>
                          <div className="text-lg font-semibold">{promotion.analytics.roi}%</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 