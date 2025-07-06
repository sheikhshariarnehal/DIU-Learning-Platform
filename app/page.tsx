"use client"

import { useState, useEffect } from "react"
import { Bell, Sun, User, Download, Maximize, ExternalLink, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {selectedContent ? (
            <>
              {/* Content Viewer */}
              <div className="flex-1 p-2 sm:p-4 lg:p-6">
                <div className="h-full rounded-xl overflow-hidden shadow-modern-lg border border-modern animate-fade-in">
                  <ContentViewer content={selectedContent} isLoading={isLoading} />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="glass-dark px-3 sm:px-6 py-3 sm:py-4 border-t border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <span className="badge-primary font-medium">
                      {selectedContent.type === "slide"
                        ? "Slide Presentation"
                        : selectedContent.type === "video"
                          ? "Video Content"
                          : "Document"}
                    </span>
                    {selectedContent.courseTitle && (
                      <span className="text-muted-foreground text-xs truncate">
                        {selectedContent.courseTitle}
                        {selectedContent.topicTitle && ` • ${selectedContent.topicTitle}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="btn-secondary-modern flex-1 sm:flex-none text-xs sm:text-sm bg-transparent"
                      disabled={isLoading}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {selectedContent.type === "video" ? "Watch" : "Download"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFullscreen}
                      className="btn-secondary-modern flex-1 sm:flex-none text-xs sm:text-sm bg-transparent"
                      disabled={isLoading}
                    >
                      <Maximize className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Fullscreen</span>
                      <span className="sm:hidden">Full</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedContent.url, "_blank")}
                      className="btn-secondary-modern flex-1 sm:flex-none text-xs sm:text-sm"
                      disabled={isLoading}
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-sm sm:max-w-md animate-slide-up">
                <div className="w-12 h-12 sm:w-16 sm:h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary-lg">
                  <span className="text-primary-foreground font-bold text-lg sm:text-2xl">DIU</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                  Welcome to DIU CSE Learning Platform
                </h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Select a course from the sidebar to start viewing slides, videos, and study materials
                </p>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Choose from available semesters and explore course content
                </div>

                {/* Mobile CTA Button */}
                {isMobile && (
                  <Button onClick={() => setSidebarOpen(true)} className="mt-6 w-full btn-primary-modern">
                    <Menu className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
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
            ${isMobile ? "w-80 top-14" : "w-80"}
            bg-card ${isMobile ? "border-r" : "border-l"} border-border flex-shrink-0
          `}
        >
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="relative z-40 h-full bg-card">
            <FunctionalSidebar onContentSelect={handleContentSelect} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
