import { Metadata } from "next"
import { EnhancedAllInOneCreator } from "@/components/admin/enhanced-all-in-one-creator"
import { Button } from "@/components/ui/button"
import { List, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EnhancedEditPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EnhancedEditPageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Edit Semester - DIU Learning Platform`,
    description: "Edit semester with enhanced interface featuring auto-save, real-time validation, and improved user experience.",
    robots: "noindex, nofollow",
  }
}

export default async function EnhancedEditPage({ params }: EnhancedEditPageProps) {
  const { id } = await params

  return (
    <main className="container mx-auto py-6 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/enhanced-creator/list">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
          <Link href={`/admin/enhanced-creator/view/${id}`}>
            <Button variant="outline">
              View Details
            </Button>
          </Link>
          <Link href="/admin/enhanced-creator">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          Editing Semester ID: {id}
        </div>
      </div>

      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Enhanced Editor
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Edit your semester with auto-save and real-time validation.
        </p>
      </header>

      <EnhancedAllInOneCreator mode="edit" editId={id} />
    </main>
  )
}
