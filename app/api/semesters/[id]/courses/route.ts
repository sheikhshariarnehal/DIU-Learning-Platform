import { NextResponse } from "next/server"
import { fetchCoursesBySemester } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const courses = await fetchCoursesBySemester(params.id)
    return NextResponse.json(courses)
  } catch (error: any) {
    console.error("Error fetching courses for semester:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
