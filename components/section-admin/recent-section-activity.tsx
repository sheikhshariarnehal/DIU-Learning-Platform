"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock,
  GraduationCap,
  BookOpen,
  FileText,
  Play,
  Users,
  TrendingUp,
  Edit3,
  Plus,
  Eye,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react"

export function RecentSectionActivity() {
  // Mock data - in real implementation, this would come from API
  const activities = [
    {
      id: 1,
      type: "semester_created",
      title: "New Semester Created",
      description: "Spring 2024 - Computer Science Section A",
      timestamp: "2 hours ago",
      icon: GraduationCap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      status: "success"
    },
    {
      id: 2,
      type: "course_updated",
      title: "Course Content Updated",
      description: "Data Structures and Algorithms - Added 3 new topics",
      timestamp: "4 hours ago",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      status: "info"
    },
    {
      id: 3,
      type: "materials_uploaded",
      title: "Study Materials Uploaded",
      description: "5 new practice tests and 12 video lectures added",
      timestamp: "6 hours ago",
      icon: Play,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      status: "success"
    },
    {
      id: 4,
      type: "semester_activated",
      title: "Semester Activated",
      description: "Fall 2023 - Software Engineering is now live",
      timestamp: "1 day ago",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
      status: "success"
    },
    {
      id: 5,
      type: "analytics_generated",
      title: "Analytics Report Generated",
      description: "Monthly performance report for November 2023",
      timestamp: "2 days ago",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      status: "info"
    },
    {
      id: 6,
      type: "course_created",
      title: "New Course Added",
      description: "Machine Learning Fundamentals - 15 topics planned",
      timestamp: "3 days ago",
      icon: Plus,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      status: "success"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case "warning":
        return <AlertCircle className="h-3 w-3 text-yellow-600" />
      case "info":
        return <Info className="h-3 w-3 text-blue-600" />
      default:
        return <Info className="h-3 w-3 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Updated</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes in your section
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border"
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      {getStatusIcon(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing last 6 activities</span>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              View activity log →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
