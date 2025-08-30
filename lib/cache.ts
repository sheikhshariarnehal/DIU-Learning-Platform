// Enhanced in-memory cache with TTL, compression, and memory management
interface CacheItem {
  data: any
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalSize: number
  itemCount: number
}

class EnhancedCache {
  private cache = new Map<string, CacheItem>()
  private maxSize: number = 50 * 1024 * 1024 // 50MB max cache size
  private maxItems: number = 1000 // Max 1000 items
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    itemCount: 0
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    const size = this.estimateSize(data)

    // Check if we need to evict items
    this.evictIfNeeded(size)

    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size
    }

    // Remove old item if exists
    if (this.cache.has(key)) {
      const oldItem = this.cache.get(key)!
      this.stats.totalSize -= oldItem.size
      this.stats.itemCount--
    }

    this.cache.set(key, item)
    this.stats.totalSize += size
    this.stats.itemCount++
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      this.stats.misses++
      return null
    }

    // Update access stats
    item.accessCount++
    item.lastAccessed = Date.now()
    this.stats.hits++

    return item.data
  }

  delete(key: string) {
    const item = this.cache.get(key)
    if (item) {
      this.stats.totalSize -= item.size
      this.stats.itemCount--
      this.cache.delete(key)
    }
  }

  clear() {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0
    }
  }

  // Enhanced cleanup with LRU eviction
  cleanup() {
    const now = Date.now()
    const itemsToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        itemsToDelete.push(key)
      }
    }

    itemsToDelete.forEach(key => this.delete(key))
  }

  // Evict items when cache is full (LRU strategy)
  private evictIfNeeded(newItemSize: number) {
    // Check size limit
    while (this.stats.totalSize + newItemSize > this.maxSize && this.cache.size > 0) {
      this.evictLRU()
    }

    // Check item count limit
    while (this.cache.size >= this.maxItems) {
      this.evictLRU()
    }
  }

  private evictLRU() {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
      this.stats.evictions++
    }
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // Rough estimate (UTF-16)
    } catch {
      return 1024 // Default size for non-serializable data
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Get cache efficiency
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? this.stats.hits / total : 0
  }
}

export const cache = new EnhancedCache()

// Cleanup expired items every 2 minutes
if (typeof window !== "undefined") {
  setInterval(() => cache.cleanup(), 2 * 60 * 1000)
}
