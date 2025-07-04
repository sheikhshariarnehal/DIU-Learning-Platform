"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronDown,
  Bell,
  Sun,
  User,
  GraduationCap,
  Menu,
  BookOpen,
  Download,
  FileText,
  FileQuestion,
  Info,
  BarChart,
  Play,
  Presentation,
  Maximize,
  Volume2,
  Settings,
  SkipForward,
  Shield,
  Target,
  AlertTriangle,
  Bug,
  Zap,
  History,
  PenToolIcon as Tool,
  ExternalLink,
  Pause,
  RotateCcw,
} from "lucide-react"
import { transformToFrontendFormat } from "@/lib/supabase"
import { toast } from "sonner"

interface StudyTool {
  id: string
  name: string
  type: "pdf" | "link" | "document"
  url: string
  icon: React.ComponentType<any>
}

interface TopicSlide {
  id: string
  title: string
  url: string
  type: "pdf" | "ppt" | "image"
  order: number
}

interface TopicVideo {
  id: string
  title: string
  url: string
  duration: string
  thumbnail?: string
  type: "youtube" | "vimeo" | "direct"
}

interface Topic {
  id: string
  title: string
  description?: string
  slides: TopicSlide[]
  videos: TopicVideo[]
  // Backward compatibility
  slide?: {
    url: string
    type: "pdf" | "ppt" | "image"
    title?: string
  }
  video?: {
    url: string
    duration: string
    thumbnail?: string
    title?: string
  }
}

interface CourseSection {
  id: string
  name: string
  type: "study-tools" | "topics"
  studyTools?: StudyTool[]
  topics?: Topic[]
}

interface Course {
  code: string
  name: string
  sections: CourseSection[]
}

interface Semester {
  id: string
  name: string
  type: "midterm" | "final"
  courses: Course[]
}

