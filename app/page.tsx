"use client"

import { useState, useEffect } from "react"
import { Bell, Sun, User, Download, Maximize, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FunctionalSidebar } from "@/components/functional-sidebar"
import { ContentViewer } from "@/components/content-viewer"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useTheme } from "next-themes"
import { trackContentEvent, trackDownloadEvent, trackError } from "@/lib/analytics"

interface ContentItem {
  type: "slide" | "video" | "document"
  title: string
  url: string
  id: string
  topicTitle?: string
  courseTitle?: string
}

export default function HomePage() {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize with default content if available
  useEffect(() => {
    const initializeDefaultContent = async () => {
      try {
        const response = await fetch("/api/content/default")
        if (response.ok) {
          const defaultContent = await response.json()
          if (defaultContent) {
            setSelectedContent(defaultContent)
          }
        }
      } catch (error) {
        console.error("Failed to load default content:", error)
      }
    }

    initializeDefaultContent()
  }, [])

  // Mobile layout doesn't need sidebar state management

  const handleContentSelect = async (content: ContentItem) => {
    setIsLoading(true)
    try {
      // Log content access for analytics (both internal and Vercel Analytics)
      await trackContentEvent({
        contentId: content.id,
        contentType: content.type === "document" ? "slide" : content.type,
        action: "view",
        metadata: {
          title: content.title,
          topicTitle: content.topicTitle,
          courseTitle: content.courseTitle,
        },
      })

      setSelectedContent(content)

      // Mobile layout doesn't need sidebar closing

      toast({
        title: "Content Loaded",
        description: `Now viewing: ${content.title}`,
      })
    } catch (error) {
      console.error("Error loading content:", error)
      trackError("Content loading failed", {
        contentId: content.id,
        contentType: content.type,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!selectedContent) return

    try {
      if (selectedContent.type === "video") {
        // For YouTube videos, open the video page
        const videoId =
          selectedContent.url.match(/embed\/([^?]+)/)?.[1] ||
          selectedContent.url.match(/v=([^&]+)/)?.[1] ||
          selectedContent.url.match(/youtu\.be\/([^?]+)/)?.[1]
        if (videoId) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
        } else {
          window.open(selectedContent.url, "_blank")
        }
      } else {
        // For Google Drive files, trigger download
        const fileId = selectedContent.url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, "_blank")
        } else {
          window.open(selectedContent.url, "_blank")
        }
      }

      // Log download action (both internal and Vercel Analytics)
      await trackDownloadEvent({
        contentId: selectedContent.id,
        contentType: selectedContent.type === "document" ? "slide" : selectedContent.type,
        metadata: {
          title: selectedContent.title,
          topicTitle: selectedContent.topicTitle,
          courseTitle: selectedContent.courseTitle,
        },
      })

      toast({
        title: "Download Started",
        description: `Opening ${selectedContent.title}`,
      })
    } catch (error) {
      console.error("Download error:", error)
      trackError("Download failed", {
        contentId: selectedContent.id,
        contentType: selectedContent.type,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast({
        title: "Download Failed",
        description: "Unable to download content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFullscreen = () => {
    if (!selectedContent) return

    try {
      if (selectedContent.type === "video") {
        // For videos, open YouTube in new tab
        const videoId =
          selectedContent.url.match(/embed\/([^?]+)/)?.[1] ||
          selectedContent.url.match(/v=([^&]+)/)?.[1] ||
          selectedContent.url.match(/youtu\.be\/([^?]+)/)?.[1]
        if (videoId) {
          window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
        } else {
          window.open(selectedContent.url, "_blank")
        }
      } else {
        const iframe = document.querySelector("iframe")
        if (iframe && iframe.requestFullscreen) {
          iframe.requestFullscreen()
        } else {
          window.open(selectedContent.url, "_blank")
        }
      }

      toast({
        title: "Fullscreen Mode",
        description: "Content opened in fullscreen",
      })
    } catch (error) {
      console.error("Fullscreen error:", error)
      toast({
        title: "Fullscreen Failed",
        description: "Unable to open in fullscreen mode",
        variant: "destructive",
      })
    }
  }

  const toggleTheme = () => {
    if (!mounted) return
    setTheme(theme === "dark" ? "light" : "dark")

    toast({
      title: "Theme Changed",
      description: `Switched to ${theme === "dark" ? "light" : "dark"} mode`,
    })
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm bg-background/95 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Logo Section */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
                  <img
                    src="/images/diu-logo.png"
                    alt="Daffodil International University Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-foreground">
                    DIU CSE
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">Learning Platform</span>
                </div>
              </div>
            </div>

            {/* Center Section - Navigation (Hidden on mobile) */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent transition-colors">
                Home
              </Button>
              <Button variant="ghost" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent transition-colors">
                Notes
              </Button>
              <Button variant="default" className="text-sm px-6 py-2 rounded-md font-medium bg-primary hover:bg-primary/90">
                Video Lecture
              </Button>
              <Button variant="ghost" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent transition-colors">
                Result
              </Button>
            </nav>

            {/* Right Section - Controls */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-md hover:bg-accent transition-colors"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-md hover:bg-accent transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>

              {/* Profile Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full hover:bg-accent transition-colors"
                title="Profile"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`${isMobile ? 'flex flex-col h-[calc(100vh-3.5rem)]' : 'flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden'}`}>
        {/* Mobile Layout: Content at top, sidebar below */}
        {isMobile ? (
          <>
            {/* Content Area - Mobile (YouTube-like aspect ratio) */}
            <div className="flex-none bg-background">
              {selectedContent ? (
                <>
                  {/* Content Viewer - Clean Mobile Design */}
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <div className="absolute inset-0 overflow-hidden bg-black">
                      <ContentViewer content={selectedContent} isLoading={isLoading} />
                    </div>
                  </div>

                  {/* Content Info - Minimal Mobile Design */}
                  <div className="bg-background px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {selectedContent.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {selectedContent.topicTitle || selectedContent.courseTitle}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ml-3 flex-shrink-0 ${
                        selectedContent.type === "video"
                          ? "bg-red-500"
                          : selectedContent.type === "slide"
                            ? "bg-blue-500"
                            : "bg-green-500"
                      }`}></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 bg-background">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-muted-foreground font-semibold text-xl">DIU</span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Select content from courses below
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Functional Sidebar - Mobile (below content) */}
            <div className="flex-1 bg-card border-t border-border overflow-hidden">
              <FunctionalSidebar
                onContentSelect={handleContentSelect}
                selectedContentId={selectedContent?.id}
              />
            </div>
          </>
        ) : (
          /* Desktop Layout: Side-by-side */
          <>
            {/* Content Area - Desktop */}
            <div className="flex-1 flex flex-col bg-background min-w-0 relative">
              {selectedContent ? (
                <>
                  {/* Content Viewer - Desktop */}
                  <div className="flex-1 p-0.5 sm:p-1 md:p-3 lg:p-4 xl:p-6 overflow-hidden">
                    <div className="h-full rounded-md sm:rounded-lg md:rounded-xl overflow-hidden shadow-md sm:shadow-lg md:shadow-modern-lg border border-border animate-fade-in">
                      <ContentViewer content={selectedContent} isLoading={isLoading} />
                    </div>
                  </div>

                  {/* Bottom Controls - Desktop */}
                  <div className="bg-card/95 backdrop-blur-sm px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t border-border/50 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      {/* Content Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0 flex-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium w-fit ${
                            selectedContent.type === "video"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : selectedContent.type === "slide"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {selectedContent.type === "slide"
                            ? "Slide Presentation"
                            : selectedContent.type === "video"
                              ? "Video Content"
                              : "Document"}
                        </Badge>
                        {selectedContent.courseTitle && (
                          <span className="text-muted-foreground text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                            {selectedContent.courseTitle}
                            {selectedContent.topicTitle && ` • ${selectedContent.topicTitle}`}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons - Desktop */}
                      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 touch-manipulation min-w-0"
                          disabled={isLoading}
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="hidden xs:inline truncate">
                            {selectedContent.type === "video" ? "Watch" : "Download"}
                          </span>
                          <span className="xs:hidden">
                            {selectedContent.type === "video" ? "▶" : "Download"}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFullscreen}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                          disabled={isLoading}
                        >
                          <Maximize className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Fullscreen</span>
                          <span className="sm:hidden">Full</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full p-4 sm:p-6 lg:p-8">
                  <div className="text-center max-w-sm sm:max-w-md lg:max-w-lg animate-slide-up">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-primary-lg transform hover:scale-105 transition-transform duration-300">
                      <span className="text-primary-foreground font-bold text-xl sm:text-2xl lg:text-3xl">DIU</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent mb-4 leading-tight">
                      Welcome to DIU CSE Learning Platform
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 text-sm sm:text-base lg:text-lg leading-relaxed">
                      Access your course materials, watch video lectures, and study with interactive content
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs sm:text-sm">
                      <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                          <span className="text-blue-600 dark:text-blue-400 text-sm">📊</span>
                        </div>
                        <span className="text-muted-foreground">Slides</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                          <span className="text-red-600 dark:text-red-400 text-sm">🎥</span>
                        </div>
                        <span className="text-muted-foreground">Videos</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-card/50 rounded-lg border border-border/50">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                          <span className="text-green-600 dark:text-green-400 text-sm">📚</span>
                        </div>
                        <span className="text-muted-foreground">Documents</span>
                      </div>
                    </div>

                    {/* Desktop hint */}
                    <div className="text-xs text-muted-foreground/70 mt-4">
                      Use the sidebar to navigate through semesters and courses
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Desktop (right side) */}
            <div className="relative w-80 lg:w-96 xl:w-[28rem] bg-card/95 backdrop-blur-sm border-l border-border flex-shrink-0">
              <div className="h-full bg-card">
                <FunctionalSidebar
                  onContentSelect={handleContentSelect}
                  selectedContentId={selectedContent?.id}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Toaster />
    </div>
  )
}
