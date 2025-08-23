import { Metadata } from "next"
import { SemesterManagement } from "@/components/admin/semester-management"

export const metadata: Metadata = {
  title: "Semester Management - DIU Learning Platform",
  description: "Comprehensive semester management system for creating, editing, and managing semester structures with courses, topics, and study materials.",
  keywords: ["semester management", "admin", "DIU", "learning platform", "course management"],
  robots: "noindex, nofollow",
}

export default function SemesterManagementPage() {
  return (
    <main className="container mx-auto py-6 space-y-6">
      <SemesterManagement />
    </main>
  )
}
