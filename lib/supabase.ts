import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Enhanced types for our database tables
export interface Semester {
  id: string
  name: string
  code: string
  exam_type: "midterm" | "final" // DB column
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  code: string
  name: string
  description?: string
  semester_id: string
  textbook_url?: string
  slides_url?: string
  previous_questions_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  semester?: Semester
  sections?: Section[]
}

export interface Section {
  id: string
  name: string
  course_id: string
  section_type: "study-tools" | "topics"
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  course?: Course
  study_tools?: StudyTool[]
  topics?: Topic[]
}

export interface StudyTool {
  id: string
  name: string
  section_id: string
  tool_type: "pdf" | "link" | "document"
  url: string
  icon_name?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  section?: Section
}

export interface Topic {
  id: string
  title: string
  description?: string
  section_id: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  section?: Section
  slides?: Slide[]
  videos?: Video[]
}

export interface Slide {
  id: string
  topic_id: string
  title: string
  slide_url: string
  slide_type: "pdf" | "ppt" | "image"
  order_index: number
  created_at: string
  topic?: Topic
}

export interface Video {
  id: string
  topic_id: string
  title: string
  video_url: string
  duration?: string
  thumbnail_url?: string
  video_type: "youtube" | "vimeo" | "direct"
  created_at: string
  topic?: Topic
}

export interface Lecture {
  id: string
  title: string
  description?: string
  duration?: string
  video_url?: string
  section_id: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  section?: Section
}

// Bulk import interfaces
export interface BulkImportData {
  semesters: BulkSemester[]
}

export interface BulkSemester {
  name: string
  courses: BulkCourse[]
}

export interface BulkCourse {
  name: string
  studyTools: string[]
  topics: BulkTopic[]
}

export interface BulkTopic {
  title: string
  slides?: BulkSlide[]
  videos?: BulkVideo[]
}

export interface BulkSlide {
  title: string
  url: string
  type?: "pdf" | "ppt" | "image"
}

export interface BulkVideo {
  title: string
  url: string
  duration?: string
}

