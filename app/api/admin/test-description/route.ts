import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Test if we can access the description column
    const { data, error } = await supabase
      .from('study_tools')
      .select('id, title, description, type')
      .limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Cannot access description column',
        error: error.message,
        columnExists: false
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Description column exists and is accessible',
      columnExists: true,
      sampleData: data
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      columnExists: false
    })
  }
}
