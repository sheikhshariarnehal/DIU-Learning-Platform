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
      topic: {
        id: data.topic.id,
        title: data.topic.title,
        course: {
          id: data.topic.course.id,
          title: data.topic.course.title,
          courseCode: data.topic.course.course_code,
          teacherName: data.topic.course.teacher_name,
          semester: {
            id: data.topic.course.semester.id,
            title: data.topic.course.semester.title,
            section: data.topic.course.semester.section,
            name: data.topic.course.semester.title
          }
        }
      },
      // SEO and sharing metadata
      metadata: {
        title: `${data.title} - ${data.topic.course.title}`,
        description: data.description || `Watch ${data.title} from ${data.topic.course.title} course`,
        courseTitle: data.topic.course.title,
        topicTitle: data.topic.title,
        semesterTitle: data.topic.course.semester.title,
        teacherName: data.topic.course.teacher_name,
        shareUrl: `/video/${data.id}`,
        embedUrl: data.youtube_url
      }
    }

    return NextResponse.json(transformedData)
  } catch (err) {
    console.error("[videos] GET error:", err)
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 })
  }
}
