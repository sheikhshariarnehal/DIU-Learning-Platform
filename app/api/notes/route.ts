import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { ExamNote, NotesApiResponse } from "@/lib/types/notes"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const examType = searchParams.get("examType")
    const semester = searchParams.get("semester")
    const courseCode = searchParams.get("courseCode")

    const supabase = createClient()

    // Build the query
    let query = supabase
      .from("study_tools")
      .select(`
        id,
        title,
        description,
        content_url,
        file_format,
        file_size_mb,
        exam_type,
        academic_year,
        is_downloadable,
        download_count,
        created_at,
        updated_at,
        courses:course_id (
          title,
          course_code,
          teacher_name,
          semesters:semester_id (
            title,
            section
          )
        )
      `)
      .eq("type", "exam_note")
      .order("created_at", { ascending: false })

    // Apply filters
    if (examType && examType !== "all") {
      query = query.eq("exam_type", examType)
    }

    // Execute the query
    const { data, error } = await query

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch exam notes"
        } as NotesApiResponse,
        { status: 500 }
      )
    }

    // Transform the data to match our ExamNote interface
    const examNotes: ExamNote[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      content_url: item.content_url,
      file_format: item.file_format,
      file_size_mb: item.file_size_mb,
      exam_type: item.exam_type,
      academic_year: item.academic_year,
      is_downloadable: item.is_downloadable,
      download_count: item.download_count,
      created_at: item.created_at,
      updated_at: item.updated_at,
      course_title: item.courses?.title || null,
      course_code: item.courses?.course_code || null,
      teacher_name: item.courses?.teacher_name || null,
      semester_title: item.courses?.semesters?.title || null,
      section: item.courses?.semesters?.section || null
    }))

    // Apply client-side filters
    let filteredNotes = examNotes

    if (search) {
      const searchLower = search.toLowerCase()
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.course_title?.toLowerCase().includes(searchLower) ||
          note.course_code?.toLowerCase().includes(searchLower) ||
          note.teacher_name?.toLowerCase().includes(searchLower) ||
          note.description?.toLowerCase().includes(searchLower)
      )
    }

    if (semester && semester !== "all") {
      filteredNotes = filteredNotes.filter((note) => note.semester_title === semester)
    }

    if (courseCode && courseCode !== "all") {
      filteredNotes = filteredNotes.filter((note) => note.course_code === courseCode)
    }

    return NextResponse.json({
      success: true,
      data: filteredNotes
    } as NotesApiResponse)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error"
      } as NotesApiResponse,
      { status: 500 }
    )
  }
}
