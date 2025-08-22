import { Metadata } from "next"
import { CreatorComparison } from "@/components/admin/creator-comparison-client"

export const metadata: Metadata = {
  title: "Creator Comparison - DIU Learning Platform",
  description: "Compare the original All-in-One Creator with our enhanced version featuring improved UX, better validation, and modern design.",
  keywords: ["creator comparison", "semester creator", "DIU", "learning platform"],
  robots: "noindex, nofollow",
}

export default function CreatorComparisonPage() {
  return (
    <main className="container mx-auto py-6">
      <header className="text-center space-y-3 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Creator Comparison
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compare the original All-in-One Creator with our enhanced version.
        </p>
      </header>

      <CreatorComparison />
    </main>
  )
}
