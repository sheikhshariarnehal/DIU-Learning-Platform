import { NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

export async function GET() {
  try {
    const db = createDB()

    console.log("Fetching semesters from database...")

    // Start with basic fields that should always exist
    const { data: semesters, error: semestersError } = await db
      .from("semesters")
      .select("*") // Select all fields to see what's available
      .order('is_active', { ascending: false }) // Active semesters first
      .order('updated_at', { ascending: false }) // Then by update date

    if (semestersError) {
      console.error("Error fetching semesters:", semestersError)
      console.error("Error code:", semestersError.code)
      console.error("Error details:", semestersError.details)
      console.error("Error hint:", semestersError.hint)
      return NextResponse.json({
        success: false,
        error: "Database error",
        details: semestersError.message,
        code: semestersError.code,
        hint: semestersError.hint
      }, { status: 500 })
    }

    console.log(`Found ${semesters?.length || 0} semesters`)
    if (semesters && semesters.length > 0) {
      console.log("Sample semester data:", JSON.stringify(semesters[0], null, 2))
      console.log("Available fields:", Object.keys(semesters[0]))
    }

    // Return simple response without complex counting for now
    const semestersWithBasicCounts = (semesters || []).map(semester => ({
      ...semester,
      is_active: semester.is_active ?? true, // Default to true if not set
      default_credits: semester.default_credits ?? semester.credits ?? 3, // Try both field names
      start_date: semester.start_date ?? null,
      end_date: semester.end_date ?? null,
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
