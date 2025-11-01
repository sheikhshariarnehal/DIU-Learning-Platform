"use client"

import { memo, useState, useCallback, useEffect } from "react"
import { Play, FileText, ExternalLink, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// ============================================================================
// TYPES
// ============================================================================

interface Video {
  id: string
  title: string
  youtube_url: string | null
  duration_minutes?: number
}

interface Slide {
  id: string
  title: string
  file_url: string
  file_size?: number
}

interface ContentItemCache {
  data: any
  timestamp: number
  thumbnail?: string
}

// ============================================================================
// CACHING SYSTEM
// ============================================================================

// Content metadata cache with 10-minute TTL
const contentCache = new Map<string, ContentItemCache>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Thumbnail cache for faster rendering
const thumbnailCache = new Map<string, string>()

// Check if cache is valid
const isCacheValid = (cacheItem: ContentItemCache | undefined): boolean => {
  if (!cacheItem) return false
  return Date.now() - cacheItem.timestamp < CACHE_TTL
}

// Get cached content
const getCachedContent = (id: string): ContentItemCache | null => {
  const cached = contentCache.get(id)
  if (cached && isCacheValid(cached)) {
    return cached
  }
  contentCache.delete(id)
  return null
}

// Set content cache
const setCachedContent = (id: string, data: any, thumbnail?: string) => {
  contentCache.set(id, {
    data,
    timestamp: Date.now(),
    thumbnail
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' = 'mqdefault'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

// Get file extension and type
const getFileInfo = (url: string): { ext: string; type: string; icon: string } => {
  const ext = url.split('.').pop()?.toLowerCase() || ''
  
  if (ext === 'pdf') return { ext, type: 'PDF Document', icon: '📄' }
  if (['ppt', 'pptx'].includes(ext)) return { ext, type: 'PowerPoint', icon: '📊' }
  if (['doc', 'docx'].includes(ext)) return { ext, type: 'Word Document', icon: '📝' }
  if (['xls', 'xlsx'].includes(ext)) return { ext, type: 'Excel Spreadsheet', icon: '📈' }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return { ext, type: 'Image', icon: '🖼️' }
  
  return { ext, type: 'File', icon: '📁' }
}

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Format duration
const formatDuration = (minutes?: number): string => {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// ============================================================================
// ENHANCED VIDEO ITEM
// ============================================================================

export const EnhancedVideoItem = memo(({ 
  video, 
  isSelected, 
  isMobile, 
  onSelect,
  showThumbnail = false
}: {
  video: Video
  isSelected: boolean
  isMobile: boolean
  onSelect: () => void
  showThumbnail?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [prefetched, setPrefetched] = useState(false)

  // Extract video ID on mount
  const videoId = video.youtube_url ? extractYouTubeId(video.youtube_url) : null

  // Prefetch thumbnail on hover
  useEffect(() => {
    if (!isHovered || !videoId || prefetched || isMobile) return

    const timer = setTimeout(() => {
      // Check cache first
      const cached = thumbnailCache.get(videoId)
      if (cached) {
        setThumbnail(cached)
        setPrefetched(true)
        return
      }

      // Prefetch thumbnail
      const thumbnailUrl = getYouTubeThumbnail(videoId)
      const img = new Image()
      img.onload = () => {
        thumbnailCache.set(videoId, thumbnailUrl)
        setThumbnail(thumbnailUrl)
        setPrefetched(true)
      }
      img.src = thumbnailUrl
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [isHovered, videoId, prefetched, isMobile])

  const handleMouseEnter = useCallback(() => {
    if (isMobile || isSelected) return
    setIsHovered(true)
  }, [isMobile, isSelected])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleClick = useCallback(() => {
    setIsLoading(true)
    // Optimistic UI update
    setTimeout(() => {
      onSelect()
      setIsLoading(false)
    }, 50)
  }, [onSelect])

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-2 py-2'} h-auto rounded-md group transition-all duration-200 touch-manipulation min-w-0 will-change-transform ${
        isSelected
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm scale-[1.01]"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isLoading}
    >
      <div className="flex items-start gap-2.5 w-full min-w-0">
        {/* Icon/Thumbnail */}
        <div className={`relative flex-shrink-0 ${isHovered && !isSelected ? 'animate-pulse' : ''}`}>
          {showThumbnail && thumbnail && !isLoading ? (
            <div className="w-12 h-9 rounded overflow-hidden">
              <img 
                src={thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Play 
              className={`h-3.5 w-3.5 mt-0.5 transition-all duration-200 ${
                isSelected 
                  ? "text-red-500 fill-red-500/20" 
                  : isHovered 
                    ? "text-red-500 fill-red-500/10" 
                    : "text-red-400"
              } ${isLoading ? 'animate-spin' : ''}`} 
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span 
            className={`text-xs ${isMobile ? 'text-sm' : 'text-xs'} leading-relaxed break-words min-w-0 transition-colors duration-200 ${
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
          
          {/* Duration badge */}
          {video.duration_minutes && (
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {formatDuration(video.duration_minutes)}
            </span>
          )}
        </div>

        {/* Hover info */}
        {isHovered && !isSelected && !isMobile && (
          <div className="flex items-center gap-1 flex-shrink-0 animate-in fade-in duration-200">
            <span className="text-[10px] text-muted-foreground font-medium">Video</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
    </Button>
  )
})

EnhancedVideoItem.displayName = "EnhancedVideoItem"

// ============================================================================
// ENHANCED SLIDE ITEM
// ============================================================================

export const EnhancedSlideItem = memo(({ 
  slide, 
  isSelected, 
  isMobile, 
  onSelect,
  showFileInfo = true
}: {
  slide: Slide
  isSelected: boolean
  isMobile: boolean
  onSelect: () => void
  showFileInfo?: boolean
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [prefetched, setPrefetched] = useState(false)

  const fileInfo = getFileInfo(slide.file_url)

  // Prefetch file on hover
  useEffect(() => {
    if (!isHovered || prefetched || isMobile) return

    const timer = setTimeout(() => {
      // Check cache first
      const cached = getCachedContent(slide.id)
      if (cached) {
        setPrefetched(true)
        return
      }

      // Prefetch file URL (HEAD request for faster validation)
      fetch(slide.file_url, { method: 'HEAD' })
        .then(() => {
          setCachedContent(slide.id, { prefetched: true })
          setPrefetched(true)
        })
        .catch(() => {})
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [isHovered, slide.id, slide.file_url, prefetched, isMobile])

  const handleMouseEnter = useCallback(() => {
    if (isMobile || isSelected) return
    setIsHovered(true)
  }, [isMobile, isSelected])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleClick = useCallback(() => {
    setIsLoading(true)
    // Optimistic UI update
    setTimeout(() => {
      onSelect()
      setIsLoading(false)
    }, 50)
  }, [onSelect])

  return (
    <Button
      variant="ghost"
      className={`w-full justify-start text-left ${isMobile ? 'px-2 py-2.5 min-h-[40px]' : 'px-2 py-2'} h-auto rounded-md group transition-all duration-200 touch-manipulation min-w-0 will-change-transform ${
        isSelected
          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm scale-[1.01]"
          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:scale-[1.02] active:scale-[0.98]"
      }`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={isLoading}
    >
      <div className="flex items-start gap-2.5 w-full min-w-0">
        {/* Icon */}
        <div className={`relative flex-shrink-0 ${isHovered && !isSelected ? 'animate-pulse' : ''}`}>
          <FileText 
            className={`h-3.5 w-3.5 mt-0.5 transition-all duration-200 ${
              isSelected 
                ? "text-blue-500 fill-blue-500/20" 
                : isHovered 
                  ? "text-blue-500 fill-blue-500/10" 
                  : "text-blue-400"
            } ${isLoading ? 'animate-pulse' : ''}`} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span 
            className={`text-xs ${isMobile ? 'text-sm' : 'text-xs'} leading-relaxed break-words min-w-0 transition-colors duration-200 ${
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
          
          {/* File size badge */}
          {showFileInfo && slide.file_size && (
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {formatFileSize(slide.file_size)}
            </span>
          )}
        </div>

        {/* Hover info */}
        {isHovered && !isSelected && !isMobile && (
          <div className="flex items-center gap-1.5 flex-shrink-0 animate-in fade-in duration-200">
            <span className="text-[10px] text-muted-foreground font-medium">
              {fileInfo.type}
            </span>
            <Download className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
    </Button>
  )
})

EnhancedSlideItem.displayName = "EnhancedSlideItem"

// ============================================================================
// SKELETON LOADERS
// ============================================================================

export const VideoItemSkeleton = memo(({ isMobile }: { isMobile?: boolean }) => (
  <div className={`w-full ${isMobile ? 'px-2 py-2.5' : 'px-2 py-2'} flex items-start gap-2.5`}>
    <Skeleton className="h-3.5 w-3.5 rounded flex-shrink-0 mt-0.5" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-3 w-[85%]" />
      <Skeleton className="h-2 w-12" />
    </div>
  </div>
))

VideoItemSkeleton.displayName = "VideoItemSkeleton"

export const SlideItemSkeleton = memo(({ isMobile }: { isMobile?: boolean }) => (
  <div className={`w-full ${isMobile ? 'px-2 py-2.5' : 'px-2 py-2'} flex items-start gap-2.5`}>
    <Skeleton className="h-3.5 w-3.5 rounded flex-shrink-0 mt-0.5" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-3 w-[90%]" />
      <Skeleton className="h-2 w-16" />
    </div>
  </div>
))

SlideItemSkeleton.displayName = "SlideItemSkeleton"

// ============================================================================
// CACHE UTILITIES (Export for external use)
// ============================================================================

export const contentCacheUtils = {
  // Clear all caches
  clearAll: () => {
    contentCache.clear()
    thumbnailCache.clear()
  },
  
  // Clear specific item
  clearItem: (id: string) => {
    contentCache.delete(id)
  },
  
  // Get cache stats
  getStats: () => ({
    contentCacheSize: contentCache.size,
    thumbnailCacheSize: thumbnailCache.size,
    totalSize: contentCache.size + thumbnailCache.size
  }),
  
  // Preload thumbnails for videos
  preloadThumbnails: async (videos: Video[]) => {
    const promises = videos.map(video => {
      if (!video.youtube_url) return Promise.resolve()
      
      const videoId = extractYouTubeId(video.youtube_url)
      if (!videoId || thumbnailCache.has(videoId)) return Promise.resolve()
      
      return new Promise<void>((resolve) => {
        const thumbnailUrl = getYouTubeThumbnail(videoId)
        const img = new Image()
        img.onload = () => {
          thumbnailCache.set(videoId, thumbnailUrl)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = thumbnailUrl
      })
    })
    
    return Promise.all(promises)
  },
  
  // Prefetch slides
  prefetchSlides: async (slides: Slide[]) => {
    const promises = slides.map(slide => {
      if (getCachedContent(slide.id)) return Promise.resolve()
      
      return fetch(slide.file_url, { method: 'HEAD' })
        .then(() => setCachedContent(slide.id, { prefetched: true }))
        .catch(() => {})
    })
    
    return Promise.all(promises)
  }
}
