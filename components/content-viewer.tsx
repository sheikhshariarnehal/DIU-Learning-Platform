"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, FileText, Play, BookOpen, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ContentItem {
  type: "slide" | "video" | "document"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
}

interface ContentViewerProps {
  content: ContentItem
  isLoading?: boolean
}

export function ContentViewer({ content, isLoading = false }: ContentViewerProps) {
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    setIframeLoading(true)
    setIframeError(false)
  }, [content.url])

  const handleIframeLoad = () => {
    setIframeLoading(false)
  }

  const handleIframeError = () => {
    setIframeLoading(false)
    setIframeError(true)
  }

  const getContentIcon = () => {
    switch (content.type) {
      case "video":
        return <Play className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-400" />
      case "slide":
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400" />
      case "document":
        return <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400" />
      default:
        return <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-slate-400" />
    }
  }

  // Fix YouTube URL format
  const getEmbedUrl = (url: string, type: string) => {
    if (type === "video") {
      // Handle various YouTube URL formats
      let videoId = ""

      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0]
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0]
      } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("embed/")[1]?.split("?")[0]
      } else if (url.includes("youtube.com/v/")) {
        videoId = url.split("v/")[1]?.split("?")[0]
      }

      if (videoId) {
        // Return proper embed URL with necessary parameters
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}&rel=0&modestbranding=1`
      }

      // If it's already an embed URL, ensure it has proper parameters
      if (url.includes("youtube.com/embed/")) {
        const baseUrl = url.split("?")[0]
        return `${baseUrl}?enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}&rel=0&modestbranding=1`
      }
    }

    return url
  }

  const openInNewTab = () => {
    if (content.type === "video") {
      // Convert embed URL back to watch URL for better user experience
      const videoId = content.url.match(/embed\/([^?]+)/)?.[1]
      if (videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
        return
      }
    }
    window.open(content.url, "_blank")
  }

  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-lg overflow-hidden shadow-lg sm:shadow-2xl flex items-center justify-center">
        <div className="text-center p-4">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-sm sm:text-base">Loading content...</p>
        </div>
      </div>
    )
  }

  const embedUrl = getEmbedUrl(content.url, content.type)

  return (
    <div className="h-full bg-white rounded-lg overflow-hidden shadow-lg sm:shadow-2xl relative">
      {/* Content Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-4">
        <div className="flex items-start justify-between text-white gap-2">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
            {getContentIcon()}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm sm:text-base leading-tight line-clamp-2">{content.title}</h3>
              {content.topicTitle && (
                <p className="text-xs sm:text-sm opacity-75 mt-1 truncate">{content.topicTitle}</p>
              )}
              {content.courseTitle && <p className="text-xs opacity-60 truncate">{content.courseTitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-1 ${
                content.type === "video"
                  ? "bg-red-100 text-red-800"
                  : content.type === "slide"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {content.type}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="text-white hover:bg-white/20 p-1.5 sm:p-2 h-auto"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {iframeLoading && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="text-center p-4">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-sm sm:text-base">Loading {content.type}...</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getContentIcon()}
              <span className="text-sm text-slate-500 truncate max-w-xs">{content.title}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {iframeError && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10 p-4 sm:p-6">
          <div className="text-center max-w-sm sm:max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">Content Unavailable</h3>
            <p className="text-slate-600 mb-4 text-sm sm:text-base">
              Unable to load this {content.type}. This might be due to:
            </p>
            <ul className="text-sm text-slate-500 text-left space-y-1 mb-4">
              <li>• Content is private or restricted</li>
              <li>• Network connectivity issues</li>
              <li>• Invalid or expired link</li>
              {content.type === "video" && <li>• Video embedding is disabled</li>}
            </ul>
            <div className="space-y-3">
              <Alert className="bg-yellow-50 border-yellow-200 text-left">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  Try opening the content in a new tab using the button below.
                </AlertDescription>
              </Alert>
              <Button onClick={openInNewTab} className="w-full touch-manipulation">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content iframe */}
      {content.type === "video" ? (
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={content.title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          title={content.title}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  )
}
