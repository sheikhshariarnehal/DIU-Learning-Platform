import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Fetching all videos...")
    
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("videos")
      .select(`
        id,
        title,
        youtube_url,
        description,
        duration,
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
      console.error("Error fetching videos:", error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code
      }, { status: 500 })
    }

    console.log(`Found ${data?.length || 0} videos`)
    
    return NextResponse.json({ 
      success: true,
      count: data?.length || 0,
      videos: data || []
    })
    
  } catch (err) {
    console.error("API Error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch videos",
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
