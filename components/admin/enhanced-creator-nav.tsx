"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, List, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

export function EnhancedCreatorNav() {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Enhanced All-in-One Creator
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Enhanced
          </Badge>
        </CardTitle>
        <CardDescription>
          Advanced semester creation and management with enhanced features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <Link href="/admin/enhanced-creator">
            <Button className="w-full h-16 flex-col bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-5 w-5 mb-1" />
              Create New Semester
            </Button>
          </Link>
          
          <Link href="/admin/enhanced-creator/list">
            <Button variant="outline" className="w-full h-16 flex-col border-primary/20 hover:bg-primary/5">
              <List className="h-5 w-5 mb-1" />
              Manage All Semesters
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          ✨ Features: Auto-save • Real-time validation • Advanced search • Duplicate • Statistics
        </div>
      </CardContent>
    </Card>
  )
}
