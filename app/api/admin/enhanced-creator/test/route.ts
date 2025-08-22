import { NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

export async function GET() {
  try {
    const db = createDB()

    // Test basic database connection
    const { data: semesters, error: semestersError } = await db
      .from("semesters")
      .select("id, title, section, created_at")
      .limit(5)

    if (semestersError) {
      console.error("Database error:", semestersError)
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: semestersError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      semesters_count: semesters?.length || 0,
      sample_semesters: semesters || []
    })

  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({
      success: false,
      error: "API endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
