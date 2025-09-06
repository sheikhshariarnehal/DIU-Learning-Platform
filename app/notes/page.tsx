"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"

export default function NotesPage() {
  const sampleNotes = [
    {
      id: 1,
      title: "Data Structures and Algorithms",
      course: "CSE 2101",
      semester: "Fall 2024",
      description: "Comprehensive notes covering arrays, linked lists, stacks, queues, and basic algorithms.",
      pages: 45,
      downloadCount: 234,
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      title: "Object Oriented Programming",
      course: "CSE 2102",
      semester: "Fall 2024", 
      description: "Complete guide to OOP concepts including inheritance, polymorphism, and encapsulation.",
      pages: 38,
      downloadCount: 189,
      lastUpdated: "2024-01-12"
    },
    {
      id: 3,
      title: "Database Management Systems",
      course: "CSE 3101",
      semester: "Spring 2024",
      description: "Database design, SQL queries, normalization, and transaction management.",
      pages: 52,
      downloadCount: 156,
      lastUpdated: "2024-01-10"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Notes</h1>
          <p className="text-muted-foreground">
            Access comprehensive study materials and lecture notes for all CSE courses.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{note.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {note.description}
                    </CardDescription>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground ml-2" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{note.course}</Badge>
                    <Badge variant="outline">{note.semester}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{note.pages} pages</span>
                    <span>{note.downloadCount} downloads</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {note.lastUpdated}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Need More Notes?</CardTitle>
              <CardDescription>
                Can't find the notes you're looking for? Request them from your instructors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Request Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
