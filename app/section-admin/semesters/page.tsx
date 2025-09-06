"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SectionSemestersList } from "@/components/section-admin/section-semesters-list"
import { Plus, Calendar } from "lucide-react"
import Link from "next/link"

export default function SectionSemestersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Section Semesters</h2>
          <p className="text-muted-foreground">Manage all semesters for your section</p>
        </div>
        <Button asChild>
          <Link href="/section-admin/semester-management">
            <Plus className="mr-2 h-4 w-4" />
            Create Semester
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Section Semesters
          </CardTitle>
          <CardDescription>View and manage all semesters in your section</CardDescription>
        </CardHeader>
        <CardContent>
          <SectionSemestersList />
        </CardContent>
      </Card>
    </div>
  )
}
