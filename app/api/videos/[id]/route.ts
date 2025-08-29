import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const supabase = createClient()

    const { data, error } = await supabase
      .from("videos")
      .select(`
        id,
        title,
        youtube_url,
        description,
        duration,
        order_index,
        topic_id,
        created_at,
        updated_at,
        topic:topics (
          id,
          title,
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
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Video not found" }, { status: 404 })
      }
      console.error("[videos] GET error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data for consistent API response
    const transformedData = {
      id: data.id,
      title: data.title,
      url: data.youtube_url,
      description: data.description,
      duration: data.duration,
      type: "video",
      orderIndex: data.order_index,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      topic: data.topic ? {
        id: data.topic.id,
        title: data.topic.title,
        course: data.topic.course ? {
          id: data.topic.course.id,
          title: data.topic.course.title,
          courseCode: data.topic.course.course_code,
          teacherName: data.topic.course.teacher_name,
          semester: data.topic.course.semester ? {
            id: data.topic.course.semester.id,
            title: data.topic.course.semester.title,
            section: data.topic.course.semester.section,
            name: data.topic.course.semester.title
          } : null
        } : null
      } : null,
      // SEO and sharing metadata
      metadata: {
        title: data.topic?.course?.title ? `${data.title} - ${data.topic.course.title}` : data.title,
        description: data.description || `Watch ${data.title}${data.topic?.course?.title ? ` from ${data.topic.course.title} course` : ''}`,
        courseTitle: data.topic?.course?.title || null,
        topicTitle: data.topic?.title || null,
        semesterTitle: data.topic?.course?.semester?.title || null,
        teacherName: data.topic?.course?.teacher_name || null,
        shareUrl: `/video/${data.id}`,
        embedUrl: data.youtube_url
      }
    }

    return NextResponse.json(transformedData)
  } catch (err) {
    console.error("[videos] GET error:", err)
    console.error("[videos] Error details:", {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack trace',
      id: params.id
    })
    return NextResponse.json({
      error: "Failed to fetch video",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
