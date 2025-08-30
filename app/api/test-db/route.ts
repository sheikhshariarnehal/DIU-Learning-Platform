import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Test admin_users table
    const { data: usersTest, error: usersError } = await supabase
      .from("admin_users")
      .select("count")
      .limit(1)

    // Test admin_sessions table
    const { data: sessionsTest, error: sessionsError } = await supabase
      .from("admin_sessions")
      .select("count")
      .limit(1)

    return NextResponse.json({
      success: true,
      tables: {
        admin_users: {
          exists: !usersError,
          error: usersError?.message || null
        },
        admin_sessions: {
          exists: !sessionsError,
          error: sessionsError?.message || null
        }
      }
    })

  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    )
  }
}
