import { Metadata } from "next"
import { EnhancedCreatorView } from "@/components/admin/enhanced-creator-view"

interface ViewPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ViewPageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `View Semester - DIU Learning Platform`,
    description: "View detailed information about a semester created with the Enhanced All-in-One Creator.",
    robots: "noindex, nofollow",
  }
}

export default async function EnhancedCreatorViewPage({ params }: ViewPageProps) {
  const { id } = await params

  return (
    <main className="container mx-auto py-6 space-y-6">
      <EnhancedCreatorView semesterId={id} />
    </main>
  )
}
