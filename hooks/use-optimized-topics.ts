import { useState, useCallback, useRef, useEffect } from 'react'

interface TopicState {
  expandedTopicIds: Set<string>
  prefetchedTopics: Set<string>
  loadingTopics: Set<string>
}

interface UseOptimizedTopicsOptions {
  courseId: string
  autoCollapse?: boolean // Automatically collapse other topics when one is expanded
  prefetchOnHover?: boolean
  maxExpanded?: number // Maximum number of topics that can be expanded simultaneously
}

export function useOptimizedTopics({
  courseId,
  autoCollapse = false,
  prefetchOnHover = true,
  maxExpanded = 5
}: UseOptimizedTopicsOptions) {
  const [state, setState] = useState<TopicState>({
    expandedTopicIds: new Set(),
    prefetchedTopics: new Set(),
    loadingTopics: new Set()
  })

  const prefetchTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Toggle topic expansion
  const toggleTopic = useCallback((topicId: string) => {
    setState((prev) => {
      const newExpandedIds = new Set(prev.expandedTopicIds)

      if (newExpandedIds.has(topicId)) {
        // Collapse
        newExpandedIds.delete(topicId)
      } else {
        // Expand
        if (autoCollapse) {
          // Close all others
          newExpandedIds.clear()
          newExpandedIds.add(topicId)
        } else if (maxExpanded && newExpandedIds.size >= maxExpanded) {
          // Remove oldest expanded topic
          const firstId = Array.from(newExpandedIds)[0]
          newExpandedIds.delete(firstId)
          newExpandedIds.add(topicId)
        } else {
          newExpandedIds.add(topicId)
        }
      }

      return {
        ...prev,
        expandedTopicIds: newExpandedIds
      }
    })
  }, [autoCollapse, maxExpanded])

  // Expand specific topic
  const expandTopic = useCallback((topicId: string) => {
    setState((prev) => {
      const newExpandedIds = new Set(prev.expandedTopicIds)
      
      if (autoCollapse) {
        newExpandedIds.clear()
      } else if (maxExpanded && newExpandedIds.size >= maxExpanded) {
        const firstId = Array.from(newExpandedIds)[0]
        newExpandedIds.delete(firstId)
      }
      
      newExpandedIds.add(topicId)

      return {
        ...prev,
        expandedTopicIds: newExpandedIds
      }
    })
  }, [autoCollapse, maxExpanded])

  // Collapse specific topic
  const collapseTopic = useCallback((topicId: string) => {
    setState((prev) => {
      const newExpandedIds = new Set(prev.expandedTopicIds)
      newExpandedIds.delete(topicId)

      return {
        ...prev,
        expandedTopicIds: newExpandedIds
      }
    })
  }, [])

  // Collapse all topics
  const collapseAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedTopicIds: new Set()
    }))
  }, [])

  // Expand all topics (use with caution for large lists)
  const expandAll = useCallback((topicIds: string[]) => {
    if (topicIds.length > 10) {
      console.warn('Expanding all topics with large list may impact performance')
    }

    setState((prev) => ({
      ...prev,
      expandedTopicIds: new Set(topicIds)
    }))
  }, [])

  // Prefetch topic content
  const prefetchTopic = useCallback((topicId: string, delay: number = 300) => {
    if (!prefetchOnHover) return
    if (state.prefetchedTopics.has(topicId)) return

    // Clear existing timer for this topic
    const existingTimer = prefetchTimers.current.get(topicId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      // Trigger prefetch (will be handled by the component)
      setState((prev) => ({
        ...prev,
        prefetchedTopics: new Set([...prev.prefetchedTopics, topicId])
      }))
      prefetchTimers.current.delete(topicId)
    }, delay)

    prefetchTimers.current.set(topicId, timer)
  }, [prefetchOnHover, state.prefetchedTopics])

  // Cancel prefetch
  const cancelPrefetch = useCallback((topicId: string) => {
    const timer = prefetchTimers.current.get(topicId)
    if (timer) {
      clearTimeout(timer)
      prefetchTimers.current.delete(topicId)
    }
  }, [])

  // Set loading state
  const setTopicLoading = useCallback((topicId: string, loading: boolean) => {
    setState((prev) => {
      const newLoadingTopics = new Set(prev.loadingTopics)
      if (loading) {
        newLoadingTopics.add(topicId)
      } else {
        newLoadingTopics.delete(topicId)
      }

      return {
        ...prev,
        loadingTopics: newLoadingTopics
      }
    })
  }, [])

  // Check if topic is expanded
  const isTopicExpanded = useCallback((topicId: string) => {
    return state.expandedTopicIds.has(topicId)
  }, [state.expandedTopicIds])

  // Check if topic is loading
  const isTopicLoading = useCallback((topicId: string) => {
    return state.loadingTopics.has(topicId)
  }, [state.loadingTopics])

  // Check if topic is prefetched
  const isTopicPrefetched = useCallback((topicId: string) => {
    return state.prefetchedTopics.has(topicId)
  }, [state.prefetchedTopics])

  // Get stats
  const getStats = useCallback(() => {
    return {
      expandedCount: state.expandedTopicIds.size,
      prefetchedCount: state.prefetchedTopics.size,
      loadingCount: state.loadingTopics.size
    }
  }, [state])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      prefetchTimers.current.forEach((timer) => clearTimeout(timer))
      prefetchTimers.current.clear()
    }
  }, [])

  // Reset state when course changes
  useEffect(() => {
    setState({
      expandedTopicIds: new Set(),
      prefetchedTopics: new Set(),
      loadingTopics: new Set()
    })
  }, [courseId])

  return {
    // State
    expandedTopicIds: state.expandedTopicIds,
    loadingTopics: state.loadingTopics,
    prefetchedTopics: state.prefetchedTopics,

    // Actions
    toggleTopic,
    expandTopic,
    collapseTopic,
    collapseAll,
    expandAll,
    prefetchTopic,
    cancelPrefetch,
    setTopicLoading,

    // Queries
    isTopicExpanded,
    isTopicLoading,
    isTopicPrefetched,
    getStats
  }
}

// Hook for managing topic search/filter
export function useTopicFilter(topics: any[]) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTopics = useCallback(() => {
    if (!searchQuery.trim()) return topics

    const query = searchQuery.toLowerCase()
    return topics.filter((topic) =>
      topic.title.toLowerCase().includes(query)
    )
  }, [topics, searchQuery])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filteredTopics: filteredTopics(),
    clearSearch,
    hasActiveFilter: searchQuery.trim().length > 0
  }
}

// Hook for topic keyboard navigation
export function useTopicKeyboardNav(topicIds: string[], onSelect: (topicId: string) => void) {
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => Math.min(prev + 1, topicIds.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < topicIds.length) {
          onSelect(topicIds[focusedIndex])
        }
        break
      case 'Home':
        e.preventDefault()
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        setFocusedIndex(topicIds.length - 1)
        break
    }
  }, [focusedIndex, topicIds, onSelect])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    focusedIndex,
    setFocusedIndex,
    focusedTopicId: focusedIndex >= 0 ? topicIds[focusedIndex] : null
  }
}
