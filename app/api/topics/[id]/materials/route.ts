import { NextResponse } from "next/server"
import { fetchTopicMaterials } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const materials = await fetchTopicMaterials(params.id)
    return NextResponse.json(materials)
  } catch (error: any) {
    console.error("Error fetching topic materials:", error)
    return NextResponse.json({ error: "Failed to fetch topic materials" }, { status: 500 })
  }
}
