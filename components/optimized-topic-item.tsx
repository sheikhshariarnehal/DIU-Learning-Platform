"use client"

import { memo, useState, useCallback, useEffect, useRef, useMemo } from "react"
import { ChevronRight, FileText, Play, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ProfessionalTopicTitle } from "@/components/ui/professional-topic-title"
import { useIsMobile } from "@/components/ui/use-mobile"

interface Topic {
  id: string
  title: string
  order_index: number
  [key: string]: any
}

interface Video {
  id: string
  title: string
  youtube_url: string
  duration_minutes?: number
  [key: string]: any
}

interface Slide {
  id: string
  title: string
  google_drive_url: string
  file_size?: number
  [key: string]: any
}

interface TopicContent {
  slides: Slide[]
  videos: Video[]
}

interface OptimizedTopicItemProps {
  topic: Topic
  index: number
  courseId: string
  courseTitle: string
  selectedContentId?: string
  onContentSelect: (type: string, title: string, url: string, id: string, topicTitle?: string, courseTitle?: string) => void
  onTopicExpand?: (topicId: string) => void
  isExpanded: boolean
}

// Enhanced cache system with metadata
interface CacheEntry {
  data: TopicContent
  timestamp: number
  prefetched: boolean
  accessCount: number
}

const topicContentCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (increased for better performance)
const MAX_CACHE_SIZE = 50 // Limit cache size

// YouTube thumbnail cache
const thumbnailCache = new Map<string, string>()

// Cache utilities
const getCacheKey = (topicId: string, courseId: string) => `${courseId}-${topicId}`

const getCachedContent = (cacheKey: string): CacheEntry | null => {
  const cached = topicContentCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    cached.accessCount++
    return cached
  }
  if (cached) topicContentCache.delete(cacheKey)
  return null
}

const setCachedContent = (cacheKey: string, data: TopicContent, prefetched: boolean = false) => {
  // LRU cache management
  if (topicContentCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(topicContentCache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)[0]?.[0]
    if (oldestKey) topicContentCache.delete(oldestKey)
  }
  
  topicContentCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    prefetched,
    accessCount: 1
  })
}

// Extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export const OptimizedTopicItem = memo(({
  topic,
  index,
  courseId,
  courseTitle,
  selectedContentId,
  onContentSelect,
  onTopicExpand,
  isExpanded
}: OptimizedTopicItemProps) => {
  const [topicContent, setTopicContent] = useState<TopicContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prefetchStarted, setPrefetchStarted] = useState(false)
  const [isOptimisticallyExpanded, setIsOptimisticallyExpanded] = useState(false)
  const isMobile = useIsMobile()
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Show content if expanded or optimistically expanded
  const showContent = isExpanded || isOptimisticallyExpanded

  // Prefetch topic content on hover with debounce
  const prefetchTopicContent = useCallback(async () => {
    if (topicContent || isLoading || prefetchStarted || isExpanded) return

    setPrefetchStarted(true)

    // Check cache first
    const cacheKey = getCacheKey(topic.id, courseId)
    const cached = getCachedContent(cacheKey)
    if (cached) {
      setTopicContent(cached.data)
      return
    }

    try {
      // Fetch slides and videos in parallel
      const [slidesRes, videosRes] = await Promise.all([
        fetch(`/api/topics/${topic.id}/slides`),
        fetch(`/api/topics/${topic.id}/videos`)
      ])

      const [slides, videos] = await Promise.all([
        slidesRes.json(),
        videosRes.json()
      ])

      const data = { slides: slides || [], videos: videos || [] }
      
      // Cache the result
      setCachedContent(cacheKey, data, true)
      setTopicContent(data)
    } catch (error) {
      console.error("Failed to prefetch topic content:", error)
    }
  }, [topic.id, topicContent, isLoading, prefetchStarted, isExpanded])

  // Fetch topic content when expanded
  const fetchTopicContent = useCallback(async () => {
    // Check cache first for instant response
    const cacheKey = getCacheKey(topic.id, courseId)
    const cached = getCachedContent(cacheKey)
    if (cached) {
      setTopicContent(cached.data)
      setIsLoading(false)
      return
    }

    if (topicContent || isLoading) return
    setIsLoading(true)

    try {
      const [slidesRes, videosRes] = await Promise.all([
        fetch(`/api/topics/${topic.id}/slides`),
        fetch(`/api/topics/${topic.id}/videos`)
      ])

      const [slides, videos] = await Promise.all([
        slidesRes.json(),
        videosRes.json()
      ])

      const data = { slides: slides || [], videos: videos || [] }
      
      // Cache the result
      setCachedContent(cacheKey, data, false)
      setTopicContent(data)
    } catch (error) {
      console.error("Failed to fetch topic content:", error)
      // Set empty content on error
      setTopicContent({ slides: [], videos: [] })
    } finally {
      setIsLoading(false)
    }
  }, [topic.id, topicContent, isLoading])

  // Fetch content when expanded
  useEffect(() => {
    if (isExpanded && !topicContent && !isLoading) {
      fetchTopicContent()
    }
  }, [isExpanded, topicContent, isLoading, fetchTopicContent])

  // Handle topic expansion with optimistic UI and smooth animation
  const handleToggle = useCallback(() => {
    if (!isExpanded) {
      // Optimistic UI: Show expanded state immediately
      setIsOptimisticallyExpanded(true)
      
      // Start fetching content immediately if not cached
      const cached = getCachedContent(getCacheKey(topic.id, courseId))
      if (!cached && !topicContent) {
        fetchTopicContent()
      }
      
      // Reset optimistic state after actual state updates
      setTimeout(() => setIsOptimisticallyExpanded(false), 350)
    }
    
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      onTopicExpand?.(topic.id)
    })
  }, [topic.id, courseId, isExpanded, topicContent, onTopicExpand, fetchTopicContent])

  // Handle hover with debounce (300ms delay)
  const handleMouseEnter = useCallback(() => {
    if (isExpanded || isMobile) return
    
    prefetchTimerRef.current = setTimeout(() => {
      prefetchTopicContent()
    }, 300)
  }, [isExpanded, isMobile, prefetchTopicContent])

  const handleMouseLeave = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current)
      prefetchTimerRef.current = null
    }
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current)
      }
    }
  }, [])

  const totalContent = (topicContent?.slides.length || 0) + (topicContent?.videos.length || 0)

  return (
    <div 
      className="min-w-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Topic Header */}
      <Button
        variant="ghost"
        className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[44px]' : 'px-1 py-[2px]'} h-auto min-w-0 sidebar-item-professional touch-manipulation rounded-sm transition-all duration-200 ease-out will-change-transform ${
          showContent
            ? 'bg-primary/10 border border-primary/20 shadow-sm'
            : 'hover:bg-accent/70 hover:scale-[1.01] active:scale-[0.99]'
        }`}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-0.5 w-full min-w-0">
          <ChevronRight 
            className={`${isMobile ? 'h-4 w-4' : 'h-1.5 w-1.5'} text-muted-foreground flex-shrink-0 transition-transform duration-200 ease-out will-change-transform ${
              showContent ? 'rotate-90' : 'rotate-0'
            }`} 
          />
          
          <div className="flex-1 min-w-0 break-words">
            <ProfessionalTopicTitle
              index={index}
              title={topic.title}
              maxLength={isMobile ? 45 : 50}
              variant={isMobile ? "compact" : "default"}
              className={`${showContent ? "text-primary font-semibold" : "text-foreground"} ${isMobile ? 'text-sm' : 'text-[8px]'} break-words leading-[1.05] transition-colors duration-200`}
            />
          </div>
          
          {/* Content count badge */}
          {totalContent > 0 && (
            <div className="flex items-center gap-0.5 text-[6px] text-muted-foreground/70 flex-shrink-0">
              {topicContent?.videos && topicContent.videos.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <Play className="h-1.5 w-1.5" />
                  <span className="text-[6px]">{topicContent.videos.length}</span>
                </span>
              )}
              {topicContent?.slides && topicContent.slides.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <FileText className="h-1.5 w-1.5" />
                  <span className="text-[6px]">{topicContent.slides.length}</span>
                </span>
              )}
            </div>
          )}
          
          {isLoading && !topicContent && (
            <Loader2 className="h-2.5 w-2.5 animate-spin text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </Button>

      {/* Topic Content with smooth animation and optimistic UI */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out will-change-contents ${
          showContent ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`${isMobile ? 'ml-4 space-y-1.5 mt-2' : 'ml-1.5 space-y-0 mt-0'} min-w-0`}>
          {isLoading && !topicContent ? (
            /* Skeleton Loading */
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-0.5 px-0.5 py-[2px] animate-pulse">
                  <Skeleton className="h-1.5 w-1.5 rounded flex-shrink-0" />
                  <Skeleton className="h-2 flex-1" />
                </div>
              ))}
            </>
          ) : topicContent ? (
            /* Actual Content */
            <>
              {/* Videos */}
              {topicContent.videos.map((video, index) => (
                <div 
                  key={video.id}
                  className="animate-in fade-in slide-in-from-top-1"
                  style={{ animationDelay: `${index * 30}ms`, animationDuration: '200ms' }}
                >
                  <VideoItem
                    video={video}
                    isSelected={selectedContentId === video.id}
                    isMobile={isMobile}
                    onSelect={() => onContentSelect(
                      "video",
                      video.title,
                      video.youtube_url,
                      video.id,
                      topic.title,
                      courseTitle
                    )}
                  />
                </div>
              ))}

              {/* Slides */}
              {topicContent.slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className="animate-in fade-in slide-in-from-top-1"
                  style={{ animationDelay: `${(topicContent.videos.length + index) * 30}ms`, animationDuration: '200ms' }}
                >
                  <SlideItem
                    slide={slide}
                    isSelected={selectedContentId === slide.id}
                    isMobile={isMobile}
                    onSelect={() => onContentSelect(
                      "slide",
                      slide.title,
                      slide.google_drive_url,
                      slide.id,
                      topic.title,
                      courseTitle
                    )}
                  />
                </div>
              ))}

              {/* Empty State */}
              {topicContent.slides.length === 0 && topicContent.videos.length === 0 && (
                <div className="text-xs text-muted-foreground py-4 text-center italic animate-in fade-in duration-200">
                  No content available for this topic
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
})

OptimizedTopicItem.displayName = "OptimizedTopicItem"

// Optimized Video Item Component with enhanced interactions
const VideoItem = memo(({ video, isSelected, isMobile, onSelect }: {
  video: Video
  isSelected: boolean
  isMobile: boolean
  onSelect: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (isMobile || isSelected) return
    setIsHovered(true)
    
    // Prefetch video metadata or thumbnail
    if (!isPrefetching && video.youtube_url) {
      setIsPrefetching(true)
      // Prefetch YouTube thumbnail
      const videoId = extractYouTubeId(video.youtube_url)
      if (videoId) {
        const img = new Image()
        img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      }
    }
  }, [isMobile, isSelected, isPrefetching, video.youtube_url])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-0.5 py-[1px]'} h-auto rounded-sm group transition-all duration-150 touch-manipulation min-w-0 will-change-transform ${
        isSelected
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm scale-[1.01]"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.01] active:scale-[0.99]"
      }`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-0.5 w-full min-w-0">
        <div className={`relative flex-shrink-0 ${isHovered && !isSelected ? 'animate-pulse' : ''}`}>
          <Play 
            className={`h-1.5 w-1.5 transition-all duration-150 ${
              isSelected 
                ? "text-red-500 fill-red-500/20" 
                : isHovered 
                  ? "text-red-500 fill-red-500/10" 
                  : "text-red-400"
            }`} 
          />
        </div>
        <span 
          className={`${isMobile ? 'text-sm' : 'text-[7px]'} break-words min-w-0 flex-1 transition-colors duration-150 ${
            isSelected ? "font-medium text-foreground" : ""
          }`}
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            hyphens: 'auto',
            lineHeight: isMobile ? '1.25' : '1'
          }}
        >
          {video.title}
        </span>
        {isHovered && !isSelected && !isMobile && (
          <Play className="h-1.5 w-1.5 text-red-500 flex-shrink-0 animate-in fade-in duration-150" />
        )}
      </div>
    </Button>
  )
})

