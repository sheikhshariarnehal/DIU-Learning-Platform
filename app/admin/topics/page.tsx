import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopicsList } from "@/components/admin/topics-list"
import { CreateTopicFromListDialog } from "@/components/admin/create-topic-from-list-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Topics</h2>
          <p className="text-muted-foreground">Manage all topics across courses and their content</p>
        </div>
        <CreateTopicFromListDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Topic
          </Button>
        </CreateTopicFromListDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Topics</CardTitle>
          <CardDescription>View and manage topics from all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TopicsListSkeleton />}>
            <TopicsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function TopicsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