// Validation functions
export const validateTopicTitle = async (
  title: string,
  sectionId: string,
  excludeTopicId?: string,
): Promise<boolean> => {
  let query = supabase.from("topics").select("id").eq("section_id", sectionId).eq("title", title.trim())

  if (excludeTopicId) {
    query = query.neq("id", excludeTopicId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length === 0
}

export const validateSlideTitle = async (title: string, topicId: string, excludeSlideId?: string): Promise<boolean> => {
  let query = supabase.from("slides").select("id").eq("topic_id", topicId).eq("title", title.trim())

  if (excludeSlideId) {
    query = query.neq("id", excludeSlideId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length === 0
}

export const validateVideoTitle = async (title: string, topicId: string, excludeVideoId?: string): Promise<boolean> => {
  let query = supabase.from("videos").select("id").eq("topic_id", topicId).eq("title", title.trim())

  if (excludeVideoId) {
    query = query.neq("id", excludeVideoId)
  }

  const { data, error } = await query

  if (error) throw error
  return data.length === 0
}

// Enhanced API functions for fetching hierarchical data
export const fetchSemesters = async (): Promise<Semester[]> => {
  const { data, error } = await supabase
    .from("semesters")
    .select("*")
    .eq("is_active", true)
    .order("exam_type", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Semester[]
}

export const fetchSemesterWithCourses = async (semesterId: string): Promise<Semester & { courses: Course[] }> => {
  const { data: semester, error: semesterError } = await supabase
    .from("semesters")
    .select("*")
    .eq("id", semesterId)
    .eq("is_active", true)
    .single()

  if (semesterError) throw semesterError

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("*")
    .eq("semester_id", semesterId)
    .eq("is_active", true)
    .order("code")

  if (coursesError) throw coursesError

  return { ...semester, courses: courses || [] } as Semester & { courses: Course[] }
}

export const fetchCourseWithFullHierarchy = async (courseId: string): Promise<Course> => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      semester:semesters(*),
      sections:sections(
        *,
        study_tools:study_tools(*),
        topics:topics(
          *,
          slides:slides(*),
          videos:videos(*)
        )
      )
    `)
    .eq("id", courseId)
    .eq("is_active", true)
    .single()

  if (error) throw error
  return data as Course
}

export const fetchCoursesBySemester = async (semesterId: string): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      semester:semesters(*),
      sections:sections(
        *,
        study_tools:study_tools(
          *
        ),
        topics:topics(
          *,
          slides:slides(*),
          videos:videos(*)
        )
      )
    `)
    .eq("semester_id", semesterId)
    .eq("is_active", true)
    .order("code")

  if (error) throw error
  return data as Course[]
}

export const fetchTopicWithContent = async (topicId: string): Promise<Topic> => {
  const { data, error } = await supabase
    .from("topics")
    .select(`
      *,
      slides:slides(*),
      videos:videos(*),
      section:sections(
        *,
        course:courses(*)
      )
    `)
    .eq("id", topicId)
    .single()

  if (error) throw error
  return data as Topic
}

export const fetchTopicsBySection = async (sectionId: string): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from("topics")
    .select(`
      *,
      slides:slides(*),
      videos:videos(*)
    `)
    .eq("section_id", sectionId)
    .eq("is_active", true)
    .order("order_index")

  if (error) throw error
  return data as Topic[]
}

export const fetchStudyToolsByCourse = async (courseId: string): Promise<StudyTool[]> => {
  const { data, error } = await supabase
    .from("study_tools")
    .select(`
      *,
      section:sections!inner(
        id,
        name,
        course_id
      )
    `)
    .eq("section.course_id", courseId)
    .eq("is_active", true)
    .order("order_index")

  if (error) throw error
  return data as StudyTool[]
}

export const fetchTopicsByCourse = async (courseId: string): Promise<Topic[]> => {
  const { data, error } = await supabase
    .from("topics")
    .select(`
      *,
      slides:slides(*),
      videos:videos(*),
      section:sections!inner(
        id,
        name,
        course_id
      )
    `)
    .eq("section.course_id", courseId)
    .eq("is_active", true)
    .order("order_index")

  if (error) throw error
  return data as Topic[]
}

export const fetchTopicMaterials = async (topicId: string): Promise<{ slides: Slide[], videos: Video[] }> => {
  const { data: slides, error: slidesError } = await supabase
    .from("slides")
    .select("*")
    .eq("topic_id", topicId)
    .order("order_index")

  if (slidesError) throw slidesError

  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at")

  if (videosError) throw videosError

  return {
    slides: slides as Slide[],
    videos: videos as Video[]
  }
}

// Frontend-specific data transformation functions
export const transformToFrontendFormat = async () => {
  try {
    const semesters = await fetchSemesters()

    const transformedSemesters = await Promise.all(
      semesters.map(async (semester) => {
        const courses = await fetchCoursesBySemester(semester.id)

        const transformedCourses = courses.map((course) => ({
          code: course.code,
          name: course.name,
          sections:
            course.sections?.map((section) => ({
              id: section.id,
              name: section.name,
              type: section.section_type,
              studyTools:
                section.section_type === "study-tools"
                  ? section.study_tools
                      ?.filter((tool) => tool.is_active)
                      ?.map((tool) => ({
                        id: tool.id,
                        name: tool.name,
                        type: tool.tool_type,
                        url: tool.url,
                        icon: getIconComponent(tool.icon_name || "FileText"),
                      }))
                  : undefined,
              topics:
                section.section_type === "topics"
                  ? section.topics
                      ?.filter((topic) => topic.is_active)
                      ?.sort((a, b) => a.order_index - b.order_index)
                      ?.map((topic) => ({
                        id: topic.id,
                        title: topic.title,
                        description: topic.description,
                        slides: topic.slides
                          ?.sort((a, b) => a.order_index - b.order_index)
                          ?.map((slide) => ({
                            id: slide.id,
                            title: slide.title,
                            url: slide.slide_url,
                            type: slide.slide_type,
                          })),
                        videos: topic.videos?.map((video) => ({
                          id: video.id,
                          title: video.title,
                          url: video.video_url,
                          duration: video.duration || "0:00",
                          thumbnail: video.thumbnail_url,
                        })),
                      }))
                  : undefined,
            })) || [],
        }))

        return {
          id: semester.id,
          name: semester.name,
          type: semester.exam_type,
          courses: transformedCourses,
        }
      }),
    )

    return transformedSemesters
  } catch (error) {
    console.error("Error in transformToFrontendFormat:", error)
    throw error
  }
}

// Helper function to get icon components
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    FileQuestion: "FileQuestion",
    FileText: "FileText",
    BookOpen: "BookOpen",
    BarChart: "BarChart",
    Download: "Download",
    Info: "Info",
  }

  return iconMap[iconName] || "FileText"
}

