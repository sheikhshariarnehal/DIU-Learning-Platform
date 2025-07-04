"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BulkImportDialog } from "@/components/bulk-import-dialog"
import {
  BookOpen,
  GraduationCap,
  FileText,
  Video,
  Users,
  BarChart3,
  Plus,
  Settings,
  Database,
  Calendar,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    { label: "Total Semesters", value: "4", icon: Calendar, color: "text-blue-400" },
    { label: "Total Courses", value: "12", icon: BookOpen, color: "text-green-400" },
    { label: "Study Tools", value: "48", icon: FileText, color: "text-yellow-400" },
    { label: "Topics", value: "156", icon: GraduationCap, color: "text-purple-400" },
    { label: "Videos", value: "89", icon: Video, color: "text-red-400" },
    { label: "Active Users", value: "234", icon: Users, color: "text-cyan-400" },
  ]

  const quickActions = [
    {
      title: "Manage Semesters",
      description: "Add, edit, or remove semesters",
      href: "/admin/semesters",
      icon: Calendar,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    },
    {
      title: "Manage Courses",
      description: "Add, edit, or remove courses",
      href: "/admin/courses",
      icon: BookOpen,
      color: "bg-green-500/20 text-green-400 border-green-500/50",
    },
    {
      title: "Manage Sections",
      description: "Organize course sections",
      href: "/admin/sections",
      icon: Settings,
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    },
    {
      title: "Study Tools",
      description: "Manage study resources",
      href: "/admin/study-tools",
      icon: FileText,
      color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    },
    {
      title: "Topics & Content",
      description: "Manage topics, slides, and videos",
      href: "/admin/topics",
      icon: GraduationCap,
      color: "bg-red-500/20 text-red-400 border-red-500/50",
    },
    {
      title: "Lectures",
      description: "Manage lecture content",
      href: "/admin/lectures",
      icon: Video,
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your educational platform</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportDialog />
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>Manage different aspects of your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className={`${action.color} border transition-all hover:scale-105 cursor-pointer`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <action.icon className="w-8 h-8" />
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm opacity-80">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription>Latest changes to your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Created new topic",
                item: "Information Security Elements",
                time: "2 hours ago",
                type: "create",
              },
              {
                action: "Updated course",
                item: "Database Management (CSE311)",
                time: "4 hours ago",
                type: "update",
              },
              {
                action: "Added study tool",
                item: "Previous Questions for CSE423",
                time: "1 day ago",
                type: "create",
              },
              {
                action: "Deleted lecture",
                item: "Outdated Security Protocols",
                time: "2 days ago",
                type: "delete",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "create"
                        ? "bg-green-400"
                        : activity.type === "update"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                  />
                  <div>
                    <p className="text-white text-sm">
                      {activity.action}: <span className="text-slate-300">{activity.item}</span>
                    </p>
                    <p className="text-slate-500 text-xs">{activity.time}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    activity.type === "create"
                      ? "border-green-500/50 text-green-400"
                      : activity.type === "update"
                        ? "border-yellow-500/50 text-yellow-400"
                        : "border-red-500/50 text-red-400"
                  }
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Connection</span>
                <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Storage Used</span>
                <span className="text-white">2.4 GB / 10 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Active Connections</span>
                <span className="text-white">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Daily Active Users</span>
                <span className="text-white">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Content Views</span>
                <span className="text-white">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Downloads</span>
                <span className="text-white">456</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
