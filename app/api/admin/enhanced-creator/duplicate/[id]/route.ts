import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDB()

    // First, get the original semester data
    const { data: originalSemester, error: semesterError } = await db
      .from("semesters")
      .select("*")
      .eq("id", id)
      .single()

    if (semesterError) {
      if (semesterError.code === "PGRST116") {
        return NextResponse.json({ error: "Semester not found" }, { status: 404 })
      }
      throw semesterError
    }

    // Create new semester with "Copy of" prefix
    const newSemesterTitle = `Copy of ${originalSemester.title}`
    const newSemesterSection = `${originalSemester.section}_COPY`

    const { data: newSemester, error: newSemesterError } = await db
      .from("semesters")
      .insert([{
        title: newSemesterTitle,
        description: originalSemester.description ? `${originalSemester.description} (Duplicated)` : "Duplicated semester",
        section: newSemesterSection,
        has_midterm: originalSemester.has_midterm,
        has_final: originalSemester.has_final,
        start_date: originalSemester.start_date,
        end_date: originalSemester.end_date,
        credits: originalSemester.credits
      }])
      .select("id")
      .single()

    if (newSemesterError) throw newSemesterError

    const newSemesterId = newSemester.id

    // Get all courses from original semester
    const { data: originalCourses, error: coursesError } = await db
      .from("courses")
      .select("*")
      .eq("semester_id", id)
      .order("created_at", { ascending: true })

    if (coursesError) throw coursesError

    // Duplicate each course and its content
    for (const originalCourse of originalCourses || []) {
      // Create new course
      const { data: newCourse, error: newCourseError } = await db
        .from("courses")
        .insert([{
          title: originalCourse.title,
          course_code: originalCourse.course_code,
          teacher_name: originalCourse.teacher_name,
          teacher_email: originalCourse.teacher_email,
          credits: originalCourse.credits,
          description: originalCourse.description,
          semester_id: newSemesterId
        }])
        .select("id")
        .single()

      if (newCourseError) throw newCourseError

      const newCourseId = newCourse.id

      // Get all topics from original course
      const { data: originalTopics, error: topicsError } = await db
        .from("topics")
        .select("*")
        .eq("course_id", originalCourse.id)
        .order("order_index", { ascending: true })

      if (topicsError) throw topicsError

      // Duplicate each topic and its content
      for (const originalTopic of originalTopics || []) {
        // Create new topic
        const { data: newTopic, error: newTopicError } = await db
          .from("topics")
          .insert([{
            title: originalTopic.title,
            description: originalTopic.description,
            course_id: newCourseId,
            order_index: originalTopic.order_index
          }])
          .select("id")
          .single()

        if (newTopicError) throw newTopicError

        const newTopicId = newTopic.id

        // Get and duplicate slides
        const { data: originalSlides, error: slidesError } = await db
          .from("slides")
          .select("*")
          .eq("topic_id", originalTopic.id)
          .order("order_index", { ascending: true })

        if (slidesError) throw slidesError

        if (originalSlides && originalSlides.length > 0) {
          const newSlides = originalSlides.map(slide => ({
            title: slide.title,
            google_drive_url: slide.google_drive_url,
            description: slide.description,
            topic_id: newTopicId,
            order_index: slide.order_index
          }))

          const { error: newSlidesError } = await db
            .from("slides")
            .insert(newSlides)

          if (newSlidesError) throw newSlidesError
        }

        // Get and duplicate videos
        const { data: originalVideos, error: videosError } = await db
          .from("videos")
          .select("*")
          .eq("topic_id", originalTopic.id)
          .order("order_index", { ascending: true })

        if (videosError) throw videosError

        if (originalVideos && originalVideos.length > 0) {
          const newVideos = originalVideos.map(video => ({
            title: video.title,
            youtube_url: video.youtube_url,
            description: video.description,
            duration: video.duration,
            topic_id: newTopicId,
            order_index: video.order_index
          }))

          const { error: newVideosError } = await db
            .from("videos")
            .insert(newVideos)

          if (newVideosError) throw newVideosError
        }
      }

      // Get and duplicate study tools
      const { data: originalStudyTools, error: studyToolsError } = await db
        .from("study_tools")
        .select("*")
        .eq("course_id", originalCourse.id)
        .order("created_at", { ascending: true })

      if (studyToolsError) throw studyToolsError

      if (originalStudyTools && originalStudyTools.length > 0) {
        const newStudyTools = originalStudyTools.map(tool => ({
          title: tool.title,
          type: tool.type,
          content_url: tool.content_url,
          description: tool.description,
          exam_type: tool.exam_type,
          file_size: tool.file_size,
          course_id: newCourseId
        }))

        const { error: newStudyToolsError } = await db
          .from("study_tools")
          .insert(newStudyTools)

        if (newStudyToolsError) throw newStudyToolsError
      }
    }

    return NextResponse.json({
      success: true,
      message: "Semester duplicated successfully",
      newSemesterId: newSemesterId,
      title: newSemesterTitle
    })

  } catch (error) {
    console.error("Error duplicating semester:", error)
    return NextResponse.json(
      { error: "Failed to duplicate semester" },
      { status: 500 }
    )
  }
}
