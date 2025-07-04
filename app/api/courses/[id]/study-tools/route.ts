import { NextResponse } from "next/server"
import { fetchStudyToolsByCourse, createStudyTool } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const studyTools = await fetchStudyToolsByCourse(params.id)
    return NextResponse.json(studyTools)
  } catch (error: any) {
    console.error("Error fetching study tools:", error)
    return NextResponse.json({ error: "Failed to fetch study tools" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.section_id || !body.tool_type || !body.url) {
      return NextResponse.json(
        { error: "Missing required fields: name, section_id, tool_type, url" },
        { status: 400 }
      )
    }

    // Create the study tool
    const studyTool = await createStudyTool({
      name: body.name,
      section_id: body.section_id,
      tool_type: body.tool_type,
      url: body.url,
      icon_name: body.icon_name,
      order_index: body.order_index || 1,
      is_active: body.is_active !== undefined ? body.is_active : true,
    })

    return NextResponse.json(studyTool, { status: 201 })
  } catch (error: any) {
    console.error("Error creating study tool:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create study tool" },
      { status: 500 }
    )
  }
}
