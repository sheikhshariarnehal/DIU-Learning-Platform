import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

/* --------------------------------  GET  ---------------------------------- */
export async function GET() {
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
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Map semester.title -> name so the UI gets {semester:{name}}
  const mapped = (data ?? []).map((tool) => ({
    ...tool,
    course: {
      ...tool.course,
      semester: { name: tool.course.semester?.title ?? "" },
    },
  }))

  return NextResponse.json(mapped)
}

/* --------------------------------  POST  --------------------------------- */
/* body: { title, type, content_url, course_id, exam_type } */
export async function POST(req: NextRequest) {
  const { title, type, content_url, course_id, exam_type } = await req.json()
  const db = createDB()

  // Validate required fields
  if (!title || !type || !course_id) {
    return NextResponse.json(
      { error: "Missing required fields: title, type, and course_id are required" },
      { status: 400 }
    )
  }

  // Validate type
  const validTypes = ["previous_questions", "exam_note", "syllabus", "mark_distribution"]
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    )
  }

  // Validate exam_type
  const validExamTypes = ["midterm", "final", "both"]
  if (exam_type && !validExamTypes.includes(exam_type)) {
    return NextResponse.json(
      { error: `Invalid exam_type. Must be one of: ${validExamTypes.join(", ")}` },
      { status: 400 }
    )
  }

  const { data, error } = await db
    .from("study_tools")
    .insert({ 
      title, 
      type, 
      content_url, 
      course_id, 
      exam_type: exam_type || "both" 
    })
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...data,
    course: { 
      ...data.course, 
      semester: { name: data.course.semester?.title ?? "" } 
    },
  })
}
