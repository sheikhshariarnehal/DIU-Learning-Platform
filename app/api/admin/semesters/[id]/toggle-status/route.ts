import { NextResponse, type NextRequest } from "next/server"
import { createDB } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = createDB()

    // Get current semester status
    const { data: currentSemester, error: fetchError } = await db
      .from("semesters")
      .select("is_active")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Semester not found" }, { status: 404 })
      }
      throw fetchError
    }

    // Toggle the status
    const newStatus = !currentSemester.is_active

    const { data, error } = await db
      .from("semesters")
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        is_active: data.is_active,
        message: `Semester ${newStatus ? 'activated' : 'deactivated'} successfully`
      }
    })

  } catch (error) {
    console.error("Error toggling semester status:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to toggle semester status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
