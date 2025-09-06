"use client"

import { Header } from "@/components/header"

export default function ContributorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contributors</h1>
          <p className="text-muted-foreground">
            Meet the dedicated team behind the DIU Learning Platform development and content creation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="font-semibold text-primary">DR</span>
              </div>
              <div>
                <h3 className="font-semibold">Dr. Mohammad Rahman</h3>
                <p className="text-sm text-muted-foreground">Project Lead</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Leading the platform architecture and database design for the DIU Learning Platform.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="font-semibold text-primary">FA</span>
              </div>
              <div>
                <h3 className="font-semibold">Fatima Ahmed</h3>
                <p className="text-sm text-muted-foreground">Frontend Developer</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Responsible for UI/UX design and React component development.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="font-semibold text-primary">KH</span>
              </div>
              <div>
                <h3 className="font-semibold">Karim Hassan</h3>
                <p className="text-sm text-muted-foreground">Backend Developer</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Handles API development and database optimization.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="max-w-md mx-auto p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-2">Want to Contribute?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Join our team and help improve the DIU Learning Platform for all students.
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Get Involved
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
