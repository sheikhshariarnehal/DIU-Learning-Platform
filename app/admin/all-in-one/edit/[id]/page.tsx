import { AllInOneCreator } from "@/components/admin/all-in-one-creator"

interface EditAllInOnePageProps {
  params: Promise<{ id: string }>
}

export default async function EditAllInOnePage({ params }: EditAllInOnePageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Semester</h2>
        <p className="text-muted-foreground">
          Modify the semester structure and all its content
        </p>
      </div>

      <AllInOneCreator mode="edit" editId={id} />
    </div>
  )
}