// CRUD operations for admin dashboard
export const createSemester = async (semester: Omit<Semester, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("semesters").insert([semester]).select().single()

  if (error) throw error
  return data as Semester
}

export const updateSemester = async (id: string, updates: Partial<Semester>) => {
  const { data, error } = await supabase.from("semesters").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as Semester
}

export const deleteSemester = async (id: string) => {
  const { error } = await supabase.from("semesters").delete().eq("id", id)

  if (error) throw error
}

export const createCourse = async (course: Omit<Course, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("courses").insert([course]).select().single()

  if (error) throw error
  return data as Course
}

export const updateCourse = async (id: string, updates: Partial<Course>) => {
  const { data, error } = await supabase.from("courses").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as Course
}

export const deleteCourse = async (id: string) => {
  const { error } = await supabase.from("courses").delete().eq("id", id)

  if (error) throw error
}

export const createStudyTool = async (studyTool: Omit<StudyTool, "id" | "created_at" | "updated_at">) => {
  const { data, error } = await supabase.from("study_tools").insert([studyTool]).select().single()

  if (error) throw error
  return data as StudyTool
}

export const updateStudyTool = async (id: string, updates: Partial<StudyTool>) => {
  const { data, error } = await supabase.from("study_tools").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as StudyTool
}

export const deleteStudyTool = async (id: string) => {
  const { error } = await supabase.from("study_tools").delete().eq("id", id)

  if (error) throw error
}

export const createTopic = async (topic: Omit<Topic, "id" | "created_at" | "updated_at">) => {
  // Validate title uniqueness
  const isUnique = await validateTopicTitle(topic.title, topic.section_id)
  if (!isUnique) {
    throw new Error("A topic with this title already exists in this section")
  }

  const { data, error } = await supabase.from("topics").insert([topic]).select().single()

  if (error) throw error
  return data as Topic
}

export const updateTopic = async (id: string, updates: Partial<Topic>) => {
  // Validate title uniqueness if title is being updated
  if (updates.title && updates.section_id) {
    const isUnique = await validateTopicTitle(updates.title, updates.section_id, id)
    if (!isUnique) {
      throw new Error("A topic with this title already exists in this section")
    }
  }

  const { data, error } = await supabase.from("topics").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as Topic
}

export const deleteTopic = async (id: string) => {
  const { error } = await supabase.from("topics").delete().eq("id", id)

  if (error) throw error
}

export const reorderTopics = async (topicIds: string[]) => {
  const updates = topicIds.map((id, index) => ({
    id,
    order_index: index + 1,
  }))

  for (const update of updates) {
    await supabase.from("topics").update({ order_index: update.order_index }).eq("id", update.id)
  }
}

export const createSlide = async (slide: Omit<Slide, "id" | "created_at">) => {
  // Validate title uniqueness
  const isUnique = await validateSlideTitle(slide.title, slide.topic_id)
  if (!isUnique) {
    throw new Error("A slide with this title already exists in this topic")
  }

  const { data, error } = await supabase.from("slides").insert([slide]).select().single()

  if (error) throw error
  return data as Slide
}

export const updateSlide = async (id: string, updates: Partial<Slide>) => {
  // Validate title uniqueness if title is being updated
  if (updates.title && updates.topic_id) {
    const isUnique = await validateSlideTitle(updates.title, updates.topic_id, id)
    if (!isUnique) {
      throw new Error("A slide with this title already exists in this topic")
    }
  }

  const { data, error } = await supabase.from("slides").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as Slide
}

export const deleteSlide = async (id: string) => {
  const { error } = await supabase.from("slides").delete().eq("id", id)

  if (error) throw error
}

export const reorderSlides = async (slideIds: string[]) => {
  const updates = slideIds.map((id, index) => ({
    id,
    order_index: index + 1,
  }))

  for (const update of updates) {
    await supabase.from("slides").update({ order_index: update.order_index }).eq("id", update.id)
  }
}

export const createVideo = async (video: Omit<Video, "id" | "created_at">) => {
  // Validate title uniqueness
  const isUnique = await validateVideoTitle(video.title, video.topic_id)
  if (!isUnique) {
    throw new Error("A video with this title already exists in this topic")
  }

  const { data, error } = await supabase.from("videos").insert([video]).select().single()

  if (error) throw error
  return data as Video
}

