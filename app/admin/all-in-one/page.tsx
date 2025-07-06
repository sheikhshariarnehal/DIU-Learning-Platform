import { AllInOneCreator } from "@/components/admin/all-in-one-creator"

export default function AllInOnePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All-in-One Creator</h2>
        <p className="text-muted-foreground">
          Create complete semester structure with courses, topics, content, and study tools in one streamlined workflow
        </p>
      </div>

      <AllInOneCreator />
    </div>
  )
}