export default function VideoLecturePlatform() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState("midterm")
  const [expandedCourse, setExpandedCourse] = useState<string | null>("CSE423")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<{
    type: "slide" | "video" | "study-tool"
    title: string
    url: string
    duration?: string
    contentType?: string
  } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime, setTotalTime] = useState(100)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await transformToFrontendFormat()
      setSemesters(data)

      // Auto-expand first course's first study tools section
      if (data.length > 0 && data[0].courses.length > 0) {
        const firstCourse = data[0].courses[0]
        setExpandedCourse(firstCourse.code)

        const studyToolsSection = firstCourse.sections.find((s) => s.type === "study-tools")
        if (studyToolsSection) {
          setExpandedSections(new Set([studyToolsSection.id]))
        }
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load course data")
    } finally {
      setLoading(false)
    }
  }

  const currentSemester = semesters.find((s) => s.type === selectedSemester) || semesters[0]

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  const toggleCourse = (courseCode: string) => {
    setExpandedCourse(courseCode === expandedCourse ? null : courseCode)
  }

  const selectContent = (content: {
    type: "slide" | "video" | "study-tool"
    title: string
    url: string
    duration?: string
    contentType?: string
  }) => {
    setSelectedContent(content)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetVideo = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const getTopicIcon = (topicTitle: string) => {
    const title = topicTitle.toLowerCase()
    if (title.includes("security") || title.includes("elements")) return Shield
    if (title.includes("attack")) return Target
    if (title.includes("warfare")) return Zap
    if (title.includes("threat")) return AlertTriangle
    if (title.includes("malware")) return Bug
    if (title.includes("apt")) return Shield
    if (title.includes("history") || title.includes("hacking")) return History
    if (title.includes("exploit") || title.includes("tools")) return Tool
    return BookOpen
  }

  const getStudyToolIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      FileQuestion: FileQuestion,
      FileText: FileText,
      BookOpen: BookOpen,
      BarChart: BarChart,
      Download: Download,
      Info: Info,
    }
    return iconMap[iconName] || FileText
  }

  const isVideoUrl = (url: string) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes(".mp4") ||
      url.includes(".webm")
    )
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  const NavigationItems = ({ mobile = false, onItemClick = () => {} }) => (
    <>
      <Button
        variant="ghost"
        className={`text-slate-300 hover:text-white ${mobile ? "w-full justify-start text-base py-3" : ""}`}
        onClick={onItemClick}
      >
        Home
      </Button>
      <Button
        variant="ghost"
        className={`text-slate-300 hover:text-white ${mobile ? "w-full justify-start text-base py-3" : ""}`}
        onClick={onItemClick}
      >
        People
      </Button>
      <Button
        variant="ghost"
        className={`text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 hover:bg-emerald-400/20 ${mobile ? "w-full justify-start text-base py-3" : ""}`}
        onClick={onItemClick}
      >
        Video Lecture
      </Button>
      <Button
        variant="ghost"
        className={`text-slate-300 hover:text-white ${mobile ? "w-full justify-start text-base py-3" : ""}`}
        onClick={onItemClick}
      >
        Result
      </Button>
    </>
  )

  const ContentViewer = () => {
    if (!selectedContent) {
      return (
        <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
          <div className="text-center px-4">
            <div className="text-emerald-400 text-base sm:text-lg lg:text-xl font-medium">Select Content to View</div>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md">
              Choose a slide, video, or study tool from the course sections to start viewing content
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Content Header */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  {selectedContent.type === "video" && <Play className="w-5 h-5 text-red-400" />}
                  {selectedContent.type === "slide" && <Presentation className="w-5 h-5 text-blue-400" />}
                  {selectedContent.type === "study-tool" && <FileText className="w-5 h-5 text-emerald-400" />}
                  {selectedContent.title}
                </CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  {selectedContent.type === "video" && "Video Lecture"}
                  {selectedContent.type === "slide" && "Slide Presentation"}
                  {selectedContent.type === "study-tool" && "Study Material"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedContent.duration && (
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                    {selectedContent.duration}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-300 border-slate-600 bg-transparent"
                  onClick={() => window.open(selectedContent.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Original
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Display */}
        <div className="bg-slate-800/50 rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-black">
            {selectedContent.type === "video" && isVideoUrl(selectedContent.url) ? (
              <iframe
                src={getEmbedUrl(selectedContent.url)}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedContent.title}
              />
            ) : selectedContent.type === "slide" || selectedContent.contentType === "pdf" ? (
              <iframe
                src={selectedContent.url}
                className="w-full h-full"
                frameBorder="0"
                title={selectedContent.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {selectedContent.type === "video" && <Play className="w-16 h-16 mx-auto text-red-400" />}
                    {selectedContent.type === "slide" && <Presentation className="w-16 h-16 mx-auto text-blue-400" />}
                    {selectedContent.type === "study-tool" && (
                      <FileText className="w-16 h-16 mx-auto text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-white text-xl mb-2">{selectedContent.title}</h3>
                  <p className="text-slate-400 mb-4">Content preview not available</p>
                  <Button
                    onClick={() => window.open(selectedContent.url, "_blank")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          {selectedContent.type === "video" && (
            <div className="bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700" onClick={resetVideo}>
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                    <Volume2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Slide Controls */}
          {selectedContent.type === "slide" && (
            <div className="p-4 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <span className="text-sm">Slide Presentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 bg-transparent">
                    <Maximize className="w-4 h-4 mr-2" />
                    Fullscreen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Study Tool Controls */}
          {selectedContent.type === "study-tool" && (
            <div className="p-4 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <span className="text-sm">Study Material</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-slate-300 border-slate-600 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-slate-300 border-slate-600 bg-transparent"
                    onClick={() => window.open(selectedContent.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open External
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const CourseList = ({ onCourseSelect = () => {} }) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading courses...</p>
        </div>
      )
    }

    if (!currentSemester || !currentSemester.courses.length) {
      return (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No courses available</p>
          <p className="text-slate-500 text-sm">Check back later for updates</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {currentSemester.courses.map((course) => (
          <div key={course.code} className="border border-slate-600/50 rounded-lg overflow-hidden bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
            {/* Main Course Header */}
            <Button
              variant="ghost"
              className={`w-full justify-between p-4 h-auto text-left min-h-[60px] rounded-none ${
                course.code === expandedCourse
                  ? "bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border-b border-blue-500/30 text-white"
                  : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:text-white border-b border-slate-600/30"
              }`}
              onClick={() => {
                toggleCourse(course.code)
                onCourseSelect()
              }}
            >
              <div className="text-sm sm:text-base flex-1">
                <div className="font-medium leading-tight">{course.name}</div>
                <div className="text-xs sm:text-sm opacity-70 mt-1">({course.code})</div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                  {(() => {
                    const totalTopics = course.sections
                      .filter(s => s.type === "topics")
                      .reduce((acc, section) => acc + (section.topics?.length || 0), 0)
                    const totalSlides = course.sections
                      .filter(s => s.type === "topics")
                      .reduce((acc, section) =>
                        acc + (section.topics?.reduce((topicAcc, topic) =>
                          topicAcc + (topic.slides?.length || (topic.slide ? 1 : 0)), 0) || 0), 0)
                    const totalVideos = course.sections
                      .filter(s => s.type === "topics")
                      .reduce((acc, section) =>
                        acc + (section.topics?.reduce((topicAcc, topic) =>
                          topicAcc + (topic.videos?.length || (topic.video ? 1 : 0)), 0) || 0), 0)

                    return (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                        {totalTopics > 0 && (
                          <span className="text-slate-400 bg-slate-700/50 px-1.5 sm:px-2 py-0.5 rounded text-xs whitespace-nowrap">
                            {totalTopics} Topic{totalTopics !== 1 ? 's' : ''}
                          </span>
                        )}
                        {totalSlides > 0 && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded text-xs whitespace-nowrap">
                            {totalSlides} Slide{totalSlides !== 1 ? 's' : ''}
                          </span>
                        )}
                        {totalVideos > 0 && (
                          <span className="text-blue-400 bg-blue-500/10 px-1.5 sm:px-2 py-0.5 rounded text-xs whitespace-nowrap">
                            {totalVideos} Video{totalVideos !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ${
                  expandedCourse === course.code ? "rotate-180" : ""
                }`}
              />
            </Button>

            {expandedCourse === course.code && (
              <div className="bg-slate-800/30">
                {/* Course Sections */}
                <div className="p-2">
                  {course.sections.map((section) => (
                    <div key={section.id} className="mb-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 text-left bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 rounded-md"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-2">
                          {section.type === "study-tools" ? (
                            <Tool className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                          <span className="font-medium">{section.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.has(section.id) ? "rotate-180" : ""
                          }`}
                        />
                      </Button>

                      {expandedSections.has(section.id) && (
                        <div className="ml-4 mt-2 space-y-1">
                          {section.type === "study-tools" &&
                            section.studyTools?.map((tool) => {
                              const IconComponent = getStudyToolIcon(tool.icon as any)
                              return (
                                <Button
                                  key={tool.id}
                                  variant="ghost"
                                  className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700/50 py-2 px-3 text-sm min-h-[36px] rounded-md"
                                  onClick={() => {
                                    selectContent({
                                      type: "study-tool",
                                      title: tool.name,
                                      url: tool.url,
                                      contentType: tool.type,
                                    })
                                    onCourseSelect()
                                  }}
                                >
                                  <IconComponent className="w-3 h-3 mr-2" />
                                  <div className="flex-1 text-left">
                                    <div className="truncate">{tool.name}</div>
                                  </div>
                                </Button>
                              )
                            })}

                          {section.type === "topics" &&
                            section.topics?.map((topic, index) => (
                              <div key={topic.id} className="space-y-1">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-between text-slate-400 hover:text-white hover:bg-slate-700/50 py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] rounded-md transition-all duration-200"
                                  onClick={() => toggleTopic(topic.id)}
                                >
                                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    {React.createElement(getTopicIcon(topic.title), { className: "w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" })}
                                    <span className="text-left flex-1 truncate">
                                      {index + 1} - {topic.title}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs flex-shrink-0">
                                      {(topic.slides.length > 0 || topic.slide) && (
                                        <span className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded text-xs whitespace-nowrap">
                                          {topic.slides.length || 1}S
                                        </span>
                                      )}
                                      {(topic.videos.length > 0 || topic.video) && (
                                        <span className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded text-xs whitespace-nowrap">
                                          {topic.videos.length || 1}V
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronDown
                                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ml-1 ${
                                      expandedTopics.has(topic.id) ? "rotate-180" : ""
                                    }`}
                                  />
                                </Button>

                                {expandedTopics.has(topic.id) && (
                                  <div className="ml-6 space-y-1">
                                    {/* Display all slides */}
                                    {topic.slides.map((slide, slideIndex) => (
                                      <Button
                                        key={slide.id}
                                        variant="ghost"
                                        className="w-full justify-start text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm rounded-md transition-all duration-200"
                                        onClick={() => {
                                          selectContent({
                                            type: "slide",
                                            title: slide.title,
                                            url: slide.url,
                                            contentType: slide.type,
                                          })
                                          onCourseSelect()
                                        }}
                                      >
                                        <Presentation className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">{slide.title}</span>
                                      </Button>
                                    ))}

                                    {/* Display all videos */}
                                    {topic.videos.map((video, videoIndex) => (
                                      <Button
                                        key={video.id}
                                        variant="ghost"
                                        className="w-full justify-start text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm rounded-md transition-all duration-200"
                                        onClick={() => {
                                          selectContent({
                                            type: "video",
                                            title: video.title,
                                            url: video.url,
                                            duration: video.duration,
                                          })
                                          onCourseSelect()
                                        }}
                                      >
                                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                        <span className="truncate">
                                          {video.title} ({video.duration})
                                        </span>
                                      </Button>
                                    ))}

                                    {/* Fallback to old format for backward compatibility */}
                                    {topic.slides.length === 0 && topic.slide && (
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 py-1 px-2 text-xs rounded-md"
                                        onClick={() => {
                                          selectContent({
                                            type: "slide",
                                            title: topic.slide!.title || `${topic.title} - Slide`,
                                            url: topic.slide!.url,
                                            contentType: topic.slide!.type,
                                          })
                                          onCourseSelect()
                                        }}
                                      >
                                        <Presentation className="w-3 h-3 mr-2" />
                                        <span className="truncate">{topic.slide.title || `${topic.title} - Slide`}</span>
                                      </Button>
                                    )}
                                    {topic.videos.length === 0 && topic.video && (
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 py-1 px-2 text-xs rounded-md"
                                        onClick={() => {
                                          selectContent({
                                            type: "video",
                                            title: topic.video!.title || `${topic.title} - Video`,
                                            url: topic.video!.url,
                                            duration: topic.video!.duration,
                                          })
                                          onCourseSelect()
                                        }}
                                      >
                                        <Play className="w-3 h-3 mr-2" />
                                        <span className="truncate">
                                          {topic.video.title || `${topic.title} - Video`} ({topic.video.duration})
                                        </span>
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
            <div className="text-white font-bold text-sm sm:text-base">
              <span className="text-emerald-400">DIU</span>
              <span className="text-blue-400 ml-1">CSE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <NavigationItems />
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm sm:text-base">
                Log In
              </Button>
            </div>

            <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback className="bg-emerald-600 text-white">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </AvatarFallback>
            </Avatar>

            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-300 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-900 border-slate-700 w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle className="text-white text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <NavigationItems mobile onItemClick={() => setIsMobileMenuOpen(false)} />
                  <div className="border-t border-slate-700 pt-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:text-white text-base py-3"
                      >
                        <Sun className="w-5 h-5 mr-2" />
                        Theme
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:text-white text-base py-3"
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:text-white text-base py-3"
                      >
                        Log In
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
          <ContentViewer />
        </div>

        {/* Mobile Course Selection Button */}
        <div className="lg:hidden order-1 p-3 sm:p-4 border-b border-slate-700/50">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button className="w-full bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 justify-between h-12 sm:h-14 text-sm sm:text-base px-3 sm:px-4">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{currentSemester?.name || "Select Semester"} Courses</span>
                </div>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-slate-800 border-slate-700 h-[85vh] sm:h-[80vh] overflow-hidden">
              <div className="flex flex-col h-full">
                <SheetHeader className="flex-shrink-0 pb-4">
                  <SheetTitle className="text-white text-left text-lg sm:text-xl">
                    Courses - {currentSemester?.name || "Loading..."}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  {/* Semester Dropdown */}
                  <div className="mb-4 sm:mb-6 px-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 h-12 sm:h-14 text-sm sm:text-base px-3 sm:px-4"
                        >
                          <span className="truncate">{currentSemester?.name || "Loading..."}</span>
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full bg-slate-800 border-slate-600">
                        {semesters.map((semester) => (
                          <DropdownMenuItem
                            key={semester.id}
                            onClick={() => setSelectedSemester(semester.type)}
                            className="text-white hover:bg-slate-700 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base px-3 sm:px-4"
                          >
                            {semester.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="px-1">
                    <CourseList onCourseSelect={() => setIsSidebarOpen(false)} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 xl:w-96 bg-slate-800/50 border-l border-slate-700/50 p-4 lg:p-6 order-2 overflow-y-auto max-h-[calc(100vh-73px)]">
          {/* Semester Dropdown */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 min-h-[48px]"
                >
                  {currentSemester?.name || "Loading..."}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-slate-800 border-slate-600">
                {semesters.map((semester) => (
                  <DropdownMenuItem
                    key={semester.id}
                    onClick={() => setSelectedSemester(semester.type)}
                    className="text-white hover:bg-slate-700 min-h-[40px]"
                  >
                    {semester.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CourseList />
        </div>
      </div>
    </div>
  )
}
