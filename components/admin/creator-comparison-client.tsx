"use client"

import { useState, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedCreatorLoading } from "./enhanced-creator-loading"
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Clock,
  Shield,
  Palette,
  BarChart3,
  Users,
  Settings
} from "lucide-react"

// Lazy load components for better performance
const AllInOneCreator = lazy(() => import("./all-in-one-creator").then(module => ({ default: module.AllInOneCreator })))
const EnhancedAllInOneCreator = lazy(() => import("./enhanced-all-in-one-creator").then(module => ({ default: module.EnhancedAllInOneCreator })))

const features = {
  original: [
    "Basic step-by-step workflow",
    "Simple form validation", 
    "Standard UI components",
    "Manual save only",
    "Basic progress tracking"
  ],
  enhanced: [
    "Enhanced workflow with visual progress",
    "Real-time validation with detailed errors",
    "Modern gradient UI with improved aesthetics", 
    "Auto-save functionality with timestamps",
    "Advanced progress tracking with percentages",
    "Enhanced form layouts with better spacing",
    "Improved user feedback and notifications",
    "Better mobile responsiveness",
    "Preview mode for reviewing data"
  ]
}

const improvements = [
  {
    icon: Palette,
    title: "Modern UI",
    description: "Gradient backgrounds, improved spacing, and modern design elements",
    color: "text-blue-500"
  },
  {
    icon: Clock,
    title: "Auto-save",
    description: "Automatic saving every 30 seconds with timestamp tracking",
    color: "text-green-500"
  },
  {
    icon: Shield,
    title: "Real-time Validation",
    description: "Instant feedback with detailed error messages and suggestions",
    color: "text-purple-500"
  },
  {
    icon: Users,
    title: "Better UX",
    description: "Improved workflow, progress tracking, and user guidance",
    color: "text-orange-500"
  }
]

export function CreatorComparison() {
  const [selectedCreator, setSelectedCreator] = useState<"original" | "enhanced">("enhanced")

  return (
    <div className="space-y-8">
      {/* Feature Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Original Creator
              </CardTitle>
              <Badge variant="secondary">Current</Badge>
            </div>
            <CardDescription>
              The existing All-in-One Creator with basic functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {features.original.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSelectedCreator("original")}
            >
              Try Original Creator
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Star className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Enhanced Creator
            </CardTitle>
            <CardDescription>
              Next-generation creator with improved UX and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {features.enhanced.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setSelectedCreator("enhanced")}
            >
              <Zap className="h-4 w-4 mr-2" />
              Try Enhanced Creator
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Key Improvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Improvements in Enhanced Version
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {improvements.map((improvement, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <improvement.icon className={`h-8 w-8 mx-auto mb-2 ${improvement.color}`} />
                <h4 className="font-semibold mb-1">{improvement.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {improvement.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Demo</span>
            <div className="flex items-center gap-2">
              <Badge variant={selectedCreator === "original" ? "default" : "outline"}>
                Original
              </Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant={selectedCreator === "enhanced" ? "default" : "outline"}>
                Enhanced
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCreator} onValueChange={(value) => setSelectedCreator(value as "original" | "enhanced")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original Creator</TabsTrigger>
              <TabsTrigger value="enhanced">Enhanced Creator</TabsTrigger>
            </TabsList>
            <TabsContent value="original" className="mt-6">
              <Suspense fallback={<EnhancedCreatorLoading />}>
                <AllInOneCreator mode="create" />
              </Suspense>
            </TabsContent>
            <TabsContent value="enhanced" className="mt-6">
              <Suspense fallback={<EnhancedCreatorLoading />}>
                <EnhancedAllInOneCreator mode="create" />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
