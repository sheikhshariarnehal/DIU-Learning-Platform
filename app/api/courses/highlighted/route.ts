import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        course_code,
        teacher_name,
        teacher_email,
        description,
        credits,
        is_highlighted,
        created_at,
        updated_at,
        semester:semesters (
          id,
          title,
          section,
          is_active
        )
      `)
      .eq("is_highlighted", true)
      .eq("semesters.is_active", true) // Only get highlighted courses from active semesters
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter out courses from inactive semesters (additional safety check)
    const filteredData = (data || []).filter(course => course.semester?.is_active !== false)

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error("Error fetching highlighted courses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
