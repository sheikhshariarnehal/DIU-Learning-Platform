"use client"

import { memo, useState, useCallback, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, FileText, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
  [key: string]: any
}

interface Slide {
  id: string
  title: string
  google_drive_url: string
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

// Cache for topic content
const topicContentCache = new Map<string, { data: TopicContent; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
  const isMobile = useIsMobile()
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Prefetch topic content on hover with debounce
  const prefetchTopicContent = useCallback(async () => {
    if (topicContent || isLoading || prefetchStarted || isExpanded) return

    setPrefetchStarted(true)

    // Check cache first
    const cacheKey = `topic-${topic.id}`
    const cached = topicContentCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
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
      topicContentCache.set(cacheKey, { data, timestamp: Date.now() })
      setTopicContent(data)
    } catch (error) {
      console.error("Failed to prefetch topic content:", error)
    }
  }, [topic.id, topicContent, isLoading, prefetchStarted, isExpanded])

  // Fetch topic content when expanded
  const fetchTopicContent = useCallback(async () => {
    if (topicContent || isLoading) return

    setIsLoading(true)

    // Check cache first
    const cacheKey = `topic-${topic.id}`
    const cached = topicContentCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTopicContent(cached.data)
      setIsLoading(false)
      return
    }

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
      topicContentCache.set(cacheKey, { data, timestamp: Date.now() })
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

  // Handle topic expansion with smooth animation
  const handleToggle = useCallback(() => {
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      onTopicExpand?.(topic.id)
    })
  }, [topic.id, onTopicExpand])

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
        className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[44px]' : 'px-3 py-2.5'} h-auto min-w-0 sidebar-item-professional touch-manipulation rounded-md transition-all duration-200 ease-out ${
          isExpanded
            ? 'bg-primary/10 border border-primary/20 shadow-sm'
            : 'hover:bg-accent/70 hover:scale-[1.01] active:scale-[0.99]'
        }`}
        onClick={handleToggle}
      >
        <div className="flex items-start gap-2.5 w-full min-w-0">
          <ChevronRight 
            className={`${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'} text-muted-foreground flex-shrink-0 mt-0.5 transition-transform duration-200 ease-out ${
              isExpanded ? 'rotate-90' : 'rotate-0'
            }`} 
          />
          
          <div className="flex-1 min-w-0 break-words">
            <ProfessionalTopicTitle
              index={index}
              title={topic.title}
              maxLength={isMobile ? 45 : 50}
              variant={isMobile ? "compact" : "default"}
              className={`${isExpanded ? "text-primary font-semibold" : "text-foreground"} break-words leading-relaxed`}
            />
          </div>
          
          {/* Content count badge */}
          {totalContent > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/70 flex-shrink-0">
              {topicContent?.videos && topicContent.videos.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <Play className="h-2.5 w-2.5" />
                  {topicContent.videos.length}
                </span>
              )}
              {topicContent?.slides && topicContent.slides.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <FileText className="h-2.5 w-2.5" />
                  {topicContent.slides.length}
                </span>
              )}
            </div>
          )}
          
          {isLoading && !topicContent && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </Button>

      {/* Topic Content with smooth animation */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`${isMobile ? 'ml-4' : 'ml-6'} space-y-1.5 mt-2 min-w-0`}>
          {isLoading && !topicContent ? (
            /* Skeleton Loading */
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5 px-2 py-2 animate-pulse">
                  <Skeleton className="h-3.5 w-3.5 rounded flex-shrink-0" />
                  <Skeleton className="h-4 flex-1" />
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
      className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-2 py-2'} h-auto rounded-md group transition-all duration-150 touch-manipulation min-w-0 will-change-transform ${
        isSelected
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm scale-[1.01]"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
      }`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-2.5 w-full min-w-0">
        <div className={`relative flex-shrink-0 ${isHovered && !isSelected ? 'animate-pulse' : ''}`}>
          <Play 
            className={`h-3.5 w-3.5 mt-0.5 transition-all duration-150 ${
              isSelected 
                ? "text-red-500 fill-red-500/20" 
                : isHovered 
                  ? "text-red-500 fill-red-500/10" 
                  : "text-red-400"
            }`} 
          />
        </div>
        <span 
          className={`text-xs ${isMobile ? 'text-sm' : 'text-xs'} leading-relaxed break-words min-w-0 flex-1 transition-colors duration-150 ${
            isSelected ? "font-medium text-foreground" : ""
          }`}
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            hyphens: 'auto'
          }}
        >
          {video.title}
        </span>
        {isHovered && !isSelected && !isMobile && (
          <span className="text-[10px] text-muted-foreground flex-shrink-0 animate-in fade-in duration-150">
            Video
          </span>
        )}
      </div>
    </Button>
  )
})

VideoItem.displayName = "VideoItem"

// Helper to extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

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
      className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-2 py-2'} h-auto rounded-md group transition-all duration-150 touch-manipulation min-w-0 will-change-transform ${
        isSelected
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm scale-[1.01]"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
      }`}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-2.5 w-full min-w-0">
        <div className={`relative flex-shrink-0 ${isHovered && !isSelected ? 'animate-pulse' : ''}`}>
          <FileText 
            className={`h-3.5 w-3.5 mt-0.5 transition-all duration-150 ${
              isSelected 
                ? "text-blue-500 fill-blue-500/20" 
                : isHovered 
                  ? "text-blue-500 fill-blue-500/10" 
                  : "text-blue-400"
            }`} 
          />
        </div>
        <span 
          className={`text-xs ${isMobile ? 'text-sm' : 'text-xs'} leading-relaxed break-words min-w-0 flex-1 transition-colors duration-150 ${
            isSelected ? "font-medium text-foreground" : ""
          }`}
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            hyphens: 'auto'
          }}
        >
          {slide.title}
        </span>
        {isHovered && !isSelected && !isMobile && slide.file_url && (
          <span className="text-[10px] text-muted-foreground flex-shrink-0 animate-in fade-in duration-150 font-medium">
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
