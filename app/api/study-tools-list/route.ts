import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching all study tools...")
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("study_tools")
      .select(`
        id,
        title,
        google_drive_url,
        description,
        study_tool_type,
        topic:topics (
          id,
          title,
          course:courses (
            id,
            title
          )
        )
      `)
      .limit(10)

    if (error) {
      console.error("Error fetching study tools:", error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log(`Found ${data?.length || 0} study tools`)
    
    return NextResponse.json({ 
      success: true,
      count: data?.length || 0,
      studyTools: data || []
    })
    
  } catch (err) {
    console.error("API Error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch study tools",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
