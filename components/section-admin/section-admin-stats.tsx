"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar,
  FileText,
  Play,
  Star,
  Clock,
  CheckCircle2
} from "lucide-react"

export function SectionAdminStats() {
  // Mock data - in real implementation, this would come from API
  const stats = [
    {
      title: "Active Semesters",
      value: "3",
      description: "Currently running",
      icon: GraduationCap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      change: "+1 this month",
      changeType: "positive" as const
    },
    {
      title: "Total Courses",
      value: "24",
      description: "Across all semesters",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+3 this week",
      changeType: "positive" as const
    },
    {
      title: "Study Materials",
      value: "156",
      description: "Videos, slides, tools",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+12 this week",
      changeType: "positive" as const
    },
    {
      title: "Student Engagement",
      value: "89%",
      description: "Average completion rate",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "+5% this month",
      changeType: "positive" as const
    }
  ]

  const recentActivity = [
    {
      title: "New semester created",
      description: "Spring 2024 - Computer Science",
      time: "2 hours ago",
      icon: GraduationCap,
      color: "text-emerald-600"
    },
    {
      title: "Course updated",
      description: "Data Structures - Added new topics",
      time: "4 hours ago",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Study tools uploaded",
      description: "5 new practice tests added",
      time: "1 day ago",
      icon: Play,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Performance Overview
            </CardTitle>
            <CardDescription>
              Key metrics for your section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">89%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Average Rating</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">4.7/5</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Active Students</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">156</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates in your section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="p-1 bg-muted rounded-full">
                    <activity.icon className={`h-3 w-3 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
