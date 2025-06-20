// Cache types
type CacheEntry<T> = {
  data: T
  timestamp: number
  expiresAt: number
}

type CacheOptions = {
  expirationTime?: number // in milliseconds
  maxSize?: number // maximum number of items in cache
}

// Default cache options
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  expirationTime: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
}

// Cache class for storing and retrieving data
class Cache<T> {
  private cache: Map<string, CacheEntry<T>>
  private options: CacheOptions
  private keys: string[] = []

  constructor(options: CacheOptions = {}) {
    this.cache = new Map<string, CacheEntry<T>>()
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options }
  }

  // Set an item in the cache
  set(key: string, data: T): void {
    const now = Date.now()
    const expiresAt = now + (this.options.expirationTime || 0)

    // If cache is full, remove oldest item
    if (this.options.maxSize && this.keys.length >= this.options.maxSize) {
      const oldestKey = this.keys.shift()
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    // Add new item to cache
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })

    // Add key to keys array for tracking order
    this.keys.push(key)
  }

  // Get an item from the cache
  get(key: string): T | null {
    const entry = this.cache.get(key)

    // If entry doesn't exist or is expired, return null
    if (!entry || (entry.expiresAt && entry.expiresAt < Date.now())) {
      this.cache.delete(key)
      this.keys = this.keys.filter((k) => k !== key)
      return null
    }

    return entry.data
  }

  // Check if an item exists in the cache
  has(key: string): boolean {
    const entry = this.cache.get(key)

    // If entry doesn't exist or is expired, return false
    if (!entry || (entry.expiresAt && entry.expiresAt < Date.now())) {
      this.cache.delete(key)
      this.keys = this.keys.filter((k) => k !== key)
      return false
    }

    return true
  }

  // Delete an item from the cache
  delete(key: string): boolean {
    this.keys = this.keys.filter((k) => k !== key)
    return this.cache.delete(key)
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear()
    this.keys = []
  }

  // Get all keys in the cache
  getKeys(): string[] {
    return [...this.keys]
  }

  // Get the size of the cache
  size(): number {
    return this.cache.size
  }

  // Get all items in the cache
  getAll(): Map<string, T> {
    const result = new Map<string, T>()

    for (const key of this.keys) {
      const entry = this.cache.get(key)
      if (entry && (!entry.expiresAt || entry.expiresAt >= Date.now())) {
        result.set(key, entry.data)
      }
    }

    return result
  }
}

// Create singleton instances for different data types
const userCache = new Cache<any>({ expirationTime: 10 * 60 * 1000 }) // 10 minutes
const postCache = new Cache<any>({ expirationTime: 5 * 60 * 1000 }) // 5 minutes
const messageCache = new Cache<any>({ expirationTime: 2 * 60 * 1000 }) // 2 minutes
const searchCache = new Cache<any>({ expirationTime: 5 * 60 * 1000, maxSize: 50 }) // 5 minutes, max 50 searches

// Generate a cache key from parameters
function generateCacheKey(prefix: string, params: any): string {
  return `${prefix}:${JSON.stringify(params)}`
}

export { Cache, userCache, postCache, messageCache, searchCache, generateCacheKey }
