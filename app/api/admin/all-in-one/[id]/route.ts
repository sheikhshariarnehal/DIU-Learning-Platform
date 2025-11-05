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
  default_credits?: number
  is_active?: boolean
}

interface CourseData {
  id?: string
  title: string
  course_code: string
  teacher_name: string
  teacher_email?: string
  credits?: number
  description?: string
  is_highlighted?: boolean
  topics: TopicData[]
  studyTools: StudyToolData[]
}

interface TopicData {
  id?: string
  title: string
  description: string
  order_index?: number
  slides: { id?: string; title: string; url: string; description?: string }[]
  videos: { id?: string; title: string; url: string; description?: string }[]
}

interface StudyToolData {
  id?: string
  title: string
  type: string
  content_url: string
  exam_type: string
  description?: string
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
              title: topic.title || "",
              description: topic.description || "",
              order_index: topic.order_index || 0,
              slides: (slidesResult.data || []).map(slide => ({
                id: slide.id,
                title: slide.title || "",
                url: slide.google_drive_url || "",
                description: slide.description || ""
              })),
              videos: (videosResult.data || []).map(video => ({
                id: video.id,
                title: video.title || "",
                url: video.youtube_url || "",
                description: video.description || ""
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
          title: course.title || "",
          course_code: course.course_code || "",
          teacher_name: course.teacher_name || "",
          teacher_email: course.teacher_email || "",
          credits: course.credits || 3,
          description: course.description || "",
          is_highlighted: course.is_highlighted || false,
          topics: topicsWithContent,
          studyTools: (studyTools || []).map(tool => ({
            id: tool.id,
            title: tool.title || "",
            type: tool.type || "previous_questions",
            content_url: tool.content_url || "",
            exam_type: tool.exam_type || "both",
            description: tool.description || ""
          }))
        }
      })
    )

    const result: AllInOneData = {
      semester: {
        title: semester.title || "",
        description: semester.description || "",
        section: semester.section || "",
        has_midterm: semester.has_midterm || false,
        has_final: semester.has_final || false,
        start_date: semester.start_date || "",
        end_date: semester.end_date || "",
        default_credits: semester.default_credits || 3,
        is_active: semester.is_active || false
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

    console.log("Updating semester with ID:", id)
    console.log("Received data:", JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.semester?.title || !data.semester?.section) {
      return NextResponse.json(
        { error: "Semester title and section are required" },
        { status: 400 }
      )
    }

    // Check if semester exists
    const { data: existingSemester, error: checkError } = await db
      .from("semesters")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError || !existingSemester) {
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      )
    }

    // Update semester (only fields that exist in database)
    const semesterUpdate = {
      title: data.semester.title,
      description: data.semester.description || null,
      section: data.semester.section,
      has_midterm: data.semester.has_midterm ?? true,
      has_final: data.semester.has_final ?? true,
      start_date: data.semester.start_date || null,
      end_date: data.semester.end_date || null,
      updated_at: new Date().toISOString()
    }

    console.log("Updating semester with:", semesterUpdate)

    const { error: semesterError } = await db
      .from("semesters")
      .update(semesterUpdate)
      .eq("id", id)

    if (semesterError) {
      console.error("Semester update error:", semesterError)
      throw semesterError
    }

    // Get existing courses to determine what to update/delete/create
    const { data: existingCourses, error: existingCoursesError } = await db
      .from("courses")
      .select("id")
      .eq("semester_id", id)

    if (existingCoursesError) {
      console.error("Error fetching existing courses:", existingCoursesError)
      throw existingCoursesError
    }

    const existingCourseIds = new Set((existingCourses || []).map(c => c.id))
    const updatedCourseIds = new Set((data.courses || []).filter(c => c.id).map(c => c.id))

    // Delete courses that are no longer in the update
    const coursesToDelete = Array.from(existingCourseIds).filter(courseId => !updatedCourseIds.has(courseId))
    if (coursesToDelete.length > 0) {
      console.log("Deleting courses:", coursesToDelete)
      const { error: deleteError } = await db
        .from("courses")
        .delete()
        .in("id", coursesToDelete)

      if (deleteError) {
        console.error("Error deleting courses:", deleteError)
        throw deleteError
      }
    }

    // Process each course
    for (const course of data.courses || []) {
      if (!course.title || !course.course_code || !course.teacher_name) {
        console.warn("Skipping course with missing required fields:", course)
        continue
      }

      let courseId = course.id

      if (courseId) {
        // Update existing course
        const courseUpdate = {
          title: course.title,
          course_code: course.course_code,
          teacher_name: course.teacher_name,
          teacher_email: course.teacher_email || null,
          credits: course.credits || 3,
          description: course.description || null,
          is_highlighted: course.is_highlighted || false,
          updated_at: new Date().toISOString()
        }

        console.log("Updating course:", courseId, courseUpdate)

        const { error: courseError } = await db
          .from("courses")
          .update(courseUpdate)
          .eq("id", courseId)

        if (courseError) {
          console.error("Course update error:", courseError)
          throw courseError
        }
      } else {
        // Create new course
        const courseInsert = {
          title: course.title,
          course_code: course.course_code,
          teacher_name: course.teacher_name,
          teacher_email: course.teacher_email || null,
          credits: course.credits || 3,
          description: course.description || null,
          is_highlighted: course.is_highlighted || false,
          semester_id: id
        }

        console.log("Creating new course:", courseInsert)

        const { data: newCourse, error: courseError } = await db
          .from("courses")
          .insert([courseInsert])
          .select("id")
          .single()

        if (courseError) {
          console.error("Course creation error:", courseError)
          throw courseError
        }
        courseId = newCourse.id
      }

      // Handle topics (similar logic for update/delete/create)
      const { data: existingTopics, error: existingTopicsError } = await db
        .from("topics")
        .select("id")
        .eq("course_id", courseId)

      if (existingTopicsError) {
        console.error("Error fetching existing topics:", existingTopicsError)
        throw existingTopicsError
      }

      const existingTopicIds = new Set((existingTopics || []).map(t => t.id))
      const updatedTopicIds = new Set((course.topics || []).filter(t => t.id).map(t => t.id))

      // Delete topics that are no longer in the update
      const topicsToDelete = Array.from(existingTopicIds).filter(topicId => !updatedTopicIds.has(topicId))
      if (topicsToDelete.length > 0) {
        console.log("Deleting topics:", topicsToDelete)
        const { error: deleteError } = await db
          .from("topics")
          .delete()
          .in("id", topicsToDelete)

        if (deleteError) {
          console.error("Error deleting topics:", deleteError)
          throw deleteError
        }
      }

      // Process topics
      for (let topicIndex = 0; topicIndex < (course.topics || []).length; topicIndex++) {
        const topic = course.topics[topicIndex]

        if (!topic.title) {
          console.warn("Skipping topic with missing title:", topic)
          continue
        }

        let topicId = topic.id

        if (topicId) {
          // Update existing topic
          const topicUpdate = {
            title: topic.title,
            description: topic.description || null,
            order_index: topicIndex,
            updated_at: new Date().toISOString()
          }

          console.log("Updating topic:", topicId, topicUpdate)

          const { error: topicError } = await db
            .from("topics")
            .update(topicUpdate)
            .eq("id", topicId)

          if (topicError) {
            console.error("Topic update error:", topicError)
            throw topicError
          }
        } else {
          // Create new topic
          const topicInsert = {
            title: topic.title,
            description: topic.description || null,
            course_id: courseId,
            order_index: topicIndex
          }

          console.log("Creating new topic:", topicInsert)

          const { data: newTopic, error: topicError } = await db
            .from("topics")
            .insert([topicInsert])
            .select("id")
            .single()

          if (topicError) {
            console.error("Topic creation error:", topicError)
            throw topicError
          }
          topicId = newTopic.id
        }

        // Handle slides and videos (delete all and recreate for simplicity)
        console.log("Deleting existing slides and videos for topic:", topicId)

        const [slidesDeleteResult, videosDeleteResult] = await Promise.all([
          db.from("slides").delete().eq("topic_id", topicId),
          db.from("videos").delete().eq("topic_id", topicId)
        ])

        if (slidesDeleteResult.error) {
          console.error("Error deleting slides:", slidesDeleteResult.error)
          throw slidesDeleteResult.error
        }

        if (videosDeleteResult.error) {
          console.error("Error deleting videos:", videosDeleteResult.error)
          throw videosDeleteResult.error
        }

        // Create new slides
        if (topic.slides && topic.slides.length > 0) {
          const slidesToInsert = topic.slides
            .filter(slide => slide.title && slide.url)
            .map((slide, index) => ({
              title: slide.title,
              google_drive_url: slide.url,
              description: slide.description || null,
              topic_id: topicId,
              order_index: index
            }))

          if (slidesToInsert.length > 0) {
            console.log("Inserting slides:", slidesToInsert)
            const { error: slidesError } = await db
              .from("slides")
              .insert(slidesToInsert)

            if (slidesError) {
              console.error("Slides insertion error:", slidesError)
              throw slidesError
            }
          }
        }

        // Create new videos
        if (topic.videos && topic.videos.length > 0) {
          const videosToInsert = topic.videos
            .filter(video => video.title && video.url)
            .map((video, index) => ({
              title: video.title,
              youtube_url: video.url,
              description: video.description || null,
              topic_id: topicId,
              order_index: index
            }))

          if (videosToInsert.length > 0) {
            console.log("Inserting videos:", videosToInsert)
            const { error: videosError } = await db
              .from("videos")
              .insert(videosToInsert)

            if (videosError) {
              console.error("Videos insertion error:", videosError)
              throw videosError
            }
          }
        }
      }

      // Handle study tools (delete all and recreate)
      console.log("Deleting existing study tools for course:", courseId)

      const { error: deleteStudyToolsError } = await db
        .from("study_tools")
        .delete()
        .eq("course_id", courseId)

      if (deleteStudyToolsError) {
        console.error("Error deleting study tools:", deleteStudyToolsError)
        throw deleteStudyToolsError
      }

      if (course.studyTools && course.studyTools.length > 0) {
        const studyToolsToInsert = course.studyTools
          .filter(tool => tool.title && tool.type && tool.exam_type)
          .map(tool => {
            const toolData: any = {
              title: tool.title,
              type: tool.type,
              content_url: tool.content_url || null,
              course_id: courseId,
              exam_type: tool.exam_type
            }

            // Only add description if it has a value
            if (tool.description) {
              toolData.description = tool.description
            }

            return toolData
          })

        if (studyToolsToInsert.length > 0) {
          console.log("Inserting study tools:", studyToolsToInsert)
          const { error: studyToolsError } = await db
            .from("study_tools")
            .insert(studyToolsToInsert)

          if (studyToolsError) {
            console.error("Study tools insertion error:", studyToolsError)
            throw studyToolsError
          }
        }
      }
    }

    console.log("Successfully updated semester and all content")

    return NextResponse.json({
      success: true,
      message: "Successfully updated semester and all content",
      semesterId: id
    })

  } catch (error) {
    console.error("Error updating semester:", error)

    // Provide more detailed error information
    let errorMessage = "Internal server error"
    let errorDetails = null

    if (error && typeof error === 'object') {
      if ('message' in error) {
        errorMessage = error.message
      }
      if ('code' in error) {
        errorDetails = {
          code: error.code,
          details: error.details || null,
          hint: error.hint || null
        }
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        success: false
      },
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