export const updateVideo = async (id: string, updates: Partial<Video>) => {
  // Validate title uniqueness if title is being updated
  if (updates.title && updates.topic_id) {
    const isUnique = await validateVideoTitle(updates.title, updates.topic_id, id)
    if (!isUnique) {
      throw new Error("A video with this title already exists in this topic")
    }
  }

  const { data, error } = await supabase.from("videos").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data as Video
}

export const deleteVideo = async (id: string) => {
  const { error } = await supabase.from("videos").delete().eq("id", id)

  if (error) throw error
}

// Bulk import function
export const bulkImportData = async (
  importData: BulkImportData,
): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    const results = {
      semesters: 0,
      courses: 0,
      sections: 0,
      studyTools: 0,
      topics: 0,
      slides: 0,
      videos: 0,
    }

    for (const semesterData of importData.semesters) {
      // Create semester
      const semesterType = semesterData.name.toLowerCase().includes("midterm") ? "midterm" : "final"
      const semester = await createSemester({
        name: semesterData.name,
        code: semesterData.name.replace(/\s+/g, "_").toUpperCase(),
        exam_type: semesterType,
        is_active: true,
      })
      results.semesters++

      for (const courseData of semesterData.courses) {
        // Extract course code from name (e.g., "Information Security (CSE423)" -> "CSE423")
        const codeMatch = courseData.name.match(/$$([^)]+)$$/)
        const courseCode = codeMatch ? codeMatch[1] : courseData.name.substring(0, 10).toUpperCase()
        const courseName = courseData.name.replace(/\s*$$[^)]*$$/, "").trim()

        // Create course
        const course = await createCourse({
          code: courseCode,
          name: courseName,
          semester_id: semester.id,
          is_active: true,
        })
        results.courses++

        // Create study tools section if there are study tools
        if (courseData.studyTools && courseData.studyTools.length > 0) {
          const studyToolsSection = await supabase
            .from("sections")
            .insert([
              {
                name: "Study Tools",
                course_id: course.id,
                section_type: "study-tools",
                order_index: 1,
                is_active: true,
              },
            ])
            .select()
            .single()

          if (studyToolsSection.error) throw studyToolsSection.error
          results.sections++

          // Create study tools
          for (let i = 0; i < courseData.studyTools.length; i++) {
            const toolName = courseData.studyTools[i]
            await createStudyTool({
              name: toolName,
              section_id: studyToolsSection.data.id,
              tool_type: "pdf",
              url: `#${toolName.replace(/\s+/g, "-").toLowerCase()}`,
              order_index: i + 1,
              is_active: true,
            })
            results.studyTools++
          }
        }

        // Create topics section if there are topics
        if (courseData.topics && courseData.topics.length > 0) {
          const topicsSection = await supabase
            .from("sections")
            .insert([
              {
                name: "Topics",
                course_id: course.id,
                section_type: "topics",
                order_index: 2,
                is_active: true,
              },
            ])
            .select()
            .single()

          if (topicsSection.error) throw topicsSection.error
          results.sections++

          // Create topics
          for (let i = 0; i < courseData.topics.length; i++) {
            const topicData = courseData.topics[i]
            const topic = await createTopic({
              title: topicData.title,
              section_id: topicsSection.data.id,
              order_index: i + 1,
              is_active: true,
            })
            results.topics++

            // Create slides if provided
            if (topicData.slides && topicData.slides.length > 0) {
              for (let j = 0; j < topicData.slides.length; j++) {
                const slideData = topicData.slides[j]
                await createSlide({
                  topic_id: topic.id,
                  title: slideData.title,
                  slide_url: slideData.url,
                  slide_type: slideData.type || "pdf",
                  order_index: j + 1,
                })
                results.slides++
              }
            }

            // Create videos if provided
            if (topicData.videos && topicData.videos.length > 0) {
              for (let j = 0; j < topicData.videos.length; j++) {
                const videoData = topicData.videos[j]
                const videoType = videoData.url.includes("youtube")
                  ? "youtube"
                  : videoData.url.includes("vimeo")
                    ? "vimeo"
                    : "direct"

                await createVideo({
                  topic_id: topic.id,
                  title: videoData.title,
                  video_url: videoData.url,
                  video_type: videoType,
                  duration: videoData.duration,
                })
                results.videos++
              }
            }
          }
        }
      }
    }

    return {
      success: true,
      message: `Successfully imported data!`,
      details: results,
    }
  } catch (error) {
    console.error("Bulk import error:", error)
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
