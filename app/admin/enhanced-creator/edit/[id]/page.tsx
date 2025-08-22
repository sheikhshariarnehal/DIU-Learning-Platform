import { EnhancedAllInOneCreator } from "@/components/admin/enhanced-all-in-one-creator"

interface EnhancedEditPageProps {
  params: Promise<{ id: string }>
}

export default async function EnhancedEditPage({ params }: EnhancedEditPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Enhanced Editor
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Edit your semester with our enhanced interface featuring auto-save, 
          real-time validation, and improved user experience.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Auto-save Enabled
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Live Validation
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Enhanced UI
          </div>
        </div>
      </div>

      <EnhancedAllInOneCreator mode="edit" editId={id} />
    </div>
  )
}
