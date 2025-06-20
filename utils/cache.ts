import { createClient } from '@supabase/supabase-js'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class Cache {
  private static instance: Cache
  private cache: Map<string, CacheEntry<any>>
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Cache keys
export const CACHE_KEYS = {
  USER_SKILLS: (userId: string) => `user_skills_${userId}`,
  PORTFOLIO_ITEMS: (userId: string) => `portfolio_items_${userId}`,
  WORK_HISTORY: (userId: string) => `work_history_${userId}`,
  CERTIFICATIONS: (userId: string) => `certifications_${userId}`,
  JOB_MATCHES: (userId: string) => `job_matches_${userId}`,
  USER_PREFERENCES: (userId: string) => `user_preferences_${userId}`
} 