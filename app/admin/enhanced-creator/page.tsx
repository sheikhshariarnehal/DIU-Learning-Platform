"use client"

import { EnhancedAllInOneCreator } from "@/components/admin/enhanced-all-in-one-creator"

export default function EnhancedCreatorPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
          Enhanced All-in-One Creator
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience our next-generation semester creation tool with enhanced user interface, 
          improved workflow, and advanced features for better productivity.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Enhanced UI/UX
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Real-time Validation
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Auto-save Support
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Progress Tracking
          </div>
        </div>
      </div>

      <EnhancedAllInOneCreator mode="create" />
    </div>
  )
}
