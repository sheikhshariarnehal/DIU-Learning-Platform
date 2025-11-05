"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudyToolsList } from "@/components/admin/study-tools-list"
import { CreateStudyToolFromListDialog } from "@/components/admin/create-study-tool-from-list-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function StudyToolsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <CreateStudyToolFromListDialog onSuccess={handleRefresh}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Study Tool
          </Button>
        </CreateStudyToolFromListDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Materials</CardTitle>
          <CardDescription>Browse, search, and manage study resources across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyToolsList key={refreshKey} onRefresh={handleRefresh} />
        </CardContent>
      </Card>
    </div>
  )
}
