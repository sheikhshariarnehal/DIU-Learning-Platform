import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    const { data, error } = await supabase
      .from("study_tools")
      .select(`
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
          teacher_name,
          semester:semesters ( 
            id,
            title,
            section
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Study tool not found" }, { status: 404 })
      }
      console.error("[study-tools] GET error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data for consistent API response
    const transformedData = {
      id: data.id,
      title: data.title,
      url: data.content_url,
      type: "study-tool",
      studyToolType: data.type,
      examType: data.exam_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      course: {
        id: data.course.id,
        title: data.course.title,
        courseCode: data.course.course_code,
        teacherName: data.course.teacher_name,
        semester: {
          id: data.course.semester.id,
          title: data.course.semester.title,
          section: data.course.semester.section,
          name: data.course.semester.title
        }
      },
      // SEO and sharing metadata
      metadata: {
        title: `${data.title} - ${data.course.title}`,
        description: `${data.type.replace('_', ' ').toUpperCase()} for ${data.course.title} course`,
        courseTitle: data.course.title,
        semesterTitle: data.course.semester.title,
        teacherName: data.course.teacher_name,
        studyToolType: data.type,
        examType: data.exam_type,
        shareUrl: `/study-tool/${data.id}`,
        embedUrl: data.content_url
      }
    }

    return NextResponse.json(transformedData)
  } catch (err) {
    console.error("[study-tools] GET error:", err)
    return NextResponse.json({ error: "Failed to fetch study tool" }, { status: 500 })
  }
}
