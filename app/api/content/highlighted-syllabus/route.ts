import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get the first highlighted course from an active semester
    const { data: highlightedCourses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        course_code,
        teacher_name,
        semester:semesters (
          id,
          title,
          section,
          is_active
        )
      `)
      .eq("is_highlighted", true)
      .eq("semesters.is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)

    if (coursesError) {
      console.error("Error fetching highlighted courses:", coursesError)
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }

    if (!highlightedCourses || highlightedCourses.length === 0) {
      return NextResponse.json({ message: "No highlighted courses found" }, { status: 404 })
    }

    const course = highlightedCourses[0]

    // Get the syllabus for this course
    const { data: syllabus, error: syllabusError } = await supabase
      .from("study_tools")
      .select("*")
      .eq("course_id", course.id)
      .eq("type", "syllabus")
      .limit(1)

    if (syllabusError) {
      console.error("Error fetching syllabus:", syllabusError)
      return NextResponse.json({ error: syllabusError.message }, { status: 500 })
    }

    if (!syllabus || syllabus.length === 0) {
      return NextResponse.json({ message: "No syllabus found for highlighted course" }, { status: 404 })
    }

    const syllabusData = syllabus[0]

    // Return the syllabus content in the format expected by ContentViewer
    const contentItem = {
      type: "syllabus" as const,
      title: syllabusData.title,
      url: `#syllabus-${syllabusData.id}`,
      id: syllabusData.id,
      courseTitle: course.title,
      description: syllabusData.description,
      courseCode: course.course_code,
      teacherName: course.teacher_name,
      semesterInfo: course.semester
    }

    return NextResponse.json(contentItem)
  } catch (error) {
    console.error("Error in highlighted-syllabus API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
