"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, Sun, User, Moon, Menu, X, LogOut, Settings, ChevronDown, BookOpen, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navigationItems = [
    { name: "Home", href: "/", icon: BookOpen, primary: false },
    { name: "Notes", href: "/notes", icon: GraduationCap, primary: false },
    { name: "Contributor", href: "/contributor", primary: false },
    { name: "Result", href: "/result", primary: false },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  // Mock notifications - replace with real data
  const notifications = [
    { id: 1, title: "New course available", message: "Data Structures course is now live", time: "2 hours ago", unread: true },
    { id: 2, title: "Assignment reminder", message: "Due date approaching for AI project", time: "5 hours ago", unread: true },
    { id: 3, title: "Grade posted", message: "Your exam grade has been posted", time: "1 day ago", unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  if (!mounted) {
    return null
  }

  return (
    <header className={cn(
      "border-b border-border/40 sticky top-0 z-50 backdrop-blur-md bg-background/80 shadow-sm",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3 min-w-fit">
            <button 
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-sm">
                <img
                  src="/images/diu-logo.png"
                  alt="DIU Logo"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('span')
                      fallback.className = 'fallback-text text-primary font-bold text-lg'
                      fallback.textContent = 'DIU'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
                  DIU CSE
                </span>
                <span className="text-xs text-muted-foreground font-medium hidden sm:block">
                  Learning Platform
                </span>
              </div>
            </button>
          </div>

          {/* Center Section - Navigation (Hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    "text-sm font-medium px-4 h-9 rounded-lg transition-all duration-200 hover:bg-accent/80",
                    isActive && "bg-accent text-accent-foreground font-semibold"
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {item.name}
                </Button>
              )
            })}
          </nav>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg hover:bg-accent transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-lg hover:bg-accent transition-colors relative"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-destructive rounded-full text-[10px] font-semibold flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-accent/50 cursor-pointer border-b border-border/50 last:border-0 transition-colors",
                          notification.unread && "bg-primary/5"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border bg-muted/30">
                    <button className="text-xs text-primary hover:underline font-medium w-full text-center">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative hidden sm:block" ref={profileRef}>
              <Button
                variant="ghost"
                className="h-9 px-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <p className="font-semibold text-sm">Student Name</p>
                    <p className="text-xs text-muted-foreground mt-0.5">student@diu.edu.bd</p>
                  </div>
                  <div className="py-2">
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-3"
                      onClick={() => {
                        handleNavigation("/profile")
                        setIsProfileOpen(false)
                      }}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </button>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-3"
                      onClick={() => {
                        handleNavigation("/settings")
                        setIsProfileOpen(false)
                      }}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-border">
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-3"
                      onClick={() => {
                        // Add logout logic here
                        setIsProfileOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Profile Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden w-9 h-9 rounded-full hover:bg-accent transition-colors"
              onClick={() => handleNavigation("/profile")}
              title="Profile"
            >
              <User className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "justify-start text-sm font-medium px-4 py-3 rounded-lg transition-colors hover:bg-accent/80",
                      isActive && "bg-accent text-accent-foreground font-semibold"
                    )}
                    onClick={() => handleNavigation(item.href)}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-3" />}
                    {item.name}
                  </Button>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
