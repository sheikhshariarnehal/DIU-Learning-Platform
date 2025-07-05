"use client"

import { useState, useEffect, useCallback } from "react"
import { cache } from "@/lib/cache"

interface FetchOptions {
  cacheKey?: string
  cacheTTL?: number
  dependencies?: any[]
}

export function useOptimizedFetch<T>(fetchFn: () => Promise<T>, options: FetchOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { cacheKey, cacheTTL = 5 * 60 * 1000, dependencies = [] } = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      if (cacheKey) {
        const cachedData = cache.get(cacheKey)
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          return
        }
      }

      // Fetch new data
      const result = await fetchFn()

      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, result, cacheTTL)
      }

      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, cacheKey, cacheTTL, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    if (cacheKey) {
      cache.delete(cacheKey)
    }
    fetchData()
  }, [fetchData, cacheKey])

  return { data, loading, error, refetch }
}
