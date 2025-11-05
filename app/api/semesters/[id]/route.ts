import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching semester:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/semesters/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from("semesters")
      .update(body)
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating semester:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in PUT /api/semesters/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Delete related data first (if needed, or use CASCADE in database)
    const { error } = await supabase
      .from("semesters")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting semester:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Semester deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/semesters/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
