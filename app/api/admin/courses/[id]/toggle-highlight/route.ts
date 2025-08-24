import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDB()

    // Get current course highlighting status
    const { data: currentCourse, error: fetchError } = await db
      .from("courses")
      .select("is_highlighted, title")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      throw fetchError
    }

    // Toggle the highlighting status
    const newHighlightStatus = !currentCourse.is_highlighted

    const { data, error } = await db
      .from("courses")
      .update({ 
        is_highlighted: newHighlightStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id, title, is_highlighted")
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        is_highlighted: data.is_highlighted,
        message: `Course "${data.title}" ${newHighlightStatus ? 'highlighted' : 'unhighlighted'} successfully`
      }
    })

  } catch (error) {
    console.error("Error toggling course highlight status:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to toggle course highlight status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
