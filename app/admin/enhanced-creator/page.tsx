import { Metadata } from "next"
import { EnhancedAllInOneCreator } from "@/components/admin/enhanced-all-in-one-creator"
import { Button } from "@/components/ui/button"
import { List, Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Enhanced Creator - DIU Learning Platform",
  description: "Create complete semester structures with our advanced workflow. Enhanced UI, real-time validation, and auto-save functionality.",
  keywords: ["semester creator", "course management", "DIU", "learning platform", "education"],
  robots: "noindex, nofollow", // Admin pages shouldn't be indexed
}

export default function EnhancedCreatorPage() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/enhanced-creator/list">
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              View All Enhanced Semesters
            </Button>
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          Enhanced All-in-One Creator
        </div>
      </div>

      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Enhanced All-in-One Creator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create complete semester structures with enhanced workflow and real-time validation.
        </p>
      </header>

      <EnhancedAllInOneCreator mode="create" />
    </main>
  )
}
