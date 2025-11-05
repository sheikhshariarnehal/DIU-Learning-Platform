"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth, type AdminUser } from "@/contexts/auth-context"
import { Settings, User, Moon, Sun, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface AdminHeaderProps {
  user: AdminUser
}

const getPageTitle = (pathname: string): string => {
  // Remove trailing slash
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  
  // Map routes to titles
  const routeTitles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/bulk-creator': 'Bulk Creator',
    '/admin/semester-management': 'Create Semester',
    '/admin/semesters': 'Semesters',
    '/admin/courses': 'Courses',
    '/admin/topics': 'Topics',
    '/admin/content': 'Content',
    '/admin/study-tools': 'Study Tools',
    '/admin/analytics': 'Analytics',
    '/admin/users': 'Users',
    '/admin/settings': 'Settings',
  }
  
  // Check for exact match first
  if (routeTitles[path]) {
    return routeTitles[path]
  }
  
  // Check for partial matches (for dynamic routes)
  for (const [route, title] of Object.entries(routeTitles)) {
    if (path.startsWith(route)) {
      return title
    }
  }
  
  // Default fallback
  return 'Admin Dashboard'
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const pageTitle = getPageTitle(pathname)

  const handleLogout = async () => {
    await logout()
    router.push("/admin/login")
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:block text-foreground">{user.full_name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
