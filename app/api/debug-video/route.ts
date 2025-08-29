import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== DEBUG VIDEO API ===")
    
    // Test 1: Basic Supabase connection
    console.log("1. Testing Supabase connection...")
    const supabase = createClient()
    console.log("✅ Supabase client created")
    
    // Test 2: Check if videos table exists
    console.log("2. Testing videos table access...")
    const { data: tableTest, error: tableError } = await supabase
      .from("videos")
      .select("count")
      .limit(1)
    
    if (tableError) {
      console.error("❌ Videos table error:", tableError)
      return NextResponse.json({
        success: false,
        step: "table_access",
        error: tableError.message,
        details: tableError
      }, { status: 500 })
    }
    
    console.log("✅ Videos table accessible")
    
    // Test 3: Get basic video data
    console.log("3. Testing basic video query...")
    const { data: videos, error: videosError } = await supabase
      .from("videos")
      .select("id, title, youtube_url")
      .limit(3)
    
    if (videosError) {
      console.error("❌ Videos query error:", videosError)
      return NextResponse.json({
        success: false,
        step: "basic_query",
        error: videosError.message,
        details: videosError
      }, { status: 500 })
    }
    
    console.log(`✅ Found ${videos?.length || 0} videos`)
    
    // Test 4: Test complex query with relationships
    console.log("4. Testing complex query with relationships...")
    const { data: complexVideos, error: complexError } = await supabase
      .from("videos")
      .select(`
        id,
        title,
        youtube_url,
        topic:topics (
          id,
          title,
          course:courses (
            id,
            title
          )
        )
      `)
      .limit(1)
    
    if (complexError) {
      console.error("❌ Complex query error:", complexError)
      return NextResponse.json({
        success: false,
        step: "complex_query",
        error: complexError.message,
        details: complexError,
        basicVideos: videos
      }, { status: 500 })
    }
    
    console.log("✅ Complex query successful")
    
    return NextResponse.json({
      success: true,
      message: "All video API tests passed",
      results: {
        tableAccess: "✅ Success",
        basicQuery: `✅ Found ${videos?.length || 0} videos`,
        complexQuery: `✅ Found ${complexVideos?.length || 0} videos with relationships`,
        sampleVideos: videos,
        sampleComplexVideo: complexVideos?.[0] || null
      }
    })
    
  } catch (err) {
    console.error("❌ Debug video API error:", err)
    return NextResponse.json({
      success: false,
      step: "general_error",
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : 'No stack trace'
    }, { status: 500 })
  }
}
