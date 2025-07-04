import { NextResponse } from "next/server"
import { fetchTopicsByCourse } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const topics = await fetchTopicsByCourse(params.id)
    return NextResponse.json(topics)
  } catch (error: any) {
    console.error("Error fetching topics:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}
