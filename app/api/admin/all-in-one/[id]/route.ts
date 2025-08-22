import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

interface SemesterData {
  title: string
  description: string
  section: string
  has_midterm: boolean
  has_final: boolean
  start_date?: string
  end_date?: string
  credits?: number
}

interface CourseData {
  id?: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  credits?: number
  description?: string
  topics: TopicData[]
  studyTools: StudyToolData[]
}

interface TopicData {
  id?: string
  title: string
  description: string
  order_index?: number
  slides: { id?: string; title: string; url: string; description?: string }[]
  videos: { id?: string; title: string; url: string; description?: string; duration?: string }[]
}

interface StudyToolData {
  id?: string
  title: string
  type: string
  content_url: string
  exam_type: string
  description?: string
  file_size?: string
}

interface AllInOneData {
  semester: SemesterData
  courses: CourseData[]
}

/* --------------------------------  GET  ---------------------------------- */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDB()

    // Fetch semester with all related data
    const { data: semester, error: semesterError } = await db
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

    // Fetch courses for this semester
    const { data: courses, error: coursesError } = await db
      .from("courses")
      .select("*")
      .eq("semester_id", id)
      .order("created_at", { ascending: true })

    if (coursesError) throw coursesError

    // For each course, fetch topics, slides, videos, and study tools
    const coursesWithContent = await Promise.all(
      (courses || []).map(async (course) => {
        // Fetch topics
        const { data: topics, error: topicsError } = await db
          .from("topics")
          .select("*")
          .eq("course_id", course.id)
          .order("order_index", { ascending: true })

        if (topicsError) throw topicsError

        // For each topic, fetch slides and videos
        const topicsWithContent = await Promise.all(
          (topics || []).map(async (topic) => {
            const [slidesResult, videosResult] = await Promise.all([
              db.from("slides")
                .select("*")
                .eq("topic_id", topic.id)
                .order("order_index", { ascending: true }),
              db.from("videos")
                .select("*")
                .eq("topic_id", topic.id)
                .order("order_index", { ascending: true })
            ])

            if (slidesResult.error) throw slidesResult.error
            if (videosResult.error) throw videosResult.error

            return {
              id: topic.id,
              title: topic.title,
              description: topic.description || "",
              slides: (slidesResult.data || []).map(slide => ({
                id: slide.id,
                title: slide.title,
                url: slide.google_drive_url
              })),
              videos: (videosResult.data || []).map(video => ({
                id: video.id,
                title: video.title,
                url: video.youtube_url
              }))
            }
          })
        )

        // Fetch study tools for this course
        const { data: studyTools, error: studyToolsError } = await db
          .from("study_tools")
          .select("*")
          .eq("course_id", course.id)
          .order("created_at", { ascending: true })

        if (studyToolsError) throw studyToolsError

        return {
          id: course.id,
          title: course.title,
          course_code: course.course_code,
          teacher_name: course.teacher_name,
          topics: topicsWithContent,
          studyTools: (studyTools || []).map(tool => ({
            id: tool.id,
            title: tool.title,
            type: tool.type,
            content_url: tool.content_url || "",
            exam_type: tool.exam_type
          }))
        }
      })
    )

    const result: AllInOneData = {
      semester: {
        title: semester.title,
        description: semester.description || "",
        section: semester.section,
        has_midterm: semester.has_midterm,
        has_final: semester.has_final
      },
      courses: coursesWithContent
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error fetching semester details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/* --------------------------------  PUT  ---------------------------------- */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data: AllInOneData = await request.json()
    const db = createDB()

    // Validate required fields
    if (!data.semester.title || !data.semester.section) {
      return NextResponse.json(
        { error: "Semester title and section are required" },
        { status: 400 }
      )
    }

    // Update semester
    const { error: semesterError } = await db
      .from("semesters")
      .update({
        title: data.semester.title,
        description: data.semester.description,
        section: data.semester.section,
        has_midterm: data.semester.has_midterm,
        has_final: data.semester.has_final,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (semesterError) throw semesterError

    // Get existing courses to determine what to update/delete/create
    const { data: existingCourses, error: existingCoursesError } = await db
      .from("courses")
      .select("id")
      .eq("semester_id", id)

    if (existingCoursesError) throw existingCoursesError

    const existingCourseIds = new Set((existingCourses || []).map(c => c.id))
    const updatedCourseIds = new Set(data.courses.filter(c => c.id).map(c => c.id))

    // Delete courses that are no longer in the update
    const coursesToDelete = Array.from(existingCourseIds).filter(id => !updatedCourseIds.has(id))
    if (coursesToDelete.length > 0) {
      const { error: deleteError } = await db
        .from("courses")
        .delete()
        .in("id", coursesToDelete)

      if (deleteError) throw deleteError
    }

    // Process each course
    for (const course of data.courses) {
      let courseId = course.id

      if (courseId) {
        // Update existing course
        const { error: courseError } = await db
          .from("courses")
          .update({
            title: course.title,
            course_code: course.course_code,
            teacher_name: course.teacher_name,
            updated_at: new Date().toISOString()
          })
          .eq("id", courseId)

        if (courseError) throw courseError
      } else {
        // Create new course
        const { data: newCourse, error: courseError } = await db
          .from("courses")
          .insert([{
            title: course.title,
            course_code: course.course_code,
            teacher_name: course.teacher_name,
            semester_id: id
          }])
          .select("id")
          .single()

        if (courseError) throw courseError
        courseId = newCourse.id
      }

      // Handle topics (similar logic for update/delete/create)
      const { data: existingTopics, error: existingTopicsError } = await db
        .from("topics")
        .select("id")
        .eq("course_id", courseId)

      if (existingTopicsError) throw existingTopicsError

      const existingTopicIds = new Set((existingTopics || []).map(t => t.id))
      const updatedTopicIds = new Set(course.topics.filter(t => t.id).map(t => t.id))

      // Delete topics that are no longer in the update
      const topicsToDelete = Array.from(existingTopicIds).filter(id => !updatedTopicIds.has(id))
      if (topicsToDelete.length > 0) {
        const { error: deleteError } = await db
          .from("topics")
          .delete()
          .in("id", topicsToDelete)

        if (deleteError) throw deleteError
      }

      // Process topics
      for (let topicIndex = 0; topicIndex < course.topics.length; topicIndex++) {
        const topic = course.topics[topicIndex]
        let topicId = topic.id

        if (topicId) {
          // Update existing topic
          const { error: topicError } = await db
            .from("topics")
            .update({
              title: topic.title,
              description: topic.description,
              order_index: topicIndex + 1,
              updated_at: new Date().toISOString()
            })
            .eq("id", topicId)

          if (topicError) throw topicError
        } else {
          // Create new topic
          const { data: newTopic, error: topicError } = await db
            .from("topics")
            .insert([{
              title: topic.title,
              description: topic.description,
              course_id: courseId,
              order_index: topicIndex + 1
            }])
            .select("id")
            .single()

          if (topicError) throw topicError
          topicId = newTopic.id
        }

        // Handle slides and videos (delete all and recreate for simplicity)
        await Promise.all([
          db.from("slides").delete().eq("topic_id", topicId),
          db.from("videos").delete().eq("topic_id", topicId)
        ])

        // Create new slides
        if (topic.slides.length > 0) {
          const slidesToInsert = topic.slides
            .filter(slide => slide.title && slide.url)
            .map((slide, index) => ({
              title: slide.title,
              google_drive_url: slide.url,
              topic_id: topicId,
              order_index: index + 1
            }))

          if (slidesToInsert.length > 0) {
            const { error: slidesError } = await db
              .from("slides")
              .insert(slidesToInsert)

            if (slidesError) throw slidesError
          }
        }

        // Create new videos
        if (topic.videos.length > 0) {
          const videosToInsert = topic.videos
            .filter(video => video.title && video.url)
            .map((video, index) => ({
              title: video.title,
              youtube_url: video.url,
              topic_id: topicId,
              order_index: index + 1
            }))

          if (videosToInsert.length > 0) {
            const { error: videosError } = await db
              .from("videos")
              .insert(videosToInsert)

            if (videosError) throw videosError
          }
        }
      }

      // Handle study tools (delete all and recreate)
      await db.from("study_tools").delete().eq("course_id", courseId)

      if (course.studyTools.length > 0) {
        const studyToolsToInsert = course.studyTools
          .filter(tool => tool.title && tool.type)
          .map(tool => ({
            title: tool.title,
            type: tool.type,
            content_url: tool.content_url,
            course_id: courseId,
            exam_type: tool.exam_type
          }))

        if (studyToolsToInsert.length > 0) {
          const { error: studyToolsError } = await db
            .from("study_tools")
            .insert(studyToolsToInsert)

          if (studyToolsError) throw studyToolsError
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully updated semester and all content"
    })

  } catch (error) {
    console.error("Error updating semester:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/* --------------------------------  DELETE  -------------------------------- */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDB()

    // Delete semester (cascade will handle related records)
    const { error } = await db
      .from("semesters")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Successfully deleted semester and all related content"
    })

  } catch (error) {
    console.error("Error deleting semester:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
