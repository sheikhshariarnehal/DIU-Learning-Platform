import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { ThemeProvider } from "@/components/theme-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mock user data for now
  const mockUser = {
    id: "1",
    email: "admin@diu.edu.bd",
    full_name: "System Administrator",
    role: "super_admin" as const,
    is_active: true,
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <AdminSidebar user={mockUser} />
        <div className="lg:pl-64">
          <AdminHeader user={mockUser} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}
