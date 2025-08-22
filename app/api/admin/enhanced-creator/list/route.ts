import { NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

export async function GET() {
  try {
    const db = createDB()

    console.log("Fetching semesters from database...")

    // Get all semesters with basic info
    const { data: semesters, error: semestersError } = await db
      .from("semesters")
      .select(`
        id,
        title,
        description,
        section,
        has_midterm,
        has_final,
        start_date,
        end_date,
        created_at,
        updated_at
      `)
      .order('updated_at', { ascending: false })

    if (semestersError) {
      console.error("Error fetching semesters:", semestersError)
      return NextResponse.json({
        success: false,
        error: "Database error",
        details: semestersError.message
      }, { status: 500 })
    }

    console.log(`Found ${semesters?.length || 0} semesters`)

    // Return simple response without complex counting for now
    const semestersWithBasicCounts = (semesters || []).map(semester => ({
      ...semester,
      courses_count: 0,
      topics_count: 0,
      materials_count: 0,
      study_tools_count: 0
    }))

    return NextResponse.json({
      success: true,
      semesters: semestersWithBasicCounts,
      total: semestersWithBasicCounts.length,
      message: semestersWithBasicCounts.length === 0 ? "No semesters found" : "Semesters loaded successfully"
    })

  } catch (error) {
    console.error("Error in enhanced creator list API:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch semesters list",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
