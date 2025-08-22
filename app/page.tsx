"use client"

import { useState, useEffect } from "react"
import { Bell, Sun, User, Download, Maximize, ExternalLink, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FunctionalSidebar } from "@/components/functional-sidebar"
import { ContentViewer } from "@/components/content-viewer"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useTheme } from "next-themes"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // Close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  const handleContentSelect = async (content: ContentItem) => {
    setIsLoading(true)
    try {
      // Log content access for analytics
      await fetch("/api/analytics/content-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: content.id,
          contentType: content.type,
          timestamp: new Date().toISOString(),
        }),
      })

      setSelectedContent(content)

      // Close sidebar on mobile after selection
      if (isMobile) {
        setSidebarOpen(false)
      }

      toast({
        title: "Content Loaded",
        description: `Now viewing: ${content.title}`,
      })
    } catch (error) {
      console.error("Error loading content:", error)
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

      // Log download action
      await fetch("/api/analytics/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: selectedContent.id,
          contentType: selectedContent.type,
          timestamp: new Date().toISOString(),
        }),
      })

      toast({
        title: "Download Started",
        description: `Opening ${selectedContent.title}`,
      })
    } catch (error) {
      console.error("Download error:", error)
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
      <header className="glass border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-18 items-center justify-between">
            {/* Left Section - Logo and Mobile Menu */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hover-lift focus-ring mr-2 h-9 w-9"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}

              {/* Logo Section */}
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20">
                  <img
                    src="/images/diu-logo.png"
                    alt="Daffodil International University Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg lg:text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    DIU CSE
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">Learning Platform</span>
                </div>
              </div>
            </div>

            {/* Center Section - Navigation (Hidden on mobile) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Button variant="ghost" className="hover-lift focus-ring text-sm font-medium px-4 py-2 rounded-lg">
                Home
              </Button>
              <Button variant="ghost" className="hover-lift focus-ring text-sm font-medium px-4 py-2 rounded-lg">
                People
              </Button>
              <Button className="btn-primary-modern text-sm px-6 py-2 rounded-lg font-medium">Video Lecture</Button>
              <Button variant="ghost" className="hover-lift focus-ring text-sm font-medium px-4 py-2 rounded-lg">
                Result
              </Button>
            </nav>

            {/* Right Section - Controls */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover-lift focus-ring w-9 h-9 lg:w-10 lg:h-10 rounded-lg"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 lg:h-5 lg:w-5" />
                ) : (
                  <Moon className="h-4 w-4 lg:h-5 lg:w-5" />
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="hover-lift focus-ring relative w-9 h-9 lg:w-10 lg:h-10 rounded-lg"
                title="Notifications"
              >
                <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-pulse-subtle"></span>
              </Button>

              {/* Login Button */}
              <Button className="btn-primary-modern font-medium px-4 py-2 lg:px-6 lg:py-2 text-sm rounded-lg hidden sm:flex">
                Log In
              </Button>

              {/* User Avatar */}
              <div className="w-8 h-8 lg:w-9 lg:h-9 bg-muted rounded-full flex items-center justify-center border-2 border-border hover:border-primary/50 transition-colors">
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              </div>

              {/* Mobile Login (visible only on small screens) */}
              <Button className="btn-primary-modern font-medium px-3 py-1 text-xs rounded-lg sm:hidden">Login</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-background min-w-0 relative">
          {selectedContent ? (
            <>
              {/* Content Viewer */}
              <div className="flex-1 p-1 sm:p-3 md:p-4 lg:p-6 overflow-hidden">
                <div className="h-full rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-modern-lg border border-border animate-fade-in">
                  <ContentViewer content={selectedContent} isLoading={isLoading} />
                </div>
              </div>

              {/* Bottom Controls - Enhanced for mobile */}
              <div className="bg-card/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-t border-border/50 shadow-lg">
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
                      <span className="text-muted-foreground text-xs sm:text-sm truncate">
                        {selectedContent.courseTitle}
                        {selectedContent.topicTitle && ` • ${selectedContent.topicTitle}`}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                      disabled={isLoading}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">
                        {selectedContent.type === "video" ? "Watch" : "Download"}
                      </span>
                      <span className="xs:hidden">
                        {selectedContent.type === "video" ? "▶" : "↓"}
                      </span>
                    </Button>
                    {!isMobile && (
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
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedContent.url, "_blank")}
                      className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 touch-manipulation"
                      disabled={isLoading}
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Open</span>
                      <span className="xs:hidden">↗</span>
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

                {/* Mobile CTA Button */}
                {isMobile && (
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation"
                  >
                    <Menu className="h-5 w-5 mr-3" />
                    Browse Courses
                  </Button>
                )}

                {/* Desktop hint */}
                {!isMobile && (
                  <div className="text-xs text-muted-foreground/70 mt-4">
                    Use the sidebar to navigate through semesters and courses
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Right side for desktop, overlay for mobile */}
        <div
          className={`
            ${isMobile ? "fixed inset-y-0 left-0 z-40" : "relative"}
            ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
            transition-transform duration-300 ease-in-out
            ${isMobile ? "w-[85vw] max-w-sm top-14" : "w-80 lg:w-96 xl:w-[28rem]"}
            bg-card/95 backdrop-blur-sm ${isMobile ? "border-r shadow-2xl" : "border-l"} border-border flex-shrink-0
          `}
        >
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="relative z-40 h-full bg-card">
            <FunctionalSidebar
            onContentSelect={handleContentSelect}
            selectedContentId={selectedContent?.id}
          />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
