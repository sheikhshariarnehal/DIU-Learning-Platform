import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

/* --------------------------------  GET  ---------------------------------- */
export async function GET() {
  const db = createDB()

  const { data, error } = await db
    .from("topics")
    .select(
      `
        id,
        title,
        order_index,
        course:courses (
          id,
          title,
          semester:semesters ( title )
        )
      `,
    )
    .order("order_index")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // map semester.title -> name so the UI gets {semester:{name}}
  const mapped = (data ?? []).map((t) => ({
    ...t,
    course: {
      ...t.course,
      semester: { name: t.course.semester?.title ?? "" },
    },
  }))

  return NextResponse.json(mapped)
}

/* --------------------------------  POST  --------------------------------- */
/* body: { title, course_id, order_index? } */
export async function POST(req: NextRequest) {
  const { title, course_id, order_index } = await req.json()
  const db = createDB()

  const { data, error } = await db
    .from("topics")
    .insert({ title, course_id, order_index })
    .select(
      `
        id,
        title,
        order_index,
        course:courses (
          id,
          title,
          semester:semesters ( title )
        )
      `,
    )
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...data,
    course: { ...data.course, semester: { name: data.course.semester?.title ?? "" } },
  })
}
