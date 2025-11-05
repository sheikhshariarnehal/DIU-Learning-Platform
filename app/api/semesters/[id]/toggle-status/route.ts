import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { is_active } = body

    const { data, error } = await supabase
      .from("semesters")
      .update({ is_active })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error toggling semester status:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in toggle-status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
