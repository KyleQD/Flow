// Analytics service with more realistic functionality
import { format, subDays } from "date-fns"

// Profile views data
export interface ProfileViewsData {
  total: number
  daily: { date: string; count: number }[]
  weekly: number
  monthly: number
  percentChange: number
}

// Connection data
export interface ConnectionData {
  total: number
  byProfession: { name: string; value: number }[]
  recent: number
  percentChange: number
}

// Content engagement data
export interface ContentEngagementData {
  rate: number
  byType: { name: string; views: number; likes: number; comments: number }[]
  percentChange: number
}

// Geographic data
export interface GeographicData {
  regions: { name: string; value: number }[]
}

// Generate profile views data
export function getProfileViewsData(): ProfileViewsData {
  const daily = []
  let total = 0

  // Generate daily data for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const count = Math.floor(Math.random() * 20) + 1 // 1-20 views per day
    total += count

    daily.push({
      date: format(date, "MMM dd"),
      count,
    })
  }

  // Calculate weekly and monthly views
  const weekly = daily.slice(-7).reduce((sum, day) => sum + day.count, 0)
  const monthly = total

  // Calculate percent change (comparing to previous period)
  const previousPeriodViews = 220 // Simulated previous period
  const percentChange = Math.round(((total - previousPeriodViews) / previousPeriodViews) * 100)

  return {
    total,
    daily,
    weekly,
    monthly,
    percentChange,
  }
}

// Generate connection data
export function getConnectionData(): ConnectionData {
  const byProfession = [
    { name: "Tour Managers", value: 12 },
    { name: "Sound Engineers", value: 8 },
    { name: "Lighting Designers", value: 5 },
    { name: "Event Producers", value: 7 },
    { name: "Venue Managers", value: 4 },
  ]

  const total = byProfession.reduce((sum, profession) => sum + profession.value, 0)
  const recent = 5 // New connections in the last month
  const percentChange = 16 // Percent change from previous period

  return {
    total,
    byProfession,
    recent,
    percentChange,
  }
}

// Generate content engagement data
export function getContentEngagementData(): ContentEngagementData {
  const byType = [
    { name: "Tour Photos", views: 120, likes: 45, comments: 12 },
    { name: "Event Announcement", views: 85, likes: 32, comments: 8 },
    { name: "Industry Tips", views: 65, likes: 28, comments: 15 },
    { name: "Behind the Scenes", views: 95, likes: 40, comments: 10 },
    { name: "Equipment Review", views: 55, likes: 20, comments: 7 },
  ]

  // Calculate engagement rate
  const totalInteractions = byType.reduce((sum, type) => sum + type.likes + type.comments, 0)
  const totalViews = byType.reduce((sum, type) => sum + type.views, 0)
  const rate = Math.round((totalInteractions / totalViews) * 100)

  const percentChange = 7 // Percent change from previous period

  return {
    rate,
    byType,
    percentChange,
  }
}

// Generate geographic data
export function getGeographicData(): GeographicData {
  const regions = [
    { name: "Los Angeles", value: 35 },
    { name: "New York", value: 25 },
    { name: "Nashville", value: 20 },
    { name: "Austin", value: 15 },
    { name: "Other", value: 5 },
  ]

  return { regions }
}

// Generate engagement over time data
export function getEngagementOverTimeData() {
  const data = []

  // Generate data for the past 30 days
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i)
    data.push({
      date: format(date, "MMM dd"),
      views: Math.floor(Math.random() * 100) + 10,
      likes: Math.floor(Math.random() * 30) + 5,
      comments: Math.floor(Math.random() * 15) + 1,
    })
  }

  return data
}

// Get all analytics data
export function getAllAnalyticsData() {
  return {
    profileViews: getProfileViewsData(),
    connections: getConnectionData(),
    contentEngagement: getContentEngagementData(),
    geography: getGeographicData(),
    engagementOverTime: getEngagementOverTimeData(),
  }
}
