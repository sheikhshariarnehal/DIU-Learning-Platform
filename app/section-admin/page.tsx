"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SectionAdminStats } from "@/components/section-admin/section-admin-stats"
import { RecentSectionActivity } from "@/components/section-admin/recent-section-activity"
import Link from "next/link"
import {
  GraduationCap,
  Plus,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Zap,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react"

export default function SectionAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Section Admin Dashboard
              </h1>
              <p className="text-blue-100">
                Manage your section's semesters, courses, and academic content
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                Section Admin
              </Badge>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Stats */}
      <SectionAdminStats />

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Enhanced Semester Management */}
        <Card className="hover:shadow-lg transition-shadow border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
              Enhanced Semester Management
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                New
              </Badge>
            </CardTitle>
            <CardDescription>
              Create and manage semesters with our improved, professional interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/section-admin/semester-management">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Semester
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/section-admin/semesters">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage All Semesters
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Management */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Course Management
            </CardTitle>
            <CardDescription>
              Manage courses within your section's semesters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/section-admin/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Courses
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/section-admin/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Course
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Section Analytics
            </CardTitle>
            <CardDescription>
              View performance metrics and insights for your section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/section-admin/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/section-admin/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSectionActivity />
        
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Overview
            </CardTitle>
            <CardDescription>
              Recent activity and important metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Active Semesters</span>
                </div>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Courses</span>
                </div>
                <Badge variant="secondary">24</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Enrolled Students</span>
                </div>
                <Badge variant="secondary">156</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
