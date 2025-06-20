export type PromotionType = 'event' | 'venue' | 'special_offer' | 'newsletter'

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'

export type PromotionChannel = 'social' | 'email' | 'website' | 'paid_ads'

export interface PromotionTarget {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'email' | 'website'
  audience?: {
    demographics?: {
      ageRange?: string[]
      locations?: string[]
      interests?: string[]
    }
    customAudience?: string[]
  }
  budget?: number
  startDate: string
  endDate: string
}

export interface PromotionAnalytics {
  impressions: number
  clicks: number
  conversions: number
  spend: number
  engagement: {
    likes: number
    shares: number
    comments: number
  }
  roi: number
}

export interface Promotion {
  id: string
  eventId?: string
  title: string
  description: string
  type: PromotionType
  status: PromotionStatus
  channels: PromotionChannel[]
  targets: PromotionTarget[]
  content: {
    text: string
    media?: {
      type: 'image' | 'video'
      url: string
    }[]
    callToAction?: {
      text: string
      url: string
    }
  }
  analytics?: PromotionAnalytics
  createdAt: string
  updatedAt: string
  scheduledFor?: string
  createdBy: {
    id: string
    name: string
  }
}

export interface PromotionTemplate {
  id: string
  name: string
  type: PromotionType
  description: string
  content: {
    text: string
    media?: {
      type: 'image' | 'video'
      url: string
    }[]
    callToAction?: {
      text: string
      url: string
    }
  }
  isDefault: boolean
  createdAt: string
  updatedAt: string
} 