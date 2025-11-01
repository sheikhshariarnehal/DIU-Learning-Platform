"use client"

import React, { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    // Show timeout message if loading takes too long
    const timer = setTimeout(() => {
      if (loading) {
        setShowTimeout(true)
      }
    }, 8000)

    return () => clearTimeout(timer)
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <div>
            <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
            {showTimeout && (
              <Alert className="mt-4 max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Taking longer than expected</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>This might indicate a connection issue. Try:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Checking your internet connection</li>
                    <li>Refreshing the page</li>
                    <li>Clearing your browser cache</li>
                  </ul>
                  <div className="flex gap-2 mt-3">
                    <Button onClick={() => window.location.reload()} size="sm">
                      Refresh Page
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/diagnostics">Run Diagnostics</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    // This should not happen due to middleware, but just in case
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Please log in to access the admin panel.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar user={user} />
      <div className="lg:pl-64">
        <AdminHeader user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AuthProvider>
    </ThemeProvider>
  )
}