VideoItem.displayName = "VideoItem"

// Optimized Slide Item Component with enhanced interactions
const SlideItem = memo(({ slide, isSelected, isMobile, onSelect }: {
  slide: Slide
  isSelected: boolean
  isMobile: boolean
  onSelect: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (isMobile || isSelected) return
    setIsHovered(true)
    
    // Prefetch slide preview/metadata
    if (!isPrefetching && slide.file_url) {
      setIsPrefetching(true)
      // Prefetch slide URL (for faster loading when clicked)
      fetch(slide.file_url, { method: 'HEAD' }).catch(() => {})
    }
  }, [isMobile, isSelected, isPrefetching, slide.file_url])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // Get file extension for display
  const getFileType = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'PDF'
    if (['ppt', 'pptx'].includes(ext || '')) return 'PPT'
    if (['doc', 'docx'].includes(ext || '')) return 'DOC'
    return 'FILE'
  }

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-0.5 py-[1px]'} h-auto rounded-sm group transition-all duration-150 touch-manipulation min-w-0 will-change-transform ${
        isSelected
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm scale-[1.01]"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.01] active:scale-[0.99]"
      }`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-0.5 w-full min-w-0">
        <div className={`relative flex-shrink-0 ${isHovered && !isSelected ? 'animate-pulse' : ''}`}>
          <FileText 
            className={`h-1.5 w-1.5 transition-all duration-150 ${
              isSelected 
                ? "text-blue-500 fill-blue-500/20" 
                : isHovered 
                  ? "text-blue-500 fill-blue-500/10" 
                  : "text-blue-400"
            }`} 
          />
        </div>
        <span 
          className={`${isMobile ? 'text-sm' : 'text-[7px]'} break-words min-w-0 flex-1 transition-colors duration-150 ${
            isSelected ? "font-medium text-foreground" : ""
          }`}
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            hyphens: 'auto',
            lineHeight: isMobile ? '1.25' : '1'
          }}
        >
          {slide.title}
        </span>
        {isHovered && !isSelected && !isMobile && slide.file_url && (
          <span className="text-[6px] text-muted-foreground flex-shrink-0 animate-in fade-in duration-150 font-medium">
            {getFileType(slide.file_url)}
          </span>
        )}
      </div>
    </Button>
  )
})

SlideItem.displayName = "SlideItem"

// Export function to clear cache
export const clearTopicCache = (topicId?: string) => {
  if (topicId) {
    topicContentCache.delete(`topic-${topicId}`)
  } else {
    topicContentCache.clear()
  }
}

// Export function to get cache stats
export const getTopicCacheStats = () => {
  const now = Date.now()
  let valid = 0
  let stale = 0
  
  topicContentCache.forEach((value) => {
    if (now - value.timestamp < CACHE_DURATION) {
      valid++
    } else {
      stale++
    }
  })
  
  return {
    total: topicContentCache.size,
    valid,
    stale
  }
}
