"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, Sun, User, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navigationItems = [
    { name: "Home", href: "/", primary: false },
    { name: "Notes", href: "/notes", primary: false },
    { name: "Contributor", href: "/contributor", primary: true },
    { name: "Result", href: "/result", primary: false },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <header className={cn(
        "border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm bg-background/95 shadow-sm",
        className
      )}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
                  <img
                    src="/images/diu-logo.png"
                    alt="Daffodil International University Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to a simple DIU text if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const fallback = document.createElement('span')
                        fallback.className = 'fallback-text text-primary font-bold text-sm'
                        fallback.textContent = 'DIU'
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-foreground">
                    DIU CSE
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Learning Platform
                  </span>
                </div>
              </div>
            </div>

            {/* Center Section - Navigation (Hidden on mobile) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={item.primary ? "default" : "ghost"}
                    className={cn(
                      "text-sm font-medium px-4 py-2 rounded-md transition-colors",
                      item.primary
                        ? "px-6 bg-primary hover:bg-primary/90"
                        : "hover:bg-accent",
                      isActive && !item.primary && "bg-accent"
                    )}
                    onClick={() => handleNavigation(item.href)}
                  >
                    {item.name}
                  </Button>
                )
              })}
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
                className="w-9 h-9 rounded-md hover:bg-accent transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                  <span className="sr-only">3 notifications</span>
                </span>
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

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-9 h-9 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.name}
                      variant={item.primary ? "default" : "ghost"}
                      className={cn(
                        "justify-start text-sm font-medium px-4 py-3 rounded-md transition-colors",
                        item.primary
                          ? "bg-primary hover:bg-primary/90"
                          : "hover:bg-accent",
                        isActive && !item.primary && "bg-accent"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      {item.name}
                    </Button>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
