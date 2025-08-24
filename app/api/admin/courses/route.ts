import { NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

/* --------------------------------  GET  ---------------------------------- */
export async function GET() {
  const db = createDB()

  const { data, error } = await db
    .from("courses")
    .select(
      `
        id,
        title,
        course_code,
        teacher_name,
        is_highlighted,
        semester:semesters (
          id,
          title
        )
      `,
    )
    .order("is_highlighted", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Map semester.title -> name so the UI gets {semester:{name}}
  const mapped = (data ?? []).map((course) => ({
    ...course,
    semester: { name: course.semester?.title ?? "" },
  }))

  return NextResponse.json(mapped)
}
