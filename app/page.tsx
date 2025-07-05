"use client"

import { useState, useEffect } from "react"
import { Bell, Sun, User, Download, Maximize, ExternalLink, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FunctionalSidebar } from "@/components/functional-sidebar"
import { ContentViewer } from "@/components/content-viewer"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useIsMobile } from "@/components/ui/use-mobile"

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
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()

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
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark", !isDarkMode)

    // Save theme preference
    localStorage.setItem("theme", !isDarkMode ? "dark" : "light")

    toast({
      title: "Theme Changed",
      description: `Switched to ${!isDarkMode ? "dark" : "light"} mode`,
    })
  }

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      const isDark = savedTheme === "dark"
      setIsDarkMode(isDark)
      document.documentElement.classList.toggle("dark", isDark)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 sticky top-0 z-50">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-300 hover:text-white hover:bg-slate-800 mr-1"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}

            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">DIU</span>
            </div>
            <span className="font-semibold text-sm sm:text-lg text-white">DIU CSE</span>
          </div>

          {/* Center Section - Navigation (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm">
              Home
            </Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm">
              People
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white border border-teal-500 rounded-md px-3 py-2 text-sm">
              Video Lecture
            </Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm">
              Result
            </Button>
          </nav>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-300 hover:text-white hover:bg-slate-800 w-8 h-8 sm:w-10 sm:h-10"
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-300 hover:text-white hover:bg-slate-800 relative w-8 h-8 sm:w-10 sm:h-10"
              title="Notifications"
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-medium px-2 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm">
              Log In
            </Button>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-slate-300" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-slate-800 min-w-0">
          {selectedContent ? (
            <>
              {/* Content Viewer */}
              <div className="flex-1 p-2 sm:p-4 lg:p-6">
                <ContentViewer content={selectedContent} isLoading={isLoading} />
              </div>

              {/* Bottom Controls */}
              <div className="bg-slate-900 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <span className="text-slate-300 text-xs sm:text-sm font-medium">
                      {selectedContent.type === "slide"
                        ? "Slide Presentation"
                        : selectedContent.type === "video"
                          ? "Video Content"
                          : "Document"}
                    </span>
                    {selectedContent.courseTitle && (
                      <span className="text-slate-400 text-xs truncate">
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
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white flex-1 sm:flex-none text-xs sm:text-sm"
                      disabled={isLoading}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {selectedContent.type === "video" ? "Watch" : "Download"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFullscreen}
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white flex-1 sm:flex-none text-xs sm:text-sm"
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
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white flex-1 sm:flex-none text-xs sm:text-sm"
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
              <div className="text-center max-w-sm sm:max-w-md">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-400 font-bold text-lg sm:text-2xl">DIU</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-semibold text-teal-400 mb-2">
                  Welcome to DIU CSE Learning Platform
                </h2>
                <p className="text-slate-400 mb-4 text-sm sm:text-base">
                  Select a course from the sidebar to start viewing slides, videos, and study materials
                </p>
                <div className="text-xs sm:text-sm text-slate-500">
                  Choose from available semesters and explore course content
                </div>

                {/* Mobile CTA Button */}
                {isMobile && (
                  <Button onClick={() => setSidebarOpen(true)} className="mt-6 w-full bg-teal-600 hover:bg-teal-700">
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
            bg-slate-900 ${isMobile ? "border-r" : "border-l"} border-slate-700 flex-shrink-0
          `}
        >
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="relative z-40 h-full bg-slate-900">
            <FunctionalSidebar onContentSelect={handleContentSelect} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
