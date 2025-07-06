"use client"

import { useRouter } from "next/navigation"
import { AllInOneList } from "@/components/admin/all-in-one-list"

export default function AllInOnePage() {
  const router = useRouter()

  const handleEdit = (semesterId: string) => {
    router.push(`/admin/all-in-one/edit/${semesterId}`)
  }

  const handleView = (semesterId: string) => {
    router.push(`/admin/semesters/${semesterId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All-in-One Creator</h2>
        <p className="text-muted-foreground">
          Manage complete semester structures with courses, topics, content, and study tools
        </p>
      </div>

      <AllInOneList onEdit={handleEdit} onView={handleView} />
    </div>
  )
}
