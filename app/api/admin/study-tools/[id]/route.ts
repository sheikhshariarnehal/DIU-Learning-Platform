import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

/* --------------------------------  GET  ---------------------------------- */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createDB()

  const { data, error } = await db
    .from("study_tools")
    .select(
      `
        id,
        title,
        type,
        content_url,
        exam_type,
        created_at,
        updated_at,
        course:courses (
          id,
          title,
          course_code,
          semester:semesters ( title )
        )
      `,
    )
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Study tool not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ...data,
    course: {
      ...data.course,
      semester: { name: data.course.semester?.title ?? "" },
    },
  })
}

/* --------------------------------  PATCH  -------------------------------- */
/* body: { title?, type?, content_url?, exam_type? } */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const db = createDB()

  // Validate type if provided
  if (body.type) {
    const validTypes = ["previous_questions", "exam_note", "syllabus", "mark_distribution"]
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }
  }

  // Validate exam_type if provided
  if (body.exam_type) {
    const validExamTypes = ["midterm", "final", "both"]
    if (!validExamTypes.includes(body.exam_type)) {
      return NextResponse.json(
        { error: `Invalid exam_type. Must be one of: ${validExamTypes.join(", ")}` },
        { status: 400 }
      )
    }
  }

  const { data, error } = await db
    .from("study_tools")
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      `
        id,
        title,
        type,
        content_url,
        exam_type,
        created_at,
        updated_at,
        course:courses (
          id,
          title,
          course_code,
          semester:semesters ( title )
        )
      `,
    )
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Study tool not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ...data,
    course: {
      ...data.course,
      semester: { name: data.course.semester?.title ?? "" },
    },
  })
}

/* --------------------------------  DELETE  ------------------------------- */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createDB()

  const { error } = await db
    .from("study_tools")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Study tool deleted successfully" })
}
