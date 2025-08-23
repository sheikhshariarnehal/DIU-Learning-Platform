import { NextResponse } from "next/server"
import { createDB } from "@/lib/supabase"

export async function GET() {
  try {
    const db = createDB()
    
    console.log("Testing database connection...")
    
    // Test basic connection
    const { data: testData, error: testError } = await db
      .from("semesters")
      .select("count")
      .limit(1)
    
    if (testError) {
      console.error("Database test error:", testError)
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: testError.message,
        code: testError.code,
        hint: testError.hint
      }, { status: 500 })
    }
    
    // Test table structure
    const { data: structureData, error: structureError } = await db
      .from("semesters")
      .select("id, title, is_active, default_credits")
      .limit(1)
    
    if (structureError) {
      console.error("Database structure error:", structureError)
      return NextResponse.json({
        success: false,
        error: "Database structure issue",
        details: structureError.message,
        code: structureError.code,
        hint: structureError.hint
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      testData,
      structureData
    })
    
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({
      success: false,
      error: "API error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
