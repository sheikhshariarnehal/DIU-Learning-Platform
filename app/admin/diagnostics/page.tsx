"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DiagnosticResult {
  name: string
  status: "checking" | "success" | "error" | "warning"
  message: string
  details?: string
}

export default function AdminDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const results: DiagnosticResult[] = []

    // Check 1: Environment Variables
    const updateResult = (result: DiagnosticResult) => {
      setDiagnostics((prev) => {
        const existing = prev.findIndex((r) => r.name === result.name)
        if (existing >= 0) {
          const newResults = [...prev]
          newResults[existing] = result
          return newResults
        }
        return [...prev, result]
      })
    }

    updateResult({
      name: "Environment Variables",
      status: "checking",
      message: "Checking environment configuration...",
    })

    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    updateResult({
      name: "Environment Variables",
      status: hasSupabaseUrl && hasSupabaseKey ? "success" : "error",
      message: hasSupabaseUrl && hasSupabaseKey 
        ? "Environment variables configured correctly" 
        : "Missing Supabase environment variables",
      details: `URL: ${hasSupabaseUrl ? "✓" : "✗"}, Key: ${hasSupabaseKey ? "✓" : "✗"}`,
    })

    // Check 2: Supabase Connection
    updateResult({
      name: "Supabase Connection",
      status: "checking",
      message: "Testing database connection...",
    })

    try {
      const { data, error } = await supabase.from("semesters").select("count", { count: "exact", head: true })
      
      if (error) throw error

      updateResult({
        name: "Supabase Connection",
        status: "success",
        message: "Database connection successful",
        details: `Connected to: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}`,
      })
    } catch (error: any) {
      updateResult({
        name: "Supabase Connection",
        status: "error",
        message: "Failed to connect to database",
        details: error?.message || "Unknown error",
      })
    }

    // Check 3: Auth API
    updateResult({
      name: "Auth API",
      status: "checking",
      message: "Testing authentication endpoint...",
    })

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      updateResult({
        name: "Auth API",
        status: response.ok ? "success" : "error",
        message: response.ok ? "Auth API responding" : "Auth API error",
        details: `Status: ${response.status} ${response.statusText}`,
      })
    } catch (error: any) {
      updateResult({
        name: "Auth API",
        status: "error",
        message: "Failed to reach auth endpoint",
        details: error?.message || "Network error",
      })
    }

    // Check 4: Database Tables
    updateResult({
      name: "Database Tables",
      status: "checking",
      message: "Checking database tables...",
    })

    try {
      const tables = ["semesters", "courses", "topics", "slides", "videos", "study_tools"]
      const checks = await Promise.all(
        tables.map(async (table) => {
          const { error } = await supabase.from(table).select("id", { head: true, count: "exact" })
          return { table, exists: !error }
        })
      )

      const allExist = checks.every((c) => c.exists)
      const existing = checks.filter((c) => c.exists).map((c) => c.table)

      updateResult({
        name: "Database Tables",
        status: allExist ? "success" : "warning",
        message: allExist ? "All tables accessible" : "Some tables missing or inaccessible",
        details: `Accessible: ${existing.join(", ")}`,
      })
    } catch (error: any) {
      updateResult({
        name: "Database Tables",
        status: "error",
        message: "Failed to check tables",
        details: error?.message || "Unknown error",
      })
    }

    // Check 5: Browser Info
    updateResult({
      name: "Browser Info",
      status: "success",
      message: "Browser information",
      details: `${navigator.userAgent}`,
    })

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    const variants: Record<DiagnosticResult["status"], string> = {
      checking: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
    }
    return (
      <Badge className={variants[status]} variant="outline">
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Diagnostics</h2>
        <p className="text-muted-foreground">Checking system configuration and connectivity</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Diagnostic Tool</AlertTitle>
        <AlertDescription>
          This page helps diagnose issues with the admin dashboard. Share the results with support if you encounter problems.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Results</CardTitle>
          <CardDescription>
            {isRunning ? "Running diagnostics..." : "Diagnostics complete"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnostics.map((result, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(result.status)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{result.name}</h3>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.details && (
                    <p className="text-xs font-mono bg-muted p-2 rounded">{result.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
          <CardDescription>Current runtime environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Node Environment:</span>
              <span>{process.env.NODE_ENV || "unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Supabase URL:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, "") || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Has Anon Key:</span>
              <span>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Current URL:</span>
              <span className="font-mono text-xs">{window.location.href}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
