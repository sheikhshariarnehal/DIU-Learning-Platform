"use client"

import { useState, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface UseCourseDataCacheOptions {
  cacheTime?: number // Cache duration in milliseconds (default: 5 minutes)
  staleTime?: number // Time before data is considered stale (default: 1 minute)
}

/**
 * Custom hook for caching course data with optimized performance
 * Provides prefetching, cache invalidation, and optimistic updates
 */
export function useCourseDataCache<T = any>(options: UseCourseDataCacheOptions = {}) {
  const { 
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000   // 1 minute
  } = options

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const pendingRequests = useRef<Map<string, Promise<T>>>(new Map())
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return false
    
    const age = Date.now() - entry.timestamp
    return age < cacheTime
  }, [cacheTime])

  /**
   * Check if cached data is stale (still usable but should be refreshed)
   */
  const isCacheStale = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return true
    
    const age = Date.now() - entry.timestamp
    return age >= staleTime && age < cacheTime
  }, [staleTime, cacheTime])

  /**
   * Get cached data
   */
  const getCachedData = useCallback((key: string): T | null => {
    if (!isCacheValid(key)) {
      cache.current.delete(key)
      return null
    }
    return cache.current.get(key)?.data || null
  }, [isCacheValid])

  /**
   * Set cached data
   */
  const setCachedData = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [])

  /**
   * Fetch data with caching and deduplication
   */
  const fetchData = useCallback(async (
    key: string, 
    fetcher: () => Promise<T>,
    options: { forceRefresh?: boolean } = {}
  ): Promise<T> => {
    // Return cached data if valid and not forcing refresh
    if (!options.forceRefresh) {
      const cached = getCachedData(key)
      if (cached) {
        // If stale, trigger background refresh
        if (isCacheStale(key)) {
          // Background refresh without blocking
          fetchData(key, fetcher, { forceRefresh: true }).catch(console.error)
        }
        return cached
      }
    }

    // Check if there's already a pending request for this key (deduplication)
    const pending = pendingRequests.current.get(key)
    if (pending) {
      return pending
    }

    // Start new fetch
    setIsLoading(prev => ({ ...prev, [key]: true }))

    const fetchPromise = (async () => {
      try {
        const data = await fetcher()
        setCachedData(key, data)
        pendingRequests.current.delete(key)
        return data
      } catch (error) {
        pendingRequests.current.delete(key)
        // Return stale data if available on error
        const stale = cache.current.get(key)?.data
        if (stale) return stale
        throw error
      } finally {
        setIsLoading(prev => {
          const newState = { ...prev }
          delete newState[key]
          return newState
        })
      }
    })()

    pendingRequests.current.set(key, fetchPromise)
    return fetchPromise
  }, [getCachedData, setCachedData, isCacheStale])

  /**
   * Prefetch data without blocking
   */
  const prefetch = useCallback((key: string, fetcher: () => Promise<T>) => {
    // Don't prefetch if already cached and valid
    if (isCacheValid(key)) return

    // Don't prefetch if already loading
    if (pendingRequests.current.has(key)) return

    // Start prefetch in background
    fetchData(key, fetcher).catch(console.error)
  }, [fetchData, isCacheValid])

  /**
   * Invalidate cache for a specific key or all keys
   */
  const invalidate = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key)
    } else {
      cache.current.clear()
    }
  }, [])

  /**
   * Get all cached keys
   */
  const getCachedKeys = useCallback((): string[] => {
    return Array.from(cache.current.keys())
  }, [])

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const keys = Array.from(cache.current.keys())
    const validCount = keys.filter(key => isCacheValid(key)).length
    const staleCount = keys.filter(key => isCacheStale(key)).length
    
    return {
      totalEntries: cache.current.size,
      validEntries: validCount,
      staleEntries: staleCount,
      pendingRequests: pendingRequests.current.size
    }
  }, [isCacheValid, isCacheStale])

  return {
    fetchData,
    prefetch,
    getCachedData,
    setCachedData,
    invalidate,
    getCachedKeys,
    getCacheStats,
    isLoading,
    isCacheValid,
    isCacheStale
  }
}
