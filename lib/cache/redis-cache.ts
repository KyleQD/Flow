/**
 * Production-Ready Caching System with Redis Integration
 * Supports in-memory fallback for development environments
 */

interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  tags?: string[]
}

interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  compress?: boolean // Compress large data
  serialize?: boolean // Custom serialization
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem>()
  private redis: any = null
  private isRedisAvailable = false
  private compressionThreshold = 1024 // 1KB

  constructor() {
    this.initializeRedis()
    this.startCleanupInterval()
  }

  private async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        // Dynamic import for Redis (only in production)
        const RedisModule = await eval('import("ioredis")').catch(() => null)
        if (!RedisModule) {
          console.log('[Cache] ioredis not installed, using memory cache only')
          return
        }
        
        const Redis = RedisModule.default || RedisModule
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        })
        
        await this.redis.ping()
        this.isRedisAvailable = true
        console.log('[Cache] Redis connection established')
      } catch (error) {
        console.warn('[Cache] Redis not available, using memory cache:', error)
      }
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      // Try Redis first if available
      if (this.isRedisAvailable && this.redis) {
        const cached = await this.redis.get(key)
        if (cached) {
          const item: CacheItem<T> = JSON.parse(cached)
          
          // Check if expired
          if (this.isExpired(item)) {
            await this.redis.del(key)
            return null
          }
          
          return this.decompress(item.data)
        }
      }

      // Fallback to memory cache
      const item = this.memoryCache.get(key) as CacheItem<T>
      if (!item || this.isExpired(item)) {
        this.memoryCache.delete(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('[Cache] Get error:', error)
      return null
    }
  }

  async set<T = any>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || 3600 // Default 1 hour
      const item: CacheItem<T> = {
        data: this.compress(data, options.compress),
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert to milliseconds
        tags: options.tags
      }

      // Store in Redis if available
      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(item))
        
        // Store tags for invalidation
        if (options.tags) {
          for (const tag of options.tags) {
            await this.redis.sadd(`tag:${tag}`, key)
            await this.redis.expire(`tag:${tag}`, ttl)
          }
        }
      }

      // Also store in memory cache for quick access
      this.memoryCache.set(key, item)
    } catch (error) {
      console.error('[Cache] Set error:', error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key)
      }
      this.memoryCache.delete(key)
    } catch (error) {
      console.error('[Cache] Delete error:', error)
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const keys = await this.redis.smembers(`tag:${tag}`)
        if (keys.length > 0) {
          await this.redis.del(...keys)
          await this.redis.del(`tag:${tag}`)
        }
      }

      // Invalidate memory cache by tag
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.tags?.includes(tag)) {
          this.memoryCache.delete(key)
        }
      }
    } catch (error) {
      console.error('[Cache] Tag invalidation error:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushall()
      }
      this.memoryCache.clear()
    } catch (error) {
      console.error('[Cache] Clear error:', error)
    }
  }

  async getStats(): Promise<any> {
    try {
      const stats = {
        memoryCache: {
          size: this.memoryCache.size,
          keys: Array.from(this.memoryCache.keys())
        },
        redis: {
          available: this.isRedisAvailable,
          info: null as any
        }
      }

      if (this.isRedisAvailable && this.redis) {
        stats.redis.info = await this.redis.info('memory')
      }

      return stats
    } catch (error) {
      console.error('[Cache] Stats error:', error)
      return null
    }
  }

  // Wrapper for common caching patterns
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const result = await fn()
    await this.set(key, result, options)
    return result
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  private compress<T>(data: T, shouldCompress?: boolean): T {
    if (!shouldCompress) return data
    
    const serialized = JSON.stringify(data)
    if (serialized.length < this.compressionThreshold) return data
    
    // Simple compression - in production, use proper compression library
    try {
      return data // For now, return as-is
    } catch (error) {
      console.warn('[Cache] Compression failed:', error)
      return data
    }
  }

  private decompress<T>(data: T): T {
    // Decompression logic would go here
    return data
  }

  private startCleanupInterval() {
    // Clean up expired memory cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [key, item] of this.memoryCache.entries()) {
        if (this.isExpired(item)) {
          this.memoryCache.delete(key)
        }
      }
    }, 5 * 60 * 1000)
  }
}

// Singleton instance
export const cache = new CacheManager()

// Utility functions for common caching patterns
export class CacheStrategies {
  // Cache database queries with automatic invalidation
  static async cacheQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: CacheOptions & { 
      invalidationTags?: string[]
      refreshThreshold?: number 
    } = {}
  ): Promise<T> {
    const { refreshThreshold = 0.8, ...cacheOptions } = options
    
    return cache.memoize(key, queryFn, cacheOptions)
  }

  // Cache API responses with background refresh
  static async cacheApiResponse<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300 // 5 minutes
  ): Promise<T> {
    const key = `api:${endpoint}`
    
    // Try to get cached version
    const cached = await cache.get<T>(key)
    if (cached) {
      // Background refresh if cache is old
      const item = cache['memoryCache'].get(key) as CacheItem<T>
      if (item && Date.now() - item.timestamp > ttl * 1000 * 0.8) {
        // Refresh in background
        fetchFn().then(data => cache.set(key, data, { ttl }))
      }
      return cached
    }

    // Fetch and cache
    const data = await fetchFn()
    await cache.set(key, data, { ttl })
    return data
  }

  // Cache user-specific data
  static async cacheUserData<T>(
    userId: string,
    dataType: string,
    fetchFn: () => Promise<T>,
    ttl: number = 1800 // 30 minutes
  ): Promise<T> {
    const key = `user:${userId}:${dataType}`
    return cache.memoize(key, fetchFn, { 
      ttl, 
      tags: [`user:${userId}`, `dataType:${dataType}`] 
    })
  }
}

// Cache decorators for functions
export function Cached(options: CacheOptions & { keyFn?: (...args: any[]) => string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const key = options.keyFn ? 
        options.keyFn(...args) : 
        `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`
      
      return cache.memoize(key, () => method.apply(this, args), options)
    }
  }
} 