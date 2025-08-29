import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing Supabase connection...")
    
    const supabase = createClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from("slides")
      .select("id, title")
      .limit(1)
    
    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Supabase connection working",
      sampleData: data
    })
    
  } catch (err) {
    console.error("Connection test error:", err)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to test connection",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
