import { Metadata } from "next"
import { EnhancedCreatorList } from "@/components/admin/enhanced-creator-list"

export const metadata: Metadata = {
  title: "Enhanced Creator List - DIU Learning Platform",
  description: "View and manage all semesters created with the Enhanced All-in-One Creator. Edit, duplicate, or delete semesters with advanced management features.",
  keywords: ["semester management", "enhanced creator", "DIU", "learning platform"],
  robots: "noindex, nofollow",
}

export default function EnhancedCreatorListPage() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Enhanced Creator Management
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          View, edit, and manage all semesters created with the Enhanced All-in-One Creator
        </p>
      </header>

      <EnhancedCreatorList />
    </main>
  )
}
