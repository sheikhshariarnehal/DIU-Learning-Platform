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
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()

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
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} mode`,
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-gradient-surface backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-modern-md">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent mr-1"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}

            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-modern-sm">
              <span className="text-white font-bold text-xs sm:text-sm">DIU</span>
            </div>
            <span className="font-semibold text-sm sm:text-lg text-foreground">DIU CSE</span>
          </div>

          {/* Center Section - Navigation (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent text-sm transition-modern">
              Home
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent text-sm transition-modern">
              People
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 text-white border-0 rounded-lg px-4 py-2 text-sm shadow-modern-sm transition-modern hover-lift">
              Video Lecture
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent text-sm transition-modern">
              Result
            </Button>
          </nav>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-accent w-8 h-8 sm:w-10 sm:h-10 transition-modern hover-lift rounded-lg"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent relative w-8 h-8 sm:w-10 sm:h-10 transition-modern hover-lift rounded-lg"
              title="Notifications"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-accent rounded-full shadow-modern-sm"></span>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm">
              Log In
            </Button>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-gradient-surface min-w-0">
          {selectedContent ? (
            <>
              {/* Content Viewer */}
              <div className="flex-1 p-2 sm:p-4 lg:p-6">
                <div className="modern-card bg-card rounded-xl p-4 sm:p-6 h-full shadow-modern-lg">
                  <ContentViewer content={selectedContent} isLoading={isLoading} />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="bg-gradient-secondary px-3 sm:px-6 py-3 sm:py-4 border-t border-border shadow-modern-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <span className="text-foreground text-xs sm:text-sm font-medium">
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
                      className="flex-1 sm:flex-none text-xs sm:text-sm bg-gradient-primary text-white border-0 hover:opacity-90 transition-modern hover-lift shadow-modern-sm"
                      disabled={isLoading}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {selectedContent.type === "video" ? "Watch" : "Download"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFullscreen}
                      className="flex-1 sm:flex-none text-xs sm:text-sm bg-gradient-accent text-white border-0 hover:opacity-90 transition-modern hover-lift shadow-modern-sm"
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
                      className="flex-1 sm:flex-none text-xs sm:text-sm bg-gradient-secondary border border-border hover:bg-gradient-primary hover:text-white transition-modern hover-lift shadow-modern-sm"
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
            <div className="flex items-center justify-center h-full p-4 bg-gradient-surface">
              <div className="text-center max-w-sm sm:max-w-md">
                <div className="modern-card bg-gradient-primary w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-modern-lg hover-lift">
                  <span className="text-white font-bold text-xl sm:text-3xl">DIU</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                  Welcome to DIU CSE Learning Platform
                </h2>
                <div className="modern-card bg-card/50 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-modern-md">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    Select a course from the sidebar to start viewing slides, videos, and study materials
                  </p>
                  <div className="text-xs sm:text-sm text-muted-foreground/70">
                    Choose from available semesters and explore course content
                  </div>
                </div>

                {/* Mobile CTA Button */}
                {isMobile && (
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    className="mt-6 w-full bg-gradient-primary hover:opacity-90 text-white border-0 rounded-xl py-3 transition-modern hover-lift shadow-modern-md"
                  >
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
            bg-sidebar ${isMobile ? "border-r" : "border-l"} border-sidebar-border flex-shrink-0 shadow-modern-lg
          `}
        >
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="relative z-40 h-full bg-gradient-secondary">
            <FunctionalSidebar onContentSelect={handleContentSelect} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
