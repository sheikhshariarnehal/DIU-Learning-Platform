import { NextResponse } from "next/server"
import { fetchSemesters } from "@/lib/supabase"

export async function GET() {
  try {
    const semesters = await fetchSemesters()
    return NextResponse.json(semesters)
  } catch (error: any) {
    console.error("Error fetching semesters:", error)
    return NextResponse.json({ error: "Failed to fetch semesters" }, { status: 500 })
  }
}
